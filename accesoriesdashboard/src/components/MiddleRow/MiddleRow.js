import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Truck, Hourglass } from 'lucide-react';
import './MiddleRow.css';

const gearData = [
  {
    rank: '01',
    name: 'Apex Carbon Pro Helmet',
    sales: 245,
    revenue: '$122,500',
    growth: '+18%',
    growthColor: 'var(--success)',
    imgBg: '#1f2937' 
  },
  {
    rank: '02',
    name: 'Vantage Leather Armor Jacket',
    sales: 189,
    revenue: '$85,050',
    growth: '+12%',
    growthColor: 'var(--success)',
    imgBg: '#374151'
  },
  {
    rank: '03',
    name: 'Torque-S Racing Gloves',
    sales: 412,
    revenue: '$41,200',
    growth: '+5%',
    growthColor: 'var(--primary-orange)',
    imgBg: '#4b5563'
  }
];

const ordersData = [
  {
    id: '#88412',
    product: 'Apex Carbon Pro x1',
    status: 'DELIVERED',
    statusClass: 'status-delivered',
    time: '2m ago',
    icon: Check,
    iconBg: 'var(--success-light)',
    iconColor: 'var(--success)'
  },
  {
    id: '#88409',
    product: 'Vantage Leather Jacket x2',
    status: 'IN TRANSIT',
    statusClass: 'status-transit',
    time: '15m ago',
    icon: Truck,
    iconBg: 'var(--primary-orange-light)',
    iconColor: 'var(--primary-orange)'
  },
  {
    id: '#88405',
    product: 'Torque-S Gloves x3',
    status: 'PENDING',
    statusClass: 'status-pending',
    time: '1h ago',
    icon: Hourglass,
    iconBg: '#f3f4f6',
    iconColor: '#6b7280'
  }
];

const MiddleRow = () => {
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
              {gearData.map((item, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="recent-orders-card card">
        <h2 className="card-title" style={{ marginBottom: '24px' }}>Recent Orders</h2>

        <div className="orders-timeline">
          {ordersData.map((order, index) => {
            const Icon = order.icon;
            return (
              <div key={index} className="order-item">
                <div className="order-icon-col">
                  <div className="order-icon" style={{ backgroundColor: order.iconBg, color: order.iconColor }}>
                    <Icon size={16} />
                  </div>
                  {index !== ordersData.length - 1 && <div className="order-line"></div>}
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
          })}
        </div>

        <button className="manage-activity-btn">Manage All Activity</button>
      </div>

    </div>
  );
};

export default MiddleRow;
