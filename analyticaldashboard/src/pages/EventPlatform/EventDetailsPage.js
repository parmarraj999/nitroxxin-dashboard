import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Calendar, Edit, MapPin, Users } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { getEvent, incrementEventView, registerForEvent, toggleBookmark, subscribeToEventBookings } from '../../services/firebaseService';
import { currency, formatDate } from '../../utils/formatters';
import './EventPlatform.css';
import '../Auth/Auth.css';

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
  const { events: relatedEvents } = useEvents({ status: 'Published', category: event?.category });

  useEffect(() => {
    let unsubscribe;
    if (eventId) {
      unsubscribe = subscribeToEventBookings(eventId, (data) => {
        setBookings(data);
      }, (err) => console.error(err));
    }
    return () => unsubscribe && unsubscribe();
  }, [eventId]);

  useEffect(() => {
    getEvent(eventId)
      .then((item) => {
        setEvent(item);
        setParticipant({
          fullName: profile?.fullName || '',
          email: profile?.email || user?.email || '',
          phone: profile?.phone || '',
          age: '',
          gender: '',
          city: profile?.city || '',
        });
        incrementEventView(eventId).catch(() => {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId, profile?.city, profile?.email, profile?.fullName, profile?.phone, user?.email]);

  const registrationClosed = useMemo(() => {
    if (!event) return true;
    const today = new Date();
    return event.status !== 'Published' || new Date(event.registrationEnd) < today || (event.registeredCount || 0) >= Number(event.capacity || 0);
  }, [event]);

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

  if (loading) return <AppLayout><LoadingState label="Loading event details" /></AppLayout>;
  if (!event) return <AppLayout><EmptyState title="Event not found" action={<button className="primary-btn" onClick={() => navigate('/explore')}>Browse events</button>} /></AppLayout>;

  const isHost = event.hostId === user?.uid;

  return (
    <AppLayout>
      <main className="page-shell">
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <div className="page-heading">
          <div>
            <h1>{event.title}</h1>
            <p>{event.category} hosted by {event.hostName || 'Nitroxx Host'}</p>
          </div>
          <div className="action-row">
            <button className="ghost-btn" onClick={() => toggleBookmark({ userId: user.uid, eventId: event.id })}><Bookmark size={16} /> Favorite</button>
            {isHost && <Link className="secondary-btn" to={`/events/${event.id}/edit`}><Edit size={16} /> Edit</Link>}
          </div>
        </div>
        <img className="details-banner" src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80'} alt={event.title} />
        <div className="details-grid">
          <section className="panel">
            <div className="badge-row"><span className="badge success">{event.status}</span><span className="badge">{event.ticketType}</span></div>
            <h2>Event Overview</h2>
            <p className="muted">{event.description}</p>
            <div className="event-meta">
              <span><Calendar size={14} /> {formatDate(event.startDate)} {event.startTime} - {event.endTime}</span>
              <span><MapPin size={14} /> {event.venue}, {event.address}, {event.city}, {event.state}</span>
              <span><Users size={14} /> {event.registeredCount || 0} / {event.capacity || 0} participants</span>
            </div>
            {event.galleryImages?.length > 0 && (
              <div className="gallery-row">{event.galleryImages.map((image) => <img key={image} src={image} alt="Event gallery" />)}</div>
            )}
            <h3>Rules</h3>
            <p className="muted">{event.rules || 'No additional rules published.'}</p>
            <h3>Contact</h3>
            <p className="muted">{event.contactInfo}</p>
          </section>
          <aside className="panel">
            <h2>Register</h2>
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
        </div>
          <section className="panel" style={{ marginTop: 18 }}>
            <h2>Web App Bookings</h2>
            {bookings.length === 0 ? (
              <p className="muted">No web app bookings yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 0' }}>Attendee</th>
                      <th style={{ padding: '12px 0' }}>Tickets</th>
                      <th style={{ padding: '12px 0' }}>Role</th>
                      <th style={{ padding: '12px 0' }}>Amount</th>
                      <th style={{ padding: '12px 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const totalTickets = (booking.attendeeCounts?.adults || 0) + (booking.attendeeCounts?.children || 0);
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 0' }}>
                            <div>{booking.attendee?.name || 'Guest'}</div>
                            <div className="muted" style={{ fontSize: '13px' }}>{booking.attendee?.email || booking.attendee?.phone || ''}</div>
                          </td>
                          <td style={{ padding: '12px 0' }}>{totalTickets} ({booking.attendeeCounts?.adults || 0}A, {booking.attendeeCounts?.children || 0}C)</td>
                          <td style={{ padding: '12px 0', textTransform: 'capitalize' }}>{booking.joinAs || 'N/A'}</td>
                          <td style={{ padding: '12px 0' }}>₹{Number(booking.total || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 0' }}><span className="badge">{booking.status || 'Pending'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Related Events</h2>
          <div className="event-grid">
            {relatedEvents.filter((item) => item.id !== event.id).slice(0, 3).map((item) => (
              <Link className="event-card" key={item.id} to={`/explore/${item.id}`}>
                <img src={item.bannerImage || event.bannerImage} alt={item.title} />
                <div className="event-card-body"><h3>{item.title}</h3><p className="muted">{formatDate(item.startDate)} in {item.city}</p></div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventDetailsPage;
