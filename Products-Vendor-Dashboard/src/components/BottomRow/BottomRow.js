import React from 'react';
import { PlusSquare, BarChart2, Package, Megaphone, Star } from 'lucide-react';
import './BottomRow.css';

const BottomRow = ({ analytics }) => {
  const lowStockRows = analytics?.lowStock?.slice(0, 3) || [];
  const reviews = analytics?.reviews?.slice(0, 2) || [];

  const avgRating = analytics?.reviews?.length
    ? (analytics.reviews.reduce((sum, r) => sum + r.rating, 0) / analytics.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="bottom-row-container">

      <div className="quick-actions-card card">
        <h2 className="bottom-card-title">QUICK ACTIONS</h2>
        <div className="actions-grid">
          <button className="action-btn-large">
            <PlusSquare className="action-icon text-orange" size={20} />
            <span>Add Product</span>
          </button>
          <button className="action-btn-large">
            <BarChart2 className="action-icon text-orange" size={20} />
            <span>View Reports</span>
          </button>
          <button className="action-btn-large">
            <Package className="action-icon text-orange" size={20} />
            <span>Inventory</span>
          </button>
          <button className="action-btn-large">
            <Megaphone className="action-icon text-orange" size={20} />
            <span>Promotions</span>
          </button>
        </div>
      </div>

      <div className="reviews-card card">
        <div className="reviews-header">
          <h2 className="bottom-card-title-dark">Latest Reviews</h2>
          <div className="rating-badge">
            {avgRating} <Star size={12} fill="currentColor" />
          </div>
        </div>

        <div className="review-list">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div className="review-item" key={rev.id || idx}>
                <div className="review-header">
                  <span className="reviewer-name">{rev.reviewerName}</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i <= rev.rating ? 'var(--warning)' : 'transparent'}
                        color={i <= rev.rating ? 'var(--warning)' : 'var(--border-color)'}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-text">"{rev.comment}"</p>
              </div>
            ))
          ) : (
            <p className="review-text" style={{ color: 'var(--text-light)', padding: '12px 0', fontStyle: 'italic' }}>
              No customer reviews found.
            </p>
          )}
        </div>
      </div>

      <div className="stock-alerts-card card">
        <div className="alerts-header">
          <h2 className="bottom-card-title-red">Low Stock Alerts</h2>
          <span className="priority-badge">PRIORITY</span>
        </div>

        <div className="alert-list">
          {lowStockRows.length > 0 ? (
            lowStockRows.map((item) => (
              <div className="alert-item" key={item.id || item.productName || item.productId}>
                <div className="alert-info">
                  <span className="alert-name">{item.productName || item.productId}</span>
                  <span className="alert-desc">Last {item.availableStock} units remaining</span>
                </div>
                <button className="restock-btn">Restock</button>
              </div>
            ))
          ) : (
            <p className="review-text" style={{ color: 'var(--text-light)', padding: '12px 0', fontStyle: 'italic' }}>
              All products are fully stocked!
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default BottomRow;
