import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.config';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { uploadVendorAsset } from '../../services/mediaService';
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Star,
  CheckCircle,
  LoaderCircle,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  Tag,
  Building,
  ShieldCheck,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import './AccessoriesLayoutMedia.css';

const DEFAULT_SLIDES = [
  { id: 'slide-1', productId: '', productName: '', brand: '', category: '', price: '', imageUrl: '', badge: '🔥 Best Seller', title: '', subtitle: 'Engineered for maximum rider safety and ventilation', redirectUrl: '' },
  { id: 'slide-2', productId: '', productName: '', brand: '', category: '', price: '', imageUrl: '', badge: '⚡ New Arrival', title: '', subtitle: 'All-weather adventure touring gear for extreme terrains', redirectUrl: '' },
  { id: 'slide-3', productId: '', productName: '', brand: '', category: '', price: '', imageUrl: '', badge: '🛡️ ECE 22.06 Certified', title: '', subtitle: 'Track-tested aerodynamic helmets with pinlock visor', redirectUrl: '' },
  { id: 'slide-4', productId: '', productName: '', brand: '', category: '', price: '', imageUrl: '', badge: '🏍️ Riding Essential', title: '', subtitle: 'Premium leather & carbon-knuckle protection gloves', redirectUrl: '' },
  { id: 'slide-5', productId: '', productName: '', brand: '', category: '', price: '', imageUrl: '', badge: '🏷️ Special Offer', title: '', subtitle: 'Equip your ride with waterproof luggage & phone mounts', redirectUrl: '' }
];

