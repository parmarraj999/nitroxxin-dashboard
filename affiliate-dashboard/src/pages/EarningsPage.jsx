import { useMemo, useState } from 'react';
import { COMMISSION_HISTORY, formatINR } from '../data/affiliateData';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { RippleButton } from '../components/ui/RippleButton';
import { MonthlyEarningsChart } from '../components/charts/MonthlyEarningsChart';
import { NoEarningsIllustration } from '../components/ui/EmptyStates';
import { WalletIcon } from '../components/ui/Icons';

function statusBadgeClass(status) {
  if (status === 'Approved' || status === 'Completed') return 'status-pill status-approved';
  if (status === 'Pending') return 'status-pill status-pending';
  return 'status-pill status-paid';
}

export function EarningsPage({
  summary,
  withdrawals,
  onOpenWithdraw,
  onNavigate,
}) {
  const [historyFilter, setHistoryFilter] = useState('All');
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  const cards = [
    {
      label: 'Available Balance',
      value: summary.availableBalance,
      note: 'Ready for payout',
      highlight: true,
    },
    { label: 'Pending', value: summary.pending, note: 'Under return window' },
    { label: 'Paid', value: summary.paid, note: 'Settled to bank/UPI' },
    { label: 'Lifetime', value: summary.lifetime, note: 'Total earned since Jan 2027' },
  ];

  const filteredHistory = useMemo(() => {
    if (simulateEmpty) return [];
    if (historyFilter === 'All') return COMMISSION_HISTORY;
    return COMMISSION_HISTORY.filter((row) => row.status === historyFilter);
  }, [historyFilter, simulateEmpty]);

  return (
    <div className="page-enter">
      {/* Header + Withdraw Bar */}
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            Earnings &amp; Payouts
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Minimum Withdrawal {formatINR(summary.minWithdrawal)} • Automated weekly &amp; instant UPI
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Min {formatINR(summary.minWithdrawal)}
          </span>
          <RippleButton className="btn btn-primary" onClick={onOpenWithdraw}>
            <WalletIcon size={16} />
            <span>Withdraw</span>
          </RippleButton>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <section className="kpi-scroll-row" aria-label="Earnings Overview">
        {cards.map((card) => (
          <article
            key={card.label}
            className="card card-hover kpi-card"
            style={
              card.highlight
                ? {
                    borderColor: '#18181b',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  }
                : undefined
            }
          >
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value tabular-nums">
              <AnimatedCounter value={card.value} format="currency" />
            </div>
            <div className="kpi-trend-row">
              <span className="kpi-trend-muted">{card.note}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Monthly Earnings Chart */}
      <div style={{ marginBottom: 18 }}>
        <MonthlyEarningsChart />
      </div>

      {/* Commission History + Recent Withdrawals */}
      <div className="dashboard-grid">
        {/* Commission History */}
        <section>
          <div className="section-header-row" style={{ flexWrap: 'wrap' }}>
            <div>
              <h2 className="section-title">Commission History</h2>
              <span className="section-subtitle">Per-order commission ledger</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="filter-pills">
                {['All', 'Approved', 'Pending', 'Paid'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill-btn ${historyFilter === st && !simulateEmpty ? 'active' : ''}`}
                    onClick={() => {
                      setSimulateEmpty(false);
                      setHistoryFilter(st);
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSimulateEmpty((prev) => !prev)}
                style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}
              >
                {simulateEmpty ? 'Show Data' : 'Empty State'}
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <NoEarningsIllustration
              actionLabel={simulateEmpty ? 'Restore Earnings Ledger' : 'Generate Tracked Link'}
              onAction={() => {
                if (simulateEmpty) setSimulateEmpty(false);
                else onNavigate('links');
              }}
            />
          ) : (
            <>
              <div className="card data-table-card desktop-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order</th>
                      <th>Commission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((row) => (
                      <tr key={row.id}>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{row.date}</td>
                        <td style={{ fontWeight: 600 }}>{row.order}</td>
                        <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                          +{formatINR(row.commission)}
                        </td>
                        <td>
                          <span className={statusBadgeClass(row.status)}>
                            <span className="status-dot" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-card-list">
                {filteredHistory.map((row) => (
                  <div
                    key={row.id}
                    className="card"
                    style={{
                      padding: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.order}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{row.date}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>
                        +{formatINR(row.commission)}
                      </span>
                      <span className={statusBadgeClass(row.status)} style={{ fontSize: 11 }}>
                        <span className="status-dot" />
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Recent Withdrawals */}
        <section>
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Recent Withdrawals</h2>
              <span className="section-subtitle">Bank &amp; UPI payouts</span>
            </div>
          </div>

          <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {withdrawals.map((wd) => (
              <div
                key={wd.id}
                style={{
                  padding: '12px 13px',
                  borderRadius: 12,
                  border: '1px solid var(--border-hairline)',
                  background: '#fcfcfd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700 }}>
                    {formatINR(wd.amount)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {wd.date} • {wd.method}
                  </div>
                </div>
                <span className={statusBadgeClass(wd.status)}>
                  <span className="status-dot" />
                  {wd.status}
                </span>
              </div>
            ))}

            <div
              style={{
                marginTop: 4,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Minimum Withdrawal</span>
              <strong className="tabular-nums">{formatINR(summary.minWithdrawal)}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
