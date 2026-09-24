import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Trash2, X, Star } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function AccessoryBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    authorizedStatus: 'authorized',
    originCountry: 'India',
    warrantyPeriod: '1 Year',
    status: 'active'
  });

  // Real-time listener for brands
  useEffect(() => {
    const q = query(collection(db, 'brands'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBrands(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching accessory brands:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const toggleFeatured = async (brand, e) => {
    e.stopPropagation();
    try {
      const nextVal = !brand.featuredForYou;
      await updateDoc(doc(db, 'brands', brand.id), { featuredForYou: nextVal });
    } catch (err) {
      console.error('Error updating brand featured status:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'brands'), {
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        authorizedStatus: form.authorizedStatus,
        originCountry: form.originCountry.trim() || 'India',
        warrantyPeriod: form.warrantyPeriod.trim() || '1 Year',
        status: form.status,
        featuredForYou: false,
        createdAt: serverTimestamp()
      });
      setForm({ name: '', imageUrl: '', authorizedStatus: 'authorized', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active' });
      setModalOpen(false);
    } catch (err) {
      console.error('Error creating brand:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this accessory brand?')) {
      try {
        await deleteDoc(doc(db, 'brands', id));
      } catch (err) {
        console.error('Error deleting brand:', err);
      }
    }
  };

  const visibleBrands = brands.filter((b) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.originCountry || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginatedBrands = visibleBrands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accessory Brands</h1>
          <p className="page-subtitle">Manage manufacturer authorizations, warranty terms, and featured partner brands.</p>
        </div>
        <div className="header-actions-main">
          <button 
            className="btn-primary" 
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Accessory Brand
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Brands</span>
          <strong>{loading ? '...' : brands.length}</strong>
        </div>
        <div className="management-metric">
          <span>Authorized</span>
          <strong>{brands.filter((b) => (b.authorizedStatus || 'authorized') === 'authorized').length}</strong>
        </div>
        <div className="management-metric">
          <span>Active</span>
          <strong>{brands.filter((b) => b.status === 'active').length}</strong>
        </div>
        <div className="management-metric">
          <span>Featured on Web</span>
          <strong>{brands.filter((b) => b.featuredForYou).length}</strong>
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
              placeholder="Search brand name or origin..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading brands...</div>
        ) : visibleBrands.length === 0 ? (
          <div className="enterprise-state">
            <ShieldCheck size={32} />
            <h3>No brands found</h3>
            <p>Add a new accessory brand to your catalog.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>★</th>
                    <th style={{ width: 60 }}>Logo</th>
                    <th>Brand Name</th>
                    <th>Authorization</th>
                    <th>Origin</th>
                    <th>Warranty</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands.map((b) => (
                    <tr key={b.id}>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button"
                          className={`star-btn ${b.featuredForYou ? 'active' : ''}`}
                          onClick={(e) => toggleFeatured(b, e)}
                          title={b.featuredForYou ? 'Remove from Web Hero' : 'Add to Web Hero'}
                        >
                          <Star size={16} fill={b.featuredForYou ? '#eab308' : 'none'} stroke={b.featuredForYou ? '#eab308' : '#9ca3af'} />
                        </button>
                      </td>
                      <td>
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name} className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={16} color="#9ca3af" />
                          </div>
                        )}
                      </td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{b.name}</strong></td>
                      <td>
                        <span className={`management-badge ${b.authorizedStatus === 'authorized' ? 'active' : 'draft'}`}>
                          {b.authorizedStatus || 'Authorized'}
                        </span>
                      </td>
                      <td>{b.originCountry || '-'}</td>
                      <td>{b.warrantyPeriod || '-'}</td>
                      <td>
                        <span className={`management-badge ${b.status || 'active'}`}>
                          {b.status || 'active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="icon-btn text-danger" 
                          title="Delete Brand"
                          onClick={() => handleDelete(b.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleBrands.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add Brand Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Add Accessory Brand</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Brand Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Axor, Alpinestars, MT Helmets" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Logo Image URL</label>
                  <input 
                    type="url" 
                    value={form.imageUrl} 
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                    placeholder="https://..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Origin Country</label>
                    <input 
                      type="text" 
                      value={form.originCountry} 
                      onChange={(e) => setForm({ ...form, originCountry: e.target.value })} 
                      placeholder="e.g. India, Italy" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Warranty</label>
                    <input 
                      type="text" 
                      value={form.warrantyPeriod} 
                      onChange={(e) => setForm({ ...form, warrantyPeriod: e.target.value })} 
                      placeholder="e.g. 1 Year" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
