import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  Calendar,
  AlertTriangle,
  Clock,
  X,
  CheckCircle2,
  Info,
  ShieldAlert,
  LoaderCircle,
  RotateCcw
} from 'lucide-react';
import './AccountModals.css';

const HOST_REASONS = [
  'Policy & Community Guidelines Violation',
  'Event Safety or Verification Non-compliance',
  'Identity / Business Documentation Expired',
  'Disputed Event Fees or Participant Claims',
  'Host Requested Temporary Break',
  'Administrative Review & Audit'
];

const VENDOR_REASONS = [
  'Marketplace Policy & Terms Violation',
  'Product Quality or Counterfeit Investigation',
  'Delayed Dispatch & Order Cancellation SLA Breach',
  'GST / Tax Audit Documentation Pending',
  'Seller Requested Temporary Vacation',
  'Pricing or Inventory Irregularities'
];

const PRESETS = [
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 }
];

export default function AccountSuspensionModal({
  isOpen,
  onClose,
  accountType = 'host', // 'host' | 'vendor'
  account,
  onConfirmSuspend,
  onConfirmReactivate
}) {
  const isHost = accountType === 'host';
  const reasonPresets = isHost ? HOST_REASONS : VENDOR_REASONS;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form State
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [reasonCategory, setReasonCategory] = useState(reasonPresets[0]);
  const [customReason, setCustomReason] = useState('');
  const [activePreset, setActivePreset] = useState(7);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  // Derive if account is currently suspended
  const isCurrentlySuspended = useMemo(() => {
    if (!account) return false;
    const status = (account.status || account.verificationStatus || '').toLowerCase();
    return status === 'suspended' || Boolean(account.suspensionEndDate);
  }, [account]);

  // Initialize or reset form when account opens
  useEffect(() => {
    if (!isOpen || !account) return;

    setError('');
    const existingStart = account.suspensionStartDate || todayStr;
    setStartDate(existingStart);

    if (account.suspensionEndDate) {
      setEndDate(account.suspensionEndDate);
      setActivePreset(null);
    } else {
      // Default to 7 days from start
      const end = new Date(new Date(existingStart).getTime() + 7 * 86400000)
        .toISOString()
        .split('T')[0];
      setEndDate(end);
      setActivePreset(7);
    }

    if (account.suspensionReason) {
      if (reasonPresets.includes(account.suspensionReason)) {
        setReasonCategory(account.suspensionReason);
        setCustomReason('');
      } else {
        setReasonCategory('Other / Custom Reason');
        setCustomReason(account.suspensionReason);
      }
    } else {
      setReasonCategory(reasonPresets[0]);
      setCustomReason('');
    }
  }, [isOpen, account, todayStr, reasonPresets]);

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

  // Calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const durationDays = calculateDays();

  // Apply quick preset
  const handlePresetClick = (days) => {
    setActivePreset(days);
    const baseDate = startDate ? new Date(startDate) : new Date();
    const newEnd = new Date(baseDate.getTime() + days * 86400000)
      .toISOString()
      .split('T')[0];
    setEndDate(newEnd);
    setError('');
  };

  // When start date changes
  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (activePreset) {
      const newEnd = new Date(new Date(val).getTime() + activePreset * 86400000)
        .toISOString()
        .split('T')[0];
      setEndDate(newEnd);
    } else if (endDate && endDate < val) {
      setEndDate(val);
    }
    setError('');
  };

  // Handle End Date manual change
  const handleEndDateChange = (val) => {
    setEndDate(val);
    setActivePreset(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startDate) {
      setError('Please select a suspension start date.');
      return;
    }
    if (!endDate) {
      setError('Please select a suspension end date.');
      return;
    }
    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    const finalReason =
      reasonCategory === 'Other / Custom Reason'
        ? customReason.trim() || 'Administrative suspension'
        : customReason.trim()
        ? `${reasonCategory}: ${customReason.trim()}`
        : reasonCategory;

    setIsSubmitting(true);
    try {
      await onConfirmSuspend({
        startDate,
        endDate,
        reason: finalReason,
        durationDays
      });
      onClose();
    } catch (err) {
      console.error('Error suspending account:', err);
      setError(err.message || 'Failed to apply suspension. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (!onConfirmReactivate) return;
    setIsReactivating(true);
    try {
      await onConfirmReactivate();
      onClose();
    } catch (err) {
      console.error('Error lifting suspension:', err);
      setError(err.message || 'Failed to reactivate account.');
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="account-modal-header">
          <div className="account-modal-header-left">
            <div className="account-modal-icon-badge suspend">
              <CalendarClock size={22} />
            </div>
            <div>
              <h2>{isCurrentlySuspended ? 'Manage Account Suspension' : `Suspend ${isHost ? 'Host' : 'Vendor'} Account`}</h2>
              <p>Configure a custom range of dates to pause account privileges.</p>
            </div>
          </div>
          <button className="account-modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="account-modal-body">
            {/* Target Account Summary */}
            <div className="account-summary-banner">
              {accountPhoto ? (
                <img src={accountPhoto} alt={accountName} className="account-summary-avatar" />
              ) : (
                <div className="account-summary-avatar">
                  {accountName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="account-summary-details">
                <div className="account-summary-name">
                  <span>{accountName}</span>
                  <span
                    className={`management-badge ${
                      isCurrentlySuspended ? 'suspended' : 'active'
                    }`}
                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                  >
                    {isCurrentlySuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <div className="account-summary-sub">
                  <span>{accountEmail}</span>
                  {accountPhone && <span>• {accountPhone}</span>}
                  <span>• ID: <code>{account.id.slice(0, 8)}</code></span>
                </div>
              </div>
            </div>

            {/* If currently suspended, show active suspension callout */}
            {isCurrentlySuspended && (
              <div className="account-active-suspension-alert">
                <div className="account-active-suspension-title">
                  <ShieldAlert size={16} />
                  <span>Currently Suspended</span>
                </div>
                <div className="account-active-suspension-desc">
                  This account is active on suspension from <strong>{account.suspensionStartDate || 'N/A'}</strong> until{' '}
                  <strong>{account.suspensionEndDate || 'N/A'}</strong>.
                  {account.suspensionReason && (
                    <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                      Reason: "{account.suspensionReason}"
                    </div>
                  )}
                </div>
                {onConfirmReactivate && (
                  <div className="account-lift-quick-action">
                    <button
                      type="button"
                      className="account-btn-reactivate"
                      onClick={handleReactivate}
                      disabled={isReactivating || isSubmitting}
                    >
                      {isReactivating ? (
                        <>
                          <LoaderCircle size={14} className="button-loader" /> Reactivating...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} /> Lift Suspension & Reactivate
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error banner if any */}
            {error && (
              <div className="account-notice-box danger">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Suspension Date Range */}
            <div className="account-form-section">
              <label className="account-section-label">
                <Calendar size={14} /> Suspension Date Range
              </label>

              <div className="account-date-inputs-grid">
                <div className="account-date-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                </div>
                <div className="account-date-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayStr}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Preset Duration Buttons */}
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Quick Presets:
                </span>
                <div className="account-preset-chips">
                  {PRESETS.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      className={`account-preset-chip ${activePreset === p.days ? 'active' : ''}`}
                      onClick={() => handlePresetClick(p.days)}
                    >
                      +{p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Preview Card */}
              {startDate && endDate && (
                <div
                  className={`account-duration-preview ${
                    durationDays === 0 ? 'warning' : ''
                  }`}
                  style={{ marginTop: 8 }}
                >
                  <div className="account-duration-info">
                    <Clock size={16} />
                    <span>
                      {durationDays > 0 ? (
                        <>
                          Suspension Period: <strong>{startDate}</strong> to <strong>{endDate}</strong>
                        </>
                      ) : (
                        'End date must be greater than or equal to start date'
                      )}
                    </span>
                  </div>
                  {durationDays > 0 && (
                    <span className="account-duration-badge">
                      {durationDays} {durationDays === 1 ? 'Day' : 'Days'} Total
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Suspension Reason */}
            <div className="account-form-section">
              <label className="account-section-label">
                <Info size={14} /> Reason for Suspension
              </label>

              <select
                className="account-select"
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
              >
                {reasonPresets.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Other / Custom Reason">Other / Custom Reason</option>
              </select>

              <textarea
                className="account-textarea"
                placeholder={
                  reasonCategory === 'Other / Custom Reason'
                    ? 'Enter specific custom reason for suspending this account...'
                    : 'Additional notes or administrative instructions (optional)...'
                }
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>

            {/* Notice / Impact Info */}
            <div className="account-notice-box">
              <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: '#3b82f6' }} />
              <div>
                <strong>Platform Impact:</strong> While suspended, this{' '}
                {isHost ? 'host cannot publish new events or manage attendee check-ins' : "vendor's products will be hidden from storefronts and cannot receive new orders"}
                . Account access will automatically resume when the suspension period expires or when manually lifted.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="account-modal-footer">
            <button
              type="button"
              className="account-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting || isReactivating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="account-btn-confirm-suspend"
              disabled={isSubmitting || isReactivating || durationDays <= 0}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={15} className="button-loader" /> Applying...
                </>
              ) : isCurrentlySuspended ? (
                <>
                  <CheckCircle2 size={15} /> Update Suspension Dates
                </>
              ) : (
                <>
                  <CalendarClock size={15} /> Confirm Suspension
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
