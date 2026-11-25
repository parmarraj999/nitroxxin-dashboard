import { useState } from 'react';
import {
  CheckCircleIcon,
  CloseIcon,
  FlameIcon,
  LandmarkIcon,
  TrophyIcon,
  WalletIcon,
} from '../ui/Icons';
import { RippleButton } from '../ui/RippleButton';
import { NoNotificationsIllustration } from '../ui/EmptyStates';

const TYPE_STYLES = {
  'Commission Approved': { bg: '#ecfdf5', color: '#15803d', Icon: WalletIcon },
  'New Sale': { bg: '#eff6ff', color: '#1d4ed8', Icon: CheckCircleIcon },
  'Campaign Invite': { bg: '#fef3c7', color: '#b45309', Icon: FlameIcon },
  'Bonus Added': { bg: '#f3e8ff', color: '#7e22ce', Icon: TrophyIcon },
  'Withdrawal Approved': { bg: '#f4f4f5', color: '#18181b', Icon: LandmarkIcon },
};

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkOneRead,
  onClearAll,
  onRestoreDemo,
}) {
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;
  const visible =
    filter === 'Unread' ? notifications.filter((n) => n.unread) : notifications;

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notifications">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--accent-red-soft)',
                  color: 'var(--accent-red)',
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <button className="icon-action-btn" onClick={onClose} aria-label="Close notifications">
            <CloseIcon size={16} />
          </button>
        </div>

        <div
          style={{
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            background: 'var(--bg-canvas)',
          }}
        >
          <div className="filter-pills">
            {['All', 'Unread'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`filter-pill-btn ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                style={{ fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{ fontWeight: 500, color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.length === 0 ? (
            <NoNotificationsIllustration
              actionLabel={notifications.length === 0 ? 'Restore Sample Alerts' : 'Show All Alerts'}
              onAction={notifications.length === 0 ? onRestoreDemo : () => setFilter('All')}
            />
          ) : (
            visible.map((item) => {
              const tone = TYPE_STYLES[item.type] || TYPE_STYLES['New Sale'];
              const NotifIcon = tone.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onMarkOneRead(item.id)}
                  className="card"
                  style={{
                    padding: 13,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 11,
                    background: item.unread ? '#fbfcff' : '#ffffff',
                    borderColor: item.unread ? '#d0d5dd' : 'var(--border-hairline)',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: tone.bg,
                      color: tone.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <NotifIcon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: tone.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {item.type}
                      </span>
                      {item.unread && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: 'var(--accent-red)',
                            flexShrink: 0,
                          }}
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {item.title}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-faint)' }}>{item.time}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--border-hairline)' }}>
          <RippleButton className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
            Done
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
