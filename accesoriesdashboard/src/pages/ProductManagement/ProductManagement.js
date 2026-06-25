import React from 'react';
import { Upload, Plus, AlertTriangle, Search, ChevronDown, CheckCircle2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct, reload } = useProducts();
  const rows = products.map((product) => ({
    id: product.id,
    image: product.media?.primaryImage || '#1f2937',
    name: product.title || 'Untitled Product',
    sku: `SKU: ${product.sku || 'N/A'}`,
    category: product.category || 'Uncategorized',
    price: `$${Number(product.pricing?.sellingPrice || 0).toFixed(2)}`,
    stock: Number(product.inventory?.stockQuantity || 0),
    stockTotal: Math.max(Number(product.inventory?.stockQuantity || 0), Number(product.inventory?.lowStockThreshold || 1) * 10),
    compliance: product.status === 'published' ? 'Verified' : 'Pending Review',
    complianceIcon: product.status === 'published' ? CheckCircle2 : AlertTriangle,
    complianceColor: product.status === 'published' ? 'var(--success)' : 'var(--warning)'
  }));

  const removeProduct = async (event, productId) => {
    event.stopPropagation();
    if (String(productId).length < 8) return;
    await deleteProduct(productId);
    reload();
  };

  return (
    <div className="product-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-subtitle">Manage your inventory, prices, and monitor listing compliance.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn">
            <Upload size={16} />
            Bulk upload
          </button>
          <button className="quick-add-btn" onClick={() => navigate('/products/add')}>
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      <div className="compliance-alert">
        <div className="alert-content">
          <AlertTriangle className="alert-icon" size={20} />
          <div>
            <h4 className="alert-title">Platform Compliance Pending</h4>
            <p className="alert-desc">2 of your products require safety certification documents before they can be listed actively on the store.</p>
          </div>
        </div>
        <button className="resolve-btn">Resolve Now</button>
      </div>

      <div className="product-filters card">
        <div className="filter-item">
          <label>CATEGORY</label>
          <div className="filter-select-wrapper">
            <select>
              <option>All Categories</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>STOCK STATUS</label>
          <div className="filter-select-wrapper">
            <select>
              <option>Any Status</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>PRICE RANGE</label>
          <div className="filter-select-wrapper">
            <select>
              <option>Any Price</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>COMPLIANCE STATUS</label>
          <div className="filter-select-wrapper">
            <select>
              <option>All</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-search-container">
          <div className="search-wrapper">
            <Search size={16} className="search-icon-small" />
            <input type="text" placeholder="Search by ID or name..." />
          </div>
        </div>
      </div>

      <div className="products-table-container card">
        <div className="table-tabs">
          <span className="tab active">All Products ({loading ? '...' : rows.length})</span>
          <span className="tab">Active ({rows.filter((item) => item.compliance === 'Verified').length})</span>
          <span className="tab">Drafts ({rows.filter((item) => item.compliance !== 'Verified').length})</span>
          <span className="tab">Pending Review (2)</span>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col"><input type="checkbox" /></th>
              <th>IMAGE</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>COMPLIANCE</th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const CompIcon = product.complianceIcon;
              const stockPercent = (product.stock / product.stockTotal) * 100;
              const stockColor = stockPercent < 20 ? 'var(--danger)' : 'var(--success)';

              return (
                <tr key={product.id} className="product-row" onClick={() => navigate(`/products/details/${product.id}`)}>
                  <td className="checkbox-col" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="product-img-box" style={{ backgroundColor: product.image.startsWith?.('http') ? '#1f2937' : product.image, backgroundImage: product.image.startsWith?.('http') ? `url(${product.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  </td>
                  <td>
                    <div className="product-info-cell">
                      <span className="product-name-large">{product.name}</span>
                      <span className="product-sku">{product.sku}</span>
                    </div>
                  </td>
                  <td><span className="category-pill">{product.category}</span></td>
                  <td><span className="price-bold">{product.price}</span></td>
                  <td>
                    <div className="stock-cell">
                      <span className="stock-value">{product.stock} <span className="stock-total">/ {product.stockTotal}</span></span>
                      <div className="mini-progress-bar">
                        <div className="mini-progress-fill" style={{ width: `${stockPercent}%`, backgroundColor: stockColor }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="compliance-cell" style={{ color: product.complianceColor }}>
                      <CompIcon size={16} />
                      <span>{product.compliance}</span>
                    </div>
                  </td>
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => navigate(`/products/edit/${product.id}`)}><Edit2 size={16} /></button>
                      <button className="icon-btn text-red" onClick={(event) => removeProduct(event, product.id)}><Trash2 size={16} /></button>
                      <button className="icon-btn"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
