import React, { useState } from 'react';
import { X, Printer, Check, Copy, ShieldCheck, CreditCard } from 'lucide-react';

const TransactionDetailDrawer = ({ transaction, onClose }) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(transaction.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine card badge icon / styling
  const renderCardLogo = () => {
    if (transaction.cardBrand === 'mastercard') {
      return (
        <span className="mastercard-mini-logo" title="Mastercard">
          <span className="mc-circle red" />
          <span className="mc-circle orange" />
        </span>
      );
    }
    if (transaction.cardBrand === 'visa') {
      return (
        <span className="visa-mini-text" title="Visa">
          VISA
        </span>
      );
    }
    return <CreditCard size={14} color="#64748b" />;
  };

  return (
    <div className="tx-drawer-overlay" onClick={onClose}>
      <div 
        className="tx-drawer-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Transaction Details"
      >
        {/* Header */}
        <div className="tx-drawer-header">
          <h2 className="tx-drawer-title">Transaction Details</h2>
          <button 
            type="button" 
            className="tx-drawer-close-btn" 
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dual-color accent progress indicator line matching Image 1 */}
        <div className="tx-drawer-accent-track">
          <div className="tx-drawer-accent-fill" />
          <div className="tx-drawer-accent-empty" />
        </div>

        {/* Scrollable Body */}
        <div className="tx-drawer-body">
          {/* Amount Section */}
          <div className="tx-drawer-amount-section">
            <span className="tx-amount-label">Amount</span>
            <div className="tx-amount-value">{transaction.amount}</div>
          </div>

          {/* Primary Key-Value Details */}
          <div className="tx-details-list">
            <div className="tx-detail-row">
              <span className="tx-detail-key">Customer ID</span>
              <span className="tx-detail-val">{transaction.customerId || '548065'}</span>
            </div>

            <div className="tx-detail-row">
              <span className="tx-detail-key">Invoice</span>
              <span className="tx-detail-val">{transaction.invoice || '91362'}</span>
            </div>

            <div className="tx-detail-row">
              <span className="tx-detail-key">Transaction type</span>
              <span className="tx-detail-val">{transaction.transactionType || 'Sale'}</span>
            </div>

            <div className="tx-detail-row">
              <span className="tx-detail-key">Status</span>
              <span className={`tx-detail-val status-text ${transaction.status.toLowerCase()}`}>
                {transaction.status === 'Success' ? 'Approved' : transaction.status}
              </span>
            </div>

            <div className="tx-detail-row">
              <span className="tx-detail-key">Account data</span>
              <span className="tx-detail-val account-data-val">
                {renderCardLogo()}
                <span>{transaction.accountData || '•••• 5943'}</span>
              </span>
            </div>

            <div className="tx-detail-row">
              <span className="tx-detail-key">Date</span>
              <span className="tx-detail-val">{transaction.dateTimeFull || `${transaction.date} ${transaction.time}`}</span>
            </div>

            {/* Toggle More Details */}
            <div className="tx-more-details-row">
              <button 
                type="button" 
                className="tx-more-details-link"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
              >
                <span>{showMoreDetails ? 'Less details' : 'More details'}</span>
              </button>
            </div>

            {/* Expanded Details */}
            {showMoreDetails && (
              <div className="tx-expanded-specs">
                <div className="tx-detail-row sub">
                  <span className="tx-detail-key">Event / Booking</span>
                  <span className="tx-detail-val highlight">{transaction.bookingEvent}</span>
                </div>
                <div className="tx-detail-row sub">
                  <span className="tx-detail-key">Attendee Email</span>
                  <span className="tx-detail-val">{transaction.email}</span>
                </div>
                <div className="tx-detail-row sub">
                  <span className="tx-detail-key">Gateway Fee</span>
                  <span className="tx-detail-val">{transaction.fee || '$0.00'}</span>
                </div>
                <div className="tx-detail-row sub">
                  <span className="tx-detail-key">Net Payout</span>
                  <span className="tx-detail-val">{transaction.net || transaction.amount}</span>
                </div>
                <div className="tx-detail-row sub">
                  <span className="tx-detail-key">Security Check</span>
                  <span className="tx-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                    <ShieldCheck size={13} /> 3D Secure Verified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Billing Information Card */}
          <div className="tx-info-card">
            <h3 className="tx-info-card-title">Billing Information</h3>
            <div className="tx-info-card-rows">
              <div className="tx-card-row">
                <span className="tx-card-key">Street Address</span>
                <span className="tx-card-val">{transaction.billing?.streetAddress || '3199 Wayback Lane'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">City</span>
                <span className="tx-card-val">{transaction.billing?.city || 'Huntington Station'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">State</span>
                <span className="tx-card-val">{transaction.billing?.state || 'New York'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">Zipcode</span>
                <span className="tx-card-val">{transaction.billing?.zipcode || '11746'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">Mobile Number</span>
                <span className="tx-card-val">{transaction.billing?.mobileNumber || '631-433-4375'}</span>
              </div>
            </div>
          </div>

          {/* Shipping / Attendee Details Card */}
          <div className="tx-info-card">
            <h3 className="tx-info-card-title">Shipping Information</h3>
            <div className="tx-info-card-rows">
              <div className="tx-card-row">
                <span className="tx-card-key">Street Address</span>
                <span className="tx-card-val">{transaction.shipping?.streetAddress || '1801 Gordon Street'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">City</span>
                <span className="tx-card-val">{transaction.shipping?.city || 'Mira Loma'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">State</span>
                <span className="tx-card-val">{transaction.shipping?.state || 'California'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">Zipcode</span>
                <span className="tx-card-val">{transaction.shipping?.zipcode || '91752'}</span>
              </div>
              <div className="tx-card-row">
                <span className="tx-card-key">Mobile Number</span>
                <span className="tx-card-val">{transaction.shipping?.mobileNumber || '951-703-9831'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="tx-drawer-footer-actions">
            <button 
              type="button" 
              className="tx-drawer-btn secondary"
              onClick={handleCopyId}
            >
              {copiedId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
            </button>

            <button 
              type="button" 
              className="tx-drawer-btn primary"
              onClick={handlePrint}
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailDrawer;
