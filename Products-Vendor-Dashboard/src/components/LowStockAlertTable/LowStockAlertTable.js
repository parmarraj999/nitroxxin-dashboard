import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Package,
  Plus,
  Eye,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react';
import { useProductsContext } from '../../context/ProductsContext';
import { updateProduct, updateInventoryForProduct } from '../../services/productService';
import './LowStockAlertTable.css';

const LowStockAlertTable = ({ analytics }) => {
  const navigate = useNavigate();
  const productsCtx = useProductsContext();

  const contextProducts = productsCtx?.products || [];
  const loading = productsCtx?.loading || false;
  const reloadProducts = productsCtx?.reload;

  // Modal restock state
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(25);
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockSuccess, setRestockSuccess] = useState('');

  // Extract products with low stock (stock <= threshold)
  const lowStockRows = useMemo(() => {
    const sourceProducts = contextProducts.length > 0 ? contextProducts : (analytics?.products || []);
    const list = [];

    sourceProducts.forEach((p) => {
      const stock = Number(p.inventory?.stockQuantity ?? p.stock ?? 0);
      const lowStock = Number(p.inventory?.lowStockThreshold ?? p.lowStock ?? 10);

      // Low stock criteria: stock is less than or equal to alert threshold
      if (stock <= lowStock) {
        const rawPrice = Number(p.pricing?.sellingPrice ?? p.price ?? 0);
        const formattedPrice = rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : '—';
        const stockTotal = Math.max(stock, lowStock * 5, 20);
        const stockPercent = Math.min(100, Math.round((stock / stockTotal) * 100));

        let severity = 'low';
        let severityLabel = 'Low Stock';
        if (stock === 0) {
          severity = 'out';
          severityLabel = 'Out of Stock';
        } else if (stock <= Math.max(2, Math.floor(lowStock / 2))) {
          severity = 'critical';
          severityLabel = 'Critical Low';
        }

        list.push({
          id: p.id,
          name: p.title || p.name || 'Untitled Product',
          image: p.media?.primaryImage || p.image || '',
          sku: p.sku ? `SKU: ${p.sku}` : 'SKU: N/A',
          brand: p.brand || '',
          category: p.category || 'Uncategorized',
          price: formattedPrice,
          rawPrice,
          stock,
          lowStock,
          stockPercent,
          severity,
          severityLabel,
          warehouse: p.shipping?.shippingOrigin || p.warehouseId || 'Warehouse A'
        });
      }
    });

    // Also cross-reference any items from analytics.lowStock
    if (analytics?.lowStock && Array.isArray(analytics.lowStock)) {
      analytics.lowStock.forEach((inv) => {
        const id = inv.productId || inv.id;
        if (!list.some((item) => item.id === id)) {
          const stock = Number(inv.availableStock ?? inv.stock ?? 0);
          const lowStock = Number(inv.lowStockThreshold ?? 5);
          const rawPrice = Number(inv.price || 0);
          const formattedPrice = rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : '—';

          list.push({
            id,
            name: inv.productName || `Product #${id}`,
            image: '',
            sku: inv.sku ? `SKU: ${inv.sku}` : 'SKU: N/A',
            brand: '',
            category: 'Gear & Parts',
            price: formattedPrice,
            rawPrice,
            stock,
            lowStock,
            stockPercent: Math.min(100, Math.round((stock / Math.max(stock, lowStock * 5, 20)) * 100)),
            severity: stock === 0 ? 'out' : (stock <= 2 ? 'critical' : 'low'),
            severityLabel: stock === 0 ? 'Out of Stock' : (stock <= 2 ? 'Critical Low' : 'Low Stock'),
            warehouse: inv.warehouseId || 'Warehouse A'
          });
        }
      });
    }

    // Sort by lowest stock first (0 first, then 1, 2, 3...)
    return list.sort((a, b) => a.stock - b.stock);
  }, [contextProducts, analytics]);

  const handleOpenRestock = (e, product) => {
    e.stopPropagation();
    setRestockProduct(product);
    setRestockQty(25);
    setRestockSuccess('');
  };

  const handleConfirmRestock = async (e) => {
    e.preventDefault();
    if (!restockProduct || restockQty <= 0) return;

    try {
      setIsRestocking(true);
      const newStock = Number(restockProduct.stock) + Number(restockQty);

      // Update both product doc inventory and standalone inventory doc
      await updateProduct(restockProduct.id, {
        inventory: {
          stockQuantity: newStock,
          lowStockThreshold: restockProduct.lowStock
        }
      });

      await updateInventoryForProduct(restockProduct.id, {
        stock: newStock,
        availableStock: newStock,
        lowStockThreshold: restockProduct.lowStock
      });

      setRestockSuccess(`Successfully added +${restockQty} units to ${restockProduct.name}!`);

      if (reloadProducts) {
        reloadProducts();
      }

      setTimeout(() => {
        setRestockProduct(null);
        setIsRestocking(false);
        setRestockSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Failed to restock product:', err);
      setIsRestocking(false);
    }
  };

  return (
    <div className="card dashboard-table-card low-stock-alert-card">
      <div className="dashboard-table-header">
        <div className="table-header-left">
          <div className="table-title-badge-wrap">
            <h2 className="dashboard-table-title">Low Stock Alerts</h2>
            {lowStockRows.length > 0 ? (
              <span className="priority-alert-pill">
                <AlertTriangle size={12} className="alert-pulse-icon" />
                <span>{lowStockRows.length} {lowStockRows.length === 1 ? 'Item Needs Restock' : 'Items Need Restock'}</span>
              </span>
            ) : (
              <span className="stock-ok-pill">
                <CheckCircle2 size={12} />
                <span>All Stock Healthy</span>
              </span>
            )}
          </div>
        </div>
        <div className="table-header-right">
          <Link to="/products" className="dashboard-view-all-link">
            <span>Manage All Inventory</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="products-table low-stock-table">
          <thead>
            <tr>
              <th className="rank-th">#</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>UNIT PRICE</th>
              <th>STOCK LEVEL</th>
              <th>ALERT THRESHOLD</th>
              <th>SEVERITY</th>
              <th className="actions-col">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && lowStockRows.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="dashboard-empty-table-state">
                    <Loader2 size={22} className="spin-icon-inline" />
                    <p>Checking inventory levels...</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && lowStockRows.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="dashboard-empty-table-state stock-healthy-empty">
                    <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '6px' }} />
                    <h3>Inventory Healthy</h3>
                    <p>All store products are currently well-stocked and above minimum thresholds.</p>
                  </div>
                </td>
              </tr>
            )}

            {lowStockRows.map((product, idx) => {
              const hasHttpImage = product.image && product.image.startsWith('http');

              return (
                <tr
                  key={product.id}
                  className={`product-row low-stock-row row-severity-${product.severity}`}
                  onClick={() => navigate(`/products/details/${product.id}`)}
                >
                  {/* 1. Item Rank / Index Badge */}
                  <td className="rank-td" onClick={(e) => e.stopPropagation()}>
                    <span className={`rank-badge rank-severity-${product.severity}`}>
                      #{idx + 1}
                    </span>
                  </td>

                  {/* 2. Product Name + SKU */}
                  <td>
                    <div className="product-item-cell">
                      <div
                        className="product-img-box"
                        style={{
                          backgroundColor: hasHttpImage ? '#1f2937' : (product.image || '#1f2937'),
                          backgroundImage: hasHttpImage ? `url(${product.image})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {!product.image && <Package size={18} color="#94a3b8" />}
                      </div>
                      <div className="product-info-cell">
                        <span className="product-name-large">{product.name}</span>
                        <span className="product-sku">
                          {product.sku} {product.brand ? `• ${product.brand}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Category */}
                  <td>
                    <span className="category-pill">{product.category}</span>
                  </td>

                  {/* 4. Unit Price in ₹ */}
                  <td>
                    <span className="price-bold">{product.price}</span>
                  </td>

                  {/* 5. Remaining Stock with Visual Warning Bar */}
                  <td>
                    <div className="stock-alert-cell">
                      <div className="stock-qty-text-line">
                        <span className={`stock-remaining-val ${product.stock === 0 ? 'text-danger' : (product.stock <= 2 ? 'text-critical' : 'text-warning')}`}>
                          {product.stock} {product.stock === 1 ? 'unit' : 'units'} left
                        </span>
                      </div>
                      <div className="mini-progress-bar">
                        <div
                          className={`mini-progress-fill fill-${product.severity}`}
                          style={{
                            width: `${Math.max(8, product.stockPercent)}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 6. Alert Threshold */}
                  <td>
                    <span className="threshold-pill">
                      ≤ {product.lowStock} units
                    </span>
                  </td>

                  {/* 7. Severity Notion-style Soft Pill */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <span className={`status-pill-notion status-pill-stock-${product.severity}`}>
                      <span className="status-dot"></span>
                      {product.severity === 'out' && <AlertCircle size={11} style={{ marginRight: 2 }} />}
                      {product.severity === 'critical' && <AlertTriangle size={11} style={{ marginRight: 2 }} />}
                      {product.severity === 'low' && <RefreshCw size={10} style={{ marginRight: 2 }} />}
                      <span>{product.severityLabel}</span>
                    </span>
                  </td>

                  {/* 8. Restock Button & View Details */}
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-quick-restock"
                        onClick={(e) => handleOpenRestock(e, product)}
                        title={`Restock ${product.name}`}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                        <span>Restock</span>
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="View product details"
                        onClick={() => navigate(`/products/details/${product.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL: QUICK RESTOCK INVENTORY ================= */}
      {restockProduct && (
        <div className="modal-overlay-custom" onClick={() => !isRestocking && setRestockProduct(null)}>
          <div className="modal-content-custom restock-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="restock-modal-title-group">
                <h3>Restock Inventory</h3>
                <p className="restock-product-subtitle">
                  {restockProduct.name} {restockProduct.price !== '—' ? `• Unit Price: ${restockProduct.price}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={isRestocking}
                onClick={() => setRestockProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            {restockSuccess ? (
              <div className="restock-success-message">
                <CheckCircle2 size={36} color="#10b981" />
                <h4>Inventory Updated</h4>
                <p>{restockSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRestock}>
                <div className="modal-body-custom">
                  {/* Current inventory stats card */}
                  <div className="restock-stats-grid">
                    <div className="restock-stat-box">
                      <span className="stat-label">Current Stock</span>
                      <span className={`stat-number ${restockProduct.stock === 0 ? 'text-red' : 'text-amber'}`}>
                        {restockProduct.stock} units
                      </span>
                    </div>
                    <div className="restock-stat-box">
                      <span className="stat-label">Alert Threshold</span>
                      <span className="stat-number">≤ {restockProduct.lowStock} units</span>
                    </div>
                    <div className="restock-stat-box">
                      <span className="stat-label">New Total Stock</span>
                      <span className="stat-number text-green">
                        {Number(restockProduct.stock) + Number(restockQty || 0)} units
                      </span>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label>Units to Add to Stock</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      required
                      value={restockQty}
                      onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                      className="restock-qty-input"
                    />
                  </div>

                  {/* Quick addition pills */}
                  <div className="quick-qty-pills">
                    {[10, 25, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        className={`quick-pill-btn ${restockQty === qty ? 'active' : ''}`}
                        onClick={() => setRestockQty(qty)}
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer-custom">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    disabled={isRestocking}
                    onClick={() => setRestockProduct(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn restock-confirm-btn"
                    disabled={isRestocking}
                  >
                    {isRestocking ? (
                      <>
                        <Loader2 size={14} className="spin-icon-inline" />
                        <span>Updating Stock...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} strokeWidth={2.5} />
                        <span>Confirm +{restockQty} Units</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlertTable;
