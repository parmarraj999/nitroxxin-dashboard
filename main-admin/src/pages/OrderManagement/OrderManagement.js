import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Eye, 
  FileText, 
  Download, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  RotateCw,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { toDate } from '../../services/firebaseUtils';
import Pagination from '../../components/Common/Pagination';
import './OrderManagement.css';

// Priority Signal Component matching reference screenshot
const PriorityIndicator = ({ level = 'medium' }) => {
  if (level === 'urgent') {
    return (
      <div className="priority-badge-urgent" title="Urgent / Alert">
        <span>!</span>
      </div>
    );
  }

  const barColors = {
    low: ['#10b981', '#cbd5e1', '#cbd5e1'],
    medium: ['#f59e0b', '#f59e0b', '#cbd5e1'],
    high: ['#10b981', '#10b981', '#10b981']
  };

  const colors = barColors[level] || barColors.medium;

  return (
    <div className="priority-signal-wrap" title={`Priority: ${level}`}>
      <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
        <rect x="1" y="9.5" width="3.5" height="5" rx="1" fill={colors[0]} />
        <rect x="7" y="5" width="3.5" height="9.5" rx="1" fill={colors[1]} />
        <rect x="13" y="1" width="3.5" height="13.5" rx="1" fill={colors[2]} />
      </svg>
    </div>
  );
};

// Deterministic company badge avatar
const getCompanyStyle = (name = '') => {
  const palettes = [
    { bg: '#dcfce7', color: '#15803d' }, // green (Peregrin / Goodwell)
    { bg: '#ffedd5', color: '#c2410c' }, // orange (Pollinate)
    { bg: '#f3e8ff', color: '#7e22ce' }, // purple (Eclipseful)
    { bg: '#eff6ff', color: '#1d4ed8' }, // blue (Solaris / Dynamic)
    { bg: '#fce7f3', color: '#be185d' }, // pink
    { bg: '#e0e7ff', color: '#4338ca' }  // indigo (Synergy)
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return palettes[sum % palettes.length];
};

const statusTabs = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending / In Negotiation' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed / Under Review' },
  { key: 'shipped', label: 'Shipped / In Transit' },
  { key: 'delivered', label: 'Delivered / Accepted' },
  { key: 'cancelled', label: 'Cancelled / Rejected' }
];

