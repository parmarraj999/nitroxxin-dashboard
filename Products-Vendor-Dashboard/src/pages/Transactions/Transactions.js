import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Download,
  Search,
  User,
  Tag,
  Calendar,
  Clock,
  Mail,
  CheckCircle2,
  RotateCw,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  IndianRupee,
  Eye,
  Copy,
  Check,
  X,
  Plus,
  Loader2,
  CreditCard,
  Building2,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrdersContext } from '../../context/OrdersContext';
import {
  fetchPaymentsByVendor,
  createPaymentRecord,
  exportTransactionsToCSV,
  initialSampleTransactions
} from '../../services/paymentService';
import './Transactions.css';

// Generates pastel avatar color based on name initials
const getAvatarStyle = (name = '') => {
  const colors = [
    { bg: '#e0f2fe', text: '#0369a1' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#ede9fe', text: '#6d28d9' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#ffedd5', text: '#c2410c' }
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];
  return {
    backgroundColor: color.bg,
    color: color.text
  };
};

const getInitials = (name = '') => {
  if (!name) return 'CU';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Transactions = () => {
  const { vendorId } = useAuth();
  const ordersCtx = useOrdersContext();
  const searchInputRef = useRef(null);

  // Data state
  const [dbPayments, setDbPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTestPayment, setIsAddingTestPayment] = useState(false);

  // Selection & Filters
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // Active Dropdowns
  const [openActionId, setOpenActionId] = useState(null);
  const actionMenuRef = useRef(null);

  // Detail Modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch payments from Firestore for this vendor
  const loadPayments = async () => {
    setLoading(true);
    try {
      const records = await fetchPaymentsByVendor(vendorId);
      setDbPayments(records);
    } catch (err) {
      console.warn('Error loading payments from Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [vendorId]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine Firestore payments, vendor orders, and reference sample transactions
  const allTransactions = useMemo(() => {
    const list = [...dbPayments];

    // Map vendor live orders into payment transactions if they aren't already represented
    const realOrders = ordersCtx?.orders || [];
    realOrders.forEach((o, idx) => {
      const orderPayId = `ORD-PAY-${String(o.id || idx).slice(0, 7).toUpperCase()}`;
      if (!list.some((p) => p.id === orderPayId || p.reference === o.id)) {
        const rawStatus = (o.status || 'confirmed').toLowerCase();
        let mappedStatus = 'success';
        if (rawStatus === 'pending') mappedStatus = 'pending';
        else if (rawStatus === 'packed' || rawStatus === 'shipped' || rawStatus === 'in_transit') mappedStatus = 'in_progress';
        else if (rawStatus === 'cancelled' || rawStatus === 'returned') mappedStatus = 'failed';

        const d = o.createdAt ? new Date(o.createdAt?.toDate ? o.createdAt.toDate() : o.createdAt) : new Date();

        list.push({
          id: orderPayId,
          customerName: o.customer?.name || o.customerName || `Customer #${String(o.id || '').slice(0, 5)}`,
          description: `Order Payment #${String(o.id || '').slice(0, 7).toUpperCase()} • Accessories`,
          category: 'Product Order',
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: d,
          email: o.customer?.email || o.customerEmail || 'buyer@example.com',
          status: mappedStatus,
          amount: Number(o.total || o.totalAmount || 4999),
          paymentMethod: 'Online Gateway (Razorpay)',
          reference: o.orderNumber || o.id
        });
      }
    });

    // If total records are fewer than 12, append initial sample transactions matching the screenshot
    if (list.length < 12) {
      initialSampleTransactions.forEach((sample) => {
        if (!list.some((item) => item.id === sample.id || item.customerName === sample.customerName)) {
          list.push(sample);
        }
      });
    }

    return list;
  }, [dbPayments, ordersCtx?.orders]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      // 1. Text Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesEmail && !matchesId && !matchesCategory) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'All Statuses') {
        const target = statusFilter.toLowerCase().replace(' ', '_');
        if (target === 'in_progress' && item.status !== 'in_progress') return false;
        if (target === 'success' && item.status !== 'success' && item.status !== 'paid' && item.status !== 'completed') return false;
        if (target === 'failed' && item.status !== 'failed') return false;
        if (target === 'pending' && item.status !== 'pending') return false;
      }

      // 3. Category filter
      if (categoryFilter !== 'All Categories') {
        if (item.category !== categoryFilter) return false;
      }

      // 4. Period filter
      if (periodFilter !== 'All Time' && item.rawTimestamp) {
        const itemDate = new Date(item.rawTimestamp);
        const now = new Date();
        if (periodFilter === 'Today') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (periodFilter === 'This Week') {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (periodFilter === 'This Month') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (periodFilter === 'Last 30 Days') {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        } else if (periodFilter === 'This Year') {
          if (itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [allTransactions, searchQuery, statusFilter, categoryFilter, periodFilter]);

  // Overall Metrics calculated dynamically
  const metrics = useMemo(() => {
    const totalVolume = filteredTransactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const successItems = filteredTransactions.filter((item) => item.status === 'success' || item.status === 'paid');
    const inProgressItems = filteredTransactions.filter((item) => item.status === 'in_progress' || item.status === 'processing');
    const pendingItems = filteredTransactions.filter((item) => item.status === 'pending' || item.status === 'failed');

    const totalCount = filteredTransactions.length;
    const successPct = totalCount > 0 ? Math.round((successItems.length / totalCount) * 100) : 0;

    return {
      totalVolume,
      totalCount,
      successCount: successItems.length,
      successPct,
      inProgressCount: inProgressItems.length,
      pendingCount: pendingItems.length
    };
  }, [filteredTransactions]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredTransactions.length);

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length && paginatedTransactions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTransactions.map((t) => t.id)));
    }
  };

  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export CSV handler
  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, `vendor_transactions_${Date.now()}.csv`);
  };

  // Copy transaction ID handler
  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add sample live test payment to Firestore
  const handleAddLivePayment = async () => {
    setIsAddingTestPayment(true);
    try {
      const testRecord = {
        vendorId,
        customerName: 'Aarav Patel',
        description: 'Razorpay UPI *4412 • Precision Helmets',
        category: 'Product Order',
        amount: 8490.0,
        status: 'success',
        email: 'aarav.patel@nitroxx.in',
        paymentMethod: 'UPI / NetBanking',
        reference: `PAY-${Date.now().toString().slice(-6)}`
      };
      await createPaymentRecord(testRecord, vendorId);
      await loadPayments();
    } catch (err) {
      console.error('Failed to create test payment record:', err);
    } finally {
      setIsAddingTestPayment(false);
    }
  };

  return (
    <div className="transactions-page-container">
      {/* ================= 1. HEADER ROW ================= */}
      <div className="transactions-header-row">
        <div className="transactions-title-group">
          <div className="transactions-icon-badge">
            <FileText size={22} color="#0f172a" />
          </div>
          <div className="transactions-title-text">
            <h1 className="transactions-main-title">Transactions & Payouts</h1>
            <p className="transactions-subtitle">
              Comprehensive directory of attendee ticket bookings, payouts, refunds, and revenue transactions.
            </p>
          </div>
        </div>

        <div className="transactions-header-actions">
          <button
            type="button"
            className="btn-add-payment-test"
            onClick={handleAddLivePayment}
            disabled={isAddingTestPayment}
            title="Record a test live payment to Firestore payments collection"
          >
            {isAddingTestPayment ? (
              <Loader2 size={13} className="spin-icon-inline" />
            ) : (
              <Plus size={13} strokeWidth={2.5} />
            )}
            <span>Add Live Payment</span>
          </button>

          <button
            type="button"
            className="btn-export-csv"
            onClick={handleExportCSV}
            title="Download CSV report of transactions"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= 2. STATUS SUMMARY PILLS ================= */}
      <div className="transactions-metrics-row">
        <div className="metric-pill metric-pill-volume">
          <span className="metric-pill-label">Total Volume:</span>
          <span className="metric-pill-value">₹{metrics.totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="metric-pill-count">({metrics.totalCount} Records)</span>
        </div>

        <div
          className={`metric-pill metric-pill-success ${statusFilter === 'Success' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Success' ? 'All Statuses' : 'Success')}
          title="Click to filter by completed transactions"
        >
          <span className="metric-pill-label">Success / Paid:</span>
          <span className="metric-pill-value">{metrics.successCount} Completed</span>
          <span className="metric-pill-pct">({metrics.successPct}%)</span>
        </div>

        <div
          className={`metric-pill metric-pill-progress ${statusFilter === 'In progress' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'In progress' ? 'All Statuses' : 'In progress')}
          title="Click to filter by processing transactions"
        >
          <span className="metric-pill-label">In Progress:</span>
          <span className="metric-pill-value">{metrics.inProgressCount} Processing</span>
        </div>

        <div
          className={`metric-pill metric-pill-pending ${statusFilter === 'Pending' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All Statuses' : 'Pending')}
          title="Click to filter by pending / review transactions"
        >
          <span className="metric-pill-label">Pending / Review:</span>
          <span className="metric-pill-value">{metrics.pendingCount} Pending</span>
        </div>
      </div>

      {/* ================= 3. SEARCH & FILTERS BAR ================= */}
      <div className="transactions-card">
        <div className="transactions-filters-bar">
          {/* Search Input with Shortcut Badge */}
          <div className="transactions-search-wrap">
            <Search size={15} className="search-icon-inside" />
            <input
              ref={searchInputRef}
              type="text"
              className="transactions-search-input"
              placeholder="Search transactions, customer name, email, invoice..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <kbd className="search-shortcut-badge">⌘K</kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="transactions-dropdowns-group">
            {/* Period Filter */}
            <div className="filter-select-wrapper">
              <span className="filter-select-prefix">Period:</span>
              <select
                className="filter-select"
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>
              <ChevronDown size={13} className="filter-chevron" />
            </div>

            {/* Status Filter */}
            <div className="filter-select-wrapper">
              <span className="filter-select-prefix">Status:</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Success">Success</option>
                <option value="In progress">In progress</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <ChevronDown size={13} className="filter-chevron" />
            </div>

            {/* Category Filter */}
            <div className="filter-select-wrapper">
              <span className="filter-select-prefix">Category:</span>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Categories">All Categories</option>
                <option value="Send Money">Send Money</option>
                <option value="Request Money">Request Money</option>
                <option value="Ticket Booking">Ticket Booking</option>
                <option value="Product Order">Product Order</option>
                <option value="Payout">Payout</option>
                <option value="Refund">Refund</option>
              </select>
              <ChevronDown size={13} className="filter-chevron" />
            </div>
          </div>
        </div>

        {/* ================= 4. TRANSACTIONS TABLE ================= */}
        <div className="transactions-table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    className="custom-table-checkbox"
                    checked={paginatedTransactions.length > 0 && selectedIds.size === paginatedTransactions.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all transactions on current page"
                  />
                </th>
                <th className="th-description">
                  <div className="th-inner">
                    <User size={13} className="th-icon" />
                    <span>Description</span>
                  </div>
                </th>
                <th className="th-category">
                  <div className="th-inner">
                    <Tag size={13} className="th-icon" />
                    <span>Category</span>
                  </div>
                </th>
                <th className="th-date">
                  <div className="th-inner">
                    <Calendar size={13} className="th-icon" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="th-time">
                  <div className="th-inner">
                    <Clock size={13} className="th-icon" />
                    <span>Time</span>
                  </div>
                </th>
                <th className="th-email">
                  <div className="th-inner">
                    <Mail size={13} className="th-icon" />
                    <span>Email</span>
                  </div>
                </th>
                <th className="th-status">
                  <div className="th-inner">
                    <CheckCircle2 size={13} className="th-icon" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="th-amount">
                  <div className="th-inner">
                    <IndianRupee size={13} className="th-icon" />
                    <span>Amount</span>
                  </div>
                </th>
                <th className="th-action">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="table-loading-empty-state">
                      <Loader2 size={24} className="spin-icon-inline" />
                      <p>Loading transactions from payment collection...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="table-loading-empty-state">
                      <CreditCard size={32} color="#94a3b8" style={{ marginBottom: 6 }} />
                      <h4>No transactions found</h4>
                      <p>Try adjusting your search query, status, or date range filters.</p>
                      <button
                        type="button"
                        className="btn-reset-filters"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All Statuses');
                          setCategoryFilter('All Categories');
                          setPeriodFilter('All Time');
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {paginatedTransactions.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const avatarStyle = getAvatarStyle(item.customerName);
                const initials = getInitials(item.customerName);

                return (
                  <tr
                    key={item.id}
                    className={`transaction-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => setSelectedTransaction(item)}
                  >
                    {/* 1. Checkbox */}
                    <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="custom-table-checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleRow(item.id, e)}
                        aria-label={`Select ${item.customerName}`}
                      />
                    </td>

                    {/* 2. Description (Avatar + Name + Method/Subtitle) */}
                    <td className="td-description">
                      <div className="description-cell-wrap">
                        <div className="customer-avatar-circle" style={avatarStyle}>
                          {initials}
                        </div>
                        <div className="description-text-block">
                          <span className="customer-name-bold">{item.customerName}</span>
                          <span className="payment-method-subtitle">{item.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Category */}
                    <td className="td-category">
                      <span className="category-text">{item.category}</span>
                    </td>

                    {/* 4. Date */}
                    <td className="td-date">
                      <span className="date-text">{item.date}</span>
                    </td>

                    {/* 5. Time */}
                    <td className="td-time">
                      <span className="time-text">{item.time}</span>
                    </td>

                    {/* 6. Email */}
                    <td className="td-email">
                      <span className="email-text" title={item.email}>
                        {item.email}
                      </span>
                    </td>

                    {/* 7. Status Pill */}
                    <td className="td-status">
                      {item.status === 'success' || item.status === 'paid' ? (
                        <span className="status-pill-badge pill-success">
                          <CheckCircle2 size={12} className="status-icon" />
                          <span>Success</span>
                        </span>
                      ) : item.status === 'in_progress' || item.status === 'processing' ? (
                        <span className="status-pill-badge pill-progress">
                          <RotateCw size={12} className="status-icon" />
                          <span>In progress</span>
                        </span>
                      ) : item.status === 'failed' ? (
                        <span className="status-pill-badge pill-failed">
                          <XCircle size={12} className="status-icon" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="status-pill-badge pill-pending">
                          <AlertTriangle size={12} className="status-icon" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* 8. Amount */}
                    <td className="td-amount">
                      <span className="amount-bold">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* 9. Action Button with Dropdown Menu */}
                    <td className="td-action" onClick={(e) => e.stopPropagation()}>
                      <div className="action-dropdown-container">
                        <button
                          type="button"
                          className="btn-action-more"
                          onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                          title="Actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {openActionId === item.id && (
                          <div className="action-popup-menu" ref={actionMenuRef}>
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                setSelectedTransaction(item);
                              }}
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={(e) => {
                                handleCopyId(item.id, e);
                                setOpenActionId(null);
                              }}
                            >
                              {copiedId === item.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                              <span>{copiedId === item.id ? 'Copied!' : 'Copy ID'}</span>
                            </button>
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                setSelectedTransaction(item);
                                setTimeout(() => window.print(), 300);
                              }}
                            >
                              <Receipt size={13} />
                              <span>Print Receipt</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= 5. TABLE FOOTER / PAGINATION ================= */}
        <div className="transactions-table-footer">
          <div className="table-footer-left">
            <span>
              Showing {filteredTransactions.length === 0 ? 0 : startIndex} to {endIndex} of {filteredTransactions.length} transactions
            </span>
          </div>

          <div className="table-footer-center">
            {/* First Page */}
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="First Page"
            >
              <ChevronsLeft size={15} />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page Number Pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`page-num-btn ${pageNum === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page */}
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>

            {/* Last Page */}
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Last Page"
            >
              <ChevronsRight size={15} />
            </button>
          </div>

          <div className="table-footer-right">
            <span className="rows-per-page-label">Rows per page:</span>
            <div className="rows-select-wrap">
              <select
                className="rows-per-page-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 / page</option>
                <option value={9}>9 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDown size={12} className="rows-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6. TRANSACTION DETAIL MODAL ================= */}
      {selectedTransaction && (
        <div className="modal-overlay-custom" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content-custom transaction-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-with-badge">
                <h3>Transaction Details</h3>
                <span className={`status-pill-badge pill-${selectedTransaction.status === 'in_progress' ? 'progress' : selectedTransaction.status}`}>
                  {selectedTransaction.status.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-custom">
              {/* Financial Summary Card */}
              <div className="modal-amount-highlight-card">
                <div className="mah-row">
                  <div className="mah-block">
                    <span className="mah-label">Gross Amount</span>
                    <span className="mah-value">
                      ₹{Number(selectedTransaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mah-block">
                    <span className="mah-label">Gateway Fee</span>
                    <span className="mah-value text-muted">
                      - ₹{(Number(selectedTransaction.amount) * 0.02).toFixed(2)}
                    </span>
                  </div>
                  <div className="mah-block">
                    <span className="mah-label">Net Payout</span>
                    <span className="mah-value text-green">
                      ₹{(Number(selectedTransaction.amount) * 0.98).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Payment Meta Details Grid */}
              <div className="modal-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Customer Name</span>
                  <div className="detail-val-user">
                    <div className="avatar-mini" style={getAvatarStyle(selectedTransaction.customerName)}>
                      {getInitials(selectedTransaction.customerName)}
                    </div>
                    <span className="detail-val-bold">{selectedTransaction.customerName}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Customer Email</span>
                  <span className="detail-val">{selectedTransaction.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Transaction ID</span>
                  <div className="detail-copy-wrap">
                    <span className="detail-val-code">{selectedTransaction.id}</span>
                    <button
                      type="button"
                      className="btn-inline-copy"
                      onClick={(e) => handleCopyId(selectedTransaction.id, e)}
                    >
                      {copiedId === selectedTransaction.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Payment Channel</span>
                  <span className="detail-val">{selectedTransaction.paymentMethod || selectedTransaction.description}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-val-tag">{selectedTransaction.category}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-val">{selectedTransaction.date} at {selectedTransaction.time}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Reference ID</span>
                  <span className="detail-val-code">{selectedTransaction.reference || selectedTransaction.id}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Vendor ID</span>
                  <span className="detail-val-code">{vendorId}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="modal-submit-btn"
                onClick={() => window.print()}
              >
                <Download size={14} />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

