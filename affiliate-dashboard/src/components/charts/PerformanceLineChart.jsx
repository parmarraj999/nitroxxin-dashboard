import { useMemo, useState } from 'react';
import { PERFORMANCE_SERIES, formatINR } from '../../data/affiliateData';

const RANGES = ['7 Days', '30 Days', '90 Days', '1 Year'];

export function PerformanceLineChart() {
  const [range, setRange] = useState('30 Days');
  const [hoverIdx, setHoverIdx] = useState(null);

  const series = useMemo(() => PERFORMANCE_SERIES[range] || PERFORMANCE_SERIES['30 Days'], [range]);

  const stats = useMemo(() => {
    const totalCommission = series.reduce((sum, pt) => sum + pt.commission, 0);
    const totalOrders = series.reduce((sum, pt) => sum + pt.orders, 0);
    const maxVal = Math.max(...series.map((pt) => pt.commission));
    return { totalCommission, totalOrders, maxVal };
  }, [series]);

  const width = 680;
  const height = 240;
  const pad = { top: 18, right: 16, bottom: 38, left: 56 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const yMax = Math.ceil((stats.maxVal * 1.15) / 500) * 500 || 2500;
  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

  const points = series.map((pt, i) => {
    const x = pad.left + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
    const y = pad.top + plotH - (pt.commission / yMax) * plotH;
    return { ...pt, x, y, i };
  });

  // Smooth cubic bezier path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const last = points[points.length - 1];
    const first = points[0];
    const baseY = pad.top + plotH;
    return `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  }, [linePath, points, pad.top, plotH]);

  const activePoint = hoverIdx !== null && points[hoverIdx] ? points[hoverIdx] : points[points.length - 1];

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="section-title">Performance</h2>
            <span className="status-pill status-approved" style={{ fontSize: 11, padding: '3px 8px' }}>
              <span className="status-dot" />
              +18.4%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {formatINR(stats.totalCommission)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              commission across {stats.totalOrders} orders ({range})
            </span>
          </div>
        </div>

        <div className="filter-pills" role="tablist" aria-label="Performance chart range">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={range === item}
              className={`filter-pill-btn ${range === item ? 'active' : ''}`}
              onClick={() => {
                setRange(item);
                setHoverIdx(null);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tooltip Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 10,
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-hairline)',
          marginBottom: 10,
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#18181b',
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activePoint?.label}</span>
          <span style={{ color: 'var(--text-muted)' }}>• {activePoint?.clicks} clicks</span>
          <span style={{ color: 'var(--text-muted)' }}>• {activePoint?.orders} orders</span>
        </div>
        <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
          {formatINR(activePoint?.commission)}
        </span>
      </div>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg
          key={range}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }}
          role="img"
          aria-label={`${range} Commission Performance Line Chart`}
        >
          <defs>
            <linearGradient id="nitroxxChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines + Y-axis Commission ticks */}
          {yTicks.map((tick) => {
            const y = pad.top + plotH - (tick / yMax) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="#EAECF0"
                  strokeDasharray="3 3"
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#6B7280"
                  fontSize="10.5"
                  fontFamily="Inter, sans-serif"
                >
                  ₹{tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Y Axis Caption */}
          <text
            x={13}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            transform={`rotate(-90 13 ${pad.top + plotH / 2})`}
          >
            Commission
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#nitroxxChartFill)" className="chart-area-animate" />

          {/* Animated Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#18181b"
            strokeWidth="2.6"
            strokeLinecap="round"
            className="chart-path-animate"
          />

          {/* Active Crosshair */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={pad.top}
              x2={activePoint.x}
              y2={pad.top + plotH}
              stroke="#D0D5DD"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          )}

          {/* X Axis ticks */}
          {points.map((pt, idx) => {
            const showTick =
              points.length <= 8 || idx === 0 || idx === points.length - 1 || idx % 3 === 0;
            return (
              <g key={pt.label}>
                {showTick && (
                  <text
                    x={pt.x}
                    y={pad.top + plotH + 17}
                    textAnchor="middle"
                    fill="#6B7280"
                    fontSize="10.5"
                    fontFamily="Inter, sans-serif"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* X Axis Caption */}
          <text
            x={pad.left + plotW / 2}
            y={height - 4}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Days ({range})
          </text>

          {/* Interactive Data Points & Hit Areas */}
          {points.map((pt) => {
            const isSelected = activePoint && activePoint.i === pt.i;
            return (
              <g
                key={`pt-${pt.i}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIdx(pt.i)}
                onClick={() => setHoverIdx(pt.i)}
              >
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? '#16a34a' : '#ffffff'}
                  stroke={isSelected ? '#ffffff' : '#18181b'}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
