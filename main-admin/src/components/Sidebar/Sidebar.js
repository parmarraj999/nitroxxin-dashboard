import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
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
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Tag,
  Building,
  Image as ImageIcon,
  CheckCircle,
  X,
  MessageSquare,
  UserCheck,
  Ticket
} from 'lucide-react';
import './Sidebar.css';

// Layout Pages & Sections Definition for Subnavbar
const LAYOUT_PAGES = [
  {
    id: 'foryou',
    title: 'For You Page',
    shortTitle: 'For You',
    path: '/foryou-layout-media',
    icon: Sparkles,
    badge: '4 Sec',
    sections: [
      { id: 'banners', label: '1. Hero Banners', icon: ImageIcon },
      { id: 'categories', label: '2. Category Shortcuts', icon: Tag },
      { id: 'events', label: '3. Featured Events', icon: Calendar },
      { id: 'brands', label: '4. Shop By Brand', icon: Building },
    ]
  },
  {
    id: 'events',
    title: 'Events Layout',
    shortTitle: 'Events',
    path: '/events-layout-media',
    altPaths: ['/events/layout'],
    icon: Calendar,
    badge: '4 Sec',
    sections: [
      { id: 'hero', label: '1. Sliding Hero', icon: SlidersHorizontal },
      { id: 'categories', label: '2. Categories', icon: Tag },
      { id: 'featured', label: '3. Featured Events', icon: Star },
      { id: 'organizers', label: '4. Organizer Logos', icon: ShieldCheck },
    ]
  },
  {
    id: 'accessories',
    title: 'Accessories Layout',
    shortTitle: 'Accessories',
    path: '/accessories-layout-media',
    altPaths: ['/accessories/layout'],
    icon: Package,
    badge: '5 Sec',
    sections: [
      { id: 'hero', label: '1. Sliding Hero', icon: SlidersHorizontal },
      { id: 'categories', label: '2. Categories', icon: Tag },
      { id: 'featured', label: '3. Featured Products', icon: Star },
      { id: 'combos', label: '4. Combo Offers', icon: Sparkles },
      { id: 'brands', label: '5. Top Brands', icon: Building },
    ]
  }
];

// Clean Sidebar Groups (Small main headings and flat clean page lists with icons)
const SIDEBAR_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Users', icon: Users, path: '/users' }
    ]
  },
  {
    title: 'STORE MANAGEMENT',
    items: [
      { label: 'All Products', icon: Package, path: '/products' },
      { label: 'Add Product', icon: Plus, path: '/products/add' },
      { label: 'Categories', icon: Tags, path: '/categories' },
      { label: 'Combo Offers', icon: Sparkles, path: '/combos' },
      { label: 'Accessory Brands', icon: ShieldCheck, path: '/brands' },
      { label: 'Bike Brands', icon: Bike, path: '/bike-brands' },
      { label: 'Inventory', icon: ClipboardList, path: '/inventory' },
      { label: 'Orders', icon: ShoppingCart, path: '/orders' },
      { label: 'Returns', icon: RotateCcw, path: '/returns' },
      { label: 'Coupons', icon: Megaphone, path: '/products/coupons' },
      { label: 'Reviews', icon: Star, path: '/products/reviews' },
      { label: 'Analytics', icon: BarChart2, path: '/products/analytics' }
    ]
  },
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { label: 'All Events', icon: ClipboardList, path: '/events' },
      { label: 'Create Event', icon: Plus, path: '/events/create' },
      { label: 'Organizer Logos', icon: ShieldCheck, path: '/organizer-logos' },
      { label: 'Categories', icon: Tags, path: '/events/categories' },
      { label: 'Ticket Templates', icon: Ticket, path: '/events/ticket-templates' },
      { label: 'Bookings', icon: ShoppingCart, path: '/events/bookings' },
      { label: 'Participants', icon: Users, path: '/events/participants' },
      { label: 'Coupons', icon: Megaphone, path: '/events/coupons' },
      { label: 'Reviews', icon: Star, path: '/events/reviews' },
      { label: 'Analytics', icon: BarChart2, path: '/events/analytics' }
    ]
  },
  {
    title: 'VENDOR & HOST MANAGEMENT',
    items: [
      { label: 'Vendor List', icon: Store, path: '/vendors' },
      { label: 'Pending Approval', icon: Shield, path: '/vendors/pending' },
      { label: 'Host List', icon: Users, path: '/hosts' },
      { label: 'Pending Host Approval', icon: UserCheck, path: '/hosts/pending' }
    ]
  },
  {
    title: 'WEB & APP LAYOUTS',
    items: [
      { label: 'For You Page', icon: Sparkles, path: '/foryou-layout-media' },
      { label: 'Events Page', icon: Calendar, path: '/events-layout-media' },
      { label: 'Accessories Page', icon: Package, path: '/accessories-layout-media' },
      { label: 'Combo Packages', icon: Sparkles, path: '/combos' },
      { label: 'Organizer Logos', icon: ShieldCheck, path: '/organizer-logos' }
    ]
  },
  {
    title: 'FINANCE & SYSTEM',
    items: [
      { label: 'Finance', icon: CircleDollarSign, path: '/finance' },
      { label: 'Reports', icon: FileBarChart, path: '/reports' },
      { label: 'Queries', icon: MessageSquare, path: '/queries' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Support', icon: Headphones, path: '/support' },
      { label: 'Roles', icon: UserCog, path: '/roles' },
      { label: 'Settings', icon: Settings, path: '/settings' }
    ]
  }
];

