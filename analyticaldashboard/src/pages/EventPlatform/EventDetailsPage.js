import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  Eye,
  IndianRupee,
  MapPin,
  Megaphone,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Share2,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import {
  deleteEvent,
  duplicateEvent,
  incrementEventView,
  registerForEvent,
  subscribeToEvent,
  subscribeToEventBookings,
  toggleBookmark,
  updateEvent,
  updateEventBookingStatus,
  updateRegistration,
} from '../../services/firebaseService';
import { currency, downloadCsv, formatDate, formatDateTime } from '../../utils/formatters';
import './EventPlatform.css';
import './EventManagementFlow.css';
import '../Auth/Auth.css';

const colors = ['#e11d48', '#2563eb', '#0f766e', '#f59e0b', '#7c3aed'];
const tabs = ['Overview', 'Bookings', 'Participants', 'Tickets', 'Finance', 'Timeline'];

const getBookingAmount = (booking) => Number(booking.total || booking.amount || booking.amountPaid || booking.ticketPrice || 0);
const getRegistrationAmount = (entry) => Number(entry.amount || entry.totalAmount || entry.ticketPrice || entry.price || 0);

const asDate = (value) => {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [participant, setParticipant] = useState({ fullName: '', email: '', phone: '', age: '', gender: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  console.log(bookings)
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { registrations } = useRegistrations({ eventId });
  const { events: relatedEvents } = useEvents({ status: 'Published', category: event?.category });

  useEffect(() => {
    setParticipant({
      fullName: profile?.fullName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      age: '',
      gender: '',
      city: profile?.city || '',
    });
  }, [profile?.city, profile?.email, profile?.fullName, profile?.phone, user?.email]);

  useEffect(() => {
    if (!eventId) return undefined;
    incrementEventView(eventId).catch(() => {});
    return subscribeToEvent(
      eventId,
      (item) => {
        setEvent(item);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return undefined;
    return subscribeToEventBookings(eventId, setBookings, (err) => setError(err.message));
  }, [eventId]);

  const isHost = event?.hostId === user?.uid;

  const analytics = useMemo(() => {
    const confirmedBookings = bookings.filter((booking) => ['approved', 'confirmed', 'paid'].includes(String(booking.status || '').toLowerCase())).length;
    const pendingBookings = bookings.filter((booking) => ['pending', 'created'].includes(String(booking.status || '').toLowerCase())).length;
    const cancelledBookings = bookings.filter((booking) => ['cancelled', 'rejected'].includes(String(booking.status || '').toLowerCase())).length;
    const checkedIn = registrations.filter((entry) => entry.attendanceStatus === 'Checked In').length;
    const revenueFromBookings = bookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
    const revenueFromRegistrations = registrations.reduce((sum, entry) => sum + getRegistrationAmount(entry), 0);
    const revenue = Number(event?.revenue || 0) || revenueFromBookings || revenueFromRegistrations;
    const capacity = Number(event?.capacity || 0);
    const sold = Number(event?.registeredCount || registrations.length || bookings.length || 0);
    const platformFees = Math.round(revenue * 0.08);
    const taxes = Math.round(revenue * 0.18);
    const sourceData = [
      { name: 'Direct', value: Number(event?.views || 0) },
      { name: 'Bookings', value: bookings.length },
      { name: 'Registrations', value: registrations.length },
    ].filter((item) => item.value > 0);

    return {
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      checkedIn,
      noShows: Math.max(0, sold - checkedIn),
      revenue,
      capacity,
      sold,
      fillRate: capacity ? Math.round((sold / capacity) * 100) : 0,
      attendanceRate: sold ? Math.round((checkedIn / sold) * 100) : 0,
      conversionRate: event?.views ? Math.round((sold / Number(event.views)) * 100) : 0,
      platformFees,
      taxes,
      organizerEarnings: Math.max(0, revenue - platformFees - taxes),
      sourceData,
      ticketData: [
        { name: event?.ticketType || 'General', sold, remaining: Math.max(0, capacity - sold), revenue },
      ],
    };
  }, [bookings, event, registrations]);

  const registrationClosed = useMemo(() => {
    if (!event) return true;
    const end = asDate(event.registrationEnd);
    return event.status !== 'Published' || (end && end < new Date()) || analytics.fillRate >= 100;
  }, [analytics.fillRate, event]);

  const submitRegistration = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await registerForEvent({
        eventId: event.id,
        hostId: event.hostId,
        userId: user.uid,
        participant,
        ticketPrice: event.ticketPrice,
      });
      setMessage('Registration confirmed. Your ticket number is saved in registrations.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeBookingStatus = async (booking, next) => {
    try {
      await updateEventBookingStatus({
        bookingId: booking.id,
        registrationId: booking.registrationId || `${booking.eventId}_${booking.userId}_${booking.id}`,
        ...next,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const changeEventStatus = async (status) => {
    await updateEvent(event.id, { status });
    setMessage(`Event status updated to ${status}.`);
  };

  const exportEventReport = () => {
    downloadCsv(
      `${event.title || 'event'}-participants.csv`,
      registrations.map((entry) => ({
        registrationId: entry.registrationId || entry.id,
        name: entry.participantName,
        email: entry.participantEmail,
        phone: entry.participantPhone,
        ticketNumber: entry.ticketNumber,
        status: entry.status,
        attendanceStatus: entry.attendanceStatus,
        registrationDate: formatDateTime(entry.registrationDate),
        amount: getRegistrationAmount(entry),
      }))
    );
  };

  const copyEventLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setMessage('Event link copied.');
  };

  const removeEvent = async () => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    await deleteEvent(event.id);
    navigate('/events');
  };

  if (loading) return <AppLayout><LoadingState label="Loading event details" /></AppLayout>;
  if (!event) return <AppLayout><EmptyState title="Event not found" action={<button className="primary-btn" onClick={() => navigate('/explore')}>Browse events</button>} /></AppLayout>;

  return (
    <AppLayout searchPlaceholder="Search this event, bookings, participants, payments, or tickets">
      <main className="page-shell event-command-center">
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <section className="event-command-hero">
          <img src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80'} alt={event.title} />
          <div className="event-command-overlay">
            <div className="event-command-title">
              <img src={event.thumbnailImage || event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=240&q=80'} alt={event.title} />
              <div>
                <div className="badge-row">
                  <span className={`badge ${event.status === 'Published' ? 'success' : event.status === 'Cancelled' ? 'danger' : 'warning'}`}>{event.status || 'Draft'}</span>
                  <span className="badge">{event.ticketType || 'General'}</span>
                  {event.featured && <span className="badge success">Featured</span>}
                </div>
                <h1>{event.title}</h1>
                <p>{event.category || 'Uncategorized'} hosted by {event.hostName || event.organizerName || 'Nitroxx Host'}</p>
              </div>
            </div>
            <div className="event-command-actions">
              <button className="ghost-btn" onClick={copyEventLink}><Copy size={16} /> Copy Link</button>
              <button className="ghost-btn" onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}><Share2 size={16} /> Share</button>
              {isHost && <Link className="secondary-btn" to={`/events/${event.id}/edit`}><Edit size={16} /> Quick Edit</Link>}
            </div>
          </div>
        </section>

        <section className="event-meta-strip">
          <div><span>Event ID</span><strong>{event.eventId || event.id}</strong></div>
          <div><span>Date</span><strong>{formatDate(event.startDate)}</strong></div>
          <div><span>Location</span><strong>{event.city || event.venue || 'Not set'}</strong></div>
          <div><span>Visibility</span><strong>{event.visibility || 'Public'}</strong></div>
          <div><span>Updated</span><strong>{formatDateTime(event.updatedAt)}</strong></div>
        </section>

        {isHost && (
          <section className="quick-action-rail">
            <button className="ghost-btn" onClick={() => changeEventStatus('Published')}><PlayCircle size={16} /> Publish</button>
            <button className="ghost-btn" onClick={() => changeEventStatus('Draft')}><PauseCircle size={16} /> Pause Booking</button>
            <button className="ghost-btn" onClick={() => changeEventStatus('Completed')}><CheckCircle2 size={16} /> Close Booking</button>
            <button className="ghost-btn" onClick={() => duplicateEvent(event)}><Copy size={16} /> Duplicate</button>
            <button className="ghost-btn" onClick={exportEventReport}><Download size={16} /> Reports</button>
            <button className="ghost-btn"><Megaphone size={16} /> Broadcast</button>
            <button className="danger-btn" onClick={removeEvent}><Trash2 size={16} /> Delete</button>
          </section>
        )}

        <section className="ops-metric-grid sticky-summary">
          <div className="ops-metric"><Eye size={18} /><span>Total Views</span><strong>{event.views || 0}</strong><p>{analytics.conversionRate}% conversion</p></div>
          <div className="ops-metric"><Ticket size={18} /><span>Bookings</span><strong>{analytics.sold}</strong><p>{analytics.fillRate}% capacity sold</p></div>
          <div className="ops-metric"><Users size={18} /><span>Check-ins</span><strong>{analytics.checkedIn}</strong><p>{analytics.attendanceRate}% attendance</p></div>
          <div className="ops-metric"><IndianRupee size={18} /><span>Revenue</span><strong>{currency(analytics.revenue)}</strong><p>{currency(analytics.organizerEarnings)} organizer net</p></div>
        </section>

        <nav className="event-tabs">
          {tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </nav>

        {activeTab === 'Overview' && (
          <section className="event-command-grid">
            <div className="panel chart-panel">
              <div className="panel-title-row"><div><h2>Sales Funnel</h2><p className="muted">Views, bookings, and registration movement.</p></div></div>
              {analytics.sourceData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.sourceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#e11d48" radius={[8, 8, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <EmptyState title="No funnel activity yet" />}
            </div>
            <div className="panel chart-panel">
              <div className="panel-title-row"><div><h2>Attendance Mix</h2><p className="muted">Checked-in vs pending attendees.</p></div></div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={[{ name: 'Checked In', value: analytics.checkedIn }, { name: 'No Show/Pending', value: analytics.noShows }]} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100}>
                    {[0, 1].map((index) => <Cell key={index} fill={colors[index]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="panel detail-panel">
              <h2>Event Overview</h2>
              <p className="muted">{event.description || event.fullDescription || 'No event description published.'}</p>
              <div className="event-meta">
                <span><Calendar size={14} /> {formatDate(event.startDate)} {event.startTime} - {event.endTime}</span>
                <span><MapPin size={14} /> {event.venue}, {event.address}, {event.city}, {event.state}</span>
                <span><Users size={14} /> {analytics.sold} / {analytics.capacity || 'Unlimited'} participants</span>
              </div>
              <h3>Rules</h3>
              <p className="muted">{event.rules || 'No additional rules published.'}</p>
              <h3>Contact</h3>
              <p className="muted">{event.contactInfo || event.organizerEmail || 'No contact information published.'}</p>
            </div>
            <aside className="panel registration-panel">
              <h2>{isHost ? 'Public Registration Preview' : 'Register'}</h2>
              <p className="muted">{event.ticketType === 'Free' ? 'Free registration' : currency(event.ticketPrice)}</p>
              <form className="form-grid" onSubmit={submitRegistration}>
                <label className="form-field"><span>Full Name</span><input required value={participant.fullName} onChange={(e) => setParticipant({ ...participant, fullName: e.target.value })} /></label>
                <label className="form-field"><span>Email</span><input type="email" required value={participant.email} onChange={(e) => setParticipant({ ...participant, email: e.target.value })} /></label>
                <label className="form-field"><span>Phone</span><input required value={participant.phone} onChange={(e) => setParticipant({ ...participant, phone: e.target.value })} /></label>
                <div className="form-grid two">
                  <label className="form-field"><span>Age</span><input type="number" min="1" required value={participant.age} onChange={(e) => setParticipant({ ...participant, age: e.target.value })} /></label>
                  <label className="form-field"><span>Gender</span><select required value={participant.gender} onChange={(e) => setParticipant({ ...participant, gender: e.target.value })}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
                </div>
                <label className="form-field"><span>City</span><input required value={participant.city} onChange={(e) => setParticipant({ ...participant, city: e.target.value })} /></label>
                <button className="primary-btn" disabled={registrationClosed || saving} type="submit">{registrationClosed ? 'Registration Closed' : saving ? 'Registering...' : 'Register Now'}</button>
              </form>
            </aside>
          </section>
        )}

        {activeTab === 'Bookings' && (
          <section className="panel table-panel enterprise-table-panel">
            <div className="panel-title-row"><div><h2>Booking Management</h2><p className="muted">Approvals, payments, ticket delivery, and check-in status.</p></div><button className="ghost-btn" onClick={exportEventReport}><Download size={16} /> Export</button></div>
            {bookings.length === 0 ? <EmptyState title="No web app bookings yet" /> : (
              <table className="data-table enterprise-table">
                <thead><tr><th>Customer</th><th>Order</th><th>Tickets</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{bookings.map((booking) => {
                  const totalTickets = (booking.attendeeCounts?.adults || 0) + (booking.attendeeCounts?.children || 0);
                  return (
                    <tr key={booking.id}>
                      <td><strong>{booking.attendee?.name || 'Guest'}</strong><p className="muted">{booking.attendee?.email || booking.attendee?.phone || ''}</p></td>
                      <td>{booking.orderId || booking.id}<p className="muted">{formatDateTime(booking.createdAt)}</p></td>
                      <td>{totalTickets} ({booking.attendeeCounts?.adults || 0}A, {booking.attendeeCounts?.children || 0}C)<p className="muted">{booking.joinAs || 'General'}</p></td>
                      <td>{currency(getBookingAmount(booking))}</td>
                      <td><span className="badge">{booking.status || 'Pending'}</span><p className="muted">{booking.attendanceStatus || 'Not Checked In'}</p></td>
                      <td><div className="action-row"><button className="ghost-btn" onClick={() => changeBookingStatus(booking, { status: 'approved', approvalStatus: 'approved' })}>Approve</button><button className="ghost-btn" onClick={() => changeBookingStatus(booking, { attendanceStatus: 'Checked In' })}>Check In</button><button className="ghost-btn" onClick={() => changeBookingStatus(booking, { status: 'cancelled', approvalStatus: 'rejected' })}>Cancel</button><button className="ghost-btn" onClick={() => setSelectedBooking(booking)}>More Detail</button></div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'Participants' && (
          <section className="panel table-panel enterprise-table-panel">
            <div className="panel-title-row"><div><h2>Participant Directory</h2><p className="muted">Registration profiles, QR status, check-in state, and support details.</p></div></div>
            {registrations.length ? (
              <table className="data-table enterprise-table">
                <thead><tr><th>Participant</th><th>Contact</th><th>Ticket</th><th>Profile</th><th>Attendance</th><th>Actions</th></tr></thead>
                <tbody>{registrations.map((entry) => (
                  <tr key={entry.id}>
                    <td><strong>{entry.participantName || 'Guest attendee'}</strong><p className="muted">{entry.registrationId || entry.id}</p></td>
                    <td>{entry.participantEmail}<p className="muted">{entry.participantPhone}</p></td>
                    <td>{entry.ticketNumber || 'Not issued'}<p className="muted">{currency(getRegistrationAmount(entry))}</p></td>
                    <td>{entry.participant?.city || 'City not set'}<p className="muted">{entry.participant?.gender || 'Gender'} · {entry.participant?.age || 'Age'}</p></td>
                    <td><span className={`badge ${entry.attendanceStatus === 'Checked In' ? 'success' : 'warning'}`}>{entry.attendanceStatus || 'Not Checked In'}</span></td>
                    <td><button className="ghost-btn" onClick={() => updateRegistration(entry.id, { attendanceStatus: 'Checked In', checkInTime: new Date().toISOString() })}><CheckCircle2 size={15} /> Check In</button></td>
                  </tr>
                ))}</tbody>
              </table>
            ) : <EmptyState title="No participants yet" />}
          </section>
        )}

        {activeTab === 'Tickets' && (
          <section className="event-command-grid">
            <div className="panel">
              <h2>Ticket Inventory</h2>
              {analytics.ticketData.map((ticket) => <div className="ticket-row" key={ticket.name}><div><strong>{ticket.name}</strong><p className="muted">{currency(event.ticketPrice)} per ticket</p></div><div><strong>{ticket.sold}</strong><span>sold</span></div><div><strong>{ticket.remaining}</strong><span>remaining</span></div><div className="mini-progress"><span style={{ width: `${analytics.fillRate}%` }} /></div></div>)}
            </div>
            <div className="panel">
              <h2>Seat & Access Controls</h2>
              <div className="control-grid"><button className="ghost-btn">Reserve Seats</button><button className="ghost-btn">Block Tickets</button><button className="ghost-btn">Disable Ticket</button><button className="ghost-btn">Manage Coupons</button></div>
            </div>
          </section>
        )}

        {activeTab === 'Finance' && (
          <section className="event-command-grid finance-grid">
            <div className="panel finance-card"><span>Gross Revenue</span><strong>{currency(analytics.revenue)}</strong></div>
            <div className="panel finance-card"><span>Platform Fee</span><strong>{currency(analytics.platformFees)}</strong></div>
            <div className="panel finance-card"><span>Taxes</span><strong>{currency(analytics.taxes)}</strong></div>
            <div className="panel finance-card"><span>Organizer Earnings</span><strong>{currency(analytics.organizerEarnings)}</strong></div>
          </section>
        )}

        {activeTab === 'Timeline' && (
          <section className="event-command-grid">
            <div className="panel">
              <h2>Event Timeline</h2>
              <div className="timeline-list">
                <div><span />Created <strong>{formatDateTime(event.createdAt)}</strong></div>
                <div><span />Updated <strong>{formatDateTime(event.updatedAt)}</strong></div>
                <div><span />Published <strong>{event.status === 'Published' ? 'Active now' : 'Not active'}</strong></div>
                <div><span />Booking Window <strong>{formatDate(event.registrationStart)} - {formatDate(event.registrationEnd)}</strong></div>
                <div><span />Event Date <strong>{formatDate(event.startDate)}</strong></div>
              </div>
            </div>
            <div className="panel">
              <h2>AI Insights</h2>
              <div className="insight-list">
                <p><strong>Expected attendance:</strong> {analytics.attendanceRate || Math.min(100, analytics.fillRate)}% based on current check-ins.</p>
                <p><strong>Revenue forecast:</strong> {currency(analytics.capacity ? (analytics.revenue / Math.max(1, analytics.sold)) * analytics.capacity : analytics.revenue)}</p>
                <p><strong>Suggested action:</strong> {analytics.fillRate < 50 ? 'Run a broadcast or coupon campaign.' : 'Prepare gate staff and check-in lanes.'}</p>
              </div>
            </div>
          </section>
        )}

        <section className="panel related-panel">
          <div className="panel-title-row"><div><h2>Related Events</h2><p className="muted">Cross-promote similar live events.</p></div><MoreHorizontal size={18} /></div>
          <div className="event-grid">
            {relatedEvents.filter((item) => item.id !== event.id).slice(0, 3).map((item) => (
              <Link className="event-card" key={item.id} to={`/explore/${item.id}`}>
                <img src={item.bannerImage || event.bannerImage} alt={item.title} />
                <div className="event-card-body"><h3>{item.title}</h3><p className="muted">{formatDate(item.startDate)} in {item.city}</p></div>
              </Link>
            ))}
          </div>
        </section>

        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
              
              <div className="modal-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Booking Details - {selectedBooking.bookingId || selectedBooking.orderId || selectedBooking.id}</h2>
                <div className="action-row">
                  <button className="primary-btn" onClick={() => { changeBookingStatus(selectedBooking, { status: 'approved', approvalStatus: 'approved' }); setSelectedBooking(null); }}>Approve</button>
                  <button className="secondary-btn" onClick={() => { changeBookingStatus(selectedBooking, { attendanceStatus: 'Checked In' }); setSelectedBooking(null); }}>Check In</button>
                  <button className="danger-btn" onClick={() => { changeBookingStatus(selectedBooking, { status: 'cancelled', approvalStatus: 'rejected' }); setSelectedBooking(null); }}>Cancel Booking</button>
                </div>
              </div>
              
              <div className="booking-detail-grid">
                <div className="booking-detail-card">
                  <h3>Contact Information</h3>
                  {selectedBooking.bookingContact ? (
                    <>
                      <p><span className="label">Name:</span> {selectedBooking.bookingContact.name}</p>
                      <p><span className="label">Phone:</span> {selectedBooking.bookingContact.phone}</p>
                    </>
                  ) : (
                    <>
                      <p><span className="label">Name:</span> {selectedBooking.attendee?.name || 'Guest'}</p>
                      <p><span className="label">Email:</span> {selectedBooking.attendee?.email || 'N/A'}</p>
                      <p><span className="label">Phone:</span> {selectedBooking.attendee?.phone || 'N/A'}</p>
                    </>
                  )}
                  {selectedBooking.emergencyContact && (
                    <>
                      <h4 style={{ marginTop: '12px', marginBottom: '8px', color: 'var(--text-main)', fontSize: '15px' }}>Emergency Contact</h4>
                      <p><span className="label">Name:</span> {selectedBooking.emergencyContact.name}</p>
                      <p><span className="label">Phone:</span> {selectedBooking.emergencyContact.phone}</p>
                    </>
                  )}
                </div>

                <div className="booking-detail-card">
                  <h3>Order Information</h3>
                  <p><span className="label">Order ID:</span> {selectedBooking.bookingId || selectedBooking.orderId || selectedBooking.id}</p>
                  <p><span className="label">Status:</span> <span className={`badge ${selectedBooking.status === 'approved' || selectedBooking.status === 'paid' ? 'success' : selectedBooking.status === 'cancelled' ? 'danger' : 'warning'}`}>{selectedBooking.status || 'Pending'}</span></p>
                  <p><span className="label">Date:</span> {formatDateTime(selectedBooking.createdAt)}</p>
                  <p><span className="label">Join As:</span> {selectedBooking.joinAs || 'General'}</p>
                  {selectedBooking.preferences && (
                    <>
                      <p><span className="label">Pace:</span> {selectedBooking.preferences.pace || 'N/A'}</p>
                      <p><span className="label">Parking:</span> {selectedBooking.preferences.parking || 'N/A'}</p>
                    </>
                  )}
                </div>
                
                <div className="booking-detail-card">
                  <h3>Payment Details</h3>
                  <p><span className="label">Amount:</span> {currency(selectedBooking.total || getBookingAmount(selectedBooking))}</p>
                  <p><span className="label">Payment Status:</span> <span className={`badge ${selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'}`}>{selectedBooking.paymentStatus || 'Pending'}</span></p>
                  <p><span className="label">Payment Method:</span> {selectedBooking.paymentMethod || selectedBooking.payment?.method || 'N/A'}</p>
                  {selectedBooking.fees && (
                    <>
                      <p><span className="label">Discount:</span> {currency(selectedBooking.fees.discount || 0)}</p>
                      <p><span className="label">Convenience Fee:</span> {currency(selectedBooking.fees.convenience || 0)}</p>
                    </>
                  )}
                </div>

                <div className="booking-detail-card">
                  <h3>Ticket & Attendance</h3>
                  <p><span className="label">Total Tickets:</span> {selectedBooking.totalTickets || ((selectedBooking.attendeeCounts?.adults || 0) + (selectedBooking.attendeeCounts?.children || 0))}</p>
                  {selectedBooking.attendeeCounts && (
                    <>
                       <p><span className="label">Adults:</span> {selectedBooking.attendeeCounts.adults || 0}</p>
                       <p><span className="label">Children:</span> {selectedBooking.attendeeCounts.children || 0}</p>
                    </>
                  )}
                  <p><span className="label">Attendance:</span> {selectedBooking.attendanceStatus || 'Not Checked In'}</p>
                  <p><span className="label">Checked In At:</span> {selectedBooking.checkInTime ? formatDateTime(selectedBooking.checkInTime) : 'N/A'}</p>
                </div>
              </div>

              {selectedBooking.attendees && selectedBooking.attendees.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '12px' }}>Attendees List</h3>
                  <table className="data-table enterprise-table" style={{ minWidth: '100%' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>ID Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBooking.attendees.map((att, idx) => (
                        <tr key={idx}>
                          <td><strong>{att.name}</strong></td>
                          <td>{att.email || 'N/A'}</td>
                          <td>{att.phone || 'N/A'}</td>
                          <td>{att.idType || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '12px' }}>Status History</h3>
                  <div className="timeline-list">
                    {selectedBooking.statusHistory.map((hist, idx) => (
                      <div key={idx} style={{ padding: '8px 0', borderBottom: idx === selectedBooking.statusHistory.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                        <span />
                        {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ textTransform: 'capitalize' }}>{hist.status}</strong>
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{hist.note || 'No notes provided'}</span>
                        </div> */}
                        <div className="muted" style={{ fontSize: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatDateTime(hist.at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default EventDetailsPage;
