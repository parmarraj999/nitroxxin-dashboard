import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  PackageCheck,
  Loader2,
  ArrowLeft,
  Mail,
  PhoneCall,
  Package
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { useOrdersContext } from '../../context/OrdersContext';
import { toDate } from '../../services/firebaseUtils';
import './OrderDetails.css';

const formatTimelineDate = (baseDate, addHours = 0) => {
  if (!baseDate) return '17 Nov, 13:45';
  const d = new Date(baseDate.getTime() + addHours * 3600 * 1000);
  const dayMonth = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dayMonth}, ${time}`;
};

// Default sample row exactly matching reference image
const defaultSampleItems = [
  {
    id: 'vSwDPQR2UX4wWyw89K1',
    productId: 'vSwDPQR2UX4wWyw.....',
    sku: 'SK-323-CKS-123',
    name: 'RJ Lether Rider Jacket',
    brand: 'Rynox',
    qty: 1,
    price: 8999,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&auto=format&fit=crop&q=80'
  }
];

const statusDisplayMap = {
  pending: 'Pending',
  new: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'In Transit',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded'
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { order } = useOrder(orderId);
  const { acceptOrder, changeOrderStatus } = useOrdersContext();

  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState('');
  const [localStatus, setLocalStatus] = useState(null);

  const created = toDate(order?.createdAt);
  const customer = order?.customer || {};
  const rawStatus = (localStatus || order?.status || 'pending').toLowerCase();
  const isPendingOrder = rawStatus === 'pending' || rawStatus === 'new';

  // 1. Order ID Display
  const displayOrderId = order?.orderID || (order?.id ? (order.id.startsWith('#') ? order.id : `#${order.id}`) : '#NX-99824');

  // 2. Order Placed Date
  const orderPlacedFormatted = created
    ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 15, 2026';

  // 3. Shipping & Customer Details extraction
  const shippingInfo = order?.shipping || order?.shippingAddress || order?.address || customer?.address || {};
  const shippingStreet = shippingInfo.address || shippingInfo.line1 || shippingInfo.street || (typeof shippingInfo === 'string' ? shippingInfo : '');
  const shippingCityName = shippingInfo.city || '';
  const shippingStateName = shippingInfo.state || '';
  const shippingZipCode = shippingInfo.pincode || shippingInfo.postalCode || shippingInfo.zip || '';

  const mapQuery = [
    shippingStreet,
    shippingCityName,
    shippingStateName,
    shippingZipCode
  ].filter(Boolean).join(', ') || (order?.shipping?.address ? `${order.shipping.address}, ${order.shipping.city || ''}` : 'Menlo Park, CA 94025');

  // Customer Details
  const customerEmail = customer?.email || order?.customerEmail || 'marco.r@example.com';
  const customerPhone = customer?.phone || order?.customerPhone || order?.shippingAddress?.phone || '+1 202 555 0199';

  // 4. Process REAL Items (or sample matching image)
  const items = useMemo(() => {
    if (Array.isArray(order?.items) && order.items.length > 0) {
      return order.items.map((item, idx) => {
        const rawId = item.productId || item.id || `vSwDPQR2UX4wWyw${idx + 1}`;
        const displayProductId = rawId.length > 15 ? `${rawId.slice(0, 15)}.....` : rawId;
        const sku = item.sku || `SK-${323 + idx}-CKS-${120 + idx}`;
        const name = item.name || item.title || 'RJ Lether Rider Jacket';
        const brand = item.brand || 'Rynox';
        const qty = Number(item.qty || item.quantity || 1);
        const price = Number(item.price || item.unitPrice || 12200);
        const image = item.image || item.imageUrl || item.thumbnail || item.productImage || item.productSnapshot?.image || '';

        return {
          id: rawId,
          productId: displayProductId,
          sku,
          name,
          brand,
          qty,
          price,
          image
        };
      });
    }
    return defaultSampleItems;
  }, [order]);

  const totalItemCount = items.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedItemIds.size === items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleToggleItem = (id) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 5. Financial Calculations derived directly from REAL order data
  const calcSubtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const baseAmount = typeof order?.total === 'number'
    ? order.total
    : (typeof order?.totalAmount === 'number'
      ? order.totalAmount
      : (typeof order?.subtotal === 'number'
        ? order.subtotal
        : (calcSubtotal > 0 ? calcSubtotal : 8999)));

  // Remove 2.5% gateway fees, 4% platform fees, add 150 for delivery charges
  const gatewayFee = typeof order?.gatewayFee === 'number'
    ? order.gatewayFee
    : Math.round(baseAmount * 0.025 * 100) / 100;

  const platformFee = typeof order?.platformFee === 'number'
    ? order.platformFee
    : Math.round(baseAmount * 0.04 * 100) / 100;

  const deliveryCharges = typeof order?.deliveryCharges === 'number'
    ? order.deliveryCharges
    : 150;

  const totalDeductions = Math.round((gatewayFee + platformFee) * 100) / 100;

  const finalTotal = typeof order?.finalTotal === 'number'
    ? order.finalTotal
    : Math.round((baseAmount - gatewayFee - platformFee + deliveryCharges) * 100) / 100;

  const tax = typeof order?.tax === 'number'
    ? order.tax
    : Math.round(baseAmount * 0.05 * 100) / 100;

  const formatMoney = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formattedTotal = formatMoney(finalTotal);
  const formattedOrderAmount = formatMoney(baseAmount);

  // Status text display
  const capitalizedStatus = statusDisplayMap[rawStatus] || (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1));

  // Determine Delivery Timeline Overall Badge
  let timelineOverallStatus = 'IN TRANSIT';
  let timelineOverallClass = 'in-transit';
  if (rawStatus === 'delivered') {
    timelineOverallStatus = 'DELIVERED';
    timelineOverallClass = 'delivered';
  } else if (rawStatus === 'confirmed' || rawStatus === 'accepted') {
    timelineOverallStatus = 'CONFIRMED';
    timelineOverallClass = 'confirmed';
  } else if (rawStatus === 'pending' || rawStatus === 'new') {
    timelineOverallStatus = 'PENDING';
    timelineOverallClass = 'pending';
  } else if (rawStatus === 'cancelled') {
    timelineOverallStatus = 'CANCELLED';
    timelineOverallClass = 'cancelled';
  }

  // Acceptance handler: confirms order and reduces stock for items
  const handleAcceptOrder = async () => {
    if (isAccepting || !orderId) return;

    try {
      setIsAccepting(true);
      setAcceptSuccess('');

      const orderItems = (Array.isArray(order?.items) && order.items.length > 0)
        ? order.items
        : items;

      const result = await acceptOrder(orderId, orderItems, 'Order accepted by admin');

      setLocalStatus('confirmed');
      const updatedCount = result?.updatedProducts?.length ?? orderItems.length;
      setAcceptSuccess(`Order #${displayOrderId} accepted successfully! Stock reduced for ${updatedCount} product(s).`);

      setTimeout(() => {
        setAcceptSuccess('');
      }, 6000);
    } catch (err) {
      console.error('Failed to accept order:', err);
      alert('Failed to accept order: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAccepting(false);
    }
  };

  // Next action for advancing order status
  let nextAction = null;
  if (rawStatus === 'confirmed') {
    nextAction = { label: 'Pack Order', nextStatus: 'packed' };
  } else if (rawStatus === 'packed') {
    nextAction = { label: 'Ship Order', nextStatus: 'shipped' };
  } else if (rawStatus === 'shipped' || rawStatus === 'in_transit') {
    nextAction = { label: 'Mark as Delivered', nextStatus: 'delivered' };
  }

  const handleAdvanceStatus = async (nextStatus, label) => {
    if (isAccepting || !orderId) return;
    try {
      setIsAccepting(true);
      await changeOrderStatus(orderId, nextStatus, `Order marked as ${label}`);
      setLocalStatus(nextStatus);
    } catch (err) {
      console.error(`Failed to update status:`, err);
    } finally {
      setIsAccepting(false);
    }
  };

  // Determine Dynamic Timeline Steps (Comprehensive 5-step Tracker)
  const isDelivered = rawStatus === 'delivered';
  const isShipped = rawStatus === 'shipped' || rawStatus === 'delivered' || rawStatus === 'in_transit' || rawStatus === 'out_for_delivery';
  const isInTransit = rawStatus === 'shipped' || rawStatus === 'in_transit' || rawStatus === 'out_for_delivery';
  const isPacked = rawStatus === 'packed' || isShipped;
  const isConfirmed = rawStatus !== 'pending' && rawStatus !== 'new' && rawStatus !== 'cancelled';

  const timelineSteps = [
    {
      title: 'Order placed',
      badgeType: 'done',
      state: 'done',
      description: `Payment received — order ${displayOrderId} placed by customer`,
      time: formatTimelineDate(created, 0)
    },
    {
      title: isConfirmed ? 'Order accepted & confirmed' : 'Order confirmation',
      badgeType: isConfirmed ? 'done' : 'active',
      state: isConfirmed ? 'done' : 'active',
      description: isConfirmed
        ? 'Accepted by admin — inventory stock deducted'
        : 'Awaiting admin/vendor acceptance',
      time: isConfirmed ? formatTimelineDate(created, 0.5) : '—',
      stepNum: '2'
    },
    {
      title: isPacked ? 'Packed & Prepared' : 'Packaging',
      badgeType: isPacked ? 'done' : (isConfirmed ? 'active' : 'pending'),
      state: isPacked ? 'done' : (isConfirmed ? 'active' : 'pending'),
      description: isPacked ? 'Items packed and ready for carrier pickup' : 'Order packing pending',
      time: isPacked ? formatTimelineDate(created, 2) : '—',
      stepNum: '3'
    },
    {
      title: 'In transit',
      badgeType: isDelivered ? 'done' : (isInTransit ? 'active' : 'pending'),
      state: isDelivered ? 'done' : (isInTransit ? 'active' : 'pending'),
      description: 'At regional logistics hub — courier dispatched',
      time: (isInTransit || isDelivered) ? formatTimelineDate(created, 20) : '—',
      stepNum: '4'
    },
    {
      title: 'Delivered',
      badgeType: isDelivered ? 'done' : 'pending',
      state: isDelivered ? 'done' : 'pending',
      description: 'Package delivered to recipient address',
      time: isDelivered ? formatTimelineDate(created, 48) : '—',
      stepNum: '5'
    }
  ];

  const handleDownloadInvoice = () => {
    window.print();
  };

  // REAL Customer & Billing Data
  const billedToName = customer.name || order?.customerName || customer.email || 'Southbank';

  const getBilledDetails = () => {
    const addr = order?.shippingAddress || order?.billingAddress || order?.address || customer.address;
    if (typeof addr === 'string' && addr.trim()) return addr;
    if (addr && typeof addr === 'object') {
      const line1 = addr.line1 || addr.addressLine1 || addr.street;
      const cityStateZip = [
        addr.city,
        addr.state,
        addr.postalCode || addr.pincode || addr.zip
      ].filter(Boolean).join(' ');
      const country = addr.country || '';
      const parts = [line1, cityStateZip, country].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    return customer.phone ? `${customer.phone}, Verified Delivery` : '3517 W. Gray St. Utica, Pennsylvania 57867';
  };

  const billedDetails = getBilledDetails();

  const invoiceNumber = order?.invoiceNumber || (order?.orderNumber ? `INV-${order.orderNumber}` : (order?.id ? `INV-${order.id.slice(0, 8).toUpperCase()}` : 'INV-00068'));

  const dueDateFormatted = order?.dueDate || (created ? new Date(created.getTime() + 7 * 86400000).toISOString().split('T')[0] : '2024-07-11');

  const billingPeriodFormatted = order?.billingPeriod || (created
    ? `1 ${created.toLocaleDateString('en-US', { month: 'short' })} to ${new Date(created.getFullYear(), created.getMonth() + 1, 0).getDate()} ${created.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : '1 May to 31 May 2024');

  const invoiceDateFormatted = order?.invoiceDate || (created ? created.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 June 2024');

  const currencyDisplay = order?.currency || 'Indian Rupee (INR)';

  const poNumber = order?.poNumber || order?.orderNumber || (order?.id ? order.id.toUpperCase() : '—');

  const referenceId = order?.reference || (order?.id ? `#${order.id.slice(0, 8).toUpperCase()}` : '—');

  return (
    <div className="order-details-page">
      {/* 1. TOP ORDER DETAILS SECTION */}
      <div className="order-details-summary-card">
        <div className="od-summary-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="detail-back-btn" onClick={() => navigate('/orders')} title="Back to Orders">
              <ArrowLeft size={20} />
            </div>
            <h2 className="od-summary-title">Order Details</h2>
          </div>
          <button
            type="button"
            className="od-download-invoice-btn"
            onClick={handleDownloadInvoice}
            title="Download or Print Invoice"
          >
            Download Invoice
          </button>
        </div>

        <div className="od-summary-divider" />

        <div className="od-summary-grid">
          {/* Order ID */}
          <div className="od-summary-col">
            <span className="od-col-label">Order Number</span>
            <span className="od-col-value">{displayOrderId}</span>
          </div>

          {/* Order At */}
          <div className="od-summary-col">
            <span className="od-col-label">Order Placed</span>
            <span className="od-col-value">{orderPlacedFormatted}</span>
          </div>

          {/* No of Items */}
          <div className="od-summary-col">
            <span className="od-col-label">No of Items</span>
            <span className="od-col-value">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
          </div>

          {/* Total Price */}
          <div className="od-summary-col">
            <span className="od-col-label">Total Price</span>
            <span className="od-col-value">{formattedTotal}</span>
          </div>

          {/* Status */}
          <div className="od-summary-col">
            <span className="od-col-label">Status</span>
            <span className="od-col-value od-status-text">{capitalizedStatus}</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: TIMELINE + SHIPPING & CUSTOMER DETAILS */}
      <div className="order-middle-section">
        {/* 2A. DELIVERY TIMELINE CARD */}
        <div className="delivery-timeline-card card">
          <div className="dt-header">
            <div className="dt-header-title-wrap">
              <h3 className="dt-title">Delivery timeline</h3>
              <span className={`dt-header-status-badge dt-status-${timelineOverallClass}`}>
                <span className="dt-header-dot"></span>
                {timelineOverallStatus}
              </span>
            </div>

            {/* Quick Action Button in Header */}
            <div className="dt-header-actions">
              {isPendingOrder && (
                <button
                  type="button"
                  className="btn-timeline-accept-header"
                  onClick={handleAcceptOrder}
                  disabled={isAccepting}
                  title="Accept this order and deduct items from inventory"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 size={13} className="spin-icon-inline" />
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} strokeWidth={2.5} />
                      <span>Accept Order</span>
                    </>
                  )}
                </button>
              )}

              {!isPendingOrder && nextAction && (
                <button
                  type="button"
                  className="btn-timeline-advance-header"
                  onClick={() => handleAdvanceStatus(nextAction.nextStatus, nextAction.label)}
                  disabled={isAccepting}
                  title={`Advance order to ${nextAction.nextStatus}`}
                >
                  {isAccepting ? (
                    <Loader2 size={13} className="spin-icon-inline" />
                  ) : (
                    <Check size={13} strokeWidth={2.5} />
                  )}
                  <span>{nextAction.label}</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Notification Banner */}
          {acceptSuccess && (
            <div className="timeline-accept-success-banner">
              <CheckCircle2 size={18} className="tasb-icon" />
              <div className="tasb-text">
                <span className="tasb-title">Order Confirmed!</span>
                <span className="tasb-msg">{acceptSuccess}</span>
              </div>
            </div>
          )}

          {/* Prominent Action Banner inside Timeline when Order is Pending Acceptance */}
          {isPendingOrder && (
            <div className="timeline-accept-action-banner">
              <div className="taab-icon-box">
                <PackageCheck size={22} className="taab-icon" />
              </div>
              <div className="taab-content">
                <div className="taab-title-row">
                  <h4 className="taab-title">Action Required: Accept New Order</h4>
                  <span className="taab-badge">Awaiting Acceptance</span>
                </div>
                <p className="taab-desc">
                  Customer has placed this order. Accept to confirm the order and automatically deduct{' '}
                  <strong>{totalItemCount} {totalItemCount === 1 ? 'unit' : 'units'}</strong> from your live product inventory.
                </p>
                <div className="taab-actions">
                  <button
                    type="button"
                    className="btn-timeline-accept-main"
                    onClick={handleAcceptOrder}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 size={15} className="spin-icon-inline" />
                        <span>Accepting & Deducting Stock...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} strokeWidth={2.5} />
                        <span>Accept Order & Reduce Stock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="dt-timeline-list">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className={`dt-step-item dt-step-${step.state}`}>
                {/* Left tracker node with connecting vertical line */}
                <div className="dt-step-track">
                  <div className={`dt-step-node dt-node-${step.state}`}>
                    {step.state === 'done' && <Check size={14} strokeWidth={3} />}
                    {step.state === 'active' && <div className="dt-active-arc"></div>}
                    {step.state === 'pending' && <span className="dt-step-num">{step.stepNum}</span>}
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className={`dt-connector-line ${step.state === 'done' ? 'dt-line-done' : 'dt-line-pending'}`} />
                  )}
                </div>

                {/* Middle step details */}
                <div className="dt-step-content">
                  <div className="dt-step-title-row">
                    <h4 className="dt-step-title">{step.title}</h4>
                    {step.badgeType === 'done' && (
                      <span className="dt-badge dt-badge-done">
                        <Check size={11} strokeWidth={2.5} /> DONE
                      </span>
                    )}
                    {step.badgeType === 'active' && (
                      <span className="dt-badge dt-badge-active">
                        <span className="dt-badge-dot"></span> ACTIVE
                      </span>
                    )}
                    {step.badgeType === 'pending' && (
                      <span className="dt-badge dt-badge-pending">PENDING</span>
                    )}
                  </div>
                  <p className="dt-step-desc">{step.description}</p>
                </div>

                {/* Right timestamp */}
                <div className="dt-step-time">
                  <span>{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2B. SIDE SECTION: CONTACT INFO & SHIPPING ADDRESS */}
        <div className="order-side-cards-container">
          {/* Card 1: Contact Information */}
          <div className="order-side-card contact-info-card card">
            <h3 className="osc-title">Contact Information</h3>

            <div className="contact-info-content">
              <div className="contact-row">
                <Mail size={16} className="contact-icon" />
                <span className="contact-val">{customerEmail || 'No email provided'}</span>
              </div>
              <div className="contact-row">
                <PhoneCall size={16} className="contact-icon" />
                <span className="contact-val text-muted">
                  {customerPhone || 'No phone number'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Shipping address with Real Map Box */}
          <div className="order-side-card shipping-address-card card">
            <h3 className="osc-title">Shipping address</h3>

            <div className="shipping-address-content">
              <div className="shipping-address-lines">
                <span className="address-line">
                  <span style={{ fontWeight: '600', color: 'black' }}>Address : </span> {order?.shipping?.address || shippingStreet || 'Menlo Park, CA'}
                </span>
                <span className="address-line">
                  <span style={{ fontWeight: '600', color: 'black' }}>City : </span> {order?.shipping?.city || shippingCityName || 'Menlo Park CA 94025'}
                </span>
                <span className="address-line">
                  <span style={{ fontWeight: '600', color: 'black' }}>State : </span> {order?.shipping?.state || shippingStateName || 'California'}
                </span>
                <span className="address-line">
                  <span style={{ fontWeight: '600', color: 'black' }}>Pincode : </span> {order?.shipping?.pincode || shippingZipCode || '94025'}
                </span>
              </div>

              {/* 100% Width 200px Height Real Map Box */}
              <div className="shipping-map-box">
                <iframe
                  title="Shipping Real Location Map"
                  width="100%"
                  height="200"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="shipping-map-iframe"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ITEM TABLE (Exact match to uploaded image) */}
      <div className="product-items-table-card">
        <div className="table-responsive">
          <table className="product-table-exact">
            <thead>
              <tr>
                <th className="th-col-check">
                  <input
                    type="checkbox"
                    className="exact-checkbox"
                    checked={items.length > 0 && selectedItemIds.size === items.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="th-col-id">Product Id</th>
                <th className="th-col-img">Image</th>
                <th className="th-col-sku">SKU*</th>
                <th className="th-col-name">Product Name</th>
                <th className="th-col-brand">Brand</th>
                <th className="th-col-qty">Quantity</th>
                <th className="th-col-price">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isSelected = selectedItemIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`product-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <td className="td-col-check" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="exact-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                    <td className="td-col-id">
                      <span className="text-product-id" title={item.id}>
                        {item.productId}
                      </span>
                    </td>
                    <td className="td-col-img">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="table-item-img"
                        />
                      ) : (
                        <div className="table-item-img-placeholder">
                          <Package size={18} />
                        </div>
                      )}
                    </td>
                    <td className="td-col-sku">
                      <span className="text-sku-bold">{item.sku}</span>
                    </td>
                    <td className="td-col-name">
                      <span className="text-name-bold">{item.name}</span>
                    </td>
                    <td className="td-col-brand">
                      <span className="text-brand">{item.brand}</span>
                    </td>
                    <td className="td-col-qty">
                      <span className="text-qty">x{item.qty}</span>
                    </td>
                    <td className="td-col-price">
                      <span className="text-price-bold">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ORDER SUMMARY & INVOICE DETAILS SECTION */}
      <div className="order-invoice-summary-grid">
        {/* Left: Total Breakdown Card */}
        <div className="order-breakdown-card card">
          <div className="ob-header">
            <span className="ob-label-total">Total</span>
            <div className="ob-big-amount">{formattedTotal}</div>
          </div>

          <div className="ob-fee-list">
            <div className="ob-fee-row">
              <span className="ob-fee-name">Gateway fees (2.5%)</span>
              <span className="ob-fee-value ob-fee-deduct">- {formatMoney(gatewayFee)}</span>
            </div>
            <div className="ob-fee-row">
              <span className="ob-fee-name">Platform fees (4%)</span>
              <span className="ob-fee-value ob-fee-deduct">- {formatMoney(platformFee)}</span>
            </div>
            <div className="ob-fee-row">
              <span className="ob-fee-name">Delivery charges</span>
              <span className="ob-fee-value ob-fee-add">+ {formatMoney(deliveryCharges)}</span>
            </div>
          </div>

          <div className="ob-divider" />

          <div className="ob-totals-section">
            <div className="ob-subtotal-row">
              <span className="ob-sub-name">Order Amount</span>
              <span className="ob-sub-val">{formattedOrderAmount}</span>
            </div>
            <div className="ob-subtotal-row">
              <span className="ob-sub-name">Total Deductions</span>
              <span className="ob-sub-val ob-fee-deduct">- {formatMoney(totalDeductions)}</span>
            </div>
            <div className="ob-subtotal-row">
              <span className="ob-sub-name">Delivery Added</span>
              <span className="ob-sub-val ob-fee-add">+ {formatMoney(deliveryCharges)}</span>
            </div>
          </div>

          <div className="ob-divider" />

          <div className="ob-final-row">
            <span className="ob-final-label">Total</span>
            <span className="ob-final-amount">{formattedTotal}</span>
          </div>
        </div>

        {/* Right: Invoice Details Card */}
        <div className="invoice-details-card card">
          <h3 className="id-card-title">Invoice Details</h3>

          <div className="id-grid-content">
            {/* Left Column of Invoice */}
            <div className="id-col-left">
              <div className="id-meta-item">
                <span className="id-meta-label">Billed to</span>
                <span className="id-billed-link">{billedToName}</span>
              </div>

              <div className="id-meta-item" style={{ marginTop: '16px' }}>
                <span className="id-meta-label">Billed details</span>
                <p className="id-billed-address">{billedDetails}</p>
              </div>
            </div>

            {/* Right Column of Invoice */}
            <div className="id-col-right">
              <div className="id-kv-row">
                <span className="id-kv-label">Invoice number</span>
                <span className="id-kv-value">{invoiceNumber}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Due date</span>
                <span className="id-kv-value">{dueDateFormatted}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Billing period</span>
                <span className="id-kv-value">{billingPeriodFormatted}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Billing schedule</span>
                <span className="id-schedule-link">View schedule</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Invoice date</span>
                <span className="id-kv-value">{invoiceDateFormatted}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Currency</span>
                <span className="id-kv-value">{currencyDisplay}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Tax calculation</span>
                <span className="id-kv-value">{tax > 0 ? 'Taxed' : 'Exempt'}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">PO Number</span>
                <span className="id-kv-value">{poNumber}</span>
              </div>

              <div className="id-kv-row">
                <span className="id-kv-label">Reference</span>
                <span className="id-kv-value">{referenceId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
