import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Clock, CheckCircle, Flame } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './Reports.css';

const checkInData = [
  { time: '08:00 AM', CheckIns: 5 },
  { time: '08:30 AM', CheckIns: 22 },
  { time: '09:00 AM', CheckIns: 48 },
  { time: '09:30 AM', CheckIns: 84 },
  { time: '10:00 AM', CheckIns: 112 },
  { time: '10:30 AM', CheckIns: 124 }
];

const checkInFeed = [
  { name: 'James Miller', ticket: 'VIP Pass', time: '10:15 AM', status: 'Approved' },
  { name: 'Elena Kraus', ticket: 'General Admission', time: '10:12 AM', status: 'Approved' },
  { name: 'Marco Rossi', ticket: 'General Admission', time: '10:05 AM', status: 'Approved' }
];

const Reports = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">

          <div className="dashboard-header">
            <div className="live-header-flex">
              <div>
                <h1 className="dashboard-title">Live Reports</h1>
                <p className="dashboard-subtitle">Real-time tracking of active attendee metrics.</p>
              </div>
              <div className="live-pulse-badge">
                <span className="pulse-dot"></span>
                <span>Track Day 2026 Live</span>
              </div>
            </div>
          </div>

          <div className="reports-metrics-deck">
            <div className="report-metric-card card-blue">
              <div className="r-metric-icon check"><CheckCircle size={20} /></div>
              <div>
                <span className="r-lbl">CHECKED-IN / REGISTERED</span>
                <h3 className="r-val">124 <span className="r-sub">/ 150</span></h3>
              </div>
            </div>

            <div className="report-metric-card card-blue">
              <div className="r-metric-icon active-ses"><Flame size={20} /></div>
              <div>
                <span className="r-lbl">ACTIVE SESSIONS</span>
                <h3 className="r-val">42</h3>
              </div>
            </div>

            <div className="report-metric-card card-blue">
              <div className="r-metric-icon wait"><Clock size={20} /></div>
              <div>
                <span className="r-lbl">AVG QUEUE WAIT TIME</span>
                <h3 className="r-val">2.4 <span className="r-sub">min</span></h3>
              </div>
            </div>
          </div>

          <div className="reports-layout-grid">

            <div className="reports-chart-card card-blue">
              <h3 className="card-title-blue" style={{ marginBottom: '24px' }}>Check-in Velocity</h3>
              <div className="report-chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={checkInData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} check-ins`, 'Check-Ins']} />
                    <defs>
                      <linearGradient id="checkInGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary, #0284c7)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary, #0284c7)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="CheckIns" stroke="var(--primary, #0284c7)" strokeWidth={2} fillOpacity={1} fill="url(#checkInGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="reports-feed-card card-blue">
              <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Live Admission Feed</h3>
              <div className="reports-feed-list">
                {checkInFeed.map((feed, index) => (
                  <div key={index} className="feed-item">
                    <div className="feed-avatar">
                      {feed.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div className="feed-details">
                      <p className="feed-title"><strong>{feed.name}</strong> ({feed.ticket})</p>
                      <span className="feed-time">Checked in at {feed.time}</span>
                    </div>
                    <span className="feed-status-badge">Approved</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
