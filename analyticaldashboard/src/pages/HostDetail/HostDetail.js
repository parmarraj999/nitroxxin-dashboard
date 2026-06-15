import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Calendar, Users, Star, ArrowLeft, Mail, Phone, MapPin, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HostDetail.css';

const assignedEvents = [
  { id: 1, name: 'Apex V3 Helmet Tour 2026', date: 'Oct 12, 2026', status: 'Active', statusClass: 'status-active', revenue: '$12,450' },
  { id: 2, name: 'Vantage Jackets Launch', date: 'Sep 28, 2026', status: 'Completed', statusClass: 'status-completed', revenue: '$8,900' },
  { id: 3, name: 'Monsoon Expedition', date: 'Aug 15, 2026', status: 'Completed', statusClass: 'status-completed', revenue: '$15,600' }
];

const HostDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">

          <div className="dashboard-header">
            <div className="header-left-flex">
              <button className="back-btn-blue" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h1 className="dashboard-title">Host Profile</h1>
                <p className="dashboard-subtitle">Manage hosts and event assignments.</p>
              </div>
            </div>
          </div>

          <div className="profile-summary-card card-blue">
            <div className="profile-main-flex">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Sterling" className="profile-avatar" />
              <div className="profile-info-main">
                <div className="name-badge-flex">
                  <h2>Alex Sterling</h2>
                  <span className="role-badge">Creative Director</span>
                </div>
                <p className="profile-bio">Leading creative experiences and adventure tours for Nitroxx Precision Gear.</p>
                <div className="profile-contacts">
                  <div className="contact-icon-text">
                    <Mail size={14} /> <span>alex.s@nitroxx.com</span>
                  </div>
                  <div className="contact-icon-text">
                    <Phone size={14} /> <span>+1 (555) 019-2834</span>
                  </div>
                  <div className="contact-icon-text">
                    <MapPin size={14} /> <span>Munich, Germany</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="host-stats-row">
              <div className="host-stat-box">
                <div className="host-stat-icon-wrapper blue">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="host-stat-label">Assigned Events</span>
                  <h3 className="host-stat-val">32</h3>
                </div>
              </div>
              <div className="host-stat-box">
                <div className="host-stat-icon-wrapper green">
                  <Users size={18} />
                </div>
                <div>
                  <span className="host-stat-label">Total Registrants</span>
                  <h3 className="host-stat-val">4.2k</h3>
                </div>
              </div>
              <div className="host-stat-box">
                <div className="host-stat-icon-wrapper orange">
                  <Star size={18} />
                </div>
                <div>
                  <span className="host-stat-label">Host Rating</span>
                  <h3 className="host-stat-val">94%</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-grid">

            <div className="profile-left card-blue">
              <div className="card-header-flex">
                <h3 className="card-title-blue">Assigned Events</h3>
                <button className="view-all-btn-blue">Manage All</button>
              </div>

              <div className="table-responsive-blue">
                <table className="assigned-table">
                  <thead>
                    <tr>
                      <th>EVENT NAME</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>REVENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedEvents.map(event => (
                      <tr key={event.id} className="clickable-row" onClick={() => navigate('/events/details')}>
                        <td className="event-name-cell">{event.name}</td>
                        <td className="event-date-cell">{event.date}</td>
                        <td>
                          <span className={`status-pill-blue ${event.statusClass}`}>{event.status}</span>
                        </td>
                        <td className="event-rev-cell" style={{ textAlign: 'right' }}>{event.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="profile-right card-blue">
              <h3 className="card-title-blue" style={{ marginBottom: '20px' }}>Recent Host Activity</h3>
              <div className="host-activity-list">
                <div className="host-activity-item">
                  <div className="activity-dot blue-dot"></div>
                  <div className="activity-details">
                    <p className="activity-title">Created new event: <strong>Peak Experience</strong></p>
                    <span className="activity-time">Oct 14, 2026, 15:30 PM</span>
                  </div>
                </div>
                <div className="host-activity-item">
                  <div className="activity-dot orange-dot"></div>
                  <div className="activity-details">
                    <p className="activity-title">Updated slots for <strong>Apex V3 Tour</strong></p>
                    <span className="activity-time">Oct 12, 2026, 09:12 AM</span>
                  </div>
                </div>
                <div className="host-activity-item">
                  <div className="activity-dot green-dot"></div>
                  <div className="activity-details">
                    <p className="activity-title">Approved 3 registrations for <strong>Monsoon Expedition</strong></p>
                    <span className="activity-time">Oct 10, 2026, 11:45 AM</span>
                  </div>
                </div>
              </div>

              <div className="achievements-section">
                <h4 className="achievements-title">Certifications & Awards</h4>
                <div className="achievements-list">
                  <div className="achievement-badge">
                    <Award size={16} /> <span>Lead Rider Certified</span>
                  </div>
                  <div className="achievement-badge">
                    <Award size={16} /> <span>First-Aid Trained</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HostDetail;
