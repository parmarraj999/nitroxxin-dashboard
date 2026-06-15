import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowLeft, Ticket, Calendar, User, Mail, Phone, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TicketDetail.css';

const TicketDetail = () => {
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
                <h1 className="dashboard-title">Ticket details</h1>
                <p className="dashboard-subtitle">Manage ticket orders and attendee check-ins.</p>
              </div>
            </div>
          </div>

          <div className="ticket-detail-grid">

            <div className="ticket-info-card card-blue">
              <div className="ticket-header-section">
                <div className="ticket-icon-circle">
                  <Ticket size={24} />
                </div>
                <div>
                  <h3 className="ticket-order-id">James Miller (Order #12093)</h3>
                  <p className="ticket-event-subtitle">Apex V3 Helmet Tour 2026</p>
                </div>
              </div>

              <div className="ticket-stats-grid">
                <div className="ticket-stat">
                  <span className="t-label">TICKET TYPE</span>
                  <span className="t-val">VIP Pass</span>
                </div>
                <div className="ticket-stat">
                  <span className="t-label">PRICE PAID</span>
                  <span className="t-val">$150.00</span>
                </div>
                <div className="ticket-stat">
                  <span className="t-label">CHECK-IN STATUS</span>
                  <span className="t-val status-green">Checked In</span>
                </div>
                <div className="ticket-stat">
                  <span className="t-label">PAYMENT STATUS</span>
                  <span className="t-val status-green">Paid</span>
                </div>
              </div>

              <div className="attendee-details-section">
                <h4 className="detail-section-title">Attendee Details</h4>
                <div className="detail-rows">
                  <div className="detail-row-item">
                    <User size={16} className="text-light" />
                    <span className="row-lbl">Name:</span>
                    <span className="row-val">James Miller</span>
                  </div>
                  <div className="detail-row-item">
                    <Mail size={16} className="text-light" />
                    <span className="row-lbl">Email:</span>
                    <span className="row-val">j.miller@example.com</span>
                  </div>
                  <div className="detail-row-item">
                    <Phone size={16} className="text-light" />
                    <span className="row-lbl">Phone:</span>
                    <span className="row-val">+1 (555) 321-9876</span>
                  </div>
                  <div className="detail-row-item">
                    <Calendar size={16} className="text-light" />
                    <span className="row-lbl">Purchased:</span>
                    <span className="row-val">Oct 12, 2026, 10:15 AM</span>
                  </div>
                  <div className="detail-row-item">
                    <Clock size={16} className="text-light" />
                    <span className="row-lbl">Checked In:</span>
                    <span className="row-val">Oct 15, 2026, 09:05 AM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-side-column">
              <div className="notes-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Attendee Notes</h3>
                <div className="notes-content">
                  <FileText size={18} className="text-orange" />
                  <p>"Requires size XL Helmet. Requested vegetarian catering options if available."</p>
                </div>
              </div>

              <div className="checkout-summary-card card-blue">
                <h3 className="card-title-blue" style={{ marginBottom: '16px' }}>Order Checkout Details</h3>
                <div className="order-price-breakdown">
                  <div className="p-row">
                    <span>Base Ticket</span>
                    <span>$122.95</span>
                  </div>
                  <div className="p-row">
                    <span>VIP Surcharge</span>
                    <span>$27.05</span>
                  </div>
                  <div className="p-row grand-total-row">
                    <span>Total Paid</span>
                    <span>$150.00</span>
                  </div>
                </div>
                <div className="card-footer-action">
                  <button className="primary-action-btn-blue">Print Ticket PDF</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketDetail;