// Primary compact rail navigation items
const COMPACT_RAIL_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Event Management', path: '/events' },
  { icon: Package, label: 'Store & Products', path: '/products' },
  { icon: Store, label: 'Vendor Management', path: '/vendors' },
  {
    icon: Layers,
    label: 'Web & App Layouts',
    path: '/foryou-layout-media',
    isLayoutTrigger: true
  },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Warehouse, label: 'Inventory', path: '/inventory' },
  { icon: CircleDollarSign, label: 'Finance & Reports', path: '/finance' },
  { icon: MessageSquare, label: 'Queries', path: '/queries' },
  { icon: Users, label: 'User Management', path: '/users' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Sidebar primary expand/compact state (saved in localStorage)
  const [isCompact, setIsCompact] = useState(() => {
    return localStorage.getItem('nitroxxin_sidebar_compact') === 'true';
  });

  // Layout Subnavbar mode: 'compact' | 'expanded' | 'hidden'
  const [subnavMode, setSubnavMode] = useState(() => {
    return localStorage.getItem('nitroxxin_subnav_mode') || 'compact';
  });

  // Active section tab for the currently active layout page
  const [activeSectionTab, setActiveSectionTab] = useState('');

  // Persist sidebar compact state
  useEffect(() => {
    localStorage.setItem('nitroxxin_sidebar_compact', isCompact);
  }, [isCompact]);

  // Persist subnav mode
  useEffect(() => {
    localStorage.setItem('nitroxxin_subnav_mode', subnavMode);
  }, [subnavMode]);

  // Check if current route is a layout media page
  const isLayoutRoute =
    pathname.includes('layout') ||
    pathname.includes('foryou') ||
    pathname.includes('for_you') ||
    pathname.includes('accessories-layout-media') ||
    pathname.includes('events-layout-media');

  // Determine active layout page definition
  const activeLayoutConfig = LAYOUT_PAGES.find((lp) => {
    if (pathname === lp.path) return true;
    if (lp.altPaths && lp.altPaths.includes(pathname)) return true;
    if (lp.id === 'accessories' && pathname.includes('accessories-layout')) return true;
    if (lp.id === 'events' && pathname.includes('events-layout')) return true;
    if (lp.id === 'foryou' && pathname.includes('foryou-layout')) return true;
    return false;
  }) || (isLayoutRoute ? LAYOUT_PAGES[0] : null);

  // Synchronize active section tab with layout pages
  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) {
        setActiveSectionTab(e.detail);
      }
    };
    window.addEventListener('layout-tab-changed', handleTabChange);
    return () => window.removeEventListener('layout-tab-changed', handleTabChange);
  }, []);

  const handleSelectSectionTab = (sectionId) => {
    setActiveSectionTab(sectionId);
    window.dispatchEvent(new CustomEvent('set-layout-tab', { detail: sectionId }));
  };

  const toggleSidebarCompact = () => {
    setIsCompact((prev) => !prev);
  };

  const toggleSubnavMode = () => {
    setSubnavMode((prev) => (prev === 'compact' ? 'expanded' : 'compact'));
  };

  return (
    <div className="sidebar-system-container">
      {/* ========================================================
          Column 1: Primary Sidebar (Compact Rail or Expanded)
          ======================================================== */}
      <aside className={`admin-sidebar ${isCompact ? 'compact' : 'expanded'}`}>
        {/* Header / Brand */}
        <div className="sidebar-header">
          {isCompact ? (
            <div className="compact-logo-btn" onClick={toggleSidebarCompact} title="Nitroxxin Admin Panel">
              <div className="logo-icon-dark">
                <Layers size={22} color="#0f172a" />
              </div>
            </div>
          ) : (
            <div className="logo-container">
              <div className="logo-icon-dark">
                <Layers size={22} color="#0f172a" />
              </div>
              <div className="logo-text">
                <h2>Nitroxxin</h2>
                <p>MAIN ADMIN</p>
              </div>
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={toggleSidebarCompact}
                title="Collapse sidebar to icon rail"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="sidebar-nav-container">
          {isCompact ? (
            /* Compact Icon Rail */
            <nav className="compact-rail-nav">
              {COMPACT_RAIL_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.isLayoutTrigger
                  ? isLayoutRoute
                  : pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <div key={item.path} className="rail-item-wrapper">
                    <button
                      type="button"
                      className={`rail-icon-btn ${active ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                      title={item.label}
                    >
                      <Icon size={19} className="rail-icon" />
                    </button>
                    <span className="rail-tooltip">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          ) : (
            /* Clean Expanded Navigation: Small Headings + Flat Page List with Icons */
            <nav className="sidebar-clean-nav">
              {SIDEBAR_GROUPS.map((group) => (
                <div key={group.title} className="sidebar-clean-group">
                  <div className="sidebar-clean-heading">{group.title}</div>
                  <ul className="sidebar-clean-list">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            end={
                              item.path === '/products' ||
                              item.path === '/events' ||
                              item.path === '/vendors'
                            }
                            className={({ isActive }) =>
                              `sidebar-clean-item ${isActive ? 'active' : ''}`
                            }
                          >
                            <Icon size={18} className="sidebar-clean-icon" />
                            <span className="sidebar-clean-label">{item.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {isCompact ? (
            <div className="rail-item-wrapper">
              <button
                type="button"
                className="rail-icon-btn toggle-rail-btn"
                onClick={toggleSidebarCompact}
                title="Expand Sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
              <span className="rail-tooltip">Expand Sidebar</span>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-collapse-footer-btn"
              onClick={toggleSidebarCompact}
            >
              <PanelLeftClose size={16} />
              <span>Compact Sidebar</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================
          Column 2: Expandable Subnavbar for Layout Pages
          (Active whenever on layout media pages or toggled)
          ======================================================== */}
      {isLayoutRoute && subnavMode !== 'hidden' && (
        <aside className={`layout-subnavbar ${subnavMode}`}>
          {/* Subnavbar Top Header */}
          <div className="subnav-header">
            {subnavMode === 'compact' ? (
              <div
                className="subnav-top-toggle"
                onClick={toggleSubnavMode}
                title="Expand Layout Controls"
              >
                <PanelLeft size={18} />
              </div>
            ) : (
              <div className="subnav-expanded-header">
                <div>
                  <h3 className="subnav-title">Layout Controls</h3>
                  <p className="subnav-subtitle">Web & App Feed</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="subnav-toggle-btn"
                    onClick={toggleSubnavMode}
                    title="Compact subnavbar"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                  <button
                    type="button"
                    className="subnav-toggle-btn"
                    onClick={() => setSubnavMode('hidden')}
                    title="Close subnavbar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subnav Content */}
          <div className="subnav-body">
            {/* Group 1: 3 Layout Pages */}
            <div className="subnav-clean-group">
              {subnavMode === 'expanded' && (
                <div className="subnav-clean-heading">LAYOUT PAGES</div>
              )}
              <div className="subnav-clean-list">
                {LAYOUT_PAGES.map((page) => {
                  const Icon = page.icon;
                  const isCurrentPage =
                    pathname === page.path ||
                    (page.altPaths && page.altPaths.includes(pathname)) ||
                    (page.id === 'accessories' && pathname.includes('accessories-layout')) ||
                    (page.id === 'events' && pathname.includes('events-layout')) ||
                    (page.id === 'foryou' && pathname.includes('foryou-layout'));

                  if (subnavMode === 'compact') {
                    return (
                      <div key={page.id} className="rail-item-wrapper">
                        <button
                          type="button"
                          className={`subnav-rail-btn ${isCurrentPage ? 'active' : ''}`}
                          onClick={() => navigate(page.path)}
                          title={`${page.title} (${page.badge})`}
                        >
                          <Icon size={18} />
                        </button>
                        <span className="rail-tooltip">{page.title}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={page.id}
                      type="button"
                      className={`subnav-clean-item ${isCurrentPage ? 'active' : ''}`}
                      onClick={() => navigate(page.path)}
                    >
                      <Icon size={18} className="subnav-clean-icon" />
                      <span className="subnav-clean-label">{page.shortTitle}</span>
                      <span className="subnav-badge">{page.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider line between layout pages and page sections */}
            <div className="subnav-divider" />

            {/* Group 2: Sections of the Active Layout Page */}
            {activeLayoutConfig && (
              <div className="subnav-clean-group">
                {subnavMode === 'expanded' && (
                  <div className="subnav-clean-heading">
                    {activeLayoutConfig.shortTitle.toUpperCase()} SECTIONS
                  </div>
                )}
                <div className="subnav-clean-list">
                  {activeLayoutConfig.sections.map((section) => {
                    const SecIcon = section.icon;
                    const isTabActive = activeSectionTab === section.id;

                    if (subnavMode === 'compact') {
                      return (
                        <div key={section.id} className="rail-item-wrapper">
                          <button
                            type="button"
                            className={`subnav-rail-btn ${isTabActive ? 'active' : ''}`}
                            onClick={() => handleSelectSectionTab(section.id)}
                            title={section.label}
                          >
                            <SecIcon size={18} />
                          </button>
                          <span className="rail-tooltip">{section.label}</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={section.id}
                        type="button"
                        className={`subnav-clean-item ${isTabActive ? 'active' : ''}`}
                        onClick={() => handleSelectSectionTab(section.id)}
                      >
                        <SecIcon size={18} className="subnav-clean-icon" />
                        <span className="subnav-clean-label">{section.label}</span>
                        {isTabActive && <CheckCircle size={14} className="subnav-active-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Subnav Footer */}
          <div className="subnav-footer">
            {subnavMode === 'compact' ? (
              <div className="rail-item-wrapper">
                <button
                  type="button"
                  className="subnav-rail-btn"
                  onClick={toggleSubnavMode}
                  title="Expand Layout Controls"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="rail-tooltip">Expand Controls</span>
              </div>
            ) : (
              <button
                type="button"
                className="subnav-compact-footer-btn"
                onClick={toggleSubnavMode}
              >
                <PanelLeftClose size={15} />
                <span>Compact Controls</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Floating Restore Button if Subnavbar was closed on a layout page */}
      {isLayoutRoute && subnavMode === 'hidden' && (
        <button
          type="button"
          className="subnav-floating-open-btn"
          onClick={() => setSubnavMode('compact')}
          title="Open Layout Subnavbar"
        >
          <PanelLeft size={16} />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
