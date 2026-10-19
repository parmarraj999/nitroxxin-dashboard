import React, { useState, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  LoaderCircle,
  Building,
  Users
} from 'lucide-react';
import './AccountModals.css';

export default function AccountDeletionModal({
  isOpen,
  onClose,
  accountType = 'host', // 'host' | 'vendor'
  account,
  onConfirmDelete
}) {
  const isHost = accountType === 'host';
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmedCheck(false);
      setError('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || !account) return null;

  const accountName =
    account.fullName ||
    account.name ||
    account.displayName ||
    account.storeName ||
    account.businessDetails?.storeName ||
    (isHost ? 'Host Organizer' : 'Vendor Store');

  const accountEmail =
    account.email ||
    account.contactEmail ||
    account.hostEmail ||
    account.businessDetails?.supportEmail ||
    '-';

  const accountPhone =
    account.phone ||
    account.phoneNumber ||
    account.contactPhone ||
    account.hostPhone ||
    account.businessDetails?.supportPhone ||
    '';

  const accountPhoto =
    account.photoURL ||
    account.profilePhoto ||
    account.photo ||
    account.imageUrl ||
    account.avatar;

  const handleDelete = async () => {
    if (!confirmedCheck) return;
    setError('');
    setIsDeleting(true);

    try {
      await onConfirmDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        {/* Header */}
        <div className="account-modal-header">
          <div className="account-modal-header-left">
            <div className="account-modal-icon-badge delete">
              <Trash2 size={22} />
            </div>
            <div>
              <h2>Delete {isHost ? 'Host' : 'Vendor'} Account</h2>
              <p>Permanently remove account and credentials from Nitroxx.</p>
            </div>
          </div>
          <button className="account-modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="account-modal-body">
          {/* Danger Warning Alert */}
          <div className="account-notice-box danger">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>Caution: Irreversible Action</strong>
              This action will permanently delete this {isHost ? 'host organizer document from event_host' : 'vendor account document from vendors'}. 
              All platform credentials, dashboard profile records, and administrative metadata will be permanently lost.
            </div>
          </div>

          {/* Account Summary Card */}
          <div className="account-summary-banner">
            {accountPhoto ? (
              <img src={accountPhoto} alt={accountName} className="account-summary-avatar" />
            ) : (
              <div className="account-summary-avatar">
                {isHost ? <Users size={20} /> : <Building size={20} />}
              </div>
            )}
            <div className="account-summary-details">
              <div className="account-summary-name">
                <span>{accountName}</span>
                <span className="management-badge rejected" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  To be deleted
                </span>
              </div>
              <div className="account-summary-sub">
                <span>{accountEmail}</span>
                {accountPhone && <span>• {accountPhone}</span>}
                <span>• ID: <code>{account.id.slice(0, 10)}</code></span>
              </div>
            </div>
          </div>

          {/* Error notice if any */}
          {error && (
            <div className="account-notice-box danger">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label className="account-delete-check-label">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              disabled={isDeleting}
            />
            <span>
              I understand that deleting <strong>{accountName}</strong> is permanent and cannot be recovered.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="account-modal-footer">
          <button
            type="button"
            className="account-btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="account-btn-danger-delete"
            onClick={handleDelete}
            disabled={!confirmedCheck || isDeleting}
          >
            {isDeleting ? (
              <>
                <LoaderCircle size={15} className="button-loader" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} /> Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