const DEFAULT_CATEGORIES = [
  { title: 'Helmets', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Helmet' },
  { title: 'Riding Jackets', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Jacket' },
  { title: 'Gloves', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Gloves' },
  { title: 'Riding Boots', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Boots' },
  { title: 'Phone Mounts & Tech', imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Phone%20Mount' },
  { title: 'Luggage & Bags', imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', redirectUrl: '/products?category=Luggage' }
];

const BADGE_PRESETS = [
  '🔥 Best Seller',
  '⚡ New Arrival',
  '🏷️ Special Offer',
  '⭐ Top Rated',
  '🏍️ Riding Essential',
  '🛡️ ECE 22.06 Certified',
  '✨ Premium Gear',
  '🚚 Free Delivery'
];

const AccessoriesLayoutMedia = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('hero');

  // Hero Carousel Slides State
  const [heroSlides, setHeroSlides] = useState(DEFAULT_SLIDES);

  // Categories Section State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // All products fetched from database (for picker and previews)
  const [allProducts, setAllProducts] = useState([]);

  // Curated featured products
  const [featuredProductIds, setFeaturedProductIds] = useState([]);

  // Brands list
  const [allBrands, setAllBrands] = useState([]);
  const [featuredBrandIds, setFeaturedBrandIds] = useState([]);

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Product Picker Modal State
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerTargetSlideIndex, setPickerTargetSlideIndex] = useState(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');
  const [pickerBrandFilter, setPickerBrandFilter] = useState('all');

  // Show status toasts
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all products in real-time
  useEffect(() => {
    // Check product-collection first
    const productsCol = collection(db, 'product-collection');
    const unsubscribe = onSnapshot(
      productsCol,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (items.length > 0) {
          setAllProducts(items);
        } else {
          // Fallback to 'products' collection if product-collection is empty
          const fallbackCol = collection(db, 'products');
          onSnapshot(fallbackCol, (snap) => {
            const fallbackItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setAllProducts(fallbackItems);
          });
        }
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Fetch all brands in real-time
  useEffect(() => {
    const brandsCol = collection(db, 'brands');
    const unsubscribe = onSnapshot(
      brandsCol,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllBrands(items);
      },
      (error) => {
        console.error('Error loading brands:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Fetch Accessories Layout configuration from Firestore
  useEffect(() => {
    const fetchLayoutConfig = async () => {
      try {
        const layoutRef = doc(db, 'page_layouts', 'accessories_layout');
        let layoutDoc = await getDoc(layoutRef);

        // Fallback to 'accessories' if 'accessories_layout' does not exist yet
        if (!layoutDoc.exists()) {
          const fallbackRef = doc(db, 'page_layouts', 'accessories');
          layoutDoc = await getDoc(fallbackRef);
        }

        if (layoutDoc.exists()) {
          const data = layoutDoc.data();
          if (data.heroSlides && Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
            setHeroSlides(data.heroSlides);
          } else if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
            const converted = data.banners.map((b, idx) => ({
              id: `slide-${idx + 1}`,
              productId: b.productId || '',
              productName: b.title || '',
              brand: b.brand || '',
              category: b.category || '',
              imageUrl: b.imageUrl || '',
              badge: b.badge || 'Best Seller',
              title: b.title || '',
              subtitle: b.subtitle || '',
              price: b.price || '',
              redirectUrl: b.redirectUrl || ''
            }));
            setHeroSlides(converted);
          }

          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }

          if (data.featuredProductIds && Array.isArray(data.featuredProductIds)) {
            setFeaturedProductIds(data.featuredProductIds);
          }

          if (data.featuredBrandIds && Array.isArray(data.featuredBrandIds)) {
            setFeaturedBrandIds(data.featuredBrandIds);
          }
        }
      } catch (error) {
        console.error('Error fetching accessories layout configuration:', error);
        showToast('Failed to load accessories layout configuration.', true);
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutConfig();
  }, []);

  // Scroll to section helper
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to extract product primary image
  const getProductImage = (product) => {
    if (!product) return '';
    return (
      product.media?.primaryImage ||
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.media?.galleryImages) && product.media.galleryImages[0]) ||
      (Array.isArray(product.images) && product.images[0]) ||
      ''
    );
  };

  // Helper to extract product price
  const getProductPrice = (product) => {
    if (!product) return '0';
    return (
      product.pricing?.sellingPrice ||
      product.price ||
      product.pricing?.mrp ||
      '0'
    );
  };

  // ========================================================
  // Hero Slide Handlers
  // ========================================================

  const handleOpenProductPicker = (slideIndex) => {
    setPickerTargetSlideIndex(slideIndex);
    setPickerSearchQuery('');
    setPickerCategoryFilter('all');
    setPickerBrandFilter('all');
    setPickerModalOpen(true);
  };

  const handleSelectProductForSlide = (product) => {
    if (pickerTargetSlideIndex === null) return;

    const prodImage = getProductImage(product);
    const prodPrice = getProductPrice(product);
    const prodName = product.title || product.name || 'Untitled Product';

    setHeroSlides((prev) => {
      const updated = [...prev];
      const target = updated[pickerTargetSlideIndex];
      updated[pickerTargetSlideIndex] = {
        ...target,
        productId: product.id,
        productName: prodName,
        brand: product.brand || 'Nitroxx',
        category: product.category || 'Gear',
        title: target.title || prodName,
        imageUrl: target.imageUrl || prodImage,
        price: prodPrice,
        redirectUrl: target.redirectUrl || `/products/details/${product.id}`
      };
      return updated;
    });

    setPickerModalOpen(false);
    setPickerTargetSlideIndex(null);
    showToast(`Linked "${prodName}" to Slide #${pickerTargetSlideIndex + 1}!`);
  };

  const handleClearSlideProduct = (index) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: '',
        productName: '',
        brand: '',
        category: '',
        title: '',
        price: '',
        redirectUrl: ''
      };
      return updated;
    });
  };

  const handleResetSlideProductImage = (index) => {
    const slide = heroSlides[index];
    if (!slide.productId) return;
    const product = allProducts.find((p) => p.id === slide.productId);
    if (product) {
      const defaultImg = getProductImage(product);
      handleUpdateSlide(index, 'imageUrl', defaultImg);
      showToast('Reset image to product photo');
    }
  };

  const handleUpdateSlide = (index, field, value) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMoveSlide = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === heroSlides.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setHeroSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleAddSlide = () => {
    const newSlideId = `slide-${Date.now()}`;
    setHeroSlides((prev) => [
      ...prev,
      {
        id: newSlideId,
        productId: '',
        productName: '',
        brand: '',
        category: '',
        price: '',
        imageUrl: '',
        badge: 'New Arrival',
        title: '',
        subtitle: 'Premium motorcycling accessories & riding gear',
        redirectUrl: ''
      }
    ]);
  };

  const handleRemoveSlide = (index) => {
    if (heroSlides.length <= 1) {
      showToast('You must have at least one hero slide.', true);
      return;
    }
    setHeroSlides((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Image Upload handler for slide banner or category
  const handleImageUpload = async (index, type, file) => {
    if (!file) return;
    const uploadKey = `${type}-${index}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const result = await uploadVendorAsset({
        file,
        type: `layout-accessories-${type}`,
        productId: 'accessories'
      });

      if (type === 'hero') {
        handleUpdateSlide(index, 'imageUrl', result.downloadUrl);
      } else if (type === 'category') {
        setCategories((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], imageUrl: result.downloadUrl };
          return updated;
        });
      }
      showToast('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image.', true);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ========================================================
  // Category Section Handlers
  // ========================================================

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      { imageUrl: '', title: '', redirectUrl: '/products?category=' }
    ]);
  };

  const handleRemoveCategory = (index) => {
    setCategories((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCategory = (index, key, value) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // ========================================================
  // Featured Products Toggle Handler
  // ========================================================

  const handleToggleFeaturedProduct = (productId) => {
    setFeaturedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length >= 12) {
          showToast('You can select a maximum of 12 featured accessories.', true);
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  // ========================================================
  // Featured Brands Toggle Handler
  // ========================================================

  const handleToggleFeaturedBrand = (brandId) => {
    setFeaturedBrandIds((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
  };

  // ========================================================
  // Save All to Firestore
  // ========================================================

  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      const layoutRef = doc(db, 'page_layouts', 'accessories_layout');

      // Create standardized banners array for backwards compatibility
      const banners = heroSlides.map((slide) => ({
        imageUrl: slide.imageUrl,
        redirectUrl: slide.redirectUrl,
        productId: slide.productId,
        title: slide.title,
        badge: slide.badge,
        brand: slide.brand,
        price: slide.price
      }));

      const layoutData = {
        heroSlides,
        banners,
        categories,
        featuredProductIds,
        featuredBrandIds,
        updatedAt: serverTimestamp()
      };

      await setDoc(layoutRef, layoutData);
      // Also save to 'accessories' for backwards compatibility
      await setDoc(doc(db, 'page_layouts', 'accessories'), layoutData);

      showToast('Accessories page layout saved successfully!');
    } catch (error) {
      console.error('Error saving accessories page layout:', error);
      showToast('Failed to save accessories layout configuration.', true);
    } finally {
      setSaving(false);
    }
  };

  // Extract unique categories & brands for picker filtering
  const availableCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  );
  const availableBrands = Array.from(
    new Set(allProducts.map((p) => p.brand).filter(Boolean))
  );

  // Filtered products in picker modal
  const filteredPickerProducts = allProducts.filter((product) => {
    const titleMatch = (product.title || product.name || '')
      .toLowerCase()
      .includes(pickerSearchQuery.toLowerCase());
    const brandMatch = (product.brand || '')
      .toLowerCase()
      .includes(pickerSearchQuery.toLowerCase());
    const skuMatch = (product.sku || '')
      .toLowerCase()
      .includes(pickerSearchQuery.toLowerCase());

    const categoryMatch =
      pickerCategoryFilter === 'all' ||
      (product.category || '').toLowerCase() === pickerCategoryFilter.toLowerCase();
    const brandFilterMatch =
      pickerBrandFilter === 'all' ||
      (product.brand || '').toLowerCase() === pickerBrandFilter.toLowerCase();

    return (titleMatch || brandMatch || skuMatch) && categoryMatch && brandFilterMatch;
  });

  // Featured products list for display
  const featuredProductsList = allProducts.filter((p) => featuredProductIds.includes(p.id));

  if (loading) {
    return (
      <div
        className="accessories-layout-page"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <LoaderCircle size={40} className="button-loader" style={{ color: '#ff6b00' }} />
        <p style={{ color: '#9ca3af', fontWeight: 600 }}>Loading Accessories Layout Configurations...</p>
      </div>
    );
  }

  return (
    <div className="accessories-layout-page">
      {/* Toast Notifications */}
      {toast && (
        <div className={`events-toast ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <X size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
          <button className="events-toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="accessories-layout-hero">
        <div className="hero-left">
          <div className="hero-icon" style={{ backgroundColor: '#ff6b0015', color: '#ff6b00' }}>
            <Package size={28} />
          </div>
          <div>
            <h1 className="page-title">Accessories Layout Manager</h1>
            <p className="page-subtitle">
              Configure the sliding hero product banner, accessory categories, featured products, and brand shortcuts for the main store on web & app.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="accessories-layout-metrics">
        <div className="accessories-metric-card">
          <span className="metric-label">Hero Slides</span>
          <span className="metric-value">{heroSlides.filter((s) => s.imageUrl).length} / {heroSlides.length}</span>
          <span className="metric-sub">{heroSlides.filter((s) => s.productId).length} Products Linked</span>
        </div>
        <div className="accessories-metric-card">
          <span className="metric-label">Accessory Categories</span>
          <span className="metric-value">{categories.length}</span>
          <span className="metric-sub">Shop by Category</span>
        </div>
        <div className="accessories-metric-card">
          <span className="metric-label">Featured Products</span>
          <span className="metric-value">{featuredProductIds.length} / 12</span>
          <span className="metric-sub">
            {featuredProductIds.length === 12 ? 'Full list' : `${12 - featuredProductIds.length} slots available`}
          </span>
        </div>
        <div className="accessories-metric-card">
          <span className="metric-label">Total Catalog Products</span>
          <span className="metric-value">{allProducts.length}</span>
          <span className="metric-sub">Available to choose</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="accessories-nav-tabs">
        <button
          className={`accessories-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => scrollToSection('hero')}
        >
          <SlidersHorizontal size={16} /> 1. Sliding Hero Products ({heroSlides.length} Slides)
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => scrollToSection('categories')}
        >
          <Tag size={16} /> 2. Shop By Category ({categories.length})
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => scrollToSection('featured')}
        >
          <Star size={16} /> 3. Featured Accessories ({featuredProductIds.length}/12)
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => scrollToSection('brands')}
        >
          <Building size={16} /> 4. Featured Brands ({featuredBrandIds.length})
        </button>
      </div>

      {/* ========================================================
          Section 1: Sliding Hero Products Section
          ======================================================== */}
      <div className="accessories-section-card" id="hero">
        <div className="section-header">
          <div>
            <h2 className="section-title">1. Sliding Hero Section (Product Showcase)</h2>
            <p className="section-description">
              Choose products from your catalog to spotlight on the sliding hero section. Customize badges, titles, subtitles, or upload a custom wide 21:9 banner.
            </p>
          </div>
          <button className="choose-product-btn" onClick={handleAddSlide}>
            <Plus size={16} /> Add Hero Slide
          </button>
        </div>

        <div className="hero-slides-container">
          {heroSlides.map((slide, index) => {
            const isUploading = uploading[`hero-${index}`];
            const linkedProduct = allProducts.find((p) => p.id === slide.productId);

            return (
              <div className="hero-slide-card" key={slide.id || index}>
                {/* Slide Top Bar */}
                <div className="hero-slide-header">
                  <div className="slide-order-badge">
                    <span>Slide #{index + 1}</span>
                    {slide.productId ? (
                      <span className="item-badge published" style={{ fontSize: '0.7rem' }}>
                        Linked: {slide.productName || 'Product'}
                      </span>
                    ) : (
                      <span className="item-badge draft" style={{ fontSize: '0.7rem' }}>
                        No Product Selected
                      </span>
                    )}
                  </div>

                  <div className="slide-actions">
                    <button
                      className="slide-icon-btn"
                      title="Move Slide Up"
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      className="slide-icon-btn"
                      title="Move Slide Down"
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === heroSlides.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      className="slide-icon-btn delete"
                      title="Delete Slide"
                      onClick={() => handleRemoveSlide(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Slide Content Grid */}
                <div className="hero-slide-content-grid">
                  {/* Left Column: Product Selection & Text */}
                  <div className="slide-content-left">
                    <div className="product-selection-box">
                      <div className="product-selection-header">
                        <span>Selected Accessory from Database</span>
                        {slide.productId && (
                          <button
                            type="button"
                            className="reset-poster-btn"
                            onClick={() => handleClearSlideProduct(index)}
                          >
                            Disconnect Product
                          </button>
                        )}
                      </div>

                      {slide.productId ? (
                        <div className="selected-product-display">
                          {slide.imageUrl || (linkedProduct && getProductImage(linkedProduct)) ? (
                            <img
                              src={slide.imageUrl || getProductImage(linkedProduct)}
                              alt={slide.productName}
                              className="selected-product-thumb"
                            />
                          ) : (
                            <div className="selected-product-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={24} color="#64748b" />
                            </div>
                          )}
                          <div className="selected-product-info">
                            <h4 className="selected-product-name">{slide.productName || 'Untitled Product'}</h4>
                            <div className="selected-product-meta">
                              {slide.brand && (
                                <span>
                                  <ShieldCheck size={11} className="event-meta-icon" /> {slide.brand}
                                </span>
                              )}
                              {slide.category && (
                                <span>
                                  <Tag size={11} className="event-meta-icon" /> {slide.category}
                                </span>
                              )}
                              {slide.price && (
                                <span>
                                  <DollarSign size={11} className="event-meta-icon" /> ₹{slide.price}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="change-product-btn"
                            onClick={() => handleOpenProductPicker(index)}
                          >
                            Change Product
                          </button>
                        </div>
                      ) : (
                        <div className="no-product-selected-box">
                          <Package size={32} color="#94a3b8" />
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                            No product connected to this hero slide yet.
                          </p>
                          <button
                            type="button"
                            className="choose-product-btn"
                            onClick={() => handleOpenProductPicker(index)}
                          >
                            <Package size={14} /> Choose Accessory from Database
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Slide Text Details Form */}
                    <div className="slide-form-fields">
                      {/* Badge / Tag */}
                      <div className="form-group-sm">
                        <label>Slide Tag / Badge</label>
                        <input
                          type="text"
                          className="form-input-sm"
                          placeholder="e.g. 🔥 Best Seller"
                          value={slide.badge || ''}
                          onChange={(e) => handleUpdateSlide(index, 'badge', e.target.value)}
                        />
                        <div className="badge-chips-row">
                          {BADGE_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              className={`badge-chip ${slide.badge === preset ? 'selected' : ''}`}
                              onClick={() => handleUpdateSlide(index, 'badge', preset)}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Heading / Title */}
                      <div className="form-group-sm">
                        <label>Slide Heading / Title</label>
                        <input
                          type="text"
                          className="form-input-sm"
                          placeholder="Product Title for Hero Banner"
                          value={slide.title || ''}
                          onChange={(e) => handleUpdateSlide(index, 'title', e.target.value)}
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div className="form-group-sm">
                        <label>Slide Tagline / Subtitle</label>
                        <input
                          type="text"
                          className="form-input-sm"
                          placeholder="Catchy feature highlights..."
                          value={slide.subtitle || ''}
                          onChange={(e) => handleUpdateSlide(index, 'subtitle', e.target.value)}
                        />
                      </div>

                      {/* Redirect Link */}
                      <div className="form-group-sm">
                        <label>Target Redirect Link</label>
                        <div className="link-input-container">
                          <Link2 size={14} className="link-input-icon" />
                          <input
                            type="text"
                            className="link-input"
                            placeholder="/products/details/product-id"
                            value={slide.redirectUrl || ''}
                            onChange={(e) => handleUpdateSlide(index, 'redirectUrl', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hero Slide Preview & Visual Banner */}
                  <div className="hero-visual-card">
                    <label className="image-upload-zone" style={{ cursor: 'default' }}>
                      {isUploading ? (
                        <div className="uploading-loader">
                          <LoaderCircle size={24} className="button-loader" />
                          <span>Uploading custom hero banner...</span>
                        </div>
                      ) : slide.imageUrl ? (
                        <div className="hero-preview-banner">
                          <img src={slide.imageUrl} alt={slide.title} className="hero-preview-img" />
                          <div className="hero-preview-overlay" />
                          <div className="hero-preview-content">
                            {slide.badge && <span className="hero-preview-badge">{slide.badge}</span>}
                            <h3 className="hero-preview-title">{slide.title || slide.productName || 'Slide Heading'}</h3>
                            <div className="hero-preview-meta">
                              {slide.brand && (
                                <span>
                                  <ShieldCheck size={12} /> {slide.brand}
                                </span>
                              )}
                              {slide.category && (
                                <span>
                                  <Tag size={12} /> {slide.category}
                                </span>
                              )}
                              {slide.price && (
                                <span>
                                  <DollarSign size={12} /> ₹{slide.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <ImageIcon size={28} />
                          <span>No Hero Banner</span>
                          <small>Select an accessory or upload a custom 21:9 image</small>
                        </div>
                      )}
                    </label>

                    <div className="banner-upload-controls">
                      <label className="upload-custom-banner-btn">
                        <ImageIcon size={14} /> Upload Custom 21:9 Banner
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, 'hero', e.target.files?.[0])}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                      </label>

                      {slide.productId && (
                        <button
                          type="button"
                          className="reset-poster-btn"
                          onClick={() => handleResetSlideProductImage(index)}
                        >
                          Use Product Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button className="add-hero-slide-btn" onClick={handleAddSlide}>
            <Plus size={18} /> Add Another Hero Slide
          </button>
        </div>
      </div>

      {/* ========================================================
          Section 2: Categories Section
          ======================================================== */}
      <div className="accessories-section-card" id="categories">
        <div className="section-header">
          <div>
            <h2 className="section-title">2. Shop By Category (Category Shortcuts)</h2>
            <p className="section-description">
              Manage accessory category shortcuts shown on the store landing page (e.g. Helmets, Riding Jackets, Gloves, Boots, Luggage).
            </p>
          </div>
          <button className="choose-product-btn" onClick={handleAddCategory}>
            <Plus size={16} /> Add Category Item
          </button>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => {
            const isUploading = uploading[`category-${index}`];
            return (
              <div className="category-slot-card" key={index}>
                <button
                  type="button"
                  className="category-remove-btn"
                  onClick={() => handleRemoveCategory(index)}
                  title="Remove Category"
                >
                  <Trash2 size={15} />
                </button>

                <label className="image-upload-zone category-image-zone">
                  {isUploading ? (
                    <div className="uploading-loader">
                      <LoaderCircle size={24} className="button-loader" />
                      <span>Uploading...</span>
                    </div>
                  ) : category.imageUrl ? (
                    <div className="preview-container">
                      <img src={category.imageUrl} alt={`Category ${index}`} className="preview-image" />
                      <div className="upload-overlay">
                        <span className="upload-overlay-text">
                          <Plus size={14} /> Replace Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={28} />
                      <span>Upload Category Image</span>
                      <small>Click to pick file</small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, 'category', e.target.files?.[0])}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                </label>

                <div className="link-input-wrapper">
                  <label>Category Title</label>
                  <input
                    type="text"
                    className="link-input"
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.6rem 0.75rem',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                    placeholder="e.g. Helmets"
                    value={category.title}
                    onChange={(e) => handleUpdateCategory(index, 'title', e.target.value)}
                  />
                </div>

                <div className="link-input-wrapper">
                  <label>Filter Redirect Link</label>
                  <div className="link-input-container">
                    <Link2 size={14} className="link-input-icon" />
                    <input
                      type="text"
                      className="link-input"
                      placeholder="/products?category=Helmet"
                      value={category.redirectUrl}
                      onChange={(e) => handleUpdateCategory(index, 'redirectUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="add-category-card" onClick={handleAddCategory}>
            <Plus size={28} />
            <span>Add Category Shortcut</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          Section 3: Featured Accessories Grid
          ======================================================== */}
      <div className="accessories-section-card" id="featured">
        <div className="section-header">
          <div>
            <h2 className="section-title">3. Curated Featured Accessories (Max 12 Items)</h2>
            <p className="section-description">
              Select up to 12 top-selling or featured motorcycle gear & accessories to spotlight on the store front.
            </p>
          </div>
          <span className="item-badge published">{featuredProductIds.length} of 12 Filled</span>
        </div>

        {featuredProductsList.length === 0 ? (
          <div className="empty-star-slot" style={{ padding: '3rem' }}>
            <Star size={36} color="#475569" />
            <span>No Featured Accessories Selected</span>
            <p style={{ marginTop: '0.5rem' }}>
              Select items from the quick toggle catalog below to feature them on the accessories page.
            </p>
          </div>
        ) : (
          <div className="products-items-grid">
            {featuredProductsList.map((product) => {
              const prodImg = getProductImage(product);
              const prodPrice = getProductPrice(product);

              return (
                <div className="product-card-item" key={product.id}>
                  <div className="product-thumb-zone">
                    {prodImg ? (
                      <img src={prodImg} alt={product.title} className="product-thumb-img" />
                    ) : (
                      <Package size={36} color="#64748b" />
                    )}
                  </div>
                  <div className="product-details-body">
                    <span className="product-brand-tag">{product.brand || 'Nitroxx'}</span>
                    <h3 className="product-title-text">{product.title || product.name || 'Untitled Product'}</h3>
                  </div>
                  <div className="product-card-footer">
                    <div className="event-meta-line" style={{ fontWeight: 700, color: '#0f172a' }}>
                      <DollarSign size={13} className="event-meta-icon" style={{ color: '#10b981' }} />
                      <span>₹{Number(prodPrice).toLocaleString()}</span>
                    </div>
                    <button
                      className="item-unstar-btn"
                      onClick={() => handleToggleFeaturedProduct(product.id)}
                    >
                      <Star size={13} fill="currentColor" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, 12 - featuredProductsList.length) }).map((_, idx) => (
              <div className="empty-star-slot" key={idx}>
                <Star size={20} />
                <span>Empty Slot</span>
                <p>Add from catalog</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Picker Bar for Featured Products */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
            Quick Toggle from Products Catalog:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {allProducts.map((product) => {
              const isFeatured = featuredProductIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`badge-chip ${isFeatured ? 'selected' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleToggleFeaturedProduct(product.id)}
                >
                  <Star size={12} fill={isFeatured ? '#ffffff' : 'none'} />
                  <span>{product.title || product.name || 'Product'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          Section 4: Shop By Brand Section
          ======================================================== */}
      <div className="accessories-section-card" id="brands">
        <div className="section-header">
          <div>
            <h2 className="section-title">4. Top Accessory Brands</h2>
            <p className="section-description">
              Choose which accessory brands appear in the brand showcase section on the store page.
            </p>
          </div>
          <span className="item-badge published">{featuredBrandIds.length} Brands Selected</span>
        </div>

        {allBrands.length === 0 ? (
          <div className="empty-star-slot" style={{ padding: '3rem' }}>
            <Building size={36} color="#475569" />
            <span>No Brands in Database</span>
          </div>
        ) : (
          <div className="brands-items-grid">
            {allBrands.map((brand) => {
              const isFeatured = featuredBrandIds.includes(brand.id);
              return (
                <div className="brand-card-item" key={brand.id} style={{ borderColor: isFeatured ? '#ff6b00' : '#e2e8f0' }}>
                  <div className="brand-logo-zone">
                    {brand.imageUrl || brand.logoUrl ? (
                      <img src={brand.imageUrl || brand.logoUrl} alt={brand.name} className="brand-logo-img" />
                    ) : (
                      <Building size={32} color="#64748b" />
                    )}
                  </div>
                  <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                      {brand.name}
                    </h4>
                  </div>
                  <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
                    <button
                      type="button"
                      className={`badge-chip ${isFeatured ? 'selected' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => handleToggleFeaturedBrand(brand.id)}
                    >
                      <Star size={12} fill={isFeatured ? '#ffffff' : 'none'} />
                      <span>{isFeatured ? 'Featured on Store' : 'Feature Brand'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          Product Picker Modal
          ======================================================== */}
      {pickerModalOpen && (
        <div className="product-picker-backdrop" onClick={() => setPickerModalOpen(false)}>
          <div className="product-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="product-picker-header">
              <div>
                <h3 className="product-picker-title">
                  Choose Accessory for Slide #{pickerTargetSlideIndex !== null ? pickerTargetSlideIndex + 1 : ''}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Select an item from your catalog to display its title, brand, price, and photo on this sliding hero banner.
                </p>
              </div>
              <button className="product-picker-close" onClick={() => setPickerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="product-picker-search-bar">
              <div className="picker-search-input-wrapper">
                <Search size={16} className="picker-search-icon" />
                <input
                  type="text"
                  className="picker-search-input"
                  placeholder="Search products by title, brand, category, or SKU..."
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {availableCategories.length > 0 && (
                <select
                  value={pickerCategoryFilter}
                  onChange={(e) => setPickerCategoryFilter(e.target.value)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {availableBrands.length > 0 && (
                <select
                  value={pickerBrandFilter}
                  onChange={(e) => setPickerBrandFilter(e.target.value)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="product-picker-grid">
              {filteredPickerProducts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  <Package size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No matching accessories found</p>
                  <small style={{ color: '#94a3b8' }}>Try searching with a different term or clearing filters</small>
                </div>
              ) : (
                filteredPickerProducts.map((product) => {
                  const prodImg = getProductImage(product);
                  const prodPrice = getProductPrice(product);

                  return (
                    <div
                      key={product.id}
                      className="picker-product-card"
                      onClick={() => handleSelectProductForSlide(product)}
                    >
                      <div className="picker-product-thumb">
                        {prodImg ? (
                          <img src={prodImg} alt={product.title} />
                        ) : (
                          <Package size={28} color="#94a3b8" />
                        )}
                      </div>
                      <div className="picker-product-details">
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ff6b00', textTransform: 'uppercase' }}>
                          {product.brand || 'Nitroxx'}
                        </span>
                        <h4 className="picker-product-title">{product.title || product.name || 'Untitled Product'}</h4>
                      </div>
                      <div className="picker-product-footer">
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{Number(prodPrice).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          className="picker-select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProductForSlide(product);
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="accessories-footer-bar">
        <button
          className="export-btn"
          style={{ cursor: 'pointer' }}
          onClick={() => window.location.reload()}
          disabled={saving}
        >
          <RefreshCw size={14} /> Reset Changes
        </button>
        <button
          className="quick-add-btn"
          style={{ cursor: 'pointer', background: '#ff6b00', border: '1px solid #ff6b00' }}
          onClick={handleSaveLayout}
          disabled={saving}
        >
          {saving ? (
            <>
              <LoaderCircle size={15} className="button-loader" /> Saving...
            </>
          ) : (
            <>
              <Save size={15} /> Save Accessories Layout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccessoriesLayoutMedia;
