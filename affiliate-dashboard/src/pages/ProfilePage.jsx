import { useEffect, useState } from 'react';
import { CREATOR_BADGES, LEVEL_TIERS } from '../data/affiliateData';
import { RippleButton } from '../components/ui/RippleButton';
import {
  AwardIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  FlameIcon,
  ImageIcon,
  LayersIcon,
  TagIcon,
  TrophyIcon,
} from '../components/ui/Icons';

export function ProfilePage({
  creator,
  onUpdatePayment,
  copiedId,
  onCopy,
  onNavigate,
  onOpenEmptyPreview,
  focusSection = 'profile',
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [upiInput, setUpiInput] = useState(creator.paymentDetails.upi);
  const [bankInput, setBankInput] = useState(creator.paymentDetails.bankAccount);
  const [progressWidth, setProgressWidth] = useState(0);

  const currentOrders = creator.stats.totalOrders; // 328
  const targetOrders = 500;
  const targetPercent = Math.min(100, Math.round((currentOrders / targetOrders) * 1000) / 10);

  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(targetPercent), 80);
    return () => clearTimeout(t);
  }, [targetPercent]);

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!upiInput.trim() || !bankInput.trim()) return;
    onUpdatePayment({
      upi: upiInput.trim(),
      bankAccount: bankInput.trim(),
    });
    setEditOpen(false);
  };

  return (
    <div className="page-enter">
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            {focusSection === 'levels' ? 'Level System & Badges' : 'Creator Profile'}
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Audience metrics, payout account, tier milestones &amp; creator badges
          </p>
        </div>
      </div>

      {/* Top Profile & Audience Row */}
      <div className="dashboard-grid" style={{ marginBottom: 16 }}>
        {/* Profile Card */}
        <section className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar-circle lg" aria-label={creator.name}>
                {creator.avatarInitials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{creator.name}</h2>
                  <span className="gold-level-badge" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                    <FlameIcon size={13} />
                    <span>{creator.level}</span>
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  Creator Since <strong style={{ color: 'var(--text-primary)' }}>{creator.creatorSince}</strong> •{' '}
                  <span className="mono">{creator.creatorId}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span className="creator-code-chip" style={{ padding: '3px 9px' }}>
                    <span className="creator-code-label">Code</span>
                    <span className="creator-code-value">{creator.referralCode}</span>
                  </span>
                  <RippleButton
                    className="btn btn-soft btn-sm"
                    onClick={() =>
                      onCopy(creator.referralCode, 'prof-code', `Copied referral code ${creator.referralCode}!`)
                    }
                  >
                    {copiedId === 'prof-code' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    <span>{copiedId === 'prof-code' ? 'Copied' : 'Copy'}</span>
                  </RippleButton>
                </div>
              </div>
            </div>
          </div>

          {/* Followers Breakdown */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
              Followers &amp; Reach
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
              }}
            >
              {[
                { label: 'Instagram', value: creator.followers.instagram, tag: '@rajparmar.rides' },
                { label: 'YouTube', value: creator.followers.youtube, tag: 'MotoVlogs IN' },
                { label: 'Facebook', value: creator.followers.facebook, tag: 'Riders Club' },
                { label: 'Total Audience', value: creator.followers.totalAudience, tag: 'Verified Cross-Platform', highlight: true },
              ].map((soc) => (
                <div
                  key={soc.label}
                  style={{
                    padding: '11px 13px',
                    borderRadius: 12,
                    border: `1px solid ${soc.highlight ? '#18181b' : 'var(--border-hairline)'}`,
                    background: soc.highlight ? '#18181b' : 'var(--bg-canvas)',
                    color: soc.highlight ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  <div style={{ fontSize: 11.5, opacity: soc.highlight ? 0.75 : 1, color: soc.highlight ? '#e4e4e7' : 'var(--text-muted)' }}>
                    {soc.label}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                    {soc.value}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.72, marginTop: 1 }}>{soc.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Details + Mobile Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section className="card" style={{ padding: 18 }}>
            <div className="section-header-row" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="section-title">Payment Details</h2>
                <span className="section-subtitle">Used for automated &amp; manual payouts</span>
              </div>
              <RippleButton
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setUpiInput(creator.paymentDetails.upi);
                  setBankInput(creator.paymentDetails.bankAccount);
                  setEditOpen(true);
                }}
              >
                <EditIcon size={13} />
                <span>Edit</span>
              </RippleButton>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div
                style={{
                  padding: '11px 13px',
                  borderRadius: 11,
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>UPI</span>
                <span className="mono" style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {creator.paymentDetails.upi}
                </span>
              </div>

              <div
                style={{
                  padding: '11px 13px',
                  borderRadius: 11,
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>Bank Account</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{creator.paymentDetails.bankName}</div>
                </div>
                <span className="mono" style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {creator.paymentDetails.bankAccount}
                </span>
              </div>
            </div>
          </section>

          {/* Creator Toolkit Shortcuts (especially handy on mobile) */}
          <section className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Creator Tools</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <RippleButton className="btn btn-secondary btn-sm" onClick={() => onNavigate('assets')}>
                <ImageIcon size={14} />
                <span>Assets</span>
              </RippleButton>
              <RippleButton className="btn btn-secondary btn-sm" onClick={() => onNavigate('coupons')}>
                <TagIcon size={14} />
                <span>Coupons</span>
              </RippleButton>
              <RippleButton className="btn btn-secondary btn-sm" onClick={onOpenEmptyPreview}>
                <LayersIcon size={14} />
                <span>States</span>
              </RippleButton>
            </div>
          </section>
        </div>
      </div>

      {/* LEVEL SYSTEM */}
      <section className="card" style={{ padding: 20, marginBottom: 16 }} aria-label="Level System">
        <div className="section-header-row" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h2 className="section-title">Level System</h2>
            <span className="section-subtitle">
              Current Progress: <strong style={{ color: 'var(--text-primary)' }}>{currentOrders} / {targetOrders} Orders</strong> ({targetPercent}% to Platinum)
            </span>
          </div>
          <span className="gold-level-badge">
            <FlameIcon size={14} />
            <span>Gold Tier Active</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
            <span>Current: {currentOrders} / {targetOrders} Orders</span>
            <span style={{ color: 'var(--text-muted)' }}>172 orders to Platinum</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={currentOrders} aria-valuemin={0} aria-valuemax={targetOrders}>
            <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
          </div>
        </div>

        {/* 4 Tiers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
            gap: 10,
          }}
        >
          {LEVEL_TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                padding: 13,
                borderRadius: 12,
                border: `1.5px solid ${tier.current ? '#d97706' : 'var(--border-hairline)'}`,
                background: tier.current ? '#fffbeb' : 'var(--bg-canvas)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{tier.name}</span>
                {tier.current && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                    Current
                  </span>
                )}
              </div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                {tier.range}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{tier.perks}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BADGES */}
      <section className="card" style={{ padding: 20 }} aria-label="Creator Badges">
        <div className="section-header-row" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="section-title">Badges</h2>
            <span className="section-subtitle">4 unlocked • 2 milestone badges in progress</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
          }}
        >
          {CREATOR_BADGES.map((badge) => (
            <div
              key={badge.id}
              className="card-hover"
              style={{
                padding: 14,
                borderRadius: 13,
                border: `1px solid ${badge.unlocked ? 'var(--border-hairline)' : '#f1f5f9'}`,
                background: badge.unlocked ? '#ffffff' : '#fafafa',
                opacity: badge.unlocked ? 1 : 0.78,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: badge.unlocked ? '#18181b' : '#e5e7eb',
                    color: badge.unlocked ? '#ffffff' : '#6b7280',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {badge.title.includes('Orders') ? <TrophyIcon size={17} /> : <AwardIcon size={17} />}
                </span>
                <span className={`status-pill ${badge.unlocked ? 'status-approved' : 'status-pending'}`} style={{ fontSize: 10.5 }}>
                  <span className="status-dot" />
                  {badge.unlocked ? 'Unlocked' : 'In Progress'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{badge.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{badge.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Payment Details Modal */}
      {editOpen && (
        <div className="modal-backdrop" onClick={() => setEditOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Edit Payment Details</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Update your verified UPI ID or Bank Account
                </p>
              </div>
              <button className="icon-action-btn" onClick={() => setEditOpen(false)} aria-label="Close">
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label htmlFor="edit-upi" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                  UPI ID
                </label>
                <input
                  id="edit-upi"
                  type="text"
                  className="search-field-input"
                  style={{ paddingLeft: 12 }}
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="edit-bank" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                  Bank Account (Masked or Last 4)
                </label>
                <input
                  id="edit-bank"
                  type="text"
                  className="search-field-input"
                  style={{ paddingLeft: 12 }}
                  value={bankInput}
                  onChange={(e) => setBankInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8, marginTop: 4 }}>
                <RippleButton className="btn btn-secondary" onClick={() => setEditOpen(false)}>
                  Cancel
                </RippleButton>
                <RippleButton type="submit" className="btn btn-primary">
                  Save Details
                </RippleButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
