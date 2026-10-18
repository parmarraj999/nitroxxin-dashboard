import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Users,
  DollarSign,
  Smartphone,
  BarChart3,
  Star,
  MapPin,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import { currency } from '../../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { events = [] } = useEvents(profile?.role === 'Host' ? { hostId: user?.uid } : {});
  const { registrations = [] } = useRegistrations(
    profile?.role === 'Host' ? { hostId: user?.uid } : { userId: user?.uid }
  );
  const analytics = useAnalytics(events, registrations);

  // States
  const [dateFilter] = useState('This Month');
  const [chartView, setChartView] = useState('revenue'); // 'revenue' or 'tickets'
  const [participantSearch, setParticipantSearch] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // 1. Overview Calculated Data
  const totalCalculatedRevenue = analytics.totalRevenue > 0 ? analytics.totalRevenue : 842500;
  const totalCalculatedTickets = analytics.totalRegistrations > 0 ? analytics.totalRegistrations : 3844;
  const totalCalculatedEvents = events.length > 0 ? events.length : 24;
  const totalLiveEvents = events.filter((e) => e.status === 'Live' || e.status === 'Published').length || 3;

  // 2. Revenue & Ticket Chart Data
  const revenueChartData = useMemo(() => [
    { name: 'Week 1', revenue: 145000, tickets: 420 },
    { name: 'Week 2', revenue: 210000, tickets: 680 },
    { name: 'Week 3', revenue: 198000, tickets: 610 },
    { name: 'Week 4', revenue: 289500, tickets: 940 },
  ], []);

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

  // 4. Recent Participants (Image 2 style)
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
            <button className="dash-select-pill">
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
            SECTION 10: QUICK ACTIONS (Image 3 Pastel Style)
            ========================================================================= */}
        <section className="quick-actions-card-strip" aria-label="Quick Actions">
          <Link to="/events/new" className="quick-action-tile">
            <div className="quick-action-icon-pill orange">
              <Plus size={18} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">➕ Create Event</span>
              <span className="quick-action-sub">New rally or race</span>
            </div>
          </Link>

          <Link to="/participants" className="quick-action-tile">
            <div className="quick-action-icon-pill mint">
              <Ticket size={18} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">🎟 Manage Tickets</span>
              <span className="quick-action-sub">Tiers & passes</span>
            </div>
          </Link>

          <Link to="/participants" className="quick-action-tile">
            <div className="quick-action-icon-pill blue">
              <Smartphone size={18} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">📱 Scan QR</span>
              <span className="quick-action-sub">Gate fast check-in</span>
            </div>
          </Link>

          <Link to="/analytics" className="quick-action-tile">
            <div className="quick-action-icon-pill purple">
              <BarChart3 size={18} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">📊 View Analytics</span>
              <span className="quick-action-sub">Detailed revenue</span>
            </div>
          </Link>

          <a href="#payouts-section" className="quick-action-tile">
            <div className="quick-action-icon-pill pink">
              <DollarSign size={18} />
            </div>
            <div className="quick-action-text">
              <span className="quick-action-title">💰 View Payouts</span>
              <span className="quick-action-sub">Disbursements</span>
            </div>
          </a>
        </section>

        {/* =========================================================================
            SECTION 1: OVERVIEW DIVIDED STAT CARD (Exact Replication of Image 1)
            ========================================================================= */}
        <section className="overview-divided-card" aria-label="Overview KPI Cards">
          {/* Stat 1: Total Events */}
          <div className="stat-divided-col">
            <div className="stat-label-row">
              <Calendar size={15} className="stat-icon" />
              <span>Total Events</span>
            </div>
            <div className="stat-big-number">{totalCalculatedEvents}</div>
            <p className="stat-trend-sub">
              <span className="trend-highlight">+12%(3)</span>
              <span className="trend-neutral">• vs Last Months</span>
            </p>
          </div>

          {/* Stat 2: Live Events */}
          <div className="stat-divided-col">
            <div className="stat-label-row">
              <Radio size={15} className="stat-icon" color="#dc2626" />
              <span>Live Events</span>
            </div>
            <div className="stat-big-number">{totalLiveEvents}</div>
            <p className="stat-trend-sub">
              <span className="trend-highlight">Active Now</span>
              <span className="trend-neutral">• Real-time telemetry</span>
            </p>
          </div>

          {/* Stat 3: Tickets Sold */}
          <div className="stat-divided-col">
            <div className="stat-label-row">
              <Ticket size={15} className="stat-icon" />
              <span>Tickets Sold</span>
            </div>
            <div className="stat-big-number">{totalCalculatedTickets.toLocaleString('en-IN')}</div>
            <p className="stat-trend-sub">
              <span className="trend-highlight">+18%(420)</span>
              <span className="trend-neutral">• vs Last Months</span>
            </p>
          </div>

          {/* Stat 4: Total Revenue */}
          <div className="stat-divided-col">
            <div className="stat-label-row">
              <IndianRupee size={15} className="stat-icon" />
              <span>Total Revenue</span>
            </div>
            <div className="stat-big-number">{currency(totalCalculatedRevenue)}</div>
            <p className="stat-trend-sub">
              <span className="trend-highlight">+20%(₹1.4L)</span>
              <span className="trend-neutral">• vs Last Months</span>
            </p>
          </div>
        </section>

        {/* =========================================================================
            ROW 1: REVENUE ANALYTICS & ATTENDANCE / CHECK-INS
            ========================================================================= */}
        <div className="dash-grid-2col">
          {/* SECTION 2: REVENUE ANALYTICS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-card-icon-box">
                  <BarChart3 size={16} />
                </div>
                <h3 className="dash-card-title">Revenue Analytics</h3>
              </div>
              <div className="chart-segmented-control" style={{ margin: 0 }}>
                <button
                  className={`chart-tab-pill ${chartView === 'revenue' ? 'active' : ''}`}
                  onClick={() => setChartView('revenue')}
                >
                  Revenue Chart
                </button>
                <button
                  className={`chart-tab-pill ${chartView === 'tickets' ? 'active' : ''}`}
                  onClick={() => setChartView('tickets')}
                >
                  Ticket Sales Chart
                </button>
              </div>
            </div>

            <div className="revenue-stats-subhead">
              <span className="rev-big-val">
                {chartView === 'revenue' ? currency(totalCalculatedRevenue) : `${totalCalculatedTickets} Tickets`}
              </span>
              <span className="rev-tag-badge">+14.2% vs last month</span>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'revenue' ? (
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueColorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ff6a00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip formatter={(val) => currency(val)} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#ff6a00" strokeWidth={2.5} fill="url(#revenueColorGrad)" />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="tickets" name="Tickets Sold" fill="#ff6a00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 5: ATTENDANCE / CHECK-INS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-card-icon-box">
                  <CheckCircle2 size={16} color="#16a34a" />
                </div>
                <h3 className="dash-card-title">Attendance / Check-ins</h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>83.5% Completed</span>
            </div>

            <div className="checkin-progress-hero">
              <div className="checkin-hero-numbers">
                <div className="checkin-hero-left">2,840 Checked In</div>
                <div className="checkin-hero-right">of 3,400 Total Attendees</div>
              </div>
              <div className="checkin-progress-track">
                <div className="checkin-progress-fill" style={{ width: '83.5%' }} />
              </div>
            </div>

            <div className="checkin-breakdown-row">
              <div className="checkin-chip-card">
                <span className="checkin-chip-label">Checked-in Users</span>
                <span className="checkin-chip-val" style={{ color: '#16a34a' }}>2,840</span>
                <span style={{ fontSize: '10.5px', color: '#9ca3af' }}>Fast gate scanned</span>
              </div>
              <div className="checkin-chip-card">
                <span className="checkin-chip-label">Remaining Attendees</span>
                <span className="checkin-chip-val" style={{ color: '#ea580c' }}>560</span>
                <span style={{ fontSize: '10.5px', color: '#9ca3af' }}>Expected arrival</span>
              </div>
              <div className="checkin-chip-card">
                <span className="checkin-chip-label">Avg Scan Speed</span>
                <span className="checkin-chip-val" style={{ color: '#111827' }}>3.8s</span>
                <span style={{ fontSize: '10.5px', color: '#16a34a' }}>-22% below SLA</span>
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                  <span>Gate A (VIP & Pitlane)</span>
                  <strong>94% (1,420 entries)</strong>
                </div>
                <div className="checkin-progress-track" style={{ height: '5px' }}>
                  <div className="checkin-progress-fill" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                  <span>Gate B (General Grandstand)</span>
                  <strong>78% (1,420 entries)</strong>
                </div>
                <div className="checkin-progress-track" style={{ height: '5px' }}>
                  <div className="checkin-progress-fill" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

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
