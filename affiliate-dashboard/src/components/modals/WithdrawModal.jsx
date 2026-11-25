import { useState } from 'react';
import { formatINR } from '../../data/affiliateData';
import { CloseIcon } from '../ui/Icons';
import { RippleButton } from '../ui/RippleButton';

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  minWithdrawal,
  paymentDetails,
  onSubmitWithdraw,
}) {
  const [amount, setAmount] = useState(String(Math.min(availableBalance, 5000)));
  const [method, setMethod] = useState(`UPI • ${paymentDetails.upi}`);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric < minWithdrawal) {
      setError(`Minimum withdrawal amount is ${formatINR(minWithdrawal)}.`);
      return;
    }
    if (numeric > availableBalance) {
      setError(`Amount cannot exceed available balance (${formatINR(availableBalance)}).`);
      return;
    }
    setError('');
    onSubmitWithdraw({ amount: Math.round(numeric), method });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Withdraw Earnings">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Withdraw Earnings</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
              Minimum withdrawal: {formatINR(minWithdrawal)} • Instant UPI or NEFT
            </p>
          </div>
          <button className="icon-action-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              Available Balance
            </span>
            <span className="tabular-nums" style={{ fontSize: 20, fontWeight: 700 }}>
              {formatINR(availableBalance)}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="withdraw-amount" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Withdrawal Amount (₹)
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(availableBalance))}
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)' }}
              >
                Max ({formatINR(availableBalance)})
              </button>
            </div>
            <input
              id="withdraw-amount"
              type="number"
              min={minWithdrawal}
              max={availableBalance}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              className="search-field-input"
              style={{ paddingLeft: 12, fontSize: 15, fontWeight: 600 }}
            />
            {error && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--accent-red)', fontWeight: 500 }}>
                {error}
              </p>
            )}
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              Payout Destination
            </span>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { label: `UPI • ${paymentDetails.upi}`, sub: 'Arrives in ~10 mins' },
                { label: `Bank • ${paymentDetails.bankAccount}`, sub: paymentDetails.bankName },
              ].map((opt) => {
                const selected = method === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setMethod(opt.label)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: 12,
                      border: `1.5px solid ${selected ? '#18181b' : 'var(--border-hairline)'}`,
                      background: selected ? '#fafafa' : '#ffffff',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{opt.sub}</div>
                    </div>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `5px solid ${selected ? '#18181b' : '#d0d5dd'}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8, marginTop: 4 }}>
            <RippleButton className="btn btn-secondary" onClick={onClose}>
              Cancel
            </RippleButton>
            <RippleButton type="submit" className="btn btn-primary" disabled={availableBalance < minWithdrawal}>
              Confirm Withdrawal
            </RippleButton>
          </div>
        </form>
      </div>
    </div>
  );
}
