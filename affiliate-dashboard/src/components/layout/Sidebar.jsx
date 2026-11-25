import { BrandLogo } from '../ui/BrandLogo';
import {
  AwardIcon,
  BellIcon,
  ImageIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LinkIcon,
  SearchIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  WalletIcon,
} from '../ui/Icons';

const PRIMARY_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
  { id: 'earnings', label: 'Earnings', icon: WalletIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

const CREATOR_TOOLS = [
  { id: 'assets', label: 'Marketing Assets', icon: ImageIcon },
  { id: 'coupons', label: 'Coupons', icon: TagIcon },
  { id: 'levels', label: 'Level & Badges', icon: AwardIcon },
];

export function Sidebar({
  activeTab,
  onNavigate,
  unreadCount,
  onOpenNotifications,
  onOpenEmptyPreview,
  sidebarQuery,
  onSidebarQueryChange,
}) {
  const matchesQuery = (label) =>
    !sidebarQuery.trim() || label.toLowerCase().includes(sidebarQuery.trim().toLowerCase());

  return (
    <aside className="desktop-sidebar" aria-label="Creator navigation">
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">
          <BrandLogo size={30} />
          <div>
            <div className="sidebar-brand-title">Nitroxxin</div>
            <div className="sidebar-brand-sub">Creator Studio</div>
          </div>
        </div>
      </div>

      <div className="sidebar-search-wrap">
        <SearchIcon size={15} className="sidebar-search-icon" />
        <input
          type="search"
          className="sidebar-search-input"
          placeholder="Search menu..."
          value={sidebarQuery}
          onChange={(e) => onSidebarQueryChange(e.target.value)}
          aria-label="Search sidebar sections"
        />
      </div>

      <nav className="sidebar-nav-section" aria-label="Main navigation">
        {PRIMARY_ITEMS.filter((item) => matchesQuery(item.label)).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-nav-item-left">
                <Icon size={17} />
                <span>{item.label}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-section-label">Creator Toolkit</div>
      <nav className="sidebar-nav-section" aria-label="Creator toolkit">
        {CREATOR_TOOLS.filter((item) => matchesQuery(item.label)).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-nav-item-left">
                <Icon size={17} />
                <span>{item.label}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-nav-item" onClick={onOpenNotifications}>
          <span className="sidebar-nav-item-left">
            <BellIcon size={17} />
            <span>Notifications</span>
          </span>
          {unreadCount > 0 && <span className="sidebar-nav-badge">{unreadCount}</span>}
        </button>

        <button type="button" className="sidebar-nav-item" onClick={onOpenEmptyPreview}>
          <span className="sidebar-nav-item-left">
            <LayersIcon size={17} />
            <span>Empty States</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
