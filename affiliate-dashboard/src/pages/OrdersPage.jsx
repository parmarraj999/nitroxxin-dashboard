import { useMemo, useState } from 'react';
import { ORDERS_DATA, formatINR } from '../data/affiliateData';
import { NoOrdersIllustration } from '../components/ui/EmptyStates';
import { RippleButton } from '../components/ui/RippleButton';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MoreDotsIcon,
  SearchIcon,
} from '../components/ui/Icons';

const PERIODS = ['All', 'Today', 'Week', 'Month'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Paid'];

function getStatusClass(status) {
  if (status === 'Approved') return 'status-pill status-approved';
  if (status === 'Pending') return 'status-pill status-pending';
  return 'status-pill status-paid';
}

export function OrdersPage() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('All');
  const [status, setStatus] = useState('All Status');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ORDERS_DATA.filter((order) => {
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.purchased.toLowerCase().includes(q);
      const matchesPeriod =
        period === 'All' ||
        (period === 'Today' && order.period === 'Today') ||
        (period === 'Week' && (order.period === 'Today' || order.period === 'Week')) ||
        period === 'Month';
      const matchesStatus = status === 'All Status' || order.status === status;
      return matchesSearch && matchesPeriod && matchesStatus;
    });
  }, [search, period, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetFilters = () => {
    setSearch('');
    setPeriod('All');
    setStatus('All Status');
    setPage(1);
  };

  return (
    <div className="page-enter">
      {/* Brightly-style Header & Filter Toolbar */}
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            Orders
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Affiliate conversions from Nitroxxin events, tours &amp; marketplace
          </p>
        </div>

        <div className="toolbar-controls">
          <div className="search-field-wrap">
            <SearchIcon size={15} className="search-field-icon" />
            <input
              type="search"
              className="search-field-input"
              placeholder="Search ID, customer or product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            aria-label="Filter by Status"
            className="select-control"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div className="filter-pills" role="tablist" aria-label="Order Timeframe">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`filter-pill-btn ${period === p ? 'active' : ''}`}
              onClick={() => {
                setPeriod(p);
                setPage(1);
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <NoOrdersIllustration onAction={resetFilters} />
      ) : (
        <>
          {/* Desktop Table matching Brightly Screenshot */}
          <div className="card data-table-card desktop-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Purchased</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                        {order.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'var(--bg-subtle)',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-primary)',
                            flexShrink: 0,
                          }}
                        >
                          {order.customer
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{order.customer}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {order.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.purchased}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{order.category}</div>
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 600 }}>
                      {formatINR(order.amount)}
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                      +{formatINR(order.commission)}
                    </td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        <span className="status-dot" />
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{order.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="icon-action-btn"
                        style={{ width: 30, height: 30, display: 'inline-flex' }}
                        aria-label={`View ${order.id} details`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        <MoreDotsIcon size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-pagination">
              <span>
                Show {paginated.length} of {filtered.length} affiliate orders
              </span>
              <div className="page-btns">
                <button
                  type="button"
                  className="page-num-btn"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`page-num-btn ${safePage === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-num-btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-card-list">
            {filtered.map((order) => (
              <article
                key={order.id}
                className="card card-hover"
                style={{ padding: 14, cursor: 'pointer' }}
                onClick={() => setSelectedOrder(order)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {order.id}
                  </span>
                  <span className={getStatusClass(order.status)}>
                    <span className="status-dot" />
                    {order.status}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {order.purchased}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Customer: <strong style={{ color: 'var(--text-secondary)' }}>{order.customer}</strong> • {order.date}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amount</div>
                    <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 600 }}>
                      {formatINR(order.amount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Commission</div>
                    <div className="tabular-nums" style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--accent-green)' }}>
                      +{formatINR(order.commission)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)} role="dialog" aria-modal="true">
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selectedOrder.id}
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 700 }}>
                  {selectedOrder.purchased}
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setSelectedOrder(null)} aria-label="Close">
                <CloseIcon size={16} />
              </button>
            </div>

            <div
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 12,
                padding: 14,
                display: 'grid',
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                ['Customer', selectedOrder.customer],
                ['Category', selectedOrder.category],
                ['Order Amount', formatINR(selectedOrder.amount)],
                ['Your Commission (10%)', formatINR(selectedOrder.commission)],
                ['Attributed Link', selectedOrder.linkUsed],
                ['Date', selectedOrder.date],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={getStatusClass(selectedOrder.status)}>
                  <span className="status-dot" />
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <RippleButton className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedOrder(null)}>
              Close Breakdown
            </RippleButton>
          </div>
        </div>
      )}
    </div>
  );
}
