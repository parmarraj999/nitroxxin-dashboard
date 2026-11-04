import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit2, CheckCircle2, AlertTriangle, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { useProductsContext } from '../../context/ProductsContext';
import { useOrdersContext } from '../../context/OrdersContext';
import './TopPerformingProducts.css';

const TopPerformingProducts = ({ analytics }) => {
  const navigate = useNavigate();
  const productsCtx = useProductsContext();
  const ordersCtx = useOrdersContext();

  const contextProducts = productsCtx?.products || [];
  const contextOrders = ordersCtx?.orders || [];
  const loading = productsCtx?.loading || false;

  const allProducts = contextProducts.length > 0 ? contextProducts : (analytics?.products || []);
  const allOrders = contextOrders.length > 0 ? contextOrders : (analytics?.orders || []);

  const topProducts = useMemo(() => {
    // If context products are not loaded yet but analytics topProducts exists
    if ((!allProducts || allProducts.length === 0) && analytics?.topProducts?.length) {
      return analytics.topProducts.slice(0, 5);
    }

    if (!allProducts || allProducts.length === 0) return [];

    return allProducts
      .map((product) => {
        const orderSales = allOrders.reduce((sum, o) => {
          const item = (o.items || []).find((i) => i.productId === product.id || i.name === product.title);
          return sum + (item ? Number(item.qty || item.quantity || 1) : 0);
        }, 0);
        const orderRev = allOrders.reduce((sum, o) => {
          const item = (o.items || []).find((i) => i.productId === product.id || i.name === product.title);
          const itemPrice = Number(item?.price || product.pricing?.sellingPrice || product.price || 0);
          return sum + (item ? Number(item.qty || item.quantity || 1) * itemPrice : 0);
        }, 0);

        const sales = Math.max(Number(product.salesCount || product.sales || 0), orderSales);
        const revenue = Math.max(Number(product.revenue || 0), orderRev);

        return {
          ...product,
          id: product.id,
          name: product.title || product.name || 'Untitled Product',
          sales,
          revenue,
          category: product.category || 'General'
        };
      })
      .sort((a, b) => (b.revenue || b.sales || 0) - (a.revenue || a.sales || 0))
      .slice(0, 5);
  }, [allProducts, allOrders, analytics]);

  const rows = topProducts.map((product, idx) => {
    const stock = Number(product.inventory?.stockQuantity ?? product.stock ?? 0);
    const lowStock = Number(product.inventory?.lowStockThreshold ?? product.lowStock ?? 5);
    const status = product.status || 'published';
    const rawPrice = Number(product.pricing?.sellingPrice ?? product.price ?? 0);
    const formattedPrice = `₹${rawPrice.toLocaleString('en-IN')}`;
    const revenue = Number(product.revenue || 0);
    const formattedRevenue = `₹${revenue.toLocaleString('en-IN')}`;
    const stockTotal = Math.max(stock, lowStock * 10, 50);
    const stockPercent = Math.min(100, Math.round((stock / stockTotal) * 100));
    const stockColor = stock <= lowStock ? 'var(--danger, #ef4444)' : 'var(--success, #10b981)';
    const image = product.media?.primaryImage || product.image || '';

    return {
      id: product.id,
      rank: idx + 1,
      image,
      name: product.name,
      sku: product.sku ? `SKU: ${product.sku}` : 'SKU: N/A',
      brand: product.brand || '',
      category: product.category || 'Uncategorized',
      price: formattedPrice,
      stock,
      lowStock,
      stockPercent,
      stockColor,
      sales: product.sales || 0,
      revenue: formattedRevenue,
      status,
      compliance: status === 'published' ? 'Live' : status === 'archived' ? 'Archived' : 'Draft',
      complianceIcon: status === 'published' ? CheckCircle2 : AlertTriangle,
      complianceColor: status === 'published' ? 'var(--success, #10b981)' : status === 'archived' ? 'var(--text-muted, #94a3b8)' : 'var(--warning, #f59e0b)'
    };
  });

  return (
    <div className="card dashboard-table-card top-performing-table-card">
      <div className="dashboard-table-header">
        <div className="table-header-left">
          <div className="table-title-badge-wrap">
            <h2 className="dashboard-table-title">Top Performing Products</h2>
            {/* <span className="performing-cou/nt-pill">Top 5 Products</span> */}
          </div>
          {/* <p className="dashboard-table-subtitle">Best selling products ranked by sales performance and revenue</p> */}
        </div>
        <div className="table-header-right">
          <Link to="/products" className="dashboard-view-all-link">
            <span>View All Products</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th className="rank-th">#</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>SALES</th>
              <th>REVENUE</th>
              <th>STATUS</th>
              {/* <th className="actions-col"></th> */}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan="9">
                  <div className="dashboard-empty-table-state">
                    <p>Loading performing products...</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="9">
                  <div className="dashboard-empty-table-state">
                    <Package size={32} color="#94a3b8" style={{ marginBottom: '6px' }} />
                    <h3>No products available</h3>
                    <p>Add products to your store to view sales performance metrics.</p>
                    <button className="quick-add-btn" onClick={() => navigate('/products/add')} style={{ marginTop: '10px' }}>
                      Add Product
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {rows.map((product) => {
              const CompIcon = product.complianceIcon;
              const hasHttpImage = product.image && product.image.startsWith('http');

              return (
                <tr
                  key={product.id}
                  className="product-row"
                  onClick={() => navigate(`/products/details/${product.id}`)}
                >
                  <td className="rank-td" onClick={(e) => e.stopPropagation()}>
                    <span className={`rank-badge rank-${product.rank}`}>
                      #{product.rank}
                    </span>
                  </td>
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
                  <td>
                    <span className="category-pill">{product.category}</span>
                  </td>
                  <td>
                    <span className="price-bold">{product.price}</span>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <span className="stock-value">
                        {product.stock}{' '}
                        <span className="stock-total">/ alert {product.lowStock}</span>
                      </span>
                      <div className="mini-progress-bar">
                        <div
                          className="mini-progress-fill"
                          style={{
                            width: `${product.stockPercent}%`,
                            backgroundColor: product.stockColor
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="sales-data-badge">
                      <TrendingUp size={12} className="sales-trend-icon" />
                      <span>{product.sales} sold</span>
                    </div>
                  </td>
                  <td>
                    <span className="revenue-data-bold">{product.revenue}</span>
                  </td>
                  <td>
                    <div className="compliance-cell" style={{ color: product.complianceColor }}>
                      <CompIcon size={15} />
                      <span>{product.compliance}</span>
                    </div>
                  </td>
                  {/* <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        title="View product details"
                        onClick={() => navigate(`/products/details/${product.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Edit product"
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPerformingProducts;

