import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Search, Trash2, X } from 'lucide-react';
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

export default function InventoryManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    sku: '',
    productName: '',
    stockQuantity: 10,
    lowStockThreshold: 5,
    warehouse: 'Mumbai Hub',
    status: 'in_stock'
  });

  // Real-time listener for inventory
  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching inventory:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const adjustStock = async (item, delta, e) => {
    e.stopPropagation();
    const newQty = Math.max(0, Number(item.stockQuantity || 0) + delta);
    const threshold = Number(item.lowStockThreshold || 5);
    const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= threshold ? 'low_stock' : 'in_stock';
    try {
      await updateDoc(doc(db, 'inventory', item.id), {
        stockQuantity: newQty,
        status: newStatus
      });
    } catch (err) {
      console.error('Error adjusting stock:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.productName.trim()) return;
    setSubmitting(true);
    const qty = Number(form.stockQuantity) || 0;
    const thresh = Number(form.lowStockThreshold) || 5;
    const calcStatus = qty === 0 ? 'out_of_stock' : qty <= thresh ? 'low_stock' : 'in_stock';

    try {
      await addDoc(collection(db, 'inventory'), {
        sku: form.sku.trim().toUpperCase(),
        productName: form.productName.trim(),
        stockQuantity: qty,
        lowStockThreshold: thresh,
        warehouse: form.warehouse.trim() || 'Central Hub',
        status: calcStatus,
        createdAt: serverTimestamp()
      });
      setForm({ sku: '', productName: '', stockQuantity: 10, lowStockThreshold: 5, warehouse: 'Mumbai Hub', status: 'in_stock' });
      setModalOpen(false);
    } catch (err) {
      console.error('Error adding inventory item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inventory item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
      } catch (err) {
        console.error('Error deleting inventory:', err);
      }
    }
  };

  const visibleItems = items.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (item.sku || '').toLowerCase().includes(term) ||
      (item.productName || '').toLowerCase().includes(term) ||
      (item.warehouse || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedItems = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const lowStockCount = items.filter((i) => (Number(i.stockQuantity) || 0) <= (Number(i.lowStockThreshold) || 5) && Number(i.stockQuantity) > 0).length;
  const outOfStockCount = items.filter((i) => Number(i.stockQuantity) <= 0).length;

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track warehouse inventory quantities, batch distributions, and low stock warnings.</p>
        </div>
        <div className="header-actions-main">
          <button 
            className="btn-primary" 
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Stock Item
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total SKUs</span>
          <strong>{loading ? '...' : items.length}</strong>
        </div>
        <div className="management-metric">
          <span>In Stock</span>
          <strong>{items.filter((i) => Number(i.stockQuantity) > (Number(i.lowStockThreshold) || 5)).length}</strong>
        </div>
        <div className="management-metric">
          <span style={{ color: '#d97706' }}>Low Stock Alert</span>
          <strong style={{ color: '#d97706' }}>{lowStockCount}</strong>
        </div>
        <div className="management-metric">
          <span style={{ color: '#dc2626' }}>Out of Stock</span>
          <strong style={{ color: '#dc2626' }}>{outOfStockCount}</strong>
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
              placeholder="Search by SKU, product name, or hub..." 
            />
          </div>

          <div className="management-select-wrapper">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading inventory...</div>
        ) : visibleItems.length === 0 ? (
          <div className="enterprise-state">
            <Boxes size={32} />
            <h3>No inventory items</h3>
            <p>Add a product SKU to begin tracking inventory across warehouses.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Warehouse Hub</th>
                    <th>Stock Quantity</th>
                    <th>Reorder Alert</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const qty = Number(item.stockQuantity) || 0;
                    const thresh = Number(item.lowStockThreshold) || 5;
                    const isLow = qty > 0 && qty <= thresh;
                    const isOut = qty <= 0;

                    return (
                      <tr key={item.id}>
                        <td><code>{item.sku || 'NO-SKU'}</code></td>
                        <td><strong style={{ color: 'var(--text-main)' }}>{item.productName || 'Product'}</strong></td>
                        <td>{item.warehouse || 'Central'}</td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <button 
                              type="button" 
                              className="icon-btn" 
                              style={{ width: 24, height: 24, padding: 0 }}
                              onClick={(e) => adjustStock(item, -1, e)}
                              title="Decrease Stock"
                            >-</button>
                            <span style={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                            <button 
                              type="button" 
                              className="icon-btn" 
                              style={{ width: 24, height: 24, padding: 0 }}
                              onClick={(e) => adjustStock(item, 1, e)}
                              title="Increase Stock"
                            >+</button>
                          </div>
                        </td>
                        <td>{thresh}</td>
                        <td>
                          <span className={`management-badge ${isOut ? 'cancelled' : isLow ? 'draft' : 'published'}`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="icon-btn text-danger" 
                            title="Delete Item"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add Stock Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>SKU Code *</label>
                  <input 
                    type="text" 
                    value={form.sku} 
                    onChange={(e) => setForm({ ...form, sku: e.target.value })} 
                    placeholder="e.g. AXR-HLM-001" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Product Name *</label>
                  <input 
                    type="text" 
                    value={form.productName} 
                    onChange={(e) => setForm({ ...form, productName: e.target.value })} 
                    placeholder="e.g. Axor Apex Solid Black Helmet (M)" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Initial Stock</label>
                    <input 
                      type="number" 
                      value={form.stockQuantity} 
                      onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Low Stock Reorder Alert</label>
                    <input 
                      type="number" 
                      value={form.lowStockThreshold} 
                      onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Warehouse Hub</label>
                  <input 
                    type="text" 
                    value={form.warehouse} 
                    onChange={(e) => setForm({ ...form, warehouse: e.target.value })} 
                    placeholder="e.g. Mumbai Hub, Bengaluru FC" 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
