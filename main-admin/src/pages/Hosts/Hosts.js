import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  CalendarClock,
  Trash2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import './Hosts.css';

export default function Hosts() {
  const navigate = useNavigate();
  const [hosts, setHosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
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

  // Real-time listener for event_host collection
  useEffect(() => {
    const q = query(collection(db, 'event_host'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching event_host collection:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to events collection to compute event counts per host
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching events for host counts:', err);
    });
    return () => unsubscribe();
  }, []);

  // Reset page to 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Filter hosts based on search query and status filter
  const filteredHosts = useMemo(() => {
    const term = search.toLowerCase();
    return hosts.filter((host) => {
      const name = host.fullName || host.name || host.displayName || '';
      const email = host.email || host.contactEmail || host.hostEmail || '';
      const phone = host.phone || host.phoneNumber || host.contactPhone || host.hostPhone || '';
      const city = host.city || host.location || host.address || '';
      const suspInfo = checkAccountSuspension(host);

      const matchesSearch =
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term);

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = !suspInfo.isSuspended && ((host.status || 'active') === 'active' || host.verified);
      } else if (statusFilter === 'suspended') {
        matchesStatus = suspInfo.isSuspended || (host.status || '').toLowerCase() === 'suspended';
      }

      return matchesSearch && matchesStatus;
    });
  }, [hosts, search, statusFilter]);

  const paginatedHosts = filteredHosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Count metrics
  const activeCount = useMemo(() => {
    return hosts.filter((h) => !checkAccountSuspension(h).isSuspended && ((h.status || 'active') === 'active' || h.verified)).length;
  }, [hosts]);

  const suspendedCount = useMemo(() => {
    return hosts.filter((h) => checkAccountSuspension(h).isSuspended || (h.status || '').toLowerCase() === 'suspended').length;
  }, [hosts]);

  // Helper to count events for a host
  const getHostEventsCount = (host) => {
    if (host.totalEvents !== undefined) return host.totalEvents;
    if (host.eventsCount !== undefined) return host.eventsCount;
    if (Array.isArray(host.events)) return host.events.length;
    return events.filter(
      (e) => e.hostId === host.id || e.organizerId === host.id || (e.hostName && e.hostName === (host.name || host.displayName))
    ).length;
  };

  // Handlers for Suspension
  const handleConfirmSuspend = async ({ startDate, endDate, reason, durationDays }) => {
    if (!suspensionTarget) return;
    const hostName = suspensionTarget.fullName || suspensionTarget.name || 'Host';

    await suspendAccount({
      accountType: 'host',
      accountId: suspensionTarget.id,
      startDate,
      endDate,
      reason
    });

    addToast(
      'Account Suspended',
      `${hostName} suspended for ${durationDays} days (${startDate} to ${endDate}).`,
      'success'
    );
  };

  const handleConfirmReactivate = async () => {
    if (!suspensionTarget) return;
    const hostName = suspensionTarget.fullName || suspensionTarget.name || 'Host';

    await reactivateAccount({
      accountType: 'host',
      accountId: suspensionTarget.id
    });

    addToast(
      'Account Reactivated',
      `${hostName}'s suspension has been lifted and account is now active.`,
      'success'
    );
  };

  // Handler for Deletion
  const handleConfirmDelete = async () => {
    if (!deletionTarget) return;
    const hostName = deletionTarget.fullName || deletionTarget.name || 'Host';

    await deleteAccount({
      accountType: 'host',
      accountId: deletionTarget.id
    });

    addToast(
      'Account Deleted',
      `${hostName} has been permanently removed from the host registry.`,
      'success'
    );
  };

  return (
    <div className="hosts-page">
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

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Hosts</h1>
          <p className="page-subtitle">Manage organizers, verified community leaders, contact info, suspensions, and hosted events.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/hosts/pending')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ShieldCheck size={16} />
            Pending Host Approvals
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="hosts-metrics">
        <div className="hosts-metric card">
          <div className="metric-header">
            <Users size={20} className="icon-blue" />
            <span>Total Hosts</span>
          </div>
          <strong>{loading ? '...' : hosts.length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <ShieldCheck size={20} className="icon-green" />
            <span>Active / Verified</span>
          </div>
          <strong>{loading ? '...' : activeCount}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <ShieldAlert size={20} className="icon-red" />
            <span>Suspended</span>
          </div>
          <strong style={{ color: suspendedCount > 0 ? '#ef4444' : 'inherit' }}>
            {loading ? '...' : suspendedCount}
          </strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <Calendar size={20} className="icon-purple" />
            <span>Total Events</span>
          </div>
          <strong>{loading ? '...' : events.length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <MapPin size={20} className="icon-orange" />
            <span>Host Locations</span>
          </div>
          <strong>
            {loading ? '...' : new Set(hosts.map((h) => h.city || h.location).filter(Boolean)).size || 1}
          </strong>
        </div>
      </div>

      <div className="hosts-layout">
        {/* Main List */}
        <div className="hosts-main-list card">
          <div className="table-toolbar">
            <div className="hosts-toolbar-left">
              <div className="search-wrapper">
                <Search size={16} className="search-icon-small" />
                <input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search hosts by name, email, phone, or city..." 
                />
              </div>

              <select 
                className="hosts-filter-select"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses ({hosts.length})</option>
                <option value="active">Active / Verified ({activeCount})</option>
                <option value="suspended">Suspended ({suspendedCount})</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="state-container">Loading hosts from event_host...</div>
          ) : filteredHosts.length === 0 ? (
            <div className="state-container empty-state">
              <Users size={40} className="text-muted" />
              <h3>No hosts found</h3>
              <p>No host records matched your search or status filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="hosts-table-wrap">
                <table className="hosts-table">
                  <thead>
                    <tr>
                      <th>HOST</th>
                      <th>CONTACT INFO</th>
                      <th>LOCATION</th>
                      <th>EVENTS</th>
                      <th>STATUS</th>
                      <th className="actions-col" style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHosts.map((host) => {
                      const name = host.fullName || host.name || host.displayName || 'Unnamed Host';
                      const email = host.email || host.contactEmail || host.hostEmail || '-';
                      const phone = host.phone || host.phoneNumber || host.contactPhone || host.hostPhone || '';
                      const photo = host.photoURL || host.profilePhoto || host.photo || host.imageUrl || host.avatar;
                      const city = host.city || host.location || host.address || '-';
                      const eventsCount = getHostEventsCount(host);

                      const suspInfo = checkAccountSuspension(host);
                      const displayStatus = suspInfo.isSuspended
                        ? 'suspended'
                        : host.status || (host.verified ? 'verified' : 'active');

                      return (
                        <tr 
                          key={host.id} 
                          className="host-row"
                          onClick={() => navigate(`/hosts/${host.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="host-profile-cell">
                              {photo ? (
                                <img src={photo} alt={name} className="host-avatar-sm" />
                              ) : (
                                <div className="host-avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                              )}
                              <div>
                                <span className="host-name-bold">{name}</span>
                                {host.organizationName && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {host.organizationName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-details">
                              <span className="contact-item"><Mail size={12} /> {email}</span>
                              {phone && <span className="contact-item"><Phone size={12} /> {phone}</span>}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-main)' }}>
                              <MapPin size={13} color="var(--text-muted)" />
                              <span>{city}</span>
                            </div>
                          </td>
                          <td>
                            <strong>{eventsCount}</strong>
                          </td>
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
                          <td className="actions-col" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div className="account-row-actions">
                              <button 
                                className="account-action-btn" 
                                title="View Host Profile"
                                onClick={() => navigate(`/hosts/${host.id}`)}
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                className={`account-action-btn suspend-btn ${suspInfo.isSuspended ? 'active-suspended' : ''}`}
                                title={suspInfo.isSuspended ? 'Manage / Lift Suspension' : 'Suspend Account for Custom Date Range'}
                                onClick={() => setSuspensionTarget(host)}
                              >
                                <CalendarClock size={15} />
                              </button>
                              <button 
                                className="account-action-btn delete-btn" 
                                title="Delete Host Account"
                                onClick={() => setDeletionTarget(host)}
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
                totalItems={filteredHosts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Account Suspension Modal */}
      <AccountSuspensionModal
        isOpen={Boolean(suspensionTarget)}
        onClose={() => setSuspensionTarget(null)}
        accountType="host"
        account={suspensionTarget}
        onConfirmSuspend={handleConfirmSuspend}
        onConfirmReactivate={handleConfirmReactivate}
      />

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        isOpen={Boolean(deletionTarget)}
        onClose={() => setDeletionTarget(null)}
        accountType="host"
        account={deletionTarget}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
