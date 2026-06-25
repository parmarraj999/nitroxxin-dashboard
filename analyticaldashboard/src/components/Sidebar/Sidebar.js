import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  BarChart3,
  UserCircle,
  Globe2,
  Plus, 
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { profile, logout } = useAuth();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarDays, label: 'My Events', path: '/events' },
    { icon: Plus, label: 'Add Event', path: '/events/new' },
    { icon: Users, label: 'Participants', path: '/participants' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: Globe2, label: 'Public Events', path: '/explore' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
            </svg>
          </div>
          <div className="logo-text">
            <h2>Nitroxx</h2>
            <p>EVENT MANAGEMENT</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => {
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

      <div className="sidebar-footer">
        <NavLink to="/events/new" className="quick-create-btn">
          <Plus size={18} />
          Quick Create
        </NavLink>

        <div className="user-profile">
          <img src={profile?.photoURL || 'https://i.pravatar.cc/150?u=nitroxx'} alt={profile?.fullName || 'User'} className="avatar" />
          <div className="user-info">
            <h4>{profile?.fullName || 'Nitroxx User'}</h4>
            <p>{profile?.role || 'Participant'}</p>
          </div>
          <button className="settings-btn" title="Logout" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
