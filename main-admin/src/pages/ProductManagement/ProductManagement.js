import React from 'react';
import { Upload, Plus, AlertTriangle, Search, ChevronDown, CheckCircle2, MoreVertical, Edit2, Trash2, Eye, Archive, Rocket, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import Pagination from '../../components/Common/Pagination';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const { 
    products, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    deleteProduct, 
    publishProduct, 
    draftProduct, 
    archiveProduct, 
    reload 
  } = useProducts();

  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All Categories');
  const [stockStatus, setStockStatus] = React.useState('Any Status');
  const [statusTab, setStatusTab] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, category, stockStatus, statusTab]);

  // Handle page change: navigate and trigger on-demand fetch if needed
  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
    if (nextPage * pageSize > products.length && hasMore && !loadingMore && !loading) {
      loadMore();
    }
  };

  // Pre-fetch next batch automatically when approaching the end of cached items
  React.useEffect(() => {
    if (hasMore && !loading && !loadingMore) {
      const remainingItems = products.length - (currentPage * pageSize);
      // Pre-fetch when 5 or fewer items remain ahead of current page
      if (remainingItems <= 5) {
        loadMore();
      }
    }
  }, [currentPage, products.length, hasMore, loading, loadingMore, pageSize, loadMore]);

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

  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

      <div className="table-controls-card">
        <div className="filters-row">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, SKU, brand..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <div className="custom-select">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="select-arrow" size={16} />
            </div>

            <div className="custom-select">
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
                <option value="Any Status">Stock: Any Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <ChevronDown className="select-arrow" size={16} />
            </div>
          </div>
        </div>

        <div className="tabs-row">
          <div className="status-tabs">
            <button className={`tab-btn ${statusTab === 'all' ? 'active' : ''}`} onClick={() => setStatusTab('all')}>All Products ({products.length})</button>
            <button className={`tab-btn ${statusTab === 'published' ? 'active' : ''}`} onClick={() => setStatusTab('published')}>Published ({products.filter((p) => p.status === 'published').length})</button>
            <button className={`tab-btn ${statusTab === 'draft' ? 'active' : ''}`} onClick={() => setStatusTab('draft')}>Drafts ({products.filter((p) => (p.status || 'draft') === 'draft').length})</button>
            <button className={`tab-btn ${statusTab === 'archived' ? 'active' : ''}`} onClick={() => setStatusTab('archived')}>Archived ({products.filter((p) => p.status === 'archived').length})</button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col"><input type="checkbox" /></th>
              <th>Product</th>
              <th>Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                    <Loader2 size={20} className="button-loader" color="#2563eb" />
                    <span>Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-table-state">
                    <h3>No products match these filters</h3>
                    <p>Add a product or clear filters to continue catalog operations.</p>
                    <button className="quick-add-btn" onClick={() => navigate('/products/add')}><Plus size={16} /> Add Product</button>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 && loadingMore ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                    <Loader2 size={18} className="button-loader" color="#2563eb" />
                    <span>Loading products for page {currentPage}...</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((product) => {
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
              })
            )}
          </tbody>
        </table>
        
        <Pagination 
          currentPage={currentPage}
          totalItems={rows.length}
          pageSize={pageSize}
          hasMore={hasMore}
          isLoadingMore={loadingMore}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductManagement;
