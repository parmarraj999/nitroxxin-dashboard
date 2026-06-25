import React from 'react';
import { Download, Search, ChevronDown, FileText, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { toDate } from '../../services/firebaseUtils';
import './OrderManagement.css';

const OrderManagement = () => {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const rows = orders.map((order) => {
    const created = toDate(order.createdAt);
    const status = order.status || 'pending';
    const statusClass = status === 'delivered' ? 'status-delivered' : status === 'shipped' ? 'status-transit' : status === 'packed' ? 'status-ready' : 'status-pending';

    return {
      id: order.id,
      date: created ? created.toLocaleDateString() : 'Pending',
      time: created ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      customer: order.customer?.name || order.customerName || 'Customer',
      email: order.customer?.email || order.customerEmail || '',
      items: order.items || [{ name: `${order.itemCount || 1} item(s)`, qty: order.itemCount || 1, img: '#111827' }],
      total: `$${Number(order.total || order.totalAmount || 0).toFixed(2)}`,
      status: status.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      statusClass,
      country: order.shippingAddress?.country
    };
  });

  return (
    <div className="order-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, fulfill, and manage customer orders across all channels.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div className="orders-container card">

        <div className="table-tabs">
          <span className="tab active">All Orders ({loading ? '...' : rows.length})</span>
          <span className="tab">Pending ({rows.filter((item) => item.status.toLowerCase().includes('pending')).length})</span>
          <span className="tab">Ready to Ship ({rows.filter((item) => item.status.toLowerCase() === 'packed').length})</span>
          <span className="tab">In Transit ({rows.filter((item) => item.status.toLowerCase() === 'shipped').length})</span>
          <span className="tab">Delivered ({rows.filter((item) => item.status.toLowerCase() === 'delivered').length})</span>
          <span className="tab">Returned ({rows.filter((item) => item.status.toLowerCase() === 'returned').length})</span>
        </div>

        <div className="orders-filters">
          <div className="filter-group-left">
            <div className="filter-select-wrapper">
              <select><option>Date Range: Last 30 Days</option></select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <div className="filter-select-wrapper">
              <select><option>Location: All Regions</option></select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <button className="export-btn" style={{padding: '10px'}}><Filter size={16} /> More Filters</button>
          </div>

          <div className="search-wrapper">
            <Search size={16} className="search-icon-small" />
            <input type="text" placeholder="Search by Order ID, Customer..." />
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
                <th className="actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order, index) => (
                <tr key={index} className="order-row" onClick={() => navigate(`/orders/details/${order.id}`)}>
                  <td className="checkbox-col" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td><span className="order-id-link">{order.id}</span></td>
                  <td>
                    <div className="date-time-cell">
                      <span className="date-text">{order.date}</span>
                      <span className="time-text">{order.time}</span>
                    </div>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{order.customer}</span>
                      <span className="customer-email">{order.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="items-preview">
                      {order.items.map((item, i) => (
                        <div key={i} className="item-mini" title={item.name}>
                          <div className="item-mini-img" style={{backgroundColor: item.img || '#111827'}}></div>
                          {item.qty > 1 && <span className="item-mini-qty">x{item.qty}</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td><span className="price-bold">{order.total}</span></td>
                  <td>
                    <span className={`order-status-badge ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions-text">
                      <button className="text-btn"><FileText size={14} /> Invoice</button>
                      <button className="text-btn text-orange" onClick={() => navigate(`/orders/details/${order.id}`)}>View Details <ChevronRight size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer">
          <span className="showing-text">Showing 1-{rows.length} of {rows.length} orders</span>
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
          <div className="metric-value-flex">
            <span className="metric-value">{rows.filter((item) => item.status.toLowerCase() === 'pending').length}</span>
            <span className="metric-sub">orders</span>
          </div>
          <button className="action-link">Process now →</button>
        </div>
        <div className="metric-card card">
          <h4 className="metric-title">GLOBAL REACH</h4>
          <div className="metric-value-flex">
            <span className="metric-value">{new Set(rows.map((item) => item.country).filter(Boolean)).size || 1}</span>
            <span className="metric-sub">Regions</span>
          </div>
          <span className="metric-desc text-muted">Active cross-border channels</span>
        </div>
      </div>

    </div>
  );
};

export default OrderManagement;
