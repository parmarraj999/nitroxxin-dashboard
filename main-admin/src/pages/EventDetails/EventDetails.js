import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Users,
  IndianRupee,
  Share2,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Download,
  Printer,
  Search,
  Plus,
  Eye,
  Copy,
  Check,
  Filter,
  User,
  Phone,
  Mail,
  Shield,
  FileText,
  Sparkles,
  Trophy,
  Navigation,
  Compass,
  CreditCard,
  Tag,
  Layers,
  ChevronDown,
  X,
  Maximize2
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { toDate } from '../../services/firebaseUtils';
import Pagination from '../../components/Common/Pagination';
import './EventDetails.css';

// Default Fallback Banner & Thumbnail
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80';
const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80';

// Sample demo bookings if none exist in Firestore
const getSampleDemoBookings = (ev) => {
  const price = Number(ev?.ticketPrice || 299);
  return [
    {
      id: 'bk-demo-1',
      bookingId: 'BK-98421',
      customer: 'Vikramaditya Rao',
      customerName: 'Vikramaditya Rao',
      email: 'vikram.rao@example.com',
      phone: '+91 98450 12345',
      uid: 'USR-89021',
      tickets: 2,
      ticketCount: 2,
      tier: 'VIP Rider Pass',
      amount: price * 2,
      totalAmount: price * 2,
      paymentMethod: 'Razorpay (UPI)',
      paymentId: 'pay_PqL78bX91mN',
      status: 'confirmed',
      checkInStatus: 'checked_in',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      isDemo: true
    },
    {
      id: 'bk-demo-2',
      bookingId: 'BK-98422',
      customer: 'Ananya Deshmukh',
      customerName: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      phone: '+91 97654 88990',
      uid: 'USR-65412',
      tickets: 1,
      ticketCount: 1,
      tier: 'Standard Rider',
      amount: price,
      totalAmount: price,
      paymentMethod: 'Razorpay (Card)',
      paymentId: 'pay_Kk92bX81aZ',
      status: 'confirmed',
      checkInStatus: 'registered',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
      isDemo: true
    },
    {
      id: 'bk-demo-3',
      bookingId: 'BK-98423',
      customer: 'Rohit Kulkarni',
      customerName: 'Rohit Kulkarni',
      email: 'rohit.k@example.com',
      phone: '+91 99220 54321',
      uid: 'USR-44109',
      tickets: 1,
      ticketCount: 1,
      tier: 'Standard Rider',
      amount: price,
      totalAmount: price,
      paymentMethod: 'Netbanking',
      paymentId: 'pay_Hj11xP009b',
      status: 'pending',
      checkInStatus: 'registered',
      createdAt: new Date(Date.now() - 3600000 * 12),
      isDemo: true
    }
  ];
};

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Firestore Data State
  const [event, setEvent] = useState(null);
  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI Interactive States
  const [copiedId, setCopiedId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);

  // Bookings Filter & Pagination State
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Edit Event Form State
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    subCategory: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    ticketPrice: '',
    ticketType: 'Paid',
    capacity: '',
    status: 'Published',
    description: '',
    featuredForYou: false
  });

  // Manual Add Booking Form State
  const [manualBookingForm, setManualBookingForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    tickets: 1,
    tier: 'Standard Entry',
    amount: '',
    paymentMethod: 'Razorpay (UPI)',
    status: 'confirmed',
    notes: ''
  });

  // 1. Listen to Event document
  useEffect(() => {
    if (!eventId) return;
    const unsubEvent = onSnapshot(doc(db, 'events', eventId), (snapshot) => {
      if (snapshot.exists()) {
        const evData = { id: snapshot.id, ...snapshot.data() };
        setEvent(evData);
        // Pre-fill edit form
        setEditForm({
          title: evData.title || evData.name || '',
          category: evData.category || 'Group Ride',
          subCategory: evData.subCategory || '',
          venue: evData.venue || '',
          address: evData.address || '',
          city: evData.city || '',
          state: evData.state || '',
          startDate: evData.startDate || evData.eventDate || '',
          endDate: evData.endDate || '',
          startTime: evData.startTime || '',
          endTime: evData.endTime || '',
          ticketPrice: evData.ticketPrice !== undefined ? String(evData.ticketPrice) : '',
          ticketType: evData.ticketType || 'Paid',
          capacity: evData.capacity !== undefined ? String(evData.capacity) : '',
          status: evData.status || 'Published',
          description: evData.description || '',
          featuredForYou: Boolean(evData.featuredForYou)
        });
      } else {
        setEvent(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching event details:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubEvent();
  }, [eventId]);

  // 2. Listen to Event Bookings
  useEffect(() => {
    if (!eventId) return;
    const unsubBookings = onSnapshot(collection(db, 'event_bookings'), (snapshot) => {
      const allDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const matched = allDocs.filter((b) => 
        b.eventId === eventId || 
        b.eventName === event?.name || 
        b.eventName === event?.title ||
        b.eventTitle === event?.title
      );
      setRawBookings(matched);
    }, (err) => {
      console.error('Error fetching bookings:', err);
    });

    return () => unsubBookings();
  }, [eventId, event?.title, event?.name]);

  // Copy helper
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Determine effective bookings list (real vs sample demo)
  const isUsingDemoBookings = rawBookings.length === 0;
  const effectiveBookings = useMemo(() => {
    if (rawBookings.length > 0) return rawBookings;
    return event ? getSampleDemoBookings(event) : [];
  }, [rawBookings, event]);

  // Derived metrics
  const ticketsBooked = useMemo(() => {
    return effectiveBookings.reduce((sum, b) => sum + Number(b.tickets || b.ticketCount || 1), 0);
  }, [effectiveBookings]);

  const totalRevenue = useMemo(() => {
    if (event?.revenue && Number(event.revenue) > 0) return Number(event.revenue);
    return effectiveBookings.reduce((sum, b) => sum + Number(b.amount || b.totalAmount || 0), 0);
  }, [effectiveBookings, event?.revenue]);

  const capacityVal = Number(event?.capacity || 0);
  const capacityPercent = capacityVal > 0 ? Math.min(Math.round((ticketsBooked / capacityVal) * 100), 100) : 0;
  const spotsRemaining = capacityVal > 0 ? Math.max(capacityVal - ticketsBooked, 0) : 'Unlimited';

  // Check if event date has passed
  const isEventCompleted = useMemo(() => {
    if (!event) return false;
    const s = (event.status || '').toLowerCase();
    if (s === 'completed' || s === 'complete') return true;
    if (s === 'cancelled') return false;

    const raw = event.endDate || event.startDate || event.eventDate || event.date;
    if (!raw) return false;
    let d;
    if (typeof raw?.toDate === 'function') d = raw.toDate();
    else if (raw?.seconds) d = new Date(raw.seconds * 1000);
    else if (typeof raw === 'string') {
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      d = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(raw);
    } else d = new Date(raw);

    if (isNaN(d.getTime())) return false;
    d.setHours(23, 59, 59, 999);
    return d.getTime() < Date.now();
  }, [event]);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return effectiveBookings.filter((b) => {
      const term = bookingSearch.toLowerCase();
      const bId = (b.bookingId || b.id || '').toLowerCase();
      const customer = (b.customer || b.customerName || b.userName || '').toLowerCase();
      const email = (b.email || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();

      const matchesSearch = bId.includes(term) || customer.includes(term) || email.includes(term) || phone.includes(term);
      const bStatus = (b.status || 'confirmed').toLowerCase();
      const matchesStatus = 
        bookingStatusFilter === 'all' || 
        bStatus === bookingStatusFilter ||
        (bookingStatusFilter === 'checked_in' && b.checkInStatus === 'checked_in');

      return matchesSearch && matchesStatus;
    });
  }, [effectiveBookings, bookingSearch, bookingStatusFilter]);

  // Paginated Bookings
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Quick Status change for the event
  const handleQuickStatusChange = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to update event status:', err);
      alert('Failed to update status. Check permissions.');
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async () => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        featuredForYou: !event.featuredForYou,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to update featured flag:', err);
    }
  };

  // Delete event with confirmation
  const handleDeleteEvent = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${event.title || event.name}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        navigate('/events');
      } catch (err) {
        console.error('Failed to delete event:', err);
        alert('Failed to delete event: ' + err.message);
      }
    }
  };

  // Save Edit Event Modal changes
  const handleSaveEditEvent = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'events', eventId), {
        title: editForm.title.trim(),
        name: editForm.title.trim(),
        category: editForm.category,
        subCategory: editForm.subCategory,
        venue: editForm.venue.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        startDate: editForm.startDate,
        eventDate: editForm.startDate,
        endDate: editForm.endDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        ticketPrice: Number(editForm.ticketPrice) || 0,
        ticketType: editForm.ticketType,
        capacity: Number(editForm.capacity) || 0,
        status: editForm.status,
        description: editForm.description.trim(),
        featuredForYou: editForm.featuredForYou,
        updatedAt: serverTimestamp()
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to save event changes:', err);
      alert('Error updating event: ' + err.message);
    }
  };

  // Check-In toggle on a booking
  const handleToggleCheckIn = async (booking) => {
    const nextVal = booking.checkInStatus === 'checked_in' ? 'registered' : 'checked_in';
    if (booking.isDemo) {
      alert(`Demo booking updated: marked as ${nextVal === 'checked_in' ? 'Checked In' : 'Registered'}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'event_bookings', booking.id), {
        checkInStatus: nextVal,
        updatedAt: serverTimestamp()
      });
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => ({ ...prev, checkInStatus: nextVal }));
      }
    } catch (err) {
      console.error('Failed to update check-in:', err);
    }
  };

  // Quick update booking status (confirmed, pending, cancelled)
  const handleUpdateBookingStatus = async (booking, nextStatus) => {
    if (booking.isDemo) {
      alert(`Demo booking status changed to ${nextStatus}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'event_bookings', booking.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (booking, e) => {
    e.stopPropagation();
    if (booking.isDemo) {
      alert('This is a preview demonstration booking.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this booking record?')) {
      try {
        await deleteDoc(doc(db, 'event_bookings', booking.id));
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(null);
        }
      } catch (err) {
        console.error('Failed to delete booking:', err);
      }
    }
  };

  // Add manual booking to Firestore
  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (!manualBookingForm.customerName.trim()) {
      alert('Participant name is required.');
      return;
    }
    try {
      const code = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
      await addDoc(collection(db, 'event_bookings'), {
        bookingId: code,
        eventId: eventId,
        eventName: event.title || event.name || 'Event',
        customer: manualBookingForm.customerName.trim(),
        customerName: manualBookingForm.customerName.trim(),
        email: manualBookingForm.email.trim(),
        phone: manualBookingForm.phone.trim(),
        tickets: Number(manualBookingForm.tickets) || 1,
        ticketCount: Number(manualBookingForm.tickets) || 1,
        tier: manualBookingForm.tier || 'Standard Entry',
        amount: Number(manualBookingForm.amount) || Number(event.ticketPrice || 0) * (Number(manualBookingForm.tickets) || 1),
        totalAmount: Number(manualBookingForm.amount) || Number(event.ticketPrice || 0) * (Number(manualBookingForm.tickets) || 1),
        paymentMethod: manualBookingForm.paymentMethod || 'Razorpay (UPI)',
        paymentId: `manual_${Date.now()}`,
        status: manualBookingForm.status || 'confirmed',
        checkInStatus: 'registered',
        notes: manualBookingForm.notes || '',
        createdAt: serverTimestamp()
      });
      setIsAddBookingOpen(false);
      setManualBookingForm({
        customerName: '',
        email: '',
        phone: '',
        tickets: 1,
        tier: 'Standard Entry',
        amount: '',
        paymentMethod: 'Razorpay (UPI)',
        status: 'confirmed',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Error creating booking: ' + err.message);
    }
  };

  // Export Bookings CSV
  const handleExportBookingsCsv = () => {
    if (!effectiveBookings || effectiveBookings.length === 0) {
      alert('No bookings to export');
      return;
    }
    const headers = ['Booking ID', 'Participant Name', 'Email', 'Phone', 'Tickets', 'Tier', 'Amount (INR)', 'Payment Mode', 'Status', 'Check-In Status', 'Booked On'];
    const rows = effectiveBookings.map((b) => {
      const dateVal = toDate(b.createdAt || b.bookedAt) || new Date();
      return [
        `"${b.bookingId || b.id}"`,
        `"${b.customer || b.customerName || 'Guest'}"`,
        `"${b.email || ''}"`,
        `"${b.phone || ''}"`,
        b.tickets || b.ticketCount || 1,
        `"${b.tier || 'Standard'}"`,
        b.amount || b.totalAmount || 0,
        `"${b.paymentMethod || 'Online'}"`,
        `"${b.status || 'confirmed'}"`,
        `"${b.checkInStatus || 'registered'}"`,
        `"${dateVal.toLocaleString()}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${(event.title || 'event').replace(/\s+/g, '_')}_bookings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="event-section-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <Calendar size={42} color="#94a3b8" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Loading event details...</h2>
          <p>Fetching real-time event specifications and registrations.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-container">
        <div className="event-section-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: 8 }}>Event Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>The requested event ID could not be retrieved from the database.</p>
          <button className="btn-header-action primary" onClick={() => navigate('/events')}>
            <ArrowLeft size={16} /> Back to Events Listing
          </button>
        </div>
      </div>
    );
  }

  // Parse Media & URLs
  const title = (event.title || event.name || 'Untitled Event').trim();
  const bannerImg = event.bannerImage || event.banner || event.imageUrl || DEFAULT_BANNER;
  const thumbImg = event.thumbnailImage || event.imageUrl || DEFAULT_THUMB;
  const galleryList = Array.isArray(event.galleryImages) && event.galleryImages.length > 0 ? event.galleryImages : [];

  // Parse Dates
  const startDateStr = event.startDate || event.eventDate || event.date || 'TBD';
  const endDateStr = event.endDate || '';
  const startTimeStr = event.startTime || '';
  const endTimeStr = event.endTime || '';

  // Host info
  const hostId = event.hostId || event.organizerId || event.vendorId;
  const hostName = event.hostName || event.organizerName || 'Nitroxx Verified Host';
  const hostPhoto = event.hostPhotoURL || event.organizerPhoto;
  const fullAddress = [event.address, event.venue, event.city, event.state].filter(Boolean).join(', ');

  // Status computation
  const effectiveStatus = isEventCompleted ? 'complete' : (event.status || 'draft').toLowerCase();

  return (
    <div className="event-details-container">
      {/* ── 1. Top Navigation Bar ────────────────────────────────────────── */}
      <div className="event-top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="event-back-btn" onClick={() => navigate('/events')}>
            <ArrowLeft size={15} />
            <span>Events</span>
          </button>
          <div className="event-breadcrumbs">
            <span className="link" onClick={() => navigate('/events')}>Events</span>
            <span>/</span>
            <strong>{title}</strong>
          </div>
        </div>

        <div className="event-header-actions">
          {/* Quick Status Dropdown */}
          <div className="status-dropdown-wrap">
            <select
              className={`status-select-native ${effectiveStatus}`}
              value={effectiveStatus}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              title="Change event publishing status"
            >
              <option value="published">● Published</option>
              <option value="draft">● Draft</option>
              <option value="complete">● Complete</option>
              <option value="cancelled">● Cancelled</option>
            </select>
            <ChevronDown size={14} className="status-dropdown-arrow" />
          </div>

          {/* Feature Toggle */}
          <button
            type="button"
            className={`star-featured-btn ${event.featuredForYou ? 'active' : ''}`}
            onClick={handleToggleFeatured}
            title={event.featuredForYou ? 'Remove from Web Hero' : 'Feature on Web Hero'}
          >
            <Star size={16} fill={event.featuredForYou ? '#eab308' : 'none'} stroke={event.featuredForYou ? '#eab308' : 'currentColor'} />
          </button>

          {/* Edit Event Button */}
          <button
            type="button"
            className="btn-header-action"
            onClick={() => setIsEditModalOpen(true)}
            title="Edit event details"
          >
            <Edit2 size={15} />
            <span>Edit Event</span>
          </button>

          {/* Print Ledger */}
          <button
            type="button"
            className="btn-header-action"
            onClick={() => window.print()}
            title="Print event summary ledger"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          {/* Delete Event */}
          <button
            type="button"
            className="btn-header-action danger"
            onClick={handleDeleteEvent}
            title="Delete this event"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ── 2. Hero Header Box ───────────────────────────────────────────── */}
      <div className="event-hero-header">
        <div className="event-hero-title-box">
          <h1>
            <span>{title}</span>
            {event.featuredForYou && (
              <span className="badge-tag featured" title="Featured on Web Home">
                <Sparkles size={12} /> Featured
              </span>
            )}
          </h1>
          <p className="event-hero-subtitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} color="#ea580c" />
              <strong>{event.venue || 'Venue TBD'}</strong>
            </span>
            {event.city && <span>• {event.city}, {event.state || 'India'}</span>}
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CalendarDays size={14} color="#2563eb" />
              <span>{startDateStr} {startTimeStr && `at ${startTimeStr}`}</span>
            </span>
          </p>
          <div className="event-hero-badges">
            {event.category && <span className="badge-tag category">{event.category}</span>}
            {event.subCategory && <span className="badge-tag subcategory">{event.subCategory}</span>}
            <span className={`booking-status-pill ${effectiveStatus}`}>
              {effectiveStatus === 'complete' && <CheckCircle2 size={12} />}
              {effectiveStatus === 'published' && <Clock size={12} />}
              {effectiveStatus === 'cancelled' && <XCircle size={12} />}
              <span style={{ textTransform: 'capitalize' }}>{effectiveStatus}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-header-action primary"
            onClick={() => setIsAddBookingOpen(true)}
          >
            <Plus size={16} />
            <span>Register Attendee</span>
          </button>
        </div>
      </div>

      {/* ── 3. KPI Metric Summary Row ────────────────────────────────────── */}
      <div className="event-kpis-row">
        <div className="event-kpi-card">
          <div className="event-kpi-icon-wrap orange">
            <Ticket size={24} />
          </div>
          <div className="event-kpi-info">
            <span className="event-kpi-label">Tickets Sold</span>
            <span className="event-kpi-value">{ticketsBooked}</span>
            <span className="event-kpi-subtext">{effectiveBookings.length} booking orders</span>
          </div>
        </div>

        <div className="event-kpi-card">
          <div className="event-kpi-icon-wrap green">
            <Users size={24} />
          </div>
          <div className="event-kpi-info">
            <span className="event-kpi-label">Capacity Filled</span>
            <span className="event-kpi-value">{capacityVal > 0 ? `${capacityPercent}%` : 'Open'}</span>
            <span className="event-kpi-subtext">
              {capacityVal > 0 ? `${spotsRemaining} spots left` : 'Unlimited riders'}
            </span>
          </div>
        </div>

        <div className="event-kpi-card">
          <div className="event-kpi-icon-wrap blue">
            <IndianRupee size={24} />
          </div>
          <div className="event-kpi-info">
            <span className="event-kpi-label">Total Revenue</span>
            <span className="event-kpi-value">₹{totalRevenue.toLocaleString()}</span>
            <span className="event-kpi-subtext">From confirmed registrations</span>
          </div>
        </div>

        <div className="event-kpi-card">
          <div className="event-kpi-icon-wrap purple">
            <Tag size={24} />
          </div>
          <div className="event-kpi-info">
            <span className="event-kpi-label">Ticket Price</span>
            <span className="event-kpi-value">
              {Number(event.ticketPrice || 0) > 0 ? `₹${Number(event.ticketPrice).toLocaleString()}` : 'Free'}
            </span>
            <span className="event-kpi-subtext">{event.ticketType || 'Standard Entry'}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Main 2-Column Content Layout ──────────────────────────────── */}
      <div className="event-two-column-layout">
        {/* Left Column: Visuals & In-Depth Event Info */}
        <div className="event-main-col">
          {/* Banner & Gallery Showcase Card */}
          <div className="event-section-card">
            <div className="event-card-header">
              <h2><Layers size={18} color="#ea580c" /> Event Media & Posters</h2>
              <p>{galleryList.length + 1} photos uploaded</p>
            </div>

            <div className="event-banner-container">
              <img
                src={bannerImg}
                alt={title}
                className="event-banner-img"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_BANNER; }}
              />
              <div className="banner-overlay-badge">
                <Sparkles size={13} /> Official Event Banner
              </div>
              <button
                type="button"
                className="banner-view-fullscreen-btn"
                onClick={() => setLightboxImage(bannerImg)}
              >
                <Maximize2 size={13} /> View Full
              </button>
            </div>

            {/* Gallery Grid */}
            {galleryList.length > 0 && (
              <div className="event-gallery-wrap">
                <h3>Gallery Showcase</h3>
                <div className="event-gallery-grid">
                  {galleryList.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="gallery-thumb-box"
                      onClick={() => setLightboxImage(imgUrl)}
                      title="Click to view full photo"
                    >
                      <img src={imgUrl} alt={`Gallery ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="event-section-card">
            <div className="event-card-header">
              <h2><FileText size={18} color="#ea580c" /> About & Overview</h2>
            </div>
            <div className="event-desc-content">
              {event.description || event.shortDescription || 'No detailed description provided for this event.'}
            </div>
          </div>

          {/* Schedule & Location Card */}
          <div className="event-section-card">
            <div className="event-card-header">
              <h2><Compass size={18} color="#ea580c" /> Schedule & Venue Logistics</h2>
            </div>
            <div className="specs-detail-grid">
              <div className="spec-detail-cell">
                <span className="spec-detail-label"><Calendar size={13} /> Event Start Date</span>
                <span className="spec-detail-val">{startDateStr}</span>
                {startTimeStr && <span className="spec-detail-sub">Starts at {startTimeStr}</span>}
              </div>

              <div className="spec-detail-cell">
                <span className="spec-detail-label"><Clock size={13} /> Event End Date</span>
                <span className="spec-detail-val">{endDateStr || startDateStr}</span>
                {endTimeStr && <span className="spec-detail-sub">Concludes by {endTimeStr}</span>}
              </div>

              <div className="spec-detail-cell">
                <span className="spec-detail-label"><MapPin size={13} /> Starting Location / Venue</span>
                <span className="spec-detail-val">{event.venue || 'TBD'}</span>
                {event.address && <span className="spec-detail-sub">{event.address}</span>}
                {fullAddress && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="directions-map-link"
                  >
                    Open in Google Maps <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="spec-detail-cell">
                <span className="spec-detail-label"><Users size={13} /> Registration Window</span>
                <span className="spec-detail-val">
                  {event.registrationStart ? `${event.registrationStart} to ${event.registrationEnd || 'Start'}` : 'Open Registration'}
                </span>
                <span className="spec-detail-sub">Rider bookings accepted</span>
              </div>
            </div>
          </div>

          {/* Pricing, Packages & Inclusions */}
          {(event.packages?.length > 0 || event.addons?.length > 0 || event.coupons?.length > 0) && (
            <div className="event-section-card">
              <div className="event-card-header">
                <h2><CreditCard size={18} color="#ea580c" /> Ticket Packages & Addons</h2>
              </div>

              {/* Packages */}
              {Array.isArray(event.packages) && event.packages.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>Ticket Tiers</h3>
                  <div className="event-packages-container">
                    {event.packages.map((pkg, idx) => (
                      <div key={idx} className="package-card-item">
                        <div className="package-card-header">
                          <span className="package-card-title">{pkg.name || `Package ${idx + 1}`}</span>
                          <span className="package-card-price">₹{Number(pkg.price || 0).toLocaleString()}</span>
                        </div>
                        {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                          <ul className="package-inclusions-list">
                            {pkg.inclusions.map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {Array.isArray(event.addons) && event.addons.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Addons & Merchandise</h3>
                  <div className="addons-chips-row">
                    {event.addons.map((add, idx) => (
                      <span key={idx} className="addon-chip">
                        <Tag size={13} color="#ea580c" />
                        <span>{add.title || add.name} (+₹{add.price || 0})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupons */}
              {Array.isArray(event.coupons) && event.coupons.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Promotional Coupons</h3>
                  <div className="addons-chips-row">
                    {event.coupons.map((c, idx) => (
                      <span key={idx} className="coupon-chip">
                        <Sparkles size={13} />
                        <span>{c.code || c.couponCode} — {c.discount ? `${c.discount}% OFF` : 'Discount'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Details / Race & Competition Specs */}
          {event.categoryDetails && (
            <div className="event-section-card">
              <div className="event-card-header">
                <h2><Trophy size={18} color="#ea580c" /> Competition & Race Specifications</h2>
              </div>
              <div className="category-specifics-grid">
                {event.categoryDetails.raceFormat && (
                  <div className="spec-category-box">
                    <h4>Race Format</h4>
                    <p>{event.categoryDetails.raceFormat}</p>
                  </div>
                )}
                {event.categoryDetails.stuntShowTime && (
                  <div className="spec-category-box">
                    <h4>Stunt Show Timings</h4>
                    <p>{event.categoryDetails.stuntShowTime}</p>
                  </div>
                )}
                {Array.isArray(event.categoryDetails.raceClasses) && event.categoryDetails.raceClasses.length > 0 && (
                  <div className="spec-category-box">
                    <h4>Race Classes</h4>
                    <p>{event.categoryDetails.raceClasses.join(' · ')}</p>
                  </div>
                )}
                {Array.isArray(event.categoryDetails.prizeMoney) && event.categoryDetails.prizeMoney.length > 0 && (
                  <div className="spec-category-box">
                    <h4>Prize Pool</h4>
                    <p>{event.categoryDetails.prizeMoney.join(' | ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {event.termsAndConditions && (
            <div className="event-section-card">
              <div className="event-card-header">
                <h2><Shield size={18} color="#ea580c" /> Terms, Conditions & Safety Guidelines</h2>
              </div>
              <div className="event-desc-content" style={{ fontSize: '0.86rem', color: '#475569' }}>
                {event.termsAndConditions}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Aside Analytics, Host Profile, Actions */}
        <aside className="event-aside-col">
          {/* Capacity Gauge Card */}
          <div className="event-section-card capacity-gauge-card">
            <div className="event-card-header">
              <h2><Users size={18} color="#ea580c" /> Capacity & Sales</h2>
            </div>

            <div className="capacity-metric-stats">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Filled Status</span>
                <span className="capacity-percent-big">
                  {capacityVal > 0 ? `${capacityPercent}%` : '100%'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Booked</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {ticketsBooked} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ {capacityVal || '∞'}</span>
                </div>
              </div>
            </div>

            <div className="capacity-bar-track">
              <div className="capacity-bar-fill" style={{ width: `${capacityPercent}%` }}></div>
            </div>

            <div className="capacity-legend-row">
              <span>{spotsRemaining} spots available</span>
              <span>₹{totalRevenue.toLocaleString()} collected</span>
            </div>
          </div>

          {/* Host & Organizer Profile Card */}
          <div className="event-section-card">
            <div className="event-card-header">
              <h2><User size={18} color="#ea580c" /> Verified Host Profile</h2>
            </div>

            <div className="host-profile-card">
              <div className="host-avatar-box">
                {hostPhoto ? (
                  <img src={hostPhoto} alt={hostName} className="host-avatar-img" />
                ) : (
                  <div className="host-avatar-fallback">{hostName.charAt(0)}</div>
                )}
              </div>
              <div className="host-meta-details">
                <h3>{hostName}</h3>
                {hostId && (
                  <span className="host-id-tag" title="Click to copy host ID" onClick={() => handleCopy(hostId, 'hostId')}>
                    ID: {hostId.slice(0, 10)}... {copiedId === 'hostId' ? '✓ Copied' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="host-contacts-list">
              {event.organizerEmail && (
                <div className="host-contact-item">
                  <Mail size={14} color="#64748b" />
                  <span>{event.organizerEmail}</span>
                </div>
              )}
              {event.organizerPhone && (
                <div className="host-contact-item">
                  <Phone size={14} color="#64748b" />
                  <span>{event.organizerPhone}</span>
                </div>
              )}
              {event.organizerInstagram && (
                <div className="host-contact-item">
                  <ExternalLink size={14} color="#64748b" />
                  <span>@{event.organizerInstagram.replace('@', '')}</span>
                </div>
              )}
            </div>

            {hostId && (
              <button
                type="button"
                className="btn-aside-action"
                style={{ marginTop: 14 }}
                onClick={() => navigate(`/events/hosts/${hostId}`)}
              >
                <span>View Full Host Portfolio</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>

          {/* Quick Aside Actions Card */}
          <div className="event-section-card">
            <div className="event-card-header">
              <h2><Compass size={18} color="#ea580c" /> Quick Management</h2>
            </div>
            <div className="aside-quick-actions-list">
              <button
                type="button"
                className="btn-aside-action btn-orange"
                onClick={() => setIsAddBookingOpen(true)}
              >
                <Plus size={15} />
                <span>Register Manual Booking</span>
              </button>
              <button
                type="button"
                className="btn-aside-action"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 size={15} />
                <span>Modify Event Details</span>
              </button>
              <button
                type="button"
                className="btn-aside-action"
                onClick={handleExportBookingsCsv}
              >
                <Download size={15} />
                <span>Export Bookings CSV</span>
              </button>
              <button
                type="button"
                className="btn-aside-action"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Event Summary</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── 5. Full-Width Bookings & Attendee Registrations Table ────────── */}
      <section className="event-bookings-section">
        <div className="event-card-header">
          <div>
            <h2><Ticket size={20} color="#ea580c" /> Event Bookings & Registrations</h2>
            <p>Live participant ledger linked directly to this event.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              {effectiveBookings.length} total attendees
            </span>
          </div>
        </div>

        {/* Bookings Toolbar */}
        <div className="bookings-toolbar">
          <div className="bookings-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search booking ID, customer name, phone, or email..."
            />
          </div>

          <div className="bookings-filter-tabs">
            <button
              type="button"
              className={`bookings-tab-btn ${bookingStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBookingStatusFilter('all')}
            >
              All ({effectiveBookings.length})
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${bookingStatusFilter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setBookingStatusFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${bookingStatusFilter === 'checked_in' ? 'active' : ''}`}
              onClick={() => setBookingStatusFilter('checked_in')}
            >
              Checked In
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${bookingStatusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setBookingStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${bookingStatusFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setBookingStatusFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className="bookings-action-tools">
            <button
              type="button"
              className="btn-header-action"
              onClick={handleExportBookingsCsv}
              title="Export attendee roster to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="btn-header-action primary"
              onClick={() => setIsAddBookingOpen(true)}
            >
              <Plus size={14} />
              <span>Add Booking</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <Ticket size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 6px' }}>No bookings found</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>No registrations match your search keyword or active status filter.</p>
          </div>
        ) : (
          <>
            <div className="bookings-table-wrap">
              <table className="modern-bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Participant / Rider</th>
                    <th>Tickets</th>
                    <th>Tier / Package</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Check-In</th>
                    <th>Booked Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => {
                    const customerName = b.customer || b.customerName || b.userName || 'Guest Rider';
                    const initials = customerName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                    const bookingCode = b.bookingId || (b.id ? b.id.slice(0, 8).toUpperCase() : 'BK-000');
                    const bDate = toDate(b.createdAt || b.bookedAt) || new Date();
                    const isCheckedIn = b.checkInStatus === 'checked_in';

                    return (
                      <tr key={b.id}>
                        {/* 1. Booking ID */}
                        <td>
                          <span className="booking-id-tag">
                            <span>{bookingCode}</span>
                            <button
                              type="button"
                              className="btn-copy-id"
                              title="Copy Booking ID"
                              onClick={() => handleCopy(bookingCode, b.id)}
                            >
                              {copiedId === b.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            </button>
                          </span>
                        </td>

                        {/* 2. Participant details */}
                        <td>
                          <div className="participant-cell">
                            <div className="participant-avatar-circle">{initials}</div>
                            <div className="participant-meta">
                              <span className="participant-name">{customerName}</span>
                              <span className="participant-contact">{b.phone || b.email || 'No contact provided'}</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Tickets count */}
                        <td>
                          <span className="tickets-count-badge">
                            <Ticket size={12} color="#ea580c" />
                            <span>{b.tickets || b.ticketCount || 1}</span>
                          </span>
                        </td>

                        {/* 4. Tier / Package */}
                        <td>
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {b.tier || b.package || 'Standard Entry'}
                          </span>
                        </td>

                        {/* 5. Amount & Payment */}
                        <td>
                          <div className="booking-amount-box">
                            <span className="booking-amount-val">
                              ₹{Number(b.amount || b.totalAmount || 0).toLocaleString()}
                            </span>
                            <span className="booking-amount-mode">
                              {b.paymentMethod || 'Online Payment'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Status */}
                        <td>
                          <span className={`booking-status-pill ${(b.status || 'confirmed').toLowerCase()}`}>
                            {b.status || 'confirmed'}
                          </span>
                        </td>

                        {/* 7. Check-In Toggle */}
                        <td>
                          <button
                            type="button"
                            className={`booking-status-pill ${isCheckedIn ? 'checked_in' : 'pending'}`}
                            style={{ cursor: 'pointer', border: '1px dashed' }}
                            onClick={() => handleToggleCheckIn(b)}
                            title="Click to toggle check-in state"
                          >
                            {isCheckedIn ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span>{isCheckedIn ? 'Checked In' : 'Pending'}</span>
                          </button>
                        </td>

                        {/* 8. Booked Date */}
                        <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                          {bDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* 9. Actions Column */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="booking-actions-row">
                            <button
                              type="button"
                              className="tbl-action-btn"
                              title="View Full Booking Breakdown"
                              onClick={() => setSelectedBooking(b)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="tbl-action-btn danger"
                              title="Delete Booking"
                              onClick={(e) => handleDeleteBooking(b, e)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ marginTop: 16 }}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredBookings.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </section>

      {/* ── 6. Modals ────────────────────────────────────────────────────── */}

      {/* Modal A: Edit Event Details */}
      {isEditModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="ed-modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2>Edit Event Specifications</h2>
              <button type="button" className="ed-modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditEvent}>
              <div className="ed-modal-body">
                <div className="modal-form-grid">
                  <div className="modal-form-group col-span-2">
                    <label>Event Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="e.g. Throttle Down Drag Slalom"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="e.g. Races & Stunt Shows"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Subcategory</label>
                    <input
                      type="text"
                      value={editForm.subCategory}
                      onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                      placeholder="e.g. Drag Race, Slalom"
                    />
                  </div>

                  <div className="modal-form-group col-span-2">
                    <label>Venue / Starting Point</label>
                    <input
                      type="text"
                      value={editForm.venue}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                      placeholder="e.g. Xion Mall Parking"
                    />
                  </div>

                  <div className="modal-form-group col-span-2">
                    <label>Full Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="e.g. Hinjewadi Phase 1, Pune – 411057"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Base Ticket Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.ticketPrice}
                      onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                      placeholder="0 for free"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Capacity (Riders)</label>
                    <input
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Complete">Complete</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 }}>
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={editForm.featuredForYou}
                      onChange={(e) => setEditForm({ ...editForm, featuredForYou: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <label htmlFor="featCheck" style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.88rem' }}>
                      Feature on Web Home Hero
                    </label>
                  </div>

                  <div className="modal-form-group col-span-2">
                    <label>Description & Itinerary</label>
                    <textarea
                      rows={5}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe the schedule, route highlights, and rider prerequisites..."
                    />
                  </div>
                </div>
              </div>

              <div className="ed-modal-footer">
                <button type="button" className="btn-header-action" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-header-action primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Booking Details Drawer / View */}
      {selectedBooking && (
        <div className="ed-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="ed-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2>Booking Details — {selectedBooking.bookingId || selectedBooking.id}</h2>
              <button type="button" className="ed-modal-close-btn" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="booking-detail-grid">
                <div className="bdetail-cell">
                  <span className="bdetail-label">Participant Name</span>
                  <span className="bdetail-val">{selectedBooking.customer || selectedBooking.customerName || 'Guest'}</span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Status</span>
                  <span className={`booking-status-pill ${(selectedBooking.status || 'confirmed').toLowerCase()}`}>
                    {selectedBooking.status || 'confirmed'}
                  </span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Phone</span>
                  <span className="bdetail-val">{selectedBooking.phone || 'N/A'}</span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Email</span>
                  <span className="bdetail-val">{selectedBooking.email || 'N/A'}</span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Tickets Count</span>
                  <span className="bdetail-val">{selectedBooking.tickets || selectedBooking.ticketCount || 1} Pass(es)</span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Package / Tier</span>
                  <span className="bdetail-val">{selectedBooking.tier || 'Standard Entry'}</span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Total Amount</span>
                  <span className="bdetail-val" style={{ color: '#ea580c' }}>
                    ₹{Number(selectedBooking.amount || selectedBooking.totalAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Payment ID</span>
                  <span className="bdetail-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedBooking.paymentId || 'N/A'}
                  </span>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Check-In Status</span>
                  <div style={{ marginTop: 4 }}>
                    <button
                      type="button"
                      className={`booking-status-pill ${selectedBooking.checkInStatus === 'checked_in' ? 'checked_in' : 'pending'}`}
                      onClick={() => handleToggleCheckIn(selectedBooking)}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectedBooking.checkInStatus === 'checked_in' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{selectedBooking.checkInStatus === 'checked_in' ? 'Checked In' : 'Mark Checked In'}</span>
                    </button>
                  </div>
                </div>

                <div className="bdetail-cell">
                  <span className="bdetail-label">Booked At</span>
                  <span className="bdetail-val" style={{ fontSize: '0.82rem' }}>
                    {(toDate(selectedBooking.createdAt) || new Date()).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bdetail-cell" style={{ marginTop: 8 }}>
                  <span className="bdetail-label">Booking Notes</span>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>{selectedBooking.notes}</span>
                </div>
              )}
            </div>

            <div className="ed-modal-footer">
              <button
                type="button"
                className="btn-header-action"
                onClick={() => handleUpdateBookingStatus(selectedBooking, 'confirmed')}
              >
                Set Confirmed
              </button>
              <button
                type="button"
                className="btn-header-action danger"
                onClick={() => handleUpdateBookingStatus(selectedBooking, 'cancelled')}
              >
                Set Cancelled
              </button>
              <button
                type="button"
                className="btn-header-action primary"
                onClick={() => setSelectedBooking(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal C: Add Manual Booking */}
      {isAddBookingOpen && (
        <div className="ed-modal-overlay" onClick={() => setIsAddBookingOpen(false)}>
          <div className="ed-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2>Register Attendee / Add Booking</h2>
              <button type="button" className="ed-modal-close-btn" onClick={() => setIsAddBookingOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking}>
              <div className="ed-modal-body">
                <div className="modal-form-grid">
                  <div className="modal-form-group col-span-2">
                    <label>Participant Full Name *</label>
                    <input
                      type="text"
                      required
                      value={manualBookingForm.customerName}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, customerName: e.target.value })}
                      placeholder="e.g. Vikramaditya Rao"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={manualBookingForm.phone}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={manualBookingForm.email}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, email: e.target.value })}
                      placeholder="rider@example.com"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Number of Tickets</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={manualBookingForm.tickets}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, tickets: e.target.value })}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Pass / Tier</label>
                    <input
                      type="text"
                      value={manualBookingForm.tier}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, tier: e.target.value })}
                      placeholder="e.g. Standard Entry"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Total Amount (₹)</label>
                    <input
                      type="number"
                      value={manualBookingForm.amount}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, amount: e.target.value })}
                      placeholder={String(Number(event.ticketPrice || 0) * (Number(manualBookingForm.tickets) || 1))}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Payment Method</label>
                    <select
                      value={manualBookingForm.paymentMethod}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, paymentMethod: e.target.value })}
                    >
                      <option value="Razorpay (UPI)">Razorpay (UPI)</option>
                      <option value="Razorpay (Card)">Razorpay (Card)</option>
                      <option value="Cash at Gate">Cash at Gate</option>
                      <option value="Complimentary Pass">Complimentary Pass (Free)</option>
                    </select>
                  </div>

                  <div className="modal-form-group col-span-2">
                    <label>Notes / Emergency Contact</label>
                    <textarea
                      rows={2}
                      value={manualBookingForm.notes}
                      onChange={(e) => setManualBookingForm({ ...manualBookingForm, notes: e.target.value })}
                      placeholder="Blood group, emergency contact, or bike model..."
                    />
                  </div>
                </div>
              </div>

              <div className="ed-modal-footer">
                <button type="button" className="btn-header-action" onClick={() => setIsAddBookingOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-header-action primary">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal D: Image Lightbox Fullscreen */}
      {lightboxImage && (
        <div className="lightbox-modal" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxImage(null)}
              title="Close image"
            >
              <X size={28} />
            </button>
            <img src={lightboxImage} alt="Event Fullview" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
