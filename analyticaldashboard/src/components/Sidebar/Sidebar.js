import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Ticket, 
  CreditCard, 
  FileText, 
  Plus, 
  Settings 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarDays, label: 'Event management', path: '/events' },
    { icon: Users, label: 'Event Host Detail', path: '/hosts' },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: FileText, label: 'Reports', path: '/reports' },
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
        <button className="quick-create-btn">
          <Plus size={18} />
          Quick Create
        </button>

        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Sterling" className="avatar" />
          <div className="user-info">
            <h4>Alex Sterling</h4>
            <p>Admin Commander</p>
          </div>
          <button className="settings-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
