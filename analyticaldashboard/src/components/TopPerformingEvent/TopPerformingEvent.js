import React from 'react';
import './TopPerformingEvent.css';

const TopPerformingEvent = () => {
  return (
    <div className="top-performing-card card">
      <div className="top-event-label">TOP PERFORMING EVENT</div>
      
      <h2 className="top-event-name">Monsoon Ride 2024</h2>
      
      <div className="top-event-stats">
        <div className="stat-block">
          <div className="stat-value highlight-orange">98%</div>
          <div className="stat-label">Capacity</div>
        </div>
        
        <div className="stat-block">
          <div className="stat-value highlight-dark">$12k</div>
          <div className="stat-label">Revenue</div>
        </div>
      </div>
      
      <button className="manage-event-btn">
        Manage Event
      </button>
    </div>
  );
};

export default TopPerformingEvent;
