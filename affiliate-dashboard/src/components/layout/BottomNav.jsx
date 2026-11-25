import {
  LayoutDashboardIcon,
  LinkIcon,
  ShoppingBagIcon,
  UserIcon,
  WalletIcon,
} from '../ui/Icons';

const BOTTOM_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
  { id: 'earnings', label: 'Earnings', icon: WalletIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

export function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      {BOTTOM_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          activeTab === tab.id || (activeTab === 'levels' && tab.id === 'profile');
        return (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon-pill">
              <Icon size={17} strokeWidth={isActive ? 2.1 : 1.8} />
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
