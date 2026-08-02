import React from 'react';
import StatCards from '../../components/StatCards/StatCards';
import Charts from '../../components/Charts/Charts';
import MiddleRow from '../../components/MiddleRow/MiddleRow';
import BottomRow from '../../components/BottomRow/BottomRow';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import './AccessoriesDashboard.css';

const AccessoriesDashboard = () => {
  const { analytics } = useDashboardAnalytics();

  return (
    <div className="dashboard-home">

      <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Good morning, Nitroxx Moto Gear.</h1>
              <p className="dashboard-subtitle">
                Your store is performing at <span className="highlight-orange">98% efficiency</span> today. All systems green.
              </p>
            </div>

            <div className="header-actions-main">
              <button className="export-btn">Export Daily Report</button>
              <button className="quick-add-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
                Quick Add
              </button>
            </div>
          </div>

          <div className="stats-row">
            <StatCards analytics={analytics} />
          </div>

          <div className="charts-row">
            <Charts analytics={analytics} />
          </div>

          <div className="middle-row">
            <MiddleRow analytics={analytics} />
          </div>

      <div className="bottom-row">
        <BottomRow analytics={analytics} />
      </div>
    </div>
  );
};

export default AccessoriesDashboard;
