import React, { useState, useEffect } from 'react';
import { Bike, Plus, Search, Trash2, X } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import BrandBikesModal from '../../components/Common/BrandBikesModal';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function BikeBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [managingBikesFor, setManagingBikesFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    originCountry: 'India',
    popularSegment: 'Naked / Adventure',
    status: 'active'
  });

  // Real-time listener for bike brands
  useEffect(() => {
    const q = query(collection(db, 'bike_brands'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBrands(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching bike brands:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'bike_brands'), {
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        originCountry: form.originCountry.trim() || 'India',
        popularSegment: form.popularSegment.trim() || 'Sport',
        status: form.status,
        createdAt: serverTimestamp()
      });
      setForm({ name: '', imageUrl: '', originCountry: 'India', popularSegment: 'Naked / Adventure', status: 'active' });
      setModalOpen(false);
    } catch (err) {
      console.error('Error adding bike brand:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this bike brand?')) {
      try {
        await deleteDoc(doc(db, 'bike_brands', id));
      } catch (err) {
        console.error('Error deleting bike brand:', err);
      }
    }
  };

  const visibleBrands = brands.filter((b) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.originCountry || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.popularSegment || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginatedBrands = visibleBrands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bike Brands & Models</h1>
          <p className="page-subtitle">Manage motorcycle manufacturers and map individual bike models for parts compatibility.</p>
        </div>
        <div className="header-actions-main">
          <button 
            className="btn-primary" 
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Bike Brand
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="management-metric">
          <span>Total Bike Brands</span>
          <strong>{loading ? '...' : brands.length}</strong>
        </div>
        <div className="management-metric">
          <span>Active</span>
          <strong>{brands.filter((b) => b.status === 'active').length}</strong>
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
              placeholder="Search bike brand, origin, or segment..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading bike brands...</div>
        ) : visibleBrands.length === 0 ? (
          <div className="enterprise-state">
            <Bike size={32} />
            <h3>No bike brands found</h3>
            <p>Add motorcycle brands to configure bike compatibility for accessories.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Logo</th>
                    <th>Bike Brand</th>
                    <th>Origin</th>
                    <th>Popular Segment</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name} className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bike size={16} color="#9ca3af" />
                          </div>
                        )}
                      </td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{b.name}</strong></td>
                      <td>{b.originCountry || '-'}</td>
                      <td>{b.popularSegment || '-'}</td>
                      <td>
                        <span className={`management-badge ${b.status || 'active'}`}>
                          {b.status || 'active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button 
                            className="icon-btn" 
                            style={{ color: '#2563eb' }}
                            title="Manage Bike Models (Compatibility)"
                            onClick={() => setManagingBikesFor(b)}
                          >
                            <Bike size={16} />
                          </button>
                          <button 
                            className="icon-btn text-danger" 
                            title="Delete Brand"
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {/* Add Bike Brand Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Add Bike Brand</h3>
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
                    placeholder="e.g. KTM, Royal Enfield, Yamaha" 
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
                      placeholder="e.g. Austria, India, Japan" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Popular Segment</label>
                    <input 
                      type="text" 
                      value={form.popularSegment} 
                      onChange={(e) => setForm({ ...form, popularSegment: e.target.value })} 
                      placeholder="e.g. Adventure, Cruiser" 
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

      {/* Direct Brand Bikes Modal */}
      {managingBikesFor && (
        <BrandBikesModal
          brand={managingBikesFor}
          collectionName="bike_brands"
          onClose={() => setManagingBikesFor(null)}
        />
      )}
    </div>
  );
}
