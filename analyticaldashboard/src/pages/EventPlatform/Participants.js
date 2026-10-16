import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  Download, 
  QrCode, 
  MoreVertical, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  Trash2, 
  Check, 
  Mail, 
  Phone, 
  Eye, 
  Ticket,
  Printer, 
  ShieldCheck,
  CheckSquare,
  Compass,
  CreditCard,
  CalendarDays,
  Bike
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useRegistrations } from '../../hooks/useRegistrations';
import { useEvents } from '../../hooks/useEvents';
import { downloadCsv, formatDateTime } from '../../utils/formatters';
import './Participants.css';

// Pure event booking participant data (adventure tours, bike festivals, and enduro rallies)
const EVENT_BOOKING_PARTICIPANTS = [
  {
    id: 'bkg-101',
    name: 'Zoya Khan',
    email: 'zoya.khan@gmail.com',
    phone: '+91 98201 12345',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'All-Access Expedition Pass',
    ticketNumber: 'NX-89214',
    ticketPrice: '₹25,000',
    bookedDate: 'Booked Jan 14, 2026',
    eventTitle: 'Manali–Leh–Manali Adventure Tour',
    stageName: 'Batch 1 (Sep 1–6) · Rohtang Crossing',
    bibNumber: 'BIB-101',
    vehicle: 'KTM 390 Adventure',
    vehiclePlate: 'MH02-DX-4412',
    city: 'Mumbai',
    bloodGroup: 'O+',
    emergencyContact: 'Farhan Khan (+91 98201 54321)',
    status: 'On Progress', // On Track / Racing
    paymentStatus: 'Paid',
    wave: 'Wave 1 (07:30 AM)'
  },
  {
    id: 'bkg-102',
    name: 'Kael Smith',
    email: 'kael.smith@outlook.com',
    phone: '+91 97112 34567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'VIP Paddock & Race Pass',
    ticketNumber: 'NX-90412',
    ticketPrice: '₹2,999',
    bookedDate: 'Booked Jan 22, 2026',
    eventTitle: 'Nitroxx MotoFest Pune 2025',
    stageName: 'Time Trial Track B · Open 400cc',
    bibNumber: 'BIB-102',
    vehicle: 'BMW R1250 GS',
    vehiclePlate: 'MH12-EF-9080',
    city: 'Pune',
    bloodGroup: 'A+',
    emergencyContact: 'Sarah Smith (+91 97112 87654)',
    status: 'Waiting for Review',
    paymentStatus: 'Paid',
    wave: 'Paddock Wave (10:00 AM)'
  },
  {
    id: 'bkg-103',
    name: 'Anya Petrova',
    email: 'anya.petrova@gmail.com',
    phone: '+91 98980 11223',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Solo Trail Rider Pass',
    ticketNumber: 'NX-77312',
    ticketPrice: '₹12,500',
    bookedDate: 'Booked Feb 03, 2026',
    eventTitle: 'Monsoon Trail Expedition',
    stageName: '45km Western Ghats Mud Track',
    bibNumber: 'BIB-103',
    vehicle: 'RE Himalayan 450',
    vehiclePlate: 'KA04-MJ-8812',
    city: 'Bengaluru',
    bloodGroup: 'B+',
    emergencyContact: 'Dmitri Petrov (+91 98980 44556)',
    status: 'Pending',
    paymentStatus: 'Payment Pending',
    wave: 'Wave 2 (08:30 AM)'
  },
  {
    id: 'bkg-104',
    name: 'Nuraj Rajan',
    email: 'nuraj.rajan@gmail.com',
    phone: '+91 99001 22334',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Official Safety Marshal Pass',
    ticketNumber: 'NX-MARSHAL-04',
    ticketPrice: 'Complimentary',
    bookedDate: 'Booked Feb 10, 2026',
    eventTitle: 'Western Ghats Enduro Rally',
    stageName: 'Technical Inspection & Clearance',
    bibNumber: 'BIB-104',
    vehicle: 'Triumph Tiger 900 Rally Pro',
    vehiclePlate: 'GA01-R-3321',
    city: 'Goa',
    bloodGroup: 'AB+',
    emergencyContact: 'Kavita Raj (+91 99001 55667)',
    status: 'Done', // Checked In
    paymentStatus: 'Approved',
    wave: 'Marshal Gate (06:00 AM)'
  },
  {
    id: 'bkg-105',
    name: 'Ingrid Schmidt',
    email: 'ingrid.schmidt@gmail.com',
    phone: '+91 98223 33445',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Pro Racer Entry Tier',
    ticketNumber: 'NX-66512',
    ticketPrice: '₹4,500',
    bookedDate: 'Booked Feb 15, 2026',
    eventTitle: 'Nitroxx MotoFest Pune 2025',
    stageName: 'Open 400cc Category Qualifier',
    bibNumber: 'BIB-105',
    vehicle: 'Yamaha Tenere 700',
    vehiclePlate: 'TS09-FA-7701',
    city: 'Hyderabad',
    bloodGroup: 'O-',
    emergencyContact: 'Lars Schmidt (+91 98223 77889)',
    status: 'Pending',
    paymentStatus: 'Payment Pending',
    wave: 'Wave 3 (11:00 AM)'
  },
  {
    id: 'bkg-106',
    name: 'Omar Hassan',
    email: 'omar.hassan@yahoo.com',
    phone: '+91 97665 44332',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Expedition Convoy Lead Pass',
    ticketNumber: 'NX-55109',
    ticketPrice: '₹25,000',
    bookedDate: 'Booked Feb 20, 2026',
    eventTitle: 'Manali–Leh–Manali Adventure Tour',
    stageName: 'Convoy Alpha Route · Pass Crossing',
    bibNumber: 'BIB-106',
    vehicle: 'Ducati DesertX',
    vehiclePlate: 'DL01-AX-9900',
    city: 'Delhi',
    bloodGroup: 'A-',
    emergencyContact: 'Zainab Hassan (+91 97665 88990)',
    status: 'On Progress',
    paymentStatus: 'Paid',
    wave: 'Wave 1 (07:30 AM)'
  },
  {
    id: 'bkg-107',
    name: 'Arthur Fernandes',
    email: 'arthur.fernandes@live.com',
    phone: '+91 98112 55443',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Enduro Downhill Competitor',
    ticketNumber: 'NX-44321',
    ticketPrice: '₹3,800',
    bookedDate: 'Booked Feb 28, 2026',
    eventTitle: 'Western Ghats Enduro Rally',
    stageName: 'Stage 3 Rocky Downhill Qualifier',
    bibNumber: 'BIB-107',
    vehicle: 'Husqvarna Norden 901',
    vehiclePlate: 'TN07-BY-1212',
    city: 'Chennai',
    bloodGroup: 'B-',
    emergencyContact: 'Claire Dupont (+91 98112 88776)',
    status: 'On Progress',
    paymentStatus: 'Paid',
    wave: 'Wave 2 (08:30 AM)'
  },
  {
    id: 'bkg-108',
    name: 'Briana D\'Souza',
    email: 'briana.dsouza@gmail.com',
    phone: '+91 98451 99887',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'VIP Lounge & Paddock Pass',
    ticketNumber: 'NX-33100',
    ticketPrice: '₹1,999',
    bookedDate: 'Booked Mar 02, 2026',
    eventTitle: 'Sunset Gravel Sprint 2026',
    stageName: 'Paddock Hospitality & Track Viewing',
    bibNumber: 'BIB-108',
    vehicle: 'Kawasaki Versys 650',
    vehiclePlate: 'KA01-GH-5544',
    city: 'Bengaluru',
    bloodGroup: 'AB-',
    emergencyContact: 'Maya Scott (+91 98451 22331)',
    status: 'Done',
    paymentStatus: 'Paid',
    wave: 'VIP Lounge Entry'
  },
  {
    id: 'bkg-109',
    name: 'Carlos Alvares',
    email: 'carlos.alvares@gmail.com',
    phone: '+91 97234 55667',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Desert 200 Standard Entry',
    ticketNumber: 'NX-22019',
    ticketPrice: '₹7,500',
    bookedDate: 'Booked Mar 08, 2026',
    eventTitle: 'Desert Sprint 200 Endurance',
    stageName: 'Dune Section Prologue · Wave 3',
    bibNumber: 'BIB-109',
    vehicle: 'Honda Africa Twin',
    vehiclePlate: 'GJ01-MN-3456',
    city: 'Ahmedabad',
    bloodGroup: 'O+',
    emergencyContact: 'Maria Gomez (+91 97234 88990)',
    status: 'Inactive',
    paymentStatus: 'Refunded',
    wave: 'Cancelled'
  },
  {
    id: 'bkg-110',
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    phone: '+91 98334 11223',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Pro Motocross Women\'s Cup',
    ticketNumber: 'NX-11984',
    ticketPrice: '₹5,000',
    bookedDate: 'Booked Mar 12, 2026',
    eventTitle: 'Desert Sprint 200 Endurance',
    stageName: 'Dune Section Alpha · Speed Stage',
    bibNumber: 'BIB-110',
    vehicle: 'KTM 450 Rally Replica',
    vehiclePlate: 'MH01-KL-9009',
    city: 'Mumbai',
    bloodGroup: 'A+',
    emergencyContact: 'Ivan Rostov (+91 98334 55667)',
    status: 'Done',
    paymentStatus: 'Paid',
    wave: 'Pro Wave (07:00 AM)'
  },
  {
    id: 'bkg-111',
    name: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    phone: '+91 99123 44556',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Amateur Sprint Rider',
    ticketNumber: 'NX-99812',
    ticketPrice: '₹2,500',
    bookedDate: 'Booked Mar 18, 2026',
    eventTitle: 'Sunset Gravel Sprint 2026',
    stageName: 'Sprint Stage 1 · Novice Class',
    bibNumber: 'BIB-111',
    vehicle: 'Suzuki V-Strom 650',
    vehiclePlate: 'KL07-PQ-6655',
    city: 'Kochi',
    bloodGroup: 'B+',
    emergencyContact: 'Linda Vance (+91 99123 88990)',
    status: 'Waiting for Review',
    paymentStatus: 'Paid',
    wave: 'Wave 2 (08:30 AM)'
  },
  {
    id: 'bkg-112',
    name: 'Priya Sharma',
    email: 'priya.sharma@yahoo.com',
    phone: '+91 98765 12340',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'VIP Gold Pass & Camp Stay',
    ticketNumber: 'NX-88712',
    ticketPrice: '₹15,000',
    bookedDate: 'Booked Mar 24, 2026',
    eventTitle: 'Monsoon Trail Expedition',
    stageName: 'Adventure Trail Wave 2 · Riverside Camp',
    bibNumber: 'BIB-112',
    vehicle: 'Triumph Scrambler 1200',
    vehiclePlate: 'RJ14-ST-2233',
    city: 'Jaipur',
    bloodGroup: 'O+',
    emergencyContact: 'Rohit Sharma (+91 98765 43210)',
    status: 'Done',
    paymentStatus: 'Paid',
    wave: 'Camp Wave (09:00 AM)'
  },
  {
    id: 'bkg-113',
    name: 'David Kim',
    email: 'david.kim@gmail.com',
    phone: '+91 98440 66778',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Solo High Altitude Explorer',
    ticketNumber: 'NX-77443',
    ticketPrice: '₹25,000',
    bookedDate: 'Booked Apr 01, 2026',
    eventTitle: 'Manali–Leh–Manali Adventure Tour',
    stageName: 'Rohtang Checkpoint Group · Batch 2',
    bibNumber: 'BIB-113',
    vehicle: 'Royal Enfield Himalayan',
    vehiclePlate: 'HP01-CD-8877',
    city: 'Shimla',
    bloodGroup: 'A+',
    emergencyContact: 'Min-Ji Kim (+91 98440 99001)',
    status: 'On Progress',
    paymentStatus: 'Paid',
    wave: 'Wave 2 (08:30 AM)'
  },
  {
    id: 'bkg-114',
    name: 'Fatima Al-Mansoor',
    email: 'fatima.almansoor@gmail.com',
    phone: '+91 97123 77889',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=150&q=80',
    ticketTier: 'Night Rally Prologue Entry',
    ticketNumber: 'NX-66231',
    ticketPrice: '₹8,500',
    bookedDate: 'Booked Apr 05, 2026',
    eventTitle: 'Desert Sprint 200 Endurance',
    stageName: 'Night Rally Prologue · Navigation Special',
    bibNumber: 'BIB-114',
    vehicle: 'KTM 790 Adventure R',
    vehiclePlate: 'RJ15-UV-4433',
    city: 'Jaisalmer',
    bloodGroup: 'B+',
    emergencyContact: 'Tariq Al-Mansoor (+91 97123 11223)',
    status: 'Pending',
    paymentStatus: 'Payment Pending',
    wave: 'Night Prologue (19:00 PM)'
  }
];

