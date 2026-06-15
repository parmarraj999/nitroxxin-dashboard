import React from 'react';
import { Search, Bell, Mail, Moon } from 'lucide-react';
import './Header.css';

const Header = () => {
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
        
        <div className="header-profile">
          <div className="header-profile-info">
            <h4>Alex Nitro</h4>
            <p>Vendor Admin</p>
          </div>
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="Alex Nitro" className="header-avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
