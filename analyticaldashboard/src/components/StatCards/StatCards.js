import React from 'react';
import { Calendar, Users, Wallet, Flag } from 'lucide-react';
import './StatCards.css';

const StatCards = () => {
  const stats = [
    {
      title: 'TOTAL EVENTS',
      value: '142',
      badge: '+4%',
      badgeType: 'warning',
      icon: Calendar,
      iconBg: 'var(--primary-blue-light)',
      iconColor: 'var(--primary-blue)'
    },
    {
      title: 'ACTIVE REGISTRATIONS',
      value: '2.4k',
      badge: '+12%',
      badgeType: 'success',
      icon: Users,
      iconBg: '#fef3c7', 
      iconColor: '#b45309' 
    },
    {
      title: 'REVENUE',
      value: '$84.2k',
      badge: '+18.5%',
      badgeType: 'warning',
      icon: Wallet,
      iconBg: '#fee2e2', 
      iconColor: '#ef4444' 
    },
    {
      title: 'UPCOMING EVENTS',
      value: '12',
      badge: 'Next 14d',
      badgeType: 'neutral',
      icon: Flag,
      iconBg: '#f3f4f6', 
      iconColor: '#4b5563' 
    }
  ];

  return (
    <div className="stat-cards-container">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card card">
            <div className="stat-header">
              <div 
                className="stat-icon" 
                style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
              >
                <Icon size={20} />
              </div>
              <span className={`stat-badge badge-${stat.badgeType}`}>
                {stat.badge}
              </span>
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
