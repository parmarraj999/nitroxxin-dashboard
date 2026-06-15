import React from 'react';
import { Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import './StatCards.css';

const StatCards = () => {
  return (
    <div className="accessories-stats-grid">

      <div className="stat-card card">
        <div className="stat-header">
          <span className="stat-title">TOTAL<br/>ORDERS</span>
          <span className="badge badge-success">+12.5%</span>
        </div>
        <div className="stat-value-large">1,482</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: '65%' }}></div>
        </div>
      </div>

      <div className="stat-card card">
        <div className="stat-header">
          <span className="stat-title">PENDING ORDERS</span>
        </div>
        <div className="stat-value-with-icon">
          <span className="stat-value-large">42</span>
          <div className="icon-wrapper bg-orange-light">
            <Clock size={16} className="text-orange" />
          </div>
        </div>
        <div className="stat-subtitle">Avg. fulfillment: 2.4 hrs</div>
      </div>

      <div className="stat-card card">
        <div className="stat-header">
          <span className="stat-title">DELIVERED ORDERS</span>
        </div>
        <div className="stat-value-with-icon">
          <span className="stat-value-large">1,204</span>
          <div className="icon-wrapper bg-green-light">
            <CheckCircle2 size={16} className="text-green" />
          </div>
        </div>
        <div className="stat-subtitle text-green-bold">99.2% success rate</div>
      </div>

      <div className="stat-card card">
        <div className="stat-header">
          <span className="stat-title">RETURN REQUESTS</span>
        </div>
        <div className="stat-value-with-icon">
          <span className="stat-value-large">08</span>
          <div className="icon-wrapper bg-red-light">
            <ArrowLeft size={16} className="text-red" />
          </div>
        </div>
        <div className="stat-subtitle">-2% from last month</div>
      </div>
    </div>
  );
};

export default StatCards;
