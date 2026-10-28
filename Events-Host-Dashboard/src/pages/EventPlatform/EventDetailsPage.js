import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  Eye,
  IndianRupee,
  PauseCircle,
  PlayCircle,
  Share2,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  X,
  Printer,
  Zap,
  Bike,
  LayoutDashboard,
  ReceiptText,
  MessageSquare,
  Send,
  Search,
  ExternalLink,
  User,
  Tag,
  CalendarDays,
  Clock,
  Mail,
  CreditCard,
  MapPin,
  Phone,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertTriangle,
  Info,
  Loader2,
  XCircle,
  Smartphone,
  Camera,
  KeyRound,
  QrCode,
  Upload,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import EventDetailsSkeleton, { ParticipantTableSkeleton, TransactionTableSkeleton } from '../../components/States/SkeletonLoading';
import { useAuth } from '../../context/AuthContext';
import { useEventsContext } from '../../context/EventsContext';
import { TicketPassView } from './ticketDesigns';
import './TicketDesigns.css';
import { useRegistrations } from '../../hooks/useRegistrations';
import {
  deleteEvent,
  duplicateEvent,
  incrementEventView,
  registerForEvent,
  subscribeToEvent,
  subscribeToEventBookings,
  updateEvent,
  updateEventBookingStatus,
  updateRegistration,
  checkInParticipantTicket,
} from '../../services/firebaseService';
import { currency, downloadCsv, formatDate, formatDateTime } from '../../utils/formatters';
import './EventPlatform.css';
import './EventManagementFlow.css';
import './Participants.css';
import '../Transactions/Transactions.css';
import '../Auth/Auth.css';

// Sound effect generator using Web Audio API
const playChime = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
};

// Intelligent QR payload parser
const parseScannedText = (raw) => {
  if (!raw) return '';
  const text = String(raw).trim();
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      return (
        parsed.ticketNumber ||
        parsed.ticketCode ||
        parsed.code ||
        parsed.bookingId ||
        parsed.orderId ||
        parsed.id ||
        parsed.registrationId ||
        text
      );
    } catch (e) {}
  }
  if (text.includes('?') || text.includes('://')) {
    try {
      const url = new URL(text, window.location.origin);
      const code =
        url.searchParams.get('ticket') ||
        url.searchParams.get('ticketNumber') ||
        url.searchParams.get('code') ||
        url.searchParams.get('id');
      if (code) return code;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    } catch (e) {}
  }
  return text;
};



const getBookingAmount = (booking) => Number(booking.total || booking.amount || booking.amountPaid || booking.ticketPrice || 0);
const getRegistrationAmount = (entry) => Number(entry.amount || entry.totalAmount || entry.ticketPrice || entry.price || 0);

