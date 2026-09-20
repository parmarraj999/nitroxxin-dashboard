import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.config';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { uploadVendorAsset } from '../../services/mediaService';
import {
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Star,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  CheckCircle,
  LoaderCircle,
  X
} from 'lucide-react';
import './ForYouLayoutMedia.css';

const LayoutMedia = () => {
  // Navigation active section scroll helper
  const [activeTab, setActiveTab] = useState('banners');

  // Banners state (exactly 5 slots)
  const [banners, setBanners] = useState([
    { imageUrl: '', redirectUrl: '' },
    { imageUrl: '', redirectUrl: '' },
    { imageUrl: '', redirectUrl: '' },
    { imageUrl: '', redirectUrl: '' },
    { imageUrl: '', redirectUrl: '' }
  ]);

  // Categories sections state (dynamic list)
  const [categories, setCategories] = useState([]);

  // Featured events (read-only list, managed by stars)
  const [featuredEvents, setFeaturedEvents] = useState([]);

  // Featured brands (read-only list, managed by stars)
  const [featuredBrands, setFeaturedBrands] = useState([]);

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Show status toasts
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch layout configuration
  useEffect(() => {
    const fetchLayoutConfig = async () => {
      try {
        const layoutRef = doc(db, 'page_layouts', 'for_you');
        const layoutDoc = await getDoc(layoutRef);

        if (layoutDoc.exists()) {
          const data = layoutDoc.data();
          
          // Ensure we have exactly 5 banner slots
          const fetchedBanners = data.banners || [];
          const paddedBanners = Array.from({ length: 5 }, (_, i) => ({
            imageUrl: fetchedBanners[i]?.imageUrl || '',
            redirectUrl: fetchedBanners[i]?.redirectUrl || ''
          }));
          
          setBanners(paddedBanners);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching layout configuration:', error);
        showToast('Failed to load layout configuration.', true);
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutConfig();
  }, []);

  // Fetch featured events in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('featuredForYou', '==', true)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeaturedEvents(items);
      },
      (error) => {
        console.error('Error loading featured events:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Fetch featured brands in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'brands'),
      where('featuredForYou', '==', true)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeaturedBrands(items);
      },
      (error) => {
        console.error('Error loading featured brands:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Scroll to section helper
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Upload image handler
  const handleImageUpload = async (index, type, file) => {
    if (!file) return;
    const uploadKey = `${type}-${index}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const result = await uploadVendorAsset({
        file,
        type: `layout-${type}`,
        productId: 'for_you'
      });

      if (type === 'banner') {
        setBanners((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], imageUrl: result.downloadUrl };
          return updated;
        });
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

  // Banner input handler
  const handleBannerUrlChange = (index, value) => {
    setBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], redirectUrl: value };
      return updated;
    });
  };

  // Add category block
  const handleAddCategory = () => {
    setCategories((prev) => [...prev, { imageUrl: '', title: '', redirectUrl: '' }]);
  };

  // Remove category block
  const handleRemoveCategory = (index) => {
    setCategories((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update category field
  const handleUpdateCategory = (index, key, value) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // Unstar event handler
  const handleUnstarEvent = async (eventId) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        featuredForYou: false,
        updatedAt: serverTimestamp()
      });
      showToast('Event removed from For You featured section.');
    } catch (error) {
      console.error('Error unstarring event:', error);
      showToast('Failed to update event.', true);
    }
  };

  // Unstar brand handler
  const handleUnstarBrand = async (brandId) => {
    try {
      await updateDoc(doc(db, 'brands', brandId), {
        featuredForYou: false,
        updatedAt: serverTimestamp()
      });
      showToast('Brand removed from For You shop section.');
    } catch (error) {
      console.error('Error unstarring brand:', error);
      showToast('Failed to update brand.', true);
    }
  };

  // Save all layouts to Firestore
  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      const layoutRef = doc(db, 'page_layouts', 'for_you');
      await setDoc(layoutRef, {
        banners,
        categories,
        updatedAt: serverTimestamp()
      });
      showToast('For You page layout saved successfully!');
    } catch (error) {
      console.error('Error saving page layouts:', error);
      showToast('Failed to save layout configuration.', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="layout-media-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <LoaderCircle size={40} className="button-loader" style={{ color: '#ff6b00' }} />
        <p style={{ color: '#9ca3af', fontWeight: 600 }}>Loading Layout Configurations...</p>
      </div>
    );
  }

  return (
    <div className="layout-media-page">
      {/* Toast Notifications */}
      {toast && (
        <div className={`layout-toast ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <X size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
          <button className="layout-toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Hero Header */}
      <div className="layout-media-hero">
        <div className="hero-left">
          <div className="hero-icon" style={{ backgroundColor: '#ff6b0015', color: '#ff6b00' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="page-title">For You Page Layout Manager</h1>
            <p className="page-subtitle">Configure banners, category lists, featured events, and brand shortcuts for the mobile app & web home feed.</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="layout-metrics">
        <div className="layout-metric-card">
          <span className="metric-label">Hero Banners</span>
          <span className="metric-value">{banners.filter(b => b.imageUrl).length} / 5</span>
          <span className="metric-sub">Padded slots</span>
        </div>
        <div className="layout-metric-card">
          <span className="metric-label">Categories Banners</span>
          <span className="metric-value">{categories.length}</span>
          <span className="metric-sub">Dynamic sections</span>
        </div>
        <div className="layout-metric-card">
          <span className="metric-label">Featured Events</span>
          <span className="metric-value">{featuredEvents.length} / 9</span>
          <span className="metric-sub">{featuredEvents.length === 9 ? 'Full list' : `${9 - featuredEvents.length} slots free`}</span>
        </div>
        <div className="layout-metric-card">
          <span className="metric-label">Selected Brands</span>
          <span className="metric-value">{featuredBrands.length}</span>
          <span className="metric-sub">No upper limit</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="layout-nav-tabs">
        <button className={`layout-tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => scrollToSection('banners')}>
          <ImageIcon size={16} /> 1. Banners (5 Slots)
        </button>
        <button className={`layout-tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => scrollToSection('categories')}>
          <Plus size={16} /> 2. Categories Section
        </button>
        <button className={`layout-tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => scrollToSection('events')}>
          <Calendar size={16} /> 3. Featured Events ({featuredEvents.length}/9)
        </button>
        <button className={`layout-tab-btn ${activeTab === 'brands' ? 'active' : ''}`} onClick={() => scrollToSection('brands')}>
          <Building size={16} /> 4. Shop by Brand ({featuredBrands.length})
        </button>
      </div>

      {/* Section 1: Hero Banners */}
      <div className="layout-section-card" id="banners">
        <div className="section-header">
          <div>
            <h2 className="section-title">1. Home Page Hero Banners</h2>
            <p className="section-description">Upload high quality banner images (recommended 21:9 format) and define their target redirect URLs.</p>
          </div>
          <span className="item-badge published">Exactly 5 Banner Slots</span>
        </div>

        <div className="banners-grid">
          {banners.map((banner, index) => {
            const isUploading = uploading[`banner-${index}`];
            return (
              <div className="banner-slot-card" key={index}>
                <div className="banner-slot-header">
                  <span className="banner-slot-title">Hero Banner #{index + 1}</span>
                  {banner.imageUrl && <span className="item-badge published" style={{ fontSize: '0.7rem' }}>Active</span>}
                </div>

                <label className="image-upload-zone category-image-zone">
                  {isUploading ? (
                    <div className="uploading-loader">
                      <LoaderCircle size={24} className="button-loader" />
                      <span>Uploading...</span>
                    </div>
                  ) : banner.imageUrl ? (
                    <div className="preview-container">
                      <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="preview-image" />
                      <div className="upload-overlay">
                        <span className="upload-overlay-text">
                          <Plus size={14} /> Replace Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={28} />
                      <span>Upload Banner Image</span>
                      <small>Click or drag image file</small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, 'banner', e.target.files?.[0])}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                </label>

                <div className="link-input-wrapper">
                  <label>Redirect Link</label>
                  <div className="link-input-container">
                    <Link2 size={14} className="link-input-icon" />
                    <input
                      type="text"
                      className="link-input"
                      placeholder="https://nitroxxin.com/events/event-id"
                      value={banner.redirectUrl}
                      onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Categories Section */}
      <div className="layout-section-card" id="categories">
        <div className="section-header">
          <div>
            <h2 className="section-title">2. Categories Custom Section</h2>
            <p className="section-description">Manage category shortcuts shown on the For You screen. Customize the visual image, title text, and target redirect link.</p>
          </div>
          <button className="quick-add-btn" onClick={handleAddCategory}>
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
                      <span>Upload Section Image</span>
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
                  <label>Display Text / Title</label>
                  <input
                    type="text"
                    className="link-input"
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.6rem 0.75rem', background: '#ffffff', color: '#0f172a' }}
                    placeholder="e.g. Premium Helmets"
                    value={category.title}
                    onChange={(e) => handleUpdateCategory(index, 'title', e.target.value)}
                  />
                </div>

                <div className="link-input-wrapper">
                  <label>Redirect Link</label>
                  <div className="link-input-container">
                    <Link2 size={14} className="link-input-icon" />
                    <input
                      type="text"
                      className="link-input"
                      placeholder="e.g. /products?category=helmets"
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

      {/* Section 3: Featured Events */}
      <div className="layout-section-card" id="events">
        <div className="section-header">
          <div>
            <h2 className="section-title">3. Featured Events (Max 9 Events)</h2>
            <p className="section-description">These events are selected using the star icon in the All Events catalog. Exactly 9 events will be displayed on the For You page.</p>
          </div>
          <span className="item-badge published">{featuredEvents.length} of 9 Filled</span>
        </div>

        {featuredEvents.length === 0 ? (
          <div className="empty-star-slot" style={{ padding: '3rem' }}>
            <Star size={36} color="#475569" />
            <span>No Featured Events Selected</span>
            <p style={{ marginTop: '0.5rem' }}>Navigate to the Event Management panel, click the star icon next to any event to highlight it here.</p>
          </div>
        ) : (
          <div className="layout-items-grid">
            {featuredEvents.map((event) => (
              <div className="layout-item-card" key={event.id}>
                <div className="item-thumb-zone">
                  {event.imageUrl || event.venueImage ? (
                    <img src={event.imageUrl || event.venueImage} alt={event.name} className="item-thumb-img" />
                  ) : (
                    <Calendar size={36} color="#334155" />
                  )}
                </div>
                <div className="item-details">
                  <h3 className="item-title">{event.name || 'Untitled Event'}</h3>
                  <div className="item-meta-line">
                    <MapPin size={12} className="item-meta-icon" />
                    <span>{event.venue || 'No Venue Specified'}</span>
                  </div>
                  <div className="item-meta-line">
                    <Calendar size={12} className="item-meta-icon" />
                    <span>{event.eventDate || 'No Date Set'}</span>
                  </div>
                </div>
                <div className="item-footer">
                  <div className="item-meta-line" style={{ fontWeight: 700, color: '#ffffff' }}>
                    <DollarSign size={13} className="item-meta-icon" style={{ color: '#10b981' }} />
                    <span>₹{event.ticketPrice || 0}</span>
                  </div>
                  <button className="item-unstar-btn" onClick={() => handleUnstarEvent(event.id)}>
                    <Star size={13} fill="currentColor" /> Remove
                  </button>
                </div>
              </div>
            ))}
            
            {Array.from({ length: Math.max(0, 9 - featuredEvents.length) }).map((_, idx) => (
              <div className="empty-star-slot" key={idx}>
                <Star size={20} />
                <span>Empty Event Slot</span>
                <p>Add from Event list page</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Shop By Brand */}
      <div className="layout-section-card" id="brands">
        <div className="section-header">
          <div>
            <h2 className="section-title">4. Shop By Brand (Accessory Brands)</h2>
            <p className="section-description">Choose brand shortcuts to display on the main landing screen by starring them under the accessory brand list.</p>
          </div>
          <span className="item-badge published">{featuredBrands.length} Brands Featured</span>
        </div>

        {featuredBrands.length === 0 ? (
          <div className="empty-star-slot" style={{ padding: '3rem' }}>
            <Star size={36} color="#475569" />
            <span>No Featured Brands Selected</span>
            <p style={{ marginTop: '0.5rem' }}>Navigate to the Accessory Brand list, click the star icon next to a brand to show it on this dashboard.</p>
          </div>
        ) : (
          <div className="layout-items-grid">
            {featuredBrands.map((brand) => (
              <div className="layout-item-card" key={brand.id}>
                <div className="item-thumb-zone" style={{ aspectRatio: '16 / 10' }}>
                  {brand.imageUrl ? (
                    <img src={brand.imageUrl} alt={brand.name} className="item-logo-img" />
                  ) : (
                    <Building size={36} color="#334155" />
                  )}
                </div>
                <div className="item-details" style={{ flexGrow: 0, paddingBottom: '0.75rem' }}>
                  <h3 className="item-title" style={{ textAlign: 'center' }}>{brand.name}</h3>
                </div>
                <div className="item-footer" style={{ borderTop: '1px solid #334155', padding: '0.75rem 1.25rem' }}>
                  <span className={`item-badge ${brand.authorizedStatus === 'authorized' ? 'published' : 'draft'}`} style={{ textTransform: 'capitalize' }}>
                    {brand.authorizedStatus?.replace('_', ' ') || 'Pending'}
                  </span>
                  <button className="item-unstar-btn" onClick={() => handleUnstarBrand(brand.id)}>
                    <Star size={13} fill="currentColor" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Save Bar */}
      <div className="layout-footer-bar">
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
              <Save size={15} /> Save Layout Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LayoutMedia;
