import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase/firebase.config';
import {
  doc,
  getDoc,
  setDoc,
  collection,
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
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import './ForYouLayoutMedia.css';

const LayoutMedia = () => {
  // Active tab state: 'banners' | 'categories' | 'events' | 'brands'
  const [activeTab, setActiveTab] = useState('banners');

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

  // Catalog items fetched from database
  const [allEvents, setAllEvents] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  // Featured items computed reactively from catalog
  const featuredEvents = useMemo(() => {
    return allEvents.filter((e) => e.featuredForYou === true);
  }, [allEvents]);

  const featuredBrands = useMemo(() => {
    return allBrands.filter((b) => b.featuredForYou === true);
  }, [allBrands]);

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Event Picker Modal State
  const [eventPickerOpen, setEventPickerOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [eventStarredFilter, setEventStarredFilter] = useState('all');
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const eventPageSize = 8;

  // Brand Picker Modal State
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

  // Fetch all events in real-time
  useEffect(() => {
    const eventsCol = collection(db, 'events');
    const unsubscribe = onSnapshot(
      eventsCol,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllEvents(items);
      },
      (error) => {
        console.error('Error loading events:', error);
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

  // Toggle event featured status
  const handleToggleFeaturedEvent = async (event) => {
    const isCurrentlyFeatured = event.featuredForYou === true;
    const nextStatus = !isCurrentlyFeatured;

    if (nextStatus && featuredEvents.length >= 9) {
      showToast('You can select a maximum of 9 featured events.', true);
      return;
    }

    try {
      await updateDoc(doc(db, 'events', event.id), {
        featuredForYou: nextStatus,
        updatedAt: serverTimestamp()
      });
      showToast(nextStatus ? 'Event added to For You featured.' : 'Event removed from For You featured.');
    } catch (error) {
      console.error('Error toggling featured event:', error);
      showToast('Failed to update event.', true);
    }
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

  // Toggle brand featured status
  const handleToggleFeaturedBrand = async (brand) => {
    const isCurrentlyFeatured = brand.featuredForYou === true;
    const nextStatus = !isCurrentlyFeatured;

    try {
      await updateDoc(doc(db, 'brands', brand.id), {
        featuredForYou: nextStatus,
        updatedAt: serverTimestamp()
      });
      showToast(nextStatus ? 'Brand added to For You shop section.' : 'Brand removed from For You shop section.');
    } catch (error) {
      console.error('Error toggling featured brand:', error);
      showToast('Failed to update brand.', true);
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

  // Event Categories for filter
  const availableEventCategories = useMemo(() => {
    const cats = new Set();
    allEvents.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [allEvents]);

  // Filtered Events for Picker Modal
  const filteredPickerEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const nameMatch = (event.name || event.title || '')
        .toLowerCase()
        .includes(eventSearchQuery.toLowerCase());
      const venueMatch = (event.venue || event.location || event.city || '')
        .toLowerCase()
        .includes(eventSearchQuery.toLowerCase());
      const categoryMatch =
        eventCategoryFilter === 'all' ||
        (event.category || '').toLowerCase() === eventCategoryFilter.toLowerCase();
      const isStarred = event.featuredForYou === true;
      let starredMatch = true;
      if (eventStarredFilter === 'starred') {
        starredMatch = isStarred;
      }
      return (nameMatch || venueMatch) && categoryMatch && starredMatch;
    });
  }, [allEvents, eventSearchQuery, eventCategoryFilter, eventStarredFilter]);

  const eventTotalPages = Math.max(1, Math.ceil(filteredPickerEvents.length / eventPageSize));
  const eventStartIndex = (eventCurrentPage - 1) * eventPageSize;
  const paginatedPickerEvents = filteredPickerEvents.slice(
    eventStartIndex,
    eventStartIndex + eventPageSize
  );

  // Filtered Brands for Picker Modal
  const filteredPickerBrands = useMemo(() => {
    return allBrands.filter((brand) => {
      const nameMatch = (brand.name || '')
        .toLowerCase()
        .includes(brandSearchQuery.toLowerCase());
      const isStarred = brand.featuredForYou === true;
      let starredMatch = true;
      if (brandStarredFilter === 'starred') {
        starredMatch = isStarred;
      }
      return nameMatch && starredMatch;
    });
  }, [allBrands, brandSearchQuery, brandStarredFilter]);

  const brandTotalPages = Math.max(1, Math.ceil(filteredPickerBrands.length / brandPageSize));
  const brandStartIndex = (brandCurrentPage - 1) * brandPageSize;
  const paginatedPickerBrands = filteredPickerBrands.slice(
    brandStartIndex,
    brandStartIndex + brandPageSize
  );

  // Helper for pagination numbers
  const getPaginationPages = (currentPage, totalPages) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (loading) {
    return (
      <div
        className="layout-media-page"
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
          <button className="layout-toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
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
            <p className="page-subtitle">
              Configure banners, category lists, featured events, and brand shortcuts for the mobile app & web home feed.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="layout-metrics">
        <div className="layout-metric-card">
          <span className="metric-label">Hero Banners</span>
          <span className="metric-value">{banners.filter((b) => b.imageUrl).length} / 5</span>
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
          <span className="metric-sub">
            {featuredEvents.length === 9 ? 'Full list' : `${9 - featuredEvents.length} slots free`}
          </span>
        </div>
        <div className="layout-metric-card">
          <span className="metric-label">Selected Brands</span>
          <span className="metric-value">{featuredBrands.length}</span>
          <span className="metric-sub">No upper limit</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="layout-nav-tabs">
        <button
          className={`layout-tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          <ImageIcon size={16} /> 1. Banners (5 Slots)
          <span className="layout-tab-badge">
            {banners.filter((b) => b.imageUrl).length}/5
          </span>
        </button>
        <button
          className={`layout-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Plus size={16} /> 2. Categories Section
          <span className="layout-tab-badge">{categories.length}</span>
        </button>
        <button
          className={`layout-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={16} /> 3. Featured Events
          <span className="layout-tab-badge">{featuredEvents.length}/9</span>
        </button>
        <button
          className={`layout-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          <Building size={16} /> 4. Shop by Brand
          <span className="layout-tab-badge">{featuredBrands.length}</span>
        </button>
      </div>

      {/* ========================================================
          Section 1: Hero Banners
          ======================================================== */}
      {activeTab === 'banners' && (
        <div className="layout-section-card" id="banners">
          <div className="section-header">
            <div>
              <h2 className="section-title">1. Home Page Hero Banners</h2>
              <p className="section-description">
                Upload high quality banner images (recommended 21:9 format) and define their target redirect URLs.
              </p>
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
                    {banner.imageUrl && (
                      <span className="item-badge published" style={{ fontSize: '0.7rem' }}>
                        Active
                      </span>
                    )}
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
      )}

      {/* ========================================================
          Section 2: Categories Section
          ======================================================== */}
      {activeTab === 'categories' && (
        <div className="layout-section-card" id="categories">
          <div className="section-header">
            <div>
              <h2 className="section-title">2. Categories Custom Section</h2>
              <p className="section-description">
                Manage category shortcuts shown on the For You screen. Customize the visual image, title text, and target redirect link.
              </p>
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
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.6rem 0.75rem',
                        background: '#ffffff',
                        color: '#0f172a'
                      }}
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
      )}

      {/* ========================================================
          Section 3: Featured Events (Simple List + Modal)
          ======================================================== */}
      {activeTab === 'events' && (
        <div className="layout-section-card" id="events">
          <div className="section-header">
            <div>
              <h2 className="section-title">3. Featured Events (Max 9 Events)</h2>
              <p className="section-description">
                Highlight up to 9 standout events in the featured showcase section on the For You page.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="item-badge published">{featuredEvents.length} of 9 Filled</span>
              <button
                type="button"
                className="quick-add-btn"
                onClick={() => {
                  setEventSearchQuery('');
                  setEventCategoryFilter('all');
                  setEventStarredFilter('all');
                  setEventCurrentPage(1);
                  setEventPickerOpen(true);
                }}
              >
                <Plus size={16} /> Select / Manage Events
              </button>
            </div>
          </div>

          <div className="layout-selected-items-wrapper">
            <div className="layout-selected-header">
              <div>
                <h3 className="layout-selected-title">Featured Showcase Events List</h3>
                <p className="layout-selected-subtitle">
                  These events appear in the featured events carousel on the For You home page.
                </p>
              </div>
              <button
                type="button"
                className="layout-add-trigger-btn"
                onClick={() => {
                  setEventSearchQuery('');
                  setEventCategoryFilter('all');
                  setEventStarredFilter('all');
                  setEventCurrentPage(1);
                  setEventPickerOpen(true);
                }}
              >
                <Plus size={15} /> Add / Manage Events ({featuredEvents.length}/9)
              </button>
            </div>

            {featuredEvents.length === 0 ? (
              <div className="layout-empty-selected-state">
                <Calendar size={36} color="#94a3b8" />
                <h4>No Featured Events Selected</h4>
                <p>Click below to choose events from your catalog to feature on the home page.</p>
                <button
                  type="button"
                  className="quick-add-btn"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => {
                    setEventSearchQuery('');
                    setEventCategoryFilter('all');
                    setEventStarredFilter('all');
                    setEventCurrentPage(1);
                    setEventPickerOpen(true);
                  }}
                >
                  <Plus size={16} /> Select Featured Events
                </button>
              </div>
            ) : (
              <div className="layout-table-container">
                <table className="layout-simple-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th style={{ width: '80px' }}>Poster</th>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>Venue / Location</th>
                      <th>Date & Time</th>
                      <th>Ticket Price</th>
                      <th style={{ textAlign: 'right', width: '100px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredEvents.map((event, idx) => {
                      const eventThumb =
                        event.imageUrl ||
                        event.bannerImage ||
                        event.banner ||
                        event.image ||
                        event.venueImage;

                      return (
                        <tr key={event.id}>
                          <td>
                            <span className="layout-table-order">{idx + 1}</span>
                          </td>
                          <td>
                            <div className="layout-table-thumb">
                              {eventThumb ? (
                                <img src={eventThumb} alt={event.name} />
                              ) : (
                                <Calendar size={18} color="#94a3b8" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="layout-table-title">{event.name || 'Untitled Event'}</div>
                            <div className="layout-table-sub">ID: {event.id}</div>
                          </td>
                          <td>
                            <span className="layout-badge-category">
                              {event.category || 'General'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.85rem' }}>
                              <MapPin size={13} color="#94a3b8" />
                              <span>{event.venue || event.location || 'TBD'}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.85rem' }}>
                              <Calendar size={13} color="#94a3b8" />
                              <span>{event.eventDate || event.date || 'TBD'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="layout-table-price">₹{event.ticketPrice || event.price || 0}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="layout-table-remove-btn"
                              onClick={() => handleUnstarEvent(event.id)}
                              title="Remove from Featured"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          Section 4: Shop By Brand (Simple List + Modal)
          ======================================================== */}
      {activeTab === 'brands' && (
        <div className="layout-section-card" id="brands">
          <div className="section-header">
            <div>
              <h2 className="section-title">4. Shop By Brand (Accessory Brands)</h2>
              <p className="section-description">
                Choose brand shortcuts to display on the main landing screen by selecting them from your brand catalog.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="item-badge published">{featuredBrands.length} Brands Featured</span>
              <button
                type="button"
                className="quick-add-btn"
                onClick={() => {
                  setBrandSearchQuery('');
                  setBrandStarredFilter('all');
                  setBrandCurrentPage(1);
                  setBrandPickerOpen(true);
                }}
              >
                <Plus size={16} /> Select / Manage Brands
              </button>
            </div>
          </div>

          <div className="layout-selected-items-wrapper">
            <div className="layout-selected-header">
              <div>
                <h3 className="layout-selected-title">Curated Brands List</h3>
                <p className="layout-selected-subtitle">
                  These brands appear in the "Shop By Brand" showcase on the For You page.
                </p>
              </div>
              <button
                type="button"
                className="layout-add-trigger-btn"
                onClick={() => {
                  setBrandSearchQuery('');
                  setBrandStarredFilter('all');
                  setBrandCurrentPage(1);
                  setBrandPickerOpen(true);
                }}
              >
                <Plus size={15} /> Add / Manage Brands ({featuredBrands.length})
              </button>
            </div>

            {featuredBrands.length === 0 ? (
              <div className="layout-empty-selected-state">
                <Building size={36} color="#94a3b8" />
                <h4>No Brands Selected</h4>
                <p>Click below to choose brands from your catalog to feature on the home page.</p>
                <button
                  type="button"
                  className="quick-add-btn"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => {
                    setBrandSearchQuery('');
                    setBrandStarredFilter('all');
                    setBrandCurrentPage(1);
                    setBrandPickerOpen(true);
                  }}
                >
                  <Plus size={16} /> Select Featured Brands
                </button>
              </div>
            ) : (
              <div className="layout-table-container">
                <table className="layout-simple-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th style={{ width: '80px' }}>Logo</th>
                      <th>Brand Name</th>
                      <th>Status</th>
                      <th>Website / Link</th>
                      <th style={{ textAlign: 'right', width: '100px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredBrands.map((brand, idx) => (
                      <tr key={brand.id}>
                        <td>
                          <span className="layout-table-order">{idx + 1}</span>
                        </td>
                        <td>
                          <div className="brand-table-logo">
                            {brand.imageUrl || brand.logo ? (
                              <img src={brand.imageUrl || brand.logo} alt={brand.name} />
                            ) : (
                              <Building size={18} color="#94a3b8" />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="brand-table-name">{brand.name || 'Untitled Brand'}</div>
                          <div className="layout-table-sub">ID: {brand.id}</div>
                        </td>
                        <td>
                          <span
                            className={`item-badge ${brand.authorizedStatus === 'authorized' ? 'published' : 'draft'}`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {brand.authorizedStatus?.replace('_', ' ') || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {brand.website || brand.redirectUrl || `/products?brand=${encodeURIComponent(brand.name || '')}`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="layout-table-remove-btn"
                            onClick={() => handleUnstarBrand(brand.id)}
                            title="Remove from Brands"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          Event Picker Modal (Combo style)
          ======================================================== */}
      {eventPickerOpen && (
        <div className="combo-picker-backdrop" onClick={() => setEventPickerOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-picker-header">
              <div>
                <h3 className="combo-picker-title">Select Featured Events (Max 9)</h3>
                <p className="combo-picker-subtitle">
                  Click the star or checkbox to add or remove events from the For You showcase ({featuredEvents.length}/9 selected).
                </p>
              </div>
              <button className="combo-picker-close-btn" onClick={() => setEventPickerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="combo-picker-filter-bar">
              <div className="combo-search-wrapper">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  className="combo-search-input"
                  placeholder="Search events by name, venue, city..."
                  value={eventSearchQuery}
                  onChange={(e) => {
                    setEventSearchQuery(e.target.value);
                    setEventCurrentPage(1);
                  }}
                  autoFocus
                />
                {eventSearchQuery && (
                  <button
                    className="combo-clear-search-btn"
                    onClick={() => {
                      setEventSearchQuery('');
                      setEventCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-filter-dropdown-wrapper">
                <select
                  className="combo-filter-select"
                  value={eventCategoryFilter}
                  onChange={(e) => {
                    setEventCategoryFilter(e.target.value);
                    setEventCurrentPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  {availableEventCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="combo-toggle-pills">
                <button
                  type="button"
                  className={`combo-toggle-pill ${eventStarredFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setEventStarredFilter('all');
                    setEventCurrentPage(1);
                  }}
                >
                  All Events
                </button>
                <button
                  type="button"
                  className={`combo-toggle-pill ${eventStarredFilter === 'starred' ? 'active' : ''}`}
                  onClick={() => {
                    setEventStarredFilter('starred');
                    setEventCurrentPage(1);
                  }}
                >
                  <Star size={13} fill={eventStarredFilter === 'starred' ? '#ff6b00' : 'none'} />
                  Featured ({featuredEvents.length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="combo-table-container">
              {paginatedPickerEvents.length === 0 ? (
                <div className="combo-empty-state">
                  <Star size={36} color="#94a3b8" />
                  <h4>No Events Match Filter</h4>
                  <p>Try clearing filters or changing search keywords.</p>
                </div>
              ) : (
                <table className="combo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>
                        <Star size={14} />
                      </th>
                      <th style={{ width: '70px' }}>Poster</th>
                      <th>Event Details</th>
                      <th>Category</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Featured Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPickerEvents.map((event) => {
                      const isFeatured = event.featuredForYou === true;
                      const eventPoster =
                        event.bannerImage ||
                        event.banner ||
                        event.imageUrl ||
                        event.image ||
                        event.venueImage;

                      return (
                        <tr
                          key={event.id}
                          className={`clickable-row ${isFeatured ? 'selected-row' : ''}`}
                          onClick={() => handleToggleFeaturedEvent(event)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <div className={`combo-checkbox ${isFeatured ? 'checked' : ''}`}>
                              {isFeatured && <Check size={12} strokeWidth={3} />}
                            </div>
                          </td>
                          <td>
                            <div className="combo-product-thumb">
                              {eventPoster ? (
                                <img src={eventPoster} alt={event.name} />
                              ) : (
                                <Calendar size={18} color="#94a3b8" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="combo-product-name">{event.name || 'Untitled Event'}</div>
                            <div className="combo-product-sub">ID: {event.id}</div>
                          </td>
                          <td>
                            <span className="combo-product-category">{event.category || 'General'}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.85rem' }}>
                              <MapPin size={13} color="#94a3b8" />
                              <span>{event.venue || event.location || 'TBD'}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.85rem' }}>
                              <Calendar size={13} color="#94a3b8" />
                              <span>{event.eventDate || event.date || 'TBD'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="combo-product-price">₹{event.ticketPrice || event.price || 0}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={`combo-star-pill ${isFeatured ? 'starred' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFeaturedEvent(event);
                              }}
                            >
                              <Star size={13} fill={isFeatured ? '#ffffff' : 'none'} />
                              <span>{isFeatured ? 'Featured' : 'Add to Featured'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination & Footer */}
            <div className="combo-picker-footer">
              <div className="combo-pagination-info">
                Selected <strong>{featuredEvents.length}</strong> / 9 max events
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {eventTotalPages > 1 && (
                  <div className="combo-pagination-nav">
                    <button
                      className="combo-page-arrow-btn"
                      disabled={eventCurrentPage === 1}
                      onClick={() => setEventCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="combo-pagination-pages">
                      {getPaginationPages(eventCurrentPage, eventTotalPages).map((p, idx) =>
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="combo-page-dots">...</span>
                        ) : (
                          <button
                            key={p}
                            className={`combo-page-number-btn ${eventCurrentPage === p ? 'active' : ''}`}
                            onClick={() => setEventCurrentPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="combo-page-arrow-btn"
                      disabled={eventCurrentPage === eventTotalPages}
                      onClick={() => setEventCurrentPage((prev) => Math.min(eventTotalPages, prev + 1))}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="quick-add-btn"
                  style={{
                    background: '#ff6b00',
                    border: '1px solid #ff6b00',
                    padding: '0.45rem 1.25rem',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setEventPickerOpen(false)}
                >
                  Done ({featuredEvents.length}/9)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          Brand Picker Modal (Combo style)
          ======================================================== */}
      {brandPickerOpen && (
        <div className="combo-picker-backdrop" onClick={() => setBrandPickerOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-picker-header">
              <div>
                <h3 className="combo-picker-title">Select Featured Brands</h3>
                <p className="combo-picker-subtitle">
                  Click the star or checkbox to add or remove brands from the "Shop By Brand" showcase ({featuredBrands.length} selected).
                </p>
              </div>
              <button className="combo-picker-close-btn" onClick={() => setBrandPickerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="combo-picker-filter-bar">
              <div className="combo-search-wrapper">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  className="combo-search-input"
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
                    className="combo-clear-search-btn"
                    onClick={() => {
                      setBrandSearchQuery('');
                      setBrandCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-toggle-pills">
                <button
                  type="button"
                  className={`combo-toggle-pill ${brandStarredFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setBrandStarredFilter('all');
                    setBrandCurrentPage(1);
                  }}
                >
                  All Brands
                </button>
                <button
                  type="button"
                  className={`combo-toggle-pill ${brandStarredFilter === 'starred' ? 'active' : ''}`}
                  onClick={() => {
                    setBrandStarredFilter('starred');
                    setBrandCurrentPage(1);
                  }}
                >
                  <Star size={13} fill={brandStarredFilter === 'starred' ? '#ff6b00' : 'none'} />
                  Featured ({featuredBrands.length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="combo-table-container">
              {paginatedPickerBrands.length === 0 ? (
                <div className="combo-empty-state">
                  <Star size={36} color="#94a3b8" />
                  <h4>No Brands Match Filter</h4>
                  <p>Try searching with another keyword or toggle the filter.</p>
                </div>
              ) : (
                <table className="combo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>
                        <Star size={14} />
                      </th>
                      <th style={{ width: '70px' }}>Logo</th>
                      <th>Brand Name</th>
                      <th>Status</th>
                      <th>Website / Link</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPickerBrands.map((brand) => {
                      const isFeatured = brand.featuredForYou === true;

                      return (
                        <tr
                          key={brand.id}
                          className={`clickable-row ${isFeatured ? 'selected-row' : ''}`}
                          onClick={() => handleToggleFeaturedBrand(brand)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <div className={`combo-checkbox ${isFeatured ? 'checked' : ''}`}>
                              {isFeatured && <Check size={12} strokeWidth={3} />}
                            </div>
                          </td>
                          <td>
                            <div className="brand-table-logo">
                              {brand.imageUrl || brand.logo ? (
                                <img src={brand.imageUrl || brand.logo} alt={brand.name} />
                              ) : (
                                <Building size={18} color="#94a3b8" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="brand-table-name">{brand.name || 'Untitled Brand'}</div>
                            <div className="combo-product-sub">ID: {brand.id}</div>
                          </td>
                          <td>
                            <span
                              className={`item-badge ${brand.authorizedStatus === 'authorized' ? 'published' : 'draft'}`}
                              style={{ textTransform: 'capitalize' }}
                            >
                              {brand.authorizedStatus?.replace('_', ' ') || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              {brand.website || brand.redirectUrl || `/products?brand=${encodeURIComponent(brand.name || '')}`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={`combo-star-pill ${isFeatured ? 'starred' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFeaturedBrand(brand);
                              }}
                            >
                              <Star size={13} fill={isFeatured ? '#ffffff' : 'none'} />
                              <span>{isFeatured ? 'Featured' : 'Add to Featured'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination & Footer */}
            <div className="combo-picker-footer">
              <div className="combo-pagination-info">
                Selected <strong>{featuredBrands.length}</strong> featured brands
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {brandTotalPages > 1 && (
                  <div className="combo-pagination-nav">
                    <button
                      className="combo-page-arrow-btn"
                      disabled={brandCurrentPage === 1}
                      onClick={() => setBrandCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="combo-pagination-pages">
                      {getPaginationPages(brandCurrentPage, brandTotalPages).map((p, idx) =>
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="combo-page-dots">...</span>
                        ) : (
                          <button
                            key={p}
                            className={`combo-page-number-btn ${brandCurrentPage === p ? 'active' : ''}`}
                            onClick={() => setBrandCurrentPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="combo-page-arrow-btn"
                      disabled={brandCurrentPage === brandTotalPages}
                      onClick={() => setBrandCurrentPage((prev) => Math.min(brandTotalPages, prev + 1))}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="quick-add-btn"
                  style={{
                    background: '#ff6b00',
                    border: '1px solid #ff6b00',
                    padding: '0.45rem 1.25rem',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setBrandPickerOpen(false)}
                >
                  Done ({featuredBrands.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
