import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit2,
  FileText,
  Package,
  Shield,
  Star,
  Tags,
  Trash2,
  Truck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { deleteProduct } from '../../services/productService';
import './ProductDetails.css';

const formatLabel = (value = '') => value.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
const formatValue = (value) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value && typeof value === 'object') return Object.values(value).filter(Boolean).join(', ');
  return value || '-';
};

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { product, loading } = useProduct(productId);

  if (loading) {
    return <div className="product-details-page"><div className="enterprise-state card">Loading product...</div></div>;
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await deleteProduct(productId);
      navigate('/products');
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  const title = product?.title || 'Untitled Product';
  const price = Number(product?.pricing?.sellingPrice || 0);
  const mrp = Number(product?.pricing?.mrp || 0);
  const stock = Number(product?.inventory?.stockQuantity || 0);
  const lowStock = Number(product?.inventory?.lowStockThreshold || 5);
  const mediaUrl = product?.media?.primaryImage || product?.media?.coverImage;
  const attributes = Object.entries(product?.attributes || {}).filter(([key]) => key !== 'generatedSearchFilters' && key !== 'supportedAttributes');
  const variants = product?.variants || [];
  const status = product?.status || 'draft';
  const margin = price && Number(product?.pricing?.costPrice) ? Math.round(((price - Number(product.pricing.costPrice)) / price) * 100) : 0;

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/products')}><ArrowLeft size={16} /> Back to Products</button>
          <div className="breadcrumb">
            <span>Products</span> <ChevronRight size={14} /> <span>{product?.category || 'Accessories'}</span> <ChevronRight size={14} /> <span className="current">{title}</span>
          </div>
        </div>
        <div className="header-actions-main">
          <button className="export-btn"><Download size={16} /> Export Listing</button>
          <button className="export-btn danger-btn" onClick={handleDelete}><Trash2 size={16} /> Delete Product</button>
          <button className="quick-add-btn" onClick={() => navigate(`/products/edit/${productId || ''}`)}><Edit2 size={16} /> Edit Product</button>
        </div>
      </div>

      <div className="seller-product-hero card">
        <div className="seller-product-image" style={{ backgroundImage: mediaUrl ? `url(${mediaUrl})` : undefined }}>
          {!mediaUrl && <Package size={42} />}
        </div>
        <div className="seller-product-summary">
          <div className="status-line">
            <span className={`catalog-status ${status}`}>{status}</span>
            <span>{product?.sku || 'No SKU'}</span>
            <span>{product?.brand || 'No brand'}</span>
          </div>
          <h1>{title}</h1>
          <p>{product?.subtitle || product?.shortDescription || product?.fullDescription || 'No product description added yet.'}</p>
          <div className="summary-chips">
            <span>{product?.category || 'Uncategorized'}</span>
            <span>{product?.subCategory || 'No subcategory'}</span>
            <span>{product?.productType || 'Product'}</span>
            <span>{product?.universalProduct ? 'Universal fit' : 'Vehicle specific'}</span>
          </div>
        </div>
        <div className="seller-product-price">
          <span>Selling Price</span>
          <strong>Rs. {price.toLocaleString()}</strong>
          {mrp > 0 && <small>MRP Rs. {mrp.toLocaleString()}</small>}
        </div>
      </div>

      <div className="product-health-grid">
        <div className="health-card card"><Tags size={18} /><span>Catalog Status</span><strong>{status === 'published' ? 'Live' : formatLabel(status)}</strong></div>
        <div className="health-card card"><Package size={18} /><span>Available Stock</span><strong className={stock <= lowStock ? 'risk' : ''}>{stock}</strong></div>
        <div className="health-card card"><BarChart3 size={18} /><span>Margin</span><strong>{margin ? `${margin}%` : '-'}</strong></div>
        <div className="health-card card"><Shield size={18} /><span>Compliance</span><strong>{Object.values(product?.safety || {}).some(Boolean) ? 'Verified' : 'Pending'}</strong></div>
      </div>

      <div className="details-layout seller-layout">
        <div className="left-column">
          <div className="specs-container card">
            <div className="specs-tabs">
              <span className="tab active">Dynamic Specifications</span>
              <span className="tab">Search Filters</span>
              <span className="tab">Compare Data</span>
            </div>
            <div className="specs-content">
              <div className="spec-row"><span className="spec-label">Product Name</span><span className="spec-value">{title}</span></div>
              <div className="spec-row"><span className="spec-label">Barcode / QR</span><span className="spec-value">{product?.barcode || '-'} / {product?.qrCode || '-'}</span></div>
              <div className="spec-row"><span className="spec-label">Manufacturer</span><span className="spec-value">{product?.manufacturer || '-'}</span></div>
              <div className="spec-row"><span className="spec-label">Origin</span><span className="spec-value">{product?.countryOfManufacture || '-'}</span></div>
              {attributes.map(([key, value]) => (
                <div className="spec-row" key={key}>
                  <span className="spec-label">{formatLabel(key)}</span>
                  <span className="spec-value">{formatValue(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Variants</h3>
            {variants.length === 0 ? (
              <div className="soft-empty">No variants added. Single-SKU product.</div>
            ) : (
              <div className="seller-table-wrap">
                <table className="seller-table">
                  <thead><tr><th>Options</th><th>SKU</th><th>Stock</th><th>Price</th></tr></thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id || variant.sku}>
                        <td>{formatValue(variant.options)}</td>
                        <td>{variant.sku || '-'}</td>
                        <td>{variant.stock || 0}</td>
                        <td>Rs. {Number(variant.price || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Content & Policies</h3>
            <div className="policy-grid">
              <div><h4>Highlights</h4><p>{formatValue(product?.highlights)}</p></div>
              <div><h4>Package Contents</h4><p>{formatValue(product?.boxContents)}</p></div>
              <div><h4>Warranty</h4><p>{product?.warranty || '-'}</p></div>
              <div><h4>Return Policy</h4><p>{product?.returnPolicy || product?.shipping?.returnPolicy || '-'}</p></div>
              <div><h4>Replacement Policy</h4><p>{product?.replacementPolicy || '-'}</p></div>
              <div><h4>Care Instructions</h4><p>{product?.careInstructions || '-'}</p></div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="seller-section card">
            <h3 className="section-title">Inventory</h3>
            <div className="side-metric"><span>Warehouse</span><strong>{product?.inventory?.warehouse || product?.shipping?.shippingOrigin || '-'}</strong></div>
            <div className="side-metric"><span>Available</span><strong>{stock}</strong></div>
            <div className="side-metric"><span>Reserved</span><strong>{product?.inventory?.reservedStock || 0}</strong></div>
            <div className="side-metric"><span>Incoming</span><strong>{product?.inventory?.incomingStock || 0}</strong></div>
            {stock <= lowStock && <div className="side-warning"><AlertTriangle size={16} /> Low stock threshold reached</div>}
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Pricing</h3>
            {['mrp', 'sellingPrice', 'offerPrice', 'dealerPrice', 'wholesalePrice', 'gstRate', 'platformFee', 'shippingFee', 'codCharges'].map((field) => (
              <div className="side-metric" key={field}><span>{formatLabel(field)}</span><strong>{field.includes('Rate') || field.includes('Fee') ? formatValue(product?.pricing?.[field]) : `Rs. ${Number(product?.pricing?.[field] || 0).toLocaleString()}`}</strong></div>
            ))}
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Bike Compatibility</h3>
            <div className="side-metric"><span>Brand</span><strong>{product?.compatibilityDetail?.bikeBrand || '-'}</strong></div>
            <div className="side-metric"><span>Model</span><strong>{product?.compatibilityDetail?.bikeModel || '-'}</strong></div>
            <div className="side-metric"><span>Engine</span><strong>{product?.compatibilityDetail?.engine || '-'}</strong></div>
            <div className="side-metric"><span>Years</span><strong>{product?.compatibilityDetail?.compatibleYear || '-'}</strong></div>
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Documents</h3>
            <button className="doc-button"><FileText size={16} /> Manual PDF</button>
            <button className="doc-button"><Shield size={16} /> Certificates</button>
            <button className="doc-button"><Truck size={16} /> Installation Guide</button>
          </div>

          <div className="seller-section card">
            <h3 className="section-title">Reviews</h3>
            <div className="rating-summary">
              <div className="stars">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={14} fill="var(--warning)" color="var(--warning)" />)}</div>
              <span>{Number(product?.averageRating || 0).toFixed(1)} / 5 ({product?.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
