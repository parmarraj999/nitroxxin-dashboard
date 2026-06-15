import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Truck, 
  BarChart2,
  Users,
  Settings,
  Plus
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const mainNav = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Products' },
    { icon: ShoppingCart, label: 'Orders' },
    { icon: ClipboardList, label: 'Inventory' },
    { icon: Truck, label: 'Shipping' },
    { icon: BarChart2, label: 'Analytics' },
  ];

  const adminNav = [
    { icon: Users, label: 'Customers' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="accessories-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-dark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#111827"/>
              <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <div className="logo-text">
            <h2>Nitroxx</h2>
            <p>PRECISION GEAR</p>
          </div>
        </div>
      </div>

      <div className="sidebar-nav-container">
        <nav className="sidebar-nav">
          <ul>
            {mainNav.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
                  <Icon className="nav-icon" size={20} />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-section">
          <h3 className="section-title">ADMIN</h3>
          <nav className="sidebar-nav">
            <ul>
              {adminNav.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={`admin-${index}`} className="nav-item">
                    <Icon className="nav-icon" size={20} />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="add-product-btn">
          <Plus size={18} />
          Add Product
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
