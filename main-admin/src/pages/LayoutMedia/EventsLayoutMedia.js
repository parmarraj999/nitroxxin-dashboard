import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Layers,
  Flame,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Tag,
  Package,
  ShieldCheck
} from 'lucide-react';
import OrganizerLogosPage from './OrganizerLogosPage';
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

  // All events fetched from database (for picker and previews)
  const [allEvents, setAllEvents] = useState([]);

  // Curated featured events
  const [featuredEventIds, setFeaturedEventIds] = useState([]);

  // Loaders and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  // Event Picker Modal State (Slide Hero)
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerTargetSlideIndex, setPickerTargetSlideIndex] = useState(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');
  const [pickerCurrentPage, setPickerCurrentPage] = useState(1);
  const pickerPageSize = 8;

  // Featured Events Picker Modal State
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState('');
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState('all');
  const [featuredStarredFilter, setFeaturedStarredFilter] = useState('all');
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const featuredPageSize = 8;

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
    setPickerCurrentPage(1);
    setPickerModalOpen(true);
  };

  const handleOpenFeaturedEventsPicker = () => {
    setFeaturedSearchQuery('');
    setFeaturedCategoryFilter('all');
    setFeaturedStarredFilter('all');
    setFeaturedCurrentPage(1);
    setFeaturedPickerOpen(true);
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
      showToast('Events page layout saved successfully!');
      
    } catch (error) {
      console.error('Error saving events page layout:', error);
      showToast('Failed to save events layout configuration.', true);
    } finally {
      setSaving(false);
    }
  };

  // Unique categories for filtering
  const availableCategories = useMemo(() => {
    const cats = new Set();
    allEvents.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [allEvents]);

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

  const pickerTotalPages = Math.max(1, Math.ceil(filteredPickerEvents.length / pickerPageSize));
  const pickerStartIndex = (pickerCurrentPage - 1) * pickerPageSize;
  const paginatedPickerEvents = filteredPickerEvents.slice(
    pickerStartIndex,
    pickerStartIndex + pickerPageSize
  );

  // Featured events list for display
  const featuredEventsList = allEvents.filter((e) => featuredEventIds.includes(e.id));

  // Filtered events for Featured Events Picker Modal
  const filteredFeaturedEvents = allEvents.filter((event) => {
    const nameMatch = (event.name || event.title || '')
      .toLowerCase()
      .includes(featuredSearchQuery.toLowerCase());
    const venueMatch = (event.venue || event.location || event.city || '')
      .toLowerCase()
      .includes(featuredSearchQuery.toLowerCase());
    const categoryMatch =
      featuredCategoryFilter === 'all' ||
      (event.category || '').toLowerCase() === featuredCategoryFilter.toLowerCase();
    const isStarred = featuredEventIds.includes(event.id);
    let starredMatch = true;
    if (featuredStarredFilter === 'starred') {
      starredMatch = isStarred;
    }
    return (nameMatch || venueMatch) && categoryMatch && starredMatch;
  });

  const featuredTotalPages = Math.max(1, Math.ceil(filteredFeaturedEvents.length / featuredPageSize));
  const featuredStartIndex = (featuredCurrentPage - 1) * featuredPageSize;
  const paginatedFeaturedEvents = filteredFeaturedEvents.slice(
    featuredStartIndex,
    featuredStartIndex + featuredPageSize
  );

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
          onClick={() => setActiveTab('hero')}
        >
          <SlidersHorizontal size={16} /> 1. Sliding Hero Section
          <span className="events-tab-badge">{heroSlides.length}</span>
        </button>
        <button
          className={`events-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={16} /> 2. Event Categories
          <span className="events-tab-badge">{categories.length}</span>
        </button>
        <button
          className={`events-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          <Star size={16} /> 3. Featured Events
          <span className="events-tab-badge">{featuredEventIds.length}/9</span>
        </button>
        <button
          className={`events-tab-btn ${activeTab === 'organizers' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizers')}
        >
          <ShieldCheck size={16} /> 4. Organizer Logos
          <span className="events-tab-badge">Logos</span>
        </button>
      </div>

      {/* ========================================================
          Section 1: Sliding Hero Section
          ======================================================== */}
      {activeTab === 'hero' && (
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
      )}

      {/* ========================================================
          Section 2: Categories Section
          ======================================================== */}
      {activeTab === 'categories' && (
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
      )}

      {/* ========================================================
          Section 3: Featured Events Grid & Simple List
          ======================================================== */}
      {activeTab === 'featured' && (
      <div className="events-section-card" id="featured">
        <div className="section-header">
          <div>
            <h2 className="section-title">3. Curated Featured Events (Max 9 Events)</h2>
            <p className="section-description">
              Highlight up to 9 standout events in the featured showcase section on the Events page.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="item-badge published">{featuredEventIds.length} of 9 Selected</span>
            <button
              type="button"
              className="choose-event-btn"
              onClick={handleOpenFeaturedEventsPicker}
            >
              <Plus size={16} /> Select / Manage Featured Events
            </button>
          </div>
        </div>

        {/* Selected Featured Events Simple List Table */}
        <div className="layout-selected-items-wrapper">
          <div className="layout-selected-header">
            <div>
              <h3 className="layout-selected-title">Featured Showcase Events List</h3>
              <p className="layout-selected-subtitle">
                These events appear in the curated featured events showcase on the website.
              </p>
            </div>
            <button
              type="button"
              className="layout-add-trigger-btn"
              onClick={handleOpenFeaturedEventsPicker}
            >
              <Plus size={15} /> Add / Manage Events ({featuredEventIds.length}/9)
            </button>
          </div>

          {featuredEventsList.length === 0 ? (
            <div className="layout-empty-selected-state">
              <Star size={36} color="#94a3b8" />
              <h4>No Featured Events Selected</h4>
              <p>Click below to choose events from your catalog to feature on the page.</p>
              <button
                type="button"
                className="choose-event-btn"
                style={{ marginTop: '0.75rem' }}
                onClick={handleOpenFeaturedEventsPicker}
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
                  {featuredEventsList.map((event, idx) => {
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
                            onClick={() => handleToggleFeaturedEvent(event.id)}
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
          Section 4: Event Hosts & Organizers Logo Manager
          ======================================================== */}
      {activeTab === 'organizers' && (
        <div className="events-section-card organizers-clean-embedded-wrapper" id="organizers" style={{ padding: '1.25rem' }}>
          <OrganizerLogosPage isEmbedded={true} />
        </div>
      )}

      {/* ========================================================
          Event Picker Modal (Hero Slide)
          ======================================================== */}
      {pickerModalOpen && (
        <div className="combo-picker-backdrop" onClick={() => setPickerModalOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-picker-header">
              <div>
                <h3 className="combo-picker-title">
                  Choose Event for Slide #{pickerTargetSlideIndex !== null ? pickerTargetSlideIndex + 1 : ''}
                </h3>
                <p className="combo-picker-subtitle">
                  Select an event to populate title, poster, venue, date, and ticket price for this hero slide.
                </p>
              </div>
              <button className="combo-picker-close-btn" onClick={() => setPickerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="combo-picker-filter-bar">
              <div className="combo-search-wrapper">
                <Search size={16} className="combo-search-icon" />
                <input
                  type="text"
                  className="combo-search-input"
                  placeholder="Search events by name, venue, city..."
                  value={pickerSearchQuery}
                  onChange={(e) => {
                    setPickerSearchQuery(e.target.value);
                    setPickerCurrentPage(1);
                  }}
                  autoFocus
                />
                {pickerSearchQuery && (
                  <button
                    className="combo-clear-search-btn"
                    onClick={() => {
                      setPickerSearchQuery('');
                      setPickerCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-filter-dropdown-wrapper">
                <select
                  className="combo-filter-select"
                  value={pickerCategoryFilter}
                  onChange={(e) => {
                    setPickerCategoryFilter(e.target.value);
                    setPickerCurrentPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="combo-table-container">
              {paginatedPickerEvents.length === 0 ? (
                <div className="combo-empty-state">
                  <Calendar size={36} color="#94a3b8" />
                  <h4>No Events Found</h4>
                  <p>Try searching with another keyword or adjust the category filter.</p>
                </div>
              ) : (
                <table className="combo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Poster</th>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>Venue / Location</th>
                      <th>Date</th>
                      <th>Ticket Price</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPickerEvents.map((event) => {
                      const eventPoster =
                        event.bannerImage ||
                        event.banner ||
                        event.imageUrl ||
                        event.image ||
                        event.venueImage;

                      return (
                        <tr
                          key={event.id}
                          className="clickable-row"
                          onClick={() => handleSelectEventForSlide(event)}
                        >
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
                              className="combo-select-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEventForSlide(event);
                              }}
                            >
                              Select Slide
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pickerTotalPages > 1 && (
              <div className="combo-pagination-bar">
                <span className="combo-pagination-info">
                  Showing {paginatedPickerEvents.length} of {filteredPickerEvents.length} events
                </span>
                <div className="combo-pagination-nav">
                  <button
                    className="combo-page-arrow-btn"
                    disabled={pickerCurrentPage === 1}
                    onClick={() => setPickerCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="combo-pagination-pages">
                    {getPaginationPages(pickerCurrentPage, pickerTotalPages).map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="combo-page-dots">...</span>
                      ) : (
                        <button
                          key={p}
                          className={`combo-page-number-btn ${pickerCurrentPage === p ? 'active' : ''}`}
                          onClick={() => setPickerCurrentPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="combo-page-arrow-btn"
                    disabled={pickerCurrentPage === pickerTotalPages}
                    onClick={() => setPickerCurrentPage((prev) => Math.min(pickerTotalPages, prev + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          Featured Events Picker Modal (Max 9)
          ======================================================== */}
      {featuredPickerOpen && (
        <div className="combo-picker-backdrop" onClick={() => setFeaturedPickerOpen(false)}>
          <div className="combo-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-picker-header">
              <div>
                <h3 className="combo-picker-title">Select Featured Events (Max 9)</h3>
                <p className="combo-picker-subtitle">
                  Click the star or checkbox to add or remove events from the featured section ({featuredEventIds.length}/9 selected).
                </p>
              </div>
              <button className="combo-picker-close-btn" onClick={() => setFeaturedPickerOpen(false)}>
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
                  value={featuredSearchQuery}
                  onChange={(e) => {
                    setFeaturedSearchQuery(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                  autoFocus
                />
                {featuredSearchQuery && (
                  <button
                    className="combo-clear-search-btn"
                    onClick={() => {
                      setFeaturedSearchQuery('');
                      setFeaturedCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="combo-filter-dropdown-wrapper">
                <select
                  className="combo-filter-select"
                  value={featuredCategoryFilter}
                  onChange={(e) => {
                    setFeaturedCategoryFilter(e.target.value);
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="combo-toggle-pills">
                <button
                  type="button"
                  className={`combo-toggle-pill ${featuredStarredFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setFeaturedStarredFilter('all');
                    setFeaturedCurrentPage(1);
                  }}
                >
                  All Events
                </button>
                <button
                  type="button"
                  className={`combo-toggle-pill ${featuredStarredFilter === 'starred' ? 'active' : ''}`}
                  onClick={() => {
                    setFeaturedStarredFilter('starred');
                    setFeaturedCurrentPage(1);
                  }}
                >
                  <Star size={13} fill={featuredStarredFilter === 'starred' ? '#ff6b00' : 'none'} />
                  Featured ({featuredEventIds.length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="combo-table-container">
              {paginatedFeaturedEvents.length === 0 ? (
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
                    {paginatedFeaturedEvents.map((event) => {
                      const isFeatured = featuredEventIds.includes(event.id);
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
                          onClick={() => handleToggleFeaturedEvent(event.id)}
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
                                handleToggleFeaturedEvent(event.id);
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
                Selected <strong>{featuredEventIds.length}</strong> / 9 max events
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {featuredTotalPages > 1 && (
                  <div className="combo-pagination-nav">
                    <button
                      className="combo-page-arrow-btn"
                      disabled={featuredCurrentPage === 1}
                      onClick={() => setFeaturedCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="combo-pagination-pages">
                      {getPaginationPages(featuredCurrentPage, featuredTotalPages).map((p, idx) =>
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="combo-page-dots">...</span>
                        ) : (
                          <button
                            key={p}
                            className={`combo-page-number-btn ${featuredCurrentPage === p ? 'active' : ''}`}
                            onClick={() => setFeaturedCurrentPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="combo-page-arrow-btn"
                      disabled={featuredCurrentPage === featuredTotalPages}
                      onClick={() => setFeaturedCurrentPage((prev) => Math.min(featuredTotalPages, prev + 1))}
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
                  onClick={() => setFeaturedPickerOpen(false)}
                >
                  Done ({featuredEventIds.length}/9)
                </button>
              </div>
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
