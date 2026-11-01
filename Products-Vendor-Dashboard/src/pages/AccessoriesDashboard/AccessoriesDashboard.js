import React from 'react';
import StatCards from '../../components/StatCards/StatCards';
import RevenueSection from '../../components/RevenueSection/RevenueSection';
import OrdersCalendar from '../../components/OrdersCalendar/OrdersCalendar';
import MiddleRow from '../../components/MiddleRow/MiddleRow';
import BottomRow from '../../components/BottomRow/BottomRow';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import './AccessoriesDashboard.css';
import { useAuth } from '../../context/AuthContext';

const AccessoriesDashboard = () => {
  const { analytics } = useDashboardAnalytics();
  const { profile } = useAuth();

  return (
    <div className="dashboard-home">

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Good morning, <span style={{fontWeight:"600"}}>{profile.displayName}</span></h1>
        </div>

      </div>

      <div className="stats-row">
        <StatCards analytics={analytics} />
      </div>

      <div className="revenue-row">
        <RevenueSection analytics={analytics} />
      </div>

      <div className="calendar-row">
        <OrdersCalendar analytics={analytics} />
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
