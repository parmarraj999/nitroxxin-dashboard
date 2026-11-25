import { BrandLogo } from '../ui/BrandLogo';
import {
  BellIcon,
  MonitorIcon,
  RefreshIcon,
  SmartphoneIcon,
} from '../ui/Icons';

const TAB_TITLES = {
  dashboard: 'Dashboard',
  links: 'Affiliate Links',
  orders: 'Orders',
  earnings: 'Earnings',
  profile: 'Creator Profile',
  assets: 'Marketing Assets',
  coupons: 'Coupons',
  levels: 'Level System & Badges',
};

export function TopHeader({
  activeTab,
  unreadCount,
  onOpenNotifications,
  onNavigate,
  mobilePreview,
  onToggleMobilePreview,
  onReplaySkeleton,
  creator,
}) {
  return (
    <header className="top-header">
      <div className="top-header-left">
        <div className="mobile-brand-pill" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <BrandLogo size={28} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Nitroxxin
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              {TAB_TITLES[activeTab] || 'Affiliate'}
            </div>
          </div>
        </div>

        <div className="top-header-crumb">
          <span style={{ fontWeight: 500 }}>Nitroxxin Affiliate</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {TAB_TITLES[activeTab] || 'Dashboard'}
          </span>
        </div>
      </div>

      <div className="top-header-actions">
        <button
          type="button"
          className={`preview-toggle-btn ${mobilePreview ? 'active' : ''}`}
          onClick={onToggleMobilePreview}
          title={mobilePreview ? 'Switch to Desktop Layout' : 'Preview Mobile-First Layout'}
        >
          {mobilePreview ? <MonitorIcon size={15} /> : <SmartphoneIcon size={15} />}
          <span>{mobilePreview ? 'Desktop View' : 'Mobile View'}</span>
        </button>

        <button
          type="button"
          className="icon-action-btn"
          onClick={onReplaySkeleton}
          title="Replay Skeleton Loaders"
          aria-label="Replay Skeleton Loaders"
        >
          <RefreshIcon size={16} />
        </button>

        <button
          type="button"
          className="icon-action-btn"
          onClick={onOpenNotifications}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <BellIcon size={17} />
          {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
        </button>

        <button
          type="button"
          className="header-avatar-btn"
          onClick={() => onNavigate('profile')}
          aria-label="Open creator profile"
        >
          <span className="avatar-circle">{creator.avatarInitials}</span>
          <div className="header-avatar-meta">
            <div className="header-avatar-name">{creator.name}</div>
            <div className="header-avatar-id">{creator.creatorId}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
