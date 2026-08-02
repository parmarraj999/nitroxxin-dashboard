import React from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Download, FileText, Filter, PackageCheck, Search, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { toDate } from '../../services/firebaseUtils';
import './OrderManagement.css';

const statusOptions = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'returned', 'cancelled'];
const statusLabel = (status) => status === 'all' ? 'All Orders' : status.replace(/\b\w/g, (letter) => letter.toUpperCase());

const OrderManagement = () => {
  const navigate = useNavigate();
  const { orders, loading, updateOrderStatus } = useOrders();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const baseRows = orders.map((order) => {
    const created = toDate(order.createdAt);
    const status = order.status || 'pending';
    const statusClass = status === 'delivered' ? 'status-delivered' : status === 'shipped' ? 'status-transit' : status === 'packed' ? 'status-ready' : status === 'cancelled' || status === 'returned' ? 'status-cancelled' : 'status-pending';

    return {
      id: order.id,
      date: created ? created.toLocaleDateString() : 'Pending',
      time: created ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      customer: order.customer?.name || order.customerName || 'Customer',
      email: order.customer?.email || order.customerEmail || '',
      items: order.items || [{ name: `${order.itemCount || 1} item(s)`, qty: order.itemCount || 1, img: '#111827' }],
      total: `Rs. ${Number(order.total || order.totalAmount || 0).toLocaleString()}`,
      rawTotal: Number(order.total || order.totalAmount || 0),
      status: statusLabel(status),
      rawStatus: status,
      statusClass,
      country: order.shippingAddress?.country || order.shippingAddress?.state || 'India',
      payment: order.payment?.status || order.paymentStatus || 'paid',
      courier: order.tracking?.courier || order.courier || 'Not assigned'
    };
  });

  const rows = baseRows.filter((order) => {
    const haystack = `${order.id} ${order.customer} ${order.email} ${order.status} ${order.courier}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (statusFilter === 'all' || order.rawStatus === statusFilter);
  });

  const moveStatus = async (event, orderId, status) => {
    event.stopPropagation();
    await updateOrderStatus(orderId, status, `Updated from order management to ${status}`);
  };

  return (
    <div className="order-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, fulfill, invoice, ship, return, and refund marketplace orders.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn"><Download size={16} /> Export Data</button>
        </div>
      </div>

      <div className="orders-container card">
        <div className="table-tabs">
          {statusOptions.map((status) => (
            <button key={status} className={`tab ${statusFilter === status ? 'active' : ''}`} onClick={() => setStatusFilter(status)}>
              {statusLabel(status)} ({status === 'all' ? baseRows.length : baseRows.filter((item) => item.rawStatus === status).length})
            </button>
          ))}
        </div>

        <div className="orders-filters">
          <div className="filter-group-left">
            <div className="filter-select-wrapper">
              <select><option>Date Range: Last 30 Days</option><option>Today</option><option>This Week</option><option>This Month</option></select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <div className="filter-select-wrapper">
              <select><option>Location: All Regions</option><option>India</option><option>Metro Cities</option><option>International</option></select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <button className="export-btn" style={{ padding: '10px' }}><Filter size={16} /> More Filters</button>
          </div>

          <div className="search-wrapper">
            <Search size={16} className="search-icon-small" />
            <input type="text" placeholder="Search order ID, customer, email, courier..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th className="checkbox-col"><input type="checkbox" /></th>
                <th>ORDER</th>
                <th>DATE & TIME</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>COURIER</th>
                <th className="actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="empty-table-state">
                      <h3>No orders found</h3>
                      <p>Adjust filters or wait for new marketplace orders to arrive.</p>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((order) => (
                <tr key={order.id} className="order-row" onClick={() => navigate(`/orders/details/${order.id}`)}>
                  <td className="checkbox-col" onClick={(event) => event.stopPropagation()}><input type="checkbox" /></td>
                  <td><span className="order-id-link">{order.id}</span></td>
                  <td><div className="date-time-cell"><span className="date-text">{order.date}</span><span className="time-text">{order.time}</span></div></td>
                  <td><div className="customer-cell"><span className="customer-name">{order.customer}</span><span className="customer-email">{order.email}</span></div></td>
                  <td>
                    <div className="items-preview">
                      {order.items.map((item, index) => (
                        <div key={index} className="item-mini" title={item.name}>
                          <div className="item-mini-img" style={{ backgroundColor: item.img || '#111827', backgroundImage: item.image ? `url(${item.image})` : undefined }}></div>
                          {(item.qty || item.quantity || 1) > 1 && <span className="item-mini-qty">x{item.qty || item.quantity}</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td><span className="price-bold">{order.total}</span></td>
                  <td><span className={`order-status-badge ${order.statusClass}`}>{order.status}</span></td>
                  <td><span className="courier-pill">{order.courier}</span></td>
                  <td className="actions-col" onClick={(event) => event.stopPropagation()}>
                    <div className="row-actions-text">
                      <button className="text-btn"><FileText size={14} /> Invoice</button>
                      {order.rawStatus === 'pending' && <button className="text-btn" onClick={(event) => moveStatus(event, order.id, 'confirmed')}><CheckCircle2 size={14} /> Confirm</button>}
                      {order.rawStatus === 'confirmed' && <button className="text-btn" onClick={(event) => moveStatus(event, order.id, 'packed')}><PackageCheck size={14} /> Pack</button>}
                      {order.rawStatus === 'packed' && <button className="text-btn" onClick={(event) => moveStatus(event, order.id, 'shipped')}><Truck size={14} /> Ship</button>}
                      <button className="text-btn text-orange" onClick={() => navigate(`/orders/details/${order.id}`)}>Details <ChevronRight size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer">
          <span className="showing-text">Showing {rows.length ? 1 : 0}-{rows.length} of {rows.length} orders</span>
        </div>
      </div>

      <div className="order-metrics-grid">
        <div className="metric-card card">
          <h4 className="metric-title">FULFILLMENT SPEED</h4>
          <span className="metric-value">1.2 Days</span>
          <span className="metric-desc text-success">15% faster than last month</span>
        </div>
        <div className="metric-card card">
          <h4 className="metric-title">PENDING SHIPMENTS</h4>
          <div className="metric-value-flex"><span className="metric-value">{baseRows.filter((item) => ['pending', 'confirmed', 'packed'].includes(item.rawStatus)).length}</span><span className="metric-sub">orders</span></div>
          <button className="action-link" onClick={() => setStatusFilter('pending')}>Process now</button>
        </div>
        <div className="metric-card card">
          <h4 className="metric-title">ORDER VALUE</h4>
          <div className="metric-value-flex"><span className="metric-value">Rs. {baseRows.reduce((sum, item) => sum + item.rawTotal, 0).toLocaleString()}</span></div>
          <span className="metric-desc text-muted">{new Set(baseRows.map((item) => item.country).filter(Boolean)).size || 1} active regions</span>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
