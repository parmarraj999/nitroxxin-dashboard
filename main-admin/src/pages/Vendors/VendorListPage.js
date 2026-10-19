import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Eye,
  Trash2,
  CalendarClock,
  Clock,
  X
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import AccountSuspensionModal from '../../components/Common/AccountSuspensionModal';
import AccountDeletionModal from '../../components/Common/AccountDeletionModal';
import {
  checkAccountSuspension,
  suspendAccount,
  reactivateAccount,
  deleteAccount
} from '../../services/accountActionService';
import '../../components/Common/ManagementPageLayout.css';
import '../../components/Common/AccountModals.css';

export default function VendorListPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [suspensionTarget, setSuspensionTarget] = useState(null);
  const [deletionTarget, setDeletionTarget] = useState(null);

  // Toast feedback
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

  // Real-time listener for vendors
  useEffect(() => {
    const q = query(collection(db, 'vendors'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVendors(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching vendors:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Handle Suspension Confirmation
  const handleConfirmSuspend = async ({ startDate, endDate, reason, durationDays }) => {
    if (!suspensionTarget) return;
    const vendorName =
      suspensionTarget.displayName ||
      suspensionTarget.storeName ||
      suspensionTarget.businessDetails?.storeName ||
      'Vendor';

    await suspendAccount({
      accountType: 'vendor',
      accountId: suspensionTarget.id,
      startDate,
      endDate,
      reason
    });

    addToast(
      'Vendor Suspended',
      `${vendorName} suspended for ${durationDays} days (${startDate} to ${endDate}).`,
      'success'
    );
  };

  // Handle Suspension Lifting
  const handleConfirmReactivate = async () => {
    if (!suspensionTarget) return;
    const vendorName =
      suspensionTarget.displayName ||
      suspensionTarget.storeName ||
      suspensionTarget.businessDetails?.storeName ||
      'Vendor';

    await reactivateAccount({
      accountType: 'vendor',
      accountId: suspensionTarget.id
    });

    addToast(
      'Vendor Reactivated',
      `${vendorName}'s suspension has been lifted and account is now active.`,
      'success'
    );
  };

  // Handle Deletion Confirmation
  const handleConfirmDelete = async () => {
    if (!deletionTarget) return;
    const vendorName =
      deletionTarget.displayName ||
      deletionTarget.storeName ||
      deletionTarget.businessDetails?.storeName ||
      'Vendor';

    await deleteAccount({
      accountType: 'vendor',
      accountId: deletionTarget.id
    });

    addToast(
      'Vendor Deleted',
      `${vendorName} has been permanently removed from the vendor registry.`,
      'success'
    );
  };

  const visibleVendors = useMemo(() => {
    const term = search.toLowerCase();
    return vendors.filter((v) => {
      const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || '';
      const email = v.email || v.contactEmail || '';
      const city = v.warehouse || v.warehouseAddress?.city || v.city || '';
      const gst = v.gstNumber || v.gstDetails?.gstNumber || '';
      const rawStatus = v.verificationStatus || v.status || 'pending';
      const suspInfo = checkAccountSuspension(v);

      const matchesSearch =
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        gst.toLowerCase().includes(term);

      let matchesStatus = true;
      if (statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'suspended') {
        matchesStatus = suspInfo.isSuspended || rawStatus === 'suspended';
      } else if (statusFilter === 'verified') {
        matchesStatus = !suspInfo.isSuspended && rawStatus === 'verified';
      } else {
        matchesStatus = rawStatus === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const paginatedVendors = visibleVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const suspendedCount = useMemo(() => {
    return vendors.filter(
      (v) => checkAccountSuspension(v).isSuspended || (v.verificationStatus || v.status) === 'suspended'
    ).length;
  }, [vendors]);

  const verifiedCount = useMemo(() => {
    return vendors.filter(
      (v) => !checkAccountSuspension(v).isSuspended && (v.verificationStatus || v.status) === 'verified'
    ).length;
  }, [vendors]);

  return (
    <div className="management-page">
      {/* Toast Notifications Stack */}
      {toasts.length > 0 && (
        <div className="hosts-toast-stack">
          {toasts.map((toast) => (
            <div key={toast.id} className={`hosts-toast ${toast.type}`}>
              <div className="hosts-toast-body">
                <div className="hosts-toast-title">{toast.title}</div>
                <div className="hosts-toast-desc">{toast.desc}</div>
              </div>
              <button
                className="hosts-toast-close"
                onClick={() => removeToast(toast.id)}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">Onboard, verify, audit, suspend, and manage marketplace vendors and partner stores.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Vendors</span>
          <strong>{loading ? '...' : vendors.length}</strong>
        </div>
        <div className="management-metric">
          <span>Verified</span>
          <strong>{verifiedCount}</strong>
        </div>
        <div className="management-metric">
          <span>Pending Approval</span>
          <strong>{vendors.filter((v) => (v.verificationStatus || v.status) === 'pending').length}</strong>
        </div>
        <div className="management-metric">
          <span>Suspended / Hold</span>
          <strong style={{ color: suspendedCount > 0 ? '#ef4444' : 'inherit' }}>
            {suspendedCount}
          </strong>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="management-toolbar">
          <div className="search-wrapper enterprise-search">
            <Search size={16} className="search-icon-small" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search store name, email, city, or GST..." 
            />
          </div>

          <div className="management-select-wrapper">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses ({vendors.length})</option>
              <option value="verified">Verified ({verifiedCount})</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended ({suspendedCount})</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading vendors...</div>
        ) : visibleVendors.length === 0 ? (
          <div className="enterprise-state">
            <Building2 size={32} />
            <h3>No vendors found</h3>
            <p>No vendor records matched your search or status filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Store / Vendor</th>
                    <th>Contact</th>
                    <th>GST Number</th>
                    <th>Warehouse / City</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVendors.map((v) => {
                    const rawStatus = v.verificationStatus || v.status || 'pending';
                    const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || 'Unnamed Vendor';
                    const email = v.email || v.contactEmail || '-';
                    const phone = v.phone || v.contactPhone || '';
                    const gst = v.gstNumber || v.gstDetails?.gstNumber || '-';
                    const city = v.warehouse || v.warehouseAddress?.city || v.city || '-';
                    const commission = v.commission ? `${v.commission}%` : '10%';

                    const suspInfo = checkAccountSuspension(v);
                    const displayStatus = suspInfo.isSuspended ? 'suspended' : rawStatus;

                    return (
                      <tr key={v.id} onClick={() => navigate(`/vendors/${v.id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{name}</strong>
                          {v.gstDetails?.legalName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {v.gstDetails.legalName}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{email}</div>
                          {phone && <small style={{ color: 'var(--text-muted)' }}>{phone}</small>}
                        </td>
                        <td><code>{gst}</code></td>
                        <td>{city}</td>
                        <td>{commission}</td>
                        <td>
                          <div className="account-badge-wrap">
                            <span className={`management-badge ${displayStatus}`}>
                              {displayStatus}
                            </span>
                            {suspInfo.isSuspended && suspInfo.endDate && (
                              <span
                                className="account-badge-date-sub"
                                title={suspInfo.reason ? `Reason: ${suspInfo.reason}` : 'Suspended'}
                              >
                                <Clock size={10} /> Until {suspInfo.endDate}
                              </span>
                            )}
                            {suspInfo.isExpired && (
                              <span
                                className="account-badge-date-sub expired"
                                title="Suspension date range has expired"
                              >
                                <Clock size={10} /> Expired ({suspInfo.endDate})
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div className="account-row-actions">
                            <button 
                              className="account-action-btn" 
                              title="View Vendor Profile"
                              onClick={() => navigate(`/vendors/${v.id}`)}
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              className={`account-action-btn suspend-btn ${suspInfo.isSuspended ? 'active-suspended' : ''}`}
                              title={suspInfo.isSuspended ? 'Manage / Lift Suspension' : 'Suspend Vendor for Custom Date Range'}
                              onClick={() => setSuspensionTarget(v)}
                            >
                              <CalendarClock size={15} />
                            </button>
                            <button 
                              className="account-action-btn delete-btn" 
                              title="Delete Vendor Account"
                              onClick={() => setDeletionTarget(v)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleVendors.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Account Suspension Modal */}
      <AccountSuspensionModal
        isOpen={Boolean(suspensionTarget)}
        onClose={() => setSuspensionTarget(null)}
        accountType="vendor"
        account={suspensionTarget}
        onConfirmSuspend={handleConfirmSuspend}
        onConfirmReactivate={handleConfirmReactivate}
      />

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        isOpen={Boolean(deletionTarget)}
        onClose={() => setDeletionTarget(null)}
        accountType="vendor"
        account={deletionTarget}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
