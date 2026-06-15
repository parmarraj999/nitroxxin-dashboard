import React from 'react';
import { Download, Search, ChevronDown, FileText, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './OrderManagement.css';

const orders = [
  {
    id: '#NX-99824',
    date: 'Oct 15, 2026',
    time: '09:42 AM',
    customer: 'Marco Rossi',
    email: 'marco.r@example.com',
    items: [
      { name: 'Apex Carbon...', qty: 1, img: '#111827' },
      { name: 'Visor Tinted...', qty: 1, img: '#374151' }
    ],
    total: '$629.00',
    status: 'Pending',
    statusClass: 'status-pending'
  },
  {
    id: '#NX-99823',
    date: 'Oct 14, 2026',
    time: '14:20 PM',
    customer: 'Elena Kraus',
    email: 'elena.k@example.com',
    items: [
      { name: 'Vantage Jacket...', qty: 1, img: '#1f2937' }
    ],
    total: '$349.00',
    status: 'Ready to Ship',
    statusClass: 'status-ready'
  },
  {
    id: '#NX-99820',
    date: 'Oct 14, 2026',
    time: '10:15 AM',
    customer: 'James Miller',
    email: 'j.miller@example.com',
    items: [
      { name: 'Torque-S Glo...', qty: 2, img: '#4b5563' }
    ],
    total: '$179.00',
    status: 'In Transit',
    statusClass: 'status-transit'
  },
  {
    id: '#NX-99815',
    date: 'Oct 12, 2026',
    time: '16:05 PM',
    customer: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    items: [
      { name: 'Apex Carbon...', qty: 1, img: '#111827' }
    ],
    total: '$599.00',
    status: 'Delivered',
    statusClass: 'status-delivered'
  }
];

const OrderManagement = () => {
  const navigate = useNavigate();

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
          <span className="tab active">All Orders (1,284)</span>
          <span className="tab">Pending (42)</span>
          <span className="tab">Ready to Ship (18)</span>
          <span className="tab">In Transit (240)</span>
          <span className="tab">Delivered (980)</span>
          <span className="tab">Returned (4)</span>
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
              {orders.map((order, index) => (
                <tr key={index} className="order-row" onClick={() => navigate('/orders/details')}>
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
                          <div className="item-mini-img" style={{backgroundColor: item.img}}></div>
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
                      <button className="text-btn text-orange" onClick={() => navigate('/orders/details')}>View Details <ChevronRight size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer">
          <span className="showing-text">Showing 1-10 of 1,284 orders</span>
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
            <span className="metric-value">18</span>
            <span className="metric-sub">orders</span>
          </div>
          <button className="action-link">Process now →</button>
        </div>
        <div className="metric-card card">
          <h4 className="metric-title">GLOBAL REACH</h4>
          <div className="metric-value-flex">
            <span className="metric-value">42</span>
            <span className="metric-sub">Regions</span>
          </div>
          <span className="metric-desc text-muted">Across North America & Europe</span>
        </div>
      </div>

    </div>
  );
};

export default OrderManagement;
