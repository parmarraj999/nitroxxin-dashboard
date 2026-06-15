import React from 'react';
import './RevenueCategory.css';

const RevenueCategory = () => {
  const categories = [
    { name: 'Night Rides', value: '$34.2k', progress: 85, color: '#f97316' }, // orange
    { name: 'Adventure Tours', value: '$28.9k', progress: 65, color: '#2563eb' }, // blue
    { name: 'Workshops', value: '$21.1k', progress: 45, color: '#c2410c' }, // dark orange
  ];

  return (
    <div className="revenue-category-card card">
      <h2 className="card-title" style={{ marginBottom: '24px' }}>Revenue by Category</h2>
      
      <div className="categories-list">
        {categories.map((category, index) => (
          <div key={index} className="category-item">
            <div className="category-header">
              <span className="category-name">{category.name}</span>
              <span className="category-value">{category.value}</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${category.progress}%`, 
                  backgroundColor: category.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="revenue-insight">
        <p>"Night Rides currently leading Q3 revenue targets by 12%."</p>
      </div>
    </div>
  );
};

export default RevenueCategory;
