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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Tag,
  Building,
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import ComboOffersPage from './ComboOffersPage';
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

const DEFAULT_COMBO_CATEGORIES = [
  {
    id: 'combo-cat-1',
    name: 'Weekend Rider Starter Packs',
    imageName: 'weekend_rider_combo.png',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    description: 'Essential gear bundles for weekend getaways and beginner riders',
    status: 'active',
    combos: [
      {
        id: 'combo-1-1',
        title: 'Weekend Rider Essential Combo',
        description: 'Complete touring starter kit featuring aerodynamic helmet, all-weather gloves, and phone mount with waterproof protection.',
        imageName: 'weekend_essential_combo.png',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
        badge: '🔥 Best Seller',
        discountPercent: '20',
        customPrice: '',
        status: 'active',
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-2',
    name: 'Track & Racing Bundles',
    imageName: 'track_racing_combo.png',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    description: 'High-performance aerodynamic gear for track days and aggressive sport riding',
    status: 'active',
    combos: [
      {
        id: 'combo-2-1',
        title: 'Pro Track Day Performance Pack',
        description: 'Track-ready aerodynamic full-face helmet paired with carbon knuckle racing gloves and knee sliders.',
        imageName: 'pro_track_pack.png',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
        badge: '⚡ Track Certified',
        discountPercent: '25',
        customPrice: '',
        status: 'active',
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-3',
    name: 'Touring & Adventure Kits',
    imageName: 'touring_adventure_combo.png',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description: 'Heavy-duty waterproof gear, saddlebags, and navigation mounts for long expeditions',
    status: 'active',
    combos: [
      {
        id: 'combo-3-1',
        title: 'All-Terrain Adventure Touring Combo',
        description: 'Multi-season adventure jacket, waterproof riding boots, and heavy-duty tail bag for cross-country rides.',
        imageName: 'adventure_touring_combo.png',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        badge: '⭐ Explorer Pick',
        discountPercent: '18',
        customPrice: '',
        status: 'active',
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-4',
    name: 'City Commuter Bundles',
    imageName: 'city_commuter_combo.png',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: 'Lightweight, stylish, high-ventilation gear designed for daily city rides',
    status: 'active',
    combos: [
      {
        id: 'combo-4-1',
        title: 'Daily Urban Commuter Kit',
        description: 'Lightweight open/modular helmet, breathable mesh gloves, and vibration-damped quick-mount phone holder.',
        imageName: 'urban_commuter_kit.png',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
        badge: '✨ Daily Essential',
        discountPercent: '15',
        customPrice: '',
        status: 'active',
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-5',
    name: 'Rider Safety & Armor Combos',
    imageName: 'safety_armor_combo.png',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
    description: 'CE Level 2 armor, spine protectors, and reinforced riding boots for maximum safety',
    status: 'active',
    combos: [
      {
        id: 'combo-5-1',
        title: 'Complete CE Level-2 Armor Pack',
        description: 'Full body armor jacket insert, knee guards, and certified high-impact ankle protection boots.',
        imageName: 'ce2_armor_pack.png',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
        badge: '🛡️ Max Protection',
        discountPercent: '22',
        customPrice: '',
        status: 'active',
        productList: []
      }
    ]
  }
];

const BADGE_PRESETS = [
  '🔥 Best Seller',
  '⚡ New Arrival',
  '🏷️ Special Offer',
  '⭐ Top Rated',
  '🏍️ Riding Essential',
  '🛡️ ECE 22.06 Certified',
  '✨ Premium Gear',
  '🚚 Free Delivery',
  '⚡ Track Certified',
  '🛡️ Max Protection',
  '⭐ Explorer Pick',
  '✨ Daily Essential'
];

const AccessoriesLayoutMedia = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('hero');

  // Synchronize activeTab with Layout Subnavbar
  useEffect(() => {
    const handleSetTab = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('set-layout-tab', handleSetTab);
    return () => window.removeEventListener('set-layout-tab', handleSetTab);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('layout-tab-changed', { detail: activeTab }));
  }, [activeTab]);

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

  // Combo Categories State: 5 combo categories each containing combos with title, desc, imageName, thumbnail, banner, products
  const [comboCategories, setComboCategories] = useState(DEFAULT_COMBO_CATEGORIES);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Combo Product Picker Modal State
  const [comboPickerOpen, setComboPickerOpen] = useState(false);
  const [activeComboCategoryIndex, setActiveComboCategoryIndex] = useState(null);
  const [activeComboIndex, setActiveComboIndex] = useState(null);
  const [comboSearchQuery, setComboSearchQuery] = useState('');
  const [comboCategoryFilter, setComboCategoryFilter] = useState('all');
  const [comboBrandFilter, setComboBrandFilter] = useState('all');
  const [comboStatusFilter, setComboStatusFilter] = useState('all');
  const [comboStarredFilter, setComboStarredFilter] = useState('all'); // 'all' | 'starred'
  const [comboSortField, setComboSortField] = useState('name');
  const [comboSortOrder, setComboSortOrder] = useState('asc');
  const [comboCurrentPage, setComboCurrentPage] = useState(1);
  const comboPageSize = 8;

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Product Picker Modal State (Slide Hero)
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerTargetSlideIndex, setPickerTargetSlideIndex] = useState(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');
  const [pickerBrandFilter, setPickerBrandFilter] = useState('all');
  const [pickerCurrentPage, setPickerCurrentPage] = useState(1);
  const pickerPageSize = 8;

  // Featured Accessories Picker Modal State
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState('');
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState('all');
  const [featuredBrandFilter, setFeaturedBrandFilter] = useState('all');
  const [featuredStatusFilter, setFeaturedStatusFilter] = useState('all');
  const [featuredStarredFilter, setFeaturedStarredFilter] = useState('all');
  const [featuredSortField, setFeaturedSortField] = useState('name');
  const [featuredSortOrder, setFeaturedSortOrder] = useState('asc');
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const featuredPageSize = 8;

  // Featured Brands Picker Modal State
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [brandStarredFilter, setBrandStarredFilter] = useState('all');
  const [brandCurrentPage, setBrandCurrentPage] = useState(1);
  const brandPageSize = 8;

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

          if (data.comboCategories && Array.isArray(data.comboCategories) && data.comboCategories.length > 0) {
            setComboCategories(data.comboCategories.map((cat, idx) => ({
              id: cat.id || `combo-cat-${idx + 1}`,
              name: cat.name || cat.title || `Combo Category #${idx + 1}`,
              imageName: cat.imageName || '',
              imageUrl: cat.imageUrl || cat.thumbnailUrl || '',
              description: cat.description || cat.subtitle || '',
              status: cat.status || 'active',
              combos: Array.isArray(cat.combos)
                ? cat.combos.map((c, cIdx) => ({
                    id: c.id || `combo-${Date.now()}-${cIdx}`,
                    title: c.title || `Combo #${cIdx + 1}`,
                    description: c.description || c.subtitle || '',
                    imageName: c.imageName || '',
                    thumbnailUrl: c.thumbnailUrl || c.imageUrl || c.mergedImageUrl || c.mergedProductImage || '',
                    mergedImageUrl: c.mergedImageUrl || c.thumbnailUrl || c.imageUrl || '',
                    bannerUrl: c.bannerUrl || '',
                    badge: c.badge || '🔥 Special Offer',
                    discountPercent: c.discountPercent || '',
                    customPrice: c.customPrice || '',
                    status: c.status || 'active',
                    productList: Array.isArray(c.productList) ? c.productList : []
                  }))
                : []
            })));
          } else if (data.combos && Array.isArray(data.combos) && data.combos.length > 0) {
            // Adapt legacy flat combos into first default category
            setComboCategories((prev) => {
              const updated = [...prev];
              updated[0] = {
                ...updated[0],
                combos: data.combos.map((c, cIdx) => ({
                  id: c.id || `combo-${Date.now()}-${cIdx}`,
                  title: c.title || `Combo #${cIdx + 1}`,
                  description: c.description || c.subtitle || '',
                  imageName: c.imageName || '',
                  thumbnailUrl: c.thumbnailUrl || c.mergedImageUrl || c.mergedProductImage || c.imageUrl || '',
                  mergedImageUrl: c.mergedImageUrl || c.thumbnailUrl || c.imageUrl || '',
                  bannerUrl: c.bannerUrl || '',
                  badge: c.badge || '🔥 Special Offer',
                  discountPercent: c.discountPercent || '20',
                  customPrice: c.customPrice || '',
                  status: c.status || 'active',
                  productList: Array.isArray(c.productList) ? c.productList : []
                }))
              };
              return updated;
            });
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

  // Helper to determine product stock status
  const getProductStockStatus = (product) => {
    if (!product) return { label: 'In Stock', type: 'in-stock' };
    const stock = product.inventory?.quantity ?? product.stock ?? product.quantity;
    if (stock === 0 || product.inStock === false) {
      return { label: 'Out of Stock', type: 'out-of-stock' };
    }
    if (stock !== undefined && stock > 0 && stock <= 5) {
      return { label: 'Low Stock', type: 'low-stock' };
    }
    return { label: 'In Stock', type: 'in-stock' };
  };

  // ========================================================
  // Hero Slide Handlers
  // ========================================================

  const handleOpenProductPicker = (slideIndex) => {
    setPickerTargetSlideIndex(slideIndex);
    setPickerSearchQuery('');
    setPickerCategoryFilter('all');
    setPickerBrandFilter('all');
    setPickerCurrentPage(1);
    setPickerModalOpen(true);
  };

  const handleOpenFeaturedPicker = () => {
    setFeaturedSearchQuery('');
    setFeaturedCategoryFilter('all');
    setFeaturedBrandFilter('all');
    setFeaturedStatusFilter('all');
    setFeaturedStarredFilter('all');
    setFeaturedSortField('name');
    setFeaturedSortOrder('asc');
    setFeaturedCurrentPage(1);
    setFeaturedPickerOpen(true);
  };

  const handleOpenBrandPicker = () => {
    setBrandSearchQuery('');
    setBrandStarredFilter('all');
    setBrandCurrentPage(1);
    setBrandPickerOpen(true);
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
      } else if (type === 'combo-cat-thumbnail') {
        handleUpdateComboCategory(index, 'imageUrl', result.downloadUrl);
      } else if (type === 'combo-thumbnail') {
        const [cIdx, cmbIdx] = String(index).split('_').map(Number);
        handleUpdateComboInCategory(cIdx, cmbIdx, 'thumbnailUrl', result.downloadUrl);
      } else if (type === 'combo-banner') {
        const [cIdx, cmbIdx] = String(index).split('_').map(Number);
        handleUpdateComboInCategory(cIdx, cmbIdx, 'bannerUrl', result.downloadUrl);
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

      // Prepare normalized comboCategories and flattened backwards-compatible combos
      const normalizedComboCategories = comboCategories.map((cat, idx) => ({
        id: cat.id || `combo-cat-${idx + 1}`,
        name: cat.name || cat.title || `Combo Category #${idx + 1}`,
        title: cat.name || cat.title || `Combo Category #${idx + 1}`,
        imageName: cat.imageName || '',
        imageUrl: cat.imageUrl || cat.thumbnailUrl || '',
        thumbnailUrl: cat.imageUrl || cat.thumbnailUrl || '',
        description: cat.description || cat.subtitle || '',
        status: cat.status || 'active',
        combos: (cat.combos || []).map((c, cIdx) => ({
          id: c.id || `combo-${Date.now()}-${cIdx}`,
          title: c.title || `Combo #${cIdx + 1}`,
          description: c.description || '',
          imageName: c.imageName || '',
          thumbnailUrl: c.thumbnailUrl || c.imageUrl || c.mergedImageUrl || '',
          imageUrl: c.thumbnailUrl || c.imageUrl || c.mergedImageUrl || '',
          mergedImageUrl: c.thumbnailUrl || c.imageUrl || c.mergedImageUrl || '',
          mergedProductImage: c.thumbnailUrl || c.imageUrl || c.mergedImageUrl || '',
          bannerUrl: c.bannerUrl || '',
          badge: c.badge || '',
          discountPercent: c.discountPercent || '',
          customPrice: c.customPrice || '',
          status: c.status || 'active',
          productList: Array.isArray(c.productList) ? c.productList : []
        }))
      }));

      // Flattened combos for backwards compatibility
      const flattenedCombos = normalizedComboCategories.flatMap((cat) =>
        cat.combos.map((c) => ({
          ...c,
          categoryId: cat.id,
          categoryName: cat.name
        }))
      );

      const layoutData = {
        heroSlides,
        banners,
        categories,
        featuredProductIds,
        featuredBrandIds,
        comboCategories: normalizedComboCategories,
        combos: flattenedCombos,
        updatedAt: serverTimestamp()
      };

      await setDoc(layoutRef, layoutData);

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

  const pickerTotalPages = Math.max(1, Math.ceil(filteredPickerProducts.length / pickerPageSize));
  const pickerStartIndex = (pickerCurrentPage - 1) * pickerPageSize;
  const paginatedPickerProducts = filteredPickerProducts.slice(
    pickerStartIndex,
    pickerStartIndex + pickerPageSize
  );

  // Featured products list for display
  const featuredProductsList = allProducts.filter((p) => featuredProductIds.includes(p.id));

  // Featured brands list for display
  const featuredBrandsList = allBrands.filter((b) => featuredBrandIds.includes(b.id));

  // Filtered and sorted products for Featured Picker Modal
  const filteredFeaturedProducts = allProducts
    .filter((product) => {
      const titleMatch = (product.title || product.name || '')
        .toLowerCase()
        .includes(featuredSearchQuery.toLowerCase());
      const brandMatch = (product.brand || '')
        .toLowerCase()
        .includes(featuredSearchQuery.toLowerCase());
      const skuMatch = (product.sku || '')
        .toLowerCase()
        .includes(featuredSearchQuery.toLowerCase());
      const categoryMatch =
        featuredCategoryFilter === 'all' ||
        (product.category || '').toLowerCase() === featuredCategoryFilter.toLowerCase();
      const brandFilterMatch =
        featuredBrandFilter === 'all' ||
        (product.brand || '').toLowerCase() === featuredBrandFilter.toLowerCase();

      // Status filter
      const stockStatus = getProductStockStatus(product);
      let statusMatch = true;
      if (featuredStatusFilter === 'in-stock') {
        statusMatch = stockStatus.type === 'in-stock';
      } else if (featuredStatusFilter === 'low-stock') {
        statusMatch = stockStatus.type === 'low-stock';
      } else if (featuredStatusFilter === 'out-of-stock') {
        statusMatch = stockStatus.type === 'out-of-stock';
      }

      // Starred filter
      const isStarred = featuredProductIds.includes(product.id);
      let starredMatch = true;
      if (featuredStarredFilter === 'starred') {
        starredMatch = isStarred;
      }

      return (
        (titleMatch || brandMatch || skuMatch) &&
        categoryMatch &&
        brandFilterMatch &&
        statusMatch &&
        starredMatch
      );
    })
    .sort((a, b) => {
      let valA, valB;
      if (featuredSortField === 'name') {
        valA = (a.title || a.name || '').toLowerCase();
        valB = (b.title || b.name || '').toLowerCase();
        return featuredSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (featuredSortField === 'category') {
        valA = (a.category || '').toLowerCase();
        valB = (b.category || '').toLowerCase();
        return featuredSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (featuredSortField === 'price') {
        valA = Number(getProductPrice(a)) || 0;
        valB = Number(getProductPrice(b)) || 0;
        return featuredSortOrder === 'asc' ? valA - valB : valB - valA;
      } else if (featuredSortField === 'brand') {
        valA = (a.brand || '').toLowerCase();
        valB = (b.brand || '').toLowerCase();
        return featuredSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });

  const featuredTotalPages = Math.max(1, Math.ceil(filteredFeaturedProducts.length / featuredPageSize));
  const featuredStartIndex = (featuredCurrentPage - 1) * featuredPageSize;
  const paginatedFeaturedProducts = filteredFeaturedProducts.slice(
    featuredStartIndex,
    featuredStartIndex + featuredPageSize
  );

  const handleSortToggleFeatured = (field) => {
    if (featuredSortField === field) {
      setFeaturedSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setFeaturedSortField(field);
      setFeaturedSortOrder('asc');
    }
  };

  // Filtered brands for Brand Picker Modal
  const filteredBrandItems = allBrands.filter((brand) => {
    const nameMatch = (brand.name || '').toLowerCase().includes(brandSearchQuery.toLowerCase());
    const isStarred = featuredBrandIds.includes(brand.id);
    let starredMatch = true;
    if (brandStarredFilter === 'starred') {
      starredMatch = isStarred;
    }
    return nameMatch && starredMatch;
  });

  const brandTotalPages = Math.max(1, Math.ceil(filteredBrandItems.length / brandPageSize));
  const brandStartIndex = (brandCurrentPage - 1) * brandPageSize;
  const paginatedBrandItems = filteredBrandItems.slice(
    brandStartIndex,
    brandStartIndex + brandPageSize
  );

  // Helper to resolve product from combo item (whether stored as string ID or full object)
  const resolveProduct = (item) => {
    if (!item) return null;
    const itemId = typeof item === 'string' ? item : (item.id || item.productId);
    const matched = allProducts.find((p) => p.id === itemId);
    if (matched) {
      return {
        id: matched.id,
        productId: matched.id,
        title: matched.title || matched.name || (typeof item === 'object' ? item.title : 'Product'),
        brand: matched.brand || (typeof item === 'object' ? item.brand : 'Nitroxx'),
        category: matched.category || (typeof item === 'object' ? item.category : 'Accessories'),
        price: getProductPrice(matched) || (typeof item === 'object' ? item.price : '0'),
        imageUrl: getProductImage(matched) || (typeof item === 'object' ? item.imageUrl : ''),
        sku: matched.sku || (typeof item === 'object' ? item.sku : '')
      };
    }
    return typeof item === 'object' ? item : { id: item, title: item };
  };

  // ========================================================
  // Combo Category & Combo Section Handlers
  // ========================================================

  const handleAddComboCategory = () => {
    const newCat = {
      id: `combo-cat-${Date.now()}`,
      name: `Combo Category #${comboCategories.length + 1}`,
      imageName: '',
      imageUrl: '',
      description: '',
      status: 'active',
      combos: []
    };
    setComboCategories((prev) => [...prev, newCat]);
    setSelectedCategoryIndex(comboCategories.length);
    showToast('New Combo Category created!');
  };

  const handleRemoveComboCategory = (catIndex) => {
    if (comboCategories.length <= 1) {
      showToast('You must have at least one combo category.', true);
      return;
    }
    const catName = comboCategories[catIndex]?.name || 'Category';
    if (window.confirm(`Delete combo category "${catName}" and all its combos?`)) {
      setComboCategories((prev) => prev.filter((_, idx) => idx !== catIndex));
      setSelectedCategoryIndex((prev) => Math.max(0, Math.min(prev, comboCategories.length - 2)));
      showToast(`Combo category "${catName}" removed.`);
    }
  };

  const handleUpdateComboCategory = (catIndex, field, value) => {
    setComboCategories((prev) => {
      const updated = [...prev];
      updated[catIndex] = { ...updated[catIndex], [field]: value };
      return updated;
    });
  };

  const handleMoveComboCategory = (catIndex, direction) => {
    if (direction === 'up' && catIndex === 0) return;
    if (direction === 'down' && catIndex === comboCategories.length - 1) return;

    const targetIndex = direction === 'up' ? catIndex - 1 : catIndex + 1;
    setComboCategories((prev) => {
      const updated = [...prev];
      const temp = updated[catIndex];
      updated[catIndex] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
    setSelectedCategoryIndex(targetIndex);
  };

  const handleAddComboToCategory = (catIndex) => {
    const targetCat = comboCategories[catIndex];
    const combosCount = targetCat?.combos?.length || 0;
    const newCombo = {
      id: `combo-${Date.now()}-${combosCount + 1}`,
      title: `Combo Package #${combosCount + 1}`,
      description: '',
      imageName: '',
      thumbnailUrl: '',
      bannerUrl: '',
      badge: '🔥 Special Offer',
      discountPercent: '20',
      customPrice: '',
      status: 'active',
      productList: []
    };

    setComboCategories((prev) => {
      const updated = [...prev];
      const cat = { ...updated[catIndex] };
      cat.combos = [...(cat.combos || []), newCombo];
      updated[catIndex] = cat;
      return updated;
    });
    showToast(`Added new combo to "${targetCat?.name || 'Category'}"!`);
  };

  const handleRemoveComboFromCategory = (catIndex, comboIndex) => {
    setComboCategories((prev) => {
      const updated = [...prev];
      const cat = { ...updated[catIndex] };
      cat.combos = (cat.combos || []).filter((_, idx) => idx !== comboIndex);
      updated[catIndex] = cat;
      return updated;
    });
    showToast('Combo removed from category.');
  };

  const handleUpdateComboInCategory = (catIndex, comboIndex, field, value) => {
    setComboCategories((prev) => {
      const updated = [...prev];
      const cat = { ...updated[catIndex] };
      const combos = [...(cat.combos || [])];
      combos[comboIndex] = { ...combos[comboIndex], [field]: value };
      cat.combos = combos;
      updated[catIndex] = cat;
      return updated;
    });
  };

  const handleMoveComboInCategory = (catIndex, comboIndex, direction) => {
    const cat = comboCategories[catIndex];
    const combos = cat?.combos || [];
    if (direction === 'up' && comboIndex === 0) return;
    if (direction === 'down' && comboIndex === combos.length - 1) return;

    const targetIndex = direction === 'up' ? comboIndex - 1 : comboIndex + 1;
    setComboCategories((prev) => {
      const updated = [...prev];
      const catCopy = { ...updated[catIndex] };
      const combosCopy = [...(catCopy.combos || [])];
      const temp = combosCopy[comboIndex];
      combosCopy[comboIndex] = combosCopy[targetIndex];
      combosCopy[targetIndex] = temp;
      catCopy.combos = combosCopy;
      updated[catIndex] = catCopy;
      return updated;
    });
  };

  const handleOpenComboPicker = (catIndex, comboIndex) => {
    setActiveComboCategoryIndex(catIndex);
    setActiveComboIndex(comboIndex);
    setComboSearchQuery('');
    setComboCategoryFilter('all');
    setComboBrandFilter('all');
    setComboStatusFilter('all');
    setComboStarredFilter('all');
    setComboSortField('name');
    setComboSortOrder('asc');
    setComboCurrentPage(1);
    setComboPickerOpen(true);
  };

  const isProductStarredInActiveCombo = (productId) => {
    if (activeComboCategoryIndex === null || activeComboIndex === null) return false;
    const cat = comboCategories[activeComboCategoryIndex];
    const targetCombo = cat?.combos?.[activeComboIndex];
    if (!targetCombo) return false;
    const list = targetCombo.productList || [];
    return list.some((p) =>
      typeof p === 'string' ? p === productId : (p.id === productId || p.productId === productId)
    );
  };

  const handleToggleStarProductForCombo = (product) => {
    if (activeComboCategoryIndex === null || activeComboIndex === null) return;

    setComboCategories((prev) => {
      const updated = [...prev];
      const targetCat = { ...updated[activeComboCategoryIndex] };
      const targetCombos = [...(targetCat.combos || [])];
      const targetCombo = { ...targetCombos[activeComboIndex] };
      const currentList = Array.isArray(targetCombo.productList) ? [...targetCombo.productList] : [];

      const existingIndex = currentList.findIndex((p) =>
        typeof p === 'string' ? p === product.id : (p.id === product.id || p.productId === product.id)
      );

      if (existingIndex >= 0) {
        currentList.splice(existingIndex, 1);
        showToast(`Unstarred "${product.title || product.name || 'Product'}"`);
      } else {
        const productItem = {
          id: product.id,
          productId: product.id,
          title: product.title || product.name || 'Untitled Product',
          brand: product.brand || 'Nitroxx',
          category: product.category || 'Accessories',
          price: getProductPrice(product),
          imageUrl: getProductImage(product),
          sku: product.sku || ''
        };
        currentList.push(productItem);
        showToast(`Starred "${product.title || product.name || 'Product'}" & added to combo!`);
      }

      targetCombo.productList = currentList;
      targetCombos[activeComboIndex] = targetCombo;
      targetCat.combos = targetCombos;
      updated[activeComboCategoryIndex] = targetCat;
      return updated;
    });
  };

  const handleRemoveProductFromCombo = (catIndex, comboIndex, productId) => {
    setComboCategories((prev) => {
      const updated = [...prev];
      const targetCat = { ...updated[catIndex] };
      const targetCombos = [...(targetCat.combos || [])];
      const targetCombo = { ...targetCombos[comboIndex] };
      const currentList = Array.isArray(targetCombo.productList) ? [...targetCombo.productList] : [];
      targetCombo.productList = currentList.filter((p) =>
        typeof p === 'string' ? p !== productId : (p.id !== productId && p.productId !== productId)
      );
      targetCombos[comboIndex] = targetCombo;
      targetCat.combos = targetCombos;
      updated[catIndex] = targetCat;
      return updated;
    });
    showToast('Product removed from combo.');
  };

  // Filtered and sorted products for Combo Picker Modal
  const filteredComboProducts = allProducts
    .filter((product) => {
      const titleMatch = (product.title || product.name || '')
        .toLowerCase()
        .includes(comboSearchQuery.toLowerCase());
      const brandMatch = (product.brand || '')
        .toLowerCase()
        .includes(comboSearchQuery.toLowerCase());
      const skuMatch = (product.sku || '')
        .toLowerCase()
        .includes(comboSearchQuery.toLowerCase());
      const categoryMatch =
        comboCategoryFilter === 'all' ||
        (product.category || '').toLowerCase() === comboCategoryFilter.toLowerCase();
      const brandFilterMatch =
        comboBrandFilter === 'all' ||
        (product.brand || '').toLowerCase() === comboBrandFilter.toLowerCase();

      // Status filter
      const stockStatus = getProductStockStatus(product);
      let statusMatch = true;
      if (comboStatusFilter === 'in-stock') {
        statusMatch = stockStatus.type === 'in-stock';
      } else if (comboStatusFilter === 'low-stock') {
        statusMatch = stockStatus.type === 'low-stock';
      } else if (comboStatusFilter === 'out-of-stock') {
        statusMatch = stockStatus.type === 'out-of-stock';
      }

      // Starred filter
      const isStarred = isProductStarredInActiveCombo(product.id);
      let starredMatch = true;
      if (comboStarredFilter === 'starred') {
        starredMatch = isStarred;
      }

      return (
        (titleMatch || brandMatch || skuMatch) &&
        categoryMatch &&
        brandFilterMatch &&
        statusMatch &&
        starredMatch
      );
    })
    .sort((a, b) => {
      let valA, valB;
      if (comboSortField === 'name') {
        valA = (a.title || a.name || '').toLowerCase();
        valB = (b.title || b.name || '').toLowerCase();
        return comboSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (comboSortField === 'category') {
        valA = (a.category || '').toLowerCase();
        valB = (b.category || '').toLowerCase();
        return comboSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (comboSortField === 'price') {
        valA = Number(getProductPrice(a)) || 0;
        valB = Number(getProductPrice(b)) || 0;
        return comboSortOrder === 'asc' ? valA - valB : valB - valA;
      } else if (comboSortField === 'brand') {
        valA = (a.brand || '').toLowerCase();
        valB = (b.brand || '').toLowerCase();
        return comboSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });

  const comboTotalPages = Math.max(1, Math.ceil(filteredComboProducts.length / comboPageSize));
  const comboStartIndex = (comboCurrentPage - 1) * comboPageSize;
  const comboPaginatedProducts = filteredComboProducts.slice(
    comboStartIndex,
    comboStartIndex + comboPageSize
  );

  const handleSortToggle = (field) => {
    if (comboSortField === field) {
      setComboSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setComboSortField(field);
      setComboSortOrder('asc');
    }
  };

  const getPaginationPages = (currentPage, totalPages) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
    return pages;
  };

  const activeCombo =
    activeComboCategoryIndex !== null && activeComboIndex !== null
      ? comboCategories[activeComboCategoryIndex]?.combos?.[activeComboIndex]
      : null;
  const activeComboCategory =
    activeComboCategoryIndex !== null ? comboCategories[activeComboCategoryIndex] : null;
  const activeComboStarredCount = activeCombo?.productList?.length || 0;

  const totalCombosCount = comboCategories.reduce(
    (sum, cat) => sum + (cat.combos?.length || 0),
    0
  );
  const totalComboStarredProductsCount = comboCategories.reduce(
    (sum, cat) =>
      sum +
      (cat.combos || []).reduce((cSum, c) => cSum + (c.productList?.length || 0), 0),
    0
  );

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
          <span className="metric-label">Combo Categories</span>
          <span className="metric-value">{comboCategories.length}</span>
          <span className="metric-sub">
            {totalCombosCount} Bundles • {totalComboStarredProductsCount} Products
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
          onClick={() => setActiveTab('hero')}
        >
          <SlidersHorizontal size={16} /> 1. Sliding Hero Products
          <span className="accessories-tab-badge">{heroSlides.length}</span>
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={16} /> 2. Shop By Category
          <span className="accessories-tab-badge">{categories.length}</span>
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          <Star size={16} /> 3. Featured Accessories
          <span className="accessories-tab-badge">{featuredProductIds.length}/12</span>
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveTab('combos')}
        >
          <Sparkles size={16} /> 4. Combo Offers
          <span className="accessories-tab-badge">{comboCategories.length} Cats ({totalCombosCount})</span>
        </button>
        <button
          className={`accessories-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          <Building size={16} /> 5. Featured Brands
          <span className="accessories-tab-badge">{featuredBrandIds.length}</span>
        </button>
      </div>

      {/* ========================================================
          Section 1: Sliding Hero Products Section
          ======================================================== */}
      {activeTab === 'hero' && (
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
      )}

      {/* ========================================================
          Section 2: Categories Section
          ======================================================== */}
      {activeTab === 'categories' && (
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
      )}

      {/* ========================================================
          Section 3: Featured Accessories Grid
          ======================================================== */}
      {activeTab === 'featured' && (
      <div className="accessories-section-card" id="featured">
        <div className="section-header">
          <div>
            <h2 className="section-title">3. Curated Featured Accessories (Max 12 Items)</h2>
            <p className="section-description">
              Select up to 12 top-selling or featured motorcycle gear & accessories to spotlight on the store front.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="item-badge published">{featuredProductIds.length} of 12 Filled</span>
            <button
              type="button"
              className="choose-product-btn"
              style={{ background: '#ff6b00', border: '1px solid #ff6b00' }}
              onClick={handleOpenFeaturedPicker}
            >
              <Star size={15} fill="#ffffff" /> Select / Manage Products
            </button>
          </div>
        </div>

        {featuredProductsList.length === 0 ? (
          <div className="empty-combo-products-box" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '14px' }}>
            <Package size={40} color="#94a3b8" />
            <h4 style={{ margin: '0.5rem 0 0.2rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>
              No Featured Accessories Selected Yet
            </h4>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.85rem' }}>
              Highlight up to 12 standout products to appear in the featured showcase section on the store landing page.
            </p>
            <button
              type="button"
              className="choose-product-btn"
              style={{ background: '#ff6b00', border: '1px solid #ff6b00', padding: '0.6rem 1.25rem' }}
              onClick={handleOpenFeaturedPicker}
            >
              <Plus size={16} /> Select Featured Products
            </button>
          </div>
        ) : (
          <div className="layout-selected-items-wrapper">
            <div className="layout-selected-items-header">
              <span className="layout-selected-items-count">
                Showing <strong>{featuredProductsList.length}</strong> of 12 featured products
              </span>
              {featuredProductIds.length < 12 && (
                <button
                  type="button"
                  className="quick-add-link-btn"
                  onClick={handleOpenFeaturedPicker}
                >
                  <Plus size={14} /> Add More Products ({12 - featuredProductIds.length} remaining)
                </button>
              )}
            </div>

            <div className="layout-simple-table-wrapper">
              <table className="layout-simple-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Brand</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredProductsList.map((product, idx) => {
                    const pImg = getProductImage(product);
                    const pPrice = getProductPrice(product);
                    const stockStatus = getProductStockStatus(product);

                    return (
                      <tr key={product.id}>
                        <td className="simple-td-num">{idx + 1}</td>
                        <td>
                          <div className="combo-product-cell">
                            <div className="combo-avatar">
                              {pImg ? (
                                <img src={pImg} alt={product.title} />
                              ) : (
                                <Package size={20} color="#94a3b8" />
                              )}
                            </div>
                            <div className="combo-product-meta">
                              <span className="combo-product-title">
                                {product.title || product.name || 'Untitled Product'}
                              </span>
                              <span className="combo-product-sku">
                                {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id.slice(0, 10)}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="combo-category-text">{product.category || 'Accessories'}</span>
                        </td>
                        <td>
                          <span className="combo-price-val">₹{Number(pPrice).toLocaleString()}</span>
                        </td>
                        <td>
                          <span className={`combo-status-pill ${stockStatus.type}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td>
                          <div className="combo-brand-val">
                            <Building size={13} color="#64748b" />
                            <span>{product.brand || 'Nitroxx'}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="layout-simple-remove-btn"
                            title="Remove from Featured"
                            onClick={() => handleToggleFeaturedProduct(product.id)}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================
          Section 4: Combo Categories & Promotional Bundles
          ======================================================== */}
      {activeTab === 'combos' && (
        <div className="accessories-section-card combo-clean-embedded-wrapper" id="combos" style={{ padding: '1.25rem' }}>
          <ComboOffersPage
            isEmbedded={true}
            externalComboCategories={comboCategories}
            onExternalUpdate={(updated) => setComboCategories(updated)}
          />
        </div>
      )}

      {/* ========================================================
          Section 5: Shop By Brand Section
          ======================================================== */}
      {activeTab === 'brands' && (
      <div className="accessories-section-card" id="brands">
        <div className="section-header">
          <div>
            <h2 className="section-title">5. Top Accessory Brands</h2>
            <p className="section-description">
              Choose which accessory brands appear in the brand showcase section on the store page.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="item-badge published">{featuredBrandIds.length} Brands Selected</span>
            <button
              type="button"
              className="choose-product-btn"
              style={{ background: '#ff6b00', border: '1px solid #ff6b00' }}
              onClick={handleOpenBrandPicker}
            >
              <Building size={15} /> Select / Manage Brands
            </button>
          </div>
        </div>

        {featuredBrandsList.length === 0 ? (
          <div className="empty-combo-products-box" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '14px' }}>
            <Building size={40} color="#94a3b8" />
            <h4 style={{ margin: '0.5rem 0 0.2rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>
              No Brands Featured Yet
            </h4>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.85rem' }}>
              Choose brand shortcuts to highlight on the store landing page from your database catalog.
            </p>
            <button
              type="button"
              className="choose-product-btn"
              style={{ background: '#ff6b00', border: '1px solid #ff6b00', padding: '0.6rem 1.25rem' }}
              onClick={handleOpenBrandPicker}
            >
              <Plus size={16} /> Select Featured Brands
            </button>
          </div>
        ) : (
          <div className="layout-selected-items-wrapper">
            <div className="layout-selected-items-header">
              <span className="layout-selected-items-count">
                Showing <strong>{featuredBrandsList.length}</strong> featured brands
              </span>
              <button
                type="button"
                className="quick-add-link-btn"
                onClick={handleOpenBrandPicker}
              >
                <Plus size={14} /> Add / Manage Brands
              </button>
            </div>

            <div className="layout-simple-table-wrapper">
              <table className="layout-simple-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Category / Notes</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredBrandsList.map((brand, idx) => (
                    <tr key={brand.id}>
                      <td className="simple-td-num">{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="brand-table-logo">
                            {brand.imageUrl || brand.logoUrl ? (
                              <img src={brand.imageUrl || brand.logoUrl} alt={brand.name} />
                            ) : (
                              <Building size={18} color="#64748b" />
                            )}
                          </div>
                          <div>
                            <span className="brand-table-name">{brand.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`combo-status-pill ${brand.authorizedStatus === 'authorized' ? 'in-stock' : 'low-stock'}`}>
                          {brand.authorizedStatus?.replace('_', ' ') || 'Active Partner'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {brand.category || brand.description || 'Accessory Brand'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="layout-simple-remove-btn"
                          title="Remove Brand"
                          onClick={() => handleToggleFeaturedBrand(brand.id)}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================
          Product Picker Modal (Hero Slide - Table / List Style)
          ======================================================== */}
      {pickerModalOpen && (
        <div className="combo-picker-backdrop" onClick={() => setPickerModalOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-picker-header">
              <div className="combo-picker-title-group">
                <div className="combo-picker-badge-icon">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="combo-picker-title">
                    Choose Product for Slide #{pickerTargetSlideIndex !== null ? pickerTargetSlideIndex + 1 : ''}
                  </h3>
                  <p className="combo-picker-subtitle">
                    Select a product from your catalog to showcase on this sliding hero banner.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="product-picker-close"
                onClick={() => setPickerModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="combo-picker-toolbar">
              <div className="combo-toolbar-search">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title, SKU, brand, category..."
                  value={pickerSearchQuery}
                  onChange={(e) => {
                    setPickerSearchQuery(e.target.value);
                    setPickerCurrentPage(1);
                  }}
                  autoFocus
                />
                {pickerSearchQuery && (
                  <button
                    type="button"
                    className="combo-search-clear"
                    onClick={() => {
                      setPickerSearchQuery('');
                      setPickerCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-toolbar-filters">
                {availableCategories.length > 0 && (
                  <select
                    className="combo-filter-select"
                    value={pickerCategoryFilter}
                    onChange={(e) => {
                      setPickerCategoryFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">Category ⌵</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {availableBrands.length > 0 && (
                  <select
                    className="combo-filter-select"
                    value={pickerBrandFilter}
                    onChange={(e) => {
                      setPickerBrandFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">Brand ⌵</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="combo-table-wrapper">
              <table className="combo-table">
                <thead>
                  <tr>
                    <th>Product name</th>
                    <th>Category / Details</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Brand</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPickerProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="combo-empty-td">
                        <Package size={36} color="#94a3b8" />
                        <h4>No matching products found</h4>
                        <p>Try refining your search terms or clearing selected filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPickerProducts.map((product) => {
                      const pImg = getProductImage(product);
                      const pPrice = getProductPrice(product);
                      const stockStatus = getProductStockStatus(product);

                      return (
                        <tr
                          key={product.id}
                          className="combo-row"
                          onClick={() => handleSelectProductForSlide(product)}
                        >
                          <td className="combo-td-product">
                            <div className="combo-product-cell">
                              <div className="combo-avatar">
                                {pImg ? (
                                  <img src={pImg} alt={product.title} />
                                ) : (
                                  <Package size={20} color="#94a3b8" />
                                )}
                              </div>
                              <div className="combo-product-meta">
                                <span className="combo-product-title">
                                  {product.title || product.name || 'Untitled Product'}
                                </span>
                                <span className="combo-product-sku">
                                  {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id.slice(0, 10)}`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="combo-td-category">
                            <span className="combo-category-text">{product.category || 'Accessories'}</span>
                          </td>
                          <td className="combo-td-price">
                            <span className="combo-price-val">₹{Number(pPrice).toLocaleString()}</span>
                          </td>
                          <td className="combo-td-status">
                            <span className={`combo-status-pill ${stockStatus.type}`}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="combo-td-brand">
                            <div className="combo-brand-val">
                              <Building size={13} color="#64748b" />
                              <span>{product.brand || 'Nitroxx'}</span>
                            </div>
                          </td>
                          <td
                            className="combo-td-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProductForSlide(product);
                            }}
                          >
                            <button
                              type="button"
                              className="combo-star-pill-action"
                              style={{ background: '#ff6b0015', color: '#ff6b00', borderColor: '#fed7aa' }}
                            >
                              <CheckCircle size={13} />
                              <span>Select Slide</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="combo-pagination-bar">
              <div className="combo-pagination-nav">
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={pickerCurrentPage === 1}
                  onClick={() => setPickerCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={pickerCurrentPage >= pickerTotalPages}
                  onClick={() => setPickerCurrentPage((p) => Math.min(pickerTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>

              <div className="combo-pagination-info">
                Showing {filteredPickerProducts.length === 0 ? 0 : pickerStartIndex + 1} to{' '}
                {Math.min(pickerStartIndex + pickerPageSize, filteredPickerProducts.length)} of{' '}
                {filteredPickerProducts.length} products
              </div>

              <div className="combo-pagination-pages">
                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={pickerCurrentPage === 1}
                  onClick={() => setPickerCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {getPaginationPages(pickerCurrentPage, pickerTotalPages).map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="combo-page-dots">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`combo-page-number-btn ${pickerCurrentPage === p ? 'active' : ''}`}
                      onClick={() => setPickerCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={pickerCurrentPage >= pickerTotalPages}
                  onClick={() => setPickerCurrentPage((p) => Math.min(pickerTotalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="combo-picker-footer">
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Click on any product row or "Select Slide" to link it.
              </span>
              <button
                type="button"
                className="export-btn"
                onClick={() => setPickerModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          Featured Accessories Picker Modal (Matching Combo Popup)
          ======================================================== */}
      {featuredPickerOpen && (
        <div className="combo-picker-backdrop" onClick={() => setFeaturedPickerOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="combo-picker-header">
              <div className="combo-picker-title-group">
                <div className="combo-picker-badge-icon">
                  <Star size={20} />
                </div>
                <div>
                  <h3 className="combo-picker-title">
                    Select Featured Accessories (Max 12)
                  </h3>
                  <p className="combo-picker-subtitle">
                    Search and star products from your catalog to spotlight on the store front.
                  </p>
                </div>
              </div>

              <div className="combo-picker-header-actions">
                <span className="combo-starred-counter">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <strong>{featuredProductIds.length} / 12</strong> Featured
                </span>
                <button
                  type="button"
                  className="product-picker-close"
                  onClick={() => setFeaturedPickerOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="combo-picker-toolbar">
              <div className="combo-toolbar-search">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title, SKU, brand, category..."
                  value={featuredSearchQuery}
                  onChange={(e) => {
                    setFeaturedSearchQuery(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                  autoFocus
                />
                {featuredSearchQuery && (
                  <button
                    type="button"
                    className="combo-search-clear"
                    onClick={() => {
                      setFeaturedSearchQuery('');
                      setFeaturedCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-toolbar-filters">
                {/* Category Filter */}
                <select
                  className="combo-filter-select"
                  value={featuredCategoryFilter}
                  onChange={(e) => {
                    setFeaturedCategoryFilter(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <option value="all">Category ⌵</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Brand Filter */}
                <select
                  className="combo-filter-select"
                  value={featuredBrandFilter}
                  onChange={(e) => {
                    setFeaturedBrandFilter(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <option value="all">Brand ⌵</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {/* Stock Status Filter */}
                <select
                  className="combo-filter-select"
                  value={featuredStatusFilter}
                  onChange={(e) => {
                    setFeaturedStatusFilter(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <option value="all">Status ⌵</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>

                {/* Starred View Toggle */}
                <button
                  type="button"
                  className={`combo-filter-pill-btn ${featuredStarredFilter === 'starred' ? 'active' : ''}`}
                  onClick={() => {
                    setFeaturedStarredFilter((prev) => (prev === 'starred' ? 'all' : 'starred'));
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <Star size={13} fill={featuredStarredFilter === 'starred' ? '#f59e0b' : 'none'} color={featuredStarredFilter === 'starred' ? '#f59e0b' : '#64748b'} />
                  <span>Featured Only ({featuredProductIds.length})</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="combo-table-wrapper">
              <table className="combo-table">
                <thead>
                  <tr>
                    <th style={{ width: '68px', textAlign: 'center' }}>
                      <span title="Star / Checkbox">★</span>
                    </th>
                    <th onClick={() => handleSortToggleFeatured('name')} className="sortable-th">
                      <div className="th-content">
                        <span>Product name</span>
                        <ArrowUpDown size={13} className="sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSortToggleFeatured('category')} className="sortable-th">
                      <div className="th-content">
                        <span>Category / Details</span>
                        <ArrowUpDown size={13} className="sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSortToggleFeatured('price')} className="sortable-th">
                      <div className="th-content">
                        <span>Price</span>
                        <ArrowUpDown size={13} className="sort-icon" />
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <span>Stock Status</span>
                      </div>
                    </th>
                    <th onClick={() => handleSortToggleFeatured('brand')} className="sortable-th">
                      <div className="th-content">
                        <span>Brand</span>
                        <ArrowUpDown size={13} className="sort-icon" />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '130px' }}>
                      <span>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFeaturedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="combo-empty-td">
                        <Package size={36} color="#94a3b8" />
                        <h4>No matching products found</h4>
                        <p>Try refining your search terms or clearing selected filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedFeaturedProducts.map((product) => {
                      const isStarred = featuredProductIds.includes(product.id);
                      const pImg = getProductImage(product);
                      const pPrice = getProductPrice(product);
                      const stockStatus = getProductStockStatus(product);

                      return (
                        <tr
                          key={product.id}
                          className={`combo-row ${isStarred ? 'starred' : ''}`}
                          onClick={() => handleToggleFeaturedProduct(product.id)}
                        >
                          {/* Checkbox & Star Button */}
                          <td
                            className="combo-td-star"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeaturedProduct(product.id);
                            }}
                          >
                            <div className="star-cell-wrapper">
                              <span className={`combo-checkbox ${isStarred ? 'checked' : ''}`}>
                                {isStarred && <Check size={12} strokeWidth={3} />}
                              </span>
                            </div>
                          </td>

                          {/* Product Avatar + Title + SKU */}
                          <td className="combo-td-product">
                            <div className="combo-product-cell">
                              <div className="combo-avatar">
                                {pImg ? (
                                  <img src={pImg} alt={product.title} />
                                ) : (
                                  <Package size={20} color="#94a3b8" />
                                )}
                              </div>
                              <div className="combo-product-meta">
                                <span className="combo-product-title">
                                  {product.title || product.name || 'Untitled Product'}
                                </span>
                                <span className="combo-product-sku">
                                  {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id.slice(0, 10)}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category / Details */}
                          <td className="combo-td-category">
                            <span className="combo-category-text">
                              {product.category || 'Motorcycle Gear'}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="combo-td-price">
                            <span className="combo-price-val">₹{Number(pPrice).toLocaleString()}</span>
                          </td>

                          {/* Status Badge */}
                          <td className="combo-td-status">
                            <span className={`combo-status-pill ${stockStatus.type}`}>
                              {stockStatus.label}
                            </span>
                          </td>

                          {/* Brand */}
                          <td className="combo-td-brand">
                            <div className="combo-brand-val">
                              <Building size={13} color="#64748b" />
                              <span>{product.brand || 'Nitroxx'}</span>
                            </div>
                          </td>

                          {/* Action Star Pill */}
                          <td
                            className="combo-td-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeaturedProduct(product.id);
                            }}
                          >
                            <button
                              type="button"
                              className={`combo-star-pill-action ${isStarred ? 'starred' : 'unstarred'}`}
                            >
                              <Star
                                size={12}
                                fill={isStarred ? '#f59e0b' : 'none'}
                                color={isStarred ? '#f59e0b' : '#64748b'}
                              />
                              <span>{isStarred ? 'Featured' : 'Star to Add'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Bar */}
            <div className="combo-pagination-bar">
              <div className="combo-pagination-nav">
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={featuredCurrentPage === 1}
                  onClick={() => setFeaturedCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={featuredCurrentPage >= featuredTotalPages}
                  onClick={() => setFeaturedCurrentPage((p) => Math.min(featuredTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>

              <div className="combo-pagination-info">
                Showing {filteredFeaturedProducts.length === 0 ? 0 : featuredStartIndex + 1} to{' '}
                {Math.min(featuredStartIndex + featuredPageSize, filteredFeaturedProducts.length)} of{' '}
                {filteredFeaturedProducts.length} products
              </div>

              <div className="combo-pagination-pages">
                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={featuredCurrentPage === 1}
                  onClick={() => setFeaturedCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {getPaginationPages(featuredCurrentPage, featuredTotalPages).map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="combo-page-dots">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`combo-page-number-btn ${featuredCurrentPage === p ? 'active' : ''}`}
                      onClick={() => setFeaturedCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={featuredCurrentPage >= featuredTotalPages}
                  onClick={() => setFeaturedCurrentPage((p) => Math.min(featuredTotalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Modal Bottom Confirm Bar */}
            <div className="combo-picker-footer">
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {featuredProductIds.length} of 12 accessories selected for featured showcase
              </span>
              <button
                type="button"
                className="quick-add-btn"
                style={{ background: '#ff6b00', border: '1px solid #ff6b00' }}
                onClick={() => setFeaturedPickerOpen(false)}
              >
                <CheckCircle size={15} /> Done / Keep Selection
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================
          Featured Brands Picker Modal (Matching Combo Popup)
          ======================================================== */}
      {brandPickerOpen && (
        <div className="combo-picker-backdrop" onClick={() => setBrandPickerOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="combo-picker-header">
              <div className="combo-picker-title-group">
                <div className="combo-picker-badge-icon">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="combo-picker-title">Select Featured Brands</h3>
                  <p className="combo-picker-subtitle">
                    Search and star brands from your catalog to feature on the store landing page.
                  </p>
                </div>
              </div>

              <div className="combo-picker-header-actions">
                <span className="combo-starred-counter">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <strong>{featuredBrandIds.length}</strong> Featured
                </span>
                <button
                  type="button"
                  className="product-picker-close"
                  onClick={() => setBrandPickerOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="combo-picker-toolbar">
              <div className="combo-toolbar-search">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  placeholder="Search brands by name..."
                  value={brandSearchQuery}
                  onChange={(e) => {
                    setBrandSearchQuery(e.target.value);
                    setBrandCurrentPage(1);
                  }}
                  autoFocus
                />
                {brandSearchQuery && (
                  <button
                    type="button"
                    className="combo-search-clear"
                    onClick={() => {
                      setBrandSearchQuery('');
                      setBrandCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-toolbar-filters">
                <button
                  type="button"
                  className={`combo-filter-pill-btn ${brandStarredFilter === 'starred' ? 'active' : ''}`}
                  onClick={() => {
                    setBrandStarredFilter((prev) => (prev === 'starred' ? 'all' : 'starred'));
                    setBrandCurrentPage(1);
                  }}
                >
                  <Star size={13} fill={brandStarredFilter === 'starred' ? '#f59e0b' : 'none'} color={brandStarredFilter === 'starred' ? '#f59e0b' : '#64748b'} />
                  <span>Featured Only ({featuredBrandIds.length})</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="combo-table-wrapper">
              <table className="combo-table">
                <thead>
                  <tr>
                    <th style={{ width: '68px', textAlign: 'center' }}>
                      <span title="Star / Checkbox">★</span>
                    </th>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Category / Notes</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>
                      <span>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrandItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="combo-empty-td">
                        <Building size={36} color="#94a3b8" />
                        <h4>No matching brands found</h4>
                        <p>Try refining your search terms or clearing selected filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBrandItems.map((brand) => {
                      const isStarred = featuredBrandIds.includes(brand.id);

                      return (
                        <tr
                          key={brand.id}
                          className={`combo-row ${isStarred ? 'starred' : ''}`}
                          onClick={() => handleToggleFeaturedBrand(brand.id)}
                        >
                          <td
                            className="combo-td-star"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeaturedBrand(brand.id);
                            }}
                          >
                            <div className="star-cell-wrapper">
                              <span className={`combo-checkbox ${isStarred ? 'checked' : ''}`}>
                                {isStarred && <Check size={12} strokeWidth={3} />}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="brand-table-logo">
                                {brand.imageUrl || brand.logoUrl ? (
                                  <img src={brand.imageUrl || brand.logoUrl} alt={brand.name} />
                                ) : (
                                  <Building size={18} color="#64748b" />
                                )}
                              </div>
                              <span className="brand-table-name">{brand.name}</span>
                            </div>
                          </td>

                          <td>
                            <span className={`combo-status-pill ${brand.authorizedStatus === 'authorized' ? 'in-stock' : 'low-stock'}`}>
                              {brand.authorizedStatus?.replace('_', ' ') || 'Active Partner'}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              {brand.category || brand.description || 'Accessory Brand'}
                            </span>
                          </td>

                          <td
                            className="combo-td-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeaturedBrand(brand.id);
                            }}
                          >
                            <button
                              type="button"
                              className={`combo-star-pill-action ${isStarred ? 'starred' : 'unstarred'}`}
                            >
                              <Star
                                size={12}
                                fill={isStarred ? '#f59e0b' : 'none'}
                                color={isStarred ? '#f59e0b' : '#64748b'}
                              />
                              <span>{isStarred ? 'Featured' : 'Star to Add'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="combo-pagination-bar">
              <div className="combo-pagination-nav">
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={brandCurrentPage === 1}
                  onClick={() => setBrandCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="combo-page-btn"
                  disabled={brandCurrentPage >= brandTotalPages}
                  onClick={() => setBrandCurrentPage((p) => Math.min(brandTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>

              <div className="combo-pagination-info">
                Showing {filteredBrandItems.length === 0 ? 0 : brandStartIndex + 1} to{' '}
                {Math.min(brandStartIndex + brandPageSize, filteredBrandItems.length)} of{' '}
                {filteredBrandItems.length} brands
              </div>

              <div className="combo-pagination-pages">
                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={brandCurrentPage === 1}
                  onClick={() => setBrandCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {getPaginationPages(brandCurrentPage, brandTotalPages).map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="combo-page-dots">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`combo-page-number-btn ${brandCurrentPage === p ? 'active' : ''}`}
                      onClick={() => setBrandCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="combo-page-arrow-btn"
                  disabled={brandCurrentPage >= brandTotalPages}
                  onClick={() => setBrandCurrentPage((p) => Math.min(brandTotalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Modal Bottom Confirm Bar */}
            <div className="combo-picker-footer">
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {featuredBrandIds.length} brands currently featured on store page
              </span>
              <button
                type="button"
                className="quick-add-btn"
                style={{ background: '#ff6b00', border: '1px solid #ff6b00' }}
                onClick={() => setBrandPickerOpen(false)}
              >
                <CheckCircle size={15} /> Done / Keep Selection
              </button>
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
