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
  Calendar,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Star,
  Sparkles,
  CheckCircle,
  LoaderCircle,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  Layers,
  Flame,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import './EventsLayoutMedia.css';

const DEFAULT_SLIDES = [
  { id: 'slide-1', eventId: '', eventName: '', imageUrl: '', badge: '🔥 Trending Ride', title: '', subtitle: 'Join fellow riders on this epic journey', date: '', venue: '', price: '', redirectUrl: '' },
  { id: 'slide-2', eventId: '', eventName: '', imageUrl: '', badge: '🏁 Track Day', title: '', subtitle: 'Experience the adrenaline of high-speed racing', date: '', venue: '', price: '', redirectUrl: '' },
  { id: 'slide-3', eventId: '', eventName: '', imageUrl: '', badge: '⭐ Featured', title: '', subtitle: 'Curated premium motorcycling adventure', date: '', venue: '', price: '', redirectUrl: '' },
  { id: 'slide-4', eventId: '', eventName: '', imageUrl: '', badge: '⚡ Weekend Special', title: '', subtitle: 'Weekend gateway with scenic mountain routes', date: '', venue: '', price: '', redirectUrl: '' },
  { id: 'slide-5', eventId: '', eventName: '', imageUrl: '', badge: '🏍️ Community Meet', title: '', subtitle: 'Meet the riding community and make new friends', date: '', venue: '', price: '', redirectUrl: '' }
];

