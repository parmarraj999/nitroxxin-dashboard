import React from 'react';
import { Search, Bell, Mail, Settings, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="admin-header">
      <div className="search-container">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search orders, products, customers, vendors..."
          className="search-input"
          id="global-search"
        />
        <span className="search-shortcut">⌘K</span>
      </div>

      <div className="header-actions">
        <div className="status-indicator">
          <span className="status-dot" />
          <span className="status-text">All Systems Online</span>
        </div>

        <div className="icon-group">
          <button className="action-btn" id="header-notifications-btn" title="Notifications">
            <Bell size={18} />
            <span className="badge-dot" />
          </button>
          <button className="action-btn" id="header-messages-btn" title="Messages">
            <Mail size={18} />
          </button>
          <button className="action-btn" id="header-settings-btn" title="Settings">
            <Settings size={18} />
          </button>
        </div>

        <div className="header-profile">
          <img
            src="https://i.pravatar.cc/150?u=nitroxxin-superadmin"
            alt="Super Admin"
            className="header-avatar"
          />
          <div className="header-profile-info">
            <h4>Super Admin</h4>
            <p>Nitroxxin HQ</p>
          </div>
          <ChevronDown size={14} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
};

export default Header;
