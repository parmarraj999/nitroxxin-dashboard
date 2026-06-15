import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowLeft, Compass, Shield, Map, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MonsoonExpedition.css';

const MonsoonExpedition = () => {
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
                <h1 className="dashboard-title">Monsoon Expedition</h1>
                <p className="dashboard-subtitle">Public Landing & Campaign Page Preview.</p>
              </div>
            </div>
          </div>

          <div className="monsoon-hero-banner">
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <span className="banner-tag-green">ADVENTURE TOUR</span>
              <h2>Conquering the Western Ghats: Monsoon Expedition</h2>
              <p className="banner-sub-desc">A 3-day premium touring experience through peak monsoon passes, waterfalls, and scenic hairpins.</p>
            </div>
          </div>

          <div className="monsoon-stats-bar card-blue">
            <div className="m-stat">
              <span className="m-lbl">PRICE</span>
              <span className="m-val">$150.00</span>
            </div>
            <div className="m-stat">
              <span className="m-lbl">CAPACITY</span>
              <span className="m-val">50 Riders Max</span>
            </div>
            <div className="m-stat">
              <span className="m-lbl">START DATE</span>
              <span className="m-val">Aug 15, 2026</span>
            </div>
            <div className="m-stat">
              <span className="m-lbl">DURATION</span>
              <span className="m-val">3 Days / 2 Nights</span>
            </div>
          </div>

          <div className="event-details-layout">

            <div className="event-left-col">

              <div className="overview-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}><Compass size={18} className="title-icon-blue" /> Expedition Overview</h3>
                <p className="overview-text-main">
                  The Western Ghats come alive during the monsoon season. This curated tour is designed for seasoned riders seeking to experience challenging twisties, dense fog corridors, and scenic vistas. Starting from Mumbai, we scale the heights of Lonavala, winding down through the valleys of Mahabaleshwar. Fully supported by a sweep vehicle, paramedic, and professional photography crew.
                </p>
              </div>

              <div className="route-map-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}><Map size={18} className="title-icon-blue" /> Route Map & Pitstops</h3>
                <div className="route-timeline">
                  <div className="route-stop">
                    <div className="stop-marker-dot"></div>
                    <div className="stop-details">
                      <h4>Day 1: Departure from Mumbai</h4>
                      <p>Highway cruise leading up to the Lonavala ghat section. Check-in at highland resort.</p>
                    </div>
                  </div>
                  <div className="route-stop">
                    <div className="stop-marker-dot"></div>
                    <div className="stop-details">
                      <h4>Day 2: Lonavala to Mahabaleshwar</h4>
                      <p>Mountain roads, forest reserves, and scenic waterfall lookouts.</p>
                    </div>
                  </div>
                  <div className="route-stop">
                    <div className="stop-marker-dot"></div>
                    <div className="stop-details">
                      <h4>Day 3: Return Loop to Mumbai</h4>
                      <p>Coastal plains run, highway cruise, and evening debrief session.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="requirements-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}><Shield size={18} className="title-icon-blue" /> Rider Requirements</h3>
                <ul className="req-list">
                  <li>Minimum 200cc motorcycle in excellent mechanical condition.</li>
                  <li>Full face helmet (DOT/ECE approved), riding jacket, gloves, and boots.</li>
                  <li>Premium water-resistant rain gear/layers.</li>
                  <li>Valid driving license and comprehensive vehicle insurance papers.</li>
                </ul>
              </div>
            </div>

            <div className="event-right-col">

              <div className="booking-widget card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Book Your Slot</h3>
                <p className="booking-status-lbl">Remaining Slots: <strong>14 left</strong></p>
                <div className="widget-progress-bar" style={{ marginBottom: '24px' }}>
                  <div className="widget-progress-fill green" style={{ width: '72%', backgroundColor: '#16a34a' }}></div>
                </div>

                <div className="booking-tier-box">
                  <div className="tier-header">
                    <h4>Standard Pass</h4>
                    <strong>$150.00</strong>
                  </div>
                  <p className="tier-desc">Includes hotel stays, backup vehicle support, and route booklets.</p>
                </div>

                <button className="primary-action-btn-blue" style={{ marginTop: '16px' }}>Book Standard Pass</button>
              </div>

              <div className="support-info-widget card-blue">
                <div className="support-header">
                  <AlertCircle size={18} className="text-orange" />
                  <h4>Safety & Backup Support</h4>
                </div>
                <p className="support-desc">
                  This tour includes 24/7 medical backup, ambulance coordination, on-trip mechanic assistance, and a flatbed towing support vehicle for breakdowns.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonsoonExpedition;
