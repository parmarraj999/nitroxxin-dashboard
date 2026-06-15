import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatCards from '../../components/StatCards/StatCards';
import MainChart from '../../components/MainChart/MainChart';
import RevenueCategory from '../../components/RevenueCategory/RevenueCategory';
import RecentRegistrations from '../../components/RecentRegistrations/RecentRegistrations';
import TopPerformingEvent from '../../components/TopPerformingEvent/TopPerformingEvent';
import LiveActivity from '../../components/LiveActivity/LiveActivity';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Analytics Dashboard</h1>
              <p className="dashboard-subtitle">Real-time performance tracking for Nitroxx events.</p>
            </div>
            <div className="dashboard-actions">
              <button className="date-filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Last 30 Days
              </button>
              <button className="export-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Report
              </button>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="stat-cards-row">
            <StatCards />
          </div>

          {/* Main Grid Layout */}
          <div className="dashboard-grid">
            <div className="grid-left">
              <div className="chart-container">
                <MainChart />
              </div>
              <div className="recent-container">
                <RecentRegistrations />
              </div>
            </div>
            
            <div className="grid-right">
              <div className="revenue-container">
                <RevenueCategory />
              </div>
              <div className="top-event-container">
                <TopPerformingEvent />
              </div>
              <div className="live-activity-container">
                <LiveActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
