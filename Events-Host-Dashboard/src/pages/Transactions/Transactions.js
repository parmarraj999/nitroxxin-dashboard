import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ReceiptText,
  User,
  Tag,
  CalendarDays,
  Clock,
  Mail,
  CreditCard,
  Search, 
  ChevronDown,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { INITIAL_TRANSACTIONS } from './transactionsData';
import TransactionDetailDrawer from './TransactionDetailDrawer';
import { TransactionTableSkeleton } from '../../components/States/SkeletonLoading';
import './Transactions.css';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All'); // 'All' | '1D' | '7D' | '1M' | '1Y'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Success' | 'In progress' | 'Failed' | 'Pending'
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'Send Money' | 'Request Money'
  
  // Sorting State
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Selection State
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 9 items per page matching user layout

  // Side Drawer State
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const searchInputRef = useRef(null);

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedTransaction(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial smooth skeleton loading transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Distinct Filter Options
  const timeframeOptions = ['All', '1D', '7D', '1M', '1Y'];
  const categoryOptions = ['All', 'Send Money', 'Request Money'];
  const statusOptions = ['All', 'Success', 'In progress', 'Failed', 'Pending'];

  // Sorting toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(tx => 
        (tx.name && tx.name.toLowerCase().includes(q)) ||
        (tx.description && tx.description.toLowerCase().includes(q)) ||
        (tx.email && tx.email.toLowerCase().includes(q)) ||
        (tx.amount && tx.amount.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.status && tx.status.toLowerCase().includes(q)) ||
        (tx.invoice && tx.invoice.toLowerCase().includes(q)) ||
        (tx.customerId && tx.customerId.toLowerCase().includes(q)) ||
        (tx.id && tx.id.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(tx => tx.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(tx => tx.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Timeframe filter
    if (selectedTimeframe !== 'All') {
      if (selectedTimeframe === '1D') {
        result = result.slice(0, 3);
      } else if (selectedTimeframe === '7D') {
        result = result.slice(0, 6);
      } else if (selectedTimeframe === '1M') {
        result = result.slice(0, 10);
      }
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'amount') {
          valA = a.amountNum || 0;
          valB = b.amountNum || 0;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [transactions, searchQuery, statusFilter, categoryFilter, selectedTimeframe, sortField, sortDirection]);

  // Paginated Rows
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Selection Handlers
  const isAllSelected = paginatedTransactions.length > 0 && 
    paginatedTransactions.every((tx) => selectedTxIds.has(tx.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTxIds(new Set(paginatedTransactions.map(tx => tx.id)));
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedTxIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'All') count++;
    if (categoryFilter !== 'All') count++;
    if (selectedTimeframe !== 'All') count++;
    return count;
  }, [searchQuery, statusFilter, categoryFilter, selectedTimeframe]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSelectedTimeframe('All');
    setCurrentPage(1);
    showToast('Filters reset to default.');
  };

  // Quick stats
  const totalVolumeFormatted = useMemo(() => {
    const total = transactions.reduce((acc, tx) => acc + (tx.amountNum || 0), 0);
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [transactions]);

  const totalSuccess = useMemo(() => transactions.filter(tx => tx.status === 'Success').length, [transactions]);
  const totalInProgress = useMemo(() => transactions.filter(tx => tx.status === 'In progress').length, [transactions]);
  const totalPending = useMemo(() => transactions.filter(tx => tx.status === 'Pending' || tx.status === 'Failed').length, [transactions]);

  // Status Badge Renderer matching Image 2
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
      case 'Approved':
        return (
          <span className="tx-status-pill success">
            <CheckCircle2 size={12} className="tx-status-icon" />
            <span>Success</span>
          </span>
        );
      case 'In progress':
      case 'Processing':
        return (
          <span className="tx-status-pill in-progress">
            <Loader2 size={12} className="tx-status-icon spin" />
            <span>In progress</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="tx-status-pill failed">
            <XCircle size={12} className="tx-status-icon" />
            <span>Failed</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="tx-status-pill pending">
            <AlertTriangle size={12} className="tx-status-icon" />
            <span>Pending</span>
          </span>
        );
    }
  };

  // Export to CSV helper
  const exportToCsvFile = (dataList, filename) => {
    const headers = ['Transaction ID', 'Customer Name', 'Email', 'Description', 'Category', 'Date', 'Time', 'Status', 'Amount'];
    const rows = dataList.map(tx => [
      tx.id,
      `"${tx.name}"`,
      tx.email,
      `"${tx.description}"`,
      tx.category,
      tx.date,
      tx.time,
      tx.status,
      `"${tx.amount}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    const count = selectedTxIds.size;
    setTransactions(prev => prev.map(tx => selectedTxIds.has(tx.id) ? { ...tx, status: 'Success' } : tx));
    setSelectedTxIds(new Set());
    showToast(`Marked ${count} transactions as Success.`);
  };

  const handleBulkProcessing = () => {
    const count = selectedTxIds.size;
    setTransactions(prev => prev.map(tx => selectedTxIds.has(tx.id) ? { ...tx, status: 'In progress' } : tx));
    setSelectedTxIds(new Set());
    showToast(`Marked ${count} transactions as In Progress.`);
  };

  const handleBulkExportCSV = () => {
    const listToExport = transactions.filter(tx => selectedTxIds.has(tx.id));
    exportToCsvFile(listToExport, `transactions_selected_${Date.now()}.csv`);
    showToast(`Exported ${listToExport.length} selected transactions.`);
  };

  const handleBulkRefund = () => {
    const count = selectedTxIds.size;
    if (window.confirm(`Refund / Cancel ${count} selected transactions?`)) {
      setTransactions(prev => prev.map(tx => selectedTxIds.has(tx.id) ? { ...tx, status: 'Failed' } : tx));
      setSelectedTxIds(new Set());
      showToast(`Cancelled/Refunded ${count} transactions.`);
    }
  };

  const handleExportAllFilteredCSV = () => {
    exportToCsvFile(filteredTransactions, `transactions_export_${Date.now()}.csv`);
    showToast(`Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  return (
    <AppLayout searchPlaceholder="Search dashboard..." showQuickCreate={false}>
      <div className="ptable-page-wrapper">

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="ptable-floating-toast">
            <CheckCircle2 size={16} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header matching Participants UI */}
        <div className="ptable-header-section">
          <div className="ptable-header-title-block">
            <div className="ptable-badge-icon">
              <ReceiptText size={20} strokeWidth={2} />
            </div>
            <div>
              <h1 className="ptable-main-title">Transactions & Payouts</h1>
              <p className="ptable-sub-title">
                Comprehensive directory of attendee ticket bookings, payouts, refunds, and revenue transactions.
              </p>
            </div>
          </div>

          <div className="ptable-header-actions">
            <button 
              className="ptable-btn-secondary"
              onClick={handleExportAllFilteredCSV}
              title="Export all or filtered records to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Quick-Strip matching Participants UI */}
        <div className="ptable-metric-strip">
          <div className="metric-pill-item">
            <span className="metric-pill-label">Total Volume:</span>
            <span className="metric-pill-val">{totalVolumeFormatted} ({transactions.length} Records)</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">Success / Paid:</span>
            <span className="metric-pill-val text-green">{totalSuccess} Completed ({Math.round((totalSuccess / transactions.length) * 100 || 0)}%)</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">In Progress:</span>
            <span className="metric-pill-val text-blue">{totalInProgress} Processing</span>
          </div>
          <div className="metric-pill-item">
            <span className="metric-pill-label">Pending / Review:</span>
            <span className="metric-pill-val text-amber">{totalPending} Pending</span>
          </div>
        </div>

        {/* Toolbar: Search and Filter Dropdowns matching Participants UI */}
        <div className="ptable-toolbar-container">
          {/* Search Box with ⌘K shortcut */}
          <div className="ptable-search-wrapper">
            <Search size={15} className="ptable-search-icon" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search transactions, customer name, email, invoice..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="ptable-search-input"
            />
            {searchQuery ? (
              <button 
                className="ptable-search-clear" 
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                <X size={13} />
              </button>
            ) : (
              <span className="ptable-search-shortcut" title="Press ⌘K or Ctrl+K to search">⌘K</span>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="ptable-filter-group">
            {/* Timeframe Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Period:</span>
              <select 
                value={selectedTimeframe}
                onChange={(e) => { setSelectedTimeframe(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                {timeframeOptions.map((tf, i) => (
                  <option key={i} value={tf}>{tf === 'All' ? 'All Time' : tf}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Status Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                {statusOptions.map((st, i) => (
                  <option key={i} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Category Filter */}
            <div className="ptable-select-wrapper">
              <span className="select-prefix-label">Category:</span>
              <select 
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="ptable-select-input"
              >
                {categoryOptions.map((cat, i) => (
                  <option key={i} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="ptable-select-chevron" />
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <button 
                className="ptable-reset-filters-btn"
                onClick={handleResetFilters}
                title="Reset all filters to default"
              >
                <RefreshCw size={13} />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="ptable-active-chips-bar">
            <span className="chips-title">Active Filters:</span>
            {searchQuery && (
              <span className="filter-chip">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={11} /></button>
              </span>
            )}
            {selectedTimeframe !== 'All' && (
              <span className="filter-chip">
                Period: {selectedTimeframe}
                <button onClick={() => setSelectedTimeframe('All')}><X size={11} /></button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="filter-chip">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')}><X size={11} /></button>
              </span>
            )}
            {categoryFilter !== 'All' && (
              <span className="filter-chip">
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter('All')}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Main Table Card matching Participants UI */}
        <div className="ptable-card-container">
          <div className="ptable-scroll-frame">
            <table className="ptable-custom-table">
              <thead>
                <tr>
                  {/* Checkbox Column */}
                  <th className="ptable-th th-checkbox">
                    <input 
                      type="checkbox" 
                      className="ptable-checkbox-input"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      title="Select all on this page"
                    />
                  </th>

                  {/* 1. Description (User / Avatar / Bank description) */}
                  <th 
                    className="ptable-th th-sortable th-description" 
                    onClick={() => handleSort('name')}
                    title="Sort by Description / Name"
                  >
                    <div className="th-content-flex">
                      <User size={13.5} className="th-header-icon" />
                      <span>Description</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 2. Category */}
                  <th 
                    className="ptable-th th-sortable th-category" 
                    onClick={() => handleSort('category')}
                    title="Sort by Category"
                  >
                    <div className="th-content-flex">
                      <Tag size={13.5} className="th-header-icon" />
                      <span>Category</span>
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 3. Date */}
                  <th 
                    className="ptable-th th-sortable th-date" 
                    onClick={() => handleSort('date')}
                    title="Sort by Date"
                  >
                    <div className="th-content-flex">
                      <CalendarDays size={13.5} className="th-header-icon" />
                      <span>Date</span>
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 4. Time */}
                  <th 
                    className="ptable-th th-sortable th-time" 
                    onClick={() => handleSort('time')}
                    title="Sort by Time"
                  >
                    <div className="th-content-flex">
                      <Clock size={13.5} className="th-header-icon" />
                      <span>Time</span>
                      {sortField === 'time' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 5. Email */}
                  <th 
                    className="ptable-th th-sortable th-email" 
                    onClick={() => handleSort('email')}
                    title="Sort by Email"
                  >
                    <div className="th-content-flex">
                      <Mail size={13.5} className="th-header-icon" />
                      <span>Email</span>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 6. Status */}
                  <th 
                    className="ptable-th th-sortable th-status"
                    onClick={() => handleSort('status')}
                    title="Sort by Status"
                  >
                    <div className="th-content-flex">
                      <CheckCircle2 size={13.5} className="th-header-icon" />
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 7. Amount */}
                  <th 
                    className="ptable-th th-sortable th-amount" 
                    onClick={() => handleSort('amount')}
                    title="Sort by Amount"
                  >
                    <div className="th-content-flex">
                      <CreditCard size={13.5} className="th-header-icon" />
                      <span>Amount</span>
                      {sortField === 'amount' && (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="sort-arrow" /> : <ArrowDown size={12} className="sort-arrow" />
                      )}
                    </div>
                  </th>

                  {/* 8. Action */}
                  <th className="ptable-th th-action">
                    <span>Action</span>
                  </th>
                </tr>
              </thead>

              {/* Data table rows PRESERVED exactly as transaction data table rows */}
              <tbody>
                {loading ? (
                  <TransactionTableSkeleton rows={pageSize || 9} />
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="ptable-empty-cell">
                      <div className="empty-state-box">
                        <ReceiptText size={36} className="empty-state-icon" />
                        <h3>No transactions found</h3>
                        <p>No transactions match your current search or filter criteria.</p>
                        <button className="ptable-btn-secondary" onClick={handleResetFilters}>
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => {
                    const isSelected = selectedTxIds.has(tx.id);

                    return (
                      <tr 
                        key={tx.id} 
                        className={`ptable-row ${isSelected ? 'row-selected' : ''}`}
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        {/* Checkbox Column */}
                        <td className="ptable-td td-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="ptable-checkbox-input"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(tx.id, e)}
                          />
                        </td>

                        {/* Description (Avatar + Name + Bank info) */}
                        <td className="ptable-td td-description">
                          <div className="tx-desc-wrapper">
                            <img
                              src={tx.avatar}
                              alt={tx.name}
                              className="tx-user-avatar"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                            <div className="tx-desc-meta">
                              <span className="tx-user-name">{tx.name}</span>
                              <span className="tx-user-sub">{tx.description}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="ptable-td td-category">
                          <span className="tx-category-text">{tx.category}</span>
                        </td>

                        {/* Date */}
                        <td className="ptable-td td-date">
                          <span className="tx-date-text">{tx.date}</span>
                        </td>

                        {/* Time */}
                        <td className="ptable-td td-time">
                          <span className="tx-time-text">{tx.time}</span>
                        </td>

                        {/* Email */}
                        <td className="ptable-td td-email">
                          <span className="tx-email-text">{tx.email}</span>
                        </td>

                        {/* Status */}
                        <td className="ptable-td td-status">
                          {renderStatusBadge(tx.status)}
                        </td>

                        {/* Amount */}
                        <td className="ptable-td td-amount">
                          <span className="tx-amount-text">{tx.amount}</span>
                        </td>

                        {/* Action */}
                        <td className="ptable-td td-action" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="tx-row-action-btn"
                            onClick={() => setSelectedTransaction(tx)}
                            title="View Transaction Details"
                            aria-label={`View details for ${tx.name}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer matching Participants UI */}
          <div className="ptable-footer-pagination">
            <div className="pagination-count-label">
              Showing {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>

            <div className="pagination-controls-center">
              {/* First Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Prev Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push('ellipsis-' + page);
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) => {
                  if (typeof item === 'string') {
                    return <span key={idx} className="pagination-ellipsis">…</span>;
                  }
                  return (
                    <button 
                      key={item} 
                      className={`pagination-page-number ${currentPage === item ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  );
                })}

              {/* Next Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>

              {/* Last Page */}
              <button 
                className="pagination-nav-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>

            {/* Rows Per Page Selector */}
            <div className="pagination-page-size-wrap">
              <span className="size-label">Rows per page:</span>
              <div className="size-select-box">
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="page-size-dropdown"
                >
                  <option value={9}>9 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown size={13} className="size-chevron" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar Popup matching Participants UI */}
        {selectedTxIds.size > 0 && (
          <div className="ptable-bulk-floating-bar">
            <span className="bulk-badge-count">{selectedTxIds.size} selected</span>

            <button className="bulk-bar-btn" onClick={handleBulkApprove} title="Mark selected as Success">
              <CheckCircle2 size={14} />
              <span>Mark Success</span>
            </button>

            <button 
              className="bulk-bar-btn" 
              onClick={handleBulkProcessing}
              title="Mark selected as In Progress"
            >
              <Loader2 size={14} />
              <span>Mark Processing</span>
            </button>

            <button className="bulk-bar-btn" onClick={handleBulkExportCSV} title="Export selected to CSV">
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button className="bulk-bar-btn danger" onClick={handleBulkRefund} title="Cancel/Refund selected">
              <Trash2 size={14} />
              <span>Cancel / Refund</span>
            </button>

            <button 
              className="bulk-close-btn" 
              onClick={() => setSelectedTxIds(new Set())}
              title="Deselect all"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Side Popup / Drawer matching Image 1 */}
        {selectedTransaction && (
          <TransactionDetailDrawer
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
