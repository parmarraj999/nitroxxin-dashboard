export function DashboardSkeleton() {
  return (
    <div className="page-enter" aria-busy="true" aria-label="Loading dashboard">
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="skeleton-box" style={{ width: 110, height: 14, marginBottom: 8 }} />
            <div className="skeleton-box" style={{ width: 180, height: 28 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton-box" style={{ width: 116, height: 32, borderRadius: 999 }} />
            <div className="skeleton-box" style={{ width: 132, height: 32, borderRadius: 10 }} />
          </div>
        </div>
      </div>

      <div className="kpi-scroll-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card kpi-card">
            <div className="skeleton-box" style={{ width: '58%', height: 12 }} />
            <div className="skeleton-box" style={{ width: '74%', height: 28 }} />
            <div className="skeleton-box" style={{ width: '64%', height: 12 }} />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="skeleton-box" style={{ width: 170, height: 20 }} />
            <div className="skeleton-box" style={{ width: 200, height: 30 }} />
          </div>
          <div className="skeleton-box" style={{ width: '100%', height: 210, borderRadius: 12 }} />
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="skeleton-box" style={{ width: 140, height: 20, marginBottom: 14 }} />
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: row < 4 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '62%' }}>
                <div className="skeleton-box" style={{ width: '70%', height: 13 }} />
                <div className="skeleton-box" style={{ width: '48%', height: 11 }} />
              </div>
              <div className="skeleton-box" style={{ width: 64, height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