const DEFAULT_CATEGORIES = [
  { title: 'Track Days', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80', redirectUrl: '/events?category=track_day' },
  { title: 'Group Rides', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80', redirectUrl: '/events?category=group_ride' },
  { title: 'Off-Road Enduro', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', redirectUrl: '/events?category=off_road' },
  { title: 'Workshops & Clinics', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80', redirectUrl: '/events?category=workshop' }
];

const BADGE_PRESETS = [
  '🔥 Trending Ride',
  '🏁 Track Day',
  '⭐ Featured Event',
  '⚡ Weekend Special',
  '🏆 Championship',
  '🏍️ Community Ride',
  '🎉 Selling Fast',
  '✨ Nitroxx Exclusive'
];

const EventsLayoutMedia = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('hero');

  // Hero Carousel Slides State
  const [heroSlides, setHeroSlides] = useState(DEFAULT_SLIDES);

  // Categories Section State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // All events fetched from database (for picker and previews)
  const [allEvents, setAllEvents] = useState([]);

  // Curated featured events
  const [featuredEventIds, setFeaturedEventIds] = useState([]);

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Event Picker Modal State
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerTargetSlideIndex, setPickerTargetSlideIndex] = useState(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');

  // Show status toasts
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

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

  // Fetch Events Layout configuration from Firestore
  useEffect(() => {
    const fetchLayoutConfig = async () => {
      try {
        const layoutRef = doc(db, 'page_layouts', 'events_layout');
        const layoutDoc = await getDoc(layoutRef);

        if (layoutDoc.exists()) {
          const data = layoutDoc.data();
          if (data.heroSlides && Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
            setHeroSlides(data.heroSlides);
          } else if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
            // Backward compatibility if saved as banners
            const converted = data.banners.map((b, idx) => ({
              id: `slide-${idx + 1}`,
              eventId: b.eventId || '',
              eventName: b.title || '',
              imageUrl: b.imageUrl || '',
              badge: b.badge || 'Featured',
              title: b.title || '',
              subtitle: b.subtitle || '',
              date: b.date || '',
              venue: b.venue || '',
              price: b.price || '',
              redirectUrl: b.redirectUrl || ''
            }));
            setHeroSlides(converted);
          }

          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }

          if (data.featuredEventIds && Array.isArray(data.featuredEventIds)) {
            setFeaturedEventIds(data.featuredEventIds);
          }
        }
      } catch (error) {
        console.error('Error fetching events layout configuration:', error);
        showToast('Failed to load events layout configuration.', true);
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

  // ========================================================
  // Hero Slide Handlers
  // ========================================================

  const handleOpenEventPicker = (slideIndex) => {
    setPickerTargetSlideIndex(slideIndex);
    setPickerSearchQuery('');
    setPickerCategoryFilter('all');
    setPickerModalOpen(true);
  };

  const handleSelectEventForSlide = (event) => {
    if (pickerTargetSlideIndex === null) return;

    const eventBanner =
      event.bannerImage ||
      event.banner ||
      event.imageUrl ||
      event.image ||
      event.venueImage ||
      '';

    setHeroSlides((prev) => {
      const updated = [...prev];
      const target = updated[pickerTargetSlideIndex];
      updated[pickerTargetSlideIndex] = {
        ...target,
        eventId: event.id,
        eventName: event.name || event.title || 'Untitled Event',
        title: target.title || event.name || event.title || 'Untitled Event',
        imageUrl: target.imageUrl || eventBanner,
        date: event.eventDate || event.date || event.startDate || '',
        venue: event.venue || event.location || event.city || '',
        price: event.ticketPrice || event.price || '0',
        redirectUrl: target.redirectUrl || `/events/${event.id}`
      };
      return updated;
    });

    setPickerModalOpen(false);
    setPickerTargetSlideIndex(null);
    showToast(`Linked "${event.name || 'Event'}" to Slide #${pickerTargetSlideIndex + 1}!`);
  };

  const handleClearSlideEvent = (index) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        eventId: '',
        eventName: '',
        title: '',
        date: '',
        venue: '',
        price: '',
        redirectUrl: ''
      };
      return updated;
    });
  };

  const handleResetSlidePoster = (index) => {
    const slide = heroSlides[index];
    if (!slide.eventId) return;
    const event = allEvents.find((e) => e.id === slide.eventId);
    if (event) {
      const defaultBanner =
        event.bannerImage ||
        event.banner ||
        event.imageUrl ||
        event.image ||
        event.venueImage ||
        '';
      handleUpdateSlide(index, 'imageUrl', defaultBanner);
      showToast('Reset image to event poster');
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
        eventId: '',
        eventName: '',
        imageUrl: '',
        badge: 'Featured Event',
        title: '',
        subtitle: 'Experience thrilling adventures with Nitroxxin',
        date: '',
        venue: '',
        price: '',
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
        type: `layout-events-${type}`,
        productId: 'events'
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
      { imageUrl: '', title: '', redirectUrl: '/events?category=' }
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
  // Featured Events Toggle Handler
  // ========================================================

  const handleToggleFeaturedEvent = (eventId) => {
    setFeaturedEventIds((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        if (prev.length >= 9) {
          showToast('You can select a maximum of 9 featured events.', true);
          return prev;
        }
        return [...prev, eventId];
      }
    });
  };

  // ========================================================
  // Save All to Firestore
  // ========================================================

  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      const layoutRef = doc(db, 'page_layouts', 'events_layout');

      // Create standardized banners array for backwards compatibility
      const banners = heroSlides.map((slide) => ({
        imageUrl: slide.imageUrl,
        redirectUrl: slide.redirectUrl,
        eventId: slide.eventId,
        title: slide.title,
        badge: slide.badge,
        date: slide.date,
        venue: slide.venue,
        price: slide.price
      }));

      const layoutData = {
        heroSlides,
        banners,
        categories,
        featuredEventIds,
        updatedAt: serverTimestamp()
      };

      await setDoc(layoutRef, layoutData);
      // Also save to 'events' for backwards compatibility
      await setDoc(doc(db, 'page_layouts', 'events'), layoutData);

      showToast('Events page layout saved successfully!');
    } catch (error) {
      console.error('Error saving events page layout:', error);
      showToast('Failed to save events layout configuration.', true);
    } finally {
      setSaving(false);
    }
  };

  // Filtered events in picker modal
  const filteredPickerEvents = allEvents.filter((event) => {
    const nameMatch = (event.name || event.title || '')
      .toLowerCase()
      .includes(pickerSearchQuery.toLowerCase());
    const venueMatch = (event.venue || event.location || event.city || '')
      .toLowerCase()
      .includes(pickerSearchQuery.toLowerCase());
    const categoryMatch =
      pickerCategoryFilter === 'all' ||
      (event.category || '').toLowerCase() === pickerCategoryFilter.toLowerCase();
    return (nameMatch || venueMatch) && categoryMatch;
  });

  // Featured events list for display
  const featuredEventsList = allEvents.filter((e) => featuredEventIds.includes(e.id));

  if (loading) {
    return (
      <div
        className="events-layout-page"
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
        <p style={{ color: '#9ca3af', fontWeight: 600 }}>Loading Events Layout Configurations...</p>
      </div>
    );
  }

  return (
    <div className="events-layout-page">
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
      <div className="events-layout-hero">
        <div className="hero-left">
          <div className="hero-icon" style={{ backgroundColor: '#ff6b0015', color: '#ff6b00' }}>
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="page-title">Events Layout Manager</h1>
            <p className="page-subtitle">
              Configure the sliding hero section, event categories, and curated featured events for the main Events page on web & app.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="events-layout-metrics">
        <div className="events-metric-card">
          <span className="metric-label">Hero Slides</span>
          <span className="metric-value">{heroSlides.filter((s) => s.imageUrl).length} / {heroSlides.length}</span>
          <span className="metric-sub">{heroSlides.filter((s) => s.eventId).length} Events Linked</span>
        </div>
        <div className="events-metric-card">
          <span className="metric-label">Event Categories</span>
          <span className="metric-value">{categories.length}</span>
          <span className="metric-sub">Filter shortcuts</span>
        </div>
        <div className="events-metric-card">
          <span className="metric-label">Featured Events</span>
          <span className="metric-value">{featuredEventIds.length} / 9</span>
          <span className="metric-sub">
            {featuredEventIds.length === 9 ? 'Full list' : `${9 - featuredEventIds.length} slots available`}
          </span>
        </div>
        <div className="events-metric-card">
          <span className="metric-label">Total Catalog Events</span>
          <span className="metric-value">{allEvents.length}</span>
          <span className="metric-sub">Available to choose</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="events-nav-tabs">
        <button
          className={`events-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => scrollToSection('hero')}
        >
          <SlidersHorizontal size={16} /> 1. Sliding Hero Section ({heroSlides.length} Slides)
        </button>
        <button
          className={`events-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => scrollToSection('categories')}
        >
          <Tag size={16} /> 2. Event Categories ({categories.length})
        </button>
        <button
          className={`events-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => scrollToSection('featured')}
        >
          <Star size={16} /> 3. Featured Events ({featuredEventIds.length}/9)
        </button>
      </div>

      {/* ========================================================
          Section 1: Sliding Hero Section
          ======================================================== */}
      <div className="events-section-card" id="hero">
        <div className="section-header">
          <div>
            <h2 className="section-title">1. Sliding Hero Section (Event Carousel)</h2>
            <p className="section-description">
              Choose events from your database to display in the main sliding hero carousel. Customize the slide badge, title, subtitle, or upload a custom wide banner image.
            </p>
          </div>
          <button className="choose-event-btn" onClick={handleAddSlide}>
            <Plus size={16} /> Add Hero Slide
          </button>
        </div>

        <div className="hero-slides-container">
          {heroSlides.map((slide, index) => {
            const isUploading = uploading[`hero-${index}`];
            const linkedEvent = allEvents.find((e) => e.id === slide.eventId);

            return (
              <div className="hero-slide-card" key={slide.id || index}>
                {/* Slide Top Bar */}
                <div className="hero-slide-header">
                  <div className="slide-order-badge">
                    <span>Slide #{index + 1}</span>
                    {slide.eventId ? (
                      <span className="item-badge published" style={{ fontSize: '0.7rem' }}>
                        Linked: {slide.eventName || 'Event'}
                      </span>
                    ) : (
                      <span className="item-badge draft" style={{ fontSize: '0.7rem' }}>
                        No Event Selected
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
                  {/* Left Column: Event Selection & Slide Text */}
                  <div className="slide-content-left">
                    {/* Event Chooser Box */}
                    <div className="event-selection-box">
                      <div className="event-selection-header">
                        <span>Selected Event from Database</span>
                        {slide.eventId && (
                          <button
                            type="button"
                            className="reset-poster-btn"
                            onClick={() => handleClearSlideEvent(index)}
                          >
                            Disconnect Event
                          </button>
                        )}
                      </div>

                      {slide.eventId ? (
                        <div className="selected-event-display">
                          {slide.imageUrl || (linkedEvent && (linkedEvent.imageUrl || linkedEvent.bannerImage)) ? (
                            <img
                              src={slide.imageUrl || linkedEvent.imageUrl || linkedEvent.bannerImage}
                              alt={slide.eventName}
                              className="selected-event-thumb"
                            />
                          ) : (
                            <div className="selected-event-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Calendar size={24} color="#64748b" />
                            </div>
                          )}
                          <div className="selected-event-info">
                            <h4 className="selected-event-name">{slide.eventName || 'Untitled Event'}</h4>
                            <div className="selected-event-meta">
                              {slide.date && (
                                <span>
                                  <Calendar size={11} className="event-meta-icon" /> {slide.date}
                                </span>
                              )}
                              {slide.venue && (
                                <span>
                                  <MapPin size={11} className="event-meta-icon" /> {slide.venue}
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
                            className="change-event-btn"
                            onClick={() => handleOpenEventPicker(index)}
                          >
                            Change Event
                          </button>
                        </div>
                      ) : (
                        <div className="no-event-selected-box">
                          <Calendar size={32} color="#94a3b8" />
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                            No event connected to this hero slide yet.
                          </p>
                          <button
                            type="button"
                            className="choose-event-btn"
                            onClick={() => handleOpenEventPicker(index)}
                          >
                            <Calendar size={14} /> Choose Event from Database
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Slide Text Customization Fields */}
                    <div className="slide-form-fields">
                      {/* Badge / Tag */}
                      <div className="form-group-sm">
                        <label>Slide Tag / Badge</label>
                        <input
                          type="text"
                          className="form-input-sm"
                          placeholder="e.g. 🔥 Trending Ride"
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
                          placeholder="Event Title for Hero Slide"
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
                          placeholder="Catchy description for riders..."
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
                            placeholder="/events/event-id"
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
                            <h3 className="hero-preview-title">{slide.title || slide.eventName || 'Slide Heading'}</h3>
                            <div className="hero-preview-meta">
                              {slide.date && (
                                <span>
                                  <Calendar size={12} /> {slide.date}
                                </span>
                              )}
                              {slide.venue && (
                                <span>
                                  <MapPin size={12} /> {slide.venue}
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
                          <small>Select an event or upload a custom 21:9 image</small>
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

                      {slide.eventId && (
                        <button
                          type="button"
                          className="reset-poster-btn"
                          onClick={() => handleResetSlidePoster(index)}
                        >
                          Use Event's Default Poster
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
      <div className="events-section-card" id="categories">
        <div className="section-header">
          <div>
            <h2 className="section-title">2. Event Categories Shortcuts</h2>
            <p className="section-description">
              Manage category shortcuts shown on the Events page (e.g. Track Days, Group Rides, Off-Road Enduro, Workshops).
            </p>
          </div>
          <button className="choose-event-btn" onClick={handleAddCategory}>
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
                    placeholder="e.g. Track Days"
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
                      placeholder="/events?category=track_day"
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
          Section 3: Featured Events Grid
          ======================================================== */}
      <div className="events-section-card" id="featured">
        <div className="section-header">
          <div>
            <h2 className="section-title">3. Curated Featured Events (Max 9 Events)</h2>
            <p className="section-description">
              Highlight up to 9 standout events in the featured showcase section on the Events page.
            </p>
          </div>
          <span className="item-badge published">{featuredEventIds.length} of 9 Filled</span>
        </div>

        {featuredEventsList.length === 0 ? (
          <div className="empty-star-slot" style={{ padding: '3rem' }}>
            <Star size={36} color="#475569" />
            <span>No Featured Events Selected</span>
            <p style={{ marginTop: '0.5rem' }}>
              Choose events from the catalog below or open the hero slide event chooser to feature events.
            </p>
          </div>
        ) : (
          <div className="events-items-grid">
            {featuredEventsList.map((event) => {
              const eventThumb =
                event.imageUrl ||
                event.bannerImage ||
                event.banner ||
                event.image ||
                event.venueImage;

              return (
                <div className="event-card-item" key={event.id}>
                  <div className="event-thumb-zone">
                    {eventThumb ? (
                      <img src={eventThumb} alt={event.name} className="event-thumb-img" />
                    ) : (
                      <Calendar size={36} color="#64748b" />
                    )}
                  </div>
                  <div className="event-details-body">
                    <h3 className="event-title-text">{event.name || 'Untitled Event'}</h3>
                    <div className="event-meta-line">
                      <MapPin size={12} className="event-meta-icon" />
                      <span>{event.venue || event.location || 'No Venue Specified'}</span>
                    </div>
                    <div className="event-meta-line">
                      <Calendar size={12} className="event-meta-icon" />
                      <span>{event.eventDate || event.date || 'No Date Set'}</span>
                    </div>
                  </div>
                  <div className="event-card-footer">
                    <div className="event-meta-line" style={{ fontWeight: 700, color: '#0f172a' }}>
                      <DollarSign size={13} className="event-meta-icon" style={{ color: '#10b981' }} />
                      <span>₹{event.ticketPrice || event.price || 0}</span>
                    </div>
                    <button
                      className="item-unstar-btn"
                      onClick={() => handleToggleFeaturedEvent(event.id)}
                    >
                      <Star size={13} fill="currentColor" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, 9 - featuredEventsList.length) }).map((_, idx) => (
              <div className="empty-star-slot" key={idx}>
                <Star size={20} />
                <span>Empty Event Slot</span>
                <p>Add from catalog</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Picker Bar for Featured Events */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
            Quick Toggle from Events Catalog:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allEvents.map((event) => {
              const isFeatured = featuredEventIds.includes(event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  className={`badge-chip ${isFeatured ? 'selected' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleToggleFeaturedEvent(event.id)}
                >
                  <Star size={12} fill={isFeatured ? '#ffffff' : 'none'} />
                  <span>{event.name || 'Event'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          Event Picker Modal
          ======================================================== */}
      {pickerModalOpen && (
        <div className="event-picker-backdrop" onClick={() => setPickerModalOpen(false)}>
          <div className="event-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-picker-header">
              <div>
                <h3 className="event-picker-title">
                  Choose Event for Slide #{pickerTargetSlideIndex !== null ? pickerTargetSlideIndex + 1 : ''}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Select an event from your catalog to display its poster, dates, venue, and ticket prices in this sliding hero banner.
                </p>
              </div>
              <button className="event-picker-close" onClick={() => setPickerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="event-picker-search-bar">
              <div className="picker-search-input-wrapper">
                <Search size={16} className="picker-search-icon" />
                <input
                  type="text"
                  className="picker-search-input"
                  placeholder="Search events by title, venue, or location..."
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="event-picker-grid">
              {filteredPickerEvents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  <Calendar size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No matching events found</p>
                  <small style={{ color: '#94a3b8' }}>Try searching with a different keyword</small>
                </div>
              ) : (
                filteredPickerEvents.map((event) => {
                  const eventPoster =
                    event.bannerImage ||
                    event.banner ||
                    event.imageUrl ||
                    event.image ||
                    event.venueImage;

                  return (
                    <div
                      key={event.id}
                      className="picker-event-card"
                      onClick={() => handleSelectEventForSlide(event)}
                    >
                      <div className="picker-event-thumb">
                        {eventPoster ? (
                          <img src={eventPoster} alt={event.name} />
                        ) : (
                          <Calendar size={28} color="#94a3b8" />
                        )}
                      </div>
                      <div className="picker-event-details">
                        <h4 className="picker-event-title">{event.name || 'Untitled Event'}</h4>
                        <div className="picker-event-meta">
                          <MapPin size={11} className="event-meta-icon" />
                          <span>{event.venue || event.location || 'Location TBD'}</span>
                        </div>
                        <div className="picker-event-meta">
                          <Calendar size={11} className="event-meta-icon" />
                          <span>{event.eventDate || event.date || 'Date TBD'}</span>
                        </div>
                      </div>
                      <div className="picker-event-footer">
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{event.ticketPrice || event.price || 0}
                        </span>
                        <button
                          type="button"
                          className="picker-select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEventForSlide(event);
                          }}
                        >
                          Select Event
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
      <div className="events-footer-bar">
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
              <Save size={15} /> Save Events Layout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventsLayoutMedia;
