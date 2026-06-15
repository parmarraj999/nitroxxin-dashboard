import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, CreditCard, ExternalLink, Printer, Send, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './OrderDetails.css';

const OrderDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="order-details-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/orders')}>
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <div className="order-title-section">
            <h1 className="page-title">Order #NX-99824</h1>
            <span className="status-badge-pending">PENDING</span>
          </div>
        </div>
        <div className="header-actions-main">
          <button className="export-btn">
            <ExternalLink size={16} />
            Customer Portal
          </button>
          <button className="export-btn">
            <Send size={16} />
            Resend Invoice
          </button>
          <button className="quick-add-btn">
            <Printer size={16} />
            Print Order
          </button>
        </div>
      </div>

      <div className="details-layout">
        {/* Left Column: Timeline and Items */}
        <div className="left-column">
          {/* Order Timeline */}
          <div className="timeline-card card">
            <h3 className="section-title">Order Timeline</h3>
            <div className="timeline-steps">
              <div className="timeline-step completed">
                <div className="step-marker">
                  <CheckCircle2 size={16} />
                </div>
                <div className="step-info">
                  <div className="step-header">
                    <h4>Order Placed</h4>
                    <span className="step-time">Oct 15, 2026, 09:42 AM</span>
                  </div>
                  <p className="step-desc">Order received and logged in system.</p>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="step-marker">
                  <CheckCircle2 size={16} />
                </div>
                <div className="step-info">
                  <div className="step-header">
                    <h4>Payment Confirmed</h4>
                    <span className="step-time">Oct 15, 2026, 09:43 AM</span>
                  </div>
                  <p className="step-desc">Payment of $767.38 captured successfully via Visa.</p>
                </div>
              </div>

              <div className="timeline-step active">
                <div className="step-marker">
                  <div className="active-dot"></div>
                </div>
                <div className="step-info">
                  <div className="step-header">
                    <h4>Processing Order</h4>
                    <span className="step-time">Oct 15, 2026, 10:00 AM</span>
                  </div>
                  <p className="step-desc">Items allocated in warehouse A and sent to packing queue.</p>
                </div>
              </div>

              <div className="timeline-step pending">
                <div className="step-marker">
                  <Circle size={16} />
                </div>
                <div className="step-info">
                  <div className="step-header">
                    <h4>Shipped (Pending)</h4>
                  </div>
                  <p className="step-desc">Waiting for carrier pickup.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Purchased */}
          <div className="items-purchased-card card">
            <h3 className="section-title" style={{ marginBottom: '20px' }}>Items Purchased</h3>
            <div className="items-list">
              <div className="purchased-item">
                <div className="item-details-flex">
                  <div className="item-img-placeholder" style={{ backgroundColor: '#111827' }}></div>
                  <div className="item-info">
                    <h4>Apex V3 Carbon Aero Helmet</h4>
                    <p>SKU: NX-HELM-003 • Size: L • Color: Matte Black</p>
                  </div>
                </div>
                <div className="item-price-qty">
                  <span className="item-qty">Qty: 1</span>
                  <span className="item-total-price">$599.00</span>
                </div>
              </div>

              <div className="purchased-item">
                <div className="item-details-flex">
                  <div className="item-img-placeholder" style={{ backgroundColor: '#374151' }}></div>
                  <div className="item-info">
                    <h4>Visor Tinted Anti-Fog</h4>
                    <p>SKU: NX-VISR-012 • Color: Dark Smoke</p>
                  </div>
                </div>
                <div className="item-price-qty">
                  <span className="item-qty">Qty: 1</span>
                  <span className="item-total-price">$30.00</span>
                </div>
              </div>
            </div>

            <div className="order-totals-summary">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>$629.00</span>
              </div>
              <div className="totals-row">
                <span>Shipping</span>
                <span className="text-success-bold">Free</span>
              </div>
              <div className="totals-row">
                <span>Tax (VAT 22%)</span>
                <span>$138.38</span>
              </div>
              <div className="totals-row grand-total">
                <span>Total Amount Paid</span>
                <span>$767.38</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Payment */}
        <div className="right-column">
          {/* Customer Details */}
          <div className="customer-details-card card">
            <h3 className="section-title">Customer Details</h3>
            <div className="customer-info-section">
              <div className="customer-meta">
                <div className="avatar-placeholder">MR</div>
                <div>
                  <h4>Marco Rossi</h4>
                  <p>Customer ID: #C-49021</p>
                </div>
              </div>
              
              <div className="contact-list">
                <div className="contact-item">
                  <Mail size={16} className="text-muted" />
                  <span>marco.r@example.com</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} className="text-muted" />
                  <span>+39 333 1234567</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="shipping-address-card card">
            <h3 className="section-title">Shipping Address</h3>
            <div className="address-section">
              <MapPin size={18} className="text-orange" style={{ alignSelf: 'flex-start', marginTop: '2px' }} />
              <div>
                <p className="recipient-name">Marco Rossi</p>
                <p>Via Garibaldi 12</p>
                <p>Milan, MI 20121</p>
                <p>Italy</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="payment-details-card card">
            <h3 className="section-title">Payment Summary</h3>
            <div className="payment-section">
              <CreditCard size={18} className="text-muted" />
              <div>
                <p className="payment-method-title">Credit Card</p>
                <p className="payment-card-desc">Visa ending in 4242</p>
              </div>
            </div>
            <div className="payment-status-flex">
              <span>Status</span>
              <span className="payment-status-badge">PAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
