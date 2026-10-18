import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  Check,
  X,
  FileText,
  Download,
  ExternalLink,
  Copy,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowUpDown,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import {
  subscribeToHostApplications,
  approveHostApplication,
  rejectHostApplication
} from '../../services/hostService';
import { toDate } from '../../services/firebaseUtils';
import Pagination from '../../components/Common/Pagination';
import './HostApplications.css';

// Rejection Reason Presets
const REJECTION_PRESETS = [
  'Incomplete or blurry identity documents uploaded.',
  'Invalid GST or PAN number credentials verification failed.',
  'Organization credentials could not be validated or verified.',
  'Profile information does not meet hosting eligibility criteria.',
  'Duplicate or conflicting host application already exists.',
  'Business address could not be verified with tax records.'
];

export default function HostApplicationsPage() {
  const navigate = useNavigate();

  // Core Data
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search & Sorting
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | approved | rejected | today
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc | date_asc | name_asc | org_asc
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Active Selections
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approveConfirmApp, setApproveConfirmApp] = useState(null);
  const [rejectApp, setRejectApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null); // { name, url, type }

  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, desc, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, desc, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time listener for host applications
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToHostApplications(
      (data) => {
        setApplications(data);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to host_applications:', err);
        setLoading(false);
        addToast('Connection Notice', 'Listening with fallback mode: ' + err.message, 'info');
      }
    );
    return () => unsubscribe();
  }, [addToast]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortBy]);

  // Date formatting helper
  const formatAppDate = (timestamp) => {
    if (!timestamp) return { primary: 'Recently', relative: 'Just now' };
    const date = toDate(timestamp);
    if (!date || isNaN(date.getTime())) return { primary: 'Recently', relative: 'Just now' };

    const formatted = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      primary: `${formatted}, ${timeFormatted}`,
      relative: formatted
    };
  };

  // Check if date is today
  const isAppliedToday = (timestamp) => {
    if (!timestamp) return false;
    const date = toDate(timestamp);
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Top Statistics Cards Counts
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let todayCount = 0;

    applications.forEach((app) => {
      const s = (app.status || 'Pending').toLowerCase();
      if (s === 'pending') pending++;
      else if (s === 'approved') approved++;
      else if (s === 'rejected') rejected++;

      if (isAppliedToday(app.createdAt || app.appliedDate)) {
        todayCount++;
      }
    });

    return {
      total: applications.length,
      pending,
      approved,
      rejected,
      today: todayCount
    };
  }, [applications]);

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return applications
      .filter((app) => {
        // Status filtering
        const appStatus = (app.status || 'Pending').toLowerCase();
        if (statusFilter === 'pending' && appStatus !== 'pending') return false;
        if (statusFilter === 'approved' && appStatus !== 'approved') return false;
        if (statusFilter === 'rejected' && appStatus !== 'rejected') return false;
        if (statusFilter === 'today' && !isAppliedToday(app.createdAt || app.appliedDate)) return false;

        // Search filtering across Name, Email, Phone, Organization
        if (term) {
          const name = (app.fullName || app.name || '').toLowerCase();
          const email = (app.email || '').toLowerCase();
          const phone = (app.phone || app.phoneNumber || '').toLowerCase();
          const org = (app.organization || app.organizationName || '').toLowerCase();
          const city = (app.city || '').toLowerCase();

          const matches =
            name.includes(term) ||
            email.includes(term) ||
            phone.includes(term) ||
            org.includes(term) ||
            city.includes(term);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          const tA = toDate(a.createdAt || a.appliedDate)?.getTime() || 0;
          const tB = toDate(b.createdAt || b.appliedDate)?.getTime() || 0;
          return tB - tA;
        }
        if (sortBy === 'date_asc') {
          const tA = toDate(a.createdAt || a.appliedDate)?.getTime() || 0;
          const tB = toDate(b.createdAt || b.appliedDate)?.getTime() || 0;
          return tA - tB;
        }
        if (sortBy === 'name_asc') {
          const nA = (a.fullName || a.name || '').toLowerCase();
          const nB = (b.fullName || b.name || '').toLowerCase();
          return nA.localeCompare(nB);
        }
        if (sortBy === 'org_asc') {
          const oA = (a.organization || a.organizationName || '').toLowerCase();
          const oB = (b.organization || b.organizationName || '').toLowerCase();
          return oA.localeCompare(oB);
        }
        return 0;
      });
  }, [applications, statusFilter, searchTerm, sortBy]);

  // Paginated View
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // Copy helper
  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', `${label}: ${text}`, 'info');
  };

  // APPROVE FLOW
  const handleInitiateApprove = (app, e) => {
    if (e) e.stopPropagation();
    setApproveConfirmApp(app);
  };

  const handleConfirmApprove = async () => {
    if (!approveConfirmApp) return;
    const appId = approveConfirmApp.id;
    setActionLoadingId(appId);

    try {
      await approveHostApplication({
        application: approveConfirmApp,
        adminUser: { displayName: 'Nitroxx Admin' }
      });

      addToast(
        'Host Application Approved!',
        `Profile for ${approveConfirmApp.fullName || 'Host'} is now activated in event_host with active privileges.`
      );

      // If details modal was open for this app, update its local status
      if (selectedApplication?.id === appId) {
        setSelectedApplication((prev) => ({
          ...prev,
          status: 'Approved',
          isActive: true
        }));
      }

      setApproveConfirmApp(null);
    } catch (err) {
      console.error('Approval failed:', err);
      addToast('Approval Error', err.message || 'Failed to approve application', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // REJECT FLOW
  const handleInitiateReject = (app, e) => {
    if (e) e.stopPropagation();
    setRejectApp(app);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectApp) return;
    if (!rejectReason.trim()) {
      addToast('Validation', 'Please provide or select a rejection reason.', 'error');
      return;
    }

    const appId = rejectApp.id;
    setActionLoadingId(appId);

    try {
      await rejectHostApplication({
        application: rejectApp,
        reason: rejectReason.trim(),
        adminUser: { displayName: 'Nitroxx Admin' }
      });

      addToast(
        'Application Rejected',
        `Host application for ${rejectApp.fullName || 'applicant'} has been marked as Rejected.`
      );

      // If details modal was open for this app, update its local status
      if (selectedApplication?.id === appId) {
        setSelectedApplication((prev) => ({
          ...prev,
          status: 'Rejected',
          isActive: false,
          rejectionReason: rejectReason.trim()
        }));
      }

      setRejectApp(null);
      setRejectReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
      addToast('Rejection Error', err.message || 'Failed to reject application', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="host-applications-page">
      {/* Toast Stack */}
      <div className="host-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`host-toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={20} color="#10b981" />}
            {toast.type === 'error' && <XCircle size={20} color="#ef4444" />}
            {toast.type === 'info' && <Sparkles size={20} color="#3b82f6" />}
            <div className="host-toast-body">
              <div className="host-toast-title">{toast.title}</div>
              <div className="host-toast-desc">{toast.desc}</div>
            </div>
            <button className="host-toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="host-page-header">
        <div className="host-page-title-group">
          <h1>
            Host Applications
            <span className="host-live-indicator">
              <span className="live-pulse-dot" />
              Live Sync
            </span>
          </h1>
          <p>
            Review submitted credentials, GST & PAN compliance, verify organizer documents, and manage host approvals.
          </p>
        </div>

        <div className="host-header-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate('/hosts')}
            title="View Active Host List"
          >
            <Users size={16} />
            Host List
          </button>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="host-stats-grid">
        {/* Pending Card */}
        <div
          className={`host-stat-card ${statusFilter === 'pending' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        >
          <div className="host-stat-info">
            <span className="host-stat-label">Pending Applications</span>
            <span className="host-stat-count">{loading ? '...' : stats.pending}</span>
            <span className="host-stat-sub">Requires admin review</span>
          </div>
          <div className="host-stat-icon-wrap pending">
            <Clock size={24} />
          </div>
        </div>

        {/* Approved Card */}
        <div
          className={`host-stat-card ${statusFilter === 'approved' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
        >
          <div className="host-stat-info">
            <span className="host-stat-label">Approved Hosts</span>
            <span className="host-stat-count">{loading ? '...' : stats.approved}</span>
            <span className="host-stat-sub">Verified & active in event_host</span>
          </div>
          <div className="host-stat-icon-wrap approved">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Rejected Card */}
        <div
          className={`host-stat-card ${statusFilter === 'rejected' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="host-stat-info">
            <span className="host-stat-label">Rejected Applications</span>
            <span className="host-stat-count">{loading ? '...' : stats.rejected}</span>
            <span className="host-stat-sub">Declined submissions</span>
          </div>
          <div className="host-stat-icon-wrap rejected">
            <XCircle size={24} />
          </div>
        </div>

        {/* Today's Applications Card */}
        <div
          className={`host-stat-card ${statusFilter === 'today' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'today' ? 'all' : 'today')}
        >
          <div className="host-stat-info">
            <span className="host-stat-label">Today's Applications</span>
            <span className="host-stat-count">{loading ? '...' : stats.today}</span>
            <span className="host-stat-sub">Received in last 24 hours</span>
          </div>
          <div className="host-stat-icon-wrap today">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="host-main-card">
        {/* Toolbar Controls */}
        <div className="host-toolbar">
          {/* Search Box */}
          <div className="host-search-box">
            <Search size={16} className="host-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="host-search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="host-toolbar-right">
            {/* Filter Pills */}
            <div className="host-filter-pills">
              <button
                className={`host-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
                <span className="host-filter-badge">{stats.total}</span>
              </button>
              <button
                className={`host-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
                <span className="host-filter-badge">{stats.pending}</span>
              </button>
              <button
                className={`host-filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
                <span className="host-filter-badge">{stats.approved}</span>
              </button>
              <button
                className={`host-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
                <span className="host-filter-badge">{stats.rejected}</span>
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="host-sort-select">
              <ArrowUpDown size={14} color="#64748b" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date_desc">Newest Applied</option>
                <option value="date_asc">Oldest Applied</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="org_asc">Organization (A-Z)</option>
              </select>
            </div>

            {/* Quick Refresh */}
            <button
              className="icon-btn"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 300);
              }}
              title="Refresh applications"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="host-empty-state">
            <RefreshCw size={32} className="spin-slow" color="#ff6b00" />
            <h3>Loading Host Applications...</h3>
            <p>Syncing live Firestore records from <code>host_applications</code>.</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="host-empty-state">
            <div className="host-empty-icon">
              <FileText size={32} />
            </div>
            <h3>No applications found</h3>
            <p>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No host applications currently in the system. Applications submitted by organizers will appear here for review.'}
            </p>
          </div>
        ) : (
          <>
            <div className="host-table-responsive">
              <table className="host-table">
                <thead>
                  <tr>
                    <th>Applicant / Host</th>
                    <th>Organization</th>
                    <th>Contact Info</th>
                    <th>Location</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((app) => {
                    const name = app.fullName || app.name || 'Unnamed Applicant';
                    const email = app.email || '-';
                    const phone = app.phone || app.phoneNumber || '-';
                    const org = app.organization || app.organizationName || 'Independent Host';
                    const city = app.city || app.address || '-';
                    const state = app.state || '';
                    const photo = app.profilePhoto || app.photoURL || '';
                    const status = (app.status || 'Pending').toLowerCase();
                    const dates = formatAppDate(app.createdAt || app.appliedDate);

                    const isPending = status === 'pending';
                    const isBusy = actionLoadingId === app.id;

                    return (
                      <tr
                        key={app.id}
                        className="host-table-row"
                        onClick={() => setSelectedApplication(app)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Profile Photo & Name */}
                        <td>
                          <div className="host-profile-cell">
                            <div className="host-avatar-wrap">
                              {photo ? (
                                <img src={photo} alt={name} className="host-avatar-img" />
                              ) : (
                                <div className="host-avatar-initials">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="host-name-primary">{name}</div>
                              <div className="host-sub-info">
                                ID: {app.id.substring(0, 7)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td>
                          <div className="host-org-cell">
                            <span className="host-org-title" title={org}>
                              {org}
                            </span>
                            <span className="host-org-badge">
                              {app.organizationType || 'Club / Org'}
                            </span>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td>
                          <div className="host-contact-cell">
                            <span className="host-contact-item">
                              <Mail size={13} color="#94a3b8" />
                              <span>{email}</span>
                            </span>
                            {phone !== '-' && (
                              <span className="host-contact-item">
                                <Phone size={13} color="#94a3b8" />
                                <span>{phone}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* City / State */}
                        <td>
                          <div className="host-location-cell">
                            <MapPin size={14} color="#94a3b8" />
                            <span>
                              {city}
                              {state ? `, ${state}` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Applied Date */}
                        <td>
                          <div className="host-date-cell">
                            <span className="host-date-primary">{dates.relative}</span>
                            <span className="host-date-relative">{dates.primary.split(',')[1] || ''}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={`host-status-badge ${status}`}>
                            <span className="status-dot" />
                            {app.status || 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div
                            className="host-actions-group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* View Details */}
                            <button
                              className="host-btn-action host-btn-view"
                              onClick={() => setSelectedApplication(app)}
                              title="View all submitted details & documents"
                            >
                              <Eye size={14} />
                              Details
                            </button>

                            {/* Approve Button */}
                            {isPending && (
                              <button
                                className="host-btn-action host-btn-approve"
                                onClick={(e) => handleInitiateApprove(app, e)}
                                disabled={isBusy}
                                title="Approve application & create event_host document"
                              >
                                <Check size={14} />
                                {isBusy ? '...' : 'Approve'}
                              </button>
                            )}

                            {/* Reject Button */}
                            {isPending && (
                              <button
                                className="host-btn-action host-btn-reject"
                                onClick={(e) => handleInitiateReject(app, e)}
                                disabled={isBusy}
                                title="Reject application with reason"
                              >
                                <X size={14} />
                                {isBusy ? '...' : 'Reject'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredApplications.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW DETAILS MODAL                                                     */}
      {/* ========================================================================= */}
      {selectedApplication && (
        <div
          className="host-modal-backdrop"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="host-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="host-modal-header">
              <div className="host-modal-title">
                <Building size={20} color="var(--primary-orange)" />
                <h2>Host Application Details</h2>
              </div>
              <button
                className="host-modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="host-modal-body">
              {/* Hero Banner Profile */}
              <div className="host-modal-hero">
                <div
                  className="host-modal-hero-avatar"
                  onClick={() => {
                    if (selectedApplication.profilePhoto || selectedApplication.photoURL) {
                      setPreviewDoc({
                        name: `${selectedApplication.fullName || 'Host'} - Profile Photo`,
                        url: selectedApplication.profilePhoto || selectedApplication.photoURL,
                        type: 'image'
                      });
                    }
                  }}
                  title="Click to view full image"
                >
                  {selectedApplication.profilePhoto || selectedApplication.photoURL ? (
                    <img
                      src={selectedApplication.profilePhoto || selectedApplication.photoURL}
                      alt={selectedApplication.fullName}
                    />
                  ) : (
                    <div className="host-avatar-initials" style={{ fontSize: '1.6rem' }}>
                      {(selectedApplication.fullName || 'H').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="host-modal-hero-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3>{selectedApplication.fullName || selectedApplication.name || 'Applicant'}</h3>
                    <span
                      className={`host-status-badge ${(selectedApplication.status || 'Pending').toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {selectedApplication.status || 'Pending'}
                    </span>
                  </div>

                  <div className="host-modal-hero-meta">
                    <span>
                      <Building size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                      {selectedApplication.organization || selectedApplication.organizationName || 'Independent Host'}
                    </span>
                    <span>•</span>
                    <span>
                      Applied:{' '}
                      {formatAppDate(selectedApplication.createdAt || selectedApplication.appliedDate).primary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div className="host-details-section">
                <span className="host-details-section-title">
                  <Users size={15} /> Contact & Personal Details
                </span>
                <div className="host-info-card">
                  <div className="host-info-field">
                    <span className="host-info-label">Full Name</span>
                    <span className="host-info-value">{selectedApplication.fullName || '-'}</span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Email Address</span>
                    <span className="host-info-value">
                      {selectedApplication.email || '-'}
                      {selectedApplication.email && (
                        <button
                          className="host-copy-btn"
                          onClick={() => handleCopyText(selectedApplication.email, 'Email')}
                          title="Copy Email"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Phone Number</span>
                    <span className="host-info-value">
                      {selectedApplication.phone || selectedApplication.phoneNumber || '-'}
                      {(selectedApplication.phone || selectedApplication.phoneNumber) && (
                        <button
                          className="host-copy-btn"
                          onClick={() =>
                            handleCopyText(
                              selectedApplication.phone || selectedApplication.phoneNumber,
                              'Phone'
                            )
                          }
                          title="Copy Phone"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Alternate Phone</span>
                    <span className="host-info-value">
                      {selectedApplication.alternatePhone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organization & Tax Details */}
              <div className="host-details-section">
                <span className="host-details-section-title">
                  <ShieldCheck size={15} /> Organization & Tax Information
                </span>
                <div className="host-info-card">
                  <div className="host-info-field">
                    <span className="host-info-label">Organization Name</span>
                    <span className="host-info-value">
                      {selectedApplication.organization || selectedApplication.organizationName || '-'}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Organization Type</span>
                    <span className="host-info-value">
                      {selectedApplication.organizationType || 'Riding Club / Community'}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">GST Number</span>
                    <span className="host-info-value">
                      {selectedApplication.gst || selectedApplication.gstNumber || 'Unregistered / Not Provided'}
                      {(selectedApplication.gst || selectedApplication.gstNumber) && (
                        <button
                          className="host-copy-btn"
                          onClick={() =>
                            handleCopyText(
                              selectedApplication.gst || selectedApplication.gstNumber,
                              'GST'
                            )
                          }
                          title="Copy GST"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">PAN Number</span>
                    <span className="host-info-value">
                      {selectedApplication.pan || selectedApplication.panNumber || 'Not Provided'}
                      {(selectedApplication.pan || selectedApplication.panNumber) && (
                        <button
                          className="host-copy-btn"
                          onClick={() =>
                            handleCopyText(
                              selectedApplication.pan || selectedApplication.panNumber,
                              'PAN'
                            )
                          }
                          title="Copy PAN"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  {selectedApplication.bio && (
                    <div className="host-info-field full-width">
                      <span className="host-info-label">Organization Bio / Description</span>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                        {selectedApplication.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="host-details-section">
                <span className="host-details-section-title">
                  <MapPin size={15} /> Registered Address & Location
                </span>
                <div className="host-info-card">
                  <div className="host-info-field full-width">
                    <span className="host-info-label">Complete Street Address</span>
                    <span className="host-info-value">
                      {selectedApplication.address || 'Address not submitted'}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">City</span>
                    <span className="host-info-value">{selectedApplication.city || '-'}</span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">State</span>
                    <span className="host-info-value">{selectedApplication.state || '-'}</span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Pincode / Postal Code</span>
                    <span className="host-info-value">
                      {selectedApplication.pinCode || selectedApplication.pincode || '-'}
                    </span>
                  </div>
                  <div className="host-info-field">
                    <span className="host-info-label">Country</span>
                    <span className="host-info-value">{selectedApplication.country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="host-details-section">
                <span className="host-details-section-title">
                  <FileText size={15} /> Uploaded Documents & Credentials
                </span>

                {Array.isArray(selectedApplication.documents) && selectedApplication.documents.length > 0 ? (
                  <div className="host-docs-grid">
                    {selectedApplication.documents.map((docItem, index) => {
                      const isPdf =
                        docItem.mimeType?.includes('pdf') ||
                        docItem.url?.toLowerCase().includes('.pdf');
                      const docName = docItem.name || `Document #${index + 1}`;

                      return (
                        <div key={index} className="host-doc-item">
                          <div className="host-doc-left">
                            <div className={`host-doc-icon-wrap ${isPdf ? 'pdf' : 'image'}`}>
                              {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                            </div>
                            <div className="host-doc-meta">
                              <span className="host-doc-name" title={docName}>
                                {docName}
                              </span>
                              <span className="host-doc-type">
                                {isPdf ? 'PDF Document' : 'Image File'}
                              </span>
                            </div>
                          </div>

                          <div className="host-doc-actions">
                            <button
                              className="host-doc-btn primary"
                              onClick={() =>
                                setPreviewDoc({
                                  name: docName,
                                  url: docItem.url,
                                  type: isPdf ? 'pdf' : 'image'
                                })
                              }
                              title="Preview Document"
                            >
                              <Eye size={13} />
                              Preview
                            </button>

                            <a
                              href={docItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={docName}
                              className="host-doc-btn"
                              title="Download or Open Document"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 16,
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      color: '#64748b'
                    }}
                  >
                    No additional documents uploaded with this application.
                  </div>
                )}
              </div>

              {/* Approval History & Audit Trail */}
              <div className="host-details-section">
                <span className="host-details-section-title">
                  <Clock size={15} /> Approval History & Audit Trail
                </span>
                <div className="host-history-box">
                  <div className="host-history-item">
                    <span className="host-history-dot" />
                    <div className="host-history-content">
                      <span className="host-history-title">Application Submitted</span>
                      <span className="host-history-time">
                        {formatAppDate(selectedApplication.createdAt || selectedApplication.appliedDate).primary}
                      </span>
                    </div>
                  </div>

                  {(selectedApplication.status || '').toLowerCase() === 'approved' && (
                    <div className="host-history-item">
                      <span className="host-history-dot success" />
                      <div className="host-history-content">
                        <span className="host-history-title">
                          Approved by {selectedApplication.approvedBy || 'Admin'}
                        </span>
                        <span className="host-history-time">
                          {formatAppDate(selectedApplication.approvedAt).primary}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#059669', marginTop: 2 }}>
                          Document verified and active profile mapped into <code>event_host</code> collection.
                        </span>
                      </div>
                    </div>
                  )}

                  {(selectedApplication.status || '').toLowerCase() === 'rejected' && (
                    <div className="host-history-item">
                      <span className="host-history-dot danger" />
                      <div className="host-history-content">
                        <span className="host-history-title">
                          Rejected by {selectedApplication.reviewedBy || 'Admin'}
                        </span>
                        <span className="host-history-time">
                          {formatAppDate(selectedApplication.reviewedAt).primary}
                        </span>
                        {selectedApplication.rejectionReason && (
                          <div className="host-rejection-alert">
                            <strong>Reason:</strong> {selectedApplication.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="host-modal-footer">
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Application Ref:{' '}
                <code>{selectedApplication.id}</code>
              </div>

              <div className="host-modal-footer-actions">
                {(selectedApplication.status || 'Pending').toLowerCase() === 'pending' && (
                  <>
                    <button
                      className="btn-secondary"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => handleInitiateReject(selectedApplication)}
                    >
                      <X size={15} />
                      Reject Application
                    </button>
                    <button
                      className="btn-primary"
                      style={{ background: '#10b981' }}
                      onClick={() => handleInitiateApprove(selectedApplication)}
                    >
                      <Check size={15} />
                      Approve Application
                    </button>
                  </>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. APPROVE CONFIRMATION MODAL                                             */}
      {/* ========================================================================= */}
      {approveConfirmApp && (
        <div
          className="host-modal-backdrop"
          onClick={() => setApproveConfirmApp(null)}
        >
          <div
            className="host-modal-card modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="host-modal-header" style={{ background: '#ecfdf5' }}>
              <div className="host-modal-title">
                <CheckCircle size={22} color="#10b981" />
                <h2 style={{ color: '#065f46' }}>Confirm Host Approval</h2>
              </div>
              <button
                className="host-modal-close"
                onClick={() => setApproveConfirmApp(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="host-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to approve{' '}
                <strong>{approveConfirmApp.fullName || 'this host'}</strong> from{' '}
                <strong>{approveConfirmApp.organization || 'their organization'}</strong>?
              </p>

              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: '0.825rem',
                  color: '#166534',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <ShieldCheck size={15} /> Approval Actions:
                </div>
                <div>• Create or update verified profile in <code>event_host</code>.</div>
                <div>• Check existing records to guarantee <strong>never creating duplicates</strong>.</div>
                <div>• Set host status to <strong>Approved</strong> & <code>isActive = true</code>.</div>
                <div>• Send a real-time notification to the host applicant.</div>
              </div>
            </div>

            <div className="host-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setApproveConfirmApp(null)}
                disabled={actionLoadingId === approveConfirmApp.id}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: '#10b981' }}
                onClick={handleConfirmApprove}
                disabled={actionLoadingId === approveConfirmApp.id}
              >
                <Check size={16} />
                {actionLoadingId === approveConfirmApp.id ? 'Approving...' : 'Confirm & Approve Host'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REJECT REASON MODAL                                                    */}
      {/* ========================================================================= */}
      {rejectApp && (
        <div
          className="host-modal-backdrop"
          onClick={() => setRejectApp(null)}
        >
          <div
            className="host-modal-card modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="host-modal-header" style={{ background: '#fff1f2' }}>
              <div className="host-modal-title">
                <AlertTriangle size={22} color="#e11d48" />
                <h2 style={{ color: '#9f1239' }}>Reject Host Application</h2>
              </div>
              <button
                className="host-modal-close"
                onClick={() => setRejectApp(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="host-modal-body">
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.45 }}>
                Please specify why the application for{' '}
                <strong>{rejectApp.fullName || 'applicant'}</strong> is being rejected. This reason will be saved in the application audit log.
              </p>

              {/* Reason Presets */}
              <div className="host-presets-group">
                <span className="host-presets-title">Quick Select Reason:</span>
                <div className="host-presets-chips">
                  {REJECTION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="host-preset-chip"
                      onClick={() => setRejectReason(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Detailed Reason / Comments: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="host-textarea"
                  placeholder="Type or select a detailed rejection explanation..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: '#991b1b'
                }}
              >
                No document will be created in <code>event_host</code> for this applicant.
              </div>
            </div>

            <div className="host-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setRejectApp(null)}
                disabled={actionLoadingId === rejectApp.id}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: '#ef4444' }}
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectApp.id || !rejectReason.trim()}
              >
                <X size={16} />
                {actionLoadingId === rejectApp.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCUMENT PREVIEW LIGHTBOX                                              */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div
          className="host-lightbox-backdrop"
          onClick={() => setPreviewDoc(null)}
        >
          <div className="host-lightbox-topbar">
            <h4>{previewDoc.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.3)',
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} /> Open in New Tab
              </a>
              <button
                className="host-modal-close"
                style={{ color: '#ffffff' }}
                onClick={() => setPreviewDoc(null)}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div
            className="host-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {previewDoc.type === 'pdf' ? (
              <iframe
                src={previewDoc.url}
                title={previewDoc.name}
                className="host-lightbox-pdf-frame"
              />
            ) : (
              <img
                src={previewDoc.url}
                alt={previewDoc.name}
                className="host-lightbox-img"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
