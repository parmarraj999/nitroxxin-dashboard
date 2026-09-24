import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search, Trash2, X } from 'lucide-react';
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
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    parentCategory: '',
    sortOrder: 1,
    status: 'active'
  });

  // Real-time listener for product categories
  useEffect(() => {
    const q = query(collection(db, 'product_categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching product categories:', err);
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
      await addDoc(collection(db, 'product_categories'), {
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        parentCategory: form.parentCategory.trim() || 'Rider Gear',
        sortOrder: Number(form.sortOrder) || 1,
        status: form.status,
        createdAt: serverTimestamp()
      });
      setForm({ name: '', imageUrl: '', parentCategory: '', sortOrder: 1, status: 'active' });
      setModalOpen(false);
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product category?')) {
      try {
        await deleteDoc(doc(db, 'product_categories', id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const visibleCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.parentCategory || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCategories = visibleCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Categories</h1>
          <p className="page-subtitle">Build accessories categories, manage hierarchy, subcategories, and filter attributes.</p>
        </div>
        <div className="header-actions-main">
          <button 
            className="btn-primary" 
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="management-metric">
          <span>Total Categories</span>
          <strong>{loading ? '...' : categories.length}</strong>
        </div>
        <div className="management-metric">
          <span>Active</span>
          <strong>{categories.filter((c) => c.status === 'active').length}</strong>
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
              placeholder="Search category name or parent..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading categories...</div>
        ) : visibleCategories.length === 0 ? (
          <div className="enterprise-state">
            <Tags size={32} />
            <h3>No categories found</h3>
            <p>Add a new category to organize store catalog.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Icon</th>
                    <th>Category Name</th>
                    <th>Parent Category</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tags size={16} color="#9ca3af" />
                          </div>
                        )}
                      </td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{c.name}</strong></td>
                      <td>{c.parentCategory || 'Top Level'}</td>
                      <td>{c.sortOrder ?? 1}</td>
                      <td>
                        <span className={`management-badge ${c.status || 'active'}`}>
                          {c.status || 'active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="icon-btn text-danger" 
                          title="Delete Category"
                          onClick={() => handleDelete(c.id)}
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
              totalItems={visibleCategories.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Add Product Category</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Category Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Helmets, Riding Jackets" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Image / Icon URL</label>
                  <input 
                    type="url" 
                    value={form.imageUrl} 
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                    placeholder="https://..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Parent Category</label>
                  <input 
                    type="text" 
                    value={form.parentCategory} 
                    onChange={(e) => setForm({ ...form, parentCategory: e.target.value })} 
                    placeholder="e.g. Rider Gear" 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Sort Order</label>
                    <input 
                      type="number" 
                      value={form.sortOrder} 
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Status</label>
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
