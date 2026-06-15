import React from 'react';
import { PlusSquare, BarChart2, Package, Megaphone, Star } from 'lucide-react';
import './BottomRow.css';

const BottomRow = () => {
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
            4.8 <Star size={12} fill="currentColor" />
          </div>
        </div>

        <div className="review-list">
          <div className="review-item">
            <div className="review-header">
              <span className="reviewer-name">Marco R.</span>
              <div className="stars">
                {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="var(--warning)" color="var(--warning)" />)}
              </div>
            </div>
            <p className="review-text">"The Apex Carbon Pro is truly a game changer. Light and fits perfect!"</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <span className="reviewer-name">Elena K.</span>
              <div className="stars">
                {[1,2,3,4].map(i => <Star key={i} size={10} fill="var(--warning)" color="var(--warning)" />)}
                <Star size={10} color="var(--border-color)" fill="var(--bg-body)" />
              </div>
            </div>
            <p className="review-text">"Leather quality is top notch on the Vantage jacket. A bit snug..."</p>
          </div>
        </div>
      </div>

      <div className="stock-alerts-card card">
        <div className="alerts-header">
          <h2 className="bottom-card-title-red">Low Stock Alerts</h2>
          <span className="priority-badge">PRIORITY</span>
        </div>

        <div className="alert-list">
          <div className="alert-item">
            <div className="alert-info">
              <span className="alert-name">Kevlar Base Layer (M)</span>
              <span className="alert-desc">Last 5 units remaining</span>
            </div>
            <button className="restock-btn">Restock</button>
          </div>

          <div className="alert-item">
            <div className="alert-info">
              <span className="alert-name">Chain Lube 400ml</span>
              <span className="alert-desc">Last 8 units remaining</span>
            </div>
            <button className="restock-btn">Restock</button>
          </div>

          <div className="alert-item">
            <div className="alert-info">
              <span className="alert-name">Rain Gaiters (L)</span>
              <span className="alert-desc">Last 12 units remaining</span>
            </div>
            <button className="restock-btn">Restock</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BottomRow;
