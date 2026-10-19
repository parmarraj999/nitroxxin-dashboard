import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  CalendarDays,
  Radio,
  Ticket,
  IndianRupee,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Users,
  User,
  Star,
  MapPin,
  X,
  Check,
  CreditCard,
  Landmark,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Trash2,
  Printer,
  ExternalLink,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import { EVENT_PARTICIPANTS_DATA } from '../EventPlatform/participantsData';
import { currency, downloadCsv, formatDateTime } from '../../utils/formatters';
import '../EventPlatform/Participants.css';
import './Dashboard.css';

// Custom dark tooltip for Revenue bar chart matching Image design
const CustomCashflowTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="cashflow-dark-tooltip">
        <div className="tooltip-date-header">{data.fullDate || `Day ${data.name}`}</div>
        <div className="tooltip-data-row">
          <span className="tooltip-dot" style={{ backgroundColor: '#5457ff' }} />
          <span className="tooltip-amount">{currency(data.amount)}</span>
          {data.growth && (
            <span className="tooltip-growth">
              <ArrowUpRight size={12} /> {data.growth}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { events = [] } = useEvents(profile?.role === 'Host' ? { hostId: user?.uid } : {});
  const { registrations = [] } = useRegistrations(
    profile?.role === 'Host' ? { hostId: user?.uid } : { userId: user?.uid }
  );
  const analytics = useAnalytics(events, registrations);

  // States
  const [dateFilter, setDateFilter] = useState('This Month');
  const [participantSearch, setParticipantSearch] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Stat Card timeframe states (Image 1 style)
  const [cardTimeframes, setCardTimeframes] = useState({
    1: '12 Months',
    2: '12 Months',
    3: '12 Months',
    4: '12 Months',
  });
  const [openCardDropdown, setOpenCardDropdown] = useState(null);

  // Revenue Analytics state (Default: 'This Month' with single day showing bar)
  const [cashflowPeriod, setCashflowPeriod] = useState('This Month');
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');

  // 1. Overview Calculated Data
  const totalCalculatedRevenue = analytics.totalRevenue > 0 ? analytics.totalRevenue : 842500;
  const totalCalculatedTickets = analytics.totalRegistrations > 0 ? analytics.totalRegistrations : 3844;
  const totalCalculatedEvents = events.length > 0 ? events.length : 24;
  const totalLiveEvents = events.filter((e) => e.status === 'Live' || e.status === 'Published').length || 3;

  // Stat Card mini sparklines (Image 1 replica)
  const sparkline1 = useMemo(() => [
    { v: 12 }, { v: 18 }, { v: 15 }, { v: 24 }, { v: 20 }, { v: 32 }, { v: 40 }, { v: 35 }, { v: 48 }, { v: 56 }, { v: 50 }, { v: 58 }, { v: 72 }
  ], []);

  const sparkline2 = useMemo(() => [
    { v: 10 }, { v: 14 }, { v: 20 }, { v: 18 }, { v: 28 }, { v: 24 }, { v: 38 }, { v: 44 }, { v: 36 }, { v: 50 }, { v: 62 }, { v: 55 }, { v: 75 }
  ], []);

  const sparkline3 = useMemo(() => [
    { v: 15 }, { v: 22 }, { v: 19 }, { v: 30 }, { v: 26 }, { v: 42 }, { v: 38 }, { v: 52 }, { v: 48 }, { v: 64 }, { v: 70 }, { v: 65 }, { v: 82 }
  ], []);

  const sparkline4 = useMemo(() => [
    { v: 8 }, { v: 12 }, { v: 10 }, { v: 16 }, { v: 14 }, { v: 20 }, { v: 18 }, { v: 22 }, { v: 25 }, { v: 22 }, { v: 26 }, { v: 24 }, { v: 30 }
  ], []);

  // 2. Revenue Analytics Bar Data (Capsule bar graph with single day showing bar by default)
  const cashflowDataMap = useMemo(() => ({
    'This Month': [
      { name: '1', amount: 18500, fullDate: 'Oct 01, 2026', day: 'Thu', growth: '+8.2%' },
      { name: '2', amount: 22000, fullDate: 'Oct 02, 2026', day: 'Fri', growth: '+10.4%' },
      { name: '3', amount: 19400, fullDate: 'Oct 03, 2026', day: 'Sat', growth: '+7.8%' },
      { name: '4', amount: 31000, fullDate: 'Oct 04, 2026', day: 'Sun', growth: '+15.2%' },
      { name: '5', amount: 24500, fullDate: 'Oct 05, 2026', day: 'Mon', growth: '+11.0%' },
      { name: '6', amount: 16800, fullDate: 'Oct 06, 2026', day: 'Tue', growth: '+6.5%' },
      { name: '7', amount: 28000, fullDate: 'Oct 07, 2026', day: 'Wed', growth: '+12.8%' },
      { name: '8', amount: 35200, fullDate: 'Oct 08, 2026', day: 'Thu', growth: '+16.5%' },
      { name: '9', amount: 29000, fullDate: 'Oct 09, 2026', day: 'Fri', growth: '+13.2%' },
      { name: '10', amount: 42500, fullDate: 'Oct 10, 2026', day: 'Sat', growth: '+19.4%' },
      { name: '11', amount: 38000, fullDate: 'Oct 11, 2026', day: 'Sun', growth: '+17.0%' },
      { name: '12', amount: 25400, fullDate: 'Oct 12, 2026', day: 'Mon', growth: '+11.5%' },
      { name: '13', amount: 33800, fullDate: 'Oct 13, 2026', day: 'Tue', growth: '+15.0%' },
      { name: '14', amount: 46000, fullDate: 'Oct 14, 2026', day: 'Wed', growth: '+21.2%' },
      { name: '15', amount: 52000, fullDate: 'Oct 15, 2026', day: 'Thu', growth: '+24.5%' },
      { name: '16', amount: 39500, fullDate: 'Oct 16, 2026', day: 'Fri', growth: '+17.8%' },
      { name: '17', amount: 44200, fullDate: 'Oct 17, 2026', day: 'Sat', growth: '+20.1%' },
      { name: '18', amount: 68500, fullDate: 'Oct 18, 2026', day: 'Sun', growth: '+31.4%', isPeak: true },
      { name: '19', amount: 34000, fullDate: 'Oct 19, 2026', day: 'Mon', growth: '+15.6%' },
      { name: '20', amount: 28500, fullDate: 'Oct 20, 2026', day: 'Tue', growth: '+12.4%' },
      { name: '21', amount: 37200, fullDate: 'Oct 21, 2026', day: 'Wed', growth: '+16.8%' },
      { name: '22', amount: 41000, fullDate: 'Oct 22, 2026', day: 'Thu', growth: '+18.9%' },
      { name: '23', amount: 30500, fullDate: 'Oct 23, 2026', day: 'Fri', growth: '+13.5%' },
      { name: '24', amount: 26000, fullDate: 'Oct 24, 2026', day: 'Sat', growth: '+11.2%' },
      { name: '25', amount: 35000, fullDate: 'Oct 25, 2026', day: 'Sun', growth: '+15.8%' },
      { name: '26', amount: 29800, fullDate: 'Oct 26, 2026', day: 'Mon', growth: '+13.1%' },
      { name: '27', amount: 33000, fullDate: 'Oct 27, 2026', day: 'Tue', growth: '+14.9%' },
      { name: '28', amount: 27500, fullDate: 'Oct 28, 2026', day: 'Wed', growth: '+12.0%' },
      { name: '29', amount: 24000, fullDate: 'Oct 29, 2026', day: 'Thu', growth: '+10.5%' },
      { name: '30', amount: 21500, fullDate: 'Oct 30, 2026', day: 'Fri', growth: '+9.2%' },
      { name: '31', amount: 18500, fullDate: 'Oct 31, 2026', day: 'Sat', growth: '+8.0%' },
    ],
    'This Week': [
      { name: 'Sun', amount: 45000, fullDate: 'Sunday, Oct 11', growth: '+8.2%' },
      { name: 'Mon', amount: 62000, fullDate: 'Monday, Oct 12', growth: '+12.4%' },
      { name: 'Tue', amount: 58000, fullDate: 'Tuesday, Oct 13', growth: '+10.8%' },
      { name: 'Wed', amount: 89000, fullDate: 'Wednesday, Oct 14', growth: '+24.5%', isPeak: true },
      { name: 'Thu', amount: 52000, fullDate: 'Thursday, Oct 15', growth: '+9.5%' },
      { name: 'Fri', amount: 74000, fullDate: 'Friday, Oct 16', growth: '+16.2%' },
      { name: 'Sat', amount: 38000, fullDate: 'Saturday, Oct 17', growth: '+6.1%' },
    ],
    'Last Month': [
      { name: '1', amount: 16000, fullDate: 'Sep 01, 2026', growth: '+7.5%' },
      { name: '5', amount: 22000, fullDate: 'Sep 05, 2026', growth: '+9.8%' },
      { name: '10', amount: 34000, fullDate: 'Sep 10, 2026', growth: '+14.2%' },
      { name: '15', amount: 48000, fullDate: 'Sep 15, 2026', growth: '+21.0%' },
      { name: '20', amount: 39000, fullDate: 'Sep 20, 2026', growth: '+17.4%' },
      { name: '25', amount: 56000, fullDate: 'Sep 25, 2026', growth: '+26.0%', isPeak: true },
      { name: '30', amount: 28000, fullDate: 'Sep 30, 2026', growth: '+12.5%' },
    ],
    'This Year': [
      { name: 'Jan', amount: 145000, fullDate: 'January 2026', growth: '+12.4%' },
      { name: 'Feb', amount: 180000, fullDate: 'February 2026', growth: '+14.2%' },
      { name: 'Mar', amount: 210000, fullDate: 'March 2026', growth: '+16.0%' },
      { name: 'Apr', amount: 245000, fullDate: 'April 2026', growth: '+15.5%' },
      { name: 'May', amount: 198000, fullDate: 'May 2026', growth: '+11.2%' },
      { name: 'Jun', amount: 280000, fullDate: 'June 2026', growth: '+18.4%' },
      { name: 'Jul', amount: 420000, fullDate: 'July 2026', growth: '+25.1%' },
      { name: 'Aug', amount: 510000, fullDate: 'August 2026', growth: '+28.6%' },
      { name: 'Sep', amount: 480000, fullDate: 'September 2026', growth: '+20.3%' },
      { name: 'Oct', amount: 650000, fullDate: 'October 2026', growth: '+31.4%', isPeak: true },
      { name: 'Nov', amount: 780000, fullDate: 'November 2026', growth: '+36.8%' },
      { name: 'Dec', amount: 842500, fullDate: 'December 2026', growth: '+42.0%' },
    ],
  }), []);

  const activeCashflowData = cashflowDataMap[cashflowPeriod] || cashflowDataMap['This Month'];

  const getCashflowHeadline = () => {
    return currency(totalCalculatedRevenue);
  };

  const selectCardTimeframe = (cardId, tf) => {
    setCardTimeframes((prev) => ({ ...prev, [cardId]: tf }));
    setOpenCardDropdown(null);
  };

  // 4. Recent Participants Directory (Matching Participants Page Data & UI)
  const [participants, setParticipants] = useState(() => EVENT_PARTICIPANTS_DATA);
  const [participantGateFilter, setParticipantGateFilter] = useState('All');
  const [dashSortField, setDashSortField] = useState('');
  const [dashSortDirection, setDashSortDirection] = useState('asc');
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [dashPage, setDashPage] = useState(1);
  const [dashPageSize, setDashPageSize] = useState(8);
  const [ticketModalParticipant, setTicketModalParticipant] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Merge any live Firebase registrations into the list
  React.useEffect(() => {
    if (registrations && registrations.length > 0) {
      const liveItems = registrations.map((r, i) => {
        const rawTier = r.ticketType || 'Standard';
        let tierName = 'Standard';
        let ticketFor = 'Participant';

        if (rawTier.toLowerCase().includes('platinum')) tierName = 'Platinum';
        else if (rawTier.toLowerCase().includes('vip')) tierName = 'VIP';
        else if (rawTier.toLowerCase().includes('plus')) tierName = 'Plus';
        else if (rawTier.toLowerCase().includes('pro')) tierName = 'Pro Rider';
        else if (rawTier.toLowerCase().includes('explorer')) tierName = 'Explorer';

        if (r.participant?.vehicleNumber) ticketFor = 'Rider';

        return {
          id: r.id || `live-${i}`,
          name: r.participantName || r.participant?.fullName || 'Registered Participant',
          email: r.participantEmail || r.participant?.email || 'guest@nitroxx.com',
          phone: r.participantPhone || r.participant?.phone || '+91 98000 00000',
          avatar: r.participantPhoto || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
          avatarInitial: (r.participantName || 'R').charAt(0).toUpperCase(),
          eventTitle: r.eventTitle || 'Nitroxx MotoFest Pune 2025',
          tierName,
          ticketFor,
          ticketTier: `${tierName} · ${ticketFor}`,
          ticketNumber: r.ticketNumber || `NX-${Date.now().toString(36).toUpperCase()}`,
          bibNumber: r.ticketNumber ? `BIB-${r.ticketNumber.slice(-3)}` : `BIB-${300 + i}`,
          ticketPrice: r.ticketPrice ? `₹${Number(r.ticketPrice).toLocaleString()}` : '₹4,999',
          priceNumeric: Number(r.ticketPrice || 4999),
          bookedDate: r.registrationDate ? formatDateTime(r.registrationDate).split(',')[0] : 'Just now',
          bookedMinutes: 0,
          paymentStatus: 'Paid',
          gateStatus: r.attendanceStatus === 'Checked In' ? 'Done' : r.status === 'Confirmed' ? 'On Progress' : 'Pending Gate',
          vehicle: r.participant?.vehicleNumber || 'Motorcycle',
          vehiclePlate: r.participant?.vehicleNumber || 'MH12-LIVE',
          city: r.participant?.city || 'India',
          bloodGroup: r.participant?.bloodGroup || 'O+',
          emergencyContact: r.participant?.emergencyContact || 'Listed with Team',
          wave: 'General Wave (08:00 AM)'
        };
      });

      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newUniques = liveItems.filter(item => !existingIds.has(item.id));
        return [...newUniques, ...prev];
      });
    }
  }, [registrations]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Copied: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDashSort = (field) => {
    if (dashSortField === field) {
      setDashSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setDashSortField(field);
      setDashSortDirection('asc');
    }
  };

  const filteredParticipants = useMemo(() => {
    let result = [...participants];
    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase().trim();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.eventTitle && p.eventTitle.toLowerCase().includes(q)) ||
        (p.tierName && p.tierName.toLowerCase().includes(q)) ||
        (p.ticketNumber && p.ticketNumber.toLowerCase().includes(q)) ||
        (p.bibNumber && p.bibNumber.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.vehicle && p.vehicle.toLowerCase().includes(q))
      );
    }
    if (participantGateFilter !== 'All') {
      result = result.filter(p => p.gateStatus === participantGateFilter);
    }
    if (dashSortField) {
      result.sort((a, b) => {
        let valA = a[dashSortField];
        let valB = b[dashSortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return dashSortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        if (strA < strB) return dashSortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return dashSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [participants, participantSearch, participantGateFilter, dashSortField, dashSortDirection]);

  const totalDashPages = Math.max(1, Math.ceil(filteredParticipants.length / dashPageSize));
  const dashPaginated = useMemo(() => {
    const start = (dashPage - 1) * dashPageSize;
    return filteredParticipants.slice(start, start + dashPageSize);
  }, [filteredParticipants, dashPage, dashPageSize]);

  const isAllSelected = dashPaginated.length > 0 && dashPaginated.every(p => selectedRowIds.has(p.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(dashPaginated.map(p => p.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleCheckIn = (id, e) => {
    e?.stopPropagation();
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.gateStatus === 'Done' ? 'On Progress' : 'Done';
        showToast(nextStatus === 'Done' ? `Checked In: ${p.name}` : `Attendance Reset: ${p.name}`);
        return { ...p, gateStatus: nextStatus };
      }
      return p;
    }));
  };

  const handleBulkCheckIn = () => {
    setParticipants(prev => prev.map(p => selectedRowIds.has(p.id) ? { ...p, gateStatus: 'Done' } : p));
    showToast(`Checked in ${selectedRowIds.size} participants.`);
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Cancel bookings for ${selectedRowIds.size} selected participants?`)) {
      setParticipants(prev => prev.filter(p => !selectedRowIds.has(p.id)));
      showToast(`Removed ${selectedRowIds.size} bookings.`);
      setSelectedRowIds(new Set());
    }
  };

  const handleExportCSV = () => {
    const listToExport = selectedRowIds.size > 0
      ? participants.filter(p => selectedRowIds.has(p.id))
      : filteredParticipants;

    downloadCsv('recent_participants_directory.csv', listToExport.map(p => ({
      ParticipantName: p.name,
      Email: p.email,
      Phone: p.phone,
      Tier: p.tierName,
      TicketFor: p.ticketFor,
      TicketNumber: p.ticketNumber,
      BibNumber: p.bibNumber,
      EventTitle: p.eventTitle,
      BookedDate: p.bookedDate,
      TicketPrice: p.ticketPrice,
      PaymentStatus: p.paymentStatus,
      GateStatus: p.gateStatus,
      Vehicle: p.vehicle,
      VehiclePlate: p.vehiclePlate,
      City: p.city
    })));
    showToast(`Exported ${listToExport.length} participants to CSV.`);
  };

  const totalCheckedIn = participants.filter(p => p.gateStatus === 'Done').length;
  const totalOnTrack = participants.filter(p => p.gateStatus === 'On Progress').length;
  const totalPending = participants.filter(p => p.gateStatus === 'Pending Gate' || p.gateStatus === 'Waiting for Review').length;

  const renderGateBadge = (status) => {
    switch (status) {
      case 'Done':
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
        return (
          <span className="gate-status-pill pending" title="Gate check or clearance pending">
            <AlertTriangle size={12} strokeWidth={2.4} />
            Pending
          </span>
        );
      case 'Inactive':
        return (
          <span className="gate-status-pill inactive" title="Booking cancelled or refunded">
            <AlertCircle size={12} strokeWidth={2.4} />
            Inactive
          </span>
        );
      default:
        return (
          <span className="gate-status-pill waiting">
            <Info size={12} strokeWidth={2.4} />
            {status}
          </span>
        );
    }
  };

  // =========================================================================
  // UPCOMING EVENTS & INTERACTIVE CALENDAR LOGIC (Image Replication)
  // =========================================================================
  const [calendarDate, setCalendarDate] = useState(() => new Date(2025, 11, 1)); // December 2025 as in reference image
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(20); // 20 selected by default matching image
  const [eventsFilter, setEventsFilter] = useState('All'); // 'All' | 'Ongoing' | 'Upcoming' | 'Completed' | 'Pending' | 'Cancelled'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState('Month');

  const allCalendarEvents = useMemo(() => {
    const liveItems = (events || []).map((e, idx) => {
      const sDate = e.startDate ? new Date(e.startDate) : new Date(2025, 11, 14);
      const eDate = e.endDate ? new Date(e.endDate) : (e.startDate ? new Date(e.startDate) : new Date(2025, 11, 18));
      const startDay = sDate.getDate();
      const endDay = eDate.getDate();
      const isMultiDay = endDay > startDay || (eDate.getTime() - sDate.getTime()) > 86400000;

      const dayNum = String(startDay).padStart(2, '0');
      const endDayNum = String(endDay).padStart(2, '0');
      const dayName = isMultiDay
        ? `${sDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}-${eDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}`
        : sDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dateStr = isMultiDay
        ? `${sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${eDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${e.startTime || '10:00 am'}`
        : `${sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${e.startTime || '10:00 am'}`;

      let statusLabel = 'Upcoming';
      if (e.status === 'Live' || e.status === 'Ongoing') statusLabel = 'Ongoing';
      else if (e.status === 'Cancelled') statusLabel = 'Cancelled';
      else if (e.status === 'Draft' || e.status === 'Pending') statusLabel = 'Pending';
      else if (e.status === 'Completed') statusLabel = 'Completed';

      return {
        id: e.id || `live-${idx}`,
        day: dayNum,
        endDay: endDayNum,
        startDayNum: startDay,
        endDayNum: endDay,
        isMultiDay,
        displayDayRange: isMultiDay ? `${dayNum}-${endDayNum}` : dayNum,
        dayName,
        dateStr,
        fullDate: e.startDate || '2025-12-20',
        title: e.title || 'Live Host Event',
        status: statusLabel,
        location: e.venue ? `${e.venue}, ${e.city || ''}` : 'Nitroxx Track Arena',
        category: e.category || 'Race',
      };
    });

    const referenceItems = [
      {
        id: 'evt-1',
        day: '20',
        startDayNum: 20,
        endDayNum: 20,
        isMultiDay: false,
        displayDayRange: '20',
        dayName: 'FRI',
        dateStr: 'Dec 20 at 08:05 am',
        fullDate: '2025-12-20',
        title: 'Global Summit 2025',
        status: 'Upcoming',
        location: '3890 Poplar Dr.',
        category: 'Summit',
      },
      {
        id: 'evt-2',
        day: '22',
        startDayNum: 22,
        endDayNum: 22,
        isMultiDay: false,
        displayDayRange: '22',
        dayName: 'SUN',
        dateStr: 'Dec 22 at 01:49 pm',
        fullDate: '2025-12-22',
        title: 'Elite Athlete Invitational',
        status: 'Cancelled',
        location: '8558 Green Rd.',
        category: 'Motorsports',
      },
      {
        id: 'evt-3',
        day: '25',
        startDayNum: 25,
        endDayNum: 25,
        isMultiDay: false,
        displayDayRange: '25',
        dayName: 'WED',
        dateStr: 'Dec 25 at 12:10 am',
        fullDate: '2025-12-25',
        title: 'World Design Challenge',
        status: 'Pending',
        location: '775 Rolling Green Rd.',
        category: 'Design & Tech',
      },
      {
        id: 'evt-4',
        day: '03',
        startDayNum: 3,
        endDayNum: 3,
        isMultiDay: false,
        displayDayRange: '03',
        dayName: 'MON',
        dateStr: 'Dec 03 at 08:05 am',
        fullDate: '2025-12-03',
        title: 'Ultimate Development Showdown',
        status: 'Completed',
        location: '8080 Railroad St.',
        category: 'Hackathon',
      },
      {
        id: 'evt-5',
        day: '14',
        endDay: '18',
        startDayNum: 14,
        endDayNum: 18,
        isMultiDay: true,
        displayDayRange: '14-18',
        dayName: 'SUN-THU',
        dateStr: 'Dec 14 - 18 at 02:30 pm',
        fullDate: '2025-12-14',
        title: 'Nitroxx Pro Supercross Championship',
        status: 'Ongoing',
        location: 'Manali High Arena, HP',
        category: 'Racing',
      },
      {
        id: 'evt-6',
        day: '17',
        startDayNum: 17,
        endDayNum: 17,
        isMultiDay: false,
        displayDayRange: '17',
        dayName: 'WED',
        dateStr: 'Dec 17 at 11:00 am',
        fullDate: '2025-12-17',
        title: 'Aravalli Dirt Sprint Series Round 4',
        status: 'Upcoming',
        location: 'Leopard Trail, Gurugram',
        category: 'Rally',
      },
      {
        id: 'evt-7',
        day: '07',
        endDay: '10',
        startDayNum: 7,
        endDayNum: 10,
        isMultiDay: true,
        displayDayRange: '07-10',
        dayName: 'SUN-WED',
        dateStr: 'Dec 07 - 10 at 04:00 pm',
        fullDate: '2025-12-07',
        title: 'Goa Coastal Beach Sprint & Pitlane',
        status: 'Ongoing',
        location: 'Vagator Arena, Goa',
        category: 'Festival',
      },
    ];

    return liveItems.length > 0 ? [...liveItems, ...referenceItems] : referenceItems;
  }, [events]);

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const calendarMonthName = calendarDate.toLocaleDateString('en-US', { month: 'long' });

  const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

  const calendarCells = useMemo(() => {
    // Determine which days have events and which days are ongoing multi-day events
    const ongoingDaysMap = new Map();
    const eventDaysMap = new Map();

    allCalendarEvents.forEach((evt) => {
      const s = evt.startDayNum !== undefined ? evt.startDayNum : parseInt(evt.day, 10);
      const e = evt.endDayNum !== undefined ? evt.endDayNum : s;
      const isOngoing = evt.status === 'Ongoing';

      if (!isNaN(s)) {
        for (let day = s; day <= e; day++) {
          if (!eventDaysMap.has(day)) eventDaysMap.set(day, []);
          eventDaysMap.get(day).push(evt);

          if (isOngoing) {
            if (!ongoingDaysMap.has(day)) ongoingDaysMap.set(day, []);
            ongoingDaysMap.get(day).push(evt);
          }
        }
      }
    });

    // Default decorative dots from reference if no direct event mapped
    [2, 3, 6, 8, 11, 14, 17, 20, 22, 25].forEach((d) => {
      if (!eventDaysMap.has(d)) eventDaysMap.set(d, []);
    });

    const cells = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        hasEvent: false,
        isOngoing: false,
      });
    }
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isOngoing = ongoingDaysMap.has(d);
      const hasEvent = eventDaysMap.has(d);
      cells.push({
        day: d,
        isCurrentMonth: true,
        hasEvent,
        isOngoing,
        eventsOnDay: eventDaysMap.get(d) || [],
      });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      cells.push({
        day: n,
        isCurrentMonth: false,
        hasEvent: false,
        isOngoing: false,
      });
    }
    return cells;
  }, [daysInCurrentMonth, firstDayOfWeek, daysInPrevMonth, allCalendarEvents]);

  const filteredCalendarEvents = useMemo(() => {
    return allCalendarEvents.filter((item) => {
      if (eventsFilter !== 'All') {
        if (item.status.toLowerCase() !== eventsFilter.toLowerCase()) {
          return false;
        }
      }
      if (selectedCalendarDay !== null) {
        const s = item.startDayNum !== undefined ? item.startDayNum : parseInt(item.day, 10);
        const e = item.endDayNum !== undefined ? item.endDayNum : s;
        // Check if selectedCalendarDay is within the event range [s, e]
        if (selectedCalendarDay < s || selectedCalendarDay > e) {
          return false;
        }
      }
      return true;
    });
  }, [allCalendarEvents, eventsFilter, selectedCalendarDay]);

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedCalendarDay(null);
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedCalendarDay(null);
  };

  const handleDayClick = (cell) => {
    if (!cell.isCurrentMonth) return;
    if (selectedCalendarDay === cell.day) {
      setSelectedCalendarDay(null);
    } else {
      setSelectedCalendarDay(cell.day);
    }
  };

  // 8. Top Performing Events (Matching Reference UI with dynamic timeframes)
  const [topEventsTimeframe, setTopEventsTimeframe] = useState('This Month');
  const [topEventsFilterOpen, setTopEventsFilterOpen] = useState(false);
  const topEventsFilterRef = React.useRef(null);

  // Close filter dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (topEventsFilterRef.current && !topEventsFilterRef.current.contains(e.target)) {
        setTopEventsFilterOpen(false);
      }
    };
    if (topEventsFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [topEventsFilterOpen]);

  const topPerformingEventsDataMap = useMemo(() => {
    const getListFor = (multiplier) => {
      const defaults = [
        {
          id: 'tpe-1',
          title: 'Nitroxx Supercross Championship 2026',
          revenue: multiplier === 1 ? '₹3,42,000' : multiplier === 0.15 ? '₹48,500' : multiplier === 0.5 ? '₹1,85,000' : '₹12,40,000',
          tickets: multiplier === 1 ? '490 / 500 tickets sold' : multiplier === 0.15 ? '68 tickets today' : multiplier === 0.5 ? '260 tickets sold' : '1,840 tickets sold',
          banner: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=150&q=80',
          ringColor: '#3b82f6',
        },
        {
          id: 'tpe-2',
          title: 'Thar Desert 4x4 Dune Rally',
          revenue: multiplier === 1 ? '₹2,88,000' : multiplier === 0.15 ? '₹36,200' : multiplier === 0.5 ? '₹1,42,000' : '₹9,80,000',
          tickets: multiplier === 1 ? '500 / 500 tickets sold' : multiplier === 0.15 ? '42 tickets today' : multiplier === 0.5 ? '210 tickets sold' : '1,450 tickets sold',
          banner: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=150&q=80',
          ringColor: '#f59e0b',
        },
        {
          id: 'tpe-3',
          title: 'Himalayan Enduro Mountain Expedition',
          revenue: multiplier === 1 ? '₹1,45,000' : multiplier === 0.15 ? '₹24,000' : multiplier === 0.5 ? '₹88,000' : '₹6,20,000',
          tickets: multiplier === 1 ? '128 / 150 tickets sold' : multiplier === 0.15 ? '18 tickets today' : multiplier === 0.5 ? '78 tickets sold' : '520 tickets sold',
          banner: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=150&q=80',
          ringColor: '#10b981',
        },
        {
          id: 'tpe-4',
          title: 'Goa Beach Motocross & Night Festival',
          revenue: multiplier === 1 ? '₹1,18,500' : multiplier === 0.15 ? '₹15,800' : multiplier === 0.5 ? '₹64,500' : '₹4,60,000',
          tickets: multiplier === 1 ? '320 / 350 tickets sold' : multiplier === 0.15 ? '22 tickets today' : multiplier === 0.5 ? '140 tickets sold' : '890 tickets sold',
          banner: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=150&q=80',
          ringColor: '#8b5cf6',
        },
      ];

      if (events && events.length > 0) {
        return events.slice(0, 4).map((evt, idx) => {
          const rev = evt.revenue || evt.gross || (defaults[idx] ? defaults[idx].revenue : '₹95,000');
          const formattedRev = typeof rev === 'number' ? `₹${rev.toLocaleString('en-IN')}` : rev;
          return {
            id: evt.id || defaults[idx]?.id || `evt-${idx}`,
            title: evt.title || defaults[idx]?.title || 'Motorsport Event',
            revenue: formattedRev,
            tickets: `${evt.registeredCount ? `${evt.registeredCount} tickets sold` : (defaults[idx] ? defaults[idx].tickets : '100 tickets')}`,
            banner: evt.bannerImage || (defaults[idx] ? defaults[idx].banner : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=150&q=80'),
            ringColor: defaults[idx]?.ringColor || '#3b82f6',
          };
        });
      }

      return defaults;
    };

    return {
      'Today': getListFor(0.15),
      '7 Days': getListFor(0.5),
      'This Month': getListFor(1),
      'All Time': getListFor(3.5),
    };
  }, [events]);

  const activeTopEvents = topPerformingEventsDataMap[topEventsTimeframe] || topPerformingEventsDataMap['This Month'];

  return (
    <AppLayout showHeader={false} searchPlaceholder="Search events, participants, ticket IDs...">
      <div className="dashboard-root">
        {/* =========================================================================
            HEADER ROW
            ========================================================================= */}
        <header className="dash-header-row">
          <div className="dash-user-welcome">
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'grey' }}>Welcome back,</h1>
              <h1 style={{ fontSize: '28px', fontWeight: '700' }}>{profile?.displayName || user?.displayName || 'Host'}</h1>
            </div>
          </div>

          <div className="dash-top-actions">
            <button
              className="dash-select-pill"
              onClick={() => setDateFilter((prev) => (prev === 'This Month' ? 'This Year' : 'This Month'))}
            >
              <Calendar size={14} />
              <span>{dateFilter}</span>
              <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
            </button>
            <button
              className="dash-icon-btn"
              title="Notifications"
              onClick={() => setShowNotificationsModal(!showNotificationsModal)}
            >
              <Bell size={16} />
              <span className="dash-notif-dot" />
            </button>
            <Link to="/events/new" className="dash-primary-btn">
              <Plus size={15} strokeWidth={2.5} />
              <span>Create Event</span>
            </Link>
          </div>
        </header>

        {/* Notifications Popover */}
        {showNotificationsModal && (
          <div
            style={{
              position: 'absolute',
              top: '76px',
              right: '32px',
              width: '320px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              padding: '16px',
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Notifications & Activity</span>
              <button onClick={() => setShowNotificationsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
                <strong>Recent Sale:</strong> John Doe purchased 2x VIP Paddock Pass
              </div>
              <div style={{ padding: '8px', background: '#fce7f3', borderRadius: '8px', color: '#be185d' }}>
                <strong>Refund Request:</strong> ₹4,500 refund pending review
              </div>
              <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1' }}>
                <strong>Live Update:</strong> Gate A scanner registered 120 riders
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: MODERN STAT CARDS (Exact Replication of Image 1 UI)
            Preserving original host metrics: Total Events, Live Events, Tickets Sold, Total Revenue
            ========================================================================= */}
        <section className="stat-cards-grid-modern" aria-label="Key Performance Indicators">
          {/* Card 1: Total Events */}
          <div className="stat-card-modern">
            <div className="stat-card-top-row">
              <div className="stat-card-icon-square">
                <Calendar size={18} />
              </div>
              <div className="stat-card-dropdown-wrap">
                <button
                  className="stat-card-timeframe-btn"
                  onClick={() => setOpenCardDropdown(openCardDropdown === 1 ? null : 1)}
                >
                  <span>{cardTimeframes[1]}</span>
                  <ChevronDown size={13} />
                </button>
                {openCardDropdown === 1 && (
                  <div className="stat-card-dropdown-menu">
                    {['7 Days', '30 Days', '12 Months', 'All Time'].map((tf) => (
                      <button
                        key={tf}
                        className={`stat-dropdown-item ${cardTimeframes[1] === tf ? 'active' : ''}`}
                        onClick={() => selectCardTimeframe(1, tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card-bottom-row">
              <div className="stat-card-metrics-col">
                <div className="stat-card-value">{totalCalculatedEvents}</div>
                <div className="stat-card-label">Total Events</div>
              </div>
              <div className="stat-card-sparkline-wrap">
                <ResponsiveContainer width={120} height={50}>
                  <AreaChart data={sparkline1} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#sparkGrad1)"
                      dot={false}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 2: Live Events */}
          <div className="stat-card-modern">
            <div className="stat-card-top-row">
              <div className="stat-card-icon-square">
                <Radio size={18} color="#dc2626" />
              </div>
              <div className="stat-card-dropdown-wrap">
                <button
                  className="stat-card-timeframe-btn"
                  onClick={() => setOpenCardDropdown(openCardDropdown === 2 ? null : 2)}
                >
                  <span>{cardTimeframes[2]}</span>
                  <ChevronDown size={13} />
                </button>
                {openCardDropdown === 2 && (
                  <div className="stat-card-dropdown-menu">
                    {['7 Days', '30 Days', '12 Months', 'All Time'].map((tf) => (
                      <button
                        key={tf}
                        className={`stat-dropdown-item ${cardTimeframes[2] === tf ? 'active' : ''}`}
                        onClick={() => selectCardTimeframe(2, tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card-bottom-row">
              <div className="stat-card-metrics-col">
                <div className="stat-card-value">{totalLiveEvents}</div>
                <div className="stat-card-label">Live Events</div>
              </div>
              <div className="stat-card-sparkline-wrap">
                <ResponsiveContainer width={120} height={50}>
                  <AreaChart data={sparkline2} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#sparkGrad2)"
                      dot={false}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 3: Tickets Sold */}
          <div className="stat-card-modern">
            <div className="stat-card-top-row">
              <div className="stat-card-icon-square">
                <Ticket size={18} />
              </div>
              <div className="stat-card-dropdown-wrap">
                <button
                  className="stat-card-timeframe-btn"
                  onClick={() => setOpenCardDropdown(openCardDropdown === 3 ? null : 3)}
                >
                  <span>{cardTimeframes[3]}</span>
                  <ChevronDown size={13} />
                </button>
                {openCardDropdown === 3 && (
                  <div className="stat-card-dropdown-menu">
                    {['7 Days', '30 Days', '12 Months', 'All Time'].map((tf) => (
                      <button
                        key={tf}
                        className={`stat-dropdown-item ${cardTimeframes[3] === tf ? 'active' : ''}`}
                        onClick={() => selectCardTimeframe(3, tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card-bottom-row">
              <div className="stat-card-metrics-col">
                <div className="stat-card-value">
                  {totalCalculatedTickets > 0 ? totalCalculatedTickets.toLocaleString('en-IN') : 3844}
                </div>
                <div className="stat-card-label">Tickets Sold</div>
              </div>
              <div className="stat-card-sparkline-wrap">
                <ResponsiveContainer width={120} height={50}>
                  <AreaChart data={sparkline3} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#sparkGrad3)"
                      dot={false}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div className="stat-card-modern">
            <div className="stat-card-top-row">
              <div className="stat-card-icon-square">
                <IndianRupee size={18} />
              </div>
              <div className="stat-card-dropdown-wrap">
                <button
                  className="stat-card-timeframe-btn"
                  onClick={() => setOpenCardDropdown(openCardDropdown === 4 ? null : 4)}
                >
                  <span>{cardTimeframes[4]}</span>
                  <ChevronDown size={13} />
                </button>
                {openCardDropdown === 4 && (
                  <div className="stat-card-dropdown-menu">
                    {['7 Days', '30 Days', '12 Months', 'All Time'].map((tf) => (
                      <button
                        key={tf}
                        className={`stat-dropdown-item ${cardTimeframes[4] === tf ? 'active' : ''}`}
                        onClick={() => selectCardTimeframe(4, tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card-bottom-row">
              <div className="stat-card-metrics-col">
                <div className="stat-card-value">{currency(totalCalculatedRevenue)}</div>
                <div className="stat-card-label">Total Revenue</div>
              </div>
              <div className="stat-card-sparkline-wrap">
                <ResponsiveContainer width={120} height={50}>
                  <AreaChart data={sparkline4} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="sparkGrad4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#sparkGrad4)"
                      dot={false}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: REVENUE ANALYTICS (Pill Capsule Bar Graph matching reference image)
            Default filter: 'This Month' with single day showing bars
            ========================================================================= */}
        <section className="cashflow-analytics-card" aria-label="Revenue Analytics">
          <div className="cashflow-card-header">
            <div className="cashflow-title-group">
              <div className="cashflow-icon-box">
                <Landmark size={18} />
              </div>
              <span className="cashflow-title-text">Revenue Analytics</span>
            </div>

            <div className="cashflow-controls-group">
              {/* Preset Period Pills */}
              <div className="cashflow-period-pills">
                {['This Month', 'This Week', 'Last Month', 'This Year'].map((period) => (
                  <button
                    key={period}
                    className={`cashflow-pill-btn ${cashflowPeriod === period ? 'active' : ''}`}
                    onClick={() => {
                      setCashflowPeriod(period);
                      setSelectedBarIndex(null);
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Date Filter Dropdown with Custom Date Range */}
              <div className="cashflow-date-dropdown-wrap">
                <button
                  className="cashflow-date-picker-btn"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <Calendar size={13} />
                  <span>{cashflowPeriod}</span>
                  <ChevronDown size={12} />
                </button>

                {showDatePicker && (
                  <div className="cashflow-date-menu">
                    <div className="date-menu-header">Date Filter Range</div>
                    {['This Month', 'This Week', 'Last Month', 'This Year', 'Custom Range'].map((p) => (
                      <button
                        key={p}
                        className={`date-menu-option ${cashflowPeriod === p ? 'selected' : ''}`}
                        onClick={() => {
                          setCashflowPeriod(p);
                          setSelectedBarIndex(null);
                          if (p !== 'Custom Range') setShowDatePicker(false);
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    {cashflowPeriod === 'Custom Range' && (
                      <div className="custom-range-inputs">
                        <label>
                          From:
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </label>
                        <label>
                          To:
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </label>
                        <button
                          className="btn-apply-date-range"
                          onClick={() => setShowDatePicker(false)}
                        >
                          Apply Filter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Big Headline Metric and Single Bar Legend */}
          <div className="cashflow-subhead-row">
            <div className="cashflow-big-headline">{getCashflowHeadline()}</div>
            <div className="cashflow-single-legend">
              <span className="legend-ring-dot" style={{ borderColor: '#5457ff', backgroundColor: '#5457ff' }} />
              <span>{cashflowPeriod === 'This Week' ? 'Weekly Daily Revenue' : 'Daily Revenue (This Month)'}</span>
            </div>
          </div>

          {/* Pill Capsule Bar Chart (Matching user reference image) */}
          <div className="cashflow-chart-wrapper" style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeCashflowData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                barCategoryGap={cashflowPeriod === 'This Week' ? '25%' : '14%'}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11.5, fill: '#64748b', fontWeight: 500 }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => {
                    if (val >= 10000000) return `₹${val / 10000000}Cr`;
                    if (val >= 100000) return `₹${val / 100000}L`;
                    if (val >= 1000) return `₹${val / 1000}k`;
                    return `₹${val}`;
                  }}
                />
                <Tooltip
                  content={<CustomCashflowTooltip />}
                  cursor={{ fill: 'rgba(241, 243, 253, 0.45)', radius: 10 }}
                />
                <Bar
                  dataKey="amount"
                  radius={[20, 20, 20, 20]}
                  barSize={cashflowPeriod === 'This Week' ? 36 : 14}
                  cursor="pointer"
                  onClick={(_, index) => setSelectedBarIndex(index)}
                >
                  {activeCashflowData.map((entry, index) => {
                    const isSelected = selectedBarIndex !== null
                      ? selectedBarIndex === index
                      : (entry.isPeak || (cashflowPeriod === 'This Week' && entry.name === 'Wed'));
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isSelected ? '#5457ff' : '#edeefc'}
                        style={{
                          transition: 'all 0.2s ease',
                          outline: 'none',
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>



        {/* =========================================================================
            SECTION 3: UPCOMING EVENTS & INTERACTIVE CALENDAR
            Exact replication of Image design with Calendar & Your events (Ongoing filter, No Add New)
            ========================================================================= */}
        <section className="dash-upcoming-calendar-section" aria-label="Upcoming Events & Calendar">
          <div className="events-calendar-split-container">

            {/* LEFT COLUMN: INTERACTIVE CALENDAR */}
            <div className="calendar-panel-left">
              <div className="calendar-top-header">
                <div className="calendar-title-group">
                  <span className="cal-month-name">{calendarMonthName}</span>
                  <span className="cal-year-name">{calendarYear}</span>
                </div>

                <div className="calendar-nav-controls">
                  <button className="cal-nav-btn" onClick={handlePrevMonth} title="Previous Month">
                    <ChevronLeft size={15} />
                  </button>
                  <button className="cal-nav-btn" onClick={handleNextMonth} title="Next Month">
                    <ChevronRight size={15} />
                  </button>

                  <div className="cal-view-selector-wrap">
                    <button
                      className="cal-view-pill-btn"
                      onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                    >
                      <span>{calendarViewMode}</span>
                      <ChevronDown size={13} />
                    </button>
                    {viewDropdownOpen && (
                      <div className="cal-dropdown-popover">
                        {['Month', 'Week', 'Today'].map((mode) => (
                          <button
                            key={mode}
                            className={`cal-dropdown-item ${calendarViewMode === mode ? 'active' : ''}`}
                            onClick={() => {
                              setCalendarViewMode(mode);
                              if (mode === 'Today') {
                                setCalendarDate(new Date());
                                setSelectedCalendarDay(new Date().getDate());
                              }
                              setViewDropdownOpen(false);
                            }}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekdays Row SUN - SAT */}
              <div className="cal-weekdays-row">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
                  <div
                    key={w}
                    className={`cal-weekday-pill ${idx === 5 ? 'highlight' : ''}`}
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="cal-grid-days">
                {calendarCells.map((cell, idx) => {
                  const isSelected = cell.isCurrentMonth && selectedCalendarDay === cell.day;
                  const isOngoing = cell.isCurrentMonth && cell.isOngoing;
                  return (
                    <div
                      key={idx}
                      className={`cal-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected-day' : ''} ${isOngoing ? 'ongoing-day' : ''} ${!cell.hasEvent ? 'has-no-dot' : ''}`}
                      onClick={() => handleDayClick(cell)}
                      title={
                        cell.isCurrentMonth
                          ? `${calendarMonthName} ${cell.day}, ${calendarYear}${isOngoing ? ' • Ongoing Event Active' : ''}`
                          : ''
                      }
                    >
                      <span className={`cal-event-dot ${isOngoing ? 'ongoing' : ''}`} />
                      <span className="cal-day-number">{cell.day}</span>
                    </div>
                  );
                })}
              </div>

              {/* Ongoing Multi-Day Legend Strip */}
              <div className="cal-ongoing-legend-strip">
                <div className="cal-legend-item">
                  <span className="cal-legend-dot ongoing" />
                  <span>Ongoing Event (Active Days)</span>
                </div>
                <div className="cal-legend-item">
                  <span className="cal-legend-dot upcoming" />
                  <span>Scheduled / Single-day</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: YOUR EVENTS (With Ongoing filter, No Add New button) */}
            <div className="events-panel-right">
              <div className="events-panel-header">
                <h2 className="events-panel-title">Your events</h2>

                <div className="events-filter-dropdown-wrap">
                  <button
                    className="events-filter-pill-trigger"
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  >
                    <span>{eventsFilter}</span>
                    <ChevronDown size={13} />
                  </button>

                  {filterDropdownOpen && (
                    <div className="events-filter-menu">
                      {[
                        { label: 'All', color: null },
                        { label: 'Ongoing', color: '#10b981' },
                        { label: 'Upcoming', color: '#3b82f6' },
                        { label: 'Completed', color: '#16a34a' },
                        { label: 'Pending', color: '#f59e0b' },
                        { label: 'Cancelled', color: '#ef4444' },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          className={`events-filter-item ${eventsFilter === opt.label ? 'active' : ''}`}
                          onClick={() => {
                            setEventsFilter(opt.label);
                            setFilterDropdownOpen(false);
                          }}
                        >
                          <span>{opt.label}</span>
                          {opt.color && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: opt.color }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Date / Filter indication banner */}
              {selectedCalendarDay !== null && (
                <div className="events-active-filter-strip">
                  <span className="active-filter-chip">
                    <span>Filtered: {calendarMonthName.slice(0, 3)} {selectedCalendarDay}</span>
                    <button onClick={() => setSelectedCalendarDay(null)} title="Clear Date Filter">
                      <X size={12} />
                    </button>
                  </span>
                  {eventsFilter !== 'All' && (
                    <span className="active-filter-chip">
                      <span>Status: {eventsFilter}</span>
                      <button onClick={() => setEventsFilter('All')} title="Clear Status Filter">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Event Cards List */}
              <div className="events-cards-scroll-container">
                {filteredCalendarEvents.length > 0 ? (
                  filteredCalendarEvents.map((evt) => (
                    <div key={evt.id} className="event-card-item">
                      {/* Left Date Column */}
                      <div className="event-card-date-box">
                        <span className={`event-card-day-num ${evt.isMultiDay ? 'multi-day' : ''}`}>
                          {evt.displayDayRange || evt.day}
                        </span>
                        <span className="event-card-day-name">{evt.dayName}</span>
                        {evt.isMultiDay && <span className="multi-day-tag">Ongoing Multi-day</span>}
                      </div>

                      <div className="event-card-v-divider" />

                      {/* Right Event Details */}
                      <div className="event-card-content">
                        <h3 className="event-card-title">{evt.title}</h3>

                        <div className="event-card-meta-row">
                          {/* Status Pill */}
                          <span className={`event-status-pill ${evt.status.toLowerCase()}`}>
                            {evt.status === 'Ongoing' && <span className="event-live-dot" />}
                            {evt.status}
                          </span>

                          {/* Date & Time */}
                          <span className="event-meta-icon-text">
                            <Calendar size={13} color="#94a3b8" />
                            <span>{evt.dateStr}</span>
                          </span>

                          {/* Location */}
                          <span className="event-meta-icon-text">
                            <MapPin size={13} color="#94a3b8" />
                            <span>{evt.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="events-empty-state-box">
                    <Calendar size={28} color="#94a3b8" />
                    <p>No {eventsFilter !== 'All' ? `${eventsFilter.toLowerCase()} ` : ''}events found{selectedCalendarDay ? ` for ${calendarMonthName.slice(0, 3)} ${selectedCalendarDay}` : ''}.</p>
                    <button
                      className="events-empty-reset-btn"
                      onClick={() => {
                        setSelectedCalendarDay(null);
                        setEventsFilter('All');
                      }}
                    >
                      Show All Events
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            ROW 2B: TOP PERFORMING EVENTS & HIGHLIGHTS
            ========================================================================= */}
        <div className="dash-grid-2col" style={{ marginBottom: '24px' }}>
          {/* SECTION 8: TOP PERFORMING EVENTS (IMAGE REPLICATION UI) */}
          <div className="top-events-card-modern">
            {/* Top Bar matching Image */}
            <div className="top-events-header-bar">
              {/* Left Filter Pill (In place of Members) */}
              <div className="top-events-filter-wrap" ref={topEventsFilterRef}>
                <button
                  type="button"
                  className="top-events-filter-pill"
                  onClick={() => setTopEventsFilterOpen(!topEventsFilterOpen)}
                  title="Change timeframe filter"
                >
                  <span className="tpe-filter-text">{topEventsTimeframe}</span>
                  <span className="tpe-filter-count">{activeTopEvents.length}</span>
                  <ChevronDown
                    size={14}
                    className={`tpe-filter-chevron ${topEventsFilterOpen ? 'open' : ''}`}
                  />
                </button>

                {topEventsFilterOpen && (
                  <div className="top-events-filter-dropdown">
                    {['Today', '7 Days', 'This Month', 'All Time'].map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        className={`tpe-dropdown-item ${topEventsTimeframe === tf ? 'active' : ''}`}
                        onClick={() => {
                          setTopEventsTimeframe(tf);
                          setTopEventsFilterOpen(false);
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right View More Pill (In place of Search Bar) */}
              <Link to="/events" className="top-events-view-more-pill" title="View all events">
                <span>View More</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Event Rows matching Image */}
            <div className="top-events-list">
              {activeTopEvents.map((evt) => (
                <div key={evt.id} className="top-event-item-modern">
                  <div className="top-event-left-group">
                    {/* Event Banner Circular Avatar */}
                    <div
                      className="top-event-avatar-ring"
                      style={{ borderColor: evt.ringColor || '#3b82f6' }}
                    >
                      <img
                        src={evt.banner}
                        alt={evt.title}
                        className="top-event-avatar-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    </div>

                    {/* Event Name */}
                    <div className="top-event-title-wrap">
                      <span className="top-event-name-text" title={evt.title}>
                        {evt.title}
                      </span>
                      <span className="top-event-location-text" title={evt.title}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin preview-icon"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg> Buddh International Circuit
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Simple Amount Text */}
                  <div className="top-event-amount-val">
                    {evt.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Turnout & Operation Highlights */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-card-icon-box">
                  <Users size={16} color="#0284c7" />
                </div>
                <h3 className="dash-card-title">Audience Insights</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>+18.4% New Riders</span>
            </div>

            {/* Age Groups Segmented Meter */}
            <div className="audience-meter-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Age Groups Distribution</span>
                <span style={{ color: '#6b7280' }}>Core: 22 - 38 yrs</span>
              </div>
              <div className="audience-meter-track">
                <div className="audience-seg orange" style={{ width: '48%' }} title="22-30 yrs (48%)" />
                <div className="audience-seg teal" style={{ width: '32%' }} title="31-40 yrs (32%)" />
                <div className="audience-seg purple" style={{ width: '14%' }} title="18-21 yrs (14%)" />
                <div className="audience-seg blue" style={{ width: '6%' }} title="41+ yrs (6%)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                <span>22-30 (48%)</span>
                <span>31-40 (32%)</span>
                <span>18-21 (14%)</span>
                <span>41+ (6%)</span>
              </div>
            </div>

            {/* Top Cities */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #f0f2f5', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Top Cities & Hubs
              </span>

              {[
                { city: 'Mumbai & Pune Belt', pct: 42, count: '5,240 riders' },
                { city: 'Delhi NCR & Gurugram', pct: 28, count: '3,490 riders' },
                { city: 'Bengaluru', pct: 18, count: '2,240 riders' },
                { city: 'Rest of India', pct: 12, count: '1,510 riders' },
              ].map((c) => (
                <div key={c.city} className="city-progress-item">
                  <div className="city-meta-row">
                    <span className="city-name">{c.city}</span>
                    <span className="city-count">{c.count} ({c.pct}%)</span>
                  </div>
                  <div className="city-progress-bar">
                    <div className="city-progress-fill" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: RECENT PARTICIPANTS DIRECTORY TABLE (Participants UI Match)
            ========================================================================= */}
        <section className="dashboard-participants-section" aria-label="Recent Participants List">
          {/* Section Header */}
          <div className="dash-ptable-header">
            <div className="dash-ptable-title-wrap">
              <div className="ptable-badge-icon">
                <Users size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className="dash-ptable-title">Recent Participants</h2>
                  <span className="dash-ptable-count-badge">{participants.length} Total Bookings</span>
                </div>
                <p className="dash-ptable-sub">
                  Directory of attendee bookings, event packages & ticket tiers, gate clearance, and operational status.
                </p>
              </div>
            </div>


          </div>

          {/* Metric Quick-Strip */}
          {/* <div className="ptable-metric-strip" style={{ marginBottom: '14px' }}>
            <div className="metric-pill-item">
              <span className="metric-pill-label">Total Bookings:</span>
              <span className="metric-pill-val">{participants.length} Registered</span>
            </div>
            <div className="metric-pill-item">
              <span className="metric-pill-label">Checked In:</span>
              <span className="metric-pill-val text-green">{totalCheckedIn} Attendees ({Math.round((totalCheckedIn / (participants.length || 1)) * 100)}%)</span>
            </div>
            <div className="metric-pill-item">
              <span className="metric-pill-label">On Track / Active:</span>
              <span className="metric-pill-val text-blue">{totalOnTrack} Riders</span>
            </div>
            <div className="metric-pill-item">
              <span className="metric-pill-label">Pending Gate:</span>
              <span className="metric-pill-val text-amber">{totalPending} Pending</span>
            </div>
          </div> */}

          {/* Main Table Card */}
          <div className="ptable-card-container">
            <div className="ptable-scroll-frame">
              <table className="ptable-custom-table">
                <thead>
                  <tr>
                    {/* Checkbox Column */}
                    {/* <th className="ptable-th th-checkbox">
                      <input
                        type="checkbox"
                        className="ptable-checkbox-input"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        title="Select all on this page"
                      />
                    </th> */}

                    {/* 1. Participant Name Column */}
                    <th
                      className="ptable-th th-sortable th-name"
                      onClick={() => handleDashSort('name')}
                      title="Sort by Participant Name"
                    >
                      <div className="th-content-flex">
                        <User size={13.5} className="th-header-icon" />
                        <span>Participant Name</span>
                        {dashSortField === 'name' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 2. Ticket & Tier Column */}
                    <th
                      className="ptable-th th-sortable th-ticket"
                      onClick={() => handleDashSort('tierName')}
                      title="Sort by Ticket Tier"
                    >
                      <div className="th-content-flex">
                        <Ticket size={13.5} className="th-header-icon" />
                        <span>Ticket & Tier</span>
                        {dashSortField === 'tierName' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 3. Event Joined Column */}
                    <th
                      className="ptable-th th-sortable th-event"
                      onClick={() => handleDashSort('eventTitle')}
                      title="Sort by Event Title"
                    >
                      <div className="th-content-flex">
                        <CalendarDays size={13.5} className="th-header-icon" />
                        <span>Event Joined</span>
                        {dashSortField === 'eventTitle' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 4. Booking Date Column */}
                    <th
                      className="ptable-th th-sortable th-date"
                      onClick={() => handleDashSort('bookedMinutes')}
                      title="Sort by Booking Date"
                    >
                      <div className="th-content-flex">
                        <Clock size={13.5} className="th-header-icon" />
                        <span>Booking date</span>
                        {dashSortField === 'bookedMinutes' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 5. Ticket Price & Payment Column */}
                    <th
                      className="ptable-th th-sortable th-price"
                      onClick={() => handleDashSort('priceNumeric')}
                      title="Sort by Ticket Price"
                    >
                      <div className="th-content-flex">
                        <CreditCard size={13.5} className="th-header-icon" />
                        <span>Price </span>
                        {dashSortField === 'priceNumeric' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 6. Gate Status Column */}
                    <th
                      className="ptable-th th-sortable th-gate"
                      onClick={() => handleDashSort('gateStatus')}
                      title="Sort by Gate Status"
                    >
                      <div className="th-content-flex">
                        <CheckCircle2 size={13.5} className="th-header-icon" />
                        <span>Payment Status</span>
                        {dashSortField === 'gateStatus' && (
                          dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                        )}
                      </div>
                    </th>

                    {/* 7. Vehicle & City Column */}
                    {/* <th
                          className="ptable-th th-sortable th-vehicle"
                          onClick={() => handleDashSort('city')}
                          title="Sort by City"
                        >
                          <div className="th-content-flex">
                            <MapPin size={13.5} className="th-header-icon" />
                            <span>Vehicle & City</span>
                            {dashSortField === 'city' && (
                              dashSortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                            )}
                          </div>
                        </th> */}
                  </tr>
                </thead>

                <tbody>
                  {dashPaginated.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="ptable-empty-cell">
                        <div className="empty-state-box">
                          <Users size={32} className="empty-state-icon" />
                          <h3>No participant bookings found</h3>
                          <p>Try clearing your search query or gate status filter.</p>
                          <button
                            className="ptable-btn-secondary"
                            onClick={() => {
                              setParticipantSearch('');
                              setParticipantGateFilter('All');
                            }}
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dashPaginated.map((item) => {
                      const isSelected = selectedRowIds.has(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`ptable-row ${isSelected ? 'row-selected' : ''}`}
                          onClick={() => setTicketModalParticipant(item)}
                        >
                          {/* Checkbox Column */}
                          {/* <td className="ptable-td td-checkbox" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="ptable-checkbox-input"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(item.id, e)}
                            />
                          </td> */}

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
                              {/* <span
                                className="domain-pill-badge"
                                onClick={(e) => handleCopyCode(item.ticketNumber, e)}
                                title="Click to copy Ticket ID"
                              >
                                <span className="bib-accent-tag">{item.bibNumber}</span>
                                {item.ticketNumber}
                                {copiedCode === item.ticketNumber ? (
                                  <Check size={11} className="pill-copy-icon success" />
                                ) : null}
                              </span> */}
                            </div>
                          </td>

                          {/* 3. Event Joined */}
                          <td className="ptable-td td-event">
                            <div className="avatar-name-cell">
                              <span className="monogram-avatar-circle event-circle">
                                {item.eventTitle ? item.eventTitle.charAt(0) : 'E'}
                              </span>
                              <span className="cell-person-name bold">{item.eventTitle}</span>
                            </div>
                          </td>

                          {/* 4. Booking Date */}
                          <td className="ptable-td td-date">
                            <span className="creation-date-text">{item.bookedDate}</span>
                          </td>

                          {/* 5. Ticket Price & Payment */}
                          <td className="ptable-td td-price">
                            <div className="price-cell-stack">
                              <span className="employee-count-num bold">{item.ticketPrice}</span>
                              {/* <span className={`payment-pill-tag ${item.paymentStatus?.toLowerCase()}`}>
                                {item.paymentStatus}
                              </span> */}
                            </div>
                          </td>

                          {/* 6. Gate Status */}
                          <td
                            className="ptable-td td-gate"
                            onClick={(e) => handleToggleCheckIn(item.id, e)}
                            title="Click to toggle Check-In"
                          >
                            {renderGateBadge(item.gateStatus)}
                          </td>

                          {/* 7. Vehicle & City */}
                          {/* <td className="ptable-td td-vehicle">
                            <span
                              className="address-truncated-text"
                              title={`${item.vehicle} (${item.vehiclePlate}) · ${item.city}`}
                            >
                              {item.vehicle} <span className="city-accent">· {item.city}</span>
                            </span>
                          </td> */}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="ptable-footer-pagination">
              <div className="pagination-count-label">
                Showing {filteredParticipants.length === 0 ? 0 : (dashPage - 1) * dashPageSize + 1} to{' '}
                {Math.min(dashPage * dashPageSize, filteredParticipants.length)} of {filteredParticipants.length} recent participants
              </div>

              <div className="pagination-controls-center">
                <button
                  className="pagination-nav-btn"
                  disabled={dashPage === 1}
                  onClick={() => setDashPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalDashPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-page-number ${dashPage === p ? 'active' : ''}`}
                    onClick={() => setDashPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="pagination-nav-btn"
                  disabled={dashPage === totalDashPages || totalDashPages === 0}
                  onClick={() => setDashPage((p) => Math.min(totalDashPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="pagination-page-size-wrap">
                <span className="size-label">Rows per page:</span>
                <div className="size-select-box">
                  <select
                    value={dashPageSize}
                    onChange={(e) => {
                      setDashPageSize(Number(e.target.value));
                      setDashPage(1);
                    }}
                    className="page-size-dropdown"
                  >
                    <option value={5}>5 / page</option>
                    <option value={8}>8 / page</option>
                    <option value={12}>12 / page</option>
                  </select>
                  <ChevronDown size={13} className="size-chevron" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedRowIds.size > 0 && (
            <div className="ptable-bulk-floating-bar">
              <span className="bulk-badge-count">{selectedRowIds.size} selected</span>

              <button className="bulk-bar-btn" onClick={handleBulkCheckIn}>
                <CheckCircle2 size={14} />
                <span>Gate Check-In (Done)</span>
              </button>

              <button
                className="bulk-bar-btn"
                onClick={() => {
                  setParticipants((prev) =>
                    prev.map((p) => (selectedRowIds.has(p.id) ? { ...p, gateStatus: 'On Progress' } : p))
                  );
                  showToast(`Marked ${selectedRowIds.size} participants On Track.`);
                  setSelectedRowIds(new Set());
                }}
              >
                <Info size={14} />
                <span>Mark On Track</span>
              </button>

              <button className="bulk-bar-btn" onClick={handleExportCSV}>
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button className="bulk-bar-btn danger" onClick={handleBulkDelete}>
                <Trash2 size={14} />
                <span>Cancel Bookings</span>
              </button>

              <button
                className="bulk-close-btn"
                onClick={() => setSelectedRowIds(new Set())}
                title="Deselect all"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Digital Boarding Pass Ticket Modal */}
          {ticketModalParticipant && (
            <div className="ptable-modal-backdrop" onClick={() => setTicketModalParticipant(null)}>
              <div className="digital-ticket-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="ticket-hero-banner">
                  <div className="ticket-header-top">
                    <span className="ticket-brand-badge">⚡ Nitroxx Verified Booking Pass</span>
                    <button className="modal-close-icon white" onClick={() => setTicketModalParticipant(null)}>
                      <X size={18} />
                    </button>
                  </div>
                  <h2 className="ticket-event-name">{ticketModalParticipant.eventTitle}</h2>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`event-tier-badge tier-${(ticketModalParticipant.tierName || 'standard').toLowerCase().replace(/\s+/g, '-')}`}>
                      {ticketModalParticipant.tierName || 'Standard'} Tier
                    </span>
                    {ticketModalParticipant.ticketFor && (
                      <span className="ticket-for-subpill" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        {ticketModalParticipant.ticketFor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Perforation line */}
                <div className="ticket-perforation-row">
                  <div className="ticket-notch-left" />
                  <div className="ticket-dashed-line" />
                  <div className="ticket-notch-right" />
                </div>

                <div className="ticket-body-content">
                  <div className="ticket-rider-row">
                    <img
                      src={ticketModalParticipant.avatar}
                      alt={ticketModalParticipant.name}
                      className="ticket-rider-avatar"
                    />
                    <div className="ticket-rider-meta">
                      <h3>{ticketModalParticipant.name}</h3>
                      <p>{ticketModalParticipant.email} · {ticketModalParticipant.phone}</p>
                      <div style={{ marginTop: '6px' }}>
                        {renderGateBadge(ticketModalParticipant.gateStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="ticket-grid-details">
                    <div className="ticket-info-item">
                      <span>Bib Number</span>
                      <strong>{ticketModalParticipant.bibNumber}</strong>
                    </div>
                    <div className="ticket-info-item">
                      <span>Package Tier</span>
                      <strong>{ticketModalParticipant.tierName} ({ticketModalParticipant.ticketFor})</strong>
                    </div>
                    <div className="ticket-info-item">
                      <span>Vehicle & Plate</span>
                      <strong>{ticketModalParticipant.vehicle} ({ticketModalParticipant.vehiclePlate})</strong>
                    </div>
                    <div className="ticket-info-item">
                      <span>Gate Wave / Time</span>
                      <strong>{ticketModalParticipant.wave || 'General Wave (08:00 AM)'}</strong>
                    </div>
                    <div className="ticket-info-item">
                      <span>Blood Group</span>
                      <strong>{ticketModalParticipant.bloodGroup || 'O+'}</strong>
                    </div>
                    <div className="ticket-info-item">
                      <span>Price & Status</span>
                      <strong>{ticketModalParticipant.ticketPrice} · {ticketModalParticipant.paymentStatus}</strong>
                    </div>
                  </div>

                  <div className="ticket-barcode-box">
                    <div className="barcode-svg-line" />
                    <span className="barcode-num-text">*{ticketModalParticipant.ticketNumber}*</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="ptable-btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => {
                        const next = ticketModalParticipant.gateStatus === 'Done' ? 'On Progress' : 'Done';
                        setParticipants((prev) =>
                          prev.map((p) => (p.id === ticketModalParticipant.id ? { ...p, gateStatus: next } : p))
                        );
                        setTicketModalParticipant((prev) => ({ ...prev, gateStatus: next }));
                        showToast(next === 'Done' ? 'Gate Verified: Checked In!' : 'Gate Status Reset.');
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{ticketModalParticipant.gateStatus === 'Done' ? 'Reset Attendance' : 'Confirm Gate Check-In (Done)'}</span>
                    </button>

                    <button
                      className="ptable-btn-secondary"
                      onClick={() => window.print()}
                      title="Print Gate Pass"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Toast Notification */}
          {toastMessage && (
            <div className="ptable-floating-toast">
              <CheckCircle2 size={16} className="toast-icon" />
              <span>{toastMessage}</span>
            </div>
          )}
        </section>


      </div>
    </AppLayout>
  );
};

export default Dashboard;
