import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import { currency } from '../../utils/formatters';
import './EventPlatform.css';

const colors = ['#2563eb', '#f97316', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const { user } = useAuth();
  const { events, loading: eventsLoading } = useEvents({ hostId: user?.uid });
  const { registrations, loading: registrationsLoading } = useRegistrations({ hostId: user?.uid });
  const analytics = useAnalytics(events, registrations);
  const loading = eventsLoading || registrationsLoading;

  return (
    <AppLayout>
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>Analytics</h1>
            <p>Conversion, attendance, revenue, and participant insight for event hosts.</p>
          </div>
        </div>
        {loading ? <LoadingState label="Loading analytics" /> : (
          <>
            <section className="metric-grid">
              <div className="metric-card"><span>Total Views</span><strong>{analytics.totalViews}</strong></div>
              <div className="metric-card"><span>Total Registrations</span><strong>{analytics.totalRegistrations}</strong></div>
              <div className="metric-card"><span>Conversion Rate</span><strong>{analytics.conversionRate}%</strong></div>
              <div className="metric-card"><span>Attendance Rate</span><strong>{analytics.attendanceRate}%</strong></div>
              <div className="metric-card"><span>Revenue</span><strong>{currency(analytics.totalRevenue)}</strong></div>
              <div className="metric-card"><span>Hosted Events</span><strong>{analytics.totalEvents}</strong></div>
            </section>
            <section className="analytics-grid">
              <div className="panel">
                <h2>Revenue By Event</h2>
                {analytics.revenueByEvent.length ? (
                  <ResponsiveContainer height={320} width="100%">
                    <BarChart data={analytics.revenueByEvent}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No revenue yet" />}
              </div>
              <div className="panel">
                <h2>Gender Distribution</h2>
                {analytics.genderDistribution.length ? (
                  <ResponsiveContainer height={320} width="100%">
                    <PieChart>
                      <Pie data={analytics.genderDistribution} dataKey="value" nameKey="name" outerRadius={105} label>
                        {analytics.genderDistribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No participant data" />}
              </div>
              <div className="panel">
                <h2>City Distribution</h2>
                <ResponsiveContainer height={280} width="100%"><BarChart data={analytics.cityDistribution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#f97316" /></BarChart></ResponsiveContainer>
              </div>
              <div className="panel">
                <h2>Age Distribution</h2>
                <ResponsiveContainer height={280} width="100%"><BarChart data={analytics.ageDistribution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#10b981" /></BarChart></ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>
    </AppLayout>
  );
};

export default Analytics;