export default function OrderManagement() {
  const navigate = useNavigate();
  const { orders, loading, updateOrderStatus, reload } = useOrders();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Table selection & sorting states
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [search, selectedCompany, selectedDateRange, selectedPaymentStatus, activeTab]);

  // Transform and normalize orders into standard table schema
  const parsedOrders = useMemo(() => {
    return orders.map((order) => {
      const created = toDate(order.createdAt);
      const rawStatus = (order.status || order.orderStatus || 'pending').toLowerCase();
      const rawTotal = Number(order.totalAmount || order.total || order.shipping?.totals?.total || 0);

      // Customer
      const clientName = order.customer?.name || order.customerName || order.shipping?.name || 'Customer';
      const clientEmail = order.customer?.email || order.customerEmail || '';
      const clientPhone = order.customer?.phone || order.phone || '';

      // Company / Vendor
      const company = order.vendorName || order.items?.[0]?.vendorName || order.items?.[0]?.brandName || 'Nitroxx Moto Gear';

      // Address
      let address = order.deliveryAddress;
      if (!address && order.shipping) {
        const parts = [
          order.shipping.address,
          order.shipping.city,
          order.shipping.state,
          order.shipping.pincode
        ].filter(Boolean);
        address = parts.join(', ');
      }
      if (!address) address = 'Address not specified';

      // Status Badge Style matching the reference screenshot
      let statusLabel = 'In Negotiation';
      let statusClass = 'status-negotiation';
      let priority = 'medium';
      let nextStep = 'Verify payment & confirm';

      switch (rawStatus) {
        case 'pending':
          statusLabel = 'In Negotiation';
          statusClass = 'status-negotiation';
          priority = (created && Date.now() - created.getTime() > 24 * 3600 * 1000) ? 'urgent' : 'medium';
          nextStep = 'Verify payment & confirm';
          break;
        case 'confirmed':
          statusLabel = 'Prospecting';
          statusClass = 'status-prospecting';
          priority = 'medium';
          nextStep = 'Send to warehouse for packing';
          break;
        case 'packed':
          statusLabel = 'Under Review';
          statusClass = 'status-review';
          priority = 'high';
          nextStep = 'Hand over to courier';
          break;
        case 'shipped':
          statusLabel = 'Follow-Up Required';
          statusClass = 'status-followup';
          priority = 'high';
          nextStep = 'Track delivery with carrier';
          break;
        case 'delivered':
          statusLabel = 'Accepted';
          statusClass = 'status-accepted';
          priority = 'high';
          nextStep = 'Order finalized & settled';
          break;
        case 'cancelled':
          statusLabel = 'Rejected';
          statusClass = 'status-rejected';
          priority = 'urgent';
          nextStep = 'Review cancellation & refund';
          break;
        case 'returned':
          statusLabel = 'Rejected';
          statusClass = 'status-rejected';
          priority = 'urgent';
          nextStep = 'Inspect return package';
          break;
        default:
          statusLabel = rawStatus;
          statusClass = 'status-negotiation';
          priority = 'medium';
          nextStep = 'Process order';
      }

      // Date formatted as DD/MM/YYYY
      let dateDisplay = 'Pending';
      if (created) {
        const d = String(created.getDate()).padStart(2, '0');
        const m = String(created.getMonth() + 1).padStart(2, '0');
        const y = created.getFullYear();
        dateDisplay = `${d}/${m}/${y}`;
      }

      return {
        id: order.id,
        orderId: order.orderId || order.id.slice(0, 10).toUpperCase(),
        clientName,
        clientEmail,
        clientPhone,
        company,
        listedPrice: rawTotal,
        listedPriceFormatted: `₹${rawTotal.toLocaleString()}`,
        address,
        rawStatus,
        statusLabel,
        statusClass,
        priority,
        createdDate: created,
        dateDisplay,
        nextStep,
        paymentStatus: (order.paymentStatus || order.payment?.status || 'paid').toLowerCase(),
        items: order.items || [],
        itemCount: order.itemCount || (order.items ? order.items.length : 1)
      };
    });
  }, [orders]);

  // Extract distinct company / vendor names for filter dropdown
  const companiesList = useMemo(() => {
    return Array.from(new Set(parsedOrders.map((o) => o.company).filter(Boolean)));
  }, [parsedOrders]);

  // Filter pipeline
  const filteredOrders = useMemo(() => {
    return parsedOrders.filter((order) => {
      // Search match
      const haystack = `${order.orderId} ${order.clientName} ${order.clientEmail} ${order.company} ${order.address} ${order.statusLabel} ${order.nextStep}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.toLowerCase());

      // Company filter
      const matchesCompany = selectedCompany === 'all' || order.company === selectedCompany;

      // Status tab
      const matchesTab = activeTab === 'all' || order.rawStatus === activeTab;

      // Payment filter
      const matchesPayment = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;

      // Date Range filter
      let matchesDate = true;
      if (selectedDateRange !== 'all' && order.createdDate) {
        const now = new Date();
        const diffDays = (now - order.createdDate) / (1000 * 3600 * 24);
        if (selectedDateRange === 'today') matchesDate = diffDays <= 1;
        else if (selectedDateRange === '7days') matchesDate = diffDays <= 7;
        else if (selectedDateRange === 'month') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesCompany && matchesTab && matchesPayment && matchesDate;
    });
  }, [parsedOrders, search, selectedCompany, activeTab, selectedPaymentStatus, selectedDateRange]);

  // Sorting pipeline
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'clientName':
          valA = a.clientName.toLowerCase();
          valB = b.clientName.toLowerCase();
          break;
        case 'company':
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
          break;
        case 'listedPrice':
          valA = a.listedPrice;
          valB = b.listedPrice;
          break;
        case 'address':
          valA = a.address.toLowerCase();
          valB = b.address.toLowerCase();
          break;
        case 'status':
          valA = a.rawStatus;
          valB = b.rawStatus;
          break;
        case 'date':
        default:
          valA = a.createdDate ? a.createdDate.getTime() : 0;
          valB = b.createdDate ? b.createdDate.getTime() : 0;
          break;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortField, sortAsc]);

  // Paginated items for current view
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedOrders((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick order status transition
  const handleStatusChange = async (e, orderId, nextStatus) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(orderId, nextStatus, `Updated to ${nextStatus} via Order Table`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status: ' + err.message);
    }
  };

  // Export visible orders to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order ID', 'Client Name', 'Company', 'Listed Price', 'Address', 'Status', 'Date', 'Next Step'];
    const rows = filteredOrders.map((o) => [
      `"${o.orderId}"`,
      `"${o.clientName}"`,
      `"${o.company}"`,
      o.listedPrice,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.statusLabel}"`,
      `"${o.dateDisplay}"`,
      `"${o.nextStep}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalRevenue = parsedOrders.reduce((sum, o) => sum + o.listedPrice, 0);
    const pendingOrders = parsedOrders.filter((o) => o.rawStatus === 'pending' || o.rawStatus === 'confirmed').length;
    const deliveredOrders = parsedOrders.filter((o) => o.rawStatus === 'delivered').length;
    return {
      totalCount: parsedOrders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders
    };
  }, [parsedOrders]);

  return (
    <div className="order-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Manage client accounts, contract stages, fulfillment, and pipeline revenue.</p>
        </div>
        <div className="header-actions-main">
          <button type="button" className="export-btn" onClick={() => reload()} title="Refresh Orders">
            <RotateCw size={15} /> Refresh
          </button>
          <button type="button" className="quick-add-btn" onClick={handleExportCSV}>
            <Download size={15} /> Export Data
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="order-metrics-grid">
        <div className="order-metric-card">
          <div className="metric-header">
            <span>Total Orders</span>
            <ShoppingBag size={18} color="#2563eb" />
          </div>
          <strong>{loading ? '...' : metrics.totalCount}</strong>
          <small>Across all marketplace vendors</small>
        </div>

        <div className="order-metric-card">
          <div className="metric-header">
            <span>Total Revenue</span>
            <TrendingUp size={18} color="#16a34a" />
          </div>
          <strong>{loading ? '...' : `₹${metrics.totalRevenue.toLocaleString()}`}</strong>
          <small>Gross marketplace order volume</small>
        </div>

        <div className="order-metric-card">
          <div className="metric-header">
            <span>Action Required</span>
            <Clock size={18} color="#d97706" />
          </div>
          <strong style={{ color: '#d97706' }}>{loading ? '...' : metrics.pendingOrders}</strong>
          <small>Pending & awaiting packing</small>
        </div>

        <div className="order-metric-card">
          <div className="metric-header">
            <span>Completed / Delivered</span>
            <CheckCircle size={18} color="#16a34a" />
          </div>
          <strong style={{ color: '#16a34a' }}>{loading ? '...' : metrics.deliveredOrders}</strong>
          <small>Successfully delivered orders</small>
        </div>
      </div>

      {/* Top Filter & Search Controls Card */}
      <div className="table-controls-card">
        {/* Filters Row */}
        <div className="filters-row">
          {/* Search Box */}
          <div className="search-box">
            <Search className="search-icon" size={17} />
            <input 
              type="text" 
              placeholder="Search by customer name, order ID, company, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="filter-dropdowns">
            {/* Company / Vendor Select */}
            <div className="custom-select">
              <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="all">Company: All</option>
                {companiesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="select-arrow" size={15} />
            </div>

            {/* Date Range Select */}
            <div className="custom-select">
              <select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)}>
                <option value="all">Date: All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>
              <ChevronDown className="select-arrow" size={15} />
            </div>

            {/* Payment Status Select */}
            <div className="custom-select">
              <select value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)}>
                <option value="all">Payment: Any</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cod">Cash on Delivery</option>
              </select>
              <ChevronDown className="select-arrow" size={15} />
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="tabs-row">
          <div className="status-tabs">
            {statusTabs.map((tab) => {
              const count = tab.key === 'all' 
                ? parsedOrders.length 
                : parsedOrders.filter((o) => o.rawStatus === tab.key).length;

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Selected Row Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="bulk-selection-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="selection-badge">{selectedOrders.length} selected</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Apply action to selected orders:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => {
                selectedOrders.forEach((id) => updateOrderStatus(id, 'confirmed', 'Bulk confirmed'));
                setSelectedOrders([]);
              }}
            >
              <CheckCircle2 size={14} /> Mark Confirmed
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => {
                selectedOrders.forEach((id) => updateOrderStatus(id, 'packed', 'Bulk packed'));
                setSelectedOrders([]);
              }}
            >
              <PackageCheck size={14} /> Mark Packed
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => setSelectedOrders([])}
              style={{ color: '#ef4444' }}
            >
              <XCircle size={14} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet / CRM Table Card Matching Reference Screenshot */}
      <div className="table-card crm-table-wrapper">
        <div className="table-scroll-container">
          <table className="crm-spreadsheet-table">
            <thead>
              <tr>
                {/* Checkbox column */}
                <th style={{ width: 44, textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                    onChange={handleToggleSelectAll}
                    title="Select all on this page"
                  />
                </th>

                {/* Priority */}
                {/* <th style={{ width: 70, textAlign: 'center' }}>
                  Priority
                </th> */}

                {/* Client Name */}
                <th onClick={() => handleSort('clientName')} className="sortable-th" style={{ minWidth: 160 }}>
                  <div className="th-content">
                    <span>Client Name</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Company */}
                <th onClick={() => handleSort('company')} className="sortable-th" style={{ minWidth: 160 }}>
                  <div className="th-content">
                    <span>Company</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Listed Price */}
                <th onClick={() => handleSort('listedPrice')} className="sortable-th" style={{ minWidth: 130 }}>
                  <div className="th-content">
                    <span>Listed Price</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Address */}
                <th onClick={() => handleSort('address')} className="sortable-th" style={{ minWidth: 230 }}>
                  <div className="th-content">
                    <span>Address</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Status */}
                <th onClick={() => handleSort('status')} className="sortable-th" style={{ minWidth: 150 }}>
                  <div className="th-content">
                    <span>Status</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Date */}
                <th onClick={() => handleSort('date')} className="sortable-th" style={{ minWidth: 120 }}>
                  <div className="th-content">
                    <span>Date</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>

                {/* Next Step */}
                {/* <th style={{ minWidth: 180 }}>
                  <div className="th-content">
                    <span>Next Step</span>
                  </div>
                </th> */}

                {/* Actions */}
                <th style={{ width: 90, textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-state-cell">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RotateCw size={18} className="button-loader" color="#2563eb" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-state-cell">
                    <ShoppingBag size={32} color="#94a3b8" />
                    <h4>No orders found</h4>
                    <p>Adjust your search filters or wait for new marketplace purchases.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const companyStyle = getCompanyStyle(order.company);

                  return (
                    <tr 
                      key={order.id} 
                      className={`crm-row ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => navigate(`/orders/details/${order.id}`)}
                    >
                      {/* Checkbox with blue indicator dot */}
                      <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                        {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span className={`status-dot ${isSelected ? 'active' : ''}`} /> */}
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(order.id)}
                          />
                        {/* </div> */}
                      </td>

                      {/* Priority Signal */}
                      {/* <td className="priority-cell">
                        <PriorityIndicator level={order.priority} />
                      </td> */}

                      {/* Client Name */}
                      <td className="client-cell">
                        <div className="client-info">
                          <span className="client-name">{order.clientName}</span>
                          {order.clientEmail && (
                            <span className="client-email">{order.clientEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Company with colored brand icon badge */}
                      <td className="company-cell">
                        <div className="company-badge-wrap">
                          <div 
                            className="company-logo-avatar"
                            style={{ background: companyStyle.bg, color: companyStyle.color }}
                          >
                            {order.company.charAt(0).toUpperCase()}
                          </div>
                          <span className="company-name" title={order.company}>
                            {order.company}
                          </span>
                        </div>
                      </td>

                      {/* Listed Price */}
                      <td className="price-cell">
                        <strong>{order.listedPriceFormatted}</strong>
                      </td>

                      {/* Address */}
                      <td className="address-cell">
                        <span className="address-text" title={order.address}>
                          {order.address}
                        </span>
                      </td>

                      {/* Status Badge matching reference colors */}
                      <td className="status-cell">
                        <span className={`crm-status-pill ${order.statusClass}`}>
                          {order.statusLabel}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="date-cell">
                        <span className="date-value">{order.dateDisplay}</span>
                      </td>

                      {/* Next Step */}
                      {/* <td className="nextstep-cell">
                        <span className="nextstep-text" title={order.nextStep}>
                          {order.nextStep}
                        </span>
                      </td> */}

                      {/* Actions */}
                      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="crm-actions-row">
                          <button
                            type="button"
                            className="crm-icon-btn"
                            title="View Order Details"
                            onClick={() => navigate(`/orders/details/${order.id}`)}
                          >
                            <Eye size={15} />
                          </button>

                          {order.rawStatus === 'pending' && (
                            <button
                              type="button"
                              className="crm-icon-btn text-blue"
                              title="Confirm Order"
                              onClick={(e) => handleStatusChange(e, order.id, 'confirmed')}
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}

                          {order.rawStatus === 'confirmed' && (
                            <button
                              type="button"
                              className="crm-icon-btn text-orange"
                              title="Pack Order"
                              onClick={(e) => handleStatusChange(e, order.id, 'packed')}
                            >
                              <PackageCheck size={15} />
                            </button>
                          )}

                          {order.rawStatus === 'packed' && (
                            <button
                              type="button"
                              className="crm-icon-btn text-green"
                              title="Ship Order"
                              onClick={(e) => handleStatusChange(e, order.id, 'shipped')}
                            >
                              <Truck size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
