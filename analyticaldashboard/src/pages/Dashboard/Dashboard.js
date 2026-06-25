import React from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { events, loading: eventsLoading } = useEvents(profile?.role === 'Host' ? { hostId: user?.uid } : {});
  const { registrations, loading: registrationsLoading } = useRegistrations(
    profile?.role === 'Host' ? { hostId: user?.uid } : { userId: user?.uid }
  );
  const { notifications } = useNotifications(user?.uid);
  const analytics = useAnalytics(events, registrations);
  const loading = eventsLoading || registrationsLoading;

  const cards = [
    ['Total Events', analytics.totalEvents],
    ['Active Events', analytics.activeEvents],
    ['Completed Events', analytics.completedEvents],
    ['Total Registrations', analytics.totalRegistrations],
    ['Total Revenue', currency(analytics.totalRevenue)],
    ['Upcoming Events', analytics.upcomingEvents],
  ];

  return (
    <AppLayout>
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>Host Dashboard</h1>
            <p>Live event performance, revenue, registrations, and operational alerts.</p>
          </div>
          {profile?.role === 'Host' && (
            <Link className="primary-btn" to="/events/new">
              Add Event
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingState label="Loading dashboard" />
        ) : (
          <>
            <section className="metric-grid">
              {cards.map(([label, value]) => (
                <div className="metric-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </section>

            <section className="analytics-grid">
              <div className="panel">
                <h2>Registrations Per Month</h2>
                {analytics.registrationsPerMonth.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.registrationsPerMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="registrations" stroke="#2563eb" fill="#dbeafe" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No registrations yet" message="Published events will populate this chart as users join." />
                )}
              </div>

              <div className="panel">
                <h2>Event Performance</h2>
                {analytics.revenueByEvent.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.revenueByEvent.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="registrations" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No events yet" message="Create your first event to begin tracking performance." />
                )}
              </div>
            </section>

            <section className="analytics-grid" style={{ marginTop: 16 }}>
              <div className="panel">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {registrations.slice(0, 6).map((entry) => (
                    <div className="activity-item" key={entry.id}>
                      <strong>{entry.participantName}</strong>
                      <p className="muted">Registered {formatDateTime(entry.registrationDate)}.</p>
                    </div>
                  ))}
                  {!registrations.length && <EmptyState title="No activity yet" />}
                </div>
              </div>
              <div className="panel">
                <h2>Notifications</h2>
                <div className="notification-list">
                  {notifications.slice(0, 5).map((item) => (
                    <div className="notification-item" key={item.id}>
                      <strong>{item.title}</strong>
                      <p className="muted">{item.message}</p>
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
