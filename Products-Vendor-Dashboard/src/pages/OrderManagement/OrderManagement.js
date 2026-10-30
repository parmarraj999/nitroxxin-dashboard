import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  MapPin,
  MoreVertical,
  Package,
  Phone,
  Search,
  XCircle,
  Eye,
  Printer,
  Hash,
  User,
  Tag,
  Calendar,
  DollarSign,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { useOrdersContext } from '../../context/OrdersContext';
import { toDate } from '../../services/firebaseUtils';
import './OrderManagement.css';

const statusOptions = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'returned', 'cancelled'];

const statusLabel = (status = '') => {
  if (status === 'all') return 'All Orders';
  if (status === 'confirmed') return 'Ready';
  if (status === 'packed') return 'Preparing';
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

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

const OrderManagement = () => {
  const navigate = useNavigate();
  const { orders, loading, error, changeOrderStatus } = useOrdersContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Close 3-dot dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.closest('.more-menu-wrapper')) {
        return;
      }
      setActiveMenuId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const baseRows = orders.map((order, idx) => {
    const created = toDate(order.createdAt);
    const rawStatus = (order.status || 'pending').toLowerCase();

    // Map to status pill styles matching reference image
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
      nextAction = null; // Completed
    } else if (rawStatus === 'cancelled' || rawStatus === 'returned') {
      statusClass = 'status-pill-cancelled';
      statusDisplay = rawStatus === 'returned' ? 'Returned' : 'Cancelled';
      nextAction = null;
    }

    // Customer details
    const customerName = order.customer?.name || order.customerName || `Customer #${(order.id || '').slice(0, 5) || (idx + 1)}`;
    const customerPhone = order.customer?.phone || order.customerPhone || order.shippingAddress?.phone || order.customer?.number || '+91 98765 43210';

    // Items details
    const items = order.items || [];
    const totalQty = items.length
      ? items.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0)
      : Number(order.itemCount || 1);
    const itemsText = items.length
      ? items.map((i) => i.name || i.title || 'Product').join(', ')
      : 'Artisan Ale, Eggplant Parmesan';

    // Order ID display (clean code without avatar box)
    const shortId = order.orderNumber || (order.id ? (order.id.length > 8 ? order.id.slice(0, 7).toUpperCase() : order.id) : `CD${5670 + idx}`);

    // Price
    const rawPrice = Number(order.total || order.totalAmount || 42.7);
    const formattedPrice = rawPrice > 100 ? `Rs. ${rawPrice.toLocaleString()}` : `$${rawPrice.toFixed(1)}`;

    return {
      id: order.id,
      shortId,
      customerName,
      customerPhone,
      totalQty,
      itemsText,
      address: formatAddress(order),
      rawPrice,
      formattedPrice,
      rawStatus,
      statusDisplay,
      statusClass,
      nextAction,
      date: created ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 15, 2026',
      time: created ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:42 AM',
      courier: order.tracking?.courier || order.courier || 'Express'
    };
  });

  const rows = baseRows.filter((order) => {
    const haystack = `${order.shortId} ${order.customerName} ${order.customerPhone} ${order.address} ${order.rawStatus}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.rawStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const handleToggleSelectAll = (e) => {
    e.stopPropagation();
    if (selectedIds.size === paginatedRows.length && paginatedRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRows.map((r) => r.id)));
    }
  };

  const handleToggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdvanceStatus = async (event, orderId, nextStatus, note) => {
    event.stopPropagation();
    if (!nextStatus) return;
    setUpdatingId(orderId);
    try {
      await changeOrderStatus(orderId, nextStatus, note || `Advanced status to ${nextStatus}`);
    } catch (err) {
      console.error('[OrderManagement] Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="order-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, fulfill, invoice, ship, return, and refund marketplace orders.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn">
            <Download size={15} /> Export Data
          </button>
        </div>
      </div>

      <div className="orders-container card">
        {/* Table Tabs */}
        <div className="table-tabs">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {statusLabel(status)} ({status === 'all' ? baseRows.length : baseRows.filter((item) => item.rawStatus === status).length})
            </button>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="orders-filters">
          <div className="filter-group-left">
            <div className="filter-select-wrapper">
              <select>
                <option>Date Range: Last 30 Days</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <div className="filter-select-wrapper">
              <select>
                <option>Location: All Regions</option>
                <option>India</option>
                <option>Metro Cities</option>
                <option>International</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
            <button className="export-btn" style={{ padding: '8px 12px' }}>
              <Filter size={14} /> More Filters
            </button>
          </div>

          <div className="search-wrapper">
            <Search size={15} className="search-icon-small" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Address, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Notion / Airtable Grid Table Layout */}
        <div className="table-responsive">
          <table className="orders-table-notion">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    className="notion-checkbox"
                    checked={paginatedRows.length > 0 && selectedIds.size === paginatedRows.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all visible orders"
                  />
                </th>
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
                <th className="th-add-col">
                  <Plus size={13} className="th-plus-icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="10">
                    <div className="empty-table-state">
                      <Loader2 size={24} className="table-loader-icon" />
                      <h3>Loading orders...</h3>
                      <p>Fetching real-time orders for your store from orders collection...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <div className="empty-table-state">
                      <Package size={32} color="#94a3b8" style={{ marginBottom: '6px' }} />
                      <h3>No orders found</h3>
                      <p>Adjust your search filters or wait for new orders to arrive.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedRows.map((order, rowIdx) => {
                  const isSelected = selectedIds.has(order.id);
                  const isMenuOpen = activeMenuId === order.id;
                  const isNearBottom = rowIdx >= paginatedRows.length - 2 && paginatedRows.length > 2;

                  return (
                    <tr
                      key={order.id}
                      className={`notion-row ${isSelected ? 'row-selected' : ''} ${isMenuOpen ? 'row-menu-active' : ''}`}
                      onClick={() => navigate(`/orders/details/${order.id}`)}
                    >
                      {/* Checkbox column */}
                      <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="notion-checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectRow(e, order.id)}
                          aria-label={`Select order ${order.shortId}`}
                        />
                      </td>

                      {/* 1. Order ID Column (Clean code without box) */}
                      <td className="td-col td-order-id">
                        <span className="order-id-code">{order.shortId}</span>
                      </td>

                      {/* 2. Customer Name with Phone Number Below */}
                      <td className="td-col td-customer">
                        <div className="customer-info-stacked">
                          <span className="customer-full-name">{order.customerName}</span>
                          <span className="customer-phone-number">
                            <Phone size={10} className="phone-icon-inline" />
                            {order.customerPhone}
                          </span>
                        </div>
                      </td>

                      {/* 3. Items No. Column with Quantity Badge & Name */}
                      <td className="td-col td-items">
                        <div className="items-quantity-cell">
                          <span className="items-qty-badge">{order.totalQty}</span>
                          <span className="items-name-text" title={order.itemsText}>
                            {order.itemsText}
                          </span>
                        </div>
                      </td>

                      {/* 4. Address Column with MapPin */}
                      <td className="td-col td-address">
                        <div className="address-cell" title={order.address}>
                          <MapPin size={12} className="address-pin-icon" />
                          <span className="address-string">{order.address}</span>
                        </div>
                      </td>

                      {/* 5. Status Column (Notion Soft Tag with Dot) */}
                      <td className="td-col td-status">
                        <span className={`status-pill-notion ${order.statusClass}`}>
                          <span className="status-dot"></span>
                          {order.statusDisplay}
                        </span>
                      </td>

                      {/* 6. Price Column */}
                      <td className="td-col td-price">
                        <span className="price-bold-text">{order.formattedPrice}</span>
                      </td>

                      {/* 7. Order At Column (Date & Time) */}
                      <td className="td-col td-order-at">
                        <div className="order-at-cell">
                          <span className="order-date-text">{order.date}</span>
                          <span className="order-time-text">{order.time}</span>
                        </div>
                      </td>

                      {/* 8. Action Buttons Column (Approve Button + 3 Dots Menu Overlay) */}
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
                                  order.nextAction.nextStatus,
                                  `Advanced status to ${order.nextAction.nextStatus}`
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

                          {/* 3-dots more menu with overlay popup */}
                          <div className="more-menu-wrapper">
                            <button
                              type="button"
                              className="btn-more-dots"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) => (prev === order.id ? null : order.id));
                              }}
                              title="More actions"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {isMenuOpen && (
                              <div className={`more-dropdown-popup ${isNearBottom ? 'popup-open-up' : ''}`}>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/orders/details/${order.id}`);
                                  }}
                                >
                                  <Eye size={13} /> View Details
                                </button>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/orders/details/${order.id}`);
                                  }}
                                >
                                  <Printer size={13} /> Print Invoice
                                </button>
                                {order.rawStatus !== 'delivered' && (
                                  <button
                                    type="button"
                                    className="dropdown-item text-green"
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleAdvanceStatus(e, order.id, 'delivered', 'Marked delivered from menu');
                                    }}
                                  >
                                    <CheckCircle2 size={13} /> Mark Delivered
                                  </button>
                                )}
                                {order.rawStatus !== 'cancelled' && (
                                  <button
                                    type="button"
                                    className="dropdown-item text-red"
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleAdvanceStatus(e, order.id, 'cancelled', 'Cancelled from menu');
                                    }}
                                  >
                                    <XCircle size={13} /> Cancel Order
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Empty Plus column */}
                      <td className="td-add-col"></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar instead of Totals */}
        <div className="orders-pagination-bar">
          <div className="pagination-info-left">
            <span>
              Showing{' '}
              <strong>{rows.length ? startIndex + 1 : 0}</strong>–
              <strong>{Math.min(startIndex + pageSize, rows.length)}</strong> of{' '}
              <strong>{rows.length}</strong> orders
            </span>
          </div>

          <div className="pagination-controls-right">
            <div className="page-size-selector">
              <span className="page-size-label">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="page-size-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-page-nav">
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="page-numbers-list">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="page-ellipsis">...</span>}
                        <button
                          type="button"
                          className={`btn-page-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

