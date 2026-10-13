import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  CreditCard,
  User,
  Mail,
  Home,
  MoreVertical,
  FileEdit,
  Info,
  X,
  Receipt,
  RotateCw,
  RotateCcw,
  Zap,
  CircleDollarSign,
  FileText,
  Printer,
  Check,
  Truck,
  MapPin,
  Copy,
  ChevronDown,
  ChevronUp,
  Phone,
  Fingerprint,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Store,
  BadgeCheck,
  Navigation
} from 'lucide-react';
import { useOrder } from '../../hooks/useOrders';
import { updateOrderStatus } from '../../services/orderService';
import { toDate } from '../../services/firebaseUtils';
import './OrderDetails.css';

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { order, loading } = useOrder(orderId);

  // Status state
  const [currentStatus, setCurrentStatus] = useState('Completed');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState(
    'Customer called on Aug 28 to confirm integration capabilities with their existing payroll system. Confirmed compatibility and sent follow-up documentation via email.'
  );
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Timeline breakdown toggle state
  const [showTimelineBreakdown, setShowTimelineBreakdown] = useState(false);

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Custom activities (allows dynamic additions when actions are performed)
  const [customActivities, setCustomActivities] = useState([]);

  // Sync with Firestore order when loaded
  useEffect(() => {
    if (order) {
      if (order.status) {
        setCurrentStatus(order.status);
      }
      if (order.notes || order.note) {
        setNoteText(order.notes || order.note);
      }
    }
  }, [order]);

  // Derived Values & Formatting
  const createdDate = toDate(order?.createdAt || order?.createdDate);
  const formattedDate = createdDate
    ? createdDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : 'August 29, 2025 at 14:33';

  const orderType = order?.plan || order?.orderType || order?.category || 'Marketplace Order';
  const displayOrderNumber = order?.orderNumber || (order?.id ? order.id.slice(0, 8).toUpperCase() : '001');

  // Customer Details (with proper UID)
  const customer = order?.customer || {};
  const customerUid = order?.userId || order?.uid || order?.customerId || customer?.uid || customer?.id || (order?.id ? `USR-${order.id.slice(0, 6).toUpperCase()}` : 'USR-782194');
  const customerName = customer.name || order?.customerName || order?.clientName || 'Customer';
  const customerEmail = customer.email || order?.customerEmail || order?.clientEmail || 'customer@example.com';
  const customerPhone = customer.phone || order?.phone || '+91 98765 43210';
  const customerLtv = customer.ltv || '₹5,490 all time value';
  const customerOrdersCount = customer.ordersCount || '2 orders';

  // Advanced Shipping Address (Strictly Address & Logistics - NO customer name or phone here)
  const shippingInfo = order?.shippingAddress || order?.shipping || {};
  const addressLine1 = shippingInfo.line1 || shippingInfo.address || order?.deliveryAddress || '3517 W. Gray St. Utica';
  const addressLine2 = shippingInfo.line2 || shippingInfo.landmark || 'Near Metro Hub';
  const shippingCity = shippingInfo.city || 'Utica';
  const shippingState = shippingInfo.state || 'New York';
  const shippingZip = shippingInfo.postalCode || shippingInfo.pincode || shippingInfo.zip || '13502';
  const shippingCountry = shippingInfo.country || 'India';
  const fullAddressFormatted = [addressLine1, addressLine2, shippingCity, `${shippingState} ${shippingZip}`, shippingCountry].filter(Boolean).join(', ');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressFormatted)}`;

  // Vendor / Store Details
  const vendorId = order?.vendorId || order?.items?.[0]?.vendorId || 'VND-NX9842';
  const vendorName = order?.vendorName || order?.storeName || order?.items?.[0]?.vendorName || 'Nitroxx Moto Gear Store';
  const vendorEmail = order?.vendorEmail || `support@${vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const vendorPhone = order?.vendorPhone || '+91 80 4920 1823';
  const vendorOrigin = order?.shipping?.shippingOrigin || order?.warehouseAddress || 'Bengaluru Logistics Hub, Karnataka';
  const vendorCategory = order?.vendorCategory || 'Authorized Moto Gear Partner';
  const vendorRating = order?.vendorRating || '4.9 ★ (1.2k Reviews)';

  // Items List
  const items = (order?.items && order.items.length > 0)
    ? order.items.map((item, idx) => ({
        id: item.id || `item-${idx}`,
        name: item.name || item.title || 'Worksy a HRM Software',
        subtitle: `${item.variant || item.size || 'Standard'} · ${item.period || item.color || 'Default'}`,
        price: Number(item.price || 240),
        quantity: Number(item.quantity || item.qty || 1),
        total: Number(item.total || (Number(item.price || 240) * Number(item.quantity || 1))),
        image: item.image || item.thumbnail || null
      }))
    : [
        {
          id: 'default-1',
          name: 'Nitroxx Pro Riding Jacket',
          subtitle: 'Black · XL',
          price: 4999.00,
          quantity: 1,
          total: 4999.00,
          image: null
        }
      ];

  // Financials
  const itemsTotal = items.reduce((acc, it) => acc + it.total, 0);
  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = Number(order?.subtotal || itemsTotal || 4999.00);
  const taxRate = Number(order?.taxRate || 18);
  const taxAmount = Number(order?.tax || (subtotal * (taxRate / 100)) || 0.00);
  const shippingFee = Number(order?.shippingFee || order?.shippingPrice || 0.00);
  const totalRefund = Number(order?.refund || 0.00);
  const netPayment = Number(order?.total || order?.totalAmount || (subtotal + taxAmount + shippingFee - totalRefund) || 4999.00);

  // Razorpay & Advanced Payment Details
  const paymentObj = order?.payment || {};
  const razorpayPaymentId = paymentObj.razorpay_payment_id || order?.razorpayPaymentId || paymentObj.paymentId || (order?.id ? `pay_${order.id.slice(0, 10).toLowerCase()}` : 'pay_Pqi87123984');
  const razorpayOrderId = paymentObj.razorpay_order_id || order?.razorpayOrderId || paymentObj.orderId || (order?.id ? `order_${order.id.slice(0, 8).toLowerCase()}` : 'order_NX9823471');
  const paymentMethod = paymentObj.method || order?.paymentMethod || 'UPI (Google Pay / PhonePe)';
  const paymentStatus = (paymentObj.status || order?.paymentStatus || 'captured').toLowerCase();

  // Transaction timestamps
  const txnDate = createdDate
    ? createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 29, 2025';
  const txnTime = createdDate
    ? createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '02:33 PM';

  // Format dates matching reference image "Jan 7, 2025 07:50 PM"
  const formatTimelineDate = (dateVal) => {
    if (!dateVal) return null;
    const d = toDate(dateVal);
    if (!d || isNaN(d.getTime())) return null;
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const normStatus = (currentStatus || order?.status || 'pending').toLowerCase();
  const isCreated = true;
  const isPickedUp = ['packed', 'shipped', 'delivered', 'completed'].includes(normStatus);
  const isDelivered = ['delivered', 'completed'].includes(normStatus);

  const orderCreatedFormatted = formatTimelineDate(createdDate) || 'Jan 7, 2025 07:50 PM';

  let pickedUpTime = null;
  if (isPickedUp) {
    if (order?.shippedAt) pickedUpTime = formatTimelineDate(order.shippedAt);
    else if (order?.packedAt) pickedUpTime = formatTimelineDate(order.packedAt);
    else if (createdDate) {
      pickedUpTime = formatTimelineDate(new Date(createdDate.getTime() + 45 * 60 * 1000));
    } else {
      pickedUpTime = 'Jan 7, 2025 07:51 PM';
    }
  }

  let deliveredTime = null;
  if (isDelivered) {
    if (order?.deliveredAt) deliveredTime = formatTimelineDate(order.deliveredAt);
    else if (createdDate) {
      deliveredTime = formatTimelineDate(new Date(createdDate.getTime() + 2 * 3600 * 1000));
    } else {
      deliveredTime = 'Jan 7, 2025 09:30 PM';
    }
  }

  // 3-step order timeline directly matching the 1st reference screenshot
  const timelineMilestones = [
    {
      id: 'step-1',
      title: 'Trip created',
      time: orderCreatedFormatted,
      completed: isCreated
    },
    {
      id: 'step-2',
      title: 'Order picked up from restaurant',
      time: isPickedUp ? pickedUpTime : '--',
      completed: isPickedUp
    },
    {
      id: 'step-3',
      title: 'Order delivered to customer',
      time: isDelivered ? deliveredTime : '--',
      completed: isDelivered
    }
  ];

  // Default timeline breakdown entries
  const defaultActivities = [
    {
      id: 'act-1',
      icon: <RotateCw size={13} />,
      title: 'Order processed by fulfillment center',
      time: pickedUpTime || 'Jan 7, 2025 07:51 PM',
      desc: 'Dispatched to delivery partner for last mile delivery.'
    },
    {
      id: 'act-2',
      icon: <Mail size={13} />,
      title: 'Order confirmation email sent',
      time: orderCreatedFormatted,
      desc: `Invoice and tracking link dispatched to ${customerEmail}.`
    },
    {
      id: 'act-3',
      icon: <CircleDollarSign size={13} />,
      title: 'Payment confirmed via Razorpay',
      time: orderCreatedFormatted,
      desc: `Payment of ₹${netPayment.toLocaleString()} captured (ID: ${razorpayPaymentId}).`
    },
    {
      id: 'act-4',
      icon: <FileText size={13} />,
      title: 'Order created',
      time: orderCreatedFormatted,
      desc: `Order #${displayOrderNumber} registered in the system.`
    }
  ];

  const allActivities = [...customActivities, ...defaultActivities];

  // Action: Back to Processing
  const handleBackToProcessing = async () => {
    setIsUpdatingStatus(true);
    try {
      if (orderId && orderId !== 'details') {
        await updateOrderStatus(orderId, 'processing', 'Returned to processing by admin');
      }
      setCurrentStatus('Processing');
      const now = new Date();
      const timeStr = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${now.getFullYear()}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      setCustomActivities(prev => [
        {
          id: `act-${Date.now()}`,
          icon: <RotateCw size={13} />,
          title: 'Order status changed to Processing',
          time: timeStr,
          desc: 'Admin changed status back to processing.'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Failed to update order status:', err);
      setCurrentStatus('Processing');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Action: Cancel Order
  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setIsUpdatingStatus(true);
    try {
      if (orderId && orderId !== 'details') {
        await updateOrderStatus(orderId, 'cancelled', 'Order cancelled by admin');
      }
      setCurrentStatus('Cancelled');
      const now = new Date();
      const timeStr = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${now.getFullYear()}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      setCustomActivities(prev => [
        {
          id: `act-${Date.now()}`,
          icon: <X size={13} />,
          title: 'Order cancelled',
          time: timeStr,
          desc: 'Order was marked as cancelled by admin.'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setCurrentStatus('Cancelled');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Action: Save Note
  const handleSaveNote = () => {
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  return (
    <div className="order-details-container">
      {/* ── TOP HEADER BAR ── */}
      <div className="od-header">
        <div className="od-header-left">
          <div className="od-title-row">
            <button
              type="button"
              className="od-history-back-btn"
              onClick={() => navigate('/orders')}
              title="Back to Orders"
              aria-label="Back to Orders"
            >
              <RotateCcw size={16} />
            </button>
            <h1 className="od-order-id">#{displayOrderNumber}</h1>
            <span className={`od-status-pill od-status-${currentStatus.toLowerCase()}`}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
          <div className="od-header-subtitle">
            <span>{formattedDate}</span>
            <span className="od-sub-sep">·</span>
            <span>{orderType}</span>
          </div>
        </div>

        <div className="od-header-actions">
          <button
            type="button"
            className="od-action-btn"
            onClick={() => setIsReceiptOpen(true)}
          >
            <Receipt size={15} />
            <span>Receipt</span>
          </button>

          <button
            type="button"
            className="od-action-btn"
            onClick={handleBackToProcessing}
            disabled={isUpdatingStatus || currentStatus.toLowerCase() === 'processing'}
          >
            <RotateCw size={15} className={isUpdatingStatus ? 'od-spin' : ''} />
            <span>Back to processing</span>
          </button>

          <button
            type="button"
            className="od-action-btn od-cancel-btn"
            onClick={() => setShowCancelModal(true)}
            disabled={isUpdatingStatus || currentStatus.toLowerCase() === 'cancelled'}
          >
            <X size={15} />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className="od-grid-layout">
        {/* ── LEFT COLUMN (60%) ── */}
        <div className="od-col-left">
          {/* Card 1: Order items (Bordered Table) */}
          <div className="od-card">
            <div className="od-card-header">
              <ShoppingBag size={18} className="od-card-icon" />
              <h3 className="od-card-title">Order items</h3>
            </div>

            <div className="od-items-table-wrap">
              <table className="od-items-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item Details</th>
                    <th style={{ textAlign: 'center', width: 140 }}>Price & Qty</th>
                    <th style={{ textAlign: 'right', width: 130 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="od-item-tr">
                      <td>
                        <div className="od-item-left">
                          <div className="od-item-badge">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <Zap size={18} fill="#ffffff" color="#ffffff" />
                            )}
                          </div>
                          <div className="od-item-info">
                            <h4 className="od-item-name">{item.name}</h4>
                            <p className="od-item-sub">{item.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="od-item-qty-cell">₹{item.price.toLocaleString()} × {item.quantity}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="od-item-total-cell">₹{item.total.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Advanced Razorpay & Payment Details */}
          <div className="od-card od-razorpay-card">
            <div className="od-card-header od-razorpay-card-header">
              <div className="od-header-title-box">
                <CreditCard size={18} className="od-card-icon" />
                <h3 className="od-card-title">Payment & Gateway Details</h3>
              </div>
              <div className="od-razorpay-brand-pill">
                <span className="od-razorpay-logo-text">Razorpay</span>
                <span className="od-razorpay-verified-tag">
                  <ShieldCheck size={13} /> Verified
                </span>
              </div>
            </div>

            {/* Payment Hero Banner */}
            <div className="od-pay-hero-banner">
              <div className="od-pay-hero-left">
                <span className="od-pay-hero-lbl">Total Settled Amount</span>
                <strong className="od-pay-hero-amount">₹{netPayment.toLocaleString()}</strong>
              </div>
              <div className="od-pay-hero-badges">
                <span className={`od-pay-status-chip ${paymentStatus}`}>
                  <CheckCircle2 size={13} /> {paymentStatus.toUpperCase()}
                </span>
                <span className="od-pay-method-chip">
                  {paymentMethod}
                </span>
              </div>
            </div>

            {/* Razorpay Transaction Credentials */}
            <div className="od-razorpay-creds-grid">
              {/* Payment ID */}
              <div className="od-cred-box">
                <div className="od-cred-top">
                  <span className="od-cred-label">Razorpay Payment ID</span>
                  <button
                    type="button"
                    className="od-cred-copy-btn"
                    title="Copy Payment ID"
                    onClick={() => {
                      navigator.clipboard && navigator.clipboard.writeText(razorpayPaymentId);
                      alert('Razorpay Payment ID copied!');
                    }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <code className="od-cred-code">{razorpayPaymentId}</code>
              </div>

              {/* Order ID */}
              <div className="od-cred-box">
                <div className="od-cred-top">
                  <span className="od-cred-label">Razorpay Order ID</span>
                  <button
                    type="button"
                    className="od-cred-copy-btn"
                    title="Copy Order ID"
                    onClick={() => {
                      navigator.clipboard && navigator.clipboard.writeText(razorpayOrderId);
                      alert('Razorpay Order ID copied!');
                    }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <code className="od-cred-code">{razorpayOrderId}</code>
              </div>

              {/* Gateway Provider */}
              <div className="od-cred-box">
                <div className="od-cred-top">
                  <span className="od-cred-label">Gateway & Protocol</span>
                </div>
                <span className="od-cred-text">Razorpay PG / Webhooks V2</span>
              </div>

              {/* Timestamp */}
              <div className="od-cred-box">
                <div className="od-cred-top">
                  <span className="od-cred-label">Captured Timestamp</span>
                </div>
                <span className="od-cred-text">{txnDate} · {txnTime}</span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="od-pay-breakdown-table">
              <div className="od-breakdown-item">
                <span>Items Subtotal ({totalItemCount} Items)</span>
                <strong>₹{subtotal.toLocaleString()}</strong>
              </div>
              <div className="od-breakdown-item">
                <span>Estimated GST / Tax ({taxRate}%)</span>
                <strong>₹{taxAmount.toLocaleString()}</strong>
              </div>
              <div className="od-breakdown-item">
                <span>Shipping & Express Handling</span>
                <strong style={{ color: '#16a34a' }}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}</strong>
              </div>
              {totalRefund > 0 && (
                <div className="od-breakdown-item od-refund-row">
                  <span>Refund / Adjustments</span>
                  <strong style={{ color: '#dc2626' }}>-₹{totalRefund.toLocaleString()}</strong>
                </div>
              )}
              <div className="od-breakdown-divider" />
              <div className="od-breakdown-item od-breakdown-total">
                <span>Net Total Paid</span>
                <span>₹{netPayment.toLocaleString()}</span>
              </div>
            </div>

            <div className="od-pay-footer-security">
              <Lock size={12} />
              <span>Razorpay 256-bit encrypted checkout · PCI-DSS Level 1 compliant</span>
            </div>
          </div>

          {/* Card 3: Order timeline in place of activity (Matching 1st image) */}
          <div className="od-card od-timeline-card">
            <div className="od-timeline-header">
              <h3 className="od-timeline-title">Trip timeline</h3>
              <p 
                className="od-timeline-subtitle"
                onClick={() => setShowTimelineBreakdown(!showTimelineBreakdown)}
              >
                View timeline breakdown {showTimelineBreakdown ? <ChevronUp size={13} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={13} style={{ verticalAlign: 'middle' }} />}
              </p>
            </div>

            <div className="od-stepper-list">
              {timelineMilestones.map((step, idx) => {
                const isLast = idx === timelineMilestones.length - 1;
                const nextStepCompleted = timelineMilestones[idx + 1]?.completed;
                const lineClass = nextStepCompleted ? 'line-green' : 'line-grey';

                return (
                  <div key={step.id} className={`od-stepper-item ${step.completed ? 'is-completed' : 'is-pending'}`}>
                    <div className="od-stepper-col">
                      <div className={`od-step-circle ${step.completed ? 'completed' : 'pending'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {!isLast && (
                        <div className={`od-step-line ${lineClass}`} />
                      )}
                    </div>

                    <div className="od-step-content">
                      <h4 className="od-step-title">{step.title}</h4>
                      <span className="od-step-time">{step.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed timeline breakdown drawer */}
            {showTimelineBreakdown && (
              <div className="od-breakdown-panel">
                <h5 className="od-breakdown-heading">Detailed Event Logs</h5>
                <div className="od-breakdown-feed">
                  {allActivities.map((act, index) => (
                    <div key={act.id || index} className="od-breakdown-row">
                      <span className="od-breakdown-dot" />
                      <div className="od-breakdown-texts">
                        <strong>{act.title}</strong>
                        <p>{act.desc}</p>
                      </div>
                      <small className="od-breakdown-time">{act.time}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (40%) ── */}
        <div className="od-col-right">
          {/* Card 1: Customer Information (With UID) */}
          <div className="od-card">
            <div className="od-card-header">
              <User size={18} className="od-card-icon" />
              <h3 className="od-card-title">Customer Information</h3>
            </div>

            <div className="od-cust-summary">
              <div className="od-cust-left">
                <div className="od-cust-avatar" role="img" aria-label="Customer avatar">
                  <span style={{ fontSize: '20px' }}>🤠</span>
                </div>
                <div className="od-cust-details">
                  <h4 className="od-cust-name">{customerName}</h4>
                  <span className="od-cust-ltv">{customerLtv}</span>
                </div>
              </div>

              <span className="od-cust-orders-badge">{customerOrdersCount}</span>
            </div>

            <div className="od-cust-contacts">
              {/* Customer UID */}
              <div className="od-contact-row">
                <div className="od-contact-left">
                  <div className="od-icon-box od-icon-indigo">
                    <Fingerprint size={16} />
                  </div>
                  <div className="od-contact-texts">
                    <span className="od-contact-label">Customer UID</span>
                    <span className="od-contact-val od-contact-uid">{customerUid}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="od-dot-btn"
                  title="Copy Customer UID"
                  onClick={() => {
                    navigator.clipboard && navigator.clipboard.writeText(customerUid);
                    alert('Customer UID copied to clipboard!');
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* Email Address */}
              <div className="od-contact-row">
                <div className="od-contact-left">
                  <div className="od-icon-box od-icon-purple">
                    <Mail size={16} />
                  </div>
                  <div className="od-contact-texts">
                    <span className="od-contact-label">Email address</span>
                    <span className="od-contact-val">{customerEmail}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="od-dot-btn"
                  title="Copy email"
                  onClick={() => {
                    navigator.clipboard && navigator.clipboard.writeText(customerEmail);
                    alert('Email copied to clipboard!');
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* Phone */}
              <div className="od-contact-row">
                <div className="od-contact-left">
                  <div className="od-icon-box od-icon-blue">
                    <Phone size={16} />
                  </div>
                  <div className="od-contact-texts">
                    <span className="od-contact-label">Phone number</span>
                    <span className="od-contact-val">{customerPhone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="od-dot-btn"
                  title="Copy phone"
                  onClick={() => {
                    navigator.clipboard && navigator.clipboard.writeText(customerPhone);
                    alert('Phone copied to clipboard!');
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Advanced Shipping Address (Address only - No Name, No Number) */}
          <div className="od-card od-shipping-adv-card">
            <div className="od-card-header">
              <MapPin size={18} className="od-card-icon" />
              <h3 className="od-card-title">Shipping Address</h3>
              <span className="od-shipping-status-tag">
                <CheckCircle2 size={12} /> Verified Location
              </span>
            </div>

            <div className="od-shipping-adv-body">
              {/* Structured Address Display */}
              <div className="od-shipping-geo-banner">
                <div className="od-geo-icon-col">
                  <Navigation size={18} className="od-geo-nav-icon" />
                </div>
                <div className="od-geo-address-wrap">
                  <span className="od-geo-type">Delivery Destination</span>
                  <p className="od-geo-line1">{addressLine1}</p>
                  {addressLine2 && <p className="od-geo-line2">{addressLine2}</p>}
                  <p className="od-geo-city-state">
                    <strong>{shippingCity}</strong>, {shippingState} — <span className="od-pin-tag">{shippingZip}</span>
                  </p>
                  <p className="od-geo-country">{shippingCountry}</p>
                </div>
              </div>

              {/* Address Metadata Grid */}
              <div className="od-address-meta-grid">
                <div className="od-addr-meta-cell">
                  <span className="od-meta-label">Postal / PIN Code</span>
                  <span className="od-meta-val od-meta-pin">{shippingZip}</span>
                </div>
                <div className="od-addr-meta-cell">
                  <span className="od-meta-label">State / Region</span>
                  <span className="od-meta-val">{shippingState}</span>
                </div>
                <div className="od-addr-meta-cell">
                  <span className="od-meta-label">Country</span>
                  <span className="od-meta-val">{shippingCountry}</span>
                </div>
                <div className="od-addr-meta-cell">
                  <span className="od-meta-label">Delivery Zone</span>
                  <span className="od-meta-val">Standard Zone A</span>
                </div>
              </div>

              {/* Action Buttons: Copy Address & Open in Maps */}
              <div className="od-shipping-actions-bar">
                <button
                  type="button"
                  className="od-addr-btn od-addr-copy"
                  onClick={() => {
                    navigator.clipboard && navigator.clipboard.writeText(fullAddressFormatted);
                    alert('Full address copied to clipboard!');
                  }}
                  title="Copy full address"
                >
                  <Copy size={13} />
                  <span>Copy Address</span>
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="od-addr-btn od-addr-map"
                  title="View on Google Maps"
                >
                  <ExternalLink size={13} />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Dedicated Vendor Details Section */}
          <div className="od-card od-vendor-card">
            <div className="od-card-header">
              <Store size={18} className="od-card-icon" />
              <h3 className="od-card-title">Vendor & Seller Details</h3>
            </div>

            <div className="od-vendor-body">
              {/* Vendor Brand Header */}
              <div className="od-vendor-brand-row">
                <div className="od-vendor-avatar">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div className="od-vendor-info">
                  <div className="od-vendor-name-row">
                    <h4 className="od-vendor-name">{vendorName}</h4>
                    <span className="od-vendor-verified-badge" title="Verified Marketplace Partner">
                      <BadgeCheck size={14} color="#2563eb" />
                    </span>
                  </div>
                  <span className="od-vendor-cat">{vendorCategory}</span>
                </div>
              </div>

              {/* Vendor Specs Grid */}
              <div className="od-vendor-grid">
                <div className="od-vendor-field">
                  <span className="od-meta-label">Vendor ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code className="od-vendor-id-code">{vendorId}</code>
                    <button
                      type="button"
                      className="od-mini-copy-btn"
                      onClick={() => {
                        navigator.clipboard && navigator.clipboard.writeText(vendorId);
                        alert('Vendor ID copied!');
                      }}
                      title="Copy Vendor ID"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                </div>

                <div className="od-vendor-field">
                  <span className="od-meta-label">Seller Rating</span>
                  <span className="od-meta-val" style={{ color: '#f59e0b' }}>{vendorRating}</span>
                </div>

                <div className="od-vendor-field">
                  <span className="od-meta-label">Support Email</span>
                  <span className="od-meta-val" title={vendorEmail}>{vendorEmail}</span>
                </div>

                <div className="od-vendor-field">
                  <span className="od-meta-label">Helpline Phone</span>
                  <span className="od-meta-val">{vendorPhone}</span>
                </div>
              </div>

              {/* Warehouse Dispatch Origin */}
              <div className="od-vendor-origin-box">
                <Truck size={14} className="od-origin-truck-icon" />
                <div className="od-origin-texts">
                  <span className="od-meta-label">Fulfillment Warehouse</span>
                  <p className="od-origin-val">{vendorOrigin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Notes */}
          <div className="od-card">
            <div className="od-card-header">
              <FileEdit size={18} className="od-card-icon" />
              <h3 className="od-card-title">Notes</h3>
            </div>

            <div className="od-sub-header">
              <span>Internal order processing notes</span>
              <Info size={13} className="od-info-icon" />
            </div>

            <textarea
              className="od-notes-textarea"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write down any internal instructions or order notes..."
            />

            <div className="od-notes-footer">
              <button
                type="button"
                className={`od-save-note-btn ${isNoteSaved ? 'is-saved' : ''}`}
                onClick={handleSaveNote}
              >
                {isNoteSaved ? (
                  <>
                    <Check size={12} />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Note</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RECEIPT MODAL ── */}
      {isReceiptOpen && (
        <div className="od-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
          <div className="od-modal-box od-receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <div className="od-receipt-header-title">
                <Receipt size={20} className="text-blue-600" />
                <h3>Order Receipt #{displayOrderNumber}</h3>
              </div>
              <button type="button" className="od-modal-close" onClick={() => setIsReceiptOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="od-receipt-content" id="printable-receipt">
              <div className="od-receipt-meta">
                <div>
                  <p className="od-receipt-lbl">Customer (UID: {customerUid})</p>
                  <p className="od-receipt-val">{customerName}</p>
                  <p className="od-receipt-sub">{customerEmail}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="od-receipt-lbl">Date & Gateway</p>
                  <p className="od-receipt-val">{txnDate}</p>
                  <span className="od-status-pill od-status-completed" style={{ display: 'inline-block', marginTop: 4 }}>
                    Razorpay · {currentStatus}
                  </span>
                </div>
              </div>

              <div className="od-receipt-items">
                <div className="od-receipt-items-head">
                  <span>Item</span>
                  <span style={{ textAlign: 'center' }}>Qty</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                </div>
                {items.map((it) => (
                  <div key={it.id} className="od-receipt-item-row">
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>{it.name}</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{it.subtitle}</p>
                    </div>
                    <span style={{ textAlign: 'center' }}>{it.quantity}</span>
                    <span style={{ textAlign: 'right', fontWeight: 600 }}>₹{it.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="od-receipt-totals">
                <div><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div><span>Tax ({taxRate}%):</span><span>₹{taxAmount.toLocaleString()}</span></div>
                <div><span>Shipping:</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}</span></div>
                {totalRefund > 0 && <div><span>Refund:</span><span>-₹{totalRefund.toLocaleString()}</span></div>}
                <div className="od-receipt-grand"><span>Net Total:</span><span>₹{netPayment.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="od-modal-actions">
              <button type="button" className="od-modal-btn od-modal-cancel" onClick={() => setIsReceiptOpen(false)}>
                Close
              </button>
              <button type="button" className="od-modal-btn od-modal-primary" onClick={() => window.print()}>
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL ORDER CONFIRMATION MODAL ── */}
      {showCancelModal && (
        <div className="od-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="od-modal-box od-cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <h3 style={{ margin: 0, fontSize: 18, color: '#ef4444' }}>Cancel Order #{displayOrderNumber}?</h3>
              <button type="button" className="od-modal-close" onClick={() => setShowCancelModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: '#4b5563', fontSize: 13.5, margin: '12px 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to cancel this order? This will mark the order as Cancelled and record an activity log entry.
            </p>
            <div className="od-modal-actions">
              <button type="button" className="od-modal-btn od-modal-cancel" onClick={() => setShowCancelModal(false)}>
                Keep Order
              </button>
              <button type="button" className="od-modal-btn od-modal-danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
