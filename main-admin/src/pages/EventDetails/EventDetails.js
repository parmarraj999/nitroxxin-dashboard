import React from 'react';
import { ArrowLeft, CalendarDays, IndianRupee, MapPin, Ticket, Users, ChevronRight, Clock } from 'lucide-react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import { toDate } from '../../services/firebaseUtils';
import './EventDetails.css';

const labelFor = (value = '') => value.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (value?.seconds || typeof value?.toDate === 'function') return toDate(value)?.toLocaleString() || '-';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') return Object.entries(value).map(([key, item]) => `${labelFor(key)}: ${formatValue(item)}`).join(' · ') || '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const renderEventValue = (key, value) => {
  if (value === undefined || value === null || value === '') return '-';

  const stringVal = String(value);
  const isUrl = stringVal.startsWith('http://') || stringVal.startsWith('https://');

  if (isUrl) {
    const isImage =
      /\.(jpeg|jpg|gif|png|webp|svg)/i.test(stringVal) ||
      key.toLowerCase().includes('image') ||
      key.toLowerCase().includes('photo') ||
      key.toLowerCase().includes('banner') ||
      key.toLowerCase().includes('logo') ||
      key.toLowerCase().includes('url');

    if (isImage) {
      return (
        <div className="event-detail-image-wrapper">
          <img src={stringVal} alt={labelFor(key)} className="event-detail-img" />
          <a href={stringVal} target="_blank" rel="noopener noreferrer" className="event-detail-small-link">
            View Image
          </a>
        </div>
      );
    } else {
      return (
        <a href={stringVal} target="_blank" rel="noopener noreferrer" className="event-detail-small-link">
          {stringVal}
        </a>
      );
    }
  }

  if (value?.seconds || typeof value?.toDate === 'function') return toDate(value)?.toLocaleString() || '-';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') return Object.entries(value).map(([k, item]) => `${labelFor(k)}: ${formatValue(item)}`).join(' · ') || '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return stringVal;
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = React.useState(null);
  const [bookings, setBookings] = React.useState([]);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const stopEvent = onSnapshot(doc(db, 'events', eventId), (snapshot) => {
      setEvent(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      setLoading(false);
    }, (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
    });

    const stopBookings = onSnapshot(collection(db, 'event_bookings'), (snapshot) => {
      const allBookings = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setBookings(allBookings.filter((booking) => booking.eventId === eventId || booking.eventName === event?.name));
    }, (snapshotError) => setError(snapshotError.message));

    return () => { stopEvent(); stopBookings(); };
  }, [eventId, event?.name]);

  const confirmedBookings = bookings.filter((booking) => String(booking.status).toLowerCase() === 'confirmed');
  const ticketsBooked = bookings.reduce((total, booking) => total + Number(booking.tickets || booking.ticketCount || 1), 0);
  const bookingRevenue = bookings.reduce((total, booking) => total + Number(booking.amount || booking.totalAmount || 0), 0);

  if (loading) return <div className="event-details-page"><div className="enterprise-state card">Loading event...</div></div>;
  if (!event) return <div className="event-details-page"><div className="enterprise-state card"><h3>Event not found</h3><button className="quick-add-btn" onClick={() => navigate('/events')}>Back to Events</button></div></div>;

  const bannerImage = event.bannerImage || event.banner || event.imageUrl || event.image;
  const hostId = event.hostId || event.organizerId || event.vendorId;
  const hostName = event.hostName || event.organizerName || "Nitroxx Partner";
  const hostPhoto = event.hostPhotoURL || event.organizerPhoto;

  const standardFields = new Set([
    'id', 'name', 'title', 'bannerImage', 'banner', 'imageUrl', 'image',
    'date', 'eventDate', 'startsAt', 'startDate', 'dateText', 'dateTimeText',
    'location', 'locationName', 'venue', 'address', 'price', 'ticketPrice', 'priceText',
    'category', 'categoryName', 'capacity', 'status', 'description', 'shortDescription',
    'hostId', 'organizerId', 'vendorId', 'hostName', 'organizerName', 'hostPhotoURL', 'organizerPhoto'
  ]);

  const rawMetadata = Object.entries(event).filter(([key]) => !standardFields.has(key));

  return (
    <div className="event-details-page">
      <div className="event-details-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/events')}><ArrowLeft size={16} /> Back to Events</button>
          <div className="event-breadcrumb">Events / <strong>{event.title || event.name || 'Untitled Event'}</strong></div>
        </div>
        <span className={`event-status ${String(event.status || 'draft').toLowerCase()}`}>{event.status || 'draft'}</span>
      </div>

      {error && <div className="enterprise-toast error event-error"><span>{error}</span></div>}

      <div className="event-details-layout">

        {/* Left Column: Main event details */}
        <div className="event-details-main">

          {/* Banner Image Card */}
          {bannerImage && (
            <div className="event-banner-card card">
              <img src={bannerImage} alt={event.title || event.name} className="event-detail-banner-img" />
            </div>
          )}

          {/* Description Card */}
          <div className="event-description-card card">
            <h2>About Event</h2>
            <p className="event-desc-text">
              {event.description || event.shortDescription || 'No event description has been added.'}
            </p>
          </div>

          {/* Core Info Specs Grid */}
          <div className="event-specifications-card card">
            <h2>Event Information</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Date & Time</span>
                <strong className="spec-value">
                  {formatValue(event.eventDate || event.date || event.startDate)}
                </strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Venue / Location</span>
                <strong className="spec-value">
                  {event.venue || event.location || 'TBD'}
                </strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Ticket Price</span>
                <strong className="spec-value">
                  ₹{Number(event.ticketPrice || event.price || 0).toLocaleString()}
                </strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Capacity</span>
                <strong className="spec-value">
                  {event.capacity ? `${event.capacity} spots` : 'Unlimited'}
                </strong>
              </div>
              {event.category && (
                <div className="spec-item">
                  <span className="spec-label">Category</span>
                  <strong className="spec-value">{event.category}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          {hostId && (
            <div className="event-organizer-card card">
              <h2>Event Organizer</h2>
              <div className="organizer-profile-wrapper">
                {hostPhoto ? (
                  <img src={hostPhoto} alt={hostName} className="organizer-avatar-img" />
                ) : (
                  <div className="organizer-avatar-placeholder">{hostName.charAt(0)}</div>
                )}
                <div className="organizer-profile-details">
                  <h3>{hostName}</h3>
                  <button
                    className="view-host-profile-btn"
                    onClick={() => navigate(`/events/hosts/${hostId}`)}
                  >
                    View Host Profile & Activity <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Raw System Metadata */}
          {rawMetadata.length > 0 && (
            <div className="event-metadata-card card">
              <h2>System Specifications</h2>
              <div className="metadata-grid">
                {rawMetadata.map(([key, value]) => (
                  <div className="metadata-item" key={key}>
                    <span className="meta-label">{labelFor(key)}</span>
                    <strong className="meta-value">{renderEventValue(key, value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Capacity, Volume, Summary */}
        <aside className="event-details-aside">

          <div className="event-sales-summary card">
            <h2>Registration Metrics</h2>

            <div className="aside-metric-row">
              <div className="aside-metric-item">
                <span>Bookings</span>
                <strong>{bookings.length}</strong>
              </div>
              <div className="aside-metric-item">
                <span>Tickets Booked</span>
                <strong>{ticketsBooked}</strong>
              </div>
            </div>

            <div className="capacity-progress-wrapper">
              <div className="capacity-progress-label">
                <span>Capacity Filled</span>
                <span>{event.capacity ? `${Math.round((ticketsBooked / Number(event.capacity)) * 100)}%` : 'N/A'}</span>
              </div>
              <div className="capacity-progress-bar">
                <div
                  className="capacity-progress-fill"
                  style={{ width: `${event.capacity ? Math.min((ticketsBooked / Number(event.capacity)) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <small className="capacity-desc">
                {event.capacity ? `${Math.max(Number(event.capacity) - ticketsBooked, 0)} spots remaining` : 'Unlimited capacity'}
              </small>
            </div>

            <div className="revenue-summary-box">
              <span>Total Revenue</span>
              <strong>₹{bookingRevenue.toLocaleString()}</strong>
            </div>
          </div>

          <div className="aside-actions-card card">
            <h2>Quick Actions</h2>
            <button className="aside-action-btn primary" onClick={() => window.print()}>
              Print Event Ledger
            </button>
            <button className="aside-action-btn secondary" onClick={() => navigate('/events')}>
              Back to Listing
            </button>
          </div>
        </aside>
      </div>

      <section className="event-card card">
        <div className="event-section-heading"><div><h2>Event Bookings</h2><p>Live bookings linked to this event.</p></div><span>{bookings.length} total</span></div>
        {bookings.length === 0 ? <div className="soft-empty">No bookings have been made for this event yet.</div> : <div className="event-bookings-wrap"><table className="event-bookings-table"><thead><tr><th>Booking ID</th><th>Participant</th><th>Tickets</th><th>Amount</th><th>Status</th><th>Booked On</th><th></th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td>{booking.bookingId || booking.id}</td><td>{booking.customer || booking.customerName || booking.userName || '-'}</td><td>{booking.tickets || booking.ticketCount || 1}</td><td>₹{Number(booking.amount || booking.totalAmount || 0).toLocaleString()}</td><td><span className={`event-status ${String(booking.status || 'pending').toLowerCase()}`}>{booking.status || 'pending'}</span></td><td>{formatValue(booking.createdAt || booking.bookedAt || booking.bookingDate)}</td><td><button className="booking-details-button" onClick={() => setSelectedBooking(booking)}>Details</button></td></tr>)}</tbody></table></div>}
      </section>

      {selectedBooking && <section className="event-card card"><div className="event-section-heading"><div><h2>Booking Details</h2><p>{selectedBooking.bookingId || selectedBooking.id}</p></div><button className="booking-details-button" onClick={() => setSelectedBooking(null)}>Close</button></div><div className="event-details-grid">{Object.entries(selectedBooking).filter(([key]) => key !== 'id').map(([key, value]) => <div className="event-detail" key={key}><span>{labelFor(key)}</span><strong>{formatValue(value)}</strong></div>)}</div></section>}
    </div>
  );
};

export default EventDetails;