const Participants = () => {
  const { user } = useAuth();
  const { registrations } = useRegistrations({ hostId: user?.uid });
  const { events } = useEvents({ hostId: user?.uid });

  const [participantsList, setParticipantsList] = useState(EVENT_BOOKING_PARTICIPANTS);

  // Filter States
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Selection State
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  // Row Action Dropdown
  const [openActionId, setOpenActionId] = useState(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [ticketModalParticipant, setTicketModalParticipant] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  // Add Participant Form State
  const [newFormData, setNewFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ticketTier: 'All-Access Expedition Pass',
    ticketPrice: '₹25,000',
    eventTitle: 'Manali–Leh–Manali Adventure Tour',
    stageName: 'Batch 1 (Sep 1–6) · Rohtang Crossing',
    status: 'Waiting for Review',
    city: 'Mumbai',
    vehicle: 'KTM 390 Adventure',
    vehiclePlate: 'MH02-DX-1001',
    emergencyContact: '',
    bloodGroup: 'O+',
  });

  const searchInputRef = useRef(null);

  // Merge any live Firebase registrations into the list
  useEffect(() => {
    if (registrations && registrations.length > 0) {
      const liveItems = registrations.map((r, i) => ({
        id: r.id || `live-${i}`,
        name: r.participantName || 'Guest Participant',
        email: r.participantEmail || 'guest@nitroxx.com',
        phone: r.participantPhone || '+91 98000 00000',
        avatar: r.participantPhoto || `https://i.pravatar.cc/150?u=${r.id || i}`,
        ticketTier: r.ticketType || 'Standard Rider Pass',
        ticketNumber: r.ticketNumber || `NX-${Date.now().toString(36).toUpperCase()}`,
        ticketPrice: r.ticketPrice ? `₹${r.ticketPrice}` : '₹4,999',
        bookedDate: `Booked ${r.registrationDate ? formatDateTime(r.registrationDate).split(',')[0] : 'Today'}`,
        eventTitle: r.eventTitle || 'Nitroxx MotoFest Pune 2025',
        stageName: 'Open Class · Track Entry',
        bibNumber: r.ticketNumber ? `BIB-${r.ticketNumber.slice(-3)}` : `BIB-${300 + i}`,
        vehicle: r.participant?.vehicleNumber || 'Motorcycle',
        vehiclePlate: r.participant?.vehicleNumber || 'MH12-LIVE',
        city: r.participant?.city || 'India',
        bloodGroup: r.participant?.bloodGroup || 'O+',
        emergencyContact: r.participant?.emergencyContact || 'Not Specified',
        status: r.attendanceStatus === 'Checked In' ? 'Done' : r.status === 'Confirmed' ? 'On Progress' : 'Pending',
        paymentStatus: 'Paid',
        wave: 'Standard Wave'
      }));

      setParticipantsList(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newUniques = liveItems.filter(item => !existingIds.has(item.id));
        return [...newUniques, ...prev];
      });
    }
  }, [registrations]);

  // CMD+K / CTRL+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === '1')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleDocClick = () => setOpenActionId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Event dropdown options
  const eventOptions = useMemo(() => {
    const set = new Set(participantsList.map(p => p.eventTitle));
    return ['All', ...Array.from(set)];
  }, [participantsList]);

  // Ticket Tier options
  const tierOptions = useMemo(() => {
    const set = new Set(participantsList.map(p => p.ticketTier));
    return ['All', ...Array.from(set)];
  }, [participantsList]);

  // Filtered and Sorted Rows
  const filteredRows = useMemo(() => {
    let result = [...participantsList];

    if (selectedEvent !== 'All') {
      result = result.filter(p => p.eventTitle === selectedEvent);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(p => p.status === selectedStatus);
    }

    if (selectedTier !== 'All') {
      result = result.filter(p => p.ticketTier === selectedTier);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.ticketNumber.toLowerCase().includes(q) ||
        p.bibNumber.toLowerCase().includes(q) ||
        p.ticketTier.toLowerCase().includes(q) ||
        p.eventTitle.toLowerCase().includes(q) ||
        p.vehicle.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [participantsList, selectedEvent, selectedStatus, selectedTier, searchQuery, sortField, sortDirection]);

  // Paginated Rows
  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Row Selection Handlers
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
    setParticipantsList(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Done' ? 'On Progress' : 'Done';
        showToast(nextStatus === 'Done' ? `Checked In: ${p.name}` : `Reset Status for: ${p.name}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    setOpenActionId(null);
  };

  const handleDeleteRow = (id, e) => {
    e?.stopPropagation();
    setParticipantsList(prev => prev.filter(p => p.id !== id));
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setOpenActionId(null);
    showToast('Participant booking removed.');
  };

  // Bulk operations
  const handleBulkCheckIn = () => {
    setParticipantsList(prev => prev.map(p => selectedRowIds.has(p.id) ? { ...p, status: 'Done' } : p));
    showToast(`Checked in ${selectedRowIds.size} participants.`);
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    setParticipantsList(prev => prev.filter(p => !selectedRowIds.has(p.id)));
    showToast(`Removed ${selectedRowIds.size} bookings.`);
    setSelectedRowIds(new Set());
  };

  // Export CSV
  const handleExportCSV = () => {
    const listToExport = selectedRowIds.size > 0 
      ? participantsList.filter(p => selectedRowIds.has(p.id))
      : filteredRows;

    downloadCsv('nitroxx_booking_participants.csv', listToExport.map(p => ({
      TicketNumber: p.ticketNumber,
      BibNumber: p.bibNumber,
      Name: p.name,
      Email: p.email,
      Phone: p.phone,
      Event: p.eventTitle,
      Stage: p.stageName,
      TicketTier: p.ticketTier,
      TicketPrice: p.ticketPrice,
      PaymentStatus: p.paymentStatus,
      GateStatus: p.status,
      Vehicle: p.vehicle,
      VehiclePlate: p.vehiclePlate,
      City: p.city,
      BloodGroup: p.bloodGroup,
      EmergencyContact: p.emergencyContact,
    })));

    showToast(`Exported ${listToExport.length} booking records.`);
  };

  // Fast Gate Check-In (Scanner simulation)
  const handleGateScanValidate = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const term = scanInput.toLowerCase().trim();
    const found = participantsList.find(p => 
      p.bibNumber.toLowerCase().includes(term) ||
      p.ticketNumber.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term)
    );

    if (found) {
      setParticipantsList(prev => prev.map(p => p.id === found.id ? { ...p, status: 'Done' } : p));
      setScanSuccess(true);
      showToast(`Gate Approved: ${found.name} (${found.bibNumber})`);
      setTimeout(() => {
        setScanSuccess(false);
        setScanInput('');
      }, 1600);
    } else {
      alert(`No active booking found for "${scanInput}". Try entering BIB-101 or NX-89214.`);
    }
  };

  // Submit New Booking
  const handleCreateNewBooking = (e) => {
    e.preventDefault();
    if (!newFormData.name || !newFormData.email) return;

    const newId = `bkg-${Date.now()}`;
    const newBib = `BIB-${Math.floor(115 + Math.random() * 880)}`;
    const newTicket = `NX-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking = {
      id: newId,
      name: newFormData.name,
      email: newFormData.email,
      phone: newFormData.phone || '+91 98000 12345',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ticketTier: newFormData.ticketTier,
      ticketNumber: newTicket,
      ticketPrice: newFormData.ticketPrice || '₹4,999',
      bookedDate: `Booked ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      eventTitle: newFormData.eventTitle,
      stageName: newFormData.stageName,
      bibNumber: newBib,
      vehicle: newFormData.vehicle || 'KTM 390 Adventure',
      vehiclePlate: newFormData.vehiclePlate || 'MH12-NEW',
      city: newFormData.city || 'Mumbai',
      bloodGroup: newFormData.bloodGroup || 'O+',
      emergencyContact: newFormData.emergencyContact || 'Listed with Team',
      status: newFormData.status,
      paymentStatus: 'Paid',
      wave: 'General Wave (08:00 AM)'
    };

    setParticipantsList(prev => [newBooking, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Registered booking for ${newBooking.name} (${newBib})`);
  };

  // Quick stats
  const totalCheckedIn = participantsList.filter(p => p.status === 'Done').length;
  const totalPending = participantsList.filter(p => p.status === 'Pending' || p.status === 'Waiting for Review').length;
  const totalOnTrack = participantsList.filter(p => p.status === 'On Progress').length;

  // Status Badge Pill
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'On Progress':
        return (
          <span className="status-badge-pill status-on-progress" title="Participant is on track / racing">
            <Info size={13} strokeWidth={2.2} />
            On Progress
          </span>
        );
      case 'Waiting for Review':
        return (
          <span className="status-badge-pill status-waiting" title="Scrutineering review pending">
            <Info size={13} strokeWidth={2.2} />
            Waiting for Review
          </span>
        );
      case 'Pending':
        return (
          <span className="status-badge-pill status-pending" title="Payment or gate check pending">
            <AlertTriangle size={13} strokeWidth={2.2} />
            Pending
          </span>
        );
      case 'Done':
        return (
          <span className="status-badge-pill status-done" title="Checked in and approved at gate">
            <CheckCircle2 size={13} strokeWidth={2.2} />
            Done
          </span>
        );
      case 'Inactive':
        return (
          <span className="status-badge-pill status-inactive" title="Booking cancelled or refunded">
            <AlertCircle size={13} strokeWidth={2.2} />
            Inactive
          </span>
        );
      default:
        return (
          <span className="status-badge-pill status-waiting">
            <Info size={13} strokeWidth={2.2} />
            {status}
          </span>
        );
    }
  };

  return (
    <AppLayout searchPlaceholder="Search bookings, bib numbers, tickets, events...">
      <div className="participants-page-shell">

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="floating-bulk-bar" style={{ bottom: '80px', background: '#10b981' }}>
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header Row */}
        <div className="participants-header-row">
          <div className="participants-title-wrap">
            <div className="participants-icon-badge">
              <Users size={22} strokeWidth={1.8} />
            </div>
            <div className="participants-heading-text">
              <h1>Booking Participants</h1>
              <p>Real-time directory of attendee bookings, ticket passes, check-ins, and race gate operations.</p>
            </div>
          </div>

          <div className="header-right-tools">
            <button className="header-action-bell" title="Live Event Activity" onClick={() => showToast('All gate check-in scanners active.')}>
              <Bell size={18} />
              <span className="bell-unread-dot" />
            </button>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="booking-stats-strip">
          <div className="stat-strip-card">
            <div className="stat-icon-wrap blue">
              <Ticket size={18} />
            </div>
            <div className="stat-meta-block">
              <span className="stat-meta-label">Total Bookings</span>
              <strong className="stat-meta-val">{participantsList.length} Registered</strong>
            </div>
          </div>

          <div className="stat-strip-card">
            <div className="stat-icon-wrap green">
              <CheckCircle2 size={18} />
            </div>
            <div className="stat-meta-block">
              <span className="stat-meta-label">Checked In</span>
              <strong className="stat-meta-val">{totalCheckedIn} Attendees ({Math.round((totalCheckedIn / participantsList.length) * 100)}%)</strong>
            </div>
          </div>

          <div className="stat-strip-card">
            <div className="stat-icon-wrap amber">
              <AlertTriangle size={18} />
            </div>
            <div className="stat-meta-block">
              <span className="stat-meta-label">Pending Gate</span>
              <strong className="stat-meta-val">{totalPending} Pending</strong>
            </div>
          </div>

          <div className="stat-strip-card">
            <div className="stat-icon-wrap purple">
              <Compass size={18} />
            </div>
            <div className="stat-meta-block">
              <span className="stat-meta-label">On Track / Racing</span>
              <strong className="stat-meta-val">{totalOnTrack} Active</strong>
            </div>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="participants-toolbar">
          {/* Left: Dropdown Filters */}
          <div className="toolbar-filters-left">
            {/* Event Filter */}
            <div className="filter-select-wrapper">
              <select 
                className="filter-select-input"
                value={selectedEvent}
                onChange={(e) => { setSelectedEvent(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Events</option>
                {eventOptions.filter(e => e !== 'All').map((ev, i) => (
                  <option key={i} value={ev}>{ev}</option>
                ))}
              </select>
              <ChevronDown size={14} className="filter-select-chevron" />
            </div>

            {/* Gate Status Filter */}
            <div className="filter-select-wrapper">
              <select 
                className="filter-select-input"
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Gate Status</option>
                <option value="On Progress">On Progress (Active)</option>
                <option value="Waiting for Review">Waiting for Review</option>
                <option value="Pending">Pending Gate</option>
                <option value="Done">Done (Checked In)</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={14} className="filter-select-chevron" />
            </div>

            {/* Ticket Tier Filter */}
            <div className="filter-select-wrapper">
              <select 
                className="filter-select-input"
                value={selectedTier}
                onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Ticket Passes</option>
                {tierOptions.filter(t => t !== 'All').map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="filter-select-chevron" />
            </div>
          </div>

          {/* Right: Search, Settings, and Action Buttons */}
          <div className="toolbar-actions-right">
            <div className="table-search-box">
              <Search size={15} className="search-leading-icon" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="table-search-input"
              />
              <span className="search-shortcut-badge">⌘1</span>
            </div>

            <button 
              className="btn-icon-setting" 
              title="Table Column View"
              onClick={() => showToast('Column layout set to Event Participant standard.')}
            >
              <Settings size={17} />
            </button>

            {/* Action Buttons */}
            <button 
              className="btn-action-outline" 
              onClick={() => setIsScannerModalOpen(true)}
              title="Fast Gate Check-In & Scanner"
            >
              <QrCode size={15} />
              <span>Fast Check-In</span>
            </button>

            <button 
              className="btn-action-outline" 
              onClick={handleExportCSV}
              title="Export visible or selected records to CSV"
            >
              <Download size={15} />
              <span>Export</span>
            </button>

            <button 
              className="btn-action-primary" 
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.2} />
              <span>Add Participant</span>
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="participants-table-card">
          <div className="table-responsive-container">
            <table className="participants-modern-table">
              <thead>
                <tr>
                  <th className="th-checkbox-col">
                    <input 
                      type="checkbox" 
                      className="table-checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th className="th-sortable" onClick={() => handleSort('name')}>
                    <div className="th-content">
                      <span>Participant Name</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </div>
                  </th>

                  <th className="th-sortable" onClick={() => handleSort('ticketTier')}>
                    <div className="th-content">
                      <span>Ticket & Pass</span>
                      {sortField === 'ticketTier' ? (
                        sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </div>
                  </th>

                  <th className="th-sortable" onClick={() => handleSort('eventTitle')}>
                    <div className="th-content">
                      <span>Event & Batch</span>
                      {sortField === 'eventTitle' ? (
                        sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </div>
                  </th>

                  <th className="th-sortable" onClick={() => handleSort('status')}>
                    <div className="th-content">
                      <span>Gate Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </div>
                  </th>

                  <th className="th-action-col"></th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px 20px', color: '#6b7280' }}>
                      <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                      <p style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>No booking participants found</p>
                      <p style={{ fontSize: '13px' }}>Try resetting filters or clear your search term.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((entry) => {
                    const isSelected = selectedRowIds.has(entry.id);
                    const isMenuOpen = openActionId === entry.id;

                    return (
                      <tr 
                        key={entry.id} 
                        className={isSelected ? 'row-selected' : ''}
                        onClick={() => setTicketModalParticipant(entry)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Checkbox column */}
                        <td className="td-checkbox-col" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="table-checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(entry.id, e)}
                          />
                        </td>

                        {/* Column 1: Participant Name & Email/Phone */}
                        <td>
                          <div className="member-cell-flex">
                            {entry.avatar ? (
                              <img 
                                src={entry.avatar} 
                                alt={entry.name} 
                                className="member-avatar-img"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="member-avatar-fallback">
                                {entry.name.slice(0, 1)}
                              </div>
                            )}
                            <div className="member-text-wrap">
                              <span className="member-name-text">{entry.name}</span>
                              <span className="member-email-text">{entry.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Ticket Pass & Booking details */}
                        <td>
                          <div className="cell-stacked-text">
                            <span className="cell-primary-text">{entry.ticketTier}</span>
                            <span className="cell-secondary-text">
                              <span className="bib-pill-tag" style={{ marginRight: '6px' }}>{entry.bibNumber}</span>
                              {entry.bookedDate} · {entry.ticketPrice}
                            </span>
                          </div>
                        </td>

                        {/* Column 3: Event & Stage/Batch */}
                        <td>
                          <div className="cell-stacked-text">
                            <span className="cell-primary-text">{entry.eventTitle}</span>
                            <span className="cell-secondary-text">{entry.stageName}</span>
                          </div>
                        </td>

                        {/* Column 4: Gate & Attendance Status Badge */}
                        <td>
                          {renderStatusBadge(entry.status)}
                        </td>

                        {/* Column 5: Action Menu */}
                        <td className="th-action-col" onClick={(e) => e.stopPropagation()}>
                          <div className="row-action-wrap">
                            <button 
                              className={`row-action-dots-btn ${isMenuOpen ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(isMenuOpen ? null : entry.id);
                              }}
                              title="More Options"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div className="row-action-dropdown">
                                <button 
                                  className="dropdown-action-btn"
                                  onClick={() => setTicketModalParticipant(entry)}
                                >
                                  <Ticket size={14} />
                                  <span>View Digital Pass</span>
                                </button>

                                <button 
                                  className="dropdown-action-btn"
                                  onClick={(e) => handleToggleCheckIn(entry.id, e)}
                                >
                                  <CheckSquare size={14} />
                                  <span>{entry.status === 'Done' ? 'Reset Attendance' : 'Gate Check-In (Done)'}</span>
                                </button>

                                <button 
                                  className="dropdown-action-btn"
                                  onClick={() => {
                                    showToast(`Ticket pass resent to ${entry.email}`);
                                    setOpenActionId(null);
                                  }}
                                >
                                  <Mail size={14} />
                                  <span>Send Pass via Email</span>
                                </button>

                                <div className="dropdown-divider" />

                                <button 
                                  className="dropdown-action-btn danger"
                                  onClick={(e) => handleDeleteRow(entry.id, e)}
                                >
                                  <Trash2 size={14} />
                                  <span>Cancel Booking</span>
                                </button>
                              </div>
                            )}
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
          <div className="table-pagination-footer">
            <div className="pagination-left-info">
              Page {currentPage} of {totalPages}
            </div>

            <div className="pagination-nav-center">
              <button 
                className="page-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>

              <button 
                className="page-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push('ellipsis-' + page);
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) => {
                  if (typeof item === 'string') {
                    return <span key={idx} className="page-nav-ellipsis">...</span>;
                  }
                  return (
                    <button 
                      key={item} 
                      className={`page-nav-btn ${currentPage === item ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  );
                })}

              <button 
                className="page-nav-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>

              <button 
                className="page-nav-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>

            <div className="page-size-selector-wrap">
              <div className="filter-select-wrapper">
                <select 
                  className="page-size-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={7}>7 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown size={12} className="filter-select-chevron" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedRowIds.size > 0 && (
          <div className="floating-bulk-bar">
            <span className="bulk-count-tag">{selectedRowIds.size} selected</span>

            <button className="bulk-action-btn" onClick={handleBulkCheckIn}>
              <CheckCircle2 size={14} />
              <span>Check In All (Done)</span>
            </button>

            <button className="bulk-action-btn" onClick={() => {
              setParticipantsList(prev => prev.map(p => selectedRowIds.has(p.id) ? { ...p, status: 'On Progress' } : p));
              showToast(`Marked ${selectedRowIds.size} participants On Track.`);
              setSelectedRowIds(new Set());
            }}>
              <Info size={14} />
              <span>Mark On Track</span>
            </button>

            <button className="bulk-action-btn" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export</span>
            </button>

            <button className="bulk-action-btn danger-action" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              <span>Cancel Bookings</span>
            </button>

            <button className="bulk-close-btn" onClick={() => setSelectedRowIds(new Set())} title="Deselect All">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Digital Ticket Boarding Pass Modal */}
        {ticketModalParticipant && (
          <div className="participant-modal-backdrop" onClick={() => setTicketModalParticipant(null)}>
            <div className="digital-ticket-card" onClick={e => e.stopPropagation()}>
              <div className="ticket-hero-banner">
                <div className="ticket-header-top">
                  <span className="ticket-brand-badge">⚡ Nitroxx Verified Pass</span>
                  <button className="modal-close-icon-btn" style={{ color: '#fff' }} onClick={() => setTicketModalParticipant(null)}>
                    <X size={18} />
                  </button>
                </div>
                <h2 className="ticket-event-name">{ticketModalParticipant.eventTitle}</h2>
                <p className="ticket-stage-sub">{ticketModalParticipant.stageName}</p>
              </div>

              {/* Perforation line with round notches */}
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
                      {renderStatusBadge(ticketModalParticipant.status)}
                    </div>
                  </div>
                </div>

                <div className="ticket-grid-details">
                  <div className="ticket-info-item">
                    <span>Bib Number</span>
                    <strong>{ticketModalParticipant.bibNumber}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span>Ticket Pass</span>
                    <strong>{ticketModalParticipant.ticketTier}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span>Vehicle & Plate</span>
                    <strong>{ticketModalParticipant.vehicle} ({ticketModalParticipant.vehiclePlate})</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span>Gate Wave / Time</span>
                    <strong>{ticketModalParticipant.wave}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span>Blood Group</span>
                    <strong>{ticketModalParticipant.bloodGroup}</strong>
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
                    className="btn-action-primary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      const next = ticketModalParticipant.status === 'Done' ? 'On Progress' : 'Done';
                      setParticipantsList(prev => prev.map(p => p.id === ticketModalParticipant.id ? { ...p, status: next } : p));
                      setTicketModalParticipant(prev => ({ ...prev, status: next }));
                      showToast(next === 'Done' ? 'Approved & Marked Done!' : 'Status reset.');
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{ticketModalParticipant.status === 'Done' ? 'Reset Attendance' : 'Confirm Check-In'}</span>
                  </button>

                  <button 
                    className="btn-action-outline"
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

        {/* Fast Gate Check-In & QR Scanner Modal */}
        {isScannerModalOpen && (
          <div className="participant-modal-backdrop" onClick={() => setIsScannerModalOpen(false)}>
            <div className="participant-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-bar">
                <h2>Fast Gate Check-In Scanner</h2>
                <button className="modal-close-icon-btn" onClick={() => setIsScannerModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="scanner-viewport">
                  <div className="scanner-laser" />
                  <div className="scanner-target-box">
                    <QrCode size={48} strokeWidth={1.5} color="rgba(255,255,255,0.7)" />
                  </div>
                  <span style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
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
                  <div className="form-group-item">
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
                      <button type="submit" className="btn-action-primary">
                        Validate
                      </button>
                    </div>
                  </div>
                </form>

                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '11.5px', color: '#64748b' }}>
                  💡 <strong>Marshal Quick Check:</strong> Enter any Bib number (e.g. <code>BIB-101</code> to <code>BIB-114</code>) to approve and mark attendance immediately.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Participant Booking Modal */}
        {isAddModalOpen && (
          <div className="participant-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
            <div className="participant-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header-bar">
                <h2>New Participant Booking</h2>
                <button className="modal-close-icon-btn" onClick={() => setIsAddModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewBooking}>
                <div className="modal-form-content">
                  <div className="form-group-item">
                    <label>Participant Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Arjun Rathore"
                      value={newFormData.name}
                      onChange={e => setNewFormData({ ...newFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. arjun@gmail.com"
                      value={newFormData.email}
                      onChange={e => setNewFormData({ ...newFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Contact Phone *</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98201 99887"
                      value={newFormData.phone}
                      onChange={e => setNewFormData({ ...newFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>City of Origin</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai"
                      value={newFormData.city}
                      onChange={e => setNewFormData({ ...newFormData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Event *</label>
                    <select 
                      value={newFormData.eventTitle}
                      onChange={e => setNewFormData({ ...newFormData, eventTitle: e.target.value })}
                    >
                      <option value="Manali–Leh–Manali Adventure Tour">Manali–Leh–Manali Adventure Tour</option>
                      <option value="Nitroxx MotoFest Pune 2025">Nitroxx MotoFest Pune 2025</option>
                      <option value="Monsoon Trail Expedition">Monsoon Trail Expedition</option>
                      <option value="Western Ghats Enduro Rally">Western Ghats Enduro Rally</option>
                      <option value="Sunset Gravel Sprint 2026">Sunset Gravel Sprint 2026</option>
                      <option value="Desert Sprint 200 Endurance">Desert Sprint 200 Endurance</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label>Ticket Pass Tier</label>
                    <select 
                      value={newFormData.ticketTier}
                      onChange={e => setNewFormData({ ...newFormData, ticketTier: e.target.value })}
                    >
                      <option value="All-Access Expedition Pass">All-Access Expedition Pass (₹25,000)</option>
                      <option value="VIP Paddock & Race Pass">VIP Paddock & Race Pass (₹2,999)</option>
                      <option value="Solo Trail Rider Pass">Solo Trail Rider Pass (₹12,500)</option>
                      <option value="Pro Racer Entry Tier">Pro Racer Entry Tier (₹4,500)</option>
                      <option value="Official Safety Marshal Pass">Official Safety Marshal Pass (Complimentary)</option>
                      <option value="Desert 200 Standard Entry">Desert 200 Standard Entry (₹7,500)</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label>Batch / Stage</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Batch 1 · High Altitude Crossing"
                      value={newFormData.stageName}
                      onChange={e => setNewFormData({ ...newFormData, stageName: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Initial Gate Status</label>
                    <select 
                      value={newFormData.status}
                      onChange={e => setNewFormData({ ...newFormData, status: e.target.value })}
                    >
                      <option value="Waiting for Review">Waiting for Review</option>
                      <option value="On Progress">On Progress (On Track)</option>
                      <option value="Done">Done (Checked In)</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label>Vehicle / Motorcycle Model</label>
                    <input 
                      type="text" 
                      placeholder="e.g. KTM 390 Adventure"
                      value={newFormData.vehicle}
                      onChange={e => setNewFormData({ ...newFormData, vehicle: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Vehicle Plate Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MH02-DX-1001"
                      value={newFormData.vehiclePlate}
                      onChange={e => setNewFormData({ ...newFormData, vehiclePlate: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Emergency Contact</label>
                    <input 
                      type="text" 
                      placeholder="Name & Contact number"
                      value={newFormData.emergencyContact}
                      onChange={e => setNewFormData({ ...newFormData, emergencyContact: e.target.value })}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Blood Group</label>
                    <select 
                      value={newFormData.bloodGroup}
                      onChange={e => setNewFormData({ ...newFormData, bloodGroup: e.target.value })}
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

                <div className="modal-actions-footer">
                  <button type="button" className="btn-action-outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-action-primary">
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