const asDate = (value) => {
  if (!value) return null;
  if (value.toDate && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [y, m, d] = value.trim().split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatEventDateTime = (dateVal, timeVal) => {
  if (!dateVal) return 'Not set';
  const d = asDate(dateVal);
  if (!d) return 'Not set';

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const dateStr = `${day} ${month}`;

  if (timeVal) {
    const match = String(timeVal).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hrs = parseInt(match[1], 10);
      const mins = match[2];
      let ampm = match[3] ? match[3].toUpperCase() : null;
      if (!ampm) {
        ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
      }
      return `${dateStr}, ${String(hrs).padStart(2, '0')}:${mins} ${ampm}`;
    }
    return `${dateStr}, ${timeVal}`;
  }

  if (d.getHours() !== 0 || d.getMinutes() !== 0) {
    const hrs = d.getHours() % 12 || 12;
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    return `${dateStr}, ${String(hrs).padStart(2, '0')}:${mins} ${ampm}`;
  }

  return dateStr;
};

const formatEventUpdatedTime = (value) => {
  if (!value) return 'Not set';
  const d = value.toDate && typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not set';

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  let hrs = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12 || 12;

  return `${day} ${month}, ${String(hrs).padStart(2, '0')}:${mins} ${ampm}`;
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAuthenticated } = useAuth();
  const { getEventSummary, subscribeToLiveEvent } = useEventsContext();

  const isPreview =
    location.pathname.includes('-preview') ||
    !isAuthenticated ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nitroxx_preview_mode') === 'true');

  const goToDashboard = useCallback(() => {
    navigate(isPreview ? '/dashboard-preview' : '/dashboard');
  }, [navigate, isPreview]);

  const goToEvents = useCallback(() => {
    navigate(isPreview ? '/events-preview' : '/events');
  }, [navigate, isPreview]);

  const [event, setEvent] = useState(() => {
    return getEventSummary ? getEventSummary(eventId) : null;
  });
  const [participant, setParticipant] = useState({ fullName: '', email: '', phone: '', age: '', gender: '', city: '' });
  const [loading, setLoading] = useState(() => !event);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [subTab, setSubTab] = useState('Overview');
  const [participantSearch, setParticipantSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');

  // Participant Table States (Enterprise SaaS Table UI)
  const [participantGateFilter, setParticipantGateFilter] = useState('All');
  const [participantTierFilter, setParticipantTierFilter] = useState('All');
  const [participantSortField, setParticipantSortField] = useState('');
  const [participantSortDirection, setParticipantSortDirection] = useState('asc');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState(new Set());
  const [participantPage, setParticipantPage] = useState(1);
  const [participantPageSize, setParticipantPageSize] = useState(10);
  const [copiedParticipantCode, setCopiedParticipantCode] = useState(null);

  // Transaction Table States (Enterprise SaaS Table UI)
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('All');
  const [transactionTimeframe, setTransactionTimeframe] = useState('All');
  const [transactionCategoryFilter, setCategoryFilter] = useState('All');
  const [transactionSortField, setTransactionSortField] = useState('');
  const [transactionSortDirection, setTransactionSortDirection] = useState('asc');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize, setTransactionPageSize] = useState(10);

  const participantSearchRef = useRef(null);
  const transactionSearchRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'Host Official',
      isHost: true,
      text: 'Welcome riders and attendees! 🏍️ Briefing starts 30 minutes before flag-off. Helmets & safety gear are mandatory at the gate.',
      time: 'Yesterday, 6:30 PM',
    },
    {
      id: 2,
      sender: 'Aarav Mehta',
      isHost: false,
      text: 'Hey! Is there dedicated parking for support vehicles near the pit area?',
      time: 'Today, 9:15 AM',
    },
    {
      id: 3,
      sender: 'Host Official',
      isHost: true,
      text: 'Yes Aarav! Paddock parking zone B is reserved for participant support vehicles.',
      time: 'Today, 9:28 AM',
    },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookedTicket, setBookedTicket] = useState(null);
  const [selectedParticipantModal, setSelectedParticipantModal] = useState(null);
  const [copiedModalTicketCode, setCopiedModalTicketCode] = useState(false);
  const [modalCheckInLoading, setModalCheckInLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [meterFilter, setMeterFilter] = useState('All');
  const [copiedEventId, setCopiedEventId] = useState(false);

  // 3 Check-In Modes States (Phone, Laptop Webcam, Code Entry)
  const [showPhoneScanModal, setShowPhoneScanModal] = useState(false);
  const [showLaptopScanModal, setShowLaptopScanModal] = useState(false);
  const [showCodeCheckInModal, setShowCodeCheckInModal] = useState(false);
  const [copiedPhoneUrl, setCopiedPhoneUrl] = useState(false);
  const [phoneHostIp, setPhoneHostIp] = useState(() => {
    try {
      const saved = localStorage.getItem('nitroxx_phone_host_ip');
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '172.20.10.4'
      : window.location.hostname;
  });

  const phoneCheckInUrl = useMemo(() => {
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    const host = (phoneHostIp || '').trim() || window.location.hostname;
    const hostUid = user?.uid || profile?.id || '';
    const hostEmail = user?.email || profile?.email || '';
    const authParams = hostUid
      ? `&autoGate=1&hostUid=${encodeURIComponent(hostUid)}&hostEmail=${encodeURIComponent(hostEmail)}`
      : '&autoGate=1';
    return `${protocol}//${host}${port}/events/${eventId}/checkin?source=qr${authParams}`;
  }, [phoneHostIp, eventId, user?.uid, user?.email, profile?.id, profile?.email]);

  // Laptop Webcam States
  const [laptopScanResult, setLaptopScanResult] = useState(null);
  const [laptopCameraError, setLaptopCameraError] = useState('');
  const [laptopProcessing, setLaptopProcessing] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const laptopScannerRef = useRef(null);
  const isLaptopRunningRef = useRef(false);
  const laptopFileInputRef = useRef(null);

  // Code Check-In States
  const [enteredCheckInCode, setEnteredCheckInCode] = useState('');
  const [matchedAttendee, setMatchedAttendee] = useState(null);
  const [codeSearchError, setCodeSearchError] = useState('');
  const [codeCheckInLoading, setCodeCheckInLoading] = useState(false);

  const handleCopyEventId = (e) => {
    if (e) e.stopPropagation();
    const idToCopy = event?.eventId || event?.id || '';
    if (!idToCopy) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy).then(() => {
        setCopiedEventId(true);
        setTimeout(() => setCopiedEventId(false), 2000);
      });
    }
  };
  const { registrations, loading: loadingRegistrations } = useRegistrations({ eventId });
  const [loadingBookings, setLoadingBookings] = useState(true);

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
    incrementEventView(eventId).catch(() => { });

    const summary = getEventSummary ? getEventSummary(eventId) : null;
    if (summary) {
      setEvent((prev) => prev || summary);
      setLoading(false);
    }

    const subscriber = subscribeToLiveEvent || subscribeToEvent;
    return subscriber(
      eventId,
      (item) => {
        if (item) {
          setEvent(item);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [eventId, getEventSummary, subscribeToLiveEvent]);

  useEffect(() => {
    if (!eventId) return undefined;
    setLoadingBookings(true);
    return subscribeToEventBookings(
      eventId,
      (items) => {
        setBookings(items);
        setLoadingBookings(false);
      },
      (err) => {
        setError(err.message);
        setLoadingBookings(false);
      }
    );
  }, [eventId]);

  const isHost = !event?.hostId || event?.hostId === user?.uid || profile?.role === 'Host';

  // =========================================================================
  // PARTICIPANTS DATA & DEDUPLICATION ENGINE
  // =========================================================================
  const allParticipantsList = useMemo(() => {
    const list = [];
    const seenBookingKeys = new Set();
    const linkedBookingRefIds = new Set();
    const linkedTicketNumbers = new Set();
    const linkedEmails = new Set();
    const linkedPhones = new Set();
    const linkedUserIds = new Set();

    const currentEventId = String(event?.id || eventId || event?.eventId || '').trim();

    // 1. Process Bookings (Primary financial and ticket-holding attendee entities)
    (bookings || []).forEach((b, idx) => {
      // Must match current event
      const bEvId = String(b.eventId || b.event_id || b.event?.id || '').trim();
      if (currentEventId && bEvId && bEvId !== currentEventId) return;

      // Skip cancelled or rejected bookings
      const bStatus = String(b.status || '').toLowerCase().trim();
      if (['cancelled', 'rejected'].includes(bStatus)) return;

      // Unique booking key
      const primaryBookingKey = String(b.id || b.bookingId || b.orderId || `booking-${idx}`);
      if (seenBookingKeys.has(primaryBookingKey)) return;
      seenBookingKeys.add(primaryBookingKey);

      // Match with registration document if exists
      const matchedReg = (registrations || []).find((r) => {
        if (!r) return false;
        if (b.registrationId && (r.id === b.registrationId || r.registrationId === b.registrationId)) return true;
        if (r.bookingId && (b.bookingId === r.bookingId || b.id === r.bookingId || b.orderId === r.bookingId)) return true;
        if (r.id && (r.id.endsWith(`_${b.id}`) || r.id === `${b.eventId}_${b.userId}_${b.id}`)) return true;
        if (r.ticketNumber && (b.ticketNumber === r.ticketNumber || b.ticketCode === r.ticketNumber)) return true;
        if (r.ticketCode && (b.ticketNumber === r.ticketCode || b.ticketCode === r.ticketCode)) return true;
        const bEmail = (b.bookingContact?.email || b.attendee?.email || b.email || '').toLowerCase().trim();
        const rEmail = (r.participantEmail || r.participant?.email || r.email || '').toLowerCase().trim();
        if (bEmail && rEmail && bEmail === rEmail) return true;
        return false;
      });

      // Record linkages so corresponding registration docs are not duplicated
      if (b.id) linkedBookingRefIds.add(String(b.id).trim());
      if (b.bookingId) linkedBookingRefIds.add(String(b.bookingId).trim());
      if (b.orderId) linkedBookingRefIds.add(String(b.orderId).trim());
      if (b.registrationId) linkedBookingRefIds.add(String(b.registrationId).trim());
      if (matchedReg?.id) linkedBookingRefIds.add(String(matchedReg.id).trim());
      if (matchedReg?.registrationId) linkedBookingRefIds.add(String(matchedReg.registrationId).trim());
      if (b.ticketNumber) linkedTicketNumbers.add(String(b.ticketNumber).trim().toUpperCase());
      if (b.ticketCode) linkedTicketNumbers.add(String(b.ticketCode).trim().toUpperCase());
      if (matchedReg?.ticketNumber) linkedTicketNumbers.add(String(matchedReg.ticketNumber).trim().toUpperCase());
      if (matchedReg?.ticketCode) linkedTicketNumbers.add(String(matchedReg.ticketCode).trim().toUpperCase());
      if (b.userId) linkedUserIds.add(String(b.userId).trim());

      const bEmail = (b.bookingContact?.email || b.attendee?.email || b.email || matchedReg?.participantEmail || matchedReg?.participant?.email || matchedReg?.email || '').toLowerCase().trim();
      if (bEmail) linkedEmails.add(bEmail);

      const bPhone = (b.bookingContact?.phone || b.attendee?.phone || b.phone || matchedReg?.participantPhone || matchedReg?.participant?.phone || matchedReg?.phone || '').trim();
      if (bPhone) linkedPhones.add(bPhone);

      const isCheckedIn = (
        b.attendanceStatus === 'Checked In' ||
        b.status === 'Checked In' ||
        b.gateStatus === 'Done' ||
        matchedReg?.attendanceStatus === 'Checked In' ||
        matchedReg?.status === 'Checked In' ||
        matchedReg?.gateStatus === 'Done'
      );
      const gateStatus = isCheckedIn ? 'Done' : 'Pending Gate';

      const att0 = (b.attendees && b.attendees[0]) || null;
      const name = b.bookingContact?.name || att0?.name || b.attendee?.name || b.name || matchedReg?.participantName || matchedReg?.participant?.fullName || matchedReg?.fullName || 'Participant';
      const email = bEmail || 'N/A';
      const phone = bPhone || 'N/A';

      const rawTier = att0?.ticketTier || b.tierName || b.packageName || b.joinAs || matchedReg?.tierName || matchedReg?.ticketType || 'Standard';
      let tierName = rawTier;
      if (rawTier.toLowerCase().includes('platinum')) tierName = 'Platinum';
      else if (rawTier.toLowerCase().includes('vip')) tierName = 'VIP';
      else if (rawTier.toLowerCase().includes('gold')) tierName = 'Gold';
      else if (rawTier.toLowerCase().includes('silver')) tierName = 'Silver';
      else if (rawTier.toLowerCase().includes('plus')) tierName = 'Plus';
      else if (rawTier.toLowerCase().includes('pro')) tierName = 'Pro Rider';

      const ticketNumber = b.ticketNumber || b.ticketCode || matchedReg?.ticketNumber || matchedReg?.ticketCode || `NX-${(b.id || String(idx)).slice(0, 6).toUpperCase()}`;
      const bibNumber = b.bibNumber || matchedReg?.bibNumber || (ticketNumber ? `BIB-${ticketNumber.slice(-4)}` : `BIB-${101 + idx}`);
      const priceNumeric = getBookingAmount(b) || (matchedReg ? getRegistrationAmount(matchedReg) : 0);
      const ticketPrice = priceNumeric > 0 ? currency(priceNumeric) : 'Free';
      const dateObj = asDate(b.createdAt || matchedReg?.registrationDate || matchedReg?.createdAt) || new Date();
      const bookedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const bookedMinutes = dateObj.getTime();
      const isPaid = (b.paymentStatus === 'paid' || b.status === 'paid' || b.status === 'approved' || b.status === 'confirmed' || priceNumeric === 0 || matchedReg?.paymentStatus === 'Paid');
      const paymentStatus = isPaid ? 'Paid' : 'Pending';

      const bookingId = b.bookingId || b.id || b.orderId || matchedReg?.bookingId || `BK-${idx}`;
      const orderId = b.orderId || b.bookingId || b.id || matchedReg?.orderId || `ORD-${idx}`;
      const age = att0?.age || b.attendee?.age || matchedReg?.participant?.age || matchedReg?.age || 'N/A';
      const gender = att0?.gender || b.attendee?.gender || matchedReg?.participant?.gender || matchedReg?.gender || 'N/A';
      const idType = att0?.idType || b.attendee?.idType || matchedReg?.participant?.idType || matchedReg?.idType || 'Govt ID';
      const idNumber = att0?.idNumber || b.attendee?.idNumber || matchedReg?.participant?.idNumber || matchedReg?.idNumber || 'Verified';
      const emergencyContact = b.emergencyContact || matchedReg?.emergencyContact || (b.emergencyPhone ? { name: b.emergencyName || 'Emergency Contact', phone: b.emergencyPhone, relation: b.emergencyRelation || 'Contact' } : null);
      const bikeDetails = b.bikeDetails || matchedReg?.bikeDetails || null;
      const paymentMethod = b.paymentMethod || b.payment?.method || matchedReg?.paymentMethod || (priceNumeric > 0 ? 'Razorpay / Online' : 'Complimentary Pass');
      const paymentId = b.paymentId || b.razorpay_payment_id || matchedReg?.paymentId || 'N/A';
      const attendeesList = (b.attendees && b.attendees.length > 0)
        ? b.attendees
        : (matchedReg?.attendees && matchedReg.attendees.length > 0
          ? matchedReg.attendees
          : [{ name, email: email || 'N/A', phone, role: tierName, idType }]);
      const preferences = b.preferences || matchedReg?.preferences || null;
      const fees = b.fees || matchedReg?.fees || null;
      const qrPayload = b.qrPayload || matchedReg?.qrPayload || JSON.stringify({ ticketNumber, bookingId, eventId: currentEventId, name, bibNumber });

      list.push({
        id: b.id || (matchedReg?.id ? `reg-${matchedReg.id}` : `bk-${idx}`),
        registrationId: matchedReg?.id || b.registrationId || b.id,
        bookingId,
        orderId,
        name,
        participantName: name,
        email: email || 'N/A',
        participantEmail: email || 'N/A',
        phone,
        participantPhone: phone,
        avatar: b.userPhoto || b.photoURL || matchedReg?.participantPhoto || matchedReg?.avatar || null,
        avatarInitial: name.charAt(0).toUpperCase(),
        eventTitle: event?.title || 'Current Event',
        tierName,
        ticketFor: b.ticketFor || att0?.joinAs || (b.vehicle ? 'Rider' : 'Attendee'),
        ticketTier: `${tierName} · ${b.ticketFor || att0?.joinAs || (b.vehicle ? 'Rider' : 'Attendee')}`,
        ticketNumber,
        bibNumber,
        ticketPrice,
        priceNumeric,
        bookedDate,
        bookedMinutes,
        paymentStatus,
        paymentMethod,
        paymentId,
        gateStatus,
        attendanceStatus: isCheckedIn ? 'Checked In' : 'Not Checked In',
        isCheckedIn,
        checkInTime: b.checkInTime || matchedReg?.checkInTime || null,
        ticketCode: ticketNumber,
        vehicle: b.vehicle || matchedReg?.vehicle || 'Motorcycle',
        vehiclePlate: b.vehiclePlate || matchedReg?.vehiclePlate || 'N/A',
        city: b.city || event?.city || 'India',
        ticketsCount: Number(b.totalTickets || ((b.attendeeCounts?.adults || 0) + (b.attendeeCounts?.children || 0)) || 1),
        status: isPaid ? 'Confirmed' : (b.status || 'Confirmed'),
        age,
        gender,
        idType,
        idNumber,
        emergencyContact,
        bikeDetails,
        attendeesList,
        preferences,
        fees,
        qrPayload,
        isFromBooking: true,
        rawBooking: b,
        rawRegistration: matchedReg || null,
      });
    });

    // 2. Process Standalone Registrations (Only direct confirmed host entries not originating from bookings)
    (registrations || []).forEach((r, idx) => {
      // Must match current event
      const rEvId = String(r.eventId || r.event_id || r.event?.id || '').trim();
      if (currentEventId && rEvId && rEvId !== currentEventId) return;

      const rId = String(r.id || '').trim();
      const rRegId = String(r.registrationId || '').trim();
      const rBookingId = String(r.bookingId || '').trim();
      const rTicketNum = String(r.ticketNumber || r.ticketCode || '').trim().toUpperCase();
      const rEmail = (r.participantEmail || r.participant?.email || r.email || '').toLowerCase().trim();
      const rPhone = (r.participantPhone || r.participant?.phone || r.phone || '').trim();

      // Check if already linked to any processed booking
      const isLinkedToBooking =
        (rId && linkedBookingRefIds.has(rId)) ||
        (rRegId && linkedBookingRefIds.has(rRegId)) ||
        (rBookingId && linkedBookingRefIds.has(rBookingId)) ||
        (rTicketNum && linkedTicketNumbers.has(rTicketNum)) ||
        Array.from(linkedBookingRefIds).some((bId) => rId.endsWith(`_${bId}`) || rRegId.endsWith(`_${bId}`));

      if (isLinkedToBooking) return;

      // Exclude abandoned checkout attempts (must be confirmed / paid / complimentary)
      const isConfirmed =
        r.status === 'Confirmed' ||
        r.status === 'approved' ||
        r.paymentStatus === 'Paid' ||
        r.paymentStatus === 'paid' ||
        (getRegistrationAmount(r) === 0 && r.status !== 'Pending' && r.status !== 'Cancelled' && r.status !== 'rejected');

      if (!isConfirmed) return;

      const id = r.registrationId || r.id || `reg-${idx}`;
      const name = r.participantName || r.participant?.fullName || r.fullName || r.name || 'Participant';
      const rawTier = r.tierName || r.ticketType || 'Standard';
      let tierName = rawTier;
      if (rawTier.toLowerCase().includes('platinum')) tierName = 'Platinum';
      else if (rawTier.toLowerCase().includes('vip')) tierName = 'VIP';
      else if (rawTier.toLowerCase().includes('gold')) tierName = 'Gold';
      else if (rawTier.toLowerCase().includes('silver')) tierName = 'Silver';
      else if (rawTier.toLowerCase().includes('plus')) tierName = 'Plus';
      else if (rawTier.toLowerCase().includes('pro')) tierName = 'Pro Rider';

      const ticketNumber = r.ticketNumber || r.ticketCode || `NX-${(r.id || String(idx)).slice(0, 6).toUpperCase()}`;
      const bibNumber = r.bibNumber || (ticketNumber ? `BIB-${ticketNumber.slice(-4)}` : `BIB-${201 + idx}`);
      const priceNumeric = getRegistrationAmount(r);
      const ticketPrice = priceNumeric > 0 ? currency(priceNumeric) : 'Free';
      const dateObj = asDate(r.registrationDate || r.createdAt) || new Date();
      const bookedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const bookedMinutes = dateObj.getTime();
      const isCheckedIn = (r.attendanceStatus === 'Checked In' || r.status === 'Checked In' || r.gateStatus === 'Done');
      const gateStatus = isCheckedIn ? 'Done' : 'Pending Gate';
      const paymentStatus = (r.paymentStatus === 'Paid' || priceNumeric === 0 || r.status === 'Confirmed') ? 'Paid' : (r.paymentStatus || 'Pending');

      const bookingId = r.bookingId || id;
      const orderId = r.orderId || r.bookingId || id;
      const phone = rPhone || 'N/A';
      const age = r.participant?.age || r.age || 'N/A';
      const gender = r.participant?.gender || r.gender || 'N/A';
      const idType = r.participant?.idType || r.idType || 'Govt ID';
      const idNumber = r.participant?.idNumber || r.idNumber || 'Verified';
      const emergencyContact = r.participant?.emergencyContact || r.emergencyContact || (r.emergencyPhone ? { name: r.emergencyName || 'Emergency Contact', phone: r.emergencyPhone, relation: r.emergencyRelation || 'Contact' } : null);
      const bikeDetails = r.participant?.bikeDetails || r.bikeDetails || null;
      const paymentMethod = r.paymentMethod || (priceNumeric > 0 ? 'Razorpay / Online' : 'Complimentary Pass');
      const paymentId = r.paymentId || 'N/A';
      const attendeesList = (r.attendees && r.attendees.length > 0)
        ? r.attendees
        : [{ name, email: rEmail || 'N/A', phone, role: tierName, idType }];
      const preferences = r.preferences || null;
      const fees = r.fees || null;
      const qrPayload = r.qrPayload || JSON.stringify({ ticketNumber, bookingId, eventId: currentEventId, name, bibNumber });

      list.push({
        id,
        registrationId: id,
        bookingId,
        orderId,
        name,
        participantName: name,
        email: rEmail || 'N/A',
        participantEmail: rEmail || 'N/A',
        phone,
        participantPhone: phone,
        avatar: r.participantPhoto || r.avatar || null,
        avatarInitial: name.charAt(0).toUpperCase(),
        eventTitle: event?.title || 'Current Event',
        tierName,
        ticketFor: r.ticketFor || (r.participant?.vehicleNumber || r.vehicle ? 'Rider' : 'Attendee'),
        ticketTier: `${tierName} · ${r.ticketFor || (r.participant?.vehicleNumber || r.vehicle ? 'Rider' : 'Attendee')}`,
        ticketNumber,
        bibNumber,
        ticketPrice,
        priceNumeric,
        bookedDate,
        bookedMinutes,
        paymentStatus,
        paymentMethod,
        paymentId,
        gateStatus,
        attendanceStatus: isCheckedIn ? 'Checked In' : 'Not Checked In',
        isCheckedIn,
        checkInTime: r.checkInTime || r.checkedInAt || null,
        ticketCode: ticketNumber,
        vehicle: r.participant?.vehicleNumber || r.vehicle || 'Motorcycle',
        vehiclePlate: r.participant?.vehicleNumber || r.vehiclePlate || 'N/A',
        city: r.participant?.city || r.city || event?.city || 'India',
        ticketsCount: Number(r.ticketsCount || r.tickets || 1),
        status: r.status || 'Confirmed',
        age,
        gender,
        idType,
        idNumber,
        emergencyContact,
        bikeDetails,
        attendeesList,
        preferences,
        fees,
        qrPayload,
        isFromBooking: false,
        rawRegistration: r,
        rawBooking: null,
      });
    });

    return list;
  }, [registrations, bookings, event?.city, event?.title, event?.id, event?.eventId, eventId]);

  // Auto-sync event registeredCount in Firestore if it was inflated or out of sync
  useEffect(() => {
    if (event && !loading && !loadingBookings && !loadingRegistrations) {
      const trueCount = allParticipantsList.length;
      if (event.registeredCount !== undefined && event.registeredCount !== trueCount && trueCount > 0) {
        updateEvent(event.id || eventId, { registeredCount: trueCount }).catch(() => {});
      }
    }
  }, [event, allParticipantsList.length, loading, loadingBookings, loadingRegistrations, eventId]);

  const analytics = useMemo(() => {
    const activeBookings = bookings.filter((booking) => !['cancelled', 'rejected'].includes(String(booking.status || '').toLowerCase().trim()));
    const confirmedBookings = activeBookings.filter((booking) => ['approved', 'confirmed', 'paid'].includes(String(booking.status || '').toLowerCase().trim())).length;
    const pendingBookings = activeBookings.filter((booking) => ['pending', 'created'].includes(String(booking.status || '').toLowerCase().trim())).length;
    const cancelledBookings = bookings.filter((booking) => ['cancelled', 'rejected'].includes(String(booking.status || '').toLowerCase().trim())).length;

    const checkedIn = allParticipantsList.filter((p) => p.isCheckedIn || p.gateStatus === 'Done').length;
    const revenueFromParticipants = allParticipantsList.reduce((sum, p) => sum + (p.priceNumeric || 0), 0);
    const revenue = Math.max(Number(event?.revenue || 0), revenueFromParticipants);
    const capacity = Number(event?.capacity || 0);

    const sold = allParticipantsList.length;

    const platformFees = Math.round(revenue * 0.08);
    const taxes = Math.round(revenue * 0.18);
    const sourceData = [
      { name: 'Direct', value: Number(event?.views || 0) },
      { name: 'Bookings', value: allParticipantsList.filter((p) => p.isFromBooking).length },
      { name: 'Registrations', value: allParticipantsList.filter((p) => !p.isFromBooking).length },
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
  }, [allParticipantsList, bookings, event]);

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
      const generatedTicketNum = `NX-${Date.now().toString(36).toUpperCase()}`;
      await registerForEvent({
        eventId: event.id,
        hostId: event.hostId,
        userId: user.uid,
        participant,
        ticketPrice: event.ticketPrice,
      });
      setMessage('Registration confirmed! Your official ticket is ready below.');
      setBookedTicket({
        ticketNumber: generatedTicketNum,
        participant,
        event,
        tierName: event.ticketType === 'Free' ? 'Free Pass' : 'Confirmed Entry',
      });
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setMessage('Event link copied.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage('Failed to copy link.');
    }
  };

  const removeEvent = async () => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    await deleteEvent(event.id);
    navigate('/events');
  };

  const displayStatus = useMemo(() => {
    if (!event) return 'Draft';
    if (event.status === 'Cancelled') return 'Cancelled';
    if (event.status === 'Draft') return 'Draft';
    if (event.startDate) {
      const sDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
      if (!isNaN(sDate.getTime()) && sDate > new Date()) {
        return (event.status && event.status !== 'Complete' && event.status !== 'Completed') ? event.status : 'Published';
      }
    }
    return event.status || 'Published';
  }, [event]);

  const timelineData = useMemo(() => {
    if (!event) return { steps: [], badge: { text: 'UPCOMING', class: 'upcoming' } };

    const parseWithTime = (dateVal, timeVal, defaultTimeStr) => {
      if (!dateVal) return null;
      const d = asDate(dateVal);
      if (!d) return null;
      const timeToUse = timeVal || defaultTimeStr;
      if (timeToUse && typeof timeToUse === 'string') {
        const match = timeToUse.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (match) {
          let hrs = parseInt(match[1], 10);
          const mins = parseInt(match[2], 10);
          const mod = match[3] ? match[3].toUpperCase() : null;
          if (mod === 'PM' && hrs < 12) hrs += 12;
          if (mod === 'AM' && hrs === 12) hrs = 0;
          d.setHours(hrs, mins, 0, 0);
        }
      }
      return d;
    };

    const getCompleteTime = (endTimeStr) => {
      if (!endTimeStr) return '08:00 PM';
      const match = endTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return '08:00 PM';
      let hrs = parseInt(match[1], 10);
      const mins = match[2];
      const mod = match[3] ? match[3].toUpperCase() : null;
      if (mod === 'PM' && hrs < 12) hrs += 12;
      if (mod === 'AM' && hrs === 12) hrs = 0;
      hrs = (hrs + 1) % 24;
      const period = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      return `${String(displayHrs).padStart(2, '0')}:${mins} ${period}`;
    };

    const formatStepDateTime = (dateVal, explicitTimeStr) => {
      if (!dateVal) return '—';
      const d = asDate(dateVal);
      if (!d) return '—';
      const dayMonth = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (explicitTimeStr && typeof explicitTimeStr === 'string' && explicitTimeStr.trim()) {
        return `${dayMonth}, ${explicitTimeStr.trim()}`;
      }
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dayMonth}, ${timeStr}`;
    };

    const now = new Date();
    const isCancelled = event.status === 'Cancelled';
    const isCompleted = event.status === 'Completed' || event.status === 'Complete';
    const isDraft = event.status === 'Draft';

    const t1 = parseWithTime(event.registrationStart, event.registrationStartTime, '09:00 AM');
    const t2 = parseWithTime(event.registrationEnd, event.registrationEndTime, '11:59 PM');
    const t3 = parseWithTime(event.startDate, event.startTime, '09:00 AM');
    const t4 = parseWithTime(event.endDate || event.startDate, event.endTime, '06:00 PM');
    const t5 = t4 ? new Date(t4.getTime() + 2 * 60 * 60 * 1000) : null;

    let stepStatuses = ['pending', 'pending', 'pending', 'pending', 'pending'];
    let badge = { text: 'UPCOMING', class: 'upcoming' };

    if (isCancelled) {
      stepStatuses = ['done', 'pending', 'pending', 'pending', 'pending'];
      badge = { text: 'CANCELLED', class: 'cancelled' };
    } else if (isDraft) {
      stepStatuses = ['pending', 'pending', 'pending', 'pending', 'pending'];
      badge = { text: 'DRAFT', class: 'upcoming' };
    } else if (isCompleted || (t4 && now >= t4 && (!t5 || now >= t5))) {
      stepStatuses = ['done', 'done', 'done', 'done', 'done'];
      badge = { text: 'COMPLETED', class: 'completed' };
    } else if (t4 && now >= t4) {
      stepStatuses = ['done', 'done', 'done', 'done', 'active'];
      badge = { text: 'CLOSING CEREMONY', class: 'live' };
    } else if (t3 && now >= t3) {
      stepStatuses = ['done', 'done', 'done', 'active', 'pending'];
      badge = { text: 'EVENT LIVE', class: 'live' };
    } else if (t2 && now >= t2) {
      stepStatuses = ['done', 'done', 'active', 'pending', 'pending'];
      badge = { text: 'PREPARING FLAG-OFF', class: 'upcoming' };
    } else if (t1 && now >= t1) {
      // Registration is actively open right now
      if (registrations && registrations.length > 0) {
        stepStatuses = ['done', 'active', 'pending', 'pending', 'pending'];
      } else {
        stepStatuses = ['active', 'pending', 'pending', 'pending', 'pending'];
      }
      badge = { text: 'REGISTRATION OPEN', class: 'live' };
    } else {
      // Event is upcoming and registration has not opened yet (today is before registrationStart)
      stepStatuses = ['pending', 'pending', 'pending', 'pending', 'pending'];
      badge = { text: 'UPCOMING', class: 'upcoming' };
    }

    const steps = [
      {
        id: 'first-reg',
        stepNum: 1,
        title: 'First Registration',
        description: 'Registration window opened — ticket booking live',
        status: stepStatuses[0],
        hasDate: Boolean(event.registrationStart),
        dateTimeStr: formatStepDateTime(event.registrationStart, event.registrationStartTime || '09:00 AM'),
      },
      {
        id: 'reg-end',
        stepNum: 2,
        title: 'Registration End',
        description: 'Booking window closed — participant roster locked',
        status: stepStatuses[1],
        hasDate: Boolean(event.registrationEnd),
        dateTimeStr: formatStepDateTime(event.registrationEnd, event.registrationEndTime || '11:59 PM'),
      },
      {
        id: 'event-start',
        stepNum: 3,
        title: 'Event Start',
        description: 'Official flag-off & rider briefing underway',
        status: stepStatuses[2],
        hasDate: Boolean(event.startDate),
        dateTimeStr: formatStepDateTime(event.startDate, event.startTime || '09:00 AM'),
      },
      {
        id: 'event-end',
        stepNum: 4,
        title: 'Event End',
        description: 'Ride finish line & track verification complete',
        status: stepStatuses[3],
        hasDate: Boolean(event.endDate || event.startDate),
        dateTimeStr: formatStepDateTime(event.endDate || event.startDate, event.endTime || '06:00 PM'),
      },
      {
        id: 'event-complete',
        stepNum: 5,
        title: 'Event Complete',
        description: 'Podium ceremony, certificates & event wrap-up',
        status: stepStatuses[4],
        hasDate: Boolean(event.endDate || event.startDate),
        dateTimeStr: formatStepDateTime(event.endDate || event.startDate, getCompleteTime(event.endTime)),
      },
    ];

    return { steps, badge };
  }, [event, registrations]);

  const renderTimelineSection = () => {
    const { steps } = timelineData;
    if (!steps || steps.length === 0) return null;

    return (
      <div className="event-timeline-card">
        <div className="event-timeline-header">
          <div className="event-timeline-header-title-wrap">
            <h2 className="event-timeline-header-title">Event timeline</h2>
            {/* <p className="event-timeline-header-sub">Milestone progression & official schedule</p> */}
          </div>
          {/* <div className={`event-timeline-top-badge ${badge.class}`}>
            <span className="timeline-badge-dot" />
            {badge.text}
          </div> */}
        </div>

        <div className="event-timeline-stepper">
          {steps.map((step, index) => (
            <div key={step.id} className="event-timeline-step-row">
              <div className="event-timeline-track-col">
                <div className={`event-timeline-node ${step.status}`}>
                  {step.status === 'done' && <Check size={14} strokeWidth={3} />}
                  {step.status === 'active' && <span className="event-timeline-active-ring" />}
                  {step.status === 'pending' && <span className="event-timeline-step-index">{step.stepNum}</span>}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`event-timeline-connector ${step.status === 'done' ? 'solid-done' : 'dashed-pending'
                      }`}
                  />
                )}
              </div>

              <div className="event-timeline-content-col">
                <div className="event-timeline-title-row">
                  <h3 className={`event-timeline-step-title ${step.status}`}>
                    {step.title}
                  </h3>
                  {step.status === 'done' && (
                    <span className="event-timeline-pill done">
                      <Check size={11} strokeWidth={2.5} /> DONE
                    </span>
                  )}
                  {step.status === 'active' && (
                    <span className="event-timeline-pill active">
                      <span className="pill-dot-active" /> ACTIVE
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="event-timeline-pill pending">
                      PENDING
                    </span>
                  )}
                </div>
                <p className={`event-timeline-step-desc ${step.status}`}>
                  {step.description}
                </p>
              </div>

              <div className={`event-timeline-datetime-col ${step.status}`}>
                {step.dateTimeStr}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const packageMeterData = useMemo(() => {
    const activeBookings = bookings.filter((b) => {
      const st = String(b.status || b.approvalStatus || '').toLowerCase().trim();
      return st !== 'cancelled' && st !== 'rejected';
    });

    let rawPkgs = [];
    if (Array.isArray(event?.packages) && event.packages.length > 0) {
      rawPkgs = event.packages;
    } else if (Array.isArray(event?.tiers) && event.tiers.length > 0) {
      rawPkgs = event.tiers;
    } else if (Array.isArray(event?.tickets) && event.tickets.length > 0) {
      rawPkgs = event.tickets;
    }

    const getBookingTickets = (b) => {
      const adult = Number(b.attendeeCounts?.adults || 0);
      const child = Number(b.attendeeCounts?.children || 0);
      if (adult + child > 0) return adult + child;
      if (b.totalTickets && Number(b.totalTickets) > 0) return Number(b.totalTickets);
      if (Array.isArray(b.attendees) && b.attendees.length > 0) return b.attendees.length;
      if (b.seats && Number(b.seats) > 0) return Number(b.seats);
      if (b.ticketsCount && Number(b.ticketsCount) > 0) return Number(b.ticketsCount);
      if (b.quantity && Number(b.quantity) > 0) return Number(b.quantity);
      return 1;
    };

    let pkgs = [];

    if (rawPkgs.length > 0) {
      const packageBookingsMap = new Map();
      rawPkgs.forEach((_, idx) => packageBookingsMap.set(idx, []));
      const unmatchedBookings = [];

      activeBookings.forEach((b) => {
        // If there is only 1 package, all event bookings belong to this package
        if (rawPkgs.length === 1) {
          packageBookingsMap.get(0).push(b);
          return;
        }

        let matchedIdx = -1;

        for (let idx = 0; idx < rawPkgs.length; idx++) {
          const pkg = rawPkgs[idx];
          const pkgId = String(pkg.id || '').trim();
          const pkgKey = String(pkg.key || `tier_${idx}`).trim();
          const pkgName = String(pkg.name || '').trim().toLowerCase();
          const pkgFor = String(pkg.ticketFor || '').trim().toLowerCase();

          // 1. Direct ID / Key match
          const bPkgId = String(b.packageId || b.tierId || b.tier?.id || b.package?.id || b.selectedTier?.id || '').trim();
          const bTierKey = String(b.tier?.key || b.key || '').trim();
          if (pkgId && bPkgId && (bPkgId === pkgId || bPkgId === pkgKey)) {
            matchedIdx = idx;
            break;
          }
          if (pkgKey && bTierKey && bTierKey === pkgKey) {
            matchedIdx = idx;
            break;
          }

          // Counts map match (e.g. b.counts = { [pkgId]: 1 } or { [pkgName]: 1 })
          if (b.counts && typeof b.counts === 'object') {
            if (pkg.id && Number(b.counts[pkg.id]) > 0) { matchedIdx = idx; break; }
            if (pkg.key && Number(b.counts[pkg.key]) > 0) { matchedIdx = idx; break; }
            if (pkg.name && Number(b.counts[pkg.name]) > 0) { matchedIdx = idx; break; }
            if (Number(b.counts[`tier_${idx}`]) > 0) { matchedIdx = idx; break; }
          }

          // 2. Name / Title match
          const bNames = [
            b.packageName,
            b.tierName,
            b.tier?.name,
            b.tier?.title,
            b.package?.name,
            b.ticketName,
            b.ticketType,
            b.selectedTier?.name,
          ].filter(Boolean).map((s) => String(s).trim().toLowerCase());

          if (pkgName && bNames.some((n) => n === pkgName || n.includes(pkgName) || pkgName.includes(n))) {
            matchedIdx = idx;
            break;
          }

          // 3. Classification / ticketFor match
          const bTicketFor = String(b.ticketFor || '').trim().toLowerCase();
          if (pkgFor && bTicketFor && pkgFor === bTicketFor) {
            matchedIdx = idx;
            break;
          }

          // 4. Role match via joinAs ('biker' -> 'rider', 'pillion' -> 'pillion')
          const bJoinAs = String(b.joinAs || '').trim().toLowerCase();
          if (pkgFor && bJoinAs) {
            if ((bJoinAs === 'biker' || bJoinAs === 'rider' || bJoinAs === 'driver') &&
                (pkgFor === 'rider' || pkgFor === 'biker' || pkgFor === 'driver')) {
              matchedIdx = idx;
              break;
            }
            if ((bJoinAs === 'pillion' || bJoinAs === 'passenger') &&
                (pkgFor === 'pillion' || pkgFor === 'passenger')) {
              matchedIdx = idx;
              break;
            }
            if (bJoinAs === pkgFor) {
              matchedIdx = idx;
              break;
            }
          }
        }

        if (matchedIdx >= 0) {
          packageBookingsMap.get(matchedIdx).push(b);
        } else {
          unmatchedBookings.push(b);
        }
      });

      // Distribute any unmatched bookings to best price-matching package or package 0
      unmatchedBookings.forEach((b) => {
        const bAmount = getBookingAmount(b);
        let bestIdx = 0;
        let bestDiff = Infinity;
        rawPkgs.forEach((pkg, idx) => {
          const pkgPrice = Number(pkg.discountPrice || pkg.price || 0);
          const diff = Math.abs(bAmount - pkgPrice);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = idx;
          }
        });
        packageBookingsMap.get(bestIdx).push(b);
      });

      pkgs = rawPkgs.map((pkg, idx) => {
        const pkgName = pkg.name || pkg.ticketFor || `Package ${idx + 1}`;
        const price = Number(pkg.discountPrice || pkg.price || 0);
        const capacity = Number(pkg.seats || pkg.capacity || 0);

        const matchedBookings = packageBookingsMap.get(idx) || [];
        const soldFromBookings = matchedBookings.reduce((sum, b) => sum + getBookingTickets(b), 0);

        const soldFromRegistrations = registrations.filter((r) => {
          const rPkgId = r.packageId || r.tierId;
          const rName = (r.tierName || r.packageName || r.ticketType || r.ticketFor || '').toLowerCase().trim();
          if (rPkgId && (rPkgId === pkg.id || rPkgId === pkg.key)) return true;
          if (rName && rName === pkgName.toLowerCase().trim()) return true;
          if (rawPkgs.length === 1) return true;
          return false;
        }).reduce((sum, r) => sum + Number(r.ticketsCount || r.tickets || 1), 0);

        const explicitSoldCount = Number(pkg.soldCount || pkg.sold || 0);
        const eventCountFallback = rawPkgs.length === 1 ? allParticipantsList.length : 0;
        const sold = Math.max(explicitSoldCount, soldFromBookings, soldFromRegistrations, eventCountFallback);
        const remaining = capacity > 0 ? Math.max(0, capacity - sold) : 0;

        const bookingRevenue = matchedBookings.reduce((sum, b) => sum + getBookingAmount(b), 0);
        const revenue = Number(pkg.revenue || 0) || bookingRevenue || (sold * price);
        const unsoldAmount = remaining * price;
        const pct = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : (sold > 0 ? 100 : 0);
        const unsoldPct = capacity > 0 ? Math.max(0, Math.round((remaining / capacity) * 100)) : 0;

        return {
          id: pkg.id || `pkg-${idx}`,
          name: pkgName,
          price,
          capacity,
          sold,
          remaining,
          revenue,
          unsoldAmount,
          pct,
          unsoldPct,
        };
      });
    }

    if (pkgs.length === 0) {
      const primaryName = event?.ticketType || (event?.category ? `${event.category} Pass` : 'General Admission');
      const price = Number(event?.ticketPrice || 0);
      const capacity = Number(event?.capacity || 0);

      const totalBookingTickets = activeBookings.reduce((sum, b) => sum + getBookingTickets(b), 0);
      const totalRegTickets = registrations.reduce((sum, r) => sum + Number(r.ticketsCount || r.tickets || 1), 0);

      const sold = allParticipantsList.length || Math.max(
        totalBookingTickets,
        totalRegTickets
      );

      const remaining = capacity > 0 ? Math.max(0, capacity - sold) : 0;
      const totalBookingRevenue = activeBookings.reduce((sum, b) => sum + getBookingAmount(b), 0);
      const revenue = Number(event?.revenue || 0) || totalBookingRevenue || (sold * price);
      const unsoldAmount = remaining * price;
      const pct = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : (sold > 0 ? 100 : 0);
      const unsoldPct = capacity > 0 ? Math.max(0, Math.round((remaining / capacity) * 100)) : 0;

      pkgs.push({
        id: 'default-ticket',
        name: primaryName,
        price,
        capacity,
        sold,
        remaining,
        revenue,
        unsoldAmount,
        pct,
        unsoldPct,
      });

      if (event?.addons && Array.isArray(event.addons) && event.addons.length > 0) {
        event.addons.forEach((addon, idx) => {
          const addonPrice = Number(addon.price || 0);
          pkgs.push({
            id: addon.id || `addon-${idx}`,
            name: addon.name || `Add-on ${idx + 1}`,
            price: addonPrice,
            capacity: capacity || 50,
            sold: 0,
            remaining: capacity || 50,
            revenue: 0,
            unsoldAmount: (capacity || 50) * addonPrice,
            pct: 0,
            unsoldPct: 100,
          });
        });
      }
    }

    return pkgs;
  }, [allParticipantsList, bookings, event, registrations]);

  const renderTicketMeterSection = () => {
    const meterColors = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899'];

    let filteredPackages = packageMeterData;
    if (meterFilter === 'Sold') {
      filteredPackages = packageMeterData.filter((p) => p.sold > 0);
    } else if (meterFilter === 'Unsold') {
      filteredPackages = packageMeterData.filter((p) => p.remaining > 0 || p.sold === 0);
    }

    return (
      <div className="ticket-meter-card">
        <div className="ticket-meter-header">
          <h2 className="ticket-meter-title">Ticket Meter</h2>
          <div className="ticket-meter-filter-bar">
            {['All', 'Sold', 'Unsold'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`ticket-meter-filter-btn ${meterFilter === opt ? 'active' : ''}`}
                onClick={() => setMeterFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="ticket-meter-list">
          {filteredPackages.length === 0 ? (
            <div className="ticket-meter-empty">
              No ticket packages in {meterFilter.toLowerCase()} category.
            </div>
          ) : (
            filteredPackages.map((pkg, idx) => (
              <div key={pkg.id} className="ticket-meter-item">
                <div className="ticket-meter-item-head">
                  <span className="ticket-meter-item-name">{pkg.name}</span>
                  <span className="ticket-meter-item-amount">
                    {meterFilter === 'Unsold' ? (
                      <>
                        {currency(pkg.unsoldAmount)}
                        <span className="ticket-meter-item-sub">
                          {' '}• {pkg.remaining} remains not sold {pkg.capacity ? `(${pkg.unsoldPct}% available)` : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        {currency(pkg.revenue)}
                        <span className="ticket-meter-item-sub">
                          {' '}• {pkg.remaining} remains not sold ({pkg.sold} sold)
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="ticket-meter-track">
                  <div
                    className="ticket-meter-fill"
                    style={{
                      width: `${meterFilter === 'Unsold' ? pkg.unsoldPct : pkg.pct}%`,
                      backgroundColor: meterColors[idx % meterColors.length],
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // PARTICIPANTS TABLE ENGINE (allParticipantsList defined above for analytics)
  // =========================================================================

  // Distinct Filter Options for Participants
  const participantTierOptions = useMemo(() => {
    const set = new Set(allParticipantsList.map((p) => p.tierName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [allParticipantsList]);

  // Filtered & Sorted Participants
  const filteredParticipants = useMemo(() => {
    let result = [...allParticipantsList];

    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.phone && p.phone.toLowerCase().includes(q)) ||
          (p.ticketNumber && p.ticketNumber.toLowerCase().includes(q)) ||
          (p.bibNumber && p.bibNumber.toLowerCase().includes(q)) ||
          (p.tierName && p.tierName.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.vehicle && p.vehicle.toLowerCase().includes(q))
      );
    }

    if (participantGateFilter !== 'All') {
      result = result.filter((p) => p.gateStatus === participantGateFilter);
    }

    if (participantTierFilter !== 'All') {
      result = result.filter((p) => p.tierName === participantTierFilter);
    }

    if (participantSortField) {
      result.sort((a, b) => {
        let valA = a[participantSortField];
        let valB = b[participantSortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return participantSortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        if (strA < strB) return participantSortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return participantSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    allParticipantsList,
    participantSearch,
    participantGateFilter,
    participantTierFilter,
    participantSortField,
    participantSortDirection,
  ]);

  // Participant Pagination
  const totalParticipantPages = Math.max(1, Math.ceil(filteredParticipants.length / participantPageSize));
  const paginatedParticipants = useMemo(() => {
    const start = (participantPage - 1) * participantPageSize;
    return filteredParticipants.slice(start, start + participantPageSize);
  }, [filteredParticipants, participantPage, participantPageSize]);

  useEffect(() => {
    if (participantPage > totalParticipantPages) {
      setParticipantPage(1);
    }
  }, [totalParticipantPages, participantPage]);

  // Active Participant Filters Count
  const activeParticipantFiltersCount = useMemo(() => {
    let count = 0;
    if (participantSearch.trim()) count++;
    if (participantGateFilter !== 'All') count++;
    if (participantTierFilter !== 'All') count++;
    return count;
  }, [participantSearch, participantGateFilter, participantTierFilter]);

  const handleResetParticipantFilters = () => {
    setParticipantSearch('');
    setParticipantGateFilter('All');
    setParticipantTierFilter('All');
    setParticipantPage(1);
  };

  const handleSortParticipants = (field) => {
    if (participantSortField === field) {
      setParticipantSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setParticipantSortField(field);
      setParticipantSortDirection('asc');
    }
  };

  const handleSelectAllParticipants = (e) => {
    if (e.target.checked) {
      setSelectedParticipantIds(new Set(paginatedParticipants.map((p) => p.id)));
    } else {
      setSelectedParticipantIds(new Set());
    }
  };

  const handleSelectParticipantRow = (id, e) => {
    e.stopPropagation();
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllParticipantsSelected =
    paginatedParticipants.length > 0 &&
    paginatedParticipants.every((p) => selectedParticipantIds.has(p.id));

  const handleCopyParticipantCode = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedParticipantCode(code);
    setTimeout(() => setCopiedParticipantCode(null), 2000);
  };

  const handleExportParticipantsCSV = () => {
    const listToExport =
      selectedParticipantIds.size > 0
        ? allParticipantsList.filter((p) => selectedParticipantIds.has(p.id))
        : filteredParticipants;

    downloadCsv(
      `event_${event?.id || 'event'}_participants.csv`,
      listToExport.map((p) => ({
        ParticipantName: p.name,
        Email: p.email,
        Phone: p.phone,
        Tier: p.tierName,
        TicketFor: p.ticketFor,
        TicketNumber: p.ticketNumber,
        BibNumber: p.bibNumber,
        BookedDate: p.bookedDate,
        Price: p.ticketPrice,
        PaymentStatus: p.paymentStatus,
        GateStatus: p.gateStatus,
        Vehicle: p.vehicle,
        VehiclePlate: p.vehiclePlate,
        City: p.city,
      }))
    );
  };

  // -------------------------------------------------------------------------
  // GATE CHECK-IN ACTIONS & HANDLERS (Phone, Laptop Webcam, Code Entry)
  // -------------------------------------------------------------------------
  const handleCopyPhoneUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneCheckInUrl).then(() => {
        setCopiedPhoneUrl(true);
        setTimeout(() => setCopiedPhoneUrl(false), 2500);
      });
    }
  };

  const findParticipantByCode = useCallback(
    (codeToMatch) => {
      if (!codeToMatch) return null;
      const clean = String(codeToMatch).trim().toLowerCase();

      return allParticipantsList.find((p) => {
        const tNum = String(p.ticketNumber || '').trim().toLowerCase();
        const bib = String(p.bibNumber || '').trim().toLowerCase();
        const id = String(p.id || '').trim().toLowerCase();
        const regId = String(p.registrationId || '').trim().toLowerCase();
        const bkgId = String(p.rawBooking?.bookingId || p.rawBooking?.id || '').trim().toLowerCase();
        const ordId = String(p.rawBooking?.orderId || '').trim().toLowerCase();
        const email = String(p.email || p.participantEmail || '').trim().toLowerCase();
        const phone = String(p.phone || p.participantPhone || '').trim();

        return (
          tNum === clean ||
          bib === clean ||
          id === clean ||
          regId === clean ||
          bkgId === clean ||
          ordId === clean ||
          (clean.length > 5 && (tNum.includes(clean) || bib.includes(clean))) ||
          email === clean ||
          phone === clean
        );
      });
    },
    [allParticipantsList]
  );

  const stopLaptopScanner = useCallback(async () => {
    if (laptopScannerRef.current) {
      try {
        if (isLaptopRunningRef.current || laptopScannerRef.current.isScanning) {
          await laptopScannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Laptop scanner stop error:', e);
      }
      try {
        await laptopScannerRef.current.clear();
      } catch (e) {}
      laptopScannerRef.current = null;
      isLaptopRunningRef.current = false;
    }
  }, []);

  const handleCloseLaptopScanner = useCallback(() => {
    stopLaptopScanner();
    setLaptopScanResult(null);
    setLaptopCameraError('');
    setShowLaptopScanModal(false);
  }, [stopLaptopScanner]);

  const handleResumeLaptopScan = () => {
    setLaptopScanResult(null);
  };

  const startLaptopScanner = useCallback(async (forcedCamId) => {
    setLaptopCameraError('');
    try {
      const el = document.getElementById('laptop-qr-reader');
      if (!el) {
        setTimeout(() => startLaptopScanner(forcedCamId), 150);
        return;
      }

      // Clean up previous instance before fresh start
      if (laptopScannerRef.current) {
        try {
          if (isLaptopRunningRef.current || laptopScannerRef.current.isScanning) {
            await laptopScannerRef.current.stop();
          }
        } catch (e) {}
        try {
          await laptopScannerRef.current.clear();
        } catch (e) {}
        laptopScannerRef.current = null;
        isLaptopRunningRef.current = false;
      }

      const qrScanner = new Html5Qrcode('laptop-qr-reader');
      laptopScannerRef.current = qrScanner;

      // Select camera device
      let cameraConfig = forcedCamId || selectedCameraId;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          if (!cameraConfig) {
            cameraConfig = devices[0].id;
            setSelectedCameraId(devices[0].id);
          }
        } else {
          cameraConfig = { facingMode: { ideal: 'user' } };
        }
      } catch (camErr) {
        console.warn('getCameras fallback:', camErr);
        cameraConfig = { facingMode: { ideal: 'user' } };
      }

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.max(Math.floor(minEdge * 0.75), 180);
          return { width: edge, height: edge };
        },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        cameraConfig,
        qrConfig,
        async (decodedText) => {
          if (laptopProcessing) return;
          const parsed = parseScannedText(decodedText);
          if (!parsed) return;

          setLaptopProcessing(true);
          const matched = findParticipantByCode(parsed);

          if (!matched) {
            playChime('error');
            setLaptopScanResult({
              status: 'error',
              code: parsed,
              message: 'Ticket not found for this event',
            });
            setLaptopProcessing(false);
            return;
          }

          if (matched.isCheckedIn || matched.gateStatus === 'Done' || matched.status === 'Checked In') {
            playChime('warning');
            setLaptopScanResult({
              status: 'warning',
              title: 'ALREADY USED',
              participant: matched,
              code: parsed,
              message: 'ALREADY USED',
              time: matched.checkInTime ? formatDateTime(matched.checkInTime) : 'Earlier today',
            });
            setLaptopProcessing(false);
            return;
          }

          try {
            await checkInParticipantTicket({
              eventId,
              ticketCode: matched.ticketNumber || parsed,
              bookingId: matched.rawBooking?.id,
              registrationId: matched.registrationId || matched.rawRegistration?.id,
            });
            playChime('success');
            setLaptopScanResult({
              status: 'success',
              participant: { ...matched, isCheckedIn: true },
              code: parsed,
              message: 'Admission Confirmed',
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            });
          } catch (err) {
            setLaptopScanResult({
              status: 'error',
              code: parsed,
              message: err.message || 'Check-in failed',
            });
          } finally {
            setLaptopProcessing(false);
          }
        },
        () => {}
      );
      isLaptopRunningRef.current = true;
    } catch (err) {
      console.warn('Laptop camera start error:', err);
      let errorMsg = 'Unable to start laptop webcam. Please verify camera is available.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        errorMsg = 'Webcam permission denied by browser. Please click the camera icon in your browser URL address bar to allow access and click Retry.';
      } else if (err?.name === 'NotReadableError' || err?.message?.includes('NotReadableError')) {
        errorMsg = 'Camera is currently in use by another app (e.g. Zoom, Teams, Meet). Please close other camera apps and retry.';
      } else if (err?.name === 'NotFoundError') {
        errorMsg = 'No webcam hardware detected on this device.';
      }
      setLaptopCameraError(errorMsg);
      isLaptopRunningRef.current = false;
    }
  }, [eventId, findParticipantByCode, laptopProcessing, selectedCameraId]);

  const handleLaptopFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLaptopCameraError('');
    setLaptopProcessing(true);
    try {
      const scanner = laptopScannerRef.current || new Html5Qrcode('laptop-qr-reader');
      const decodedText = await scanner.scanFile(file, true);
      const parsed = parseScannedText(decodedText);
      if (!parsed) {
        setLaptopScanResult({ status: 'error', code: 'N/A', message: 'Could not parse ticket data' });
        return;
      }
      const matched = findParticipantByCode(parsed);
      if (!matched) {
        playChime('error');
        setLaptopScanResult({ status: 'error', code: parsed, message: 'Ticket not found for this event' });
        return;
      }
      if (matched.isCheckedIn || matched.gateStatus === 'Done' || matched.status === 'Checked In') {
        playChime('warning');
        setLaptopScanResult({
          status: 'warning',
          title: 'ALREADY USED',
          participant: matched,
          code: parsed,
          message: 'ALREADY USED',
          time: matched.checkInTime ? formatDateTime(matched.checkInTime) : 'Earlier today',
        });
        return;
      }
      await checkInParticipantTicket({
        eventId,
        ticketCode: matched.ticketNumber || parsed,
        bookingId: matched.rawBooking?.id,
        registrationId: matched.registrationId || matched.rawRegistration?.id,
      });
      playChime('success');
      setLaptopScanResult({
        status: 'success',
        participant: { ...matched, isCheckedIn: true },
        code: parsed,
        message: 'Admission Confirmed',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      });
    } catch (err) {
      console.warn('Laptop file scan error:', err);
      setLaptopScanResult({ status: 'error', code: '', message: 'No readable QR code found in selected image.' });
    } finally {
      setLaptopProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (showLaptopScanModal && !laptopScanResult) {
      const timer = setTimeout(() => {
        startLaptopScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      stopLaptopScanner();
    };
  }, [showLaptopScanModal, laptopScanResult, startLaptopScanner, stopLaptopScanner]);

  const handleSearchCodeCheckIn = (e) => {
    if (e) e.preventDefault();
    setCodeSearchError('');
    setMatchedAttendee(null);
    if (!enteredCheckInCode.trim()) {
      setCodeSearchError('Please enter a ticket code, booking ID, or bib number.');
      return;
    }
    const clean = enteredCheckInCode.trim();
    const found = findParticipantByCode(clean);
    if (!found) {
      setCodeSearchError(`No participant found with code "${clean}" for this event.`);
      playChime('error');
    } else {
      setMatchedAttendee(found);
      playChime(found.isCheckedIn ? 'warning' : 'success');
    }
  };

  const handleConfirmCodeCheckIn = async () => {
    if (!matchedAttendee) return;
    setCodeCheckInLoading(true);
    try {
      await checkInParticipantTicket({
        eventId,
        ticketCode: matchedAttendee.ticketNumber || enteredCheckInCode,
        bookingId: matchedAttendee.rawBooking?.id,
        registrationId: matchedAttendee.registrationId || matchedAttendee.rawRegistration?.id,
      });
      playChime('success');
      setMatchedAttendee((prev) => ({
        ...prev,
        isCheckedIn: true,
        gateStatus: 'Done',
        attendanceStatus: 'Checked In',
        checkInTime: new Date().toISOString(),
      }));
    } catch (err) {
      setCodeSearchError(err.message || 'Check-in failed');
      playChime('error');
    } finally {
      setCodeCheckInLoading(false);
    }
  };

  // Quick Stats for Participant Metric Strip
  const totalCheckedInCount = allParticipantsList.filter((p) => p.gateStatus === 'Done').length;
  const totalOnTrackCount = allParticipantsList.filter((p) => p.gateStatus === 'On Progress' || p.attendanceStatus === 'Checked In').length;
  const totalPendingGateCount = allParticipantsList.filter((p) => p.gateStatus === 'Pending Gate' || p.attendanceStatus !== 'Checked In').length;

  const renderGateBadge = (status) => {
    switch (status) {
      case 'Done':
      case 'Checked In':
        return (
          <span className="gate-status-pill done" title="Checked in & approved at gate">
            <CheckCircle2 size={12} strokeWidth={2.4} />
            Done
          </span>
        );
      case 'On Progress':
        return (
          <span className="gate-status-pill on-progress" title="Participant is on track / racing">
            <Info size={12} strokeWidth={2.4} />
            On Progress
          </span>
        );
      case 'Waiting for Review':
        return (
          <span className="gate-status-pill waiting" title="Scrutineering or review pending">
            <Info size={12} strokeWidth={2.4} />
            Waiting for Review
          </span>
        );
      case 'Pending Gate':
      case 'Pending':
      default:
        return (
          <span className="gate-status-pill pending" title="Gate check or clearance pending">
            <AlertTriangle size={12} strokeWidth={2.4} />
            Pending
          </span>
        );
    }
  };

  const toggleCheckIn = async (entry) => {
    const regId = entry.registrationId || entry.id;
    const newStatus = entry.attendanceStatus === 'Checked In' ? 'Registered' : 'Checked In';
    try {
      if (entry.isFromBooking && entry.rawBooking) {
        await updateEventBookingStatus({
          bookingId: entry.rawBooking.id,
          registrationId: regId,
          attendanceStatus: newStatus,
        });
      } else {
        await updateRegistration(regId, { attendanceStatus: newStatus });
      }
      setMessage(`Attendance status for ${entry.name || 'attendee'} updated to ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenParticipantDetails = (entry) => {
    setSelectedParticipantModal(entry);
    setCopiedModalTicketCode(false);
  };

  const handleCopyModalTicketCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedModalTicketCode(true);
    setTimeout(() => setCopiedModalTicketCode(false), 2200);
  };

  const handleModalCheckInToggle = async () => {
    if (!selectedParticipantModal || modalCheckInLoading) return;
    setModalCheckInLoading(true);
    try {
      await toggleCheckIn(selectedParticipantModal);
      const isNowCheckedIn = !(selectedParticipantModal.gateStatus === 'Done' || selectedParticipantModal.attendanceStatus === 'Checked In');
      setSelectedParticipantModal((prev) => ({
        ...prev,
        gateStatus: isNowCheckedIn ? 'Done' : 'Pending Gate',
        attendanceStatus: isNowCheckedIn ? 'Checked In' : 'Not Checked In',
        isCheckedIn: isNowCheckedIn,
        checkInTime: isNowCheckedIn ? new Date() : null,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setModalCheckInLoading(false);
    }
  };

  const handleViewPass = (entry) => {
    setBookedTicket({
      ticketNumber: entry.ticketNumber || `NX-${(entry.id || '').slice(0, 6).toUpperCase()}`,
      participant: {
        fullName: entry.name || entry.participantName || 'Participant',
        email: entry.email || entry.participantEmail || '',
        phone: entry.phone || entry.participantPhone || '',
        tickets: entry.ticketsCount || 1,
      },
      event,
      tierName: entry.tierName || event?.ticketType || 'Confirmed Entry',
    });
  };

  // =========================================================================
  // TRANSACTIONS DATA & TABLE ENGINE (Matching Transactions.js)
  // =========================================================================
  const allTransactionsList = useMemo(() => {
    const list = [];

    // Track seen booking keys to prevent duplicates within bookings
    const seenBookingKeys = new Set();

    // Sets of identifiers that link bookings to registrations
    const linkedRefIds = new Set();
    const linkedTicketNumbers = new Set();
    const linkedPaymentIds = new Set();
    const linkedEmails = new Set();
    const linkedUserIds = new Set();
    const linkedPhones = new Set();

    // 1. Process Bookings (Primary financial transaction records)
    (bookings || []).forEach((b, idx) => {
      // Primary uniqueness key for booking document
      const primaryBookingKey = String(b.id || b.bookingId || b.orderId || `booking-${idx}`);
      if (seenBookingKeys.has(primaryBookingKey)) {
        return; // Skip duplicate booking document snapshot
      }
      seenBookingKeys.add(primaryBookingKey);

      const orderId = b.bookingId || b.orderId || b.id || `ORD-${1000 + idx}`;
      const amountNum = getBookingAmount(b);
      const isPaid =
        b.paymentStatus === 'paid' ||
        b.status === 'paid' ||
        b.status === 'approved' ||
        b.status === 'confirmed';
      const isFailed = b.status === 'cancelled' || b.status === 'rejected';
      const status = isFailed ? 'Failed' : isPaid ? 'Success' : 'Pending';
      const dateObj = asDate(b.createdAt) || new Date();
      const customerName = b.bookingContact?.name || b.attendee?.name || b.name || 'Guest User';
      const customerEmail = (b.bookingContact?.email || b.attendee?.email || b.email || b.userEmail || '').trim();
      const category = b.tierName || b.packageName || b.joinAs || (amountNum === 0 ? 'Free Pass' : 'Ticket Booking');
      const ticketsCount = Number(
        b.totalTickets || (b.attendeeCounts?.adults || 0) + (b.attendeeCounts?.children || 0) || 1
      );

      // Collect all identifier linkages so corresponding registration docs are not duplicated
      if (b.id) linkedRefIds.add(String(b.id).trim());
      if (b.bookingId) linkedRefIds.add(String(b.bookingId).trim());
      if (b.orderId) linkedRefIds.add(String(b.orderId).trim());
      if (b.registrationId) linkedRefIds.add(String(b.registrationId).trim());
      if (orderId) linkedRefIds.add(String(orderId).trim());

      if (Array.isArray(b.registrationIds)) {
        b.registrationIds.forEach((rid) => rid && linkedRefIds.add(String(rid).trim()));
      }

      const pId = b.paymentId || b.transactionId || b.razorpay_payment_id || b.paymentDetails?.razorpay_payment_id;
      if (pId) linkedPaymentIds.add(String(pId).trim());

      const tNum = b.ticketNumber || b.ticketId;
      if (tNum) linkedTicketNumbers.add(String(tNum).trim().toUpperCase());

      if (customerEmail) linkedEmails.add(customerEmail.toLowerCase());

      const cPhone = (b.bookingContact?.phone || b.attendee?.phone || b.phone || '').trim();
      if (cPhone) linkedPhones.add(cPhone);

      if (b.userId) {
        const uIdStr = String(b.userId).trim();
        linkedUserIds.add(uIdStr);
        if (b.eventId || eventId || event?.id) {
          const evId = b.eventId || eventId || event?.id;
          linkedRefIds.add(`${evId}_${uIdStr}`);
          linkedRefIds.add(`${evId}_${uIdStr}_${b.id}`);
        }
      }

      // If booking contains attendees or tickets array, record their ticket numbers and emails too
      if (Array.isArray(b.attendees)) {
        b.attendees.forEach((att) => {
          if (att?.ticketNumber) linkedTicketNumbers.add(String(att.ticketNumber).trim().toUpperCase());
          if (att?.registrationId) linkedRefIds.add(String(att.registrationId).trim());
          if (att?.email) linkedEmails.add(String(att.email).trim().toLowerCase());
          if (att?.phone) linkedPhones.add(String(att.phone).trim());
        });
      }
      if (Array.isArray(b.tickets)) {
        b.tickets.forEach((t) => {
          if (t?.ticketNumber) linkedTicketNumbers.add(String(t.ticketNumber).trim().toUpperCase());
          if (t?.registrationId) linkedRefIds.add(String(t.registrationId).trim());
          if (t?.email) linkedEmails.add(String(t.email).trim().toLowerCase());
        });
      }

      list.push({
        id: b.id || `tx-${idx}`,
        orderId,
        name: customerName,
        description: `${category} · ${ticketsCount} Ticket${ticketsCount > 1 ? 's' : ''}`,
        category,
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: dateObj.getTime(),
        email: customerEmail || 'N/A',
        status,
        amount: currency(amountNum),
        amountNum,
        avatar:
          b.userPhoto ||
          b.photoURL ||
          `https://images.unsplash.com/photo-${1535713875002 + (idx % 10)}?auto=format&fit=crop&w=150&q=80`,
        rawBooking: b,
      });
    });

    // 2. Process Registrations (Include standalone registrations that do not originate from bookings)
    const seenRegKeys = new Set();

    (registrations || []).forEach((r, idx) => {
      const regKey = String(r.id || r.registrationId || `reg-${idx}`);
      if (seenRegKeys.has(regKey)) {
        return; // Skip duplicate registration snapshot
      }
      seenRegKeys.add(regKey);

      const rPaymentId = r.paymentId || r.transactionId || r.razorpay_payment_id;
      const rTicketNumber = r.ticketNumber ? String(r.ticketNumber).trim().toUpperCase() : null;
      const rEmail = (r.participantEmail || r.participant?.email || r.email || '').trim().toLowerCase();
      const rUserId = r.userId ? String(r.userId).trim() : null;
      const rPhone = (r.participantPhone || r.participant?.phone || r.phone || '').trim();

      // Check all possible linkages:
      const isLinkedToBooking =
        (r.id && linkedRefIds.has(String(r.id).trim())) ||
        (r.registrationId && linkedRefIds.has(String(r.registrationId).trim())) ||
        (r.bookingId && linkedRefIds.has(String(r.bookingId).trim())) ||
        (r.orderId && linkedRefIds.has(String(r.orderId).trim())) ||
        (rPaymentId && linkedPaymentIds.has(String(rPaymentId).trim())) ||
        (rTicketNumber && linkedTicketNumbers.has(rTicketNumber)) ||
        (rUserId && linkedUserIds.has(rUserId)) ||
        (rEmail && linkedEmails.has(rEmail)) ||
        (rPhone && linkedPhones.has(rPhone));

      if (isLinkedToBooking) {
        return; // Already represented in list by a booking
      }

      const regTxId = r.ticketNumber || (r.id ? `REG-${String(r.id).slice(0, 8).toUpperCase()}` : `REG-${1000 + idx}`);
      const amountNum = getRegistrationAmount(r);
      const isPaid = r.paymentStatus === 'Paid' || amountNum === 0 || r.status === 'Confirmed';
      const status = isPaid ? 'Success' : 'Pending';
      const dateObj = asDate(r.registrationDate || r.createdAt) || new Date();
      const customerName = r.participantName || r.participant?.fullName || r.fullName || 'Participant';
      const customerEmail = rEmail || 'N/A';
      const category = r.ticketType || r.tierName || (amountNum === 0 ? 'Free Pass' : 'Direct Registration');
      const ticketsCount = Number(r.ticketsCount || r.tickets || 1);

      list.push({
        id: r.id || `reg-tx-${idx}`,
        orderId: regTxId,
        name: customerName,
        description: `${category} · ${ticketsCount} Ticket${ticketsCount > 1 ? 's' : ''}`,
        category,
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: dateObj.getTime(),
        email: customerEmail,
        status,
        amount: currency(amountNum),
        amountNum,
        avatar:
          r.participantPhoto ||
          `https://images.unsplash.com/photo-${1534528741775 + (idx % 10)}?auto=format&fit=crop&w=150&q=80`,
        rawRegistration: r,
        rawBooking: {
          id: r.id,
          bookingId: regTxId,
          orderId: regTxId,
          registrationId: r.registrationId || r.id,
          status: isPaid ? 'approved' : 'pending',
          paymentStatus: isPaid ? 'paid' : 'pending',
          createdAt: r.registrationDate || r.createdAt,
          total: amountNum,
          amount: amountNum,
          attendee: {
            name: customerName,
            email: customerEmail,
            phone: r.participantPhone || r.participant?.phone || r.phone || 'N/A',
          },
          bookingContact: {
            name: customerName,
            email: customerEmail,
            phone: r.participantPhone || r.participant?.phone || r.phone || 'N/A',
          },
          totalTickets: ticketsCount,
          attendanceStatus: r.attendanceStatus || 'Not Checked In',
          ticketNumber: r.ticketNumber || regTxId,
          tierName: category,
        },
      });
    });

    // Sort by timestamp descending (newest transaction first)
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return list;
  }, [bookings, registrations, eventId, event?.id]);

  // Distinct Filter Options for Transactions
  const transactionTimeframeOptions = ['All', '1D', '7D', '1M', '1Y'];
  const transactionStatusOptions = ['All', 'Success', 'In progress', 'Pending', 'Failed'];
  const transactionCategoryOptions = useMemo(() => {
    const set = new Set(allTransactionsList.map((t) => t.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [allTransactionsList]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactionsList];

    if (transactionSearch.trim()) {
      const q = transactionSearch.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.orderId && t.orderId.toLowerCase().includes(q)) ||
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.amount && t.amount.toLowerCase().includes(q)) ||
          (t.status && t.status.toLowerCase().includes(q))
      );
    }

    if (transactionStatusFilter !== 'All') {
      result = result.filter((t) => t.status.toLowerCase() === transactionStatusFilter.toLowerCase());
    }

    if (transactionCategoryFilter !== 'All') {
      result = result.filter((t) => t.category.toLowerCase() === transactionCategoryFilter.toLowerCase());
    }

    if (transactionTimeframe !== 'All') {
      const now = Date.now();
      const cutoffMap = {
        '1D': now - 86400000,
        '7D': now - 7 * 86400000,
        '1M': now - 30 * 86400000,
        '1Y': now - 365 * 86400000,
      };
      const cutoff = cutoffMap[transactionTimeframe] || 0;
      result = result.filter((t) => t.timestamp >= cutoff);
    }

    if (transactionSortField) {
      result.sort((a, b) => {
        let valA = a[transactionSortField];
        let valB = b[transactionSortField];

        if (transactionSortField === 'amount') {
          valA = a.amountNum || 0;
          valB = b.amountNum || 0;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return transactionSortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();

        if (strA < strB) return transactionSortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return transactionSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    allTransactionsList,
    transactionSearch,
    transactionStatusFilter,
    transactionCategoryFilter,
    transactionTimeframe,
    transactionSortField,
    transactionSortDirection,
  ]);

  // Transaction Pagination
  const totalTransactionPages = Math.max(1, Math.ceil(filteredTransactions.length / transactionPageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (transactionPage - 1) * transactionPageSize;
    return filteredTransactions.slice(start, start + transactionPageSize);
  }, [filteredTransactions, transactionPage, transactionPageSize]);

  useEffect(() => {
    if (transactionPage > totalTransactionPages) {
      setTransactionPage(1);
    }
  }, [totalTransactionPages, transactionPage]);

  // Active Transaction Filters Count
  const activeTransactionFiltersCount = useMemo(() => {
    let count = 0;
    if (transactionSearch.trim()) count++;
    if (transactionStatusFilter !== 'All') count++;
    if (transactionCategoryFilter !== 'All') count++;
    if (transactionTimeframe !== 'All') count++;
    return count;
  }, [transactionSearch, transactionStatusFilter, transactionCategoryFilter, transactionTimeframe]);

  const handleResetTransactionFilters = () => {
    setTransactionSearch('');
    setTransactionStatusFilter('All');
    setCategoryFilter('All');
    setTransactionTimeframe('All');
    setTransactionPage(1);
  };

  const handleSortTransactions = (field) => {
    if (transactionSortField === field) {
      setTransactionSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTransactionSortField(field);
      setTransactionSortDirection('asc');
    }
  };

  const handleSelectAllTransactions = (e) => {
    if (e.target.checked) {
      setSelectedTxIds(new Set(paginatedTransactions.map((t) => t.id)));
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const handleSelectTransactionRow = (id, e) => {
    e.stopPropagation();
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllTransactionsSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((t) => selectedTxIds.has(t.id));

  const handleExportTransactionsCSV = () => {
    const listToExport =
      selectedTxIds.size > 0
        ? allTransactionsList.filter((t) => selectedTxIds.has(t.id))
        : filteredTransactions;

    downloadCsv(
      `event_${event?.id || 'event'}_transactions.csv`,
      listToExport.map((t) => ({
        OrderID: t.orderId,
        Customer: t.name,
        Description: t.description,
        Category: t.category,
        Date: t.date,
        Time: t.time,
        Email: t.email,
        Status: t.status,
        Amount: t.amount,
      }))
    );
  };

  // Quick Stats for Transaction Metric Strip
  const totalVolumeNum = useMemo(
    () => allTransactionsList.reduce((acc, t) => acc + (t.amountNum || 0), 0),
    [allTransactionsList]
  );
  const totalSuccessCount = useMemo(
    () => allTransactionsList.filter((t) => t.status === 'Success').length,
    [allTransactionsList]
  );
  const totalInProgressCount = useMemo(
    () => allTransactionsList.filter((t) => t.status === 'In progress').length,
    [allTransactionsList]
  );
  const totalPendingTxCount = useMemo(
    () => allTransactionsList.filter((t) => t.status === 'Pending' || t.status === 'Failed').length,
    [allTransactionsList]
  );

  const renderTxStatusBadge = (status) => {
    switch (status) {
      case 'Success':
      case 'Approved':
      case 'Paid':
        return (
          <span className="tx-status-pill success">
            <CheckCircle2 size={12} className="tx-status-icon" />
            <span>Success</span>
          </span>
        );
      case 'In progress':
      case 'Processing':
        return (
          <span className="tx-status-pill in-progress">
            <Loader2 size={12} className="tx-status-icon spin" />
            <span>In progress</span>
          </span>
        );
      case 'Failed':
      case 'Cancelled':
      case 'Rejected':
        return (
          <span className="tx-status-pill failed">
            <XCircle size={12} className="tx-status-icon" />
            <span>Failed</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="tx-status-pill pending">
            <AlertTriangle size={12} className="tx-status-icon" />
            <span>Pending</span>
          </span>
        );
    }
  };

  // Global ⌘K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (subTab === 'Participants') {
          participantSearchRef.current?.focus();
        } else if (subTab === 'Transactions') {
          transactionSearchRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subTab]);

  // =========================================================================
  // RENDER PARTICIPANTS FULL TABLE (Matching Participants.js)
  // =========================================================================
  const renderParticipantsView = () => (
    <div className="ptable-embedded-wrapper">
      {/* Metric Quick-Strip */}
      <div className="ptable-metric-strip">
        <div className="metric-pill-item">
          <span className="metric-pill-label">Total Bookings:</span>
          <span className="metric-pill-val">{allParticipantsList.length} Registered</span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">Checked In:</span>
          <span className="metric-pill-val text-green">
            {totalCheckedInCount} Attendees ({Math.round((totalCheckedInCount / (allParticipantsList.length || 1)) * 100)}%)
          </span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">On Track / Active:</span>
          <span className="metric-pill-val text-blue">{totalOnTrackCount} Riders</span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">Pending Gate:</span>
          <span className="metric-pill-val text-amber">{totalPendingGateCount} Pending</span>
        </div>
      </div>

      {/* 3 GATE CHECK-IN ACTIONS: SCAN FROM PHONE, SCAN FROM LAPTOP, SCAN FROM CODE */}
      <div className="checkin-gate-action-rail">
        <div className="checkin-gate-rail-left">
          <div className="checkin-gate-title-wrap">
            <span className="checkin-gate-live-pulse" />
            <span className="checkin-gate-rail-title">Participant Gate Check-In</span>
            <span className="checkin-gate-rail-subtitle">
              Scan attendee QR passes or verify ticket code
            </span>
          </div>
        </div>

        <div className="checkin-gate-rail-buttons">
          {/* Button 1: Scan from Phone */}
          <button
            type="button"
            className="checkin-action-btn phone-btn"
            onClick={() => setShowPhoneScanModal(true)}
            title="Open mobile scanner link or scan QR with smartphone"
          >
            <Smartphone size={15} />
            <span>Scan from Phone</span>
          </button>

          {/* Button 2: Scan from Laptop */}
          <button
            type="button"
            className="checkin-action-btn laptop-btn"
            onClick={() => setShowLaptopScanModal(true)}
            title="Scan attendee ticket QR directly using laptop camera"
          >
            <Camera size={15} />
            <span>Scan from Laptop</span>
          </button>

          {/* Button 3: Scan from Code */}
          <button
            type="button"
            className="checkin-action-btn code-btn"
            onClick={() => setShowCodeCheckInModal(true)}
            title="Check in attendee by entering ticket booking code"
          >
            <KeyRound size={15} />
            <span>Scan from Code</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filter Dropdowns */}
      <div className="ptable-toolbar-container">
        {/* Search Box */}
        <div className="ptable-search-wrapper">
          <Search size={15} className="ptable-search-icon" />
          <input
            ref={participantSearchRef}
            type="text"
            placeholder="Search participants, ticket IDs, bibs, tiers, cities..."
            value={participantSearch}
            onChange={(e) => {
              setParticipantSearch(e.target.value);
              setParticipantPage(1);
            }}
            className="ptable-search-input"
          />
          {participantSearch ? (
            <button
              className="ptable-search-clear"
              onClick={() => setParticipantSearch('')}
              title="Clear Search"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="ptable-search-shortcut" title="Press ⌘K or Ctrl+K to search">⌘K</span>
          )}
        </div>

        {/* Quick Filter Selects */}
        <div className="ptable-filter-group">
          {/* Ticket Tier Filter */}
          <div className="ptable-select-wrapper">
            <span className="select-prefix-label">Tier:</span>
            <select
              value={participantTierFilter}
              onChange={(e) => {
                setParticipantTierFilter(e.target.value);
                setParticipantPage(1);
              }}
              className="ptable-select-input"
            >
              {participantTierOptions.map((t, i) => (
                <option key={i} value={t}>{t === 'All' ? 'All Tiers' : t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="ptable-select-chevron" />
          </div>

          {/* Gate Status Filter */}
          <div className="ptable-select-wrapper">
            <span className="select-prefix-label">Gate:</span>
            <select
              value={participantGateFilter}
              onChange={(e) => {
                setParticipantGateFilter(e.target.value);
                setParticipantPage(1);
              }}
              className="ptable-select-input"
            >
              <option value="All">All Statuses</option>
              <option value="Done">Done (Checked In)</option>
              <option value="Pending Gate">Pending Gate</option>
            </select>
            <ChevronDown size={14} className="ptable-select-chevron" />
          </div>

          {/* Reset Filters */}
          {activeParticipantFiltersCount > 0 && (
            <button
              className="ptable-reset-filters-btn"
              onClick={handleResetParticipantFilters}
              title="Reset all filters to default"
            >
              <RefreshCw size={13} />
              <span>Reset ({activeParticipantFiltersCount})</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            className="ptable-btn-secondary"
            onClick={handleExportParticipantsCSV}
            title="Export records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeParticipantFiltersCount > 0 && (
        <div className="ptable-active-chips-bar">
          <span className="chips-title">Active Filters:</span>
          {participantSearch && (
            <span className="filter-chip">
              Search: "{participantSearch}"
              <button onClick={() => setParticipantSearch('')}><X size={11} /></button>
            </span>
          )}
          {participantTierFilter !== 'All' && (
            <span className="filter-chip">
              Tier: {participantTierFilter}
              <button onClick={() => setParticipantTierFilter('All')}><X size={11} /></button>
            </span>
          )}
          {participantGateFilter !== 'All' && (
            <span className="filter-chip">
              Gate: {participantGateFilter}
              <button onClick={() => setParticipantGateFilter('All')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Main Table Card */}
      <div className="ptable-card-container">
        <div className="ptable-scroll-frame">
          <table className="ptable-custom-table">
            <thead>
              <tr>
                {/* Checkbox Column */}
                <th className="ptable-th th-checkbox">
                  <input
                    type="checkbox"
                    className="ptable-checkbox-input"
                    checked={isAllParticipantsSelected}
                    onChange={handleSelectAllParticipants}
                    title="Select all on this page"
                  />
                </th>

                {/* 1. Participant Name Column */}
                <th
                  className="ptable-th th-sortable th-name"
                  onClick={() => handleSortParticipants('name')}
                  title="Sort by Participant Name"
                >
                  <div className="th-content-flex">
                    <User size={13.5} className="th-header-icon" />
                    <span>Participant Name</span>
                    {participantSortField === 'name' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 2. Ticket & Tier Column */}
                <th
                  className="ptable-th th-sortable th-ticket"
                  onClick={() => handleSortParticipants('tierName')}
                  title="Sort by Ticket Tier"
                >
                  <div className="th-content-flex">
                    <Ticket size={13.5} className="th-header-icon" />
                    <span>Ticket & Tier</span>
                    {participantSortField === 'tierName' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 3. Booking Date Column */}
                <th
                  className="ptable-th th-sortable th-date"
                  onClick={() => handleSortParticipants('bookedMinutes')}
                  title="Sort by Booking Date"
                >
                  <div className="th-content-flex">
                    <Clock size={13.5} className="th-header-icon" />
                    <span>Booking date</span>
                    {participantSortField === 'bookedMinutes' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 4. Ticket Price & Payment Column */}
                <th
                  className="ptable-th th-sortable th-price"
                  onClick={() => handleSortParticipants('priceNumeric')}
                  title="Sort by Ticket Price"
                >
                  <div className="th-content-flex">
                    <CreditCard size={13.5} className="th-header-icon" />
                    <span>Price & Status</span>
                    {participantSortField === 'priceNumeric' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 5. Gate Status Column */}
                <th
                  className="ptable-th th-sortable th-gate"
                  onClick={() => handleSortParticipants('gateStatus')}
                  title="Sort by Gate Status"
                >
                  <div className="th-content-flex">
                    <CheckCircle2 size={13.5} className="th-header-icon" />
                    <span>Gate Status</span>
                    {participantSortField === 'gateStatus' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 6. Vehicle & City Column */}
                <th
                  className="ptable-th th-sortable th-vehicle"
                  onClick={() => handleSortParticipants('city')}
                  title="Sort by City"
                >
                  <div className="th-content-flex">
                    <MapPin size={13.5} className="th-header-icon" />
                    <span>Vehicle & City</span>
                    {participantSortField === 'city' && (
                      participantSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 7. Action Column */}
                <th className="ptable-th th-action" style={{ textAlign: 'right' }}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingRegistrations && allParticipantsList.length === 0 ? (
                <ParticipantTableSkeleton rows={8} />
              ) : paginatedParticipants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ptable-empty-cell">
                    <div className="empty-state-box">
                      <Users size={36} className="empty-state-icon" />
                      <h3>No event participants found</h3>
                      <p>No participant booking matches your current search or tier filter criteria.</p>
                      {activeParticipantFiltersCount > 0 && (
                        <button className="ptable-btn-secondary" onClick={handleResetParticipantFilters}>
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedParticipants.map((item) => {
                  const isSelected = selectedParticipantIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`ptable-row ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => handleOpenParticipantDetails(item)}
                    >
                      {/* Checkbox Column */}
                      <td className="ptable-td td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="ptable-checkbox-input"
                          checked={isSelected}
                          onChange={(e) => handleSelectParticipantRow(item.id, e)}
                        />
                      </td>

                      {/* 1. Participant Name & Avatar / Email */}
                      <td className="ptable-td td-name">
                        <div className="company-name-cell">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="member-avatar-mini"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="monogram-avatar-circle">
                              {item.avatarInitial || item.name.charAt(0)}
                            </span>
                          )}
                          <div className="participant-text-block">
                            <span className="company-title-text">{item.name}</span>
                            <span className="participant-sub-email">{item.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Ticket & Tier */}
                      <td className="ptable-td td-ticket">
                        <div className="ticket-tier-cell-block">
                          <div className="tier-badge-row">
                            <span className={`event-tier-badge tier-${(item.tierName || 'standard').toLowerCase().replace(/\s+/g, '-')}`}>
                              {item.tierName || 'Standard'}
                            </span>
                            {/* {item.ticketFor && (
                              <span className="ticket-for-subpill">{item.ticketFor}</span>
                            )} */}
                          </div>
                          <span
                            className="domain-pill-badge"
                            onClick={(e) => handleCopyParticipantCode(item.ticketNumber, e)}
                            title="Click to copy Ticket ID"
                          >
                            <span className="bib-accent-tag">{item.bibNumber}</span>
                            {item.ticketNumber}
                            {copiedParticipantCode === item.ticketNumber ? (
                              <Check size={11} className="pill-copy-icon success" />
                            ) : null}
                          </span>
                        </div>
                      </td>

                      {/* 3. Booking Date Column */}
                      <td className="ptable-td td-date">
                        <span className="creation-date-text">{item.bookedDate}</span>
                      </td>

                      {/* 4. Ticket Price & Payment Column */}
                      <td className="ptable-td td-price">
                        <div className="price-cell-stack">
                          <span className="employee-count-num bold">{item.ticketPrice}</span>
                          <span className={`payment-pill-tag ${item.paymentStatus?.toLowerCase()}`}>
                            {item.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* 5. Gate Status Column */}
                      <td
                        className="ptable-td td-gate"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheckIn(item);
                        }}
                        title="Click to toggle Gate Check-In"
                      >
                        {renderGateBadge(item.gateStatus)}
                      </td>

                      {/* 6. Vehicle & City Column */}
                      <td className="ptable-td td-vehicle">
                        <span className="address-truncated-text" title={`${item.vehicle} (${item.vehiclePlate}) · ${item.city}`}>
                          <span className="city-accent">{item.city}</span> · {item.vehicle}
                        </span>
                      </td>

                      {/* 7. Action Buttons Column */}
                      <td className="ptable-td td-action" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={`stage-action-btn ${item.gateStatus === 'Done' ? '' : 'primary'}`}
                            onClick={() => toggleCheckIn(item)}
                            title="Toggle Check-In"
                          >
                            <Check size={12} />
                            {item.gateStatus === 'Done' ? 'Undo' : 'Check In'}
                          </button>
                          <button
                            type="button"
                            className="stage-action-btn"
                            onClick={() => handleOpenParticipantDetails(item)}
                            title="View Booking Details & Pass"
                          >
                            <Eye size={12} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="ptable-footer-pagination">
          <div className="pagination-count-label">
            Showing {filteredParticipants.length === 0 ? 0 : (participantPage - 1) * participantPageSize + 1} to{' '}
            {Math.min(participantPage * participantPageSize, filteredParticipants.length)} of {filteredParticipants.length} participants
          </div>

          <div className="pagination-controls-center">
            {/* First Page */}
            <button
              className="pagination-nav-btn"
              disabled={participantPage === 1}
              onClick={() => setParticipantPage(1)}
              title="First Page"
            >
              <ChevronsLeft size={15} />
            </button>

            {/* Prev Page */}
            <button
              className="pagination-nav-btn"
              disabled={participantPage === 1}
              onClick={() => setParticipantPage((prev) => Math.max(1, prev - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Numbered Page Buttons */}
            {Array.from({ length: totalParticipantPages }, (_, idx) => idx + 1)
              .filter((page) => page === 1 || page === totalParticipantPages || Math.abs(page - participantPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  acc.push('ellipsis-' + page);
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) => {
                if (typeof item === 'string') {
                  return <span key={idx} className="pagination-ellipsis">…</span>;
                }
                return (
                  <button
                    key={item}
                    className={`pagination-page-number ${participantPage === item ? 'active' : ''}`}
                    onClick={() => setParticipantPage(item)}
                  >
                    {item}
                  </button>
                );
              })}

            {/* Next Page */}
            <button
              className="pagination-nav-btn"
              disabled={participantPage === totalParticipantPages}
              onClick={() => setParticipantPage((prev) => Math.min(totalParticipantPages, prev + 1))}
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>

            {/* Last Page */}
            <button
              className="pagination-nav-btn"
              disabled={participantPage === totalParticipantPages}
              onClick={() => setParticipantPage(totalParticipantPages)}
              title="Last Page"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // RENDER TRANSACTIONS FULL TABLE (Matching Transactions.js)
  // =========================================================================
  const renderTransactionsView = () => (
    <div className="ptable-embedded-wrapper">
      {/* Metric Quick-Strip */}
      <div className="ptable-metric-strip">
        <div className="metric-pill-item">
          <span className="metric-pill-label">Total Volume:</span>
          <span className="metric-pill-val">{currency(totalVolumeNum)} ({allTransactionsList.length} Records)</span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">Success / Paid:</span>
          <span className="metric-pill-val text-green">
            {totalSuccessCount} Completed ({Math.round((totalSuccessCount / (allTransactionsList.length || 1)) * 100)}%)
          </span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">In Progress:</span>
          <span className="metric-pill-val text-blue">{totalInProgressCount} Processing</span>
        </div>
        <div className="metric-pill-item">
          <span className="metric-pill-label">Pending / Review:</span>
          <span className="metric-pill-val text-amber">{totalPendingTxCount} Pending</span>
        </div>
      </div>

      {/* Toolbar: Search and Filter Dropdowns */}
      <div className="ptable-toolbar-container">
        {/* Search Box */}
        <div className="ptable-search-wrapper">
          <Search size={15} className="ptable-search-icon" />
          <input
            ref={transactionSearchRef}
            type="text"
            placeholder="Search transactions, customer name, email, invoice..."
            value={transactionSearch}
            onChange={(e) => {
              setTransactionSearch(e.target.value);
              setTransactionPage(1);
            }}
            className="ptable-search-input"
          />
          {transactionSearch ? (
            <button
              className="ptable-search-clear"
              onClick={() => setTransactionSearch('')}
              title="Clear Search"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="ptable-search-shortcut" title="Press ⌘K or Ctrl+K to search">⌘K</span>
          )}
        </div>

        {/* Quick Filter Selects */}
        <div className="ptable-filter-group">
          {/* Period Filter */}
          <div className="ptable-select-wrapper">
            <span className="select-prefix-label">Period:</span>
            <select
              value={transactionTimeframe}
              onChange={(e) => {
                setTransactionTimeframe(e.target.value);
                setTransactionPage(1);
              }}
              className="ptable-select-input"
            >
              {transactionTimeframeOptions.map((tf, i) => (
                <option key={i} value={tf}>{tf === 'All' ? 'All Time' : tf}</option>
              ))}
            </select>
            <ChevronDown size={14} className="ptable-select-chevron" />
          </div>

          {/* Status Filter */}
          <div className="ptable-select-wrapper">
            <span className="select-prefix-label">Status:</span>
            <select
              value={transactionStatusFilter}
              onChange={(e) => {
                setTransactionStatusFilter(e.target.value);
                setTransactionPage(1);
              }}
              className="ptable-select-input"
            >
              {transactionStatusOptions.map((st, i) => (
                <option key={i} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
              ))}
            </select>
            <ChevronDown size={14} className="ptable-select-chevron" />
          </div>

          {/* Category Filter */}
          <div className="ptable-select-wrapper">
            <span className="select-prefix-label">Category:</span>
            <select
              value={transactionCategoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setTransactionPage(1);
              }}
              className="ptable-select-input"
            >
              {transactionCategoryOptions.map((cat, i) => (
                <option key={i} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <ChevronDown size={14} className="ptable-select-chevron" />
          </div>

          {/* Reset Filters */}
          {activeTransactionFiltersCount > 0 && (
            <button
              className="ptable-reset-filters-btn"
              onClick={handleResetTransactionFilters}
              title="Reset all filters to default"
            >
              <RefreshCw size={13} />
              <span>Reset ({activeTransactionFiltersCount})</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            className="ptable-btn-secondary"
            onClick={handleExportTransactionsCSV}
            title="Export records to CSV"
            style={{ marginLeft: 'auto' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeTransactionFiltersCount > 0 && (
        <div className="ptable-active-chips-bar">
          <span className="chips-title">Active Filters:</span>
          {transactionSearch && (
            <span className="filter-chip">
              Search: "{transactionSearch}"
              <button onClick={() => setTransactionSearch('')}><X size={11} /></button>
            </span>
          )}
          {transactionTimeframe !== 'All' && (
            <span className="filter-chip">
              Period: {transactionTimeframe}
              <button onClick={() => setTransactionTimeframe('All')}><X size={11} /></button>
            </span>
          )}
          {transactionStatusFilter !== 'All' && (
            <span className="filter-chip">
              Status: {transactionStatusFilter}
              <button onClick={() => setTransactionStatusFilter('All')}><X size={11} /></button>
            </span>
          )}
          {transactionCategoryFilter !== 'All' && (
            <span className="filter-chip">
              Category: {transactionCategoryFilter}
              <button onClick={() => setCategoryFilter('All')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Main Table Card */}
      <div className="ptable-card-container">
        <div className="ptable-scroll-frame">
          <table className="ptable-custom-table">
            <thead>
              <tr>
                {/* Checkbox Column */}
                <th className="ptable-th th-checkbox">
                  <input
                    type="checkbox"
                    className="ptable-checkbox-input"
                    checked={isAllTransactionsSelected}
                    onChange={handleSelectAllTransactions}
                    title="Select all on this page"
                  />
                </th>

                {/* 1. Description */}
                <th
                  className="ptable-th th-sortable th-description"
                  onClick={() => handleSortTransactions('name')}
                  title="Sort by Description / Name"
                >
                  <div className="th-content-flex">
                    <User size={13.5} className="th-header-icon" />
                    <span>Description</span>
                    {transactionSortField === 'name' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 2. Category */}
                <th
                  className="ptable-th th-sortable th-category"
                  onClick={() => handleSortTransactions('category')}
                  title="Sort by Category"
                >
                  <div className="th-content-flex">
                    <Tag size={13.5} className="th-header-icon" />
                    <span>Category</span>
                    {transactionSortField === 'category' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 3. Date */}
                <th
                  className="ptable-th th-sortable th-date"
                  onClick={() => handleSortTransactions('timestamp')}
                  title="Sort by Date"
                >
                  <div className="th-content-flex">
                    <CalendarDays size={13.5} className="th-header-icon" />
                    <span>Date</span>
                    {transactionSortField === 'timestamp' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 4. Time */}
                <th
                  className="ptable-th th-sortable th-time"
                  onClick={() => handleSortTransactions('time')}
                  title="Sort by Time"
                >
                  <div className="th-content-flex">
                    <Clock size={13.5} className="th-header-icon" />
                    <span>Time</span>
                    {transactionSortField === 'time' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 5. Email */}
                <th
                  className="ptable-th th-sortable th-email"
                  onClick={() => handleSortTransactions('email')}
                  title="Sort by Email"
                >
                  <div className="th-content-flex">
                    <Mail size={13.5} className="th-header-icon" />
                    <span>Email</span>
                    {transactionSortField === 'email' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 6. Status */}
                <th
                  className="ptable-th th-sortable th-status"
                  onClick={() => handleSortTransactions('status')}
                  title="Sort by Status"
                >
                  <div className="th-content-flex">
                    <CheckCircle2 size={13.5} className="th-header-icon" />
                    <span>Status</span>
                    {transactionSortField === 'status' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 7. Amount */}
                <th
                  className="ptable-th th-sortable th-amount"
                  onClick={() => handleSortTransactions('amount')}
                  title="Sort by Amount"
                >
                  <div className="th-content-flex">
                    <CreditCard size={13.5} className="th-header-icon" />
                    <span>Amount</span>
                    {transactionSortField === 'amount' && (
                      transactionSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                    )}
                  </div>
                </th>

                {/* 8. Action */}
                <th className="ptable-th th-action" style={{ textAlign: 'center' }}>
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingBookings && allTransactionsList.length === 0 ? (
                <TransactionTableSkeleton rows={8} />
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="ptable-empty-cell">
                    <div className="empty-state-box">
                      <ReceiptText size={36} className="empty-state-icon" />
                      <h3>No transactions found</h3>
                      <p>No transactions match your current search or filter criteria.</p>
                      {activeTransactionFiltersCount > 0 && (
                        <button className="ptable-btn-secondary" onClick={handleResetTransactionFilters}>
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isSelected = selectedTxIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`ptable-row ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => {
                        if (tx.rawBooking) setSelectedBooking(tx.rawBooking);
                      }}
                    >
                      {/* Checkbox Column */}
                      <td className="ptable-td td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="ptable-checkbox-input"
                          checked={isSelected}
                          onChange={(e) => handleSelectTransactionRow(tx.id, e)}
                        />
                      </td>

                      {/* Description (Avatar + Name + Meta) */}
                      <td className="ptable-td td-description">
                        <div className="tx-desc-wrapper">
                          <img
                            src={tx.avatar}
                            alt={tx.name}
                            className="tx-user-avatar"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                          <div className="tx-desc-meta">
                            <span className="tx-user-name">{tx.name}</span>
                            <span className="tx-user-sub">{tx.description}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="ptable-td td-category">
                        <span className="tx-category-text">{tx.category}</span>
                      </td>

                      {/* Date */}
                      <td className="ptable-td td-date">
                        <span className="tx-date-text">{tx.date}</span>
                      </td>

                      {/* Time */}
                      <td className="ptable-td td-time">
                        <span className="tx-time-text">{tx.time}</span>
                      </td>

                      {/* Email */}
                      <td className="ptable-td td-email">
                        <span className="tx-email-text">{tx.email}</span>
                      </td>

                      {/* Status */}
                      <td className="ptable-td td-status">
                        {renderTxStatusBadge(tx.status)}
                      </td>

                      {/* Amount */}
                      <td className="ptable-td td-amount">
                        <span className="tx-amount-text" style={{ fontWeight: 700, color: '#059669' }}>
                          {tx.amount}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="ptable-td td-action" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="stage-action-btn primary"
                          onClick={() => {
                            if (tx.rawBooking) setSelectedBooking(tx.rawBooking);
                          }}
                          title="View Detailed Order & Attendee Breakdown"
                          style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        >
                          <ExternalLink size={12} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="ptable-footer-pagination">
          <div className="pagination-count-label">
            Showing {filteredTransactions.length === 0 ? 0 : (transactionPage - 1) * transactionPageSize + 1} to{' '}
            {Math.min(transactionPage * transactionPageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>

          <div className="pagination-controls-center">
            {/* First Page */}
            <button
              className="pagination-nav-btn"
              disabled={transactionPage === 1}
              onClick={() => setTransactionPage(1)}
              title="First Page"
            >
              <ChevronsLeft size={15} />
            </button>

            {/* Prev Page */}
            <button
              className="pagination-nav-btn"
              disabled={transactionPage === 1}
              onClick={() => setTransactionPage((prev) => Math.max(1, prev - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Numbered Page Buttons */}
            {Array.from({ length: totalTransactionPages }, (_, idx) => idx + 1)
              .filter((page) => page === 1 || page === totalTransactionPages || Math.abs(page - transactionPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  acc.push('ellipsis-' + page);
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) => {
                if (typeof item === 'string') {
                  return <span key={idx} className="pagination-ellipsis">…</span>;
                }
                return (
                  <button
                    key={item}
                    className={`pagination-page-number ${transactionPage === item ? 'active' : ''}`}
                    onClick={() => setTransactionPage(item)}
                  >
                    {item}
                  </button>
                );
              })}

            {/* Next Page */}
            <button
              className="pagination-nav-btn"
              disabled={transactionPage === totalTransactionPages}
              onClick={() => setTransactionPage((prev) => Math.min(totalTransactionPages, prev + 1))}
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>

            {/* Last Page */}
            <button
              className="pagination-nav-btn"
              disabled={transactionPage === totalTransactionPages}
              onClick={() => setTransactionPage(totalTransactionPages)}
              title="Last Page"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!newChatMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: profile?.fullName || user?.displayName || (isHost ? 'Host Official' : 'Participant'),
      isHost: isHost,
      text: newChatMessage.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewChatMessage('');
  };

  const renderChatsView = () => (
    <div className="event-chat-card">
      <div className="event-chat-header">
        <div className="event-chat-channel-badge">
          <span className="chat-live-pulse-dot" />
          <span>Live Community Channel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              # {event.title || 'Event Discussion'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Real-time communication with confirmed participants, co-hosts, and riders
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '9999px', color: '#475569', fontWeight: 600 }}>
              {registrations.length + 1} members active
            </span>
          </div>
        </div>
      </div>

      <div className="event-chat-messages-container">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`event-chat-bubble-wrap ${msg.isHost ? 'host' : ''}`}>
            <div className="event-chat-avatar-token">
              {msg.sender.charAt(0).toUpperCase()}
            </div>
            <div className="event-chat-bubble-body">
              <div className="event-chat-bubble-meta">
                <span className="event-chat-sender-name">{msg.sender}</span>
                {msg.isHost && <span className="event-chat-host-tag">HOST</span>}
                <span className="event-chat-timestamp">{msg.time}</span>
              </div>
              <div className="event-chat-text">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form className="event-chat-input-bar" onSubmit={handleSendChatMessage}>
        <input
          type="text"
          className="event-chat-input"
          placeholder="Write a message or announcement to all participants..."
          value={newChatMessage}
          onChange={(e) => setNewChatMessage(e.target.value)}
        />
        <button
          type="submit"
          className="event-chat-send-btn primary-btn"
          disabled={!newChatMessage.trim()}
          style={{ opacity: newChatMessage.trim() ? 1 : 0.6 }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );

  if (loading) {
    return (
      <AppLayout searchPlaceholder="Loading event details...">
        <EventDetailsSkeleton />
      </AppLayout>
    );
  }
  if (!event) return <AppLayout><EmptyState title="Event not found" action={<button className="primary-btn" onClick={() => navigate('/explore')}>Browse events</button>} /></AppLayout>;

  return (
    <AppLayout searchPlaceholder="Search this event, bookings, participants, payments, or tickets">
      <main className="page-shell event-command-center">
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {/* Sleek Apple Vision Pro Breadcrumb Navigation */}
        <nav className="event-details-breadcrumbs" aria-label="Breadcrumb">
          <button
            type="button"
            className="breadcrumb-crumb-btn"
            onClick={goToDashboard}
            title="Return to Dashboard"
          >
            <LayoutDashboard size={14} className="crumb-icon" />
            <span>Dashboard</span>
          </button>

          <ChevronRight size={13} className="breadcrumb-arrow" />

          <button
            type="button"
            className="breadcrumb-crumb-btn"
            onClick={goToEvents}
            title="View All Events"
          >
            <CalendarDays size={14} className="crumb-icon" />
            <span>Events</span>
          </button>

          <ChevronRight size={13} className="breadcrumb-arrow" />

          <span className="breadcrumb-current-text" title={event.title}>
            {event.title}
          </span>
        </nav>

        {/* Apple Vision Pro Style Hero Banner Card */}
        <section className="apple-hero-card">
          {/* Banner Background Image */}
          <img
            src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80'}
            alt={event.title}
            className="apple-hero-bg-img"
          />

          {/* Frosted Mist & Ambient Lighting Overlays */}
          <div className="apple-hero-overlay" />
          <div className="apple-hero-mist-blur" />

          {/* Top Bar: Brand Badge & Back Button (Left) & Status / Category / Share (Right) */}
          <div className="apple-hero-top-bar">
            <div className="apple-hero-top-left-actions">
              <button
                type="button"
                className="apple-hero-back-pill"
                onClick={goToDashboard}
                title="Return to Dashboard"
              >
                <ChevronLeft size={15} />
                <span>Dashboard</span>
              </button>

              <div
                className="apple-hero-brand-badge clickable"
                onClick={goToDashboard}
                title="Go to Nitroxx Dashboard"
                style={{ cursor: 'pointer' }}
              >
                <span className="apple-hero-brand-dot" />
                <Zap size={14} className="apple-hero-brand-icon" />
                <span className="apple-hero-brand-name">NITROXX</span>
              </div>
            </div>

            <div className="apple-hero-top-right">
              <span className={`apple-hero-status-pill ${displayStatus ? displayStatus.toLowerCase() : 'published'}`}>
                <span className="status-dot-pulse" />
                {displayStatus}
              </span>
              {event.category && (
                <span className="apple-hero-category-chip">
                  {event.category}
                </span>
              )}
              <button
                type="button"
                className="apple-hero-glass-icon-btn"
                onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}
                title="Share Event"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Area: Logo Button + Text (Left) & Edit / Copy Buttons (Right - in place of Buy Now) */}
          <div className="apple-hero-bottom-bar">
            <div className="apple-hero-branding-left">
              {/* Logo Button on Left Side of Text */}
              <div
                className="apple-hero-logo-btn"
                title={event.hostName ? `Hosted by ${event.hostName}` : (event.title || 'Event Logo')}
              >
                {event.thumbnailImage ? (
                  <img
                    src={event.thumbnailImage}
                    alt={event.title}
                    className="apple-hero-logo-img"
                  />
                ) : event.hostPhotoURL ? (
                  <img
                    src={event.hostPhotoURL}
                    alt={event.hostName}
                    className="apple-hero-logo-img"
                  />
                ) : (
                  <div className="apple-hero-logo-fallback">
                    <Bike size={26} />
                  </div>
                )}
              </div>

              {/* Title & Subtitle Info */}
              <div className="apple-hero-text-block">
                <h1 className="apple-hero-title">{event.title}</h1>
                <p className="apple-hero-subtitle">
                  {event.description
                    ? (event.description.length > 130
                      ? `${event.description.slice(0, 130).trim()}...`
                      : event.description)
                    : `${event.category || 'Event'} hosted by ${event.hostName || 'Nitroxx Host'} · ${event.city || event.venue || 'India'}`}
                </p>
              </div>
            </div>

            {/* Action Buttons in place of "Buy Now" */}
            <div className="apple-hero-action-group">
              <button
                type="button"
                className={`apple-hero-pill-btn copy ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
                title="Copy Event Link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {isHost && (
                <Link
                  to={`/events/${event.id}/edit`}
                  className="apple-hero-pill-btn edit primary"
                  title="Edit Event"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* EVENT META STRIP DETAIL TABLE CARD (MATCHING REFERENCE UI) */}
        <section className="event-meta-strip-card">
          <div className="event-meta-table-scroll">
            <table className="event-meta-table">
              <thead>
                <tr>
                  <th className="event-meta-th th-id">Event ID</th>
                  <th className="event-meta-th th-datetime">Date & Time</th>
                  <th className="event-meta-th th-address">Address</th>
                  <th className="event-meta-th th-status">Status</th>
                  <th className="event-meta-th th-updated">Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr className="event-meta-tr">
                  {/* 1. Event ID */}
                  <td className="event-meta-td td-id">
                    <span
                      className="event-meta-id-text"
                      onClick={handleCopyEventId}
                      title="Click to copy Event ID"
                    >
                      {event.eventId || event.id || 'Not set'}
                      {copiedEventId ? (
                        <Check size={12} className="meta-copy-icon success" />
                      ) : (
                        <Copy size={12} className="meta-copy-icon hover-only" />
                      )}
                    </span>
                  </td>

                  {/* 2. Date & Time */}
                  <td className="event-meta-td td-datetime">
                    <span className="event-meta-datetime-text">
                      {formatEventDateTime(event.startDate, event.startTime || event.start_time || event.time)}
                    </span>
                  </td>

                  {/* 3. Address */}
                  <td className="event-meta-td td-address">
                    <div className="event-meta-address-stack">
                      <span className="event-meta-venue-line">
                        <span className="event-meta-city-line">
                          {event.venue}, {event.city}, {event.state}
                        </span>
                        {/* {event.venue
                          ? (event.venue.endsWith(',') ? event.venue : `${event.venue},`)
                          : (event.address ? (event.address.endsWith(',') ? event.address : `${event.address},`) : (event.city || 'Not specified'))} */}
                      </span>
                      {/* {(event.city || event.state) && (
                        <span >
                          {[event.city, event.state].filter(Boolean).join(', ')}
                        </span>
                      )} */}
                    </div>
                  </td>

                  {/* 4. Status */}
                  <td className="event-meta-td td-status">
                    <span className={`event-meta-status-pill ${(displayStatus || event.status || 'Draft').toLowerCase().replace(/\s+/g, '-')}`}>
                      {displayStatus || event.status || 'Draft'}
                    </span>
                  </td>

                  {/* 5. Updated */}
                  <td className="event-meta-td td-updated">
                    <span className="event-meta-updated-text">
                      {formatEventUpdatedTime(event.updatedAt || event.updated_at || event.createdAt)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {isHost && (
          <section className="quick-action-rail">
            <button
              type="button"
              className="quick-pill-btn green"
              onClick={() => changeEventStatus('Published')}
              title="Publish Event"
            >
              <span className="quick-pill-icon-circle">
                <PlayCircle size={15} />
              </span>
              <span className="quick-pill-label">Publish</span>
            </button>

            <button
              type="button"
              className="quick-pill-btn amber"
              onClick={() => changeEventStatus('Draft')}
              title="Pause Booking"
            >
              <span className="quick-pill-icon-circle">
                <PauseCircle size={15} />
              </span>
              <span className="quick-pill-label">Pause Booking</span>
            </button>

            <button
              type="button"
              className="quick-pill-btn purple"
              onClick={() => changeEventStatus('Completed')}
              title="Close Booking"
            >
              <span className="quick-pill-icon-circle">
                <CheckCircle2 size={15} />
              </span>
              <span className="quick-pill-label">Close Booking</span>
            </button>

            <button
              type="button"
              className="quick-pill-btn cyan"
              onClick={() => duplicateEvent(event)}
              title="Duplicate Event"
            >
              <span className="quick-pill-icon-circle">
                <Copy size={15} />
              </span>
              <span className="quick-pill-label">Duplicate</span>
            </button>

            <button
              type="button"
              className="quick-pill-btn teal"
              onClick={exportEventReport}
              title="Export Event Reports"
            >
              <span className="quick-pill-icon-circle">
                <Download size={15} />
              </span>
              <span className="quick-pill-label">Reports</span>
            </button>

            <button
              type="button"
              className="quick-pill-btn red"
              onClick={removeEvent}
              title="Delete Event"
            >
              <span className="quick-pill-icon-circle">
                <Trash2 size={15} />
              </span>
              <span className="quick-pill-label">Delete</span>
            </button>
          </section>
        )}

        {/* TOP HORIZONTAL TABS & FULL-WIDTH WORKSPACE STAGE */}
        <section className="event-horizontal-tabs-container">
          {/* Top Horizontal Bar with Tabs and Status Pill */}
          <nav className="event-horizontal-tabs-bar">
            <div className="event-horizontal-tabs-nav">
              <button
                type="button"
                className="event-tab-btn back-dash-tab"
                onClick={goToDashboard}
                title="Return to Host Dashboard"
              >
                <ChevronLeft size={15} />
                <span>Dashboard</span>
              </button>

              <div className="event-tab-divider" />

              <button
                type="button"
                className={`event-tab-btn ${subTab === 'Overview' ? 'active' : ''}`}
                onClick={() => setSubTab('Overview')}
              >
                <Sparkles size={16} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                className={`event-tab-btn ${subTab === 'Participants' ? 'active' : ''}`}
                onClick={() => setSubTab('Participants')}
              >
                <Users size={16} />
                <span>Participants</span>
                <span className="event-tab-badge">{allParticipantsList.length}</span>
              </button>

              <button
                type="button"
                className={`event-tab-btn ${subTab === 'Transactions' ? 'active' : ''}`}
                onClick={() => setSubTab('Transactions')}
              >
                <ReceiptText size={16} />
                <span>Transactions</span>
                <span className="event-tab-badge">{allTransactionsList.length}</span>
              </button>

              <button
                type="button"
                className={`event-tab-btn ${subTab === 'Chats' ? 'active' : ''}`}
                onClick={() => setSubTab('Chats')}
              >
                <MessageSquare size={16} />
                <span>Chats</span>
                <span className="event-tab-badge live">Live</span>
              </button>
            </div>

            <div className="event-horizontal-tabs-right">
              <div className="sub-sidebar-status-pill">
                <span className="sub-sidebar-status-dot" />
                <span>{displayStatus}</span>
              </div>
            </div>
          </nav>

          {/* Full-width 100% Stage Panel */}
          <div className="event-fullwidth-stage">
            {subTab === 'Overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {/* Stat Cards in single row matching reference image with distinct pastel header bands */}
                <section className="nitro-stat-cards-row">
                  {/* Card 1: Total Views (Mint Green) */}
                  <div className="nitro-stat-card mint">
                    <div className="nitro-stat-header-pill">
                      <Eye size={16} />
                      <span>Total Views</span>
                    </div>
                    <div className="nitro-stat-value">{Number(event.views || 0).toLocaleString()}</div>
                    <div className="nitro-stat-footer">
                      <span className="nitro-stat-subtext">Engagement reach</span>
                      <span className="nitro-stat-trend up">
                        ↑ {analytics.conversionRate || 18}%
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Bookings (Warm Gold / Peach) */}
                  <div className="nitro-stat-card peach">
                    <div className="nitro-stat-header-pill">
                      <Ticket size={16} />
                      <span>Bookings Sold</span>
                    </div>
                    <div className="nitro-stat-value">{analytics.sold.toLocaleString()}</div>
                    <div className="nitro-stat-footer">
                      <span className="nitro-stat-subtext">
                        {analytics.capacity ? `${analytics.fillRate}% capacity filled` : 'Confirmed attendees'}
                      </span>
                      <span className="nitro-stat-trend up">
                        ↑ {analytics.fillRate || 24}%
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Check-ins (Rose / Coral) */}
                  <div className="nitro-stat-card rose">
                    <div className="nitro-stat-header-pill">
                      <Users size={16} />
                      <span>Checked-in</span>
                    </div>
                    <div className="nitro-stat-value">{analytics.checkedIn.toLocaleString()}</div>
                    <div className="nitro-stat-footer">
                      <span className="nitro-stat-subtext">
                        {analytics.attendanceRate ? `${analytics.attendanceRate}% turnout rate` : 'Riders verified'}
                      </span>
                      <span className={`nitro-stat-trend ${analytics.attendanceRate > 0 ? 'up' : 'down'}`}>
                        {analytics.attendanceRate > 0 ? `↑ ${analytics.attendanceRate}%` : '↓ 0%'}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Gross Revenue (Lavender / Purple) */}
                  <div className="nitro-stat-card lavender">
                    <div className="nitro-stat-header-pill">
                      <IndianRupee size={16} />
                      <span>Total Revenue</span>
                    </div>
                    <div className="nitro-stat-value">{currency(analytics.revenue)}</div>
                    <div className="nitro-stat-footer">
                      <span className="nitro-stat-subtext">{currency(analytics.organizerEarnings)} net organizer</span>
                      <span className="nitro-stat-trend up">
                        ↑ 28%
                      </span>
                    </div>
                  </div>
                </section>

                {/* 50% Event Timeline section & 50% Ticket Meter section */}
                <section className="event-details-split-container">
                  <div className="event-details-split-col">
                    {renderTimelineSection()}
                  </div>
                  <div className="event-details-split-col">
                    {renderTicketMeterSection()}
                  </div>
                </section>
              </div>
            )}

            {subTab === 'Participants' && renderParticipantsView()}
            {subTab === 'Transactions' && renderTransactionsView()}
            {subTab === 'Chats' && renderChatsView()}
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

        {/* OFFICIAL BOOKING TICKET MODAL WITH DETAILS & QR */}
        {bookedTicket && (
          <div className="ticket-modal-backdrop" onClick={() => setBookedTicket(null)}>
            <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="ticket-modal-header">
                <div className="ticket-modal-title-group">
                  <h2>🎉 Official Event Ticket Pass</h2>
                  <p>Present this pass with scannable QR code at the event gate entrance for check-in.</p>
                </div>
                <button
                  type="button"
                  className="ticket-modal-close-btn"
                  onClick={() => setBookedTicket(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <TicketPassView
                designId={bookedTicket.event?.ticketDesign || event?.ticketDesign || 'design-1'}
                templateUrl={bookedTicket.event?.ticketTemplateUrl || event?.ticketTemplateUrl || ''}
                event={bookedTicket.event || event}
                participant={bookedTicket.participant}
                ticketNumber={bookedTicket.ticketNumber}
                ticketsCount={bookedTicket.ticketsCount || bookedTicket.participant?.tickets || 1}
                tierName={bookedTicket.tierName}
                onPrint={() => window.print()}
              />

              <div className="ticket-modal-actions-row">
                <button
                  type="button"
                  className="ticket-modal-btn secondary"
                  onClick={() => setBookedTicket(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="ticket-modal-btn primary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print / Save Pass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            UNTITLED UI STYLE PARTICIPANT & BOOKING DETAILS POPUP MODAL
           ========================================================================= */}
        {selectedParticipantModal && (
          <div className="pmodal-backdrop" onClick={() => setSelectedParticipantModal(null)}>
            <div className="pmodal-card" onClick={(e) => e.stopPropagation()}>
              {/* Top Close Button */}
              <button
                type="button"
                className="pmodal-close-btn"
                onClick={() => setSelectedParticipantModal(null)}
                title="Close dialog"
              >
                <X size={18} />
              </button>

              <div className="pmodal-grid">
                {/* ================= LEFT COLUMN: ATTENDEE GATE PASS ================= */}
                <div className="pmodal-col-left">
                  <h3 className="pmodal-col-title">Attendee Gate Pass</h3>
                  <p className="pmodal-col-subtitle">
                    Official pass & instant gate verification QR code.
                  </p>

                  {/* Ticket Code Input Box with Copy Button */}
                  <span className="pmodal-input-label">Ticket Code</span>
                  <div className="pmodal-code-input-group">
                    <span className="pmodal-code-val">
                      {selectedParticipantModal.ticketCode || selectedParticipantModal.ticketNumber}
                    </span>
                    <button
                      type="button"
                      className={`pmodal-code-copy-btn ${copiedModalTicketCode ? 'copied' : ''}`}
                      onClick={() => handleCopyModalTicketCode(selectedParticipantModal.ticketCode || selectedParticipantModal.ticketNumber)}
                      title="Copy Ticket Code"
                    >
                      {copiedModalTicketCode ? (
                        <>
                          <Check size={13} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick link action */}
                  <button
                    type="button"
                    className="pmodal-link-action"
                    onClick={() => {
                      const url = `${window.location.origin}/event-platform/events/${eventId}/checkin-mobile`;
                      navigator.clipboard.writeText(url);
                      setMessage('Mobile gate scanner link copied to clipboard!');
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    title="Copy Gate Scanner Link"
                  >
                    <Smartphone size={13} /> + Copy Gate Scanner Link
                  </button>

                  {/* Divider */}
                  <div className="pmodal-divider">
                    <span>Scan to admit at gate</span>
                  </div>

                  {/* Scannable QR Code with modern brackets and laser line */}
                  <div className="pmodal-qr-box">
                    <div className="pmodal-qr-frame">
                      <div className="pmodal-qr-bracket tl" />
                      <div className="pmodal-qr-bracket tr" />
                      <div className="pmodal-qr-bracket bl" />
                      <div className="pmodal-qr-bracket br" />
                      <div className="pmodal-qr-scanline" />
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          selectedParticipantModal.ticketCode || selectedParticipantModal.ticketNumber || selectedParticipantModal.id
                        )}`}
                        alt={`QR for ${selectedParticipantModal.ticketNumber}`}
                        loading="lazy"
                      />
                    </div>
                    <p className="pmodal-qr-caption">
                      Scan this code with your phone or gate scanner to admit attendee.
                    </p>
                  </div>

                  {/* Left Column Bottom Action Buttons */}
                  <div className="pmodal-left-actions">
                    <button
                      type="button"
                      className={`pmodal-checkin-btn ${selectedParticipantModal.isCheckedIn ? 'checked-in' : ''}`}
                      onClick={handleModalCheckInToggle}
                      disabled={modalCheckInLoading}
                    >
                      {selectedParticipantModal.isCheckedIn ? (
                        <>
                          <RotateCcw size={15} /> Undo Gate Check-In
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Admit Attendee
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="pmodal-print-btn"
                      onClick={() => handleViewPass(selectedParticipantModal)}
                      title="Open Printable Badge / Ticket"
                    >
                      <Printer size={14} /> Printable Badge / Ticket
                    </button>
                  </div>
                </div>

                {/* ================= RIGHT COLUMN: COMPLETE BOOKING DETAILS ================= */}
                <div className="pmodal-col-right">
                  <h3 className="pmodal-col-title">Booking & Participant Details</h3>
                  <p className="pmodal-col-subtitle">
                    Every booking detail, payment confirmation, and registered attendee.
                  </p>

                  {/* Top Badges Strip */}
                  <div className="pmodal-badges-bar">
                    <span className="pmodal-pill tier">
                      <Ticket size={12} /> {selectedParticipantModal.tierName || 'Standard Pass'}
                    </span>
                    <span className={`pmodal-pill ${selectedParticipantModal.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                      <CreditCard size={12} /> {selectedParticipantModal.paymentStatus || 'Paid'}
                    </span>
                    <span className={`pmodal-pill ${selectedParticipantModal.isCheckedIn ? 'gate-done' : 'gate-pending'}`}>
                      {selectedParticipantModal.isCheckedIn ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {selectedParticipantModal.isCheckedIn ? 'Gate Admitted' : 'Pending Gate'}
                    </span>
                    <span className="pmodal-pill ref" title="Booking ID / Reference">
                      #{selectedParticipantModal.bookingId || selectedParticipantModal.id}
                    </span>
                  </div>

                  {/* Attendees List Card (Matches screenshot UI) */}
                  <div className="pmodal-attendees-card">
                    <div className="pmodal-attendees-header">
                      <span>Registered Attendees ({selectedParticipantModal.attendeesList?.length || 1})</span>
                      <span style={{ fontSize: '11px', color: '#4f46e5', textTransform: 'none', fontWeight: 600 }}>
                        {selectedParticipantModal.tierName}
                      </span>
                    </div>
                    {selectedParticipantModal.attendeesList && selectedParticipantModal.attendeesList.length > 0 ? (
                      selectedParticipantModal.attendeesList.map((att, idx) => {
                        const attName = att.name || att.fullName || selectedParticipantModal.name;
                        const attEmail = att.email || selectedParticipantModal.email;
                        const initial = (attName || 'A').charAt(0).toUpperCase();
                        return (
                          <div key={idx} className="pmodal-attendee-row">
                            <div className="pmodal-attendee-left">
                              <div className="pmodal-avatar">
                                {att.photoURL ? <img src={att.photoURL} alt={attName} /> : initial}
                              </div>
                              <div className="pmodal-attendee-info">
                                <span className="pmodal-attendee-name">{attName}</span>
                                <span className="pmodal-attendee-sub">{attEmail}</span>
                              </div>
                            </div>
                            <span className={`pmodal-attendee-status ${selectedParticipantModal.isCheckedIn ? '' : 'pending'}`}>
                              {selectedParticipantModal.isCheckedIn ? 'Gate Admitted' : 'Pass Confirmed'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="pmodal-attendee-row">
                        <div className="pmodal-attendee-left">
                          <div className="pmodal-avatar">
                            {selectedParticipantModal.avatar ? (
                              <img src={selectedParticipantModal.avatar} alt={selectedParticipantModal.name} />
                            ) : (
                              selectedParticipantModal.avatarInitial || selectedParticipantModal.name?.charAt(0)
                            )}
                          </div>
                          <div className="pmodal-attendee-info">
                            <span className="pmodal-attendee-name">{selectedParticipantModal.name}</span>
                            <span className="pmodal-attendee-sub">{selectedParticipantModal.email}</span>
                          </div>
                        </div>
                        <span className={`pmodal-attendee-status ${selectedParticipantModal.isCheckedIn ? '' : 'pending'}`}>
                          {selectedParticipantModal.isCheckedIn ? 'Gate Admitted' : 'Pass Confirmed'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cards Grid: Every single important booking detail with Lucide icons */}
                  <div className="pmodal-cards-grid">
                    {/* 1. Contact Information */}
                    <div className="pmodal-info-card">
                      <div className="pmodal-card-title">
                        <User size={14} /> Contact Details
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Full Name</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.name}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Email</span>
                        <span className="pmodal-field-val">
                          <a href={`mailto:${selectedParticipantModal.email}`}>{selectedParticipantModal.email}</a>
                        </span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Phone</span>
                        <span className="pmodal-field-val">
                          <a href={`tel:${selectedParticipantModal.phone}`}>
                            <Phone size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            {selectedParticipantModal.phone}
                          </a>
                        </span>
                      </div>
                      {(selectedParticipantModal.age !== 'N/A' || selectedParticipantModal.gender !== 'N/A') && (
                        <div className="pmodal-field-row">
                          <span className="pmodal-field-label">Age / Gender</span>
                          <span className="pmodal-field-val">
                            {selectedParticipantModal.age !== 'N/A' ? `${selectedParticipantModal.age} yrs` : ''}{' '}
                            {selectedParticipantModal.gender !== 'N/A' ? `· ${selectedParticipantModal.gender}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Ticket & Gate Admission */}
                    <div className="pmodal-info-card">
                      <div className="pmodal-card-title">
                        <Ticket size={14} /> Ticket & Admission
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Tier / Pass</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.ticketTier || selectedParticipantModal.tierName}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Bib Number</span>
                        <span className="pmodal-field-val" style={{ color: '#4f46e5', fontWeight: 700 }}>
                          #{selectedParticipantModal.bibNumber}
                        </span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Passes / Seats</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.ticketsCount || 1} Seat(s)</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Booked Date</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.bookedDate}</span>
                      </div>
                    </div>

                    {/* 3. Payment & Billing Details */}
                    <div className="pmodal-info-card">
                      <div className="pmodal-card-title">
                        <CreditCard size={14} /> Billing & Payment
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Amount Paid</span>
                        <span className="pmodal-field-val" style={{ color: '#059669', fontWeight: 700 }}>
                          {selectedParticipantModal.ticketPrice}
                        </span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Payment Status</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.paymentStatus}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Payment Method</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.paymentMethod || 'Online'}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Order Ref</span>
                        <span className="pmodal-field-val" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {selectedParticipantModal.orderId || selectedParticipantModal.bookingId}
                        </span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Refund Policy</span>
                        <span className="pmodal-field-val">
                          {event?.refundPolicyType === 'refundable' ? (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              Refundable till {event.refundLastDate || 'specified date'} ({event.refundPercentage || 100}%)
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                              Strictly Non-Refundable
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 4. Ride, Vehicle & Emergency SOS */}
                    <div className="pmodal-info-card">
                      <div className="pmodal-card-title">
                        <Bike size={14} /> Ride & Safety Info
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Machine / Ride</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.vehicle}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">Plate / Reg No</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.vehiclePlate}</span>
                      </div>
                      <div className="pmodal-field-row">
                        <span className="pmodal-field-label">City</span>
                        <span className="pmodal-field-val">{selectedParticipantModal.city}</span>
                      </div>
                      {selectedParticipantModal.emergencyContact && (
                        <div className="pmodal-field-row">
                          <span className="pmodal-field-label">Emergency SOS</span>
                          <span className="pmodal-field-val">
                            {selectedParticipantModal.emergencyContact.name ? `${selectedParticipantModal.emergencyContact.name}: ` : ''}
                            <a href={`tel:${selectedParticipantModal.emergencyContact.phone}`}>
                              <Phone size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                              {selectedParticipantModal.emergencyContact.phone}
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Progress Card (Matching 6/10 team seats used in screenshot) */}
                  <div className="pmodal-progress-card">
                    <div className="pmodal-progress-top">
                      <span className="pmodal-progress-label">
                        {selectedParticipantModal.isCheckedIn ? '1/1 Gate Passes Admitted' : '0/1 Gate Passes Admitted'}
                      </span>
                      <button
                        type="button"
                        className="pmodal-progress-action"
                        onClick={handleModalCheckInToggle}
                        disabled={modalCheckInLoading}
                      >
                        {selectedParticipantModal.isCheckedIn ? 'Undo Check-In' : 'Admit Now'}
                      </button>
                    </div>
                    <div className="pmodal-progress-sub">
                      {selectedParticipantModal.isCheckedIn
                        ? `Attendee admitted & confirmed through Nitroxxin Gate Admission System.`
                        : `Verified pass. Clearance required at main event paddock gate.`}
                    </div>
                    <div className="pmodal-progress-track">
                      <div
                        className="pmodal-progress-bar"
                        style={{
                          width: selectedParticipantModal.isCheckedIn ? '100%' : '0%',
                          backgroundColor: selectedParticipantModal.isCheckedIn ? '#10b981' : '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            1. SCAN FROM PHONE MODAL (MOBILE LINK + QR CODE)
           ========================================================================= */}
        {showPhoneScanModal && (
          <div className="checkin-modal-backdrop" onClick={() => setShowPhoneScanModal(false)}>
            <div className="checkin-modal-card phone-modal" onClick={(e) => e.stopPropagation()}>
              <div className="checkin-modal-header">
                <div className="modal-title-lockup">
                  <div className="modal-icon-badge phone">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3>Scan from Phone</h3>
                    <p>Open live gate scanner on your smartphone</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="checkin-modal-close"
                  onClick={() => setShowPhoneScanModal(false)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="phone-scan-modal-body">
                <div className="phone-qr-frame">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      phoneCheckInUrl
                    )}`}
                    alt="Scan this QR code with your phone camera"
                    className="phone-qr-image"
                  />
                  <div className="phone-qr-badge">
                    <QrCode size={13} />
                    <span>Point smartphone camera to open</span>
                  </div>
                </div>

                <div className="phone-link-section">
                  {/* Local Wi-Fi Network IP config for Phone Access */}
                  <div className="phone-ip-config-card" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#f1f5f9' }}>Laptop Wi-Fi IP (for Phone Access)</span>
                      <span style={{ fontSize: '11px', color: '#38bdf8' }}>Active Wi-Fi: 172.20.10.4</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={phoneHostIp}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneHostIp(val);
                          try { localStorage.setItem('nitroxx_phone_host_ip', val); } catch (err) {}
                        }}
                        placeholder="e.g. 172.20.10.4"
                        style={{
                          background: '#0f172a',
                          border: '1px solid rgba(255, 255, 255, 0.22)',
                          color: '#ffffff',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          flex: 1,
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneHostIp('172.20.10.4');
                          try { localStorage.setItem('nitroxx_phone_host_ip', '172.20.10.4'); } catch (err) {}
                        }}
                        style={{
                          background: phoneHostIp === '172.20.10.4' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.45)',
                          color: '#38bdf8',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Use Wi-Fi (172.20.10.4)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneHostIp(window.location.hostname);
                          try { localStorage.setItem('nitroxx_phone_host_ip', window.location.hostname); } catch (err) {}
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Localhost ({window.location.hostname})
                      </button>
                    </div>
                  </div>

                  <span className="phone-link-label">Direct Mobile Scanner URL</span>
                  <div className="phone-url-copy-box">
                    <input
                      type="text"
                      readOnly
                      value={phoneCheckInUrl}
                      className="phone-url-input"
                    />
                    <button
                      type="button"
                      className="phone-copy-btn"
                      onClick={handleCopyPhoneUrl}
                    >
                      {copiedPhoneUrl ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                      <span>{copiedPhoneUrl ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="phone-open-tab-btn"
                    onClick={() => window.open(phoneCheckInUrl, '_blank')}
                  >
                    <ExternalLink size={14} />
                    <span>Open Mobile Scanner in New Tab</span>
                  </button>

                  <div className="phone-instructions-list">
                    <div className="inst-step">
                      <span className="step-num">1</span>
                      <span>Connect phone to the same Wi-Fi and scan the QR code above</span>
                    </div>
                    <div className="inst-step">
                      <span className="step-num">2</span>
                      <span>Log in once with your host credentials (if not already logged in)</span>
                    </div>
                    <div className="inst-step">
                      <span className="step-num">3</span>
                      <span>Aim camera at attendee ticket QR or tap "Snap Ticket" to admit attendees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. SCAN FROM LAPTOP WEBCAM MODAL
           ========================================================================= */}
        {showLaptopScanModal && (
          <div className="checkin-modal-backdrop" onClick={handleCloseLaptopScanner}>
            <div className="checkin-modal-card laptop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="checkin-modal-header">
                <div className="modal-title-lockup">
                  <div className="modal-icon-badge laptop">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h3>Scan from Laptop Camera</h3>
                    <p>Hold attendee ticket QR code up to your webcam</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="checkin-modal-close"
                  onClick={handleCloseLaptopScanner}
                  title="Close webcam"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="laptop-scan-modal-body">
                {/* Hidden File Input for fallback photo / image scan */}
                <input
                  type="file"
                  accept="image/*"
                  ref={laptopFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleLaptopFileScan}
                />

                {/* Camera selector if multiple cameras detected */}
                {availableCameras.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Camera:</span>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                        startLaptopScanner(e.target.value);
                      }}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        flex: 1,
                      }}
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Viewfinder box */}
                <div className="laptop-viewfinder-box">
                  <div id="laptop-qr-reader" className="laptop-camera-surface" />

                  {!laptopScanResult && (
                    <div className="laptop-scanner-overlay" aria-hidden="true">
                      <div className="scanner-target-corners">
                        <span className="corner top-left" />
                        <span className="corner top-right" />
                        <span className="corner bottom-left" />
                        <span className="corner bottom-right" />
                      </div>
                      <div className="scanner-laser-beam" />
                      <div className="scanner-helper-text">
                        <QrCode size={14} />
                        <span>Center QR code in front of webcam</span>
                      </div>
                    </div>
                  )}

                  {laptopCameraError && (
                    <div className="laptop-camera-error">
                      <AlertTriangle size={24} className="text-amber" />
                      <p>{laptopCameraError}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          type="button"
                          className="ptable-btn-secondary"
                          onClick={() => startLaptopScanner()}
                        >
                          <RefreshCw size={14} /> Retry Webcam
                        </button>
                        <button
                          type="button"
                          className="ptable-btn-secondary"
                          onClick={() => laptopFileInputRef.current?.click()}
                        >
                          <Upload size={14} /> Upload / Snap Ticket Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="ptable-btn-secondary"
                    onClick={() => laptopFileInputRef.current?.click()}
                    style={{ fontSize: '12px' }}
                  >
                    <Upload size={14} /> Scan from Image / Screenshot
                  </button>
                </div>

                {/* Live Scan Result */}
                {laptopScanResult && (
                  <div className={`laptop-scan-result-card ${laptopScanResult.status}`}>
                    <div className="scan-result-header">
                      {laptopScanResult.status === 'success' && <CheckCircle2 size={28} className="text-green" />}
                      {laptopScanResult.status === 'warning' && <AlertTriangle size={28} className="text-amber" />}
                      {laptopScanResult.status === 'error' && <XCircle size={28} className="text-red" />}
                      <div>
                        <span className="result-status-tag">
                          {laptopScanResult.status === 'success' && 'CHECK-IN CONFIRMED'}
                          {laptopScanResult.status === 'warning' && (laptopScanResult.title || 'ALREADY USED')}
                          {laptopScanResult.status === 'error' && 'TICKET NOT FOUND'}
                        </span>
                        <h4>{laptopScanResult.message}</h4>
                      </div>
                    </div>

                    {laptopScanResult.participant ? (
                      <div className="result-attendee-mini">
                        <span className="name">{laptopScanResult.participant.name}</span>
                        <span className="meta">
                          {laptopScanResult.participant.ticketNumber} · {laptopScanResult.participant.tierName}
                        </span>
                        <span className="time">
                          {laptopScanResult.status === 'warning'
                            ? `Checked in previously at ${laptopScanResult.time || 'earlier today'}`
                            : `Admitted at ${laptopScanResult.time || 'just now'}`}
                        </span>
                      </div>
                    ) : (
                      <p className="result-code-text">
                        Scanned code: <code>{laptopScanResult.code}</code>
                      </p>
                    )}

                    <button
                      type="button"
                      className="laptop-resume-btn"
                      onClick={handleResumeLaptopScan}
                    >
                      Scan Next Attendee
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. SCAN FROM CODE (MANUAL CODE CHECK-IN MODAL)
           ========================================================================= */}
        {showCodeCheckInModal && (
          <div className="checkin-modal-backdrop" onClick={() => setShowCodeCheckInModal(false)}>
            <div className="checkin-modal-card code-modal" onClick={(e) => e.stopPropagation()}>
              <div className="checkin-modal-header">
                <div className="modal-title-lockup">
                  <div className="modal-icon-badge code">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3>Check-In by Ticket Code</h3>
                    <p>Enter attendee ticket booking code or ID to check in</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="checkin-modal-close"
                  onClick={() => setShowCodeCheckInModal(false)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="code-checkin-modal-body">
                {/* Search Form */}
                <form onSubmit={handleSearchCodeCheckIn} className="code-search-form">
                  <div className="code-search-input-wrap">
                    <Search size={18} className="code-search-icon" />
                    <input
                      type="text"
                      placeholder="Enter Ticket # or Booking ID (e.g. NX-89214, BK-1001)"
                      value={enteredCheckInCode}
                      onChange={(e) => setEnteredCheckInCode(e.target.value)}
                      autoFocus
                    />
                    {enteredCheckInCode && (
                      <button
                        type="button"
                        className="code-clear-btn"
                        onClick={() => {
                          setEnteredCheckInCode('');
                          setMatchedAttendee(null);
                          setCodeSearchError('');
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button type="submit" className="code-verify-btn">
                    Verify Ticket
                  </button>
                </form>

                {codeSearchError && (
                  <div className="code-search-error-box">
                    <AlertTriangle size={16} />
                    <span>{codeSearchError}</span>
                  </div>
                )}

                {/* Matched Attendee Card */}
                {matchedAttendee && (
                  <div className={`matched-attendee-card ${matchedAttendee.isCheckedIn ? 'is-checked-in' : 'is-pending'}`}>
                    <div className="attendee-card-top">
                      <div className="attendee-avatar-initial">
                        {matchedAttendee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="attendee-header-info">
                        <h4>{matchedAttendee.name}</h4>
                        <p>{matchedAttendee.email} · {matchedAttendee.phone}</p>
                      </div>
                      <div className="attendee-status-badge">
                        {matchedAttendee.isCheckedIn ? (
                          <span className="gate-pill done">
                            <CheckCircle2 size={13} /> Checked In
                          </span>
                        ) : (
                          <span className="gate-pill pending">
                            <Clock size={13} /> Pending Gate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="attendee-details-grid">
                      <div className="grid-cell">
                        <span className="cell-lbl">Ticket Number</span>
                        <span className="cell-val mono">{matchedAttendee.ticketNumber}</span>
                      </div>
                      <div className="grid-cell">
                        <span className="cell-lbl">Pass Tier</span>
                        <span className="cell-val">{matchedAttendee.tierName}</span>
                      </div>
                      <div className="grid-cell">
                        <span className="cell-lbl">Pass Quantity</span>
                        <span className="cell-val">{matchedAttendee.ticketsCount} Ticket(s)</span>
                      </div>
                      <div className="grid-cell">
                        <span className="cell-lbl">Bib Number</span>
                        <span className="cell-val">{matchedAttendee.bibNumber}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="attendee-action-box">
                      {(matchedAttendee.isCheckedIn || matchedAttendee.gateStatus === 'Done' || matchedAttendee.status === 'Checked In') ? (
                        <div className="already-admitted-note" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px' }}>
                          <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                          <span>
                            <strong style={{ color: '#f87171' }}>ALREADY USED</strong> — First admitted on{' '}<strong>{matchedAttendee.checkInTime ? formatDateTime(matchedAttendee.checkInTime) : 'earlier today'}</strong>.
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="confirm-checkin-btn"
                          onClick={handleConfirmCodeCheckIn}
                          disabled={codeCheckInLoading}
                        >
                          <Check size={16} />
                          <span>{codeCheckInLoading ? 'Checking In...' : 'Confirm Gate Check-In'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default EventDetailsPage;
