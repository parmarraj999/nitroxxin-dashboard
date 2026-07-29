import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowLeft, MapPin, Calendar, ShieldCheck, Ticket, Users, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './EventDetails.css';
import { getEvent, subscribeToEventBookings } from '../../services/firebaseService';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  useEffect(() => {
    if (!id) {
        setLoading(false);
        return;
    }
    
    // Fetch Event details
    getEvent(id).then(data => {
        setEvent(data);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });

    // Subscribe to bookings
    const unsubscribe = subscribeToEventBookings(id, (data) => {
        setBookings(data);
    }, (error) => {
        console.error("Failed to fetch bookings", error);
    });

    return () => unsubscribe && unsubscribe();
  }, [id]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">

          <div className="dashboard-header">
            <div className="header-left-flex">
              <button className="back-btn-blue" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h1 className="dashboard-title">Event details</h1>
                <p className="dashboard-subtitle">Manage listings, schedules, and active bookings.</p>
              </div>
            </div>
          </div>

          <div className="event-hero-banner">
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <span className="banner-tag">{event?.category || 'MOTORCYCLE RACING'}</span>
              <h2>{event?.title || event?.name || 'Unlimited Track Day 2026'}</h2>
              <div className="banner-meta">
                <div className="meta-icon-text">
                  <Calendar size={16} /> <span>{event?.dateText || event?.date || event?.startDate || 'Oct 28, 2026'}</span>
                </div>
                <div className="meta-icon-text">
                  <MapPin size={16} /> <span>{event?.location || event?.venue || event?.city || 'Le Mans, France'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="event-details-layout">

            <div className="event-left-col">

              <div className="event-info-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Event Overview</h3>
                <p className="event-description-text">
                  {event?.description || 'Experience the adrenaline of open track racing. Push your machine to the limit under the guidance of expert instructors. Track Day offers a safe, controlled environment to improve your cornering, braking, and overall racing lines. Included with passes are mechanical support, garage slots, and telemetry review sessions.'}
                </p>
              </div>

              <div className="event-venue-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Venue Location</h3>
                <div className="venue-flex">
                  <div className="venue-map-placeholder">

                    <div className="map-grid-pattern"></div>
                    <div className="map-marker-pin">
                      <MapPin size={24} className="text-orange" fill="#ea580c" />
                    </div>
                  </div>
                  <div className="venue-address-details">
                    <h4>{event?.venue || 'Circuit de la Sarthe'}</h4>
                    <p className="address-sub text-muted">{event?.location || '24 Hours of Le Mans Track'}</p>
                    <p className="address-full text-light">{event?.address || 'Place Luigi Chinetti, 72019 Le Mans, France'}</p>
                  </div>
                </div>
              </div>

              <div className="event-passes-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '20px' }}>Pass Types Available</h3>
                <div className="passes-stack">
                  <div className="pass-type-item">
                    <div className="pass-left">
                      <div className="pass-icon"><Ticket size={18} /></div>
                      <div>
                        <h4>VIP Pass</h4>
                        <p>Unlimited sessions, snack bar access, garage spot, track camera recordings.</p>
                      </div>
                    </div>
                    <div className="pass-right">
                      <span className="pass-price">$150.00</span>
                      <span className="pass-slots text-success-bold">Available</span>
                    </div>
                  </div>

                  <div className="pass-type-item">
                    <div className="pass-left">
                      <div className="pass-icon"><Ticket size={18} /></div>
                      <div>
                        <h4>General Admission</h4>
                        <p>Access to paddock area, general seating, and 2 track sessions.</p>
                      </div>
                    </div>
                    <div className="pass-right">
                      <span className="pass-price">$75.00</span>
                      <span className="pass-slots text-success-bold">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="event-right-col">

              <div className="event-actions-widget card-blue">
                <div className="widget-status-row">
                  <span className="status-indicator-dot green"></span>
                  <span className="widget-status-lbl">REGISTRATION ACTIVE</span>
                </div>

                <div className="widget-slots-progress">
                  <div className="slots-header">
                    <span>Slots Filled</span>
                    <strong>{event?.registeredCount || bookings.length} / {event?.capacity || 100}</strong>
                  </div>
                  <div className="widget-progress-bar">
                    <div className="widget-progress-fill" style={{ width: `${Math.min(((event?.registeredCount || bookings.length) / (event?.capacity || 100)) * 100, 100)}%` }}></div>
                  </div>
                  <p className="slots-warning text-orange-bold">Only 12 slots left!</p>
                </div>

                <div className="widget-price-tag">
                  <span className="price-lbl">STARTING FROM</span>
                  <h2 className="price-val">₹{event?.price || event?.priceText || '150.00'}</h2>
                </div>

                <div className="widget-buttons-stack">
                  <button className="primary-action-btn-blue">Edit Event Listing</button>
                  <button className="secondary-action-btn-blue">Close Registration</button>
                </div>
              </div>

              <div className="event-host-widget card-blue" onClick={() => navigate('/hosts')} style={{ cursor: 'pointer' }}>
                <h4 className="widget-title-small">Event Coordinator</h4>
                <div className="host-profile-flex">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Sterling" className="host-avatar-mini" />
                  <div>
                    <h4 className="host-name-mini">Alex Sterling</h4>
                    <p className="host-role-mini">Creative Director</p>
                  </div>
                </div>
                <div className="host-badge-footer">
                  <ShieldCheck size={16} className="text-success" />
                  <span>Lead Coordinator Assigned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="event-bookings-section" style={{ marginTop: '32px' }}>
            <div className="event-bookings-card card-blue">
              <div className="bookings-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="card-title-blue">Recent Bookings</h3>
                <div className="bookings-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '16px', fontSize: '14px', fontWeight: '500' }}>
                  <Users size={16} />
                  <span>{bookings.length} Bookings</span>
                </div>
              </div>

              <div className="bookings-table-container" style={{ overflowX: 'auto' }}>
                {bookings.length === 0 ? (
                  <div className="no-bookings-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>No bookings yet for this event.</p>
                  </div>
                ) : (
                  <table className="bookings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Attendee</th>
                        <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Tickets</th>
                        <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Join As</th>
                        <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Amount</th>
                        <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const totalTickets = (booking.attendeeCounts?.adults || 0) + (booking.attendeeCounts?.children || 0);
                        const isExpanded = expandedBookingId === booking.id;
                        return (
                          <React.Fragment key={booking.id}>
                            <tr 
                              className="booking-row-hover"
                              onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                              style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.5)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            >
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {isExpanded ? <ChevronUp size={16} style={{ color: '#38bdf8' }} /> : <ChevronDown size={16} style={{ color: '#94a3b8' }} />}
                                  <div className="booking-user" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="booking-name" style={{ fontWeight: '500', color: '#f8fafc' }}>{booking.attendee?.name || 'Guest'}</span>
                                    <span className="booking-email" style={{ fontSize: '13px', color: '#94a3b8' }}>{booking.attendee?.email || booking.attendee?.phone || ''}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px', color: '#e2e8f0' }}>{totalTickets} ({booking.attendeeCounts?.adults || 0}A, {booking.attendeeCounts?.children || 0}C)</td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', textTransform: 'capitalize' }}>
                                  {booking.joinAs || 'N/A'}
                                </span>
                              </td>
                              <td style={{ padding: '16px', fontWeight: '500', color: '#10b981' }}>₹{Number(booking.total || 0).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', background: booking.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: booking.status === 'Pending' ? '#f59e0b' : '#10b981' }}>
                                  {booking.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                                <td colSpan="5" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                  <div className="booking-details-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                      <h5 style={{ color: '#38bdf8', fontWeight: '600', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '6px' }}>Booking Summary</h5>
                                      <p style={{ margin: '6px 0' }}><strong style={{ color: '#94a3b8' }}>Booking ID:</strong> <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{booking.bookingId || booking.id}</span></p>
                                      <p style={{ margin: '6px 0' }}><strong style={{ color: '#94a3b8' }}>Booked On:</strong> {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleString('en-IN') : (booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000).toLocaleString('en-IN') : 'N/A')}</p>
                                      <p style={{ margin: '6px 0' }}><strong style={{ color: '#94a3b8' }}>Total Quantity:</strong> {totalTickets} Tickets</p>
                                      <p style={{ margin: '6px 0' }}><strong style={{ color: '#94a3b8' }}>Breakdown:</strong> {booking.attendeeCounts?.adults || 0} Adults, {booking.attendeeCounts?.children || 0} Children</p>
                                      <p style={{ margin: '6px 0' }}><strong style={{ color: '#94a3b8' }}>Extras:</strong> {booking.attendeeCounts?.pets || 0} Pets, {booking.attendeeCounts?.bags || 0} Bags</p>
                                    </div>
                                    
                                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                      <h5 style={{ color: '#38bdf8', fontWeight: '600', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '6px' }}>Attendee Details</h5>
                                      {booking.attendees && booking.attendees.length > 0 ? (
                                        booking.attendees.map((att, idx) => (
                                          <div key={idx} style={{ margin: '8px 0', padding: '6px 0', borderBottom: idx < booking.attendees.length - 1 ? '1px dashed rgba(255, 255, 255, 0.05)' : 'none' }}>
                                            <p style={{ margin: '2px 0', fontWeight: '500' }}>{att.name || 'N/A'}</p>
                                            <p style={{ margin: '2px 0', color: '#94a3b8', fontSize: '12px' }}>Contact: {att.contact || 'N/A'}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No guest details provided.</p>
                                      )}
                                    </div>

                                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                      <h5 style={{ color: '#38bdf8', fontWeight: '600', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '6px' }}>Bike Details</h5>
                                      {booking.bikeDetails && booking.bikeDetails.length > 0 ? (
                                        booking.bikeDetails.map((bike, idx) => (
                                          <div key={idx} style={{ margin: '8px 0', padding: '6px 0', borderBottom: idx < booking.bikeDetails.length - 1 ? '1px dashed rgba(255, 255, 255, 0.05)' : 'none' }}>
                                            <p style={{ margin: '2px 0', fontWeight: '500' }}>{bike.name || 'N/A'}</p>
                                            <p style={{ margin: '2px 0', color: '#94a3b8', fontSize: '12px' }}>Registration / Contact: {bike.contact || 'N/A'}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No bike details provided.</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventDetails;
