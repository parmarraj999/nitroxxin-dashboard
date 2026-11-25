import { COUPONS_DATA } from '../data/affiliateData';
import { RippleButton } from '../components/ui/RippleButton';
import { CheckIcon, CopyIcon, ShareIcon, TagIcon } from '../components/ui/Icons';

export function CouponsPage({ copiedId, onCopy }) {
  const handleShareCoupon = async (coupon) => {
    const text = `Use my Nitroxxin creator code ${coupon.code} for ${coupon.discount} on ${coupon.scope}! Valid until ${coupon.expiry}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Nitroxxin ${coupon.discount} Code`, text });
        return;
      } catch {
        // Fallback to copy
      }
    }
    onCopy(text, `share-${coupon.id}`, `Coupon share message for ${coupon.code} copied!`);
  };

  return (
    <div className="page-enter">
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            Creator Coupons
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Exclusive discount codes attributed automatically to CR10294
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 14,
        }}
      >
        {COUPONS_DATA.map((coupon) => {
          const pctUsed = Math.round((coupon.uses / coupon.totalLimit) * 100);
          const isCopied = copiedId === coupon.id;
          return (
            <article key={coupon.id} className="card card-hover" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--accent-obsidian)',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TagIcon size={18} />
                  </span>
                  <div>
                    <div className="mono" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '0.02em' }}>
                      {coupon.code}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{coupon.title}</div>
                  </div>
                </div>

                <span className="status-pill status-approved" style={{ fontSize: 12 }}>
                  <span className="status-dot" />
                  {coupon.discount}
                </span>
              </div>

              <p style={{ margin: '12px 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>{coupon.scope}</p>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Uses</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700 }}>
                    {coupon.uses}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Remaining</div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700 }}>
                    {coupon.remaining}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expiry</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 2 }}>{coupon.expiry}</div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>Redemption progress</span>
                  <span className="tabular-nums">{pctUsed}% used</span>
                </div>
                <div className="progress-track" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pctUsed}%` }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <RippleButton
                  className="btn btn-primary"
                  onClick={() => onCopy(coupon.code, coupon.id, `Coupon code ${coupon.code} copied!`)}
                >
                  {isCopied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                  <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                </RippleButton>
                <RippleButton className="btn btn-secondary" onClick={() => handleShareCoupon(coupon)}>
                  <ShareIcon size={15} />
                  <span>Share</span>
                </RippleButton>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
