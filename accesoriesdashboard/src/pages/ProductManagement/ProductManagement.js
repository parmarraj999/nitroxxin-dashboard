import React from 'react';
import { Upload, Plus, AlertTriangle, Search, ChevronDown, CheckCircle2, MoreVertical, Edit2, Trash2, Eye, Archive, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct, publishProduct, draftProduct, archiveProduct, reload } = useProducts();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All Categories');
  const [stockStatus, setStockStatus] = React.useState('Any Status');
  const [statusTab, setStatusTab] = React.useState('all');
  const categories = ['All Categories', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const baseRows = products.map((product) => {
    const stock = Number(product.inventory?.stockQuantity || 0);
    const lowStock = Number(product.inventory?.lowStockThreshold || 5);
    const status = product.status || 'draft';
    return ({
    id: product.id,
    image: product.media?.primaryImage || '#1f2937',
    name: product.title || 'Untitled Product',
    sku: `SKU: ${product.sku || 'N/A'}`,
    rawSku: product.sku || '',
    brand: product.brand || 'Unbranded',
    category: product.category || 'Uncategorized',
    price: `Rs. ${Number(product.pricing?.sellingPrice || 0).toLocaleString()}`,
    mrp: Number(product.pricing?.mrp || 0),
    stock,
    lowStock,
    stockTotal: Math.max(stock, lowStock * 10),
    status,
    stockState: stock <= 0 ? 'Out of Stock' : stock <= lowStock ? 'Low Stock' : 'In Stock',
    compliance: status === 'published' ? 'Live' : status === 'archived' ? 'Archived' : 'Draft',
    complianceIcon: status === 'published' ? CheckCircle2 : AlertTriangle,
    complianceColor: status === 'published' ? 'var(--success)' : status === 'archived' ? 'var(--text-muted)' : 'var(--warning)'
  });
  });
  const rows = baseRows.filter((product) => {
    const haystack = `${product.name} ${product.rawSku} ${product.brand} ${product.category}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesCategory = category === 'All Categories' || product.category === category;
    const matchesStock = stockStatus === 'Any Status' || product.stockState === stockStatus;
    const matchesTab = statusTab === 'all' || product.status === statusTab;
    return matchesSearch && matchesCategory && matchesStock && matchesTab;
  });

  const removeProduct = async (event, productId) => {
    event.stopPropagation();
    if (String(productId).length < 8) return;
    await deleteProduct(productId);
    reload();
  };

  const changeStatus = async (event, productId, action) => {
    event.stopPropagation();
    if (action === 'published') await publishProduct(productId);
    if (action === 'draft') await draftProduct(productId);
    if (action === 'archived') await archiveProduct(productId);
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
            Bulk Upload
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
        <button className="resolve-btn" onClick={() => setStatusTab('draft')}>Resolve Now</button>
      </div>

      <div className="product-filters card">
        <div className="filter-item">
          <label>CATEGORY</label>
          <div className="filter-select-wrapper">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>STOCK STATUS</label>
          <div className="filter-select-wrapper">
            <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
              <option>Any Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>PRICE RANGE</label>
          <div className="filter-select-wrapper">
            <select>
              <option>Any Price</option>
              <option>Under Rs. 1,000</option>
              <option>Rs. 1,000 - Rs. 5,000</option>
              <option>Above Rs. 5,000</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>COMPLIANCE STATUS</label>
          <div className="filter-select-wrapper">
            <select value={statusTab === 'all' ? 'All' : statusTab} onChange={(event) => setStatusTab(event.target.value === 'All' ? 'all' : event.target.value)}>
              <option>All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>

        <div className="filter-search-container">
          <div className="search-wrapper">
            <Search size={16} className="search-icon-small" />
            <input type="text" placeholder="Search SKU, brand, category or name..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="products-table-container card">
        <div className="table-tabs">
          <button className={`tab ${statusTab === 'all' ? 'active' : ''}`} onClick={() => setStatusTab('all')}>All Products ({loading ? '...' : baseRows.length})</button>
          <button className={`tab ${statusTab === 'published' ? 'active' : ''}`} onClick={() => setStatusTab('published')}>Live ({baseRows.filter((item) => item.status === 'published').length})</button>
          <button className={`tab ${statusTab === 'draft' ? 'active' : ''}`} onClick={() => setStatusTab('draft')}>Drafts ({baseRows.filter((item) => item.status === 'draft').length})</button>
          <button className={`tab ${statusTab === 'archived' ? 'active' : ''}`} onClick={() => setStatusTab('archived')}>Archived ({baseRows.filter((item) => item.status === 'archived').length})</button>
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
              <th>STATUS</th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-table-state">
                    <h3>No products match these filters</h3>
                    <p>Add a product or clear filters to continue catalog operations.</p>
                    <button className="quick-add-btn" onClick={() => navigate('/products/add')}><Plus size={16} /> Add Product</button>
                  </div>
                </td>
              </tr>
            )}
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
                      <span className="product-sku">{product.sku} / {product.brand}</span>
                    </div>
                  </td>
                  <td><span className="category-pill">{product.category}</span></td>
                  <td><span className="price-bold">{product.price}</span></td>
                  <td>
                    <div className="stock-cell">
                      <span className="stock-value">{product.stock} <span className="stock-total">/ alert {product.lowStock}</span></span>
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
                      <button className="icon-btn" title="View product" onClick={() => navigate(`/products/details/${product.id}`)}><Eye size={16} /></button>
                      <button className="icon-btn" title="Edit product" onClick={() => navigate(`/products/edit/${product.id}`)}><Edit2 size={16} /></button>
                      {product.status !== 'published' && <button className="icon-btn" title="Publish" onClick={(event) => changeStatus(event, product.id, 'published')}><Rocket size={16} /></button>}
                      {product.status === 'published' && <button className="icon-btn" title="Move to draft" onClick={(event) => changeStatus(event, product.id, 'draft')}><Archive size={16} /></button>}
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
