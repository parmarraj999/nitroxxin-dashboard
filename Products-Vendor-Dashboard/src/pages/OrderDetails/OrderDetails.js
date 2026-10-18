import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, CreditCard, ExternalLink, Printer, Send, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { toDate } from '../../services/firebaseUtils';
import './OrderDetails.css';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { order } = useOrder(orderId);
  const created = toDate(order?.createdAt);
  const customer = order?.customer || {};
  const firstItem = order?.items?.[0] || {};
  const total = Number(order?.total || order?.totalAmount || 767.38);

  return (
    <div className="order-details-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/orders')}>
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <div className="order-title-section">
            <h1 className="page-title">Order {order?.orderNumber || order?.id || '#NX-99824'}</h1>
            <span className="status-badge-pending">{String(order?.status || 'pending').toUpperCase()}</span>
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

        <div className="left-column">

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
                    <span className="step-time">{created ? created.toLocaleString() : 'Oct 15, 2026, 09:42 AM'}</span>
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
                  <p className="step-desc">Payment of ${total.toFixed(2)} captured successfully via Visa.</p>
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

          <div className="items-purchased-card card">
            <h3 className="section-title" style={{ marginBottom: '20px' }}>Items Purchased</h3>
            <div className="items-list">
              <div className="purchased-item">
                <div className="item-details-flex">
                  <div className="item-img-placeholder" style={{ backgroundColor: '#111827' }}></div>
                  <div className="item-info">
                    <h4>{firstItem.name || 'Apex V3 Carbon Aero Helmet'}</h4>
                    <p>SKU: {firstItem.sku || 'NX-HELM-003'} • Size: {firstItem.size || 'L'} • Color: {firstItem.color || 'Matte Black'}</p>
                  </div>
                </div>
                <div className="item-price-qty">
                  <span className="item-qty">Qty: {firstItem.qty || firstItem.quantity || 1}</span>
                  <span className="item-total-price">${Number(firstItem.price || 599).toFixed(2)}</span>
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
                <span>${Number(order?.subtotal || 629).toFixed(2)}</span>
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
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">

          <div className="customer-details-card card">
            <h3 className="section-title">Customer Details</h3>
            <div className="customer-info-section">
              <div className="customer-meta">
                <div className="avatar-placeholder">MR</div>
                <div>
                  <h4>{customer.name || order?.customerName || 'Marco Rossi'}</h4>
                  <p>Customer ID: {customer.id || '#C-49021'}</p>
                </div>
              </div>

              <div className="contact-list">
                <div className="contact-item">
                  <Mail size={16} className="text-muted" />
                  <span>{customer.email || order?.customerEmail || 'marco.r@example.com'}</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} className="text-muted" />
                  <span>{customer.phone || '+39 333 1234567'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="shipping-address-card card">
            <h3 className="section-title">Shipping Address</h3>
            <div className="address-section">
              <MapPin size={18} className="text-orange" style={{ alignSelf: 'flex-start', marginTop: '2px' }} />
              <div>
                <p className="recipient-name">{customer.name || 'Marco Rossi'}</p>
                <p>{order?.shippingAddress?.line1 || 'Via Garibaldi 12'}</p>
                <p>{order?.shippingAddress?.city || 'Milan'}, {order?.shippingAddress?.state || 'MI'} {order?.shippingAddress?.postalCode || '20121'}</p>
                <p>{order?.shippingAddress?.country || 'Italy'}</p>
              </div>
            </div>
          </div>

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
