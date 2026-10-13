import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search, Trash2, X, Edit2, Layers } from 'lucide-react';
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
import CategorySubcategoriesModal, { normalizeSubcategoriesList } from '../../components/Common/CategorySubcategoriesModal';
import '../../components/Common/ManagementPageLayout.css';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add / Edit Category modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Subcategories builder state inside Add/Edit modal
  const [newSubcatInForm, setNewSubcatInForm] = useState('');

  // Dedicated "Manage Subcategories" popup state
  const [managingSubcategoriesFor, setManagingSubcategoriesFor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    imageName: '',
    parentCategory: '',
    subcategories: [],
    sortOrder: 1,
    status: 'active'
  });

  // Modal body scroll lock & escape key handling
  useEffect(() => {
    const isAnyModalOpen = modalOpen || !!managingSubcategoriesFor;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (modalOpen) setModalOpen(false);
          if (managingSubcategoriesFor) setManagingSubcategoriesFor(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalOpen, managingSubcategoriesFor]);

  // Real-time listener for product categories
  useEffect(() => {
    const q = query(collection(db, 'product_categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(data);
      // Keep managingSubcategoriesFor in sync if open
      setManagingSubcategoriesFor((current) => {
        if (!current) return null;
        const fresh = data.find((c) => c.id === current.id);
        return fresh || current;
      });
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

  // Open modal in Create mode
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      imageUrl: '',
      imageName: '',
      parentCategory: '',
      subcategories: [],
      sortOrder: (categories.length || 0) + 1,
      status: 'active'
    });
    setNewSubcatInForm('');
    setError('');
    setModalOpen(true);
  };

  // Open modal in Edit mode
  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      imageUrl: category.imageUrl || '',
      imageName: category.imageName || '',
      parentCategory: category.parentCategory || '',
      subcategories: normalizeSubcategoriesList(category.subcategories),
      sortOrder: category.sortOrder ?? 1,
      status: category.status || 'active'
    });
    setNewSubcatInForm('');
    setError('');
    setModalOpen(true);
  };

  // Subcategory builder handlers in Add/Edit modal
  const handleAddSubcatToForm = () => {
    const trimmed = newSubcatInForm.trim();
    if (!trimmed) return;
    const exists = form.subcategories.some(
      (s) => (typeof s === 'string' ? s : s.name).toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      setForm({
        ...form,
        subcategories: [
          ...form.subcategories,
          { name: trimmed, imageUrl: '', imageStoragePath: '', imageMediaId: '' }
        ]
      });
    }
    setNewSubcatInForm('');
  };

  const handleRemoveSubcatFromForm = (indexToRemove) => {
    setForm({
      ...form,
      subcategories: form.subcategories.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Create or Update Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const sanitizedSubcategories = form.subcategories
        .map((s) => ({
          name: typeof s === 'string' ? s.trim() : (s.name || '').trim(),
          imageUrl: s.imageUrl || '',
          imageName: s.imageName || '',
          imageStoragePath: s.imageStoragePath || '',
          imageMediaId: s.imageMediaId || ''
        }))
        .filter((s) => s.name);

      const payload = {
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        imageName: (form.imageName || '').trim(),
        parentCategory: form.parentCategory.trim() || 'Rider Gear',
        subcategories: sanitizedSubcategories,
        sortOrder: Number(form.sortOrder) || 1,
        status: form.status
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'product_categories', editingCategory.id), {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'product_categories'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      setModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product category?')) {
      try {
        await deleteDoc(doc(db, 'product_categories', id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  // Manage Subcategories Modal handlers
  const handleOpenManageSubcategories = (category) => {
    setManagingSubcategoriesFor(category);
  };

  const visibleCategories = categories.filter((c) => {
    const term = search.toLowerCase();
    const nameMatch = (c.name || '').toLowerCase().includes(term);
    const parentMatch = (c.parentCategory || '').toLowerCase().includes(term);
    const imageNameMatch = (c.imageName || '').toLowerCase().includes(term);
    const subcats = normalizeSubcategoriesList(c.subcategories);
    const subcatMatch = subcats.some((s) => s.name.toLowerCase().includes(term));
    return nameMatch || parentMatch || imageNameMatch || subcatMatch;
  });

  const paginatedCategories = visibleCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Categories</h1>
          <p className="page-subtitle">Build accessories categories, subcategories hierarchy, and store catalog organization.</p>
        </div>
        <div className="header-actions-main">
          <button 
            type="button"
            className="btn-primary" 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="management-metric">
          <span>Total Categories</span>
          <strong>{loading ? '...' : categories.length}</strong>
        </div>
        <div className="management-metric">
          <span>Total Subcategories</span>
          <strong>
            {loading ? '...' : categories.reduce((sum, c) => sum + normalizeSubcategoriesList(c.subcategories).length, 0)}
          </strong>
        </div>
        <div className="management-metric">
          <span>Active</span>
          <strong>{loading ? '...' : categories.filter((c) => c.status === 'active').length}</strong>
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
              placeholder="Search category, parent, asset name, or subcategories..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading categories...</div>
        ) : visibleCategories.length === 0 ? (
          <div className="enterprise-state">
            <Tags size={32} />
            <h3>No categories found</h3>
            <p>Add a new category or subcategory to organize store catalog.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Icon</th>
                    <th>Category Name</th>
                    <th>Asset Image Name</th>
                    <th>Parent Category</th>
                    <th style={{ minWidth: 240 }}>Subcategories</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((c) => {
                    const subcats = normalizeSubcategoriesList(c.subcategories);
                    return (
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
                        <td>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>{c.name}</strong>
                        </td>
                        <td>
                          {c.imageName ? (
                            <code style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.78rem',
                              border: '1px solid #e2e8f0',
                              display: 'inline-block'
                            }}>
                              {c.imageName}
                            </code>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>—</span>
                          )}
                        </td>
                        <td>{c.parentCategory || 'Top Level'}</td>
                        <td>
                          {subcats.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => handleOpenManageSubcategories(c)}
                              style={{
                                color: 'var(--primary-orange)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                              className="hover-highlight"
                            >
                              <Plus size={13} /> Add Subcategory
                            </button>
                          ) : (
                            <div 
                              className="subcat-pill-container"
                              onClick={() => handleOpenManageSubcategories(c)}
                              style={{ cursor: 'pointer' }}
                              title="Click to manage subcategories with images"
                            >
                              {subcats.slice(0, 3).map((sub, i) => (
                                <span key={i} className="subcat-pill">
                                  {sub.imageUrl ? (
                                    <img 
                                      src={sub.imageUrl} 
                                      alt={sub.name} 
                                      style={{ width: 14, height: 14, borderRadius: 3, objectFit: 'cover' }} 
                                    />
                                  ) : null}
                                  <span>{sub.name}</span>
                                </span>
                              ))}
                              {subcats.length > 3 && (
                                <span className="subcat-pill count-badge" title={subcats.slice(3).map((s) => s.name).join(', ')}>
                                  +{subcats.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>{c.sortOrder ?? 1}</td>
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
                              style={{ color: '#2563eb' }}
                              title="Manage Subcategories (Images & Details)"
                              onClick={() => handleOpenManageSubcategories(c)}
                            >
                              <Layers size={16} />
                            </button>
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
                    );
                  })}
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

      {/* ========================================================
          Modal 1: Add / Edit Product Category Modal
          ======================================================== */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Product Category' : 'Add Product Category'}</h3>
              <button type="button" className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
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
                    placeholder="e.g. Helmets, Riding Jackets, Luggage" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Image / Icon URL</label>
                    <input 
                      type="url" 
                      value={form.imageUrl} 
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                      placeholder="https://..." 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 3, display: 'block' }}>
                      Hosted/Cloud image URL
                    </small>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Asset Image Name</label>
                    <input 
                      type="text" 
                      value={form.imageName} 
                      onChange={(e) => setForm({ ...form, imageName: e.target.value })} 
                      placeholder="e.g. helmet.png, riding_jacket.png" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 3, display: 'block' }}>
                      For manual asset display (e.g. helmet.png)
                    </small>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Parent Category</label>
                  <input 
                    type="text" 
                    value={form.parentCategory} 
                    onChange={(e) => setForm({ ...form, parentCategory: e.target.value })} 
                    placeholder="e.g. Rider Gear, Motorcycle Parts" 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                {/* Subcategories Builder Section */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontWeight: 600, margin: 0 }}>Subcategories</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {form.subcategories.length} added
                      </span>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalOpen(false);
                            setManagingSubcategoriesFor(editingCategory);
                          }}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Layers size={12} /> Manage with Images
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Inline Subcategory Input */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input 
                      type="text" 
                      value={newSubcatInForm} 
                      onChange={(e) => setNewSubcatInForm(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcatToForm();
                        }
                      }}
                      placeholder="e.g. Full Face, Modular..." 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={handleAddSubcatToForm}
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Subcategories Pills List */}
                  {form.subcategories.length > 0 ? (
                    <div className="subcat-pill-container" style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                      {form.subcategories.map((sub, idx) => {
                        const name = typeof sub === 'string' ? sub : sub.name;
                        const img = typeof sub === 'object' ? sub.imageUrl : null;
                        return (
                          <span key={idx} className="subcat-pill">
                            {img ? (
                              <img src={img} alt={name} style={{ width: 14, height: 14, borderRadius: 3, objectFit: 'cover' }} />
                            ) : null}
                            <span>{name}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSubcatFromForm(idx)}
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <small style={{ color: '#94a3b8' }}>Type a subcategory above and click Add or press Enter.</small>
                  )}
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          Modal 2: Dedicated "Manage Subcategories" Modal
          ======================================================== */}
      {managingSubcategoriesFor && (
        <CategorySubcategoriesModal
          category={managingSubcategoriesFor}
          onClose={() => setManagingSubcategoriesFor(null)}
          onSaveSuccess={(updatedSubcats) => {
            setCategories((prev) =>
              prev.map((c) =>
                c.id === managingSubcategoriesFor.id
                  ? { ...c, subcategories: updatedSubcats }
                  : c
              )
            );
          }}
        />
      )}
    </div>
  );
}
