import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Ticket, 
  IndianRupee, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Clock, 
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { useDataContext } from '../../context/DataContext';
import { toDate } from '../../services/firebaseUtils';
import './HostDetails.css';

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (value?.seconds || typeof value?.toDate === 'function') {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : '-';
  }
  return String(value);
};

export default function HostDetails() {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const { cache, subscribeToModule } = useDataContext();
  const [activeTab, setActiveTab] = useState('events'); // events | bookings | participants
  const [hostDoc, setHostDoc] = useState(null);
  const [loadingHostDoc, setLoadingHostDoc] = useState(true);

  // Subscribe to the specific event_host document
  useEffect(() => {
    if (!hostId) return;
    const unsub = onSnapshot(
      doc(db, 'event_host', hostId),
      (snapshot) => {
        if (snapshot.exists()) {
          setHostDoc({ id: snapshot.id, ...snapshot.data() });
        } else {
          setHostDoc(null);
        }
        setLoadingHostDoc(false);
      },
      (err) => {
        console.error('Error fetching event_host doc:', err);
        setLoadingHostDoc(false);
      }
    );
    return () => unsub();
  }, [hostId]);

  // Subscribe to related collections for events, bookings, and participants
  useEffect(() => {
    subscribeToModule('all-events', 'events', []);
    subscribeToModule('all-bookings', 'event_bookings', []);
    subscribeToModule('all-participants', 'event_participants', []);
  }, [subscribeToModule]);

  const rawEvents = cache['all-events-[]']?.data || [];
  const rawBookings = cache['all-bookings-[]']?.data || [];
  const rawParticipants = cache['all-participants-[]']?.data || [];

  const loading = loadingHostDoc || cache['all-events-[]']?.loading;

  // Aggregate host profile and associated events
  const host = useMemo(() => {
    if (!hostId) return null;

    // Use host document data from event_host if available
    let hostName = hostDoc?.name || hostDoc?.displayName || hostDoc?.hostName || hostDoc?.title || '';
    let hostPhoto = hostDoc?.photoURL || hostDoc?.profilePhoto || hostDoc?.photo || hostDoc?.imageUrl || hostDoc?.avatar || '';
    let hostEmail = hostDoc?.email || hostDoc?.contactEmail || hostDoc?.hostEmail || '';
    let hostPhone = hostDoc?.phone || hostDoc?.phoneNumber || hostDoc?.contactPhone || hostDoc?.hostPhone || '';
    let hostCity = hostDoc?.city || hostDoc?.location || hostDoc?.address || '';
    let hostBio = hostDoc?.bio || hostDoc?.description || hostDoc?.about || '';

    // Find all events associated with this host
    const hostEvents = rawEvents.filter((event) => {
      const currentHostId = event.hostId || event.organizerId || event.vendorId;
      const matchesId = currentHostId === hostId;
      const matchesName = hostName && (event.hostName === hostName || event.organizerName === hostName);
      return matchesId || matchesName;
    });

    // Fallback info from event if event_host didn't have details
    if (!hostName && hostEvents.length > 0) {
      const firstEvent = hostEvents[0];
      hostName = firstEvent.hostName || firstEvent.organizerName || 'Nitroxx Host';
      hostPhoto = firstEvent.hostPhotoURL || firstEvent.organizerPhoto || '';
      hostEmail = firstEvent.hostEmail || '';
      hostPhone = firstEvent.hostPhone || '';
    }

    if (!hostName && !hostDoc) {
      return null;
    }

    const hostEventNames = new Set(hostEvents.map((e) => e.name || e.title).filter(Boolean));
    const hostEventIds = new Set(hostEvents.map((e) => e.id).filter(Boolean));

    // Match bookings
    const hostBookings = rawBookings.filter((booking) => 
      hostEventIds.has(booking.eventId) || hostEventNames.has(booking.eventName)
    );

    const revenue = hostBookings.reduce((sum, b) => sum + Number(b.amount || b.totalAmount || 0), 0);
    const ticketsBooked = hostBookings.reduce((sum, b) => sum + Number(b.tickets || b.ticketCount || 1), 0);

    // Match participants
    const hostParticipants = rawParticipants.filter((p) => 
      hostEventIds.has(p.eventId) || hostEventNames.has(p.eventName)
    );

    return {
      id: hostId,
      name: hostName || 'Unnamed Host',
      photo: hostPhoto,
      email: hostEmail || '-',
      phone: hostPhone || '-',
      city: hostCity,
      bio: hostBio,
      events: hostEvents,
      bookings: hostBookings,
      participants: hostParticipants,
      revenue,
      ticketsBooked
    };
  }, [hostId, hostDoc, rawEvents, rawBookings, rawParticipants]);

  if (loading) {
    return (
      <div className="host-details-page">
        <div className="enterprise-state card">Loading host activity...</div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="host-details-page">
        <div className="enterprise-state card">
          <h3>Host profile not found</h3>
          <p>No document exists in <code>event_host</code> for ID: <code>{hostId}</code>.</p>
          <button className="quick-add-btn" onClick={() => navigate('/events/hosts')}>
            Back to Hosts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="host-details-page">
      <div className="host-details-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/events/hosts')}>
            <ArrowLeft size={16} /> Back to Hosts
          </button>
          <div className="host-breadcrumb">
            Events / Hosts / <strong>{host.name}</strong>
          </div>
        </div>
        <span className="host-id-badge">ID: {host.id}</span>
      </div>

      {/* Host Hero Profile Section */}
      <section className="host-hero-card card">
        <div className="host-hero-left">
          {host.photo ? (
            <img src={host.photo} alt={host.name} className="host-avatar-xl" />
          ) : (
            <div className="host-avatar-xl-placeholder">{host.name.charAt(0).toUpperCase()}</div>
          )}
          <div className="host-profile-info">
            <h1>{host.name}</h1>
            <div className="host-meta-row">
              {host.email !== '-' && <span className="meta-item"><Mail size={14} /> {host.email}</span>}
              {host.phone !== '-' && <span className="meta-item"><Phone size={14} /> {host.phone}</span>}
              {host.city && <span className="meta-item"><MapPin size={14} /> {host.city}</span>}
            </div>
            {host.bio && <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 640 }}>{host.bio}</p>}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="host-stats-grid">
        <div className="host-stat card">
          <div className="stat-header">
            <Calendar size={20} className="icon-blue" />
            <span>Hosted Events</span>
          </div>
          <strong>{host.events.length}</strong>
        </div>
        <div className="host-stat card">
          <div className="stat-header">
            <Ticket size={20} className="icon-green" />
            <span>Tickets Sold</span>
          </div>
          <strong>{host.ticketsBooked}</strong>
        </div>
        <div className="host-stat card">
          <div className="stat-header">
            <IndianRupee size={20} className="icon-orange" />
            <span>Total Volume</span>
          </div>
          <strong className="text-orange">₹{host.revenue.toLocaleString()}</strong>
        </div>
      </section>

      {/* Details Tabs & Tables */}
      <div className="host-activity-card card">
        <div className="activity-tabs">
          <button 
            className={`activity-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({host.events.length})
          </button>
          <button 
            className={`activity-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({host.bookings.length})
          </button>
          <button 
            className={`activity-tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants ({host.participants.length})
          </button>
        </div>

        <div className="activity-content">
          {/* TAB 1: EVENTS */}
          {activeTab === 'events' && (
            <div className="host-table-wrap">
              {host.events.length === 0 ? (
                <div className="empty-tab-state">No events organized yet by this host.</div>
              ) : (
                <table className="host-activity-table">
                  <thead>
                    <tr>
                      <th>EVENT NAME</th>
                      <th>DATE</th>
                      <th>LOCATION</th>
                      <th>PRICE</th>
                      <th>CAPACITY</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.events.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <strong>{ev.title || ev.name || 'Untitled Event'}</strong>
                          {ev.category && <small className="event-cat">{ev.category}</small>}
                        </td>
                        <td>{formatValue(ev.startDate || ev.eventDate || ev.date)}</td>
                        <td>{ev.venue || ev.location || '-'}</td>
                        <td>₹{Number(ev.ticketPrice || 0).toLocaleString()}</td>
                        <td>{ev.capacity || '-'}</td>
                        <td>
                          <span className={`status-pill ${ev.status || 'published'}`}>
                            {ev.status || 'published'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-text-link"
                            onClick={() => navigate(`/events/${ev.id}`)}
                          >
                            View Event <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="host-table-wrap">
              {host.bookings.length === 0 ? (
                <div className="empty-tab-state">No bookings found for this host's events.</div>
              ) : (
                <table className="host-activity-table">
                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>EVENT</th>
                      <th>CUSTOMER</th>
                      <th>TICKETS</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><code>{booking.bookingId || booking.id.slice(0, 8)}</code></td>
                        <td><strong>{booking.eventName || 'Event'}</strong></td>
                        <td>
                          <div>{booking.customerName || booking.customer || 'Guest'}</div>
                          <small>{booking.customerEmail || booking.email}</small>
                        </td>
                        <td>{booking.tickets || booking.ticketCount || 1}</td>
                        <td>₹{Number(booking.amount || booking.totalAmount || 0).toLocaleString()}</td>
                        <td>{formatValue(booking.createdAt)}</td>
                        <td>
                          <span className={`status-pill ${booking.status || 'confirmed'}`}>
                            {booking.status || 'confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="host-table-wrap">
              {host.participants.length === 0 ? (
                <div className="empty-tab-state">No checked-in participants recorded.</div>
              ) : (
                <table className="host-activity-table">
                  <thead>
                    <tr>
                      <th>PARTICIPANT</th>
                      <th>EVENT</th>
                      <th>CHECK-IN TIME</th>
                      <th>BIKE MODEL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.participants.map((participant) => (
                      <tr key={participant.id}>
                        <td>
                          <strong>{participant.name || participant.participantName || 'Rider'}</strong>
                          <div><small>{participant.email || participant.phone}</small></div>
                        </td>
                        <td>{participant.eventName || '-'}</td>
                        <td>{formatValue(participant.checkInTime || participant.createdAt)}</td>
                        <td>{participant.bikeModel || participant.bike || 'Unspecified'}</td>
                        <td>
                          <span className="status-pill confirmed">
                            {participant.status || 'checked-in'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
