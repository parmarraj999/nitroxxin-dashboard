import { CloseIcon } from '../ui/Icons';
import {
  GenerateFirstLinkIllustration,
  NoEarningsIllustration,
  NoNotificationsIllustration,
  NoOrdersIllustration,
} from '../ui/EmptyStates';

export function EmptyStatesShowcaseModal({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Empty States Preview">
      <div className="modal-panel" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Empty State Illustrations</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
              All four zero-data states used across Orders, Earnings, Notifications, and Links
            </p>
          </div>
          <button className="icon-action-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          <NoOrdersIllustration
            onAction={() => {
              onClose();
              onNavigate('orders');
            }}
          />
          <NoEarningsIllustration
            onAction={() => {
              onClose();
              onNavigate('links');
            }}
          />
          <NoNotificationsIllustration actionLabel="Close" onAction={onClose} />
          <GenerateFirstLinkIllustration
            onAction={() => {
              onClose();
              onNavigate('links');
            }}
          />
        </div>
      </div>
    </div>
  );
}
