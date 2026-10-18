import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  Radio,
  Ticket,
  IndianRupee,
  Search,
  Bell,
  Filter,
  Plus,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Users,
  Star,
  MapPin,
  X,
  CreditCard,
  Zap,
  Landmark,
  ArrowUpRight,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import { currency } from '../../utils/formatters';
import './Dashboard.css';

// Custom dark tooltip for Cashflow chart matching Image 2
const CustomCashflowTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="cashflow-dark-tooltip">
        <div className="tooltip-date-header">{data.fullDate || data.name}</div>
        <div className="tooltip-data-row">
          <span className="tooltip-dot" />
          <span className="tooltip-amount">{data.displayAmt || currency(data.amount)}</span>
          <span className="tooltip-growth">
            <ArrowUpRight size={12} /> {data.growth || '+22.7%'}
          </span>
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

  // Cashflow & Revenue Analytics state (Image 2 style)
  const [cashflowPeriod, setCashflowPeriod] = useState('12 Months'); // '7 Days' | '30 Days' | '12 Months' | '5 Years' | '10 Years' | 'Custom'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState('2026-12-31');

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

  // 2. Revenue Analytics Data (Image 2 style with original Host Revenue scale)
  const cashflowDataMap = useMemo(() => ({
    '12 Months': [
      { name: 'Jan', amount: 145000, displayAmt: '₹1.45L', growth: '+12.4%', fullDate: 'Jan 15' },
      { name: 'Feb', amount: 180000, displayAmt: '₹1.80L', growth: '+14.2%', fullDate: 'Feb 18' },
      { name: 'Mar', amount: 210000, displayAmt: '₹2.10L', growth: '+16.0%', fullDate: 'Mar 12' },
      { name: 'Apr', amount: 245000, displayAmt: '₹2.45L', growth: '+15.5%', fullDate: 'Apr 20' },
      { name: 'May', amount: 198000, displayAmt: '₹1.98L', growth: '+11.2%', fullDate: 'May 10' },
      { name: 'Jun', amount: 280000, displayAmt: '₹2.80L', growth: '+18.4%', fullDate: 'Jun 05' },
      { name: 'Jun 13', amount: 340000, displayAmt: '₹3.40L', growth: '+22.7%', fullDate: 'Jun 13' },
      { name: 'Jul', amount: 420000, displayAmt: '₹4.20L', growth: '+25.1%', fullDate: 'Jul 22' },
      { name: 'Aug', amount: 510000, displayAmt: '₹5.10L', growth: '+28.6%', fullDate: 'Aug 16' },
      { name: 'Sep', amount: 480000, displayAmt: '₹4.80L', growth: '+20.3%', fullDate: 'Sep 19' },
      { name: 'Oct', amount: 650000, displayAmt: '₹6.50L', growth: '+31.4%', fullDate: 'Oct 14' },
      { name: 'Nov', amount: 780000, displayAmt: '₹7.80L', growth: '+36.8%', fullDate: 'Nov 11' },
      { name: 'Dec', amount: 842500, displayAmt: '₹8.42L', growth: '+42.0%', fullDate: 'Dec 28' },
    ],
    '5 Years': [
      { name: '2022', amount: 240000, displayAmt: '₹2.40L', growth: '+15.0%', fullDate: 'Year 2022' },
      { name: '2023', amount: 380000, displayAmt: '₹3.80L', growth: '+22.5%', fullDate: 'Year 2023' },
      { name: '2024', amount: 540000, displayAmt: '₹5.40L', growth: '+28.0%', fullDate: 'Year 2024' },
      { name: '2025', amount: 710000, displayAmt: '₹7.10L', growth: '+33.4%', fullDate: 'Year 2025' },
      { name: '2026', amount: 842500, displayAmt: '₹8.42L', growth: '+41.0%', fullDate: 'Year 2026' },
    ],
    '10 Years': [
      { name: '2017', amount: 80000, displayAmt: '₹80k', growth: '+10.0%', fullDate: 'Year 2017' },
      { name: '2019', amount: 160000, displayAmt: '₹1.60L', growth: '+16.0%', fullDate: 'Year 2019' },
      { name: '2021', amount: 320000, displayAmt: '₹3.20L', growth: '+24.0%', fullDate: 'Year 2021' },
      { name: '2023', amount: 510000, displayAmt: '₹5.10L', growth: '+30.5%', fullDate: 'Year 2023' },
      { name: '2025', amount: 720000, displayAmt: '₹7.20L', growth: '+36.0%', fullDate: 'Year 2025' },
      { name: '2026', amount: 842500, displayAmt: '₹8.42L', growth: '+42.0%', fullDate: 'Year 2026' },
    ],
    '30 Days': [
      { name: 'Week 1', amount: 145000, displayAmt: '₹1.45L', growth: '+12.0%', fullDate: 'Week 1' },
      { name: 'Week 2', amount: 210000, displayAmt: '₹2.10L', growth: '+15.4%', fullDate: 'Week 2' },
      { name: 'Week 3', amount: 198000, displayAmt: '₹1.98L', growth: '+13.8%', fullDate: 'Week 3' },
      { name: 'Week 4', amount: 289500, displayAmt: '₹2.90L', growth: '+21.5%', fullDate: 'Week 4' },
    ],
    '7 Days': [
      { name: 'Mon', amount: 35000, displayAmt: '₹35k', growth: '+8.2%', fullDate: 'Monday' },
      { name: 'Tue', amount: 48000, displayAmt: '₹48k', growth: '+12.0%', fullDate: 'Tuesday' },
      { name: 'Wed', amount: 42000, displayAmt: '₹42k', growth: '+10.5%', fullDate: 'Wednesday' },
      { name: 'Thu', amount: 65000, displayAmt: '₹65k', growth: '+17.2%', fullDate: 'Thursday' },
      { name: 'Fri', amount: 98000, displayAmt: '₹98k', growth: '+24.8%', fullDate: 'Friday' },
      { name: 'Sat', amount: 145000, displayAmt: '₹1.45L', growth: '+32.0%', fullDate: 'Saturday' },
      { name: 'Sun', amount: 185000, displayAmt: '₹1.85L', growth: '+38.5%', fullDate: 'Sunday' },
    ],
  }), []);

  const activeCashflowData = cashflowDataMap[cashflowPeriod] || cashflowDataMap['12 Months'];

  const getCashflowHeadline = () => {
    return currency(totalCalculatedRevenue);
  };

  const selectCardTimeframe = (cardId, tf) => {
    setCardTimeframes((prev) => ({ ...prev, [cardId]: tf }));
    setOpenCardDropdown(null);
  };

  // 3. Upcoming & Live Events Data
  const liveEvent = {
    id: 'live-01',
    title: 'Nitroxx Supercross Championship 2026',
    venue: 'Buddh International Circuit, Greater Noida',
    attendeesInside: '1,420 / 1,500 Inside',
    gateStatus: 'All 4 Gates Operational',
    progress: 94,
  };

  const nextUpcomingEvents = [
    { id: 'up-1', month: 'OCT', day: '24', title: 'Himalayan Enduro High Altitude Raid', venue: 'Manali Pass, HP', booked: '142 / 160 Slots', pct: 88 },
    { id: 'up-2', month: 'NOV', day: '02', title: 'Goa Coastal Motocross Beach Sprint', venue: 'Vagator Arena, Goa', booked: '310 / 400 Slots', pct: 77 },
    { id: 'up-3', month: 'NOV', day: '15', title: 'Aravalli Dirt Sprint Series Round 4', venue: 'Leopard Trail, Gurugram', booked: '95 / 120 Slots', pct: 79 },
  ];

  // 4. Recent Participants
  const recentParticipantsData = [
    {
      id: 'LD21301',
      name: 'John Doe',
      email: 'john.doe@email.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      status: 'New Leads',
      statusClass: 'new-lead',
      source: 'Website',
      owner: 'Alex Ray',
      ownerInitials: 'AR',
      event: 'Nitroxx Supercross',
      tier: 'VIP Pass',
    },
    {
      id: 'LD21302',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      status: 'Contacted',
      statusClass: 'contacted',
      source: 'Paid Ads',
      owner: 'Mina Swan',
      ownerInitials: 'MS',
      event: 'Thar Desert Rally',
      tier: 'Pro Pass',
    },
    {
      id: 'LD21303',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
      status: 'Qualified',
      statusClass: 'qualified',
      source: 'Referral',
      owner: 'John Kim',
      ownerInitials: 'JK',
      event: 'Himalayan Enduro',
      tier: 'Early Bird',
    },
    {
      id: 'LD21304',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
      status: 'Paid',
      statusClass: 'paid',
      source: 'Website',
      owner: 'Sarah Lee',
      ownerInitials: 'SL',
      event: 'Goa Motocross',
      tier: 'VIP Pass',
    },
  ];

  const filteredParticipants = recentParticipantsData.filter(
    (p) =>
      p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(participantSearch.toLowerCase())
  );

  // 8. Top Performing Events
  const topPerformingEvents = [
    {
      id: 1,
      rank: 1,
      title: 'Nitroxx Supercross Championship 2026',
      badge: 'Highest Revenue',
      revenue: '₹3,42,000',
      tickets: '490 / 500 sold',
      rating: '4.95 ★',
    },
    {
      id: 2,
      rank: 2,
      title: 'Thar Desert 4x4 Dune Rally',
      badge: 'Most Tickets Sold',
      revenue: '₹2,88,000',
      tickets: '500 / 500 sold',
      rating: '4.88 ★',
    },
    {
      id: 3,
      rank: 3,
      title: 'Himalayan Enduro Mountain Expedition',
      badge: 'Best Rated Event',
      revenue: '₹1,45,000',
      tickets: '128 / 150 sold',
      rating: '4.98 ★',
    },
  ];

  return (
    <AppLayout showHeader={false} searchPlaceholder="Search events, participants, ticket IDs...">
      <div className="dashboard-root">
        {/* =========================================================================
            HEADER ROW
            ========================================================================= */}
        <header className="dash-header-row">
          <div className="dash-user-welcome">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Host Avatar"
              className="dash-user-avatar"
            />
            <div>
              <h1>Welcome back, {profile?.displayName || user?.displayName || 'Host'} 👋</h1>
              <p>Nitroxx Event Organizer & Operations Control Center</p>
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
            SECTION 2: CASHFLOW / REVENUE ANALYTICS (Exact Replication of Image 2)
            With single line graph and comprehensive date filters
            ========================================================================= */}
        <section className="cashflow-analytics-card" aria-label="Cashflow and Revenue Analytics">
          <div className="cashflow-card-header">
            <div className="cashflow-title-group">
              <div className="cashflow-icon-box">
                <Landmark size={18} />
              </div>
              <span className="cashflow-title-text">Cashflow</span>
            </div>

            <div className="cashflow-controls-group">
              {/* Preset Period Pills from Image 2 */}
              <div className="cashflow-period-pills">
                {['12 Months', '5 Years', '10 Years'].map((period) => (
                  <button
                    key={period}
                    className={`cashflow-pill-btn ${cashflowPeriod === period ? 'active' : ''}`}
                    onClick={() => setCashflowPeriod(period)}
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
                    {['7 Days', '30 Days', '12 Months', '5 Years', '10 Years', 'Custom Range'].map((p) => (
                      <button
                        key={p}
                        className={`date-menu-option ${cashflowPeriod === p ? 'selected' : ''}`}
                        onClick={() => {
                          setCashflowPeriod(p);
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

          {/* Big Headline Metric and Single Line Legend */}
          <div className="cashflow-subhead-row">
            <div className="cashflow-big-headline">{getCashflowHeadline(cashflowPeriod)}</div>
            <div className="cashflow-single-legend">
              <span className="legend-ring-dot" />
              <span>Revenue</span>
            </div>
          </div>

          {/* Single Line Graph with smooth curve & soft area fill */}
          <div className="cashflow-chart-wrapper" style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activeCashflowData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const isHighlight = payload.value === 'Jun 13';
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {isHighlight && (
                          <rect
                            x={-24}
                            y={6}
                            width={48}
                            height={20}
                            rx={5}
                            fill="#f1f5f9"
                          />
                        )}
                        <text
                          x={0}
                          y={isHighlight ? 20 : 18}
                          textAnchor="middle"
                          fill={isHighlight ? '#0f172a' : '#94a3b8'}
                          fontSize={isHighlight ? 12 : 11}
                          fontWeight={isHighlight ? 600 : 400}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
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
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#cashflowGrad)"
                  activeDot={{
                    r: 6,
                    fill: '#ffffff',
                    stroke: '#3b82f6',
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* =========================================================================
            ROW 2: UPCOMING & LIVE EVENTS & TOP PERFORMING EVENTS
            ========================================================================= */}
        <div className="dash-grid-2col">
          {/* SECTION 3: UPCOMING & LIVE EVENTS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-card-icon-box">
                  <Radio size={16} color="#dc2626" />
                </div>
                <h3 className="dash-card-title">Upcoming & Live Events</h3>
              </div>
              <Link to="/events" className="dash-card-pill-btn">View All</Link>
            </div>

            {/* Live event banner */}
            <div className="live-event-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{liveEvent.title}</span>
                <span className="live-badge-pulse">
                  <span className="pulse-dot" /> Live Now
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{liveEvent.venue}</span>
                <strong style={{ color: '#ea580c' }}>{liveEvent.attendeesInside}</strong>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/participants" className="btn-quick-manage">Quick Manage →</Link>
              </div>
            </div>

            {/* Upcoming events list */}
            <div className="upcoming-events-list">
              {nextUpcomingEvents.map((evt) => (
                <div key={evt.id} className="upcoming-event-item">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="upcoming-date-badge-box">
                      <span className="badge-month">{evt.month}</span>
                      <span className="badge-day">{evt.day}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{evt.title}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {evt.venue}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#111827' }}>{evt.booked}</div>
                    <Link to="/events" style={{ fontSize: '11px', color: '#ff6a00', fontWeight: 600, textDecoration: 'none' }}>Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 8: TOP PERFORMING EVENTS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-card-icon-box">
                  <Star size={16} color="#f59e0b" />
                </div>
                <h3 className="dash-card-title">Top Performing Events</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Ranked by Performance</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topPerformingEvents.map((evt) => (
                <div key={evt.id} className="top-event-row">
                  <div className="top-event-info">
                    <span className="top-rank-circle">{evt.rank}</span>
                    <div>
                      <div className="top-event-title">{evt.title}</div>
                      <div className="top-event-meta">
                        <span style={{ background: '#fff7ed', color: '#ea580c', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '10.5px' }}>
                          {evt.badge}
                        </span>
                        <span>{evt.tickets}</span>
                        <span>•</span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{evt.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="top-event-revenue">{evt.revenue}</div>
                </div>
              ))}
            </div>

            {/* Quick Summary Pill Row */}
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #f0f2f5', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '6px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontSize: '10.5px', color: '#6b7280' }}>Highest Revenue</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>₹3.42L</div>
              </div>
              <div style={{ padding: '6px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontSize: '10.5px', color: '#6b7280' }}>Most Tickets</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>500 Sold</div>
              </div>
              <div style={{ padding: '6px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontSize: '10.5px', color: '#6b7280' }}>Top Rating</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>4.98 ★</div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: RECENT PARTICIPANTS TABLE (Exact Replication of Image 2)
            ========================================================================= */}
        <section className="participants-table-card" aria-label="Recent Participants List">
          <div className="table-top-bar">
            <div className="table-header-left">
              <div className="table-icon-square">
                <Users size={16} />
              </div>
              <h2 className="table-heading-title">Recent Participants</h2>
            </div>

            <div className="table-controls-right">
              <div className="table-search-input-wrap">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="table-search-input"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                />
              </div>
              <button className="table-filter-btn">
                <Filter size={13} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="table-wrapper-responsive">
            <table className="participants-styled-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" style={{ accentColor: '#ff6a00', cursor: 'pointer' }} />
                  </th>
                  <th>Leads ID</th>
                  <th>Lead Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input type="checkbox" style={{ accentColor: '#ff6a00', cursor: 'pointer' }} />
                    </td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{row.id}</td>
                    <td>
                      <div className="participant-cell">
                        <img src={row.avatar} alt={row.name} className="participant-avatar-round" />
                        <span className="participant-name-text">{row.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#4b5563' }}>{row.email}</td>
                    <td>
                      <span className={`status-badge-pill ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span className="source-tag">{row.source}</span>
                    </td>
                    <td>
                      <div className="owner-chip">
                        <span className="owner-initials-circle">{row.ownerInitials}</span>
                        <span>{row.owner}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/participants" className="row-action-btn">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================================
            ROW 3: PAYOUTS (Image 3), AUDIENCE INSIGHTS & NOTIFICATIONS & ACTIVITY
            ========================================================================= */}
        <div className="dash-grid-3col" id="payouts-section">
          {/* SECTION 6: PAYOUTS (Image 3 Saved Actions Card Style) */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <Zap size={18} color="#111827" />
                <h3 className="dash-card-title">Payouts & Finance</h3>
              </div>
              <button className="dash-card-pill-btn">See All</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Row 1: Completed Payments (Mint Icon from Image 3) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon mint">
                  <CheckCircle2 size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Completed Payments</div>
                  <div className="action-row-sub">Disbursed to HDFC Bank</div>
                </div>
                <span className="action-amount-pill">
                  ₹6,92,400 <ChevronRight size={13} color="#9ca3af" />
                </span>
              </div>

              {/* Row 2: Available Payout (Lavender Icon from Image 3) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon lavender">
                  <CreditCard size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Available for Payout</div>
                  <div className="action-row-sub">Ready to withdraw</div>
                </div>
                <span className="action-amount-pill">
                  ₹1,48,200 <ChevronRight size={13} color="#9ca3af" />
                </span>
              </div>

              {/* Row 3: Failed / Review Payments (Pink Icon from Image 3) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon pink">
                  <AlertCircle size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Failed Payments</div>
                  <div className="action-row-sub">1 gateway refund request</div>
                </div>
                <span className="action-amount-pill">
                  ₹4,500 <ChevronRight size={13} color="#9ca3af" />
                </span>
              </div>

              {/* Row 4: Processing Payments (Sky Icon from Image 3) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon sky">
                  <Clock size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Scheduled Payout</div>
                  <div className="action-row-sub">Crediting on Monday</div>
                </div>
                <span className="action-amount-pill">
                  ₹1,24,000 <ChevronRight size={13} color="#9ca3af" />
                </span>
              </div>
            </div>

            <button
              className="btn-card-bottom-outlined"
              onClick={() => alert('Withdrawal request initiated for available balance ₹1,48,200')}
            >
              <Plus size={14} /> Request New Payout
            </button>
          </div>

          {/* SECTION 7: AUDIENCE INSIGHTS (Age Groups & Top Cities - NO PIE CHART) */}
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

          {/* SECTION 9: NOTIFICATIONS & ACTIVITY (Image 3 Style Pastel Icons) */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <Bell size={18} color="#111827" />
                <h3 className="dash-card-title">Notifications & Activity</h3>
              </div>
              <button className="dash-card-pill-btn" onClick={() => alert('All activities marked as read.')}>
                Mark Read
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Recent ticket sales (Mint icon) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon mint">
                  <Ticket size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Recent Ticket Sale</div>
                  <div className="action-row-sub">John Doe bought 2x VIP Pass</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>4m ago</span>
              </div>

              {/* Refunds (Pink icon) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon pink">
                  <AlertCircle size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Refund Request</div>
                  <div className="action-row-sub">Karan Mehra (Medical reason)</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>28m ago</span>
              </div>

              {/* Event updates (Sky blue icon) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon sky">
                  <Radio size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Event Gate Update</div>
                  <div className="action-row-sub">Gate B opened for public entry</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>1h ago</span>
              </div>

              {/* Important alerts (Lavender icon) */}
              <div className="saved-action-row">
                <div className="pastel-circle-icon lavender">
                  <ShieldCheck size={18} />
                </div>
                <div className="action-row-meta">
                  <div className="action-row-title">Important System Alert</div>
                  <div className="action-row-sub">RFID sensors calibrated at 100%</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>2h ago</span>
              </div>
            </div>

            <button
              className="btn-card-bottom-outlined"
              onClick={() => alert('Viewing full operations activity log')}
            >
              + View All Activity Logs
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
