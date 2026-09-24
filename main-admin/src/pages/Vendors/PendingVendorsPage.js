import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Check, X, Eye } from 'lucide-react';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function PendingVendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [actionLoading, setActionLoading] = useState(null);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'vendors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Filter pending verification
      const pending = all.filter((v) => 
        (v.verificationStatus || v.status || 'pending').toLowerCase() === 'pending'
      );
      setVendors(pending);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching pending vendors:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Approve this vendor application?')) return;
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'vendors', id), {
        verificationStatus: 'verified',
        status: 'active'
      });
    } catch (err) {
      console.error('Error approving vendor:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Reject this vendor application?')) return;
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'vendors', id), {
        verificationStatus: 'rejected',
        status: 'rejected'
      });
    } catch (err) {
      console.error('Error rejecting vendor:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const visibleVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || '';
    const email = v.email || v.contactEmail || '';
    const gst = v.gstNumber || v.gstDetails?.gstNumber || '';
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term) || gst.toLowerCase().includes(term);
  });

  const paginatedVendors = visibleVendors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Vendor Approvals</h1>
          <p className="page-subtitle">Review business documentation, GST credentials, and approve new seller partners.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="management-metric">
          <span>Awaiting Review</span>
          <strong>{loading ? '...' : vendors.length}</strong>
        </div>
        <div className="management-metric">
          <span>Compliance SLA</span>
          <strong style={{ color: '#10b981' }}>Within 24 hrs</strong>
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
              placeholder="Search by store name, email, or GST number..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading pending vendors...</div>
        ) : visibleVendors.length === 0 ? (
          <div className="enterprise-state">
            <Building2 size={32} />
            <h3>No pending approvals</h3>
            <p>All vendor applications have been reviewed and processed.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Store / Vendor</th>
                    <th>Contact Email</th>
                    <th>GST Number</th>
                    <th>PAN Number</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVendors.map((v) => {
                    const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || 'Unnamed Vendor';
                    const email = v.email || v.contactEmail || '-';
                    const gst = v.gstNumber || v.gstDetails?.gstNumber || '-';
                    const pan = v.pan || v.businessDetails?.pan || '-';

                    return (
                      <tr key={v.id} onClick={() => navigate(`/vendors/${v.id}`)} style={{ cursor: 'pointer' }}>
                        <td><strong style={{ color: 'var(--text-main)' }}>{name}</strong></td>
                        <td>{email}</td>
                        <td><code>{gst}</code></td>
                        <td><code>{pan}</code></td>
                        <td>
                          <span className="management-badge pending">Pending</span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#10b981', borderColor: '#10b981' }}
                              title="Approve Vendor"
                              disabled={actionLoading === v.id}
                              onClick={(e) => handleApprove(v.id, e)}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ef4444' }}
                              title="Reject Application"
                              disabled={actionLoading === v.id}
                              onClick={(e) => handleReject(v.id, e)}
                            >
                              <X size={14} /> Reject
                            </button>
                            <button 
                              className="icon-btn" 
                              title="View Details"
                              onClick={() => navigate(`/vendors/${v.id}`)}
                            >
                              <Eye size={16} />
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
    </div>
  );
}
