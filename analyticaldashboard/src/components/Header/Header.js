import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search analytics, riders, or events..." 
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="action-btn notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="action-btn">
          <Settings size={20} />
        </button>
        
        <div className="header-profile">
          <div className="header-profile-info">
            <h4>Alex Rossi</h4>
            <p>Fleet Manager</p>
          </div>
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Alex Rossi" className="header-avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
