import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
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
  XCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  User,
  Instagram,
  Video,
  Share2,
  FileText,
  ChevronDown,
  ArrowUpDown,
  Maximize2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import './AffiliateQueriesPage.css';

// Normalize Firestore timestamp or ISO string into Date
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

// Format full date & time
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

// Rejection reason quick presets
const REJECTION_PRESETS = [
  'Instagram account does not meet minimum active rider audience criteria.',
  'Screenshot of analytics dashboard is unclear or unverified.',
  'Content does not align with Nitroxx community rider guidelines.',
  'Duplicate or already registered affiliate creator profile.',
  'Profile engagement metrics require further organic growth.'
];

export default function AffiliateQueriesPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters, Search & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | approved | rejected
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | name
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Selected Creator
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [rejectingCreator, setRejectingCreator] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Non-blocking toast messages
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  // Real-time listener on 'affiliate_creator' collection
  useEffect(() => {
    setLoading(true);
    setError(null);

    const colRef = collection(db, 'affiliate_creator');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          const createdAtDate = parseDate(data.createdAt || data.submittedAt || data.timestamp);
          const updatedAtDate = parseDate(data.updatedAt);
          const approvedAtDate = parseDate(data.approvedAt);

          return {
            id: d.id,
            ...data,
            name: data.name || data.fullName || 'Creator',
            email: data.email || '',
            phone: data.phone || '',
            instagramUsername: data.instagramUsername || '',
            instagramDashboardScreenshot: data.instagramDashboardScreenshot || null,
            socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
            viralVideoLink: data.viralVideoLink || '',
            shortDescription: data.shortDescription || data.bio || '',
            status: (data.status || 'pending').toLowerCase().trim(),
            adminNotes: data.adminNotes || '',
            rejectionReason: data.rejectionReason || '',
            userId: data.userId || '',
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            approvedAt: approvedAtDate
          };
        });

        setCreators(list);
        setLoading(false);
      },
      (err) => {
        console.error('[AffiliateQueriesPage] Firestore subscription error:', err);
        setError(err.message || 'Failed to fetch creator applications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Synchronize modal notes when selected creator updates
  useEffect(() => {
    if (selectedCreator) {
      const live = creators.find((c) => c.id === selectedCreator.id) || selectedCreator;
      setAdminNotes(live.adminNotes || '');
    }
  }, [selectedCreator, creators]);

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  // Copy helper
  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. One-click Approve Creator
  const handleApprove = async (creator, e) => {
    if (e) e.stopPropagation();
    const creatorName = creator.name || 'Creator';
    if (window.confirm(`Approve affiliate creator application for "${creatorName}" (@${creator.instagramUsername})?`)) {
      try {
        await updateDoc(doc(db, 'affiliate_creator', creator.id), {
          status: 'approved',
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        showToast(`✅ "${creatorName}" approved successfully as affiliate creator!`);
        if (selectedCreator?.id === creator.id) {
          setSelectedCreator((prev) => ({ ...prev, status: 'approved' }));
        }
      } catch (err) {
        console.error('Approval failed:', err);
        alert('Failed to approve creator: ' + err.message);
      }
    }
  };

  // 2. Reject Creator with reason
  const handleInitiateReject = (creator, e) => {
    if (e) e.stopPropagation();
    setRejectingCreator(creator);
    setRejectionReason(creator.rejectionReason || REJECTION_PRESETS[0]);
  };

  const handleConfirmReject = async () => {
    if (!rejectingCreator) return;
    const creatorName = rejectingCreator.name || 'Creator';
    try {
      await updateDoc(doc(db, 'affiliate_creator', rejectingCreator.id), {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast(`Application for "${creatorName}" marked as rejected.`);
      if (selectedCreator?.id === rejectingCreator.id) {
        setSelectedCreator((prev) => ({ ...prev, status: 'rejected', rejectionReason }));
      }
      setRejectingCreator(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject creator: ' + err.message);
    }
  };

  // 3. Mark back to Pending
  const handleMarkPending = async (creator, e) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, 'affiliate_creator', creator.id), {
        status: 'pending',
        updatedAt: serverTimestamp()
      });
      showToast(`Application set back to Pending status.`);
      if (selectedCreator?.id === creator.id) {
        setSelectedCreator((prev) => ({ ...prev, status: 'pending' }));
      }
    } catch (err) {
      console.error('Status reset failed:', err);
      alert('Failed to reset status: ' + err.message);
    }
  };

  // 4. Save Admin Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedCreator) return;
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'affiliate_creator', selectedCreator.id), {
        adminNotes: adminNotes.trim(),
        updatedAt: serverTimestamp()
      });
      showToast('Admin verification notes saved!');
      setSelectedCreator((prev) => ({ ...prev, adminNotes: adminNotes.trim() }));
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Error saving notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // 5. Delete Application Document
  const handleDelete = async (creator, e) => {
    if (e) e.stopPropagation();
    const creatorName = creator.name || 'this creator';
    if (window.confirm(`Permanently delete the affiliate application for "${creatorName}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'affiliate_creator', creator.id));
        showToast('Application deleted.');
        if (selectedCreator?.id === creator.id) {
          setSelectedCreator(null);
        }
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete application: ' + err.message);
      }
    }
  };

  // 6. Export filtered list to CSV
  const handleExportCsv = () => {
    if (filteredCreators.length === 0) {
      alert('No creator applications to export for current filter criteria.');
      return;
    }
    const headers = [
      'Application ID',
      'Creator Name',
      'Instagram Handle',
      'Status',
      'Email',
      'Phone',
      'Viral Video Link',
      'Social Links',
      'Bio / Pitch',
      'Has Screenshot',
      'Submitted Date'
    ];
    const rows = filteredCreators.map((c) => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.instagramUsername || '').replace(/"/g, '""')}"`,
      `"${c.status || 'pending'}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.viralVideoLink || '').replace(/"/g, '""')}"`,
      `"${(c.socialLinks || []).join('; ').replace(/"/g, '""')}"`,
      `"${(c.shortDescription || '').replace(/"/g, '""')}"`,
      c.instagramDashboardScreenshot ? 'Yes' : 'No',
      `"${c.createdAt ? formatFullDate(c.createdAt) : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.join('\n')].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `affiliate_creators_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Export downloaded successfully.');
  };

  // Metrics computation
  const totalCount = creators.length;
  const pendingCount = creators.filter((c) => c.status === 'pending').length;
  const approvedCount = creators.filter((c) => c.status === 'approved').length;
  const rejectedCount = creators.filter((c) => c.status === 'rejected').length;

  // Filtered & Sorted Creators
  const filteredCreators = useMemo(() => {
    const term = search.toLowerCase().trim();

    return creators
      .filter((c) => {
        // Status filter
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;

        // Search match
        if (term) {
          const matchName = (c.name || '').toLowerCase().includes(term);
          const matchInsta = (c.instagramUsername || '').toLowerCase().includes(term);
          const matchEmail = (c.email || '').toLowerCase().includes(term);
          const matchPhone = (c.phone || '').toLowerCase().includes(term);
          const matchDesc = (c.shortDescription || '').toLowerCase().includes(term);
          const matchViral = (c.viralVideoLink || '').toLowerCase().includes(term);
          if (!matchName && !matchInsta && !matchEmail && !matchPhone && !matchDesc && !matchViral) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        if (sortBy === 'oldest') {
          return timeA - timeB;
        }
        // Default newest
        return timeB - timeA;
      });
  }, [creators, search, statusFilter, sortBy]);

  // Paginated Creators
  const paginatedCreators = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCreators.slice(start, start + pageSize);
  }, [filteredCreators, currentPage, pageSize]);

  // Status Badge Component
  const renderStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="aff-status-badge approved">
          <CheckCircle2 size={13} strokeWidth={2.5} />
          <span>Approved</span>
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="aff-status-badge rejected">
          <XCircle size={13} strokeWidth={2.4} />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="aff-status-badge pending">
        <Clock size={13} strokeWidth={2.4} />
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="aff-queries-page">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="aff-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="aff-header">
        <div className="aff-title-group">
          <div className="aff-title-row">
            <h1 className="aff-title">Affiliate Creator Applications</h1>
            <span className="aff-live-badge">
              <span className="aff-live-dot" />
              Real-time Firestore
            </span>
          </div>
          <p className="aff-subtitle">
            Review influencer and creator affiliate requests from <code>affiliate_creator</code>.
            Verify Instagram audience insights, approve creator partnerships, or manage applications.
          </p>
        </div>

        <div className="aff-header-actions">
          <button
            type="button"
            className="aff-btn-secondary"
            onClick={handleExportCsv}
            title="Download CSV for current filtered view"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────────────── */}
      <div className="aff-metrics-grid">
        <div className="aff-metric-card">
          <div className="aff-metric-icon-wrap total">
            <User size={20} />
          </div>
          <div className="aff-metric-content">
            <span className="aff-metric-label">Total Creators</span>
            <strong className="aff-metric-value">{loading ? '...' : totalCount}</strong>
            <span className="aff-metric-hint">All submitted requests</span>
          </div>
        </div>

        <div className={`aff-metric-card ${pendingCount > 0 ? 'highlight-amber' : ''}`}>
          <div className="aff-metric-icon-wrap pending">
            <Clock size={20} />
          </div>
          <div className="aff-metric-content">
            <span className="aff-metric-label">Pending Review</span>
            <strong className="aff-metric-value" style={{ color: pendingCount > 0 ? '#d97706' : '#64748b' }}>
              {loading ? '...' : pendingCount}
            </strong>
            <span className="aff-metric-hint">Require verification</span>
          </div>
        </div>

        <div className="aff-metric-card">
          <div className="aff-metric-icon-wrap approved">
            <ShieldCheck size={20} />
          </div>
          <div className="aff-metric-content">
            <span className="aff-metric-label">Approved Creators</span>
            <strong className="aff-metric-value" style={{ color: '#059669' }}>
              {loading ? '...' : approvedCount}
            </strong>
            <span className="aff-metric-hint">Active partnership</span>
          </div>
        </div>

        <div className="aff-metric-card">
          <div className="aff-metric-icon-wrap rejected">
            <XCircle size={20} />
          </div>
          <div className="aff-metric-content">
            <span className="aff-metric-label">Rejected</span>
            <strong className="aff-metric-value" style={{ color: '#dc2626' }}>
              {loading ? '...' : rejectedCount}
            </strong>
            <span className="aff-metric-hint">Ineligible / declined</span>
          </div>
        </div>
      </div>

      {/* ── Search, Filter Tabs & Sort Controls ─────────────────────────────── */}
      <div className="aff-controls-card">
        {/* Search input */}
        <div className="aff-search-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by creator name, Instagram handle, email, phone, bio..."
          />
          {search && (
            <button type="button" className="aff-clear-search-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="aff-filter-tabs">
          <button
            type="button"
            className={`aff-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`aff-tab-btn ${statusFilter === 'pending' ? 'active' : ''} ${pendingCount > 0 ? 'badge-amber' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            className={`aff-tab-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            className={`aff-tab-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Sort Selector */}
        <div className="aff-sort-wrap">
          <ArrowUpDown size={14} color="#64748b" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Creator Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── Main Data View ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="aff-state-card">
          <RefreshCw size={36} color="#ff6b00" style={{ animation: 'spin 1.5s linear infinite' }} />
          <h3>Loading affiliate creator applications...</h3>
          <p>Listening to real-time updates from <code>affiliate_creator</code> collection.</p>
        </div>
      ) : error ? (
        <div className="aff-state-card error">
          <AlertCircle size={38} color="#dc2626" />
          <h3>Error loading affiliate creator queries</h3>
          <p>{error}</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="aff-state-card">
          <User size={40} color="#94a3b8" />
          <h3>No applications found</h3>
          <p>
            {search
              ? `No creator records match "${search}". Try adjusting your search term or clear the filter.`
              : `There are currently no applications under the "${statusFilter}" status filter.`}
          </p>
        </div>
      ) : (
        <div className="aff-table-wrapper">
          <table className="aff-data-table">
            <thead>
              <tr>
                <th>Creator Profile</th>
                <th>Instagram & Socials</th>
                <th>Contact Info</th>
                <th>Analytics Screenshot</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCreators.map((creator) => {
                const cleanInsta = (creator.instagramUsername || '').replace(/^@/, '');
                const initial = (creator.name || 'C').charAt(0).toUpperCase();

                return (
                  <tr
                    key={creator.id}
                    className="aff-table-row"
                    onClick={() => setSelectedCreator(creator)}
                  >
                    {/* Creator Identity */}
                    <td>
                      <div className="aff-creator-cell">
                        <div className="aff-avatar-circle">{initial}</div>
                        <div className="aff-creator-text">
                          <strong className="aff-creator-name">{creator.name || 'Anonymous Creator'}</strong>
                          {creator.shortDescription && (
                            <span className="aff-creator-bio-snippet" title={creator.shortDescription}>
                              {creator.shortDescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Instagram Handle & Viral Video */}
                    <td>
                      <div className="aff-socials-cell">
                        {cleanInsta ? (
                          <a
                            href={`https://instagram.com/${cleanInsta}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aff-insta-pill"
                            onClick={(e) => e.stopPropagation()}
                            title="View Instagram Profile"
                          >
                            <Instagram size={13} color="#e1306c" />
                            <span>@{cleanInsta}</span>
                            <ExternalLink size={11} color="#94a3b8" />
                          </a>
                        ) : (
                          <span className="aff-cell-dim">No Instagram</span>
                        )}

                        {creator.viralVideoLink && (
                          <a
                            href={creator.viralVideoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aff-video-pill"
                            onClick={(e) => e.stopPropagation()}
                            title="Watch Viral Video / Reel"
                          >
                            <Video size={12} color="#ff6b00" />
                            <span>Viral Video</span>
                            <ExternalLink size={10} color="#94a3b8" />
                          </a>
                        )}

                        {creator.socialLinks && creator.socialLinks.length > 0 && (
                          <span className="aff-social-count-badge" title={creator.socialLinks.join(', ')}>
                            +{creator.socialLinks.length} social link{creator.socialLinks.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact Info (Email & Phone) */}
                    <td>
                      <div className="aff-contact-cell">
                        {creator.email && (
                          <span
                            className="aff-contact-item"
                            title="Click to copy email"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(creator.email, `email-${creator.id}`);
                            }}
                          >
                            <Mail size={12} color="#64748b" />
                            <span>{creator.email}</span>
                            {copiedField === `email-${creator.id}` ? (
                              <Check size={11} color="#10b981" />
                            ) : (
                              <Copy size={11} color="#cbd5e1" />
                            )}
                          </span>
                        )}
                        {creator.phone && (
                          <span
                            className="aff-contact-item"
                            title="Click to copy phone"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(creator.phone, `phone-${creator.id}`);
                            }}
                          >
                            <Phone size={12} color="#64748b" />
                            <span>{creator.phone}</span>
                            {copiedField === `phone-${creator.id}` ? (
                              <Check size={11} color="#10b981" />
                            ) : (
                              <Copy size={11} color="#cbd5e1" />
                            )}
                          </span>
                        )}
                        {!creator.email && !creator.phone && (
                          <span className="aff-cell-dim">No contact provided</span>
                        )}
                      </div>
                    </td>

                    {/* Screenshot Thumbnail */}
                    <td>
                      {creator.instagramDashboardScreenshot ? (
                        <div
                          className="aff-thumb-preview"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(creator.instagramDashboardScreenshot);
                          }}
                          title="Click to zoom analytics screenshot"
                        >
                          <img
                            src={creator.instagramDashboardScreenshot}
                            alt="Instagram Insights"
                            className="aff-thumb-img"
                          />
                          <div className="aff-thumb-overlay">
                            <Maximize2 size={13} color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <span className="aff-no-screenshot-tag">No Screenshot</span>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td>{renderStatusBadge(creator.status)}</td>

                    {/* Date */}
                    <td>
                      <div className="aff-date-cell">
                        <span className="aff-date-relative">{formatRelativeTime(creator.createdAt)}</span>
                        <span className="aff-date-full">
                          {creator.createdAt ? creator.createdAt.toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="aff-row-actions" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Approve Button */}
                        {creator.status !== 'approved' && (
                          <button
                            type="button"
                            className="aff-action-btn approve"
                            title="Approve Creator Partnership"
                            onClick={(e) => handleApprove(creator, e)}
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Quick Reject Button */}
                        {creator.status !== 'rejected' && (
                          <button
                            type="button"
                            className="aff-action-btn reject"
                            title="Reject Application"
                            onClick={(e) => handleInitiateReject(creator, e)}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* If already approved or rejected, can reset back to pending */}
                        {creator.status !== 'pending' && (
                          <button
                            type="button"
                            className="aff-icon-btn"
                            title="Reset to Pending"
                            onClick={(e) => handleMarkPending(creator, e)}
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}

                        {/* View Inspector Modal */}
                        <button
                          type="button"
                          className="aff-icon-btn"
                          title="Inspect Details"
                          onClick={() => setSelectedCreator(creator)}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="aff-icon-btn danger"
                          title="Delete Record"
                          onClick={(e) => handleDelete(creator, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="aff-pagination-bar">
            <span className="aff-pagination-info">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredCreators.length)} -{' '}
              {Math.min(currentPage * pageSize, filteredCreators.length)} of {filteredCreators.length} applications
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCreators.length / pageSize) || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* ── 1. Inspector Details Modal ──────────────────────────────────────── */}
      {selectedCreator && (
        <div className="aff-modal-backdrop" onClick={() => setSelectedCreator(null)}>
          <div className="aff-inspector-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="aff-modal-header">
              <div className="aff-modal-header-info">
                <div className="aff-modal-avatar">
                  {(selectedCreator.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 className="aff-modal-title">{selectedCreator.name || 'Creator Application'}</h2>
                    {renderStatusBadge(selectedCreator.status)}
                  </div>
                  <span className="aff-modal-id">
                    Application ID: <code>{selectedCreator.id}</code>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="aff-modal-close-btn"
                onClick={() => setSelectedCreator(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="aff-modal-body">
              {/* Top Quick Action Bar */}
              <div className="aff-modal-action-bar">
                <span>Update Partnership Status:</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`aff-status-choice-btn approve ${selectedCreator.status === 'approved' ? 'selected' : ''}`}
                    onClick={() => handleApprove(selectedCreator)}
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Creator</span>
                  </button>
                  <button
                    type="button"
                    className={`aff-status-choice-btn reject ${selectedCreator.status === 'rejected' ? 'selected' : ''}`}
                    onClick={() => handleInitiateReject(selectedCreator)}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    className={`aff-status-choice-btn pending ${selectedCreator.status === 'pending' ? 'selected' : ''}`}
                    onClick={() => handleMarkPending(selectedCreator)}
                  >
                    <Clock size={14} />
                    <span>Pending</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="aff-modal-grid">
                {/* Left Col: Contact & Socials */}
                <div className="aff-modal-left-col">
                  {/* Identity Box */}
                  <div className="aff-modal-card">
                    <h4 className="aff-card-heading">
                      <User size={15} color="#ff6b00" />
                      <span>Contact & Profile Details</span>
                    </h4>

                    <div className="aff-key-val-list">
                      <div className="aff-key-val-row">
                        <span className="aff-key">Full Name</span>
                        <strong className="aff-val">{selectedCreator.name || 'N/A'}</strong>
                      </div>
                      <div className="aff-key-val-row">
                        <span className="aff-key">Email Address</span>
                        <div className="aff-val-action">
                          <span className="aff-val">{selectedCreator.email || 'None provided'}</span>
                          {selectedCreator.email && (
                            <button
                              type="button"
                              className="aff-tiny-btn"
                              onClick={() => handleCopy(selectedCreator.email, 'modal-email')}
                            >
                              {copiedField === 'modal-email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="aff-key-val-row">
                        <span className="aff-key">Phone Number</span>
                        <div className="aff-val-action">
                          <span className="aff-val">{selectedCreator.phone || 'None provided'}</span>
                          {selectedCreator.phone && (
                            <button
                              type="button"
                              className="aff-tiny-btn"
                              onClick={() => handleCopy(selectedCreator.phone, 'modal-phone')}
                            >
                              {copiedField === 'modal-phone' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="aff-key-val-row">
                        <span className="aff-key">Instagram Handle</span>
                        <div className="aff-val-action">
                          <strong className="aff-val" style={{ color: '#e1306c' }}>
                            @{selectedCreator.instagramUsername ? selectedCreator.instagramUsername.replace(/^@/, '') : 'none'}
                          </strong>
                          {selectedCreator.instagramUsername && (
                            <a
                              href={`https://instagram.com/${selectedCreator.instagramUsername.replace(/^@/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aff-tiny-btn"
                              title="Open Instagram"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="aff-key-val-row">
                        <span className="aff-key">Submitted On</span>
                        <span className="aff-val">
                          {selectedCreator.createdAt ? formatFullDate(selectedCreator.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Viral Video Link */}
                  {selectedCreator.viralVideoLink && (
                    <div className="aff-modal-card">
                      <h4 className="aff-card-heading">
                        <Video size={15} color="#ea580c" />
                        <span>Viral Video / Reel</span>
                      </h4>
                      <p className="aff-card-subtext">Featured video showcase submitted by the creator:</p>
                      <a
                        href={selectedCreator.viralVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aff-external-link-card"
                      >
                        <Video size={16} color="#ff6b00" />
                        <span className="aff-link-text">{selectedCreator.viralVideoLink}</span>
                        <ExternalLink size={14} color="#64748b" />
                      </a>
                    </div>
                  )}

                  {/* Social Profile Links */}
                  {selectedCreator.socialLinks && selectedCreator.socialLinks.length > 0 && (
                    <div className="aff-modal-card">
                      <h4 className="aff-card-heading">
                        <Share2 size={15} color="#2563eb" />
                        <span>Other Social Profiles</span>
                      </h4>
                      <div className="aff-social-links-list">
                        {selectedCreator.socialLinks.map((url, idx) => (
                          <a
                            key={idx}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aff-social-item-link"
                          >
                            <ExternalLink size={12} />
                            <span>{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pitch / Bio */}
                  {selectedCreator.shortDescription && (
                    <div className="aff-modal-card">
                      <h4 className="aff-card-heading">
                        <FileText size={15} color="#059669" />
                        <span>Creator Pitch / Bio</span>
                      </h4>
                      <p className="aff-bio-blockquote">{selectedCreator.shortDescription}</p>
                    </div>
                  )}
                </div>

                {/* Right Col: Instagram Dashboard Screenshot & Admin Notes */}
                <div className="aff-modal-right-col">
                  {/* Screenshot Verification Card */}
                  <div className="aff-modal-card">
                    <h4 className="aff-card-heading">
                      <Instagram size={15} color="#e1306c" />
                      <span>Instagram Audience & Insights Screenshot</span>
                    </h4>
                    <p className="aff-card-subtext">
                      Verify follower demographics, weekly reach, accounts engaged, and organic impressions:
                    </p>

                    {selectedCreator.instagramDashboardScreenshot ? (
                      <div
                        className="aff-screenshot-large-wrap"
                        onClick={() => setLightboxImage(selectedCreator.instagramDashboardScreenshot)}
                        title="Click to view full-resolution screenshot"
                      >
                        <img
                          src={selectedCreator.instagramDashboardScreenshot}
                          alt="Instagram Insights Dashboard"
                          className="aff-screenshot-large-img"
                        />
                        <div className="aff-screenshot-zoom-overlay">
                          <Maximize2 size={18} color="#ffffff" />
                          <span>Click to Zoom Screenshot</span>
                        </div>
                      </div>
                    ) : (
                      <div className="aff-no-screenshot-box">
                        <AlertCircle size={28} color="#94a3b8" />
                        <p>No screenshot was uploaded with this application.</p>
                      </div>
                    )}
                  </div>

                  {/* Rejection Note (If rejected) */}
                  {selectedCreator.status === 'rejected' && selectedCreator.rejectionReason && (
                    <div className="aff-modal-card rejection-box">
                      <h4 className="aff-card-heading" style={{ color: '#dc2626' }}>
                        <XCircle size={15} color="#dc2626" />
                        <span>Rejection Reason</span>
                      </h4>
                      <p className="aff-rejection-reason-text">{selectedCreator.rejectionReason}</p>
                    </div>
                  )}

                  {/* Internal Admin Notes */}
                  <div className="aff-modal-card">
                    <h4 className="aff-card-heading">
                      <MessageSquare size={15} color="#8b5cf6" />
                      <span>Internal Super Admin Notes</span>
                    </h4>
                    <p className="aff-card-subtext">
                      Private verification log (e.g. verified engagement rate, coupon code assigned, remarks):
                    </p>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this creator..."
                      className="aff-notes-textarea"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button
                        type="button"
                        className="aff-btn-primary"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                      >
                        {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="aff-modal-footer">
              <button
                type="button"
                className="aff-btn-danger"
                onClick={() => handleDelete(selectedCreator)}
              >
                <Trash2 size={14} />
                <span>Delete Application</span>
              </button>

              <button
                type="button"
                className="aff-btn-secondary"
                onClick={() => setSelectedCreator(null)}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Rejection Modal ──────────────────────────────────────────────── */}
      {rejectingCreator && (
        <div className="aff-modal-backdrop" onClick={() => setRejectingCreator(null)}>
          <div className="aff-reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aff-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="aff-reject-icon-badge">
                  <XCircle size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 className="aff-modal-title">Reject Creator Application</h3>
                  <span className="aff-modal-id">
                    Creator: <strong>{rejectingCreator.name}</strong> (@{rejectingCreator.instagramUsername})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="aff-modal-close-btn"
                onClick={() => setRejectingCreator(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="aff-modal-body" style={{ padding: '20px 24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Select a preset reason or enter custom remarks:
              </label>

              <div className="aff-preset-buttons">
                {REJECTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`aff-preset-btn ${rejectionReason === preset ? 'selected' : ''}`}
                    onClick={() => setRejectionReason(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specific reason for declining this creator application..."
                className="aff-notes-textarea"
                style={{ marginTop: 12 }}
              />
            </div>

            <div className="aff-modal-footer">
              <button
                type="button"
                className="aff-btn-secondary"
                onClick={() => setRejectingCreator(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="aff-btn-danger filled"
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Screenshot Lightbox Modal ────────────────────────────────────── */}
      {lightboxImage && (
        <div className="aff-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <button
            type="button"
            className="aff-lightbox-close"
            onClick={() => setLightboxImage(null)}
            title="Close Zoom"
          >
            <X size={24} />
          </button>
          <div className="aff-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Instagram Analytics Insights Full Size"
              className="aff-lightbox-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
