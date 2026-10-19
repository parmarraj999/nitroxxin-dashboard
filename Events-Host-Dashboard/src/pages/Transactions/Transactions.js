import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  FileText
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { INITIAL_TRANSACTIONS } from './transactionsData';
import TransactionDetailDrawer from './TransactionDetailDrawer';
import './Transactions.css';

const Transactions = () => {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y'); // '1D' | '7D' | '1M' | '1Y'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Success' | 'In progress' | 'Failed' | 'Pending'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // 9 items per page matching Image 2
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Timeframe pills matching Image 2
  const timeframeOptions = ['1D', '7D', '1M', '1Y'];

  // Categories list
  const categoryOptions = ['All', 'Send Money', 'Request Money'];

  // Status list
  const statusOptions = ['All', 'Success', 'In progress', 'Failed', 'Pending'];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tx.name.toLowerCase().includes(q);
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesEmail = tx.email.toLowerCase().includes(q);
        const matchesAmount = tx.amount.toLowerCase().includes(q);
        const matchesInvoice = tx.invoice && tx.invoice.toLowerCase().includes(q);
        const matchesCust = tx.customerId && tx.customerId.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesEmail && !matchesAmount && !matchesInvoice && !matchesCust) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (tx.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'All') {
        if (tx.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, statusFilter, categoryFilter]);

  // Pagination calculation
  const totalEntries = 300; // Display entries count matching Image 2
  const totalFilteredCount = filteredTransactions.length;

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Checkbox selection handlers
  const isAllSelected = paginatedTransactions.length > 0 && 
    paginatedTransactions.every((tx) => selectedTxIds.has(tx.id));

  const handleSelectAll = (e) => {
    const next = new Set(selectedTxIds);
    if (e.target.checked) {
      paginatedTransactions.forEach((tx) => next.add(tx.id));
    } else {
      paginatedTransactions.forEach((tx) => next.delete(tx.id));
    }
    setSelectedTxIds(next);
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedTxIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTxIds(next);
  };

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

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Email', 'Description', 'Category', 'Date', 'Time', 'Status', 'Amount'];
    const rows = filteredTransactions.map(tx => [
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
    link.setAttribute('download', `transactions_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout searchPlaceholder="Search dashboard..." showQuickCreate={false}>
      <div className="transactions-page-container">
        {/* Main Content Area */}
        <div className="transactions-main-wrapper">
          
          {/* Top Bar Header with Title, Search, and 1D 7D 1M 1Y Filters matching Image 2 */}
          <div className="tx-header-bar">
            {/* Left: Icon and Title */}
            <div className="tx-title-group">
              <div className="tx-title-icon-box">
                <FileText size={18} />
              </div>
              <h1 className="tx-page-title">Transactions History</h1>
            </div>

            {/* Right: Search Bar and Timeframe Filters */}
            <div className="tx-header-controls">
              {/* Search Pill */}
              <div className="tx-search-box">
                <Search size={15} className="tx-search-icon" />
                <input
                  type="text"
                  className="tx-search-input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Timeframe Button Pills: 1D, 7D, 1M, 1Y */}
              <div className="tx-timeframe-group">
                {timeframeOptions.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={`tx-timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Controls Bar: Status / Category Filter & Export */}
          <div className="tx-secondary-bar">
            <div className="tx-filter-chips">
              <span className="tx-filter-label">Status:</span>
              {statusOptions.map((st) => (
                <button
                  key={st}
                  className={`tx-filter-chip ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="tx-actions-right">
              {selectedTxIds.size > 0 && (
                <span className="tx-selected-count-chip">
                  {selectedTxIds.size} selected
                </span>
              )}
              <button 
                type="button" 
                className="tx-export-btn"
                onClick={handleExportCSV}
                title="Export filtered transactions as CSV"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Transactions Table Card matching Image 2 */}
          <div className="tx-table-card">
            <div className="tx-table-responsive">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th className="th-checkbox">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="tx-custom-checkbox"
                        aria-label="Select all transactions"
                      />
                    </th>
                    <th className="th-description">Description</th>
                    <th className="th-category">Category</th>
                    <th className="th-date">Date</th>
                    <th className="th-time">Time</th>
                    <th className="th-email">Email</th>
                    <th className="th-status">Status</th>
                    <th className="th-amount">Amount</th>
                    <th className="th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => {
                      const isSelected = selectedTxIds.has(tx.id);
                      return (
                        <tr
                          key={tx.id}
                          className={`tx-table-row ${isSelected ? 'row-selected' : ''}`}
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          {/* Checkbox */}
                          <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleSelect(tx.id, e)}
                              className="tx-custom-checkbox"
                            />
                          </td>

                          {/* Description (Avatar + Name + Bank info) */}
                          <td className="td-description">
                            <div className="tx-desc-wrapper">
                              <img
                                src={tx.avatar}
                                alt={tx.name}
                                className="tx-user-avatar"
                              />
                              <div className="tx-desc-meta">
                                <span className="tx-user-name">{tx.name}</span>
                                <span className="tx-user-sub">{tx.description}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="td-category">
                            <span className="tx-category-text">{tx.category}</span>
                          </td>

                          {/* Date */}
                          <td className="td-date">
                            <span className="tx-date-text">{tx.date}</span>
                          </td>

                          {/* Time */}
                          <td className="td-time">
                            <span className="tx-time-text">{tx.time}</span>
                          </td>

                          {/* Email */}
                          <td className="td-email">
                            <span className="tx-email-text">{tx.email}</span>
                          </td>

                          {/* Status */}
                          <td className="td-status">
                            {renderStatusBadge(tx.status)}
                          </td>

                          {/* Amount */}
                          <td className="td-amount">
                            <span className="tx-amount-text">{tx.amount}</span>
                          </td>

                          {/* Action */}
                          <td className="td-action" onClick={(e) => e.stopPropagation()}>
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
                  ) : (
                    <tr>
                      <td colSpan="9" className="tx-empty-state-cell">
                        <div className="tx-empty-box">
                          <FileText size={32} color="#94a3b8" />
                          <p>No transactions match your current search or filters.</p>
                          <button
                            type="button"
                            className="tx-reset-filter-btn"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('All');
                              setCategoryFilter('All');
                            }}
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching Image 2 */}
            <div className="tx-pagination-bar">
              <div className="tx-pagination-info">
                Showing {paginatedTransactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, totalFilteredCount)} of {totalEntries} entries
              </div>

              <div className="tx-pagination-controls">
                <button
                  type="button"
                  className="tx-page-arrow-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                {/* Page numbers */}
                <button
                  type="button"
                  className={`tx-page-num-btn ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>

                <button
                  type="button"
                  className={`tx-page-num-btn ${currentPage === 2 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>

                <button
                  type="button"
                  className={`tx-page-num-btn ${currentPage === 3 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </button>

                <span className="tx-page-ellipsis">...</span>

                <button
                  type="button"
                  className={`tx-page-num-btn ${currentPage === 12 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(12)}
                >
                  12
                </button>

                <button
                  type="button"
                  className="tx-page-arrow-btn"
                  disabled={currentPage >= 12}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, 12))}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

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
