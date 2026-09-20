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

  // Subscribe to collections
  useEffect(() => {
    subscribeToModule('all-events', 'events', []);
    subscribeToModule('all-bookings', 'event_bookings', []);
    subscribeToModule('all-participants', 'event_participants', []);
  }, [subscribeToModule]);

  const rawEvents = cache['all-events-[]']?.data || [];
  const rawBookings = cache['all-bookings-[]']?.data || [];
  const rawParticipants = cache['all-participants-[]']?.data || [];

  const loading = cache['all-events-[]']?.loading || cache['all-bookings-[]']?.loading;

  // Aggregate and find this specific host
  const host = useMemo(() => {
    if (!hostId) return null;

    // Find the host name/details from the events
    let hostName = '';
    let hostPhoto = '';
    let hostEmail = '';
    let hostPhone = '';
    const hostEvents = [];
    const hostBookings = [];
    let revenue = 0;
    let ticketsBooked = 0;

    rawEvents.forEach((event) => {
      const currentHostId = event.hostId || event.organizerId || event.vendorId || 'nitroxx-default-vendor';
      if (currentHostId === hostId) {
        if (!hostName) {
          hostName = event.hostName || event.organizerName || (hostId === 'nitroxx-default-vendor' ? 'Nitroxx Main' : 'Nitroxx Partner');
          hostPhoto = event.hostPhotoURL || event.organizerPhoto || '';
          hostEmail = event.hostEmail || `${hostName.toLowerCase().replace(/[^a-z0-9]/g, '')}@nitroxxin.com`;
          hostPhone = event.hostPhone || '+91 98765 00000';
        }
        hostEvents.push(event);
      }
    });

    // If we found no events, check if this is the default host to prevent empty screen
    if (!hostName && hostId === 'nitroxx-default-vendor') {
      hostName = 'Nitroxx Main';
      hostEmail = 'admin@nitroxxin.com';
      hostPhone = '+91 98765 00000';
    }

    rawBookings.forEach((booking) => {
      const event = rawEvents.find(e => e.id === booking.eventId || e.name === booking.eventName);
      if (event) {
        const currentHostId = event.hostId || event.organizerId || event.vendorId || 'nitroxx-default-vendor';
        if (currentHostId === hostId) {
          hostBookings.push(booking);
          revenue += Number(booking.amount || booking.totalAmount || 0);
          ticketsBooked += Number(booking.tickets || booking.ticketCount || 1);
        }
      }
    });

    const hostEventNames = new Set(hostEvents.map(e => e.name).filter(Boolean));
    const hostEventIds = new Set(hostEvents.map(e => e.id).filter(Boolean));
    const hostParticipants = rawParticipants.filter(p => 
      hostEventIds.has(p.eventId) || hostEventNames.has(p.eventName)
    );

    return {
      id: hostId,
      name: hostName || 'Nitroxx Partner',
      photo: hostPhoto,
      email: hostEmail,
      phone: hostPhone,
      events: hostEvents,
      bookings: hostBookings,
      participants: hostParticipants,
      revenue,
      ticketsBooked
    };
  }, [hostId, rawEvents, rawBookings, rawParticipants]);

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
            <div className="host-avatar-xl-placeholder">{host.name.charAt(0)}</div>
          )}
          <div className="host-profile-info">
            <h1>{host.name}</h1>
            <div className="host-meta-row">
              <span className="meta-item"><Mail size={14} /> {host.email}</span>
              <span className="meta-item"><Phone size={14} /> {host.phone}</span>
            </div>
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
            Participants Attendance ({host.participants.length})
          </button>
        </div>

        <div className="activity-tab-content">
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="activity-table-wrap">
              {host.events.length === 0 ? (
                <div className="empty-activity-state">No events organized yet.</div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>EVENT NAME</th>
                      <th>VENUE</th>
                      <th>EVENT DATE</th>
                      <th>TICKET PRICE</th>
                      <th>CAPACITY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.events.map((event) => (
                      <tr 
                        key={event.id} 
                        className="clickable-activity-row"
                        onClick={() => navigate(`/events/${event.id}`)}
                        title="Click to view event details"
                      >
                        <td>
                          <div className="name-with-link">
                            <strong>{event.name || 'Untitled Event'}</strong>
                            <ExternalLink size={12} className="link-icon" />
                          </div>
                        </td>
                        <td>{event.venue || 'TBD'}</td>
                        <td>
                          <span className="datetime-cell">
                            <Clock size={12} /> {formatValue(event.eventDate || event.date)}
                          </span>
                        </td>
                        <td>₹{Number(event.ticketPrice || event.price || 0).toLocaleString()}</td>
                        <td>{event.capacity || '-'}</td>
                        <td>
                          <span className={`tag status-tag ${String(event.status || 'draft').toLowerCase()}`}>
                            {event.status || 'draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="activity-table-wrap">
              {host.bookings.length === 0 ? (
                <div className="empty-activity-state">No bookings recorded yet.</div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>PARTICIPANT</th>
                      <th>TICKETS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>BOOKED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><span className="mono-code">{booking.bookingId || booking.id.slice(0, 12)}</span></td>
                        <td><strong>{booking.customer || booking.customerName || booking.userName || '-'}</strong></td>
                        <td>{booking.tickets || booking.ticketCount || 1}</td>
                        <td><strong>₹{Number(booking.amount || booking.totalAmount || 0).toLocaleString()}</strong></td>
                        <td>
                          <span className={`tag status-tag ${String(booking.status || 'confirmed').toLowerCase()}`}>
                            {booking.status || 'confirmed'}
                          </span>
                        </td>
                        <td>{formatValue(booking.createdAt || booking.bookedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="activity-table-wrap">
              {host.participants.length === 0 ? (
                <div className="empty-activity-state">No participants registered yet.</div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>RIDER NAME</th>
                      <th>EVENT NAME</th>
                      <th>CONTACT PHONE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.participants.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td><strong>{p.name || 'Anonymous Rider'}</strong></td>
                        <td>{p.eventName || 'Group Ride'}</td>
                        <td>{p.phone || '-'}</td>
                        <td>
                          <span className={`tag checkin-tag ${String(p.checkInStatus || 'registered').toLowerCase()}`}>
                            {p.checkInStatus === 'checked_in' ? 'Checked In' : p.checkInStatus || 'Registered'}
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
