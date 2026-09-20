import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Bike,
  Shield,
  Image
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { pathname } = useLocation();
  const menuGroups = [
    {
      title: 'EVENT MANAGEMENT',
      items: [
        { icon: ClipboardList, label: 'All Events', path: '/events' },
        { icon: Plus, label: 'Create Event', path: '/events/create' },
        { icon: Users, label: 'Hosts', path: '/events/hosts' },
        { icon: Tags, label: 'Categories', path: '/events/categories' },
        { icon: ShoppingCart, label: 'Bookings', path: '/events/bookings' },
        { icon: Users, label: 'Participants', path: '/events/participants' },
        { icon: Megaphone, label: 'Coupons', path: '/events/coupons' },
        { icon: Star, label: 'Reviews', path: '/events/reviews' },
        { icon: BarChart2, label: 'Analytics', path: '/events/analytics' },
      ]
    },
    {
      title: 'STORE MANAGEMENT',
      items: [
        { icon: Package, label: 'All Products', path: '/products' },
        { icon: Plus, label: 'Add Product', path: '/products/add' },
        { icon: Tags, label: 'Categories', path: '/categories' },
        { icon: ShieldCheck, label: 'Accessory Brands', path: '/brands' },
        { icon: Bike, label: 'Bike Brands', path: '/bike-brands' },
        { icon: ClipboardList, label: 'Inventory', path: '/inventory' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: RotateCcw, label: 'Returns', path: '/returns' },
        { icon: Megaphone, label: 'Coupons', path: '/products/coupons' },
        { icon: Star, label: 'Reviews', path: '/products/reviews' },
        { icon: BarChart2, label: 'Analytics', path: '/products/analytics' }
      ]
    },
    {
      title: 'VENDOR MANAGEMENT',
      items: [
        { icon: Store, label: 'Vendor List', path: '/vendors' },
        { icon: Shield, label: 'Pending Approval', path: '/vendors/pending' },
        { icon: Package, label: 'Vendor Products', path: '/vendors/products' },
        { icon: ClipboardList, label: 'Vendor Events', path: '/vendors/events' },
        { icon: BadgeIndianRupee, label: 'Payouts', path: '/vendors/payouts' }
      ]
    },
      {
      title: 'Web & App Control',
      items:[
        { icon: Image, label: 'For You ( web )', path: '/foryou-layout-media' }
      ]
    },
  ];

  const utilityGroups = [
    {
      title: 'FINANCE',
      items: [
        { icon: CircleDollarSign, label: 'Finance', path: '/finance' },
        { icon: FileBarChart, label: 'Reports', path: '/reports' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Headphones, label: 'Support', path: '/support' },
        { icon: UserCog, label: 'Roles', path: '/roles' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      ]
    }
  ];

  const CollapsibleGroup = ({ group }) => {
    const hasActiveItem = group.items.some(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
    const [open, setOpen] = React.useState(hasActiveItem);

    React.useEffect(() => {
      if (hasActiveItem) setOpen(true);
    }, [hasActiveItem]);

    return (
      <section className="sidebar-menu-group">
        <button type="button" className="section-title group-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
          <span>{group.title}</span>
          <span className={`group-chevron ${open ? 'open' : ''}`}>⌄</span>
        </button>
        {open && (
          <ul>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink to={item.path} end={item.path === '/products' || item.path === '/events' || item.path === '/vendors'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Icon className="nav-icon" size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  };

  return (
    <aside className="admin-sidebar">
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
            <h2>Nitroxxin</h2>
            <p>MAIN ADMIN PANEL</p>
          </div>
        </div>
      </div>

      <div className="sidebar-nav-container">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard className="nav-icon" size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="admin-section">
          <nav className="sidebar-nav">
            {menuGroups.map((group) => <CollapsibleGroup key={group.title} group={group} />)}
            {utilityGroups.map((group) => <CollapsibleGroup key={group.title} group={group} />)}
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/products/add" className="add-product-btn" id="sidebar-add-product-btn">
          <Plus size={16} />
          Add Product
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
