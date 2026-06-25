import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Settings, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import './Header.css';

const Header = ({ 
  searchPlaceholder = "Search analytics, riders, or events...",
  showProfile = true,
  showQuickCreate = false
}) => {
  const { user, profile } = useAuth();
  const { notifications } = useNotifications(user?.uid);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <header className="header">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder={searchPlaceholder} 
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="action-btn notification-btn">
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-dot"></span>}
        </button>
        <Link className="action-btn" to="/profile">
          <Settings size={20} />
        </Link>

        {showProfile && (
          <div className="header-profile">
            <div className="header-profile-info">
              <h4>{profile?.fullName || 'Nitroxx User'}</h4>
              <p>{profile?.role || 'Participant'}</p>
            </div>
            <img src={profile?.photoURL || 'https://i.pravatar.cc/150?u=nitroxx-header'} alt={profile?.fullName || 'User'} className="header-avatar" />
          </div>
        )}

        {showQuickCreate && (
          <Link to="/events/new" className="header-quick-create-btn">
            <Plus size={16} />
            Create
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
