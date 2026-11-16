import React, { useMemo, useEffect, useState } from 'react';
import { ChevronLeft, Bookmark } from 'lucide-react';
import './LiveMobilePrototype.css';

// Premade iPhone chassis image location in assets
const CHASSIS_PNG_PATH = `${process.env.PUBLIC_URL || ''}/assets/images/iphone_chassis.png`;

// Default night-ride gallery photos matching the reference screenshot aesthetics
const DEFAULT_GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80', // Night headlight rider
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80', // Dark sportbike silhouette
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=400&q=80', // Fuel station / city night ride
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=400&q=80', // Exhaust & rear wheel
];

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85';

/**
 * Formats date and time strings into the exact screenshot style (e.g. "Thu, 10 Dec, 5:30 am")
 */
const formatPreviewDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 'Thu, 10 Dec, 5:30 am';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.toLocaleDateString('en-US', { day: 'numeric' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });

    let formattedTime = '';
    if (timeStr) {
      const parts = timeStr.split(':');
      const hourNum = parseInt(parts[0], 10);
      const minutes = parts[1] || '00';
      if (!isNaN(hourNum)) {
        const ampm = hourNum >= 12 ? 'pm' : 'am';
        const hour12 = hourNum % 12 || 12;
        formattedTime = `, ${hour12}:${minutes} ${ampm}`;
      }
    }
    return `${weekday}, ${day} ${month}${formattedTime}`;
  } catch {
    return dateStr;
  }
};

