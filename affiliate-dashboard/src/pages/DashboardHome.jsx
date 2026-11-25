import {
  OVERVIEW_KPIS,
  RECENT_ACTIVITY,
  TOP_CAMPAIGNS,
  formatINR,
} from '../data/affiliateData';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { RippleButton } from '../components/ui/RippleButton';
import { PerformanceLineChart } from '../components/charts/PerformanceLineChart';
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  FlameIcon,
  ImageIcon,
  LinkIcon,
  ShareIcon,
  TagIcon,
  TicketIcon,
  TrophyIcon,
  WalletIcon,
} from '../components/ui/Icons';

const ACTIVITY_STYLES = {
  order: { bg: '#ecfdf5', color: '#15803d', Icon: CheckCircleIcon },
  event: { bg: '#eff6ff', color: '#1d4ed8', Icon: TicketIcon },
  payout: { bg: '#ecfdf5', color: '#15803d', Icon: WalletIcon },
  milestone: { bg: '#fef3c7', color: '#b45309', Icon: TrophyIcon },
};

export function DashboardHome({
  creator,
  copiedId,
  onCopy,
  onNavigate,
  onOpenWithdraw,
  onPromoteCampaign,
}) {
  const isCodeCopied = copiedId === 'hero-code';

  const quickActions = [
    { id: 'qa-link', label: 'Generate Link', icon: LinkIcon, action: () => onNavigate('links') },
    { id: 'qa-coupons', label: 'View Coupons', icon: TagIcon, action: () => onNavigate('coupons') },
    {
      id: 'qa-share',
      label: 'Share Profile',
      icon: ShareIcon,
      action: () =>
        onCopy(
          `https://nitroxxin.com/creator/${creator.creatorId}?code=${creator.referralCode}`,
          'share-profile',
          'Creator profile link copied to share!'
        ),
    },
    { id: 'qa-assets', label: 'Marketing Assets', icon: ImageIcon, action: () => onNavigate('assets') },
    { id: 'qa-withdraw', label: 'Withdraw Earnings', icon: WalletIcon, action: onOpenWithdraw },
  ];

  const handleShareProfileBanner = () => {
    onCopy(
      `https://nitroxxin.com/creator/${creator.creatorId}`,
      'hero-id',
      `Copied Creator ID ${creator.creatorId}!`
    );
  };

  return (
    <div className="page-enter">
      {/* Top Header Card */}
      <section className="card creator-hero-card" aria-label="Creator Summary">
        <div>
          <div className="greeting-eyebrow">{creator.greeting}</div>
          <h1 className="greeting-name">{creator.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>
              Total Clicks <strong style={{ color: 'var(--text-primary)' }}>{creator.stats.totalClicks.toLocaleString('en-IN')}</strong>
            </span>
            <span>•</span>
            <span>
              Orders <strong style={{ color: 'var(--text-primary)' }}>{creator.stats.totalOrders}</strong>
            </span>
            <span>•</span>
            <span>
              Lifetime GMV <strong style={{ color: 'var(--text-primary)' }}>{formatINR(creator.stats.revenueGenerated)}</strong>
            </span>
          </div>
        </div>

        <div className="creator-meta-chips">
          <button
            type="button"
            className="gold-level-badge"
            onClick={() => onNavigate('levels')}
            title="View Creator Level Progress"
          >
            <FlameIcon size={14} />
            <span>{creator.level}</span>
          </button>

          <button
            type="button"
            className="creator-code-chip"
            onClick={handleShareProfileBanner}
            title="Copy Creator ID"
          >
            <span className="creator-code-label">Creator ID</span>
            <span className="creator-code-value">{creator.creatorId}</span>
          </button>

          <div className="creator-code-chip">
            <span className="creator-code-label">Referral Code</span>
            <span className="creator-code-value">{creator.referralCode}</span>
            <RippleButton
              className="small-copy-btn"
              onClick={() =>
                onCopy(creator.referralCode, 'hero-code', `Referral code ${creator.referralCode} copied!`)
              }
              aria-label="Copy referral code"
            >
              {isCodeCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
              <span>{isCodeCopied ? 'Copied' : 'Copy'}</span>
            </RippleButton>
          </div>
        </div>
      </section>

      {/* Overview Cards (Horizontal Scroll on Mobile, 4-col Brightly Grid on Desktop) */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Overview</h2>
          <span className="section-subtitle">
            Top Product: {creator.stats.topProduct} • Top Event: {creator.stats.topEvent}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('earnings')}
          style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
        >
          <span>Full breakdown</span>
          <ArrowUpRightIcon size={14} />
        </button>
      </div>

      <section className="kpi-scroll-row" aria-label="Overview Metrics">
        {OVERVIEW_KPIS.map((kpi) => (
          <article key={kpi.id} className="card card-hover kpi-card">
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value tabular-nums">
              <AnimatedCounter value={kpi.rawValue} format={kpi.format} />
            </div>
            <div className="kpi-trend-row">
              <span className="kpi-trend-up">▲ {kpi.trend}</span>
              <span className="kpi-trend-muted">{kpi.sublabel}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Quick Actions */}
      <div className="section-header-row">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <section className="quick-actions-strip" aria-label="Quick Actions">
        {quickActions.map((qa) => {
          const Icon = qa.icon;
          return (
            <RippleButton key={qa.id} className="quick-action-tile" onClick={qa.action}>
              <span className="quick-action-icon">
                <Icon size={18} />
              </span>
              <span>{qa.label}</span>
            </RippleButton>
          );
        })}
      </section>

      {/* Performance Chart + Recent Activity */}
      <div className="dashboard-grid">
        <PerformanceLineChart />

        {/* Recent Activity */}
        <section className="card" style={{ padding: 18 }}>
          <div className="section-header-row" style={{ marginBottom: 12 }}>
            <h2 className="section-title">Recent Activity</h2>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
            >
              View all
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT_ACTIVITY.map((act) => {
              const style = ACTIVITY_STYLES[act.type] || ACTIVITY_STYLES.order;
              const ActivityIcon = style.Icon;
              return (
                <div
                  key={act.id}
                  className="card card-hover"
                  style={{
                    padding: '12px 13px',
                    borderRadius: 12,
                    background: '#fcfcfd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: style.bg,
                        color: style.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ActivityIcon size={16} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: style.color }}>
                        {act.badge}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{act.meta}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Top Campaigns */}
      <section style={{ marginTop: 20 }} aria-label="Top Campaigns">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Top Campaigns</h2>
            <span className="section-subtitle">
              Promote Nitroxxin events, marketplace gear &amp; touring combos
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('links')}
            style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            All Links →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {TOP_CAMPAIGNS.map((camp) => (
            <article
              key={camp.id}
              className="card card-hover"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {camp.category}
                  </span>
                  <span
                    className="status-pill status-approved"
                    style={{ fontSize: 11.5 }}
                  >
                    <span className="status-dot" />
                    {camp.commissionRate}
                  </span>
                </div>
                <h3 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 700 }}>{camp.title}</h3>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Avg {camp.avgEarn} • {camp.clicks}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ?ref={creator.creatorId}
                </span>
                <RippleButton
                  className="btn btn-primary btn-sm"
                  onClick={() => onPromoteCampaign(camp)}
                >
                  Promote
                </RippleButton>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
