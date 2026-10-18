import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  BarChart2,
  BadgeIndianRupee,
  Plus,
  Settings,
  UserCircle2,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthVendor();
  const [loggingOut, setLoggingOut] = useState(false);

  const mainNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: ClipboardList, label: 'Inventory', path: '/inventory' },
    { icon: BadgeIndianRupee, label: 'Pricing', path: '/pricing' },
    { icon: Truck, label: 'Shipping', path: '/shipping' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  ];

  const accountNav = [
    { icon: UserCircle2, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      setLoggingOut(false);
    }
  };

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
          <h3 className="section-title">ACCOUNT</h3>
          <nav className="sidebar-nav">
            <ul>
              {accountNav.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={`account-${index}`}>
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
        {/* Vendor info strip */}
        {user && (
          <div className="sidebar-vendor-strip">
            <div className="sidebar-vendor-avatar">
              {(user.email?.[0] || 'V').toUpperCase()}
            </div>
            <div className="sidebar-vendor-info">
              <p className="sidebar-vendor-email">{user.email}</p>
              <p className="sidebar-vendor-role">Vendor</p>
            </div>
          </div>
        )}

        <div className="sidebar-footer-btns">
          <NavLink to="/products/add" className="add-product-btn">
            <Plus size={18} />
            Add Product
          </NavLink>

          <button
            id="sidebar-logout-btn"
            className="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
          >
            {loggingOut ? (
              <Loader2 size={18} className="logout-spinner" />
            ) : (
              <LogOut size={18} />
            )}
            <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
