import React from 'react';
import { Upload, Plus, AlertTriangle, Search, ChevronDown, CheckCircle2, XCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProductManagement.css';

const products = [
  {
    id: 1,
    image: '#1f2937',
    name: 'Apex Carbon Pro Helmet',
    sku: 'SKU: NX-HELM-001',
    category: 'Helmets',
    price: '$299.99',
    stock: 124,
    stockTotal: 150,
    compliance: 'Verified',
    complianceIcon: CheckCircle2,
    complianceColor: 'var(--success)'
  },
  {
    id: 2,
    image: '#374151',
    name: 'Vantage Leather Jacket',
    sku: 'SKU: NX-JACK-042',
    category: 'Jackets',
    price: '$349.00',
    stock: 12,
    stockTotal: 100,
    compliance: 'Pending Review',
    complianceIcon: AlertTriangle,
    complianceColor: 'var(--warning)'
  },
  {
    id: 3,
    image: '#4b5563',
    name: 'Torque-S Racing Gloves',
    sku: 'SKU: NX-GLOV-089',
    category: 'Gloves',
    price: '$89.50',
    stock: 342,
    stockTotal: 400,
    compliance: 'Verified',
    complianceIcon: CheckCircle2,
    complianceColor: 'var(--success)'
  }
];

const ProductManagement = () => {
  const navigate = useNavigate();

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
          <span className="tab active">All Products (124)</span>
          <span className="tab">Active (118)</span>
          <span className="tab">Drafts (4)</span>
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
            {products.map((product) => {
              const CompIcon = product.complianceIcon;
              const stockPercent = (product.stock / product.stockTotal) * 100;
              const stockColor = stockPercent < 20 ? 'var(--danger)' : 'var(--success)';
              
              return (
                <tr key={product.id} className="product-row" onClick={() => navigate('/products/details')}>
                  <td className="checkbox-col" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="product-img-box" style={{ backgroundColor: product.image }}></div>
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
                      <button className="icon-btn"><Edit2 size={16} /></button>
                      <button className="icon-btn text-red"><Trash2 size={16} /></button>
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