const LiveMobilePrototype = ({ form = {}, files = {} }) => {
  const [chassisSrc, setChassisSrc] = useState(CHASSIS_PNG_PATH);

  // Live banner object URL tracking
  const [bannerBlobUrl, setBannerBlobUrl] = useState(null);

  useEffect(() => {
    if (files?.banner && typeof window !== 'undefined') {
      try {
        const url = URL.createObjectURL(files.banner);
        setBannerBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Could not create banner blob URL:', e);
      }
    } else {
      setBannerBlobUrl(null);
    }
  }, [files?.banner]);

  // Live gallery URLs tracking
  const [galleryBlobUrls, setGalleryBlobUrls] = useState([]);

  useEffect(() => {
    if (files?.gallery && files.gallery.length && typeof window !== 'undefined') {
      try {
        const createdUrls = files.gallery.map((f) => URL.createObjectURL(f));
        setGalleryBlobUrls(createdUrls);
        return () => createdUrls.forEach((u) => URL.revokeObjectURL(u));
      } catch (e) {
        console.warn('Could not create gallery blob URLs:', e);
      }
    } else {
      setGalleryBlobUrls([]);
    }
  }, [files?.gallery]);

  // Resolve final banner image
  const displayBanner = bannerBlobUrl || form?.bannerImage || DEFAULT_BANNER;

  // Resolve gallery photos (uploaded files -> saved galleryImages -> default fallback)
  const displayGallery = useMemo(() => {
    const combined = [...galleryBlobUrls, ...(form?.galleryImages || [])].filter(Boolean);
    if (combined.length > 0) return combined;
    return DEFAULT_GALLERY_PHOTOS;
  }, [galleryBlobUrls, form?.galleryImages]);

  // Title
  const title = form?.title?.trim() || 'Moonlight Ride to Mandu Fort';

  // Category
  const category = form?.category || 'Night Rides';

  // Check Sold Out status
  const isSoldOut = form?.status === 'Sold Out' || form?.status === 'Sold';

  // Date and Time
  const dateTimeDisplay = formatPreviewDateTime(form?.startDate, form?.startTime);

  // Venue & Location
  const locationDisplay = useMemo(() => {
    const parts = [form?.venue, form?.city, form?.state].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(', ');
    }
    return 'Phoenix Citadel Mall Parking, indore, madhya pradesh';
  }, [form?.venue, form?.city, form?.state]);

  // Description / About
  const aboutText =
    form?.description?.trim() ||
    'Join 150+ riders for a safe and organized night ride from Indore to Mandu. Police permissions secured. Ride captains, backup vehicle, first aid and refreshments included.';

  // Itinerary items
  const itineraryItems = useMemo(() => {
    if (Array.isArray(form?.itinerary) && form.itinerary.length > 0) {
      return form.itinerary;
    }
    return [
      {
        id: 'default-day-1',
        title: 'Flag-off & Assembly',
        text: 'Assembly at Citadel Mall parking, safety gear check, rider briefing by captains.',
        stage: 'Day 1',
      },
    ];
  }, [form?.itinerary]);

  // Price calculation
  const priceDisplay = useMemo(() => {
    if (form?.ticketType === 'Free') return 'Free';
    if (Array.isArray(form?.packages) && form.packages.length > 0) {
      const validPrices = form.packages
        .map((p) => Number(p.price))
        .filter((n) => !isNaN(n) && n >= 0);
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        return minPrice === 0 ? 'Free' : `₹${minPrice.toLocaleString('en-IN')}`;
      }
    }
    return '₹699';
  }, [form?.ticketType, form?.packages]);

  return (
    <div className="mobile-prototype-container">
      {/* Device Mockup Frame (433 × 885 Aspect Ratio of iphone_chassis.png) */}
      <div className="iphone-mockup-frame">
        {/* Premade iPhone Chassis PNG Overlay with transparent screen area */}
        <img
          src={chassisSrc}
          alt="iPhone Chassis"
          className="iphone-chassis-png-overlay"
          onError={() => {
            if (chassisSrc !== '/assets/images/iphone_chassis.png') {
              setChassisSrc('/assets/images/iphone_chassis.png');
            }
          }}
        />

        {/* Scrollable Screen Content (rendered precisely inside transparent screen area) */}
        <div className="iphone-screen-viewport">
          {/* Top Floating Action Buttons (Back + Bookmark) flanking Dynamic Island */}
          <div className="screen-floating-header">
            <button type="button" className="floating-circle-btn" title="Back">
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button type="button" className="floating-circle-btn" title="Bookmark event">
              <Bookmark size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Hero Banner Image */}
          <div className="iphone-banner-wrap">
            <img src={displayBanner} alt={title} className="iphone-banner-img" />
            <div className="iphone-banner-overlay" />
            {!files?.banner && !form?.bannerImage && (
              <div className="iphone-banner-watermark">
                <span>RIDE THE TIDES</span>
                <strong>OF THE MOON</strong>
              </div>
            )}
          </div>

          {/* Horizontal Gallery Thumbnails (Row of 4+) */}
          <div className="iphone-gallery-strip">
            {displayGallery.slice(0, 6).map((imgUrl, idx) => (
              <div key={idx} className="iphone-thumb-card">
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="iphone-thumb-img" />
              </div>
            ))}
          </div>

          {/* Event Title */}
          <h2 className="iphone-event-title">{title}</h2>

          {/* Category & Date Badges Row */}
          <div className="iphone-badge-row">
            <span className="iphone-pill-category">{category}</span>
            <span className="iphone-pill-date">{dateTimeDisplay}</span>
            {isSoldOut && <span className="iphone-pill-sold">Sold Out</span>}
          </div>

          {/* Location line with vertical bar indicator */}
          <div className="iphone-location-row">
            <span className="location-bar-pip">|</span>
            <span className="location-text">{locationDisplay}</span>
          </div>

          {/* About Section */}
          <div className="iphone-content-section">
            <h3 className="iphone-section-heading">About</h3>
            <p className="iphone-about-text">{aboutText}</p>
          </div>

          {/* Itinerary Section */}
          <div className="iphone-content-section">
            <div className="itinerary-header-row">
              <h3 className="iphone-section-heading">Itinerary</h3>
              <div className="itinerary-header-line" />
            </div>

            <div className="iphone-itinerary-list">
              {itineraryItems.map((item, index) => (
                <div key={item.id || index} className="iphone-itinerary-card">
                  <div className="itinerary-card-top">
                    <span className="itinerary-info-tag">INFO</span>
                    <span className="itinerary-day-label">Day {item.day || index + 1}</span>
                  </div>
                  <p className="itinerary-card-desc">
                    {item.title || item.text || 'Assembly, registration check-in, and stage flag-off.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Bike Requirement Pill (if applicable) */}
          {form?.specificBikeRequired && form?.bikeBrand && (
            <div className="iphone-bike-req-pill">
              <span>🏍️ Required Bike:</span>
              <strong>
                {form.bikeBrand} {form.bikeModel} {form.bikeEngineCC ? `(${form.bikeEngineCC}cc)` : ''}
              </strong>
            </div>
          )}

          {/* Bottom Sticky Action Bar */}
          <div className="iphone-bottom-bar">
            <div className="bottom-bar-price-block">
              <span className="price-label">Starts from</span>
              <span className="price-value">{priceDisplay}</span>
            </div>
            <button
              type="button"
              className={`iphone-book-btn ${isSoldOut ? 'sold-out' : ''}`}
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Sold Out' : 'Book Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMobilePrototype;
