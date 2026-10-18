import React from 'react';
import { Link } from 'react-router-dom';
import './RecentRegistrations.css';

const registrations = [
  {
    id: 1,
    initials: 'JD',
    avatarBg: '#dbeafe', 
    avatarColor: '#2563eb', 
    name: 'James Dalton',
    event: 'Midnight Skyline Run',
    status: 'CONFIRMED',
    statusType: 'success',
    date: 'Oct 12',
    time: '14:30'
  },
  {
    id: 2,
    initials: 'SK',
    avatarBg: '#ffedd5', 
    avatarColor: '#ea580c', 
    name: 'Sarah K.',
    event: 'Desert Storm Trail',
    status: 'PENDING',
    statusType: 'primary',
    date: 'Oct 12',
    time: '11:20'
  },
  {
    id: 3,
    initials: 'MT',
    avatarBg: '#ffedd5',
    avatarColor: '#ea580c',
    name: 'Marcus Thorne',
    event: 'Vintage Custom Expo',
    status: 'CONFIRMED',
    statusType: 'success',
    date: 'Oct 11',
    time: '18:45'
  }
];

const RecentRegistrations = () => {
  return (
    <div className="recent-registrations-card card">
      <div className="recent-header">
        <h2 className="card-title">Recent Registrations</h2>
        <Link to="/tickets" className="view-all-link">View All</Link>
      </div>

      <div className="table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>RIDER NAME</th>
              <th>EVENT</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td>
                  <div className="rider-cell">
                    <div 
                      className="rider-avatar" 
                      style={{ backgroundColor: reg.avatarBg, color: reg.avatarColor }}
                    >
                      {reg.initials}
                    </div>
                    <span className="rider-name">{reg.name}</span>
                  </div>
                </td>
                <td>
                  <span className="event-name">{reg.event}</span>
                </td>
                <td>
                  <span className={`status-badge status-${reg.statusType}`}>
                    {reg.status}
                  </span>
                </td>
                <td>
                  <div className="date-cell">
                    <span className="date-day">{reg.date},</span>
                    <span className="date-time">{reg.time}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRegistrations;
