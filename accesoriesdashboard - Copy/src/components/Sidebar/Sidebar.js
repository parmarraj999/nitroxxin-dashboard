import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  BarChart2,
  Users,
  Settings,
  Plus,
  Store,
  Tags,
  ShieldCheck,
  BadgeIndianRupee,
  RotateCcw,
  Star,
  Megaphone,
  FileBarChart,
  CircleDollarSign,
  Bell,
  UserCog,
  Headphones,
  Warehouse,
  Bike
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const mainNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: ClipboardList, label: 'Inventory', path: '/inventory' },
    { icon: BadgeIndianRupee, label: 'Pricing', path: '/pricing' },
    { icon: Truck, label: 'Shipping', path: '/shipping' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  ];

  const adminNav = [
    { icon: Store, label: 'Vendors', path: '/vendors' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: RotateCcw, label: 'Returns', path: '/returns' },
    { icon: Tags, label: 'Categories', path: '/categories' },
    { icon: ShieldCheck, label: 'Brands', path: '/brands' },
    { icon: Star, label: 'Reviews', path: '/reviews' },
    { icon: Megaphone, label: 'Promotions', path: '/promotions' },
    { icon: FileBarChart, label: 'Reports', path: '/reports' },
    { icon: CircleDollarSign, label: 'Finance', path: '/finance' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: UserCog, label: 'Roles', path: '/roles' },
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: Warehouse, label: 'Warehouses', path: '/warehouses' },
    { icon: Bike, label: 'Compatibility', path: '/compatibility' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="accessories-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-dark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#111827" />
              <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
              <circle cx="12" cy="12" r="2" fill="white" />
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
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span>{item.label}</span>
                  </NavLink>
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
                  <li key={`admin-${index}`}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="nav-icon" size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/products/add" className="add-product-btn">
          <Plus size={18} />
          Add Product
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
