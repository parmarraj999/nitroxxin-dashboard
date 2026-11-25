import { useState } from 'react';
import { MONTHLY_EARNINGS, formatINR } from '../../data/affiliateData';

export function MonthlyEarningsChart() {
  const [selectedIdx, setSelectedIdx] = useState(MONTHLY_EARNINGS.length - 1);
  const maxAmount = Math.max(...MONTHLY_EARNINGS.map((m) => m.amount));
  const selected = MONTHLY_EARNINGS[selectedIdx];

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <h2 className="section-title">Monthly Earnings</h2>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            2026 monthly affiliate payout trajectory
          </p>
        </div>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 10,
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{selected.month} 2026:</span>
          <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatINR(selected.amount)}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${MONTHLY_EARNINGS.length}, minmax(0, 1fr))`,
          alignItems: 'end',
          gap: 8,
          height: 170,
          paddingTop: 18,
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        {MONTHLY_EARNINGS.map((item, idx) => {
          const pct = Math.max(16, Math.round((item.amount / maxAmount) * 100));
          const isActive = idx === selectedIdx;
          return (
            <button
              key={item.month}
              type="button"
              onMouseEnter={() => setSelectedIdx(idx)}
              onClick={() => setSelectedIdx(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                gap: 6,
                paddingBottom: 8,
              }}
              aria-label={`${item.month}: ${formatINR(item.amount)}`}
            >
              <div
                className="bar-grow-animate"
                style={{
                  width: '100%',
                  maxWidth: 30,
                  height: `${pct}%`,
                  borderRadius: '7px 7px 3px 3px',
                  background: isActive ? '#18181b' : '#e4e7ec',
                  transition: 'background-color 0.16s ease, transform 0.16s ease',
                  animationDelay: `${idx * 35}ms`,
                }}
              />
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${MONTHLY_EARNINGS.length}, minmax(0, 1fr))`,
          gap: 8,
          paddingTop: 8,
          textAlign: 'center',
        }}
      >
        {MONTHLY_EARNINGS.map((item, idx) => (
          <span
            key={item.month}
            style={{
              fontSize: 11,
              fontWeight: idx === selectedIdx ? 700 : 500,
              color: idx === selectedIdx ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}
