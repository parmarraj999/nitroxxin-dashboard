import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Truck, Hourglass } from 'lucide-react';
import './MiddleRow.css';

const MiddleRow = ({ analytics }) => {
  const gearRows = analytics?.topProducts?.map((product, index) => ({
    rank: String(index + 1).padStart(2, '0'),
    name: product.name,
    sales: product.sales,
    revenue: `$${Number(product.revenue || 0).toLocaleString()}`,
    growth: '+0%',
    growthColor: 'var(--primary-orange)',
    imgBg: '#1f2937'
  })) || [];

  const orderRows = analytics?.orders?.slice(0, 3).map((order) => ({
    id: `#${String(order.id).slice(0, 5)}`,
    product: `${order.itemCount || 1} item(s)`,
    status: String(order.status || 'pending').toUpperCase(),
    statusClass: order.status === 'delivered' ? 'status-delivered' : order.status === 'shipped' ? 'status-transit' : 'status-pending',
    time: 'recently',
    icon: order.status === 'delivered' ? Check : order.status === 'shipped' ? Truck : Hourglass,
    iconBg: 'var(--primary-orange-light)',
    iconColor: 'var(--primary-orange)'
  })) || [];

  return (
    <div className="middle-row-container">

      <div className="top-gear-card card">
        <div className="card-header-flex">
          <h2 className="card-title">Top Performing Gear</h2>
          <Link to="/products" className="view-all-link">View All Products</Link>
        </div>

        <div className="table-responsive">
          <table className="gear-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>PRODUCT</th>
                <th>SALES</th>
                <th>REVENUE</th>
                <th>GROWTH</th>
              </tr>
            </thead>
            <tbody>
              {gearRows.length > 0 ? (
                gearRows.map((item, index) => (
                  <tr key={index}>
                    <td className="rank-cell">{item.rank}</td>
                    <td>
                      <div className="product-cell">
                        <div className="product-img-placeholder" style={{ backgroundColor: item.imgBg }}></div>
                        <span className="product-name">{item.name}</span>
                      </div>
                    </td>
                    <td className="sales-cell">{item.sales}</td>
                    <td className="revenue-cell">{item.revenue}</td>
                    <td className="growth-cell" style={{ color: item.growthColor }}>{item.growth}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="revenue-cell" style={{ textAlign: 'center', padding: '24px 0', fontStyle: 'italic', color: 'var(--text-light)' }}>
                    No products sold yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="recent-orders-card card">
        <h2 className="card-title" style={{ marginBottom: '24px' }}>Recent Orders</h2>

        <div className="orders-timeline">
          {orderRows.length > 0 ? (
            orderRows.map((order, index) => {
              const Icon = order.icon;
              return (
                <div key={index} className="order-item">
                  <div className="order-icon-col">
                    <div className="order-icon" style={{ backgroundColor: order.iconBg, color: order.iconColor }}>
                      <Icon size={16} />
                    </div>
                    {index !== orderRows.length - 1 && <div className="order-line"></div>}
                  </div>
                  <div className="order-content">
                    <div className="order-header">
                      <span className="order-id">Order {order.id}</span>
                      <span className="order-time">{order.time}</span>
                    </div>
                    <p className="order-product">{order.product}</p>
                    <span className={`order-status-badge ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="order-product" style={{ color: 'var(--text-light)', padding: '12px 0', fontStyle: 'italic' }}>
              No recent activity.
            </p>
          )}
        </div>

        <Link to="/orders" className="manage-activity-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
          Manage All Activity
        </Link>
      </div>

    </div>
  );
};

export default MiddleRow;
