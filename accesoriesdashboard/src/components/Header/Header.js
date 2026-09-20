import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Mail, Moon } from 'lucide-react';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import './Header.css';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'V';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuthVendor();

  // Derive a human-friendly name from the email (before the @)
  const emailName = user?.email?.split('@')[0] || 'Vendor';
  const displayName = emailName
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const initials = getInitials(displayName);

  return (
    <header className="accessories-header">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search orders, products, or vendors..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Online</span>
        </div>

        <div className="icon-group">
          <button className="action-btn">
            <Bell size={20} />
          </button>
          <button className="action-btn">
            <Mail size={20} />
          </button>
          <button className="action-btn">
            <Moon size={20} />
          </button>
        </div>

        <button
          id="header-profile-btn"
          className="header-profile"
          onClick={() => navigate('/profile')}
          title="Go to profile"
        >
          <div className="header-profile-info">
            <h4>{displayName}</h4>
            <p>Vendor Admin</p>
          </div>
          <div className="header-avatar-initials">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
