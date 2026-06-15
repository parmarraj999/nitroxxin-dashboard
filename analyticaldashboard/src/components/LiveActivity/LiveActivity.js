import React from 'react';
import { UserPlus, CreditCard, Edit3, Plus } from 'lucide-react';
import './LiveActivity.css';

const activities = [
  {
    id: 1,
    icon: UserPlus,
    iconBg: 'var(--primary-blue-light)',
    iconColor: 'var(--primary-blue)',
    text: 'New registration for',
    highlight: 'Monsoon Ride.',
    time: '2 mins ago'
  },
  {
    id: 2,
    icon: CreditCard,
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    text: 'Payment received from',
    highlight: 'Rider #882.',
    time: '14 mins ago'
  },
  {
    id: 3,
    icon: Edit3,
    iconBg: '#ffedd5', // brown tint based on image
    iconColor: '#c2410c',
    text: 'Event updated:',
    highlight: 'Alpine Route.',
    time: '1 hour ago'
  }
];

const LiveActivity = () => {
  return (
    <div className="live-activity-card card">
      <div className="live-header">
        <h2 className="card-title">Live Activity</h2>
        <div className="live-indicator"></div>
      </div>

      <div className="activity-timeline">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon-container">
                <div 
                  className="activity-icon" 
                  style={{ backgroundColor: activity.iconBg, color: activity.iconColor }}
                >
                  <Icon size={16} />
                </div>
                {index !== activities.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  {activity.text} <span className="activity-highlight">{activity.highlight}</span>
                </p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="fab-btn">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default LiveActivity;
