import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Hash,
  User,
  Package,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  Phone,
  Eye,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useOrdersContext } from '../../context/OrdersContext';
import { toDate } from '../../services/firebaseUtils';
import './RecentOrdersTable.css';

const formatAddress = (order) => {
  const addr = order.shippingAddress || order.address || {};
  if (typeof addr === 'string' && addr.trim()) return addr;
  const parts = [
    addr.line1 || addr.addressLine1 || addr.street,
    addr.city,
    addr.state,
    addr.postalCode || addr.pincode
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '654 Cedar Boulevard, Lakeview, FL 32123';
};

const RecentOrdersTable = ({ analytics }) => {
  const navigate = useNavigate();
  const ordersCtx = useOrdersContext();
  const [updatingId, setUpdatingId] = useState(null);

  const contextOrders = ordersCtx?.orders || [];
  const loading = ordersCtx?.loading || false;
  const changeOrderStatus = ordersCtx?.changeOrderStatus;

  const allOrders = contextOrders.length > 0 ? contextOrders : (analytics?.orders || []);

  const recentOrders = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return [];
    return allOrders.slice(0, 5).map((order, idx) => {
      const created = toDate(order.createdAt);
      const rawStatus = (order.status || 'pending').toLowerCase();

      let statusClass = 'status-pill-pending';
      let statusDisplay = 'Pending';
      let nextAction = { label: 'Approve', nextStatus: 'confirmed' };

      if (rawStatus === 'confirmed') {
        statusClass = 'status-pill-ready';
        statusDisplay = 'Ready';
        nextAction = { label: 'Pack', nextStatus: 'packed' };
      } else if (rawStatus === 'packed') {
        statusClass = 'status-pill-preparing';
        statusDisplay = 'Preparing';
        nextAction = { label: 'Ship', nextStatus: 'shipped' };
      } else if (rawStatus === 'shipped') {
        statusClass = 'status-pill-shipped';
        statusDisplay = 'Shipped';
        nextAction = { label: 'Deliver', nextStatus: 'delivered' };
      } else if (rawStatus === 'delivered') {
        statusClass = 'status-pill-delivered';
        statusDisplay = 'Delivered';
        nextAction = null;
      } else if (rawStatus === 'cancelled' || rawStatus === 'returned') {
        statusClass = 'status-pill-cancelled';
        statusDisplay = rawStatus === 'returned' ? 'Returned' : 'Cancelled';
        nextAction = null;
      }

      const customerName = order.customer?.name || order.customerName || `Customer #${(order.id || '').slice(0, 5) || (idx + 1)}`;
      const customerPhone = order.customer?.phone || order.customerPhone || order.shippingAddress?.phone || '+91 98765 43210';

      const items = order.items || [];
      const totalQty = items.length
        ? items.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0)
        : Number(order.itemCount || 1);
      const itemsText = items.length
        ? items.map((i) => i.name || i.title || 'Product').join(', ')
        : 'Accessories order';

      const shortId = order.orderID || (order.id ? (order.id.length > 8 ? order.id.slice(0, 7).toUpperCase() : order.id) : `ORD#${idx + 1}`);

      const rawPrice = Number(order.total || order.totalAmount || 0);
      const formattedPrice = rawPrice > 100 ? `Rs. ${rawPrice.toLocaleString()}` : `$${rawPrice.toFixed(2)}`;

      return {
        id: order.id,
        shortId,
        customerName,
        customerPhone,
        totalQty,
        itemsText,
        address: formatAddress(order),
        formattedPrice,
        statusDisplay,
        statusClass,
        nextAction,
        date: created ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        time: created ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'
      };
    });
  }, [allOrders]);

  const handleAdvanceStatus = async (e, orderId, nextStatus) => {
    e.stopPropagation();
    if (!orderId || !nextStatus || !changeOrderStatus) return;

    try {
      setUpdatingId(orderId);
      await changeOrderStatus(orderId, nextStatus, `Status updated to ${nextStatus} from Dashboard`);
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="card dashboard-table-card recent-orders-table-card">
      <div className="dashboard-table-header">
        <div className="table-header-left">
          <div className="table-title-badge-wrap">
            <h2 className="dashboard-table-title">Recent Orders</h2>
            <span className="orders-count-pill">Latest Orders</span>
          </div>
          {/* <p className="dashboard-table-subtitle">Recent orders placed across your store and fulfillment progress</p> */}
        </div>
        <div className="table-header-right">
          <Link to="/orders" className="dashboard-view-all-link">
            <span>View All Orders</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="orders-table-notion">
          <thead>
            <tr>
              <th className="th-col th-order-id">
                <div className="th-inner">
                  <Hash size={13} className="th-icon" />
                  <span>Order ID</span>
                </div>
              </th>
              <th className="th-col th-customer">
                <div className="th-inner">
                  <User size={13} className="th-icon" />
                  <span>Customer</span>
                </div>
              </th>
              <th className="th-col th-items">
                <div className="th-inner">
                  <Package size={13} className="th-icon" />
                  <span>Items No.</span>
                </div>
              </th>
              <th className="th-col th-address">
                <div className="th-inner">
                  <MapPin size={13} className="th-icon" />
                  <span>Address</span>
                </div>
              </th>
              <th className="th-col th-status">
                <div className="th-inner">
                  <Tag size={13} className="th-icon" />
                  <span>Status</span>
                </div>
              </th>
              <th className="th-col th-price">
                <div className="th-inner">
                  <DollarSign size={13} className="th-icon" />
                  <span>Price</span>
                </div>
              </th>
              <th className="th-col th-order-at">
                <div className="th-inner">
                  <Calendar size={13} className="th-icon" />
                  <span>Order At</span>
                </div>
              </th>
              <th className="th-col th-actions">
                <div className="th-inner">
                  <SlidersHorizontal size={13} className="th-icon" />
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && recentOrders.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="dashboard-empty-table-state">
                    <Loader2 size={22} className="spin-icon-inline" />
                    <p>Loading recent orders...</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && recentOrders.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="dashboard-empty-table-state">
                    <Package size={32} color="#94a3b8" style={{ marginBottom: '6px' }} />
                    <h3>No recent orders found</h3>
                    <p>New customer orders will appear here automatically.</p>
                  </div>
                </td>
              </tr>
            )}

            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="notion-row"
                onClick={() => navigate(`/orders/details/${order.id}`)}
              >
                {/* 1. Order ID */}
                <td className="td-col td-order-id">
                  <span className="order-id-code">{order.shortId}</span>
                </td>

                {/* 2. Customer Name with Phone */}
                <td className="td-col td-customer">
                  <div className="customer-info-stacked">
                    <span className="customer-full-name">{order.customerName}</span>
                    <span className="customer-phone-number">
                      <Phone size={10} className="phone-icon-inline" />
                      {order.customerPhone}
                    </span>
                  </div>
                </td>

                {/* 3. Items No. */}
                <td className="td-col td-items">
                  <div className="items-quantity-cell">
                    <span className="items-qty-badge">{order.totalQty}</span>
                    <span className="items-name-text" title={order.itemsText}>
                      {order.itemsText}
                    </span>
                  </div>
                </td>

                {/* 4. Address */}
                <td className="td-col td-address">
                  <div className="address-cell" title={order.address}>
                    <MapPin size={12} className="address-pin-icon" />
                    <span className="address-string">{order.address}</span>
                  </div>
                </td>

                {/* 5. Status Notion Pill */}
                <td className="td-col td-status">
                  <span className={`status-pill-notion ${order.statusClass}`}>
                    <span className="status-dot"></span>
                    {order.statusDisplay}
                  </span>
                </td>

                {/* 6. Price */}
                <td className="td-col td-price">
                  <span className="price-bold-text">{order.formattedPrice}</span>
                </td>

                {/* 7. Order At */}
                <td className="td-col td-order-at">
                  <div className="order-at-cell">
                    <span className="order-date-text">{order.date}</span>
                    <span className="order-time-text">{order.time}</span>
                  </div>
                </td>

                {/* 8. Actions */}
                <td className="td-col td-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="actions-flex-container">
                    {order.nextAction ? (
                      <button
                        className="btn-approve-modern"
                        disabled={updatingId === order.id}
                        onClick={(e) =>
                          handleAdvanceStatus(
                            e,
                            order.id,
                            order.nextAction.nextStatus
                          )
                        }
                        title={`Click to mark as ${order.nextAction.nextStatus}`}
                      >
                        {updatingId === order.id ? (
                          <Loader2 size={11} className="spin-icon-inline" />
                        ) : (
                          <Check size={11} strokeWidth={2.5} />
                        )}
                        {order.nextAction.label}
                      </button>
                    ) : (
                      <span className="action-completed-label">
                        <CheckCircle2 size={12} color="#10b981" />
                        Done
                      </span>
                    )}

                    <button
                      type="button"
                      className="btn-view-modern"
                      onClick={() => navigate(`/orders/details/${order.id}`)}
                      title="View order details"
                    >
                      <Eye size={13} />
                    </button>
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

export default RecentOrdersTable;

