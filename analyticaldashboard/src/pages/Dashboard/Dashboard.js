import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  IndianRupee,
  Plus,
  Radio,
  Star,
  Ticket,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useNotifications } from '../../hooks/useNotifications';
import { useRegistrations } from '../../hooks/useRegistrations';
import { currency, formatDateTime } from '../../utils/formatters';
import '../EventPlatform/EventPlatform.css';
import './Dashboard.css';

const chartColors = ['#e11d48', '#2563eb', '#0f766e', '#f59e0b', '#7c3aed', '#475569'];

const asDate = (value) => {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getRegistrationAmount = (entry) =>
  Number(entry.amount || entry.totalAmount || entry.paymentAmount || entry.ticketPrice || entry.price || 0);

const sameDay = (left, right) =>
  left &&
  right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { events, loading: eventsLoading } = useEvents(profile?.role === 'Host' ? { hostId: user?.uid } : {});
  const { registrations, loading: registrationsLoading } = useRegistrations(
    profile?.role === 'Host' ? { hostId: user?.uid } : { userId: user?.uid }
  );
  const { notifications } = useNotifications(user?.uid);
  const analytics = useAnalytics(events, registrations);
  const loading = eventsLoading || registrationsLoading;
  const isHost = profile?.role === 'Host';

  const dashboard = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const todayRegistrations = registrations.filter((entry) => sameDay(asDate(entry.registrationDate), now));
    const checkedIn = registrations.filter((entry) => entry.attendanceStatus === 'Checked In').length;
    const published = events.filter((event) => event.status === 'Published');
    const draft = events.filter((event) => event.status === 'Draft');
    const cancelled = events.filter((event) => event.status === 'Cancelled');
    const completed = events.filter((event) => event.status === 'Completed');
    const upcoming = events
      .filter((event) => {
        const startDate = asDate(event.startDate);
        return startDate && startDate >= now;
      })
      .sort((a, b) => asDate(a.startDate) - asDate(b.startDate));
    const thisWeekEvents = upcoming.filter((event) => asDate(event.startDate) <= sevenDaysFromNow);
    const pendingApproval = events.filter((event) => ['Pending', 'Pending Approval', 'Review'].includes(event.status));

    const categoryMap = events.reduce((acc, event) => {
      const key = event.category || 'Uncategorized';
      const current = acc.get(key) || { name: key, revenue: 0, events: 0, registrations: 0 };
      current.revenue += Number(event.revenue || 0);
      current.events += 1;
      current.registrations += Number(event.registeredCount || 0);
      acc.set(key, current);
      return acc;
    }, new Map());

    const statusData = [
      { name: 'Live', value: published.length },
      { name: 'Draft', value: draft.length },
      { name: 'Review', value: pendingApproval.length },
      { name: 'Completed', value: completed.length },
      { name: 'Cancelled', value: cancelled.length },
    ].filter((item) => item.value > 0);

    return {
      todayBookings: todayRegistrations.length,
      todayRevenue: todayRegistrations.reduce((sum, entry) => sum + getRegistrationAmount(entry), 0),
      checkedIn,
      published: published.length,
      draft: draft.length,
      cancelled: cancelled.length,
      completed: completed.length,
      pendingApproval: pendingApproval.length,
      thisWeekEvents: thisWeekEvents.length,
      unreadNotifications: notifications.filter((item) => !item.isRead).length,
      statusData,
      categoryData: Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      topEvents: [...events]
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
        .slice(0, 5),
      upcoming: upcoming.slice(0, 5),
      recentRegistrations: [...registrations]
        .sort((a, b) => (asDate(b.registrationDate)?.getTime() || 0) - (asDate(a.registrationDate)?.getTime() || 0))
        .slice(0, 6),
    };
  }, [events, notifications, registrations]);

  const cards = [
    { label: 'Total Revenue', value: currency(analytics.totalRevenue), icon: IndianRupee, tone: 'rose', hint: 'Recorded from live events' },
    { label: 'Bookings', value: analytics.totalRegistrations, icon: Ticket, tone: 'blue', hint: `${dashboard.todayBookings} today` },
    { label: 'Live Events', value: dashboard.published, icon: Radio, tone: 'green', hint: `${dashboard.thisWeekEvents} in next 7 days` },
    { label: 'Conversion', value: `${analytics.conversionRate || 0}%`, icon: TrendingUp, tone: 'amber', hint: `${analytics.totalViews || 0} visitors tracked` },
    { label: 'Attendance', value: `${analytics.attendanceRate || 0}%`, icon: CheckCircle2, tone: 'violet', hint: `${dashboard.checkedIn} checked in` },
    { label: 'Alerts', value: dashboard.unreadNotifications, icon: Zap, tone: 'slate', hint: 'Unread notifications' },
  ];

  return (
    <AppLayout searchPlaceholder="Search events, customers, payments, or cities">
      <main className="page-shell dashboard-pro">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">{isHost ? 'Organizer command center' : 'Platform command center'}</span>
            <h1>{isHost ? 'Run every event from one place.' : 'Control platform growth in real time.'}</h1>
            <p>
              Revenue, bookings, approvals, customers, and event health are pulled from your connected Firebase data.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="ghost-btn" to="/analytics"><ArrowUpRight size={16} /> Deep Analytics</Link>
            {isHost && <Link className="primary-btn" to="/events/new"><Plus size={16} /> Create Event</Link>}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading dashboard" />
        ) : (
          <>
            <section className="command-strip">
              <div>
                <span>Today</span>
                <strong>{dashboard.todayBookings} bookings</strong>
                <p>{currency(dashboard.todayRevenue)} collected from registrations</p>
              </div>
              <div>
                <span>Event Pipeline</span>
                <strong>{dashboard.pendingApproval} in review</strong>
                <p>{dashboard.draft} drafts, {dashboard.cancelled} cancelled</p>
              </div>
              <div>
                <span>Experience Health</span>
                <strong>{analytics.attendanceRate || 0}% attendance</strong>
                <p>{analytics.conversionRate || 0}% booking conversion</p>
              </div>
            </section>

            <section className="metric-grid metric-grid-pro">
              {cards.map(({ label, value, icon: Icon, tone, hint }) => (
                <div className={`metric-card metric-card-pro ${tone}`} key={label}>
                  <div className="metric-icon"><Icon size={20} /></div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <p>{hint}</p>
                </div>
              ))}
            </section>

            <section className="dashboard-board">
              <div className="panel chart-panel wide-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Bookings Momentum</h2>
                    <p className="muted">Monthly registration movement across connected events.</p>
                  </div>
                  <span className="status-pill success"><TrendingUp size={14} /> Live data</span>
                </div>
                {analytics.registrationsPerMonth.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.registrationsPerMonth}>
                      <defs>
                        <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="registrations" stroke="#e11d48" strokeWidth={3} fill="url(#bookingGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No registrations yet" message="Published events will populate this chart as users join." />
                )}
              </div>

              <div className="panel chart-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Status Mix</h2>
                    <p className="muted">Live, draft, review, and closed inventory.</p>
                  </div>
                </div>
                {dashboard.statusData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={dashboard.statusData} dataKey="value" nameKey="name" innerRadius={66} outerRadius={104} paddingAngle={4}>
                        {dashboard.statusData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No event statuses yet" message="Create events to see your operational mix." />
                )}
              </div>

              <div className="panel chart-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Category Revenue</h2>
                    <p className="muted">Which segments are driving sales.</p>
                  </div>
                </div>
                {dashboard.categoryData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboard.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No revenue categories yet" message="Revenue appears here once events record sales." />
                )}
              </div>

              <div className="panel list-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Top Events</h2>
                    <p className="muted">Ranked by recorded revenue.</p>
                  </div>
                  <Link to="/events" className="text-link">Manage</Link>
                </div>
                {dashboard.topEvents.length ? (
                  <div className="rank-list">
                    {dashboard.topEvents.map((event, index) => (
                      <Link to={`/events/${event.id}`} className="rank-item" key={event.id}>
                        <span className="rank-number">{index + 1}</span>
                        <div>
                          <strong>{event.title}</strong>
                          <p className="muted">{event.category || 'Uncategorized'} · {event.city || 'City not set'}</p>
                        </div>
                        <div className="rank-value">
                          <strong>{currency(event.revenue)}</strong>
                          <p>{event.registeredCount || 0} bookings</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No events yet" message="Create an event to see performance rankings." />
                )}
              </div>

              <div className="panel list-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Upcoming Operations</h2>
                    <p className="muted">Next events that need attention.</p>
                  </div>
                  <CalendarCheck size={18} />
                </div>
                {dashboard.upcoming.length ? (
                  <div className="operation-list">
                    {dashboard.upcoming.map((event) => (
                      <Link to={`/events/${event.id}`} className="operation-item" key={event.id}>
                        <div className="date-chip">
                          <strong>{asDate(event.startDate)?.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
                          <span>{asDate(event.startDate)?.toLocaleDateString(undefined, { month: 'short' })}</span>
                        </div>
                        <div>
                          <strong>{event.title}</strong>
                          <p className="muted">{event.venue || event.city || 'Venue not set'} · {event.startTime || 'Time not set'}</p>
                        </div>
                        <span className={`status-pill ${event.status === 'Published' ? 'success' : 'warning'}`}>{event.status || 'Draft'}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No upcoming events" message="Published future events will appear here." />
                )}
              </div>

              <div className="panel list-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Customer Stream</h2>
                    <p className="muted">Latest registrations and attendee movement.</p>
                  </div>
                  <Users size={18} />
                </div>
                {dashboard.recentRegistrations.length ? (
                  <div className="activity-list pro-activity-list">
                    {dashboard.recentRegistrations.map((entry) => (
                      <div className="activity-item pro-activity-item" key={entry.id}>
                        <div className="activity-avatar">{(entry.participantName || entry.participant?.name || 'G').slice(0, 1)}</div>
                        <div>
                          <strong>{entry.participantName || entry.participant?.name || 'Guest attendee'}</strong>
                          <p className="muted">{entry.eventTitle || 'Event registration'} · {formatDateTime(entry.registrationDate)}</p>
                        </div>
                        <span className={`status-pill ${entry.attendanceStatus === 'Checked In' ? 'success' : ''}`}>
                          {entry.attendanceStatus || 'Registered'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No customer activity yet" message="Registrations will appear here automatically." />
                )}
              </div>

              <div className="panel list-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>Command Queue</h2>
                    <p className="muted">Notifications, reviews, and finance reminders.</p>
                  </div>
                  <Clock3 size={18} />
                </div>
                <div className="queue-grid">
                  <div><Eye size={16} /><strong>{analytics.totalViews || 0}</strong><span>Visitors</span></div>
                  <div><Star size={16} /><strong>{dashboard.completed}</strong><span>Completed</span></div>
                  <div><Download size={16} /><strong>{dashboard.draft}</strong><span>Drafts</span></div>
                </div>
                <div className="notification-list pro-notification-list">
                  {notifications.slice(0, 4).map((item) => (
                    <div className="notification-item pro-notification-item" key={item.id}>
                      <span className={`notification-status ${item.isRead ? '' : 'unread'}`} />
                      <div>
                        <strong>{item.title}</strong>
                        <p className="muted">{item.message}</p>
                      </div>
                    </div>
                  ))}
                  {!notifications.length && <EmptyState title="No notifications" />}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </AppLayout>
  );
};

export default Dashboard;
