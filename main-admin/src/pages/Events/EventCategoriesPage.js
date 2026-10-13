import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search, Trash2, X, Edit2 } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function EventCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal body scroll lock & escape key handling
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalOpen]);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'event_categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching event categories:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', status: 'active' });
    setError('');
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      status: category.status || 'active'
    });
    setError('');
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'event_categories', editingCategory.id), {
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'event_categories'), {
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          createdAt: serverTimestamp()
        });
      }
      setForm({ name: '', description: '', status: 'active' });
      setEditingCategory(null);
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving event category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event category?')) {
      try {
        await deleteDoc(doc(db, 'event_categories', id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const visibleCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCategories = visibleCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Categories</h1>
          <p className="page-subtitle">Organize event types such as Track Days, Touring, Enduro, and Meetups.</p>
        </div>
        <div className="header-actions-main">
          <button 
            type="button"
            className="btn-primary" 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Event Category
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Categories</span>
          <strong>{loading ? '...' : categories.length}</strong>
        </div>
        <div className="management-metric">
          <span>Active Categories</span>
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
              placeholder="Search category name or description..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading categories...</div>
        ) : visibleCategories.length === 0 ? (
          <div className="enterprise-state">
            <Tags size={32} />
            <h3>No categories found</h3>
            <p>Add a new category to organize your events.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((c) => (
                    <tr key={c.id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{c.name}</strong></td>
                      <td>{c.description || '-'}</td>
                      <td>
                        <span className={`management-badge ${c.status || 'active'}`}>
                          {c.status || 'active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            className="icon-btn" 
                            style={{ color: '#0f766e' }}
                            title="Edit Category"
                            onClick={() => handleEdit(c)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            type="button"
                            className="icon-btn text-danger" 
                            title="Delete Category"
                            onClick={() => handleDelete(c.id)}
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
              totalItems={visibleCategories.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Simple Add Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Event Category' : 'Add Event Category'}</h3>
              <button type="button" className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {error && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Category Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Group Rides" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    placeholder="Brief details about this category..." 
                    rows={3} 
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
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
