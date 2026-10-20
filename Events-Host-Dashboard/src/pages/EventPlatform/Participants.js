import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  User,
  Ticket,
  CalendarDays,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin, 
  Search, 
  Plus, 
  Download, 
  QrCode,
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Check, 
  Trash2, 
  RefreshCw,
  Printer
} from 'lucide-react';
import { TicketPassView } from './ticketDesigns';
import './TicketDesigns.css';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useRegistrations } from '../../hooks/useRegistrations';
import { EVENT_PARTICIPANTS_DATA } from './participantsData';
import { downloadCsv, formatDateTime } from '../../utils/formatters';
import './Participants.css';

const Participants = () => {
  const { user } = useAuth();
  const { registrations } = useRegistrations({ hostId: user?.uid });

  // Master Participants List initialized with event booking participants
  const [participants, setParticipants] = useState(() => {
    return EVENT_PARTICIPANTS_DATA;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedGateStatus, setSelectedGateStatus] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Selection State
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);

  // Modals & Drawers
  const [ticketModalParticipant, setTicketModalParticipant] = useState(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  // Add Participant Form State (Matches host event creation tiers & packages)
  const [newFormData, setNewFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventTitle: 'Manali–Leh–Manali Adventure Tour',
    tierName: 'Platinum',
    ticketFor: 'Rider',
    ticketPrice: '₹25,000',
    gateStatus: 'Done',
    paymentStatus: 'Paid',
    vehicle: 'KTM 390 Adventure',
    vehiclePlate: 'MH02-DX-1001',
    city: 'Mumbai',
    bloodGroup: 'O+',
    emergencyContact: ''
  });

  const searchInputRef = useRef(null);

  // Merge any live Firebase registrations into the list
  useEffect(() => {
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

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setTicketModalParticipant(null);
        setIsScannerModalOpen(false);
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Copied ${code} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Distinct Filter Options
  const eventOptions = useMemo(() => {
    const set = new Set(participants.map(p => p.eventTitle).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [participants]);

  // Ticket Tiers as defined when host creates events
  const tierOptions = useMemo(() => {
    const set = new Set(participants.map(p => p.tierName).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [participants]);

  const cityOptions = useMemo(() => {
    const set = new Set(participants.map(p => p.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [participants]);

  // Filtering & Sorting
  const filteredParticipants = useMemo(() => {
    let result = [...participants];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.ticketNumber && p.ticketNumber.toLowerCase().includes(q)) ||
        (p.bibNumber && p.bibNumber.toLowerCase().includes(q)) ||
        (p.eventTitle && p.eventTitle.toLowerCase().includes(q)) ||
        (p.tierName && p.tierName.toLowerCase().includes(q)) ||
        (p.ticketTier && p.ticketTier.toLowerCase().includes(q)) ||
        (p.ticketFor && p.ticketFor.toLowerCase().includes(q)) ||
        (p.vehicle && p.vehicle.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    }

    // Event filter
    if (selectedEvent !== 'All') {
      result = result.filter(p => p.eventTitle === selectedEvent);
    }

    // Gate Status filter
    if (selectedGateStatus !== 'All') {
      result = result.filter(p => p.gateStatus === selectedGateStatus);
    }

    // Ticket Tier filter
    if (selectedTier !== 'All') {
      result = result.filter(p => p.tierName === selectedTier || (p.ticketTier && p.ticketTier.includes(selectedTier)));
    }

    // City filter
    if (selectedCity !== 'All') {
      result = result.filter(p => p.city === selectedCity);
    }

    // Column Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    participants, 
    searchQuery, 
    selectedEvent, 
    selectedGateStatus, 
    selectedTier, 
    selectedCity, 
    sortField, 
    sortDirection
  ]);

  // Paginated Rows
  const totalItems = filteredParticipants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParticipants.slice(start, start + pageSize);
  }, [filteredParticipants, currentPage, pageSize]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedEvent !== 'All') count++;
    if (selectedGateStatus !== 'All') count++;
    if (selectedTier !== 'All') count++;
    if (selectedCity !== 'All') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedEvent, selectedGateStatus, selectedTier, selectedCity, searchQuery]);

  const handleResetFilters = () => {
    setSelectedEvent('All');
    setSelectedGateStatus('All');
    setSelectedTier('All');
    setSelectedCity('All');
    setSearchQuery('');
    setCurrentPage(1);
    showToast('Filters reset to default.');
  };

  // Sorting toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(paginatedRows.map(p => p.id)));
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

  const isAllSelected = paginatedRows.length > 0 && paginatedRows.every(p => selectedRowIds.has(p.id));

  // Toggle Check In status directly
  const handleToggleCheckIn = (id, e) => {
    e?.stopPropagation();
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.gateStatus === 'Done' ? 'On Progress' : 'Done';
        showToast(nextStatus === 'Done' ? `Checked In: ${p.name}` : `Reset Attendance: ${p.name}`);
        return { ...p, gateStatus: nextStatus };
      }
      return p;
    }));
  };

  // Bulk Operations
  const handleBulkCheckIn = () => {
    setParticipants(prev => prev.map(p => selectedRowIds.has(p.id) ? { ...p, gateStatus: 'Done' } : p));
    showToast(`Checked in ${selectedRowIds.size} participants.`);
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Cancel bookings for ${selectedRowIds.size} selected participants?`)) {
      setParticipants(prev => prev.filter(p => !selectedRowIds.has(p.id)));
      showToast(`Removed ${selectedRowIds.size} participant bookings.`);
      setSelectedRowIds(new Set());
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const listToExport = selectedRowIds.size > 0 
      ? participants.filter(p => selectedRowIds.has(p.id))
      : filteredParticipants;

    downloadCsv('event_participants_directory.csv', listToExport.map(p => ({
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
      City: p.city,
      BloodGroup: p.bloodGroup,
      EmergencyContact: p.emergencyContact
    })));

    showToast(`Exported ${listToExport.length} participant records.`);
  };

  // Fast Gate Scanner Simulation
  const handleGateScanValidate = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const term = scanInput.toLowerCase().trim();
    const found = participants.find(p => 
      p.bibNumber.toLowerCase().includes(term) ||
      p.ticketNumber.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term)
    );

    if (found) {
      setParticipants(prev => prev.map(p => p.id === found.id ? { ...p, gateStatus: 'Done' } : p));
      setScanSuccess(true);
      showToast(`Gate Approved: ${found.name} (${found.bibNumber})`);
      setTimeout(() => {
        setScanSuccess(false);
        setScanInput('');
      }, 1500);
    } else {
      alert(`No active participant booking found for "${scanInput}". Try entering BIB-101 or NX-89214.`);
    }
  };

  // Add Participant Form Submit (Uses event host creation tier structure)
  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!newFormData.name.trim() || !newFormData.email.trim()) return;

    const newId = `bkg-${Date.now()}`;
    const newBib = `BIB-${Math.floor(121 + Math.random() * 800)}`;
    const newTicket = `NX-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking = {
      id: newId,
      name: newFormData.name.trim(),
      email: newFormData.email.trim(),
      phone: newFormData.phone.trim() || '+91 98000 12345',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      avatarInitial: newFormData.name.trim().charAt(0).toUpperCase(),
      eventTitle: newFormData.eventTitle,
      tierName: newFormData.tierName,
      ticketFor: newFormData.ticketFor,
      ticketTier: `${newFormData.tierName} · ${newFormData.ticketFor}`,
      ticketNumber: newTicket,
      bibNumber: newBib,
      ticketPrice: newFormData.ticketPrice || '₹4,999',
      priceNumeric: parseInt(newFormData.ticketPrice.replace(/[^0-9]/g, ''), 10) || 4999,
      bookedDate: 'Just now',
      bookedMinutes: 0,
      paymentStatus: newFormData.paymentStatus,
      gateStatus: newFormData.gateStatus,
      vehicle: newFormData.vehicle || 'KTM 390 Adventure',
      vehiclePlate: newFormData.vehiclePlate || 'MH12-NEW',
      city: newFormData.city || 'Mumbai',
      bloodGroup: newFormData.bloodGroup || 'O+',
      emergencyContact: newFormData.emergencyContact || 'Listed with Team',
      wave: 'General Wave (08:00 AM)'
    };

    setParticipants(prev => [newBooking, ...prev]);
    setIsAddModalOpen(false);
    setNewFormData({
      name: '',
      email: '',
      phone: '',
      eventTitle: 'Manali–Leh–Manali Adventure Tour',
      tierName: 'Platinum',
      ticketFor: 'Rider',
      ticketPrice: '₹25,000',
      gateStatus: 'Done',
      paymentStatus: 'Paid',
      vehicle: 'KTM 390 Adventure',
      vehiclePlate: 'MH02-DX-1001',
      city: 'Mumbai',
      bloodGroup: 'O+',
      emergencyContact: ''
    });
    showToast(`Registered booking for ${newBooking.name} (${newBib})`);
  };

  // Quick stats
  const totalCheckedIn = participants.filter(p => p.gateStatus === 'Done').length;
  const totalOnTrack = participants.filter(p => p.gateStatus === 'On Progress').length;
  const totalPending = participants.filter(p => p.gateStatus === 'Pending Gate' || p.gateStatus === 'Waiting for Review').length;

  // Gate Status Pill Badge
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

  return (
    <AppLayout searchPlaceholder="Search participants, ticket IDs, bib numbers, events...">
      <div className="ptable-page-wrapper">

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="ptable-floating-toast">
            <CheckCircle2 size={16} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="ptable-header-section">
          <div className="ptable-header-title-block">
            <div className="ptable-badge-icon">
              <Users size={20} strokeWidth={2} />
            </div>
            <div>
              <h1 className="ptable-main-title">Event Participants & Bookings</h1>
              <p className="ptable-sub-title">
                Directory of attendee bookings, event packages & ticket tiers, gate clearance, and operational status.
              </p>
            </div>
          </div>

          <div className="ptable-header-actions">
            <button 
              className="ptable-btn-secondary"
              onClick={() => setIsScannerModalOpen(true)}
              title="Fast Gate QR & Bib Check-In"
            >
              <QrCode size={15} />
              <span>Fast Check-In</span>
            </button>

            <button 
              className="ptable-btn-secondary"
              onClick={handleExportCSV}
              title="Export all or selected records to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button 
              className="ptable-btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Participant</span>
            </button>
          </div>
        </div>

        {/* Metric Quick-Strip */}
        <div className="ptable-metric-strip">
          <div className="metric-pill-item">
            <span className="metric-pill-label">Total Bookings:</span>
            <span className="metric-pill-val">{participants.length} Registered</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">Checked In:</span>
            <span className="metric-pill-val text-green">{totalCheckedIn} Attendees ({Math.round((totalCheckedIn / participants.length) * 100 || 0)}%)</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">On Track / Active:</span>
            <span className="metric-pill-val text-blue">{totalOnTrack} Riders</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">Pending Gate:</span>
            <span className="metric-pill-val text-amber">{totalPending} Pending</span>
          </div>
        </div>

        {/* Toolbar: Search and Filter Dropdowns */}
        <div className="ptable-toolbar-container">
          {/* Search Box */}
          <div className="ptable-search-wrapper">
            <Search size={15} className="ptable-search-icon" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search participants, ticket IDs, bibs, tiers, events, cities..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="ptable-search-input"
            />
            {searchQuery ? (
              <button 
                className="ptable-search-clear" 
                onClick={() => setSearchQuery('')}
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
            {/* Event Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Event:</span>
              <select 
                value={selectedEvent}
                onChange={(e) => { setSelectedEvent(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                <option value="All">All Events</option>
                {eventOptions.filter(ev => ev !== 'All').map((ev, i) => (
                  <option key={i} value={ev}>{ev}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Ticket Tier Filter (as created by host) */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Tier:</span>
              <select 
                value={selectedTier}
                onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                <option value="All">All Tiers</option>
                {tierOptions.filter(t => t !== 'All').map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Gate Status Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Gate:</span>
              <select 
                value={selectedGateStatus}
                onChange={(e) => { setSelectedGateStatus(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                <option value="All">All Statuses</option>
                <option value="Done">Done (Checked In)</option>
                <option value="On Progress">On Progress (On Track)</option>
                <option value="Waiting for Review">Waiting for Review</option>
                <option value="Pending Gate">Pending Gate</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* City Location Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">City:</span>
              <select 
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                <option value="All">All Cities</option>
                {cityOptions.filter(c => c !== 'All').map((city, i) => (
                  <option key={i} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <button 
                className="ptable-reset-filters-btn"
                onClick={handleResetFilters}
                title="Reset all filters to default"
              >
                <RefreshCw size={13} />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="ptable-active-chips-bar">
            <span className="chips-title">Active Filters:</span>
            {searchQuery && (
              <span className="filter-chip">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={11} /></button>
              </span>
            )}
            {selectedEvent !== 'All' && (
              <span className="filter-chip">
                Event: {selectedEvent}
                <button onClick={() => setSelectedEvent('All')}><X size={11} /></button>
              </span>
            )}
            {selectedTier !== 'All' && (
              <span className="filter-chip">
                Tier: {selectedTier}
                <button onClick={() => setSelectedTier('All')}><X size={11} /></button>
              </span>
            )}
            {selectedGateStatus !== 'All' && (
              <span className="filter-chip">
                Status: {selectedGateStatus}
                <button onClick={() => setSelectedGateStatus('All')}><X size={11} /></button>
              </span>
            )}
            {selectedCity !== 'All' && (
              <span className="filter-chip">
                City: {selectedCity}
                <button onClick={() => setSelectedCity('All')}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Main Table Card (Batch section removed, Ticket & Tier enhanced) */}
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
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      title="Select all on this page"
                    />
                  </th>

                  {/* 1. Participant Name Column */}
                  <th 
                    className="ptable-th th-sortable th-name" 
                    onClick={() => handleSort('name')}
                    title="Sort by Participant Name"
                  >
                    <div className="th-content-flex">
                      <User size={13.5} className="th-header-icon" />
                      <span>Participant Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 2. Ticket & Tier Column (Tier as created by host) */}
                  <th 
                    className="ptable-th th-sortable th-ticket" 
                    onClick={() => handleSort('tierName')}
                    title="Sort by Ticket Tier"
                  >
                    <div className="th-content-flex">
                      <Ticket size={13.5} className="th-header-icon" />
                      <span>Ticket & Tier</span>
                      {sortField === 'tierName' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 3. Event Joined Column */}
                  <th 
                    className="ptable-th th-sortable th-event" 
                    onClick={() => handleSort('eventTitle')}
                    title="Sort by Event Title"
                  >
                    <div className="th-content-flex">
                      <CalendarDays size={13.5} className="th-header-icon" />
                      <span>Event Joined</span>
                      {sortField === 'eventTitle' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 4. Booking Date Column */}
                  <th 
                    className="ptable-th th-sortable th-date" 
                    onClick={() => handleSort('bookedMinutes')}
                    title="Sort by Booking Date"
                  >
                    <div className="th-content-flex">
                      <Clock size={13.5} className="th-header-icon" />
                      <span>Booking date</span>
                      {sortField === 'bookedMinutes' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 5. Ticket Price & Payment Column */}
                  <th 
                    className="ptable-th th-sortable th-price" 
                    onClick={() => handleSort('priceNumeric')}
                    title="Sort by Ticket Price"
                  >
                    <div className="th-content-flex">
                      <CreditCard size={13.5} className="th-header-icon" />
                      <span>Price & Status</span>
                      {sortField === 'priceNumeric' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 6. Gate Status Column */}
                  <th 
                    className="ptable-th th-sortable th-gate"
                    onClick={() => handleSort('gateStatus')}
                    title="Sort by Gate Status"
                  >
                    <div className="th-content-flex">
                      <CheckCircle2 size={13.5} className="th-header-icon" />
                      <span>Gate Status</span>
                      {sortField === 'gateStatus' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 7. Vehicle & City Column */}
                  <th 
                    className="ptable-th th-sortable th-vehicle"
                    onClick={() => handleSort('city')}
                    title="Sort by City"
                  >
                    <div className="th-content-flex">
                      <MapPin size={13.5} className="th-header-icon" />
                      <span>Vehicle & City</span>
                      {sortField === 'city' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="ptable-empty-cell">
                      <div className="empty-state-box">
                        <Users size={36} className="empty-state-icon" />
                        <h3>No event participants found</h3>
                        <p>No participant booking matches your current search or tier filter criteria.</p>
                        <button className="ptable-btn-secondary" onClick={handleResetFilters}>
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((item) => {
                    const isSelected = selectedRowIds.has(item.id);

                    return (
                      <tr 
                        key={item.id} 
                        className={`ptable-row ${isSelected ? 'row-selected' : ''}`}
                        onClick={() => setTicketModalParticipant(item)}
                      >
                        {/* Checkbox Column */}
                        <td className="ptable-td td-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="ptable-checkbox-input"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(item.id, e)}
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

                        {/* 2. Ticket & Tier (Tier Badge as used when host creates event + BIB & Ticket Number) */}
                        <td className="ptable-td td-ticket">
                          <div className="ticket-tier-cell-block">
                            <div className="tier-badge-row">
                              <span className={`event-tier-badge tier-${(item.tierName || 'standard').toLowerCase().replace(/\s+/g, '-')}`}>
                                {item.tierName || 'Standard'}
                              </span>
                              {item.ticketFor && (
                                <span className="ticket-for-subpill">{item.ticketFor}</span>
                              )}
                            </div>
                            <span 
                              className="domain-pill-badge" 
                              onClick={(e) => handleCopyCode(item.ticketNumber, e)}
                              title="Click to copy Ticket ID"
                            >
                              <span className="bib-accent-tag">{item.bibNumber}</span>
                              {item.ticketNumber}
                              {copiedCode === item.ticketNumber ? (
                                <Check size={11} className="pill-copy-icon success" />
                              ) : null}
                            </span>
                          </div>
                        </td>

                        {/* 3. Event Joined Column */}
                        <td className="ptable-td td-event">
                          <div className="avatar-name-cell">
                            <span className="monogram-avatar-circle event-circle">
                              {item.eventTitle ? item.eventTitle.charAt(0) : 'E'}
                            </span>
                            <span className="cell-person-name bold">{item.eventTitle}</span>
                          </div>
                        </td>

                        {/* 4. Booking Date Column */}
                        <td className="ptable-td td-date">
                          <span className="creation-date-text">{item.bookedDate}</span>
                        </td>

                        {/* 5. Ticket Price & Payment Column */}
                        <td className="ptable-td td-price">
                          <div className="price-cell-stack">
                            <span className="employee-count-num bold">{item.ticketPrice}</span>
                            <span className={`payment-pill-tag ${item.paymentStatus?.toLowerCase()}`}>
                              {item.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* 6. Gate Status Column */}
                        <td className="ptable-td td-gate" onClick={(e) => handleToggleCheckIn(item.id, e)} title="Click to toggle Check-In">
                          {renderGateBadge(item.gateStatus)}
                        </td>

                        {/* 7. Vehicle & City Column */}
                        <td className="ptable-td td-vehicle">
                          <span className="address-truncated-text" title={`${item.vehicle} (${item.vehiclePlate}) · ${item.city}`}>
                            <span className="city-accent">{item.city}</span> · {item.vehicle}
                          </span>
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
              Showing {filteredParticipants.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredParticipants.length)} of {filteredParticipants.length} participants
            </div>

            <div className="pagination-controls-center">
              {/* First Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Prev Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
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
                      className={`pagination-page-number ${currentPage === item ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  );
                })}

              {/* Next Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>

              {/* Last Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>

            {/* Rows Per Page Selector */}
            <div className="pagination-page-size-wrap">
              <span className="size-label">Rows per page:</span>
              <div className="size-select-box">
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="page-size-dropdown"
                >
                  <option value={8}>8 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={16}>16 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={50}>50 / page</option>
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
                setParticipants(prev => prev.map(p => selectedRowIds.has(p.id) ? { ...p, gateStatus: 'On Progress' } : p));
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
            <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="ticket-modal-header">
                <div className="ticket-modal-title-group">
                  <h2>Official Participant Boarding Pass</h2>
                  <p>Gate check-in pass styled with the event's selected ticket template and QR verification.</p>
                </div>
                <button
                  type="button"
                  className="ticket-modal-close-btn"
                  onClick={() => setTicketModalParticipant(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <TicketPassView
                designId={ticketModalParticipant.ticketDesign || 'design-1'}
                templateUrl={ticketModalParticipant.ticketTemplateUrl || ''}
                event={{
                  title: ticketModalParticipant.eventTitle || 'Motorsport Tour',
                  category: ticketModalParticipant.category || 'Motorsport',
                  startDate: ticketModalParticipant.date || 'Event Day',
                  venue: ticketModalParticipant.venue || 'Buddh International Circuit',
                  city: 'Greater Noida',
                  state: 'UP',
                  organizerName: 'Nitroxx HQ',
                }}
                participant={ticketModalParticipant}
                ticketNumber={ticketModalParticipant.ticketNumber || 'NX-DEMO-001'}
                tierName={ticketModalParticipant.tierName || 'Standard'}
                onPrint={() => window.print()}
              />

              <div className="ticket-modal-actions-row">
                <button
                  type="button"
                  className="ticket-modal-btn secondary"
                  onClick={() => {
                    const next = ticketModalParticipant.gateStatus === 'Done' ? 'On Progress' : 'Done';
                    setParticipants(prev => prev.map(p => p.id === ticketModalParticipant.id ? { ...p, gateStatus: next } : p));
                    setTicketModalParticipant(prev => ({ ...prev, gateStatus: next }));
                    showToast(next === 'Done' ? 'Gate Verified: Checked In!' : 'Gate Status Reset.');
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{ticketModalParticipant.gateStatus === 'Done' ? 'Reset Attendance' : 'Confirm Gate Check-In (Done)'}</span>
                </button>
                <button
                  type="button"
                  className="ticket-modal-btn primary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print Gate Pass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fast Gate QR & Bib Check-In Scanner Modal */}
        {isScannerModalOpen && (
          <div className="ptable-modal-backdrop" onClick={() => setIsScannerModalOpen(false)}>
            <div className="ptable-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-bar">
                <div className="modal-title-wrap">
                  <QrCode size={18} />
                  <h3>Fast Gate Check-In Scanner</h3>
                </div>
                <button className="modal-close-icon" onClick={() => setIsScannerModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="scanner-viewport">
                  <div className="scanner-laser" />
                  <div className="scanner-target-box">
                    <QrCode size={44} strokeWidth={1.5} color="rgba(255,255,255,0.75)" />
                  </div>
                  <span style={{ marginTop: '10px', fontSize: '11.5px', color: '#94a3b8' }}>
                    Scan QR Ticket Pass or Enter Bib Code below
                  </span>
                </div>

                {scanSuccess && (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>Gate Verified! Attendee Checked In (Done).</span>
                  </div>
                )}

                <form onSubmit={handleGateScanValidate} style={{ marginTop: '16px' }}>
                  <div className="form-field-group">
                    <label>Enter Bib Number or Ticket ID</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. BIB-101, BIB-104, NX-89214" 
                        value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <button type="submit" className="ptable-btn-primary">
                        Validate
                      </button>
                    </div>
                  </div>
                </form>

                <div style={{ marginTop: '14px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: '#64748b' }}>
                  💡 <strong>Gate Quick Test:</strong> Enter any Bib number (e.g. <code>BIB-101</code>, <code>BIB-102</code>, or <code>BIB-106</code>) to validate and check in immediately.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Participant Booking Modal (Matches host event creation packages & tiers) */}
        {isAddModalOpen && (
          <div className="ptable-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
            <div className="ptable-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-bar">
                <div className="modal-title-wrap">
                  <User size={18} />
                  <h3>New Participant Booking</h3>
                </div>
                <button 
                  className="modal-close-icon" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking}>
                <div className="modal-form-grid">
                  <div className="form-field-group">
                    <label>Participant Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Rohit Malhotra" 
                      value={newFormData.name}
                      onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. rohit@gmail.com" 
                      value={newFormData.email}
                      onChange={(e) => setNewFormData({ ...newFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98201 55667" 
                      value={newFormData.phone}
                      onChange={(e) => setNewFormData({ ...newFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>City of Origin</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai" 
                      value={newFormData.city}
                      onChange={(e) => setNewFormData({ ...newFormData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group full">
                    <label>Event Joined *</label>
                    <select 
                      value={newFormData.eventTitle}
                      onChange={(e) => setNewFormData({ ...newFormData, eventTitle: e.target.value })}
                    >
                      <option value="Manali–Leh–Manali Adventure Tour">Manali–Leh–Manali Adventure Tour</option>
                      <option value="Nitroxx MotoFest Pune 2025">Nitroxx MotoFest Pune 2025</option>
                      <option value="Monsoon Trail Expedition">Monsoon Trail Expedition</option>
                      <option value="Western Ghats Enduro Rally">Western Ghats Enduro Rally</option>
                      <option value="Sunset Gravel Sprint 2026">Sunset Gravel Sprint 2026</option>
                      <option value="Desert Sprint 200 Endurance">Desert Sprint 200 Endurance</option>
                    </select>
                  </div>

                  {/* Tier as created when host creates event */}
                  <div className="form-field-group">
                    <label>Package Tier Name *</label>
                    <select 
                      value={newFormData.tierName}
                      onChange={(e) => setNewFormData({ ...newFormData, tierName: e.target.value })}
                    >
                      <option value="Platinum">Platinum</option>
                      <option value="VIP">VIP</option>
                      <option value="Plus">Plus</option>
                      <option value="Standard">Standard</option>
                      <option value="Pro Rider">Pro Rider</option>
                      <option value="General Admission">General Admission</option>
                    </select>
                  </div>

                  {/* Ticket For as created when host creates event */}
                  <div className="form-field-group">
                    <label>Ticket For *</label>
                    <select 
                      value={newFormData.ticketFor}
                      onChange={(e) => setNewFormData({ ...newFormData, ticketFor: e.target.value })}
                    >
                      <option value="Rider">Rider</option>
                      <option value="Pillion">Pillion</option>
                      <option value="Participant">Participant</option>
                      <option value="VIP">VIP</option>
                      <option value="Driver">Driver</option>
                      <option value="Camping">Camping</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Price (₹)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ₹25,000"
                      value={newFormData.ticketPrice}
                      onChange={(e) => setNewFormData({ ...newFormData, ticketPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Initial Gate Status</label>
                    <select 
                      value={newFormData.gateStatus}
                      onChange={(e) => setNewFormData({ ...newFormData, gateStatus: e.target.value })}
                    >
                      <option value="Done">Done (Checked In)</option>
                      <option value="On Progress">On Progress (Active)</option>
                      <option value="Waiting for Review">Waiting for Review</option>
                      <option value="Pending Gate">Pending Gate</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Vehicle Model</label>
                    <input 
                      type="text" 
                      placeholder="e.g. KTM 390 Adventure" 
                      value={newFormData.vehicle}
                      onChange={(e) => setNewFormData({ ...newFormData, vehicle: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Vehicle Plate Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MH02-DX-1001" 
                      value={newFormData.vehiclePlate}
                      onChange={(e) => setNewFormData({ ...newFormData, vehiclePlate: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Blood Group</label>
                    <select 
                      value={newFormData.bloodGroup}
                      onChange={(e) => setNewFormData({ ...newFormData, bloodGroup: e.target.value })}
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions-bar">
                  <button 
                    type="button" 
                    className="ptable-btn-secondary" 
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ptable-btn-primary">
                    Create Booking Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Participants;
