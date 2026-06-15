import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowLeft, MapPin, Calendar, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './EventDetails.css';

const EventDetails = () => {
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
                <h1 className="dashboard-title">Event details</h1>
                <p className="dashboard-subtitle">Manage listings, schedules, and active bookings.</p>
              </div>
            </div>
          </div>

          <div className="event-hero-banner">
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <span className="banner-tag">MOTORCYCLE RACING</span>
              <h2>Unlimited Track Day 2026</h2>
              <div className="banner-meta">
                <div className="meta-icon-text">
                  <Calendar size={16} /> <span>Oct 28, 2026</span>
                </div>
                <div className="meta-icon-text">
                  <MapPin size={16} /> <span>Le Mans, France</span>
                </div>
              </div>
            </div>
          </div>

          <div className="event-details-layout">

            <div className="event-left-col">

              <div className="event-info-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Event Overview</h3>
                <p className="event-description-text">
                  Experience the adrenaline of open track racing. Push your machine to the limit under the guidance of expert instructors. Track Day offers a safe, controlled environment to improve your cornering, braking, and overall racing lines. Included with passes are mechanical support, garage slots, and telemetry review sessions.
                </p>
              </div>

              <div className="event-venue-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Venue Location</h3>
                <div className="venue-flex">
                  <div className="venue-map-placeholder">

                    <div className="map-grid-pattern"></div>
                    <div className="map-marker-pin">
                      <MapPin size={24} className="text-orange" fill="#ea580c" />
                    </div>
                  </div>
                  <div className="venue-address-details">
                    <h4>Circuit de la Sarthe</h4>
                    <p className="address-sub text-muted">24 Hours of Le Mans Track</p>
                    <p className="address-full text-light">Place Luigi Chinetti, 72019 Le Mans, France</p>
                  </div>
                </div>
              </div>

              <div className="event-passes-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '20px' }}>Pass Types Available</h3>
                <div className="passes-stack">
                  <div className="pass-type-item">
                    <div className="pass-left">
                      <div className="pass-icon"><Ticket size={18} /></div>
                      <div>
                        <h4>VIP Pass</h4>
                        <p>Unlimited sessions, snack bar access, garage spot, track camera recordings.</p>
                      </div>
                    </div>
                    <div className="pass-right">
                      <span className="pass-price">$150.00</span>
                      <span className="pass-slots text-success-bold">Available</span>
                    </div>
                  </div>

                  <div className="pass-type-item">
                    <div className="pass-left">
                      <div className="pass-icon"><Ticket size={18} /></div>
                      <div>
                        <h4>General Admission</h4>
                        <p>Access to paddock area, general seating, and 2 track sessions.</p>
                      </div>
                    </div>
                    <div className="pass-right">
                      <span className="pass-price">$75.00</span>
                      <span className="pass-slots text-success-bold">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="event-right-col">

              <div className="event-actions-widget card-blue">
                <div className="widget-status-row">
                  <span className="status-indicator-dot green"></span>
                  <span className="widget-status-lbl">REGISTRATION ACTIVE</span>
                </div>

                <div className="widget-slots-progress">
                  <div className="slots-header">
                    <span>Slots Filled</span>
                    <strong>88 / 100</strong>
                  </div>
                  <div className="widget-progress-bar">
                    <div className="widget-progress-fill" style={{ width: '88%' }}></div>
                  </div>
                  <p className="slots-warning text-orange-bold">Only 12 slots left!</p>
                </div>

                <div className="widget-price-tag">
                  <span className="price-lbl">STARTING FROM</span>
                  <h2 className="price-val">$150.00</h2>
                </div>

                <div className="widget-buttons-stack">
                  <button className="primary-action-btn-blue">Edit Event Listing</button>
                  <button className="secondary-action-btn-blue">Close Registration</button>
                </div>
              </div>

              <div className="event-host-widget card-blue" onClick={() => navigate('/hosts')} style={{ cursor: 'pointer' }}>
                <h4 className="widget-title-small">Event Coordinator</h4>
                <div className="host-profile-flex">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Sterling" className="host-avatar-mini" />
                  <div>
                    <h4 className="host-name-mini">Alex Sterling</h4>
                    <p className="host-role-mini">Creative Director</p>
                  </div>
                </div>
                <div className="host-badge-footer">
                  <ShieldCheck size={16} className="text-success" />
                  <span>Lead Coordinator Assigned</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventDetails;
