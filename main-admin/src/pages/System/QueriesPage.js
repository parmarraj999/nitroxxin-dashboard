import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquareText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  User,
  HelpCircle,
  Sparkles,
  Inbox,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import './QueriesPage.css';

// Normalize date into a JavaScript Date object
const parseDate = (val) => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val.seconds) return new Date(val.seconds * 1000);
  if (val instanceof Date) return val;
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Format relative time (e.g. "5m ago", "2h ago", "3d ago")
const formatRelativeTime = (date) => {
  if (!date) return 'Recently';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Format date nicely
const formatFullDate = (date) => {
  if (!date) return 'N/A';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function QueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Query for Detail Modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('new');
  const [modalPriority, setModalPriority] = useState('normal');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Real-time listener to Firestore 'query' collection
  useEffect(() => {
    setLoading(true);
    setError(null);

    const queryCollectionRef = collection(db, 'query');
    const unsubscribe = onSnapshot(
      queryCollectionRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          const createdAtDate = parseDate(data.createdAt || data.timestamp || data.submittedAt || data.date);
          const updatedAtDate = parseDate(data.updatedAt);

          return {
            id: d.id,
            ...data,
            name: data.name || data.fullName || data.userName || data.customerName || data.senderName || 'Anonymous Rider',
            email: data.email || data.userEmail || data.contactEmail || '',
            phone: data.phone || data.phoneNumber || data.mobile || data.contactNumber || '',
            subject: data.subject || data.title || data.topic || data.queryType || data.category || 'General Query',
            message: data.message || data.query || data.description || data.inquiry || data.body || data.details || '',
            status: (data.status || 'new').toLowerCase(),
            priority: (data.priority || 'normal').toLowerCase(),
            category: data.category || data.type || data.inquiryType || 'General',
            source: data.source || data.origin || data.platform || 'Website',
            adminNotes: data.adminNotes || data.notes || '',
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            rawCreatedAt: data.createdAt
          };
        });

        setQueries(list);
        setLoading(false);
      },
      (err) => {
        console.error('[QueriesPage] Firestore subscription error:', err);
        setError(err.message || 'Failed to fetch queries');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update selected query state when modal opens or query updates
  useEffect(() => {
    if (selectedQuery) {
      // Find latest updated copy of selected query from queries array
      const current = queries.find((q) => q.id === selectedQuery.id) || selectedQuery;
      setAdminNotes(current.adminNotes || '');
      setModalStatus(current.status || 'new');
      setModalPriority(current.priority || 'normal');
    }
  }, [selectedQuery, queries]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, sortBy]);

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: queries.length,
      new: queries.filter((q) => q.status === 'new' || q.status === 'unread').length,
      in_progress: queries.filter((q) => q.status === 'in_progress' || q.status === 'pending').length,
      responded: queries.filter((q) => q.status === 'responded').length,
      resolved: queries.filter((q) => q.status === 'resolved').length,
      closed: queries.filter((q) => q.status === 'closed').length
    };
  }, [queries]);

  // Filtered and Sorted queries
  const processedQueries = useMemo(() => {
    return queries
      .filter((q) => {
        // Search filter
        const searchTarget = `${q.name} ${q.email} ${q.phone} ${q.subject} ${q.message} ${q.id} ${q.category}`.toLowerCase();
        const matchesSearch = !search || searchTarget.includes(search.trim().toLowerCase());

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'new') {
          matchesStatus = q.status === 'new' || q.status === 'unread';
        } else if (statusFilter === 'in_progress') {
          matchesStatus = q.status === 'in_progress' || q.status === 'pending';
        } else if (statusFilter !== 'all') {
          matchesStatus = q.status === statusFilter;
        }

        // Priority filter
        const matchesPriority = priorityFilter === 'all' || q.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        }
        if (sortBy === 'oldest') {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return aTime - bTime;
        }
        if (sortBy === 'priority') {
          const pRank = { urgent: 4, high: 3, normal: 2, medium: 2, low: 1 };
          return (pRank[b.priority] || 0) - (pRank[a.priority] || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [queries, search, statusFilter, priorityFilter, sortBy]);

  // Paginated queries for current page
  const paginatedQueries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedQueries.slice(start, start + pageSize);
  }, [processedQueries, currentPage, pageSize]);

  // Quick Status Update
  const handleUpdateStatus = async (queryId, newStatus) => {
    try {
      await updateDoc(doc(db, 'query', queryId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showToast(`Query marked as ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  // Quick Priority Update
  const handleUpdatePriority = async (queryId, newPriority) => {
    try {
      await updateDoc(doc(db, 'query', queryId), {
        priority: newPriority,
        updatedAt: serverTimestamp()
      });
      showToast(`Priority set to ${newPriority}`);
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Failed to update priority: ' + err.message);
    }
  };

  // Save Admin Notes
  const handleSaveAdminNotes = async () => {
    if (!selectedQuery) return;
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'query', selectedQuery.id), {
        adminNotes: adminNotes,
        status: modalStatus,
        priority: modalPriority,
        updatedAt: serverTimestamp()
      });
      showToast('Admin notes and details saved successfully');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Delete Query
  const handleDeleteQuery = async (queryId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this query?')) return;

    try {
      await deleteDoc(doc(db, 'query', queryId));
      if (selectedQuery?.id === queryId) {
        setSelectedQuery(null);
      }
      showToast('Query deleted successfully');
    } catch (err) {
      console.error('Error deleting query:', err);
      alert('Failed to delete query: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (processedQueries.length === 0) {
      alert('No queries to export.');
      return;
    }

    const headers = ['Query ID', 'Sender Name', 'Email', 'Phone', 'Subject', 'Message', 'Category', 'Status', 'Priority', 'Received Date', 'Admin Notes'];
    const rows = processedQueries.map((q) => [
      q.id,
      q.name,
      q.email,
      q.phone,
      q.subject,
      q.message.replace(/"/g, '""'),
      q.category,
      q.status,
      q.priority,
      q.createdAt ? q.createdAt.toISOString() : '',
      (q.adminNotes || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nitroxxin_queries_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate Sample Demo Queries for testing
  const handleSeedSampleQueries = async () => {
    const samples = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        subject: 'Custom exhaust fitment for Duke 390',
        message: 'Hi team, I am looking to purchase the Akrapovic slip-on exhaust listed on Nitroxxin. Can you confirm if this requires ECU remapping or additional headers for the 2025 KTM Duke 390 model?',
        category: 'Product Inquiry',
        status: 'new',
        priority: 'high',
        source: 'Website Contact Page',
        createdAt: new Date()
      },
      {
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@gmail.com',
        phone: '+91 98220 11223',
        subject: 'Monsoon Ride 2026 Booking Refund Query',
        message: 'I booked 2 passes for the upcoming Lonavala monsoon trail ride. My co-rider has fallen ill and cannot attend. Can we reschedule to the next weekend batch or get a partial credit note?',
        category: 'Event Support',
        status: 'in_progress',
        priority: 'urgent',
        source: 'Mobile App',
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        name: 'Pooja Iyer',
        email: 'pooja.iyer@riderz.in',
        phone: '+91 97654 88990',
        subject: 'Wholesale gear partnership inquiry',
        message: 'Hello Nitroxxin management, we run a riding club and motorcycle training academy in Bengaluru. We would like to collaborate for bulk gear purchases (helmets, riding jackets, and gloves) for our 120+ active members.',
        category: 'Partnership',
        status: 'new',
        priority: 'normal',
        source: 'Website Contact Form',
        createdAt: new Date(Date.now() - 3600000 * 18)
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@motor.co',
        phone: '+91 91234 56780',
        subject: 'Delivery delayed for Order #NX-99482',
        message: 'My order containing the Alpinestars riding boots was supposed to arrive by yesterday. The tracking status still shows packed in warehouse. Please escalate with the courier partner.',
        category: 'Order Dispatch',
        status: 'resolved',
        priority: 'high',
        source: 'Order Page Help Form',
        createdAt: new Date(Date.now() - 86400000 * 2)
      }
    ];

    try {
      setLoading(true);
      for (const sample of samples) {
        await addDoc(collection(db, 'query'), sample);
      }
      showToast('Added 4 sample queries for testing');
    } catch (err) {
      console.error('Error seeding demo queries:', err);
      alert('Failed to seed queries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="queries-page">
      {/* Page Header */}
      <div className="queries-header">
        <div className="queries-title-group">
          <div className="queries-title-row">
            <h1 className="queries-title">Customer & Rider Queries</h1>
            <span className="queries-live-badge">
              <span className="live-pulse-dot" />
              Realtime Query Feed
            </span>
          </div>
          <p className="queries-subtitle">
            Manage incoming contact inquiries, product fitment questions, event tickets support, and rider assistance requests.
          </p>
        </div>

        <div className="queries-header-actions">
          {queries.length === 0 && !loading && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSeedSampleQueries}
              title="Add sample queries to test the popup and feed"
            >
              <Sparkles size={16} color="#ff6b00" />
              <span>Add Demo Queries</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCsv}
            disabled={processedQueries.length === 0}
            title="Export filtered queries to CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="queries-metrics-grid">
        <div
          className={`query-metric-card ${statusFilter === 'all' ? 'active-metric' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="query-metric-icon-wrap icon-wrap-total">
            <MessageSquareText size={22} />
          </div>
          <div className="query-metric-info">
            <span className="query-metric-label">Total Queries</span>
            <span className="query-metric-value">{loading ? '...' : statusCounts.all}</span>
            <span className="query-metric-sub">All inquiries received</span>
          </div>
        </div>

        <div
          className={`query-metric-card ${statusFilter === 'new' ? 'active-metric' : ''}`}
          onClick={() => setStatusFilter('new')}
        >
          <div className="query-metric-icon-wrap icon-wrap-new">
            <AlertCircle size={22} />
          </div>
          <div className="query-metric-info">
            <span className="query-metric-label">New / Unread</span>
            <span className="query-metric-value">{loading ? '...' : statusCounts.new}</span>
            <span className="query-metric-sub">Requires admin attention</span>
          </div>
        </div>

        <div
          className={`query-metric-card ${statusFilter === 'in_progress' ? 'active-metric' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          <div className="query-metric-icon-wrap icon-wrap-progress">
            <Clock size={22} />
          </div>
          <div className="query-metric-info">
            <span className="query-metric-label">In Progress</span>
            <span className="query-metric-value">{loading ? '...' : statusCounts.in_progress}</span>
            <span className="query-metric-sub">Currently being handled</span>
          </div>
        </div>

        <div
          className={`query-metric-card ${statusFilter === 'resolved' ? 'active-metric' : ''}`}
          onClick={() => setStatusFilter('resolved')}
        >
          <div className="query-metric-icon-wrap icon-wrap-resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="query-metric-info">
            <span className="query-metric-label">Resolved</span>
            <span className="query-metric-value">{loading ? '...' : statusCounts.resolved}</span>
            <span className="query-metric-sub">
              {statusCounts.all > 0
                ? `${Math.round((statusCounts.resolved / statusCounts.all) * 100)}% resolution rate`
                : 'Completed issues'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Queries Table Card */}
      <div className="queries-card">
        {/* Toolbar */}
        <div className="queries-toolbar">
          <div className="queries-toolbar-top">
            {/* Search */}
            <div className="queries-search-box">
              <Search size={16} className="queries-search-icon" />
              <input
                type="text"
                className="queries-search-input"
                placeholder="Search sender, email, phone, subject, or query text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <span className="queries-clear-search" onClick={() => setSearch('')} title="Clear search">
                  <X size={14} />
                </span>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="queries-filters-row">
              <select
                className="queries-filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                title="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              <select
                className="queries-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                title="Sort queries"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (Highest)</option>
                <option value="name">Sender Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="queries-status-tabs">
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Queries
              <span className="status-tab-count">{statusCounts.all}</span>
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'new' ? 'active' : ''}`}
              onClick={() => setStatusFilter('new')}
            >
              New
              <span className="status-tab-count">{statusCounts.new}</span>
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              In Progress
              <span className="status-tab-count">{statusCounts.in_progress}</span>
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'responded' ? 'active' : ''}`}
              onClick={() => setStatusFilter('responded')}
            >
              Responded
              <span className="status-tab-count">{statusCounts.responded}</span>
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('resolved')}
            >
              Resolved
              <span className="status-tab-count">{statusCounts.resolved}</span>
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'closed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('closed')}
            >
              Closed
              <span className="status-tab-count">{statusCounts.closed}</span>
            </button>
          </div>
        </div>

        {/* Table / List View */}
        {loading ? (
          <div className="queries-loading-spinner">
            <RefreshCw size={28} className="queries-spin" color="#ff6b00" />
            <p>Loading queries from Firestore...</p>
          </div>
        ) : error ? (
          <div className="queries-empty-state">
            <AlertCircle size={36} color="#ef4444" />
            <h3>Unable to load queries</h3>
            <p>{error}</p>
          </div>
        ) : processedQueries.length === 0 ? (
          <div className="queries-empty-state">
            <div className="queries-empty-icon">
              <Inbox size={32} />
            </div>
            <h3>No queries found</h3>
            <p>
              {search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search criteria or reset filters to see all queries.'
                : 'Customer inquiries, fitment questions, and contact requests will appear here as riders submit them.'}
            </p>
            {queries.length === 0 && (
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '8px' }}
                onClick={handleSeedSampleQueries}
              >
                <Sparkles size={16} />
                Generate Sample Queries
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="queries-table-wrap">
              <table className="queries-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject & Message</th>
                    <th>Received Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQueries.map((query) => {
                    const isUnread = query.status === 'new' || query.status === 'unread';
                    const initials = query.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'Q';

                    return (
                      <tr
                        key={query.id}
                        className={`queries-table-row ${isUnread ? 'unread-row' : ''}`}
                        onClick={() => setSelectedQuery(query)}
                        title="Click to view full query details"
                      >
                        {/* Sender */}
                        <td>
                          <div className="query-sender-cell">
                            <div className="query-avatar">{initials}</div>
                            <div className="query-sender-meta">
                              <span className="query-sender-name">{query.name}</span>
                              <div className="query-sender-contact">
                                {query.email && (
                                  <span className="query-contact-item" title={query.email}>
                                    <Mail size={12} />
                                    <span>{query.email}</span>
                                  </span>
                                )}
                                {query.phone && (
                                  <span className="query-contact-item" title={query.phone}>
                                    <Phone size={12} />
                                    <span>{query.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Subject & Message Preview */}
                        <td>
                          <div className="query-content-cell">
                            <div className="query-subject-line">
                              <span className="query-subject-text">{query.subject}</span>
                              {query.category && (
                                <span className="query-category-tag">{query.category}</span>
                              )}
                            </div>
                            <p className="query-message-snippet">
                              {query.message || <em style={{ color: '#94a3b8' }}>No message text provided</em>}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td>
                          <div className="query-date-cell">
                            <span className="query-date-main">
                              {query.createdAt
                                ? query.createdAt.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : '-'}
                            </span>
                            <span className="query-date-rel">
                              {formatRelativeTime(query.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td>
                          <span className={`query-priority-badge priority-${query.priority}`}>
                            {query.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`query-status-badge status-${query.status}`}>
                            <span className="badge-dot" />
                            {query.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <div className="query-actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="query-action-btn btn-view"
                              title="View Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuery(query);
                              }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="query-action-btn btn-delete"
                              title="Delete Query"
                              onClick={(e) => handleDeleteQuery(query.id, e)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalItems={processedQueries.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ========================================================
          DETAIL POPUP MODAL (WHEN ADMIN CLICKS A QUERY)
          ======================================================== */}
      {selectedQuery && (
        <div
          className="query-modal-overlay"
          onClick={() => setSelectedQuery(null)}
        >
          <div
            className="query-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="query-modal-header">
              <div className="query-modal-title-wrap">
                <h2>Query Details</h2>
                <div
                  className="query-id-pill"
                  onClick={() => handleCopy(selectedQuery.id, 'modal-id')}
                  title="Click to copy ID"
                >
                  <span>ID: {selectedQuery.id.slice(0, 8)}...</span>
                  {copiedField === 'modal-id' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </div>
                <span className={`query-status-badge status-${modalStatus}`}>
                  <span className="badge-dot" />
                  {modalStatus.replace('_', ' ')}
                </span>
                <span className={`query-priority-badge priority-${modalPriority}`}>
                  {modalPriority}
                </span>
              </div>

              <div className="query-modal-header-actions">
                <button
                  type="button"
                  className="query-modal-close-btn"
                  onClick={() => setSelectedQuery(null)}
                  title="Close popup (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="query-modal-body">
              <div className="query-modal-grid">
                {/* Left Column: Sender & Inquiry Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Sender Profile Box */}
                  <div className="query-info-box">
                    <h3 className="query-box-title">
                      <User size={16} />
                      Sender Contact Details
                    </h3>

                    <div className="query-sender-profile-row">
                      <div className="query-sender-avatar-lg">
                        {selectedQuery.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'Q'}
                      </div>
                      <div className="query-sender-profile-info">
                        <span className="query-sender-profile-name">{selectedQuery.name}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Submitted: {formatFullDate(selectedQuery.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="query-detail-contact-list">
                      {selectedQuery.email ? (
                        <div className="query-contact-row">
                          <div className="query-contact-left">
                            <Mail size={15} color="#64748b" />
                            <span>{selectedQuery.email}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="query-contact-action-btn"
                              onClick={() => handleCopy(selectedQuery.email, 'sender-email')}
                              title="Copy Email"
                            >
                              {copiedField === 'sender-email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              <span>Copy</span>
                            </button>
                            <a
                              href={`mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(selectedQuery.subject)}&body=Hello ${encodeURIComponent(selectedQuery.name)},%0D%0A%0D%0AThank you for contacting Nitroxxin Support regarding: "${encodeURIComponent(selectedQuery.subject)}".%0D%0A%0D%0A`}
                              className="query-contact-action-btn"
                              style={{ textDecoration: 'none' }}
                            >
                              <Send size={12} />
                              <span>Email</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="query-contact-row">
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No email provided</span>
                        </div>
                      )}

                      {selectedQuery.phone ? (
                        <div className="query-contact-row">
                          <div className="query-contact-left">
                            <Phone size={15} color="#64748b" />
                            <span>{selectedQuery.phone}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="query-contact-action-btn"
                              onClick={() => handleCopy(selectedQuery.phone, 'sender-phone')}
                              title="Copy Phone Number"
                            >
                              {copiedField === 'sender-phone' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              <span>Copy</span>
                            </button>
                            <a
                              href={`tel:${selectedQuery.phone}`}
                              className="query-contact-action-btn"
                              style={{ textDecoration: 'none' }}
                            >
                              <Phone size={12} />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="query-contact-row">
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No phone number provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Content Box */}
                  <div className="query-info-box">
                    <h3 className="query-box-title">
                      <FileText size={16} />
                      Query & Message Details
                    </h3>

                    <div className="query-subject-block">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Subject / Topic
                      </span>
                      <h4 className="query-subject-heading">{selectedQuery.subject}</h4>
                    </div>

                    <div className="query-subject-block">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Message Body
                      </span>
                      <div className="query-message-quote">
                        {selectedQuery.message || 'No message content provided.'}
                      </div>
                    </div>

                    {/* Metadata items */}
                    <div className="query-metadata-grid">
                      <div className="query-meta-item">
                        <span className="query-meta-k">Category</span>
                        <span className="query-meta-v">{selectedQuery.category}</span>
                      </div>
                      <div className="query-meta-item">
                        <span className="query-meta-k">Origin Source</span>
                        <span className="query-meta-v">{selectedQuery.source}</span>
                      </div>
                      {selectedQuery.userId && (
                        <div className="query-meta-item">
                          <span className="query-meta-k">User ID</span>
                          <span className="query-meta-v">{selectedQuery.userId}</span>
                        </div>
                      )}
                      {selectedQuery.orderId && (
                        <div className="query-meta-item">
                          <span className="query-meta-k">Order ID</span>
                          <span className="query-meta-v">{selectedQuery.orderId}</span>
                        </div>
                      )}
                      {selectedQuery.productId && (
                        <div className="query-meta-item">
                          <span className="query-meta-k">Product ID</span>
                          <span className="query-meta-v">{selectedQuery.productId}</span>
                        </div>
                      )}
                      {selectedQuery.eventId && (
                        <div className="query-meta-item">
                          <span className="query-meta-k">Event ID</span>
                          <span className="query-meta-v">{selectedQuery.eventId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Admin Management & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status & Resolution Controls */}
                  <div className="query-info-box">
                    <h3 className="query-box-title">
                      <CheckCircle2 size={16} />
                      Resolution & Status
                    </h3>

                    <div className="query-form-group">
                      <label className="query-form-label">Query Status</label>
                      <select
                        className="query-form-select"
                        value={modalStatus}
                        onChange={(e) => setModalStatus(e.target.value)}
                      >
                        <option value="new">New (Unread)</option>
                        <option value="in_progress">In Progress</option>
                        <option value="responded">Responded</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="query-form-group">
                      <label className="query-form-label">Priority Level</label>
                      <select
                        className="query-form-select"
                        value={modalPriority}
                        onChange={(e) => setModalPriority(e.target.value)}
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="query-form-group">
                      <label className="query-form-label">Admin Internal Notes & Remarks</label>
                      <textarea
                        className="query-form-textarea"
                        placeholder="Add internal investigation notes, resolution summary, or drafted reply..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveAdminNotes}
                      disabled={savingNotes}
                      style={{ width: '100%' }}
                    >
                      {savingNotes ? (
                        <>
                          <RefreshCw size={15} className="queries-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Save Query Updates</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="query-info-box">
                    <h3 className="query-box-title">
                      <Sparkles size={16} />
                      Quick Actions
                    </h3>

                    <div className="query-quick-actions-bar">
                      {selectedQuery.email && (
                        <a
                          href={`mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(selectedQuery.subject)}&body=Hello ${encodeURIComponent(selectedQuery.name)},%0D%0A%0D%0AThank you for contacting Nitroxxin Support regarding: "${encodeURIComponent(selectedQuery.subject)}".%0D%0A%0D%0A`}
                          className="btn-email-reply"
                        >
                          <Send size={15} />
                          <span>Reply via Email Client</span>
                        </a>
                      )}

                      <div className="query-action-subrow">
                        <button
                          type="button"
                          className="btn-quick-progress"
                          onClick={() => {
                            setModalStatus('in_progress');
                            handleUpdateStatus(selectedQuery.id, 'in_progress');
                          }}
                        >
                          <Clock size={14} />
                          <span>In Progress</span>
                        </button>
                        <button
                          type="button"
                          className="btn-quick-resolve"
                          onClick={() => {
                            setModalStatus('resolved');
                            handleUpdateStatus(selectedQuery.id, 'resolved');
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Resolve</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-delete-query"
                        onClick={() => handleDeleteQuery(selectedQuery.id)}
                      >
                        <Trash2 size={14} />
                        <span>Delete Query</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="query-modal-footer">
              <div>
                {toastMessage && (
                  <span className="query-toast-inline">
                    <CheckCircle2 size={16} />
                    {toastMessage}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedQuery(null)}
                >
                  Close
                </button>
                {selectedQuery.email && (
                  <a
                    href={`mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(selectedQuery.subject)}&body=Hello ${encodeURIComponent(selectedQuery.name)},%0D%0A%0D%0AThank you for contacting Nitroxxin Support regarding: "${encodeURIComponent(selectedQuery.subject)}".%0D%0A%0D%0A`}
                    className="btn-primary"
                  >
                    <Send size={15} />
                    <span>Reply to Sender</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
