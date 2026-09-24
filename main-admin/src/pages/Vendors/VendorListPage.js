import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Eye, Trash2 } from 'lucide-react';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function VendorListPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real-time listener for vendors
  useEffect(() => {
    const q = query(collection(db, 'vendors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVendors(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching vendors:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this vendor record?')) {
      try {
        await deleteDoc(doc(db, 'vendors', id));
      } catch (err) {
        console.error('Error deleting vendor:', err);
      }
    }
  };

  const visibleVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || '';
    const email = v.email || v.contactEmail || '';
    const city = v.warehouse || v.warehouseAddress?.city || v.city || '';
    const gst = v.gstNumber || v.gstDetails?.gstNumber || '';
    const status = v.verificationStatus || v.status || 'pending';

    const matchesSearch = 
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      city.toLowerCase().includes(term) ||
      gst.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedVendors = visibleVendors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">Onboard, verify, audit, and manage marketplace vendors and partner stores.</p>
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
          <strong>{vendors.filter((v) => (v.verificationStatus || v.status) === 'verified').length}</strong>
        </div>
        <div className="management-metric">
          <span>Pending Approval</span>
          <strong>{vendors.filter((v) => (v.verificationStatus || v.status) === 'pending').length}</strong>
        </div>
        <div className="management-metric">
          <span>Suspended / Hold</span>
          <strong>{vendors.filter((v) => (v.verificationStatus || v.status) === 'suspended').length}</strong>
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
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
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
            <p>Registered partner stores and sellers will appear here.</p>
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
                    const status = v.verificationStatus || v.status || 'pending';
                    const name = v.displayName || v.storeName || v.name || v.businessDetails?.storeName || 'Unnamed Vendor';
                    const email = v.email || v.contactEmail || '-';
                    const phone = v.phone || v.contactPhone || '';
                    const gst = v.gstNumber || v.gstDetails?.gstNumber || '-';
                    const city = v.warehouse || v.warehouseAddress?.city || v.city || '-';
                    const commission = v.commission ? `${v.commission}%` : '10%';

                    return (
                      <tr key={v.id} onClick={() => navigate(`/vendors/${v.id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{name}</strong>
                        </td>
                        <td>
                          <div>{email}</div>
                          {phone && <small style={{ color: 'var(--text-muted)' }}>{phone}</small>}
                        </td>
                        <td><code>{gst}</code></td>
                        <td>{city}</td>
                        <td>{commission}</td>
                        <td>
                          <span className={`management-badge ${status}`}>
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button 
                              className="icon-btn" 
                              title="View Vendor Profile"
                              onClick={() => navigate(`/vendors/${v.id}`)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="icon-btn text-danger" 
                              title="Delete Vendor"
                              onClick={(e) => handleDelete(v.id, e)}
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
