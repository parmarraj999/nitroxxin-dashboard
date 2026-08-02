import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  Package, ShoppingCart, Users, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, DollarSign, ArrowUpRight,
  ArrowDownRight, Activity, Zap, Globe, Shield, BarChart2,
  Store, Tags, Star, Bell, RefreshCw, ExternalLink, ChevronRight
} from 'lucide-react';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import './AdminDashboard.css';

/* ── helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString();
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const timeAgo = (date) => {
  if (!date) return '—';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── mock sparkline data ── */
const revenueSparkline = [
  { name: 'Jan', value: 420000 }, { name: 'Feb', value: 380000 },
  { name: 'Mar', value: 510000 }, { name: 'Apr', value: 490000 },
  { name: 'May', value: 620000 }, { name: 'Jun', value: 580000 },
  { name: 'Jul', value: 710000 }, { name: 'Aug', value: 690000 },
  { name: 'Sep', value: 750000 }, { name: 'Oct', value: 820000 },
  { name: 'Nov', value: 910000 }, { name: 'Dec', value: 980000 },
];

const ordersSparkline = [
  { name: 'Mon', value: 142 }, { name: 'Tue', value: 198 },
  { name: 'Wed', value: 167 }, { name: 'Thu', value: 223 },
  { name: 'Fri', value: 289 }, { name: 'Sat', value: 312 },
  { name: 'Sun', value: 201 },
];

const categoryData = [
  { name: 'Helmets', value: 34, color: '#ff6b00' },
  { name: 'Riding Gear', value: 28, color: '#3b82f6' },
  { name: 'Accessories', value: 22, color: '#10b981' },
  { name: 'Electronics', value: 16, color: '#f59e0b' },
];

const trafficBar = [
  { name: 'M', v: 310, h: false }, { name: 'T', v: 420, h: false },
  { name: 'W', v: 390, h: false }, { name: 'T', v: 510, h: true },
  { name: 'F', v: 680, h: false }, { name: 'S', v: 720, h: false },
  { name: 'S', v: 490, h: false },
];

/* ── tiny KPI card ── */
const KpiCard = ({ icon: Icon, label, value, sub, trend, color, link }) => {
  const navigate = useNavigate();
  const up = trend > 0;
  return (
    <div className="kpi-card" onClick={() => link && navigate(link)} style={{ cursor: link ? 'pointer' : 'default' }}>
      <div className="kpi-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
        <span className="kpi-sub">
          {trend !== undefined && (
            <span className={`kpi-trend ${up ? 'up' : 'down'}`}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          {sub}
        </span>
      </div>
      {link && <ChevronRight className="kpi-arrow" size={16} />}
    </div>
  );
};

/* ── system health indicator ── */
const HealthDot = ({ label, ok }) => (
  <div className="health-item">
    <span className={`health-dot ${ok ? 'green' : 'red'}`} />
    <span>{label}</span>
    <span className={`health-status ${ok ? 'ok' : 'error'}`}>{ok ? 'Operational' : 'Error'}</span>
  </div>
);

/* ══════════════════════════════ MAIN COMPONENT ══════════════════════════════ */
const AdminDashboard = () => {
  const { analytics } = useDashboardAnalytics();
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const totalOrders = analytics?.totalOrders ?? 1482;
  const pendingOrders = analytics?.pendingOrders ?? 42;
  const deliveredOrders = analytics?.deliveredOrders ?? 1204;
  const returnRequests = analytics?.returnRequests ?? 8;
  const totalProducts = analytics?.products?.length ?? 342;
  const chartData = analytics?.revenueChartData?.length ? analytics.revenueChartData : revenueSparkline;
  const recentOrders = analytics?.orders?.slice(0, 6) || [];
  const lowStock = analytics?.lowStock?.slice(0, 4) || [];
  const reviews = analytics?.reviews?.slice(0, 3) || [];
  const topProducts = analytics?.topProducts?.slice(0, 5) || [];

  return (
    <div className="admin-dashboard">

      {/* ── HERO BANNER ── */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <div className="dash-hero-badge">
            <Activity size={12} /> LIVE SYSTEM
          </div>
          <h1 className="dash-title">{greeting}, Super Admin.</h1>
          <p className="dash-subtitle">
            Nitroxxin platform is running at{' '}
            <span className="highlight-orange">98% efficiency</span>. All systems nominal.
          </p>
        </div>
        <div className="dash-hero-right">
          <div className="dash-time">
            <span className="dash-time-val">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="dash-time-date">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="dash-hero-actions">
            <Link to="/reports" className="btn-hero-secondary">
              <BarChart2 size={15} /> Reports
            </Link>
            <Link to="/products/add" className="btn-hero-primary">
              <Zap size={15} /> Quick Add
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="kpi-grid">
        <KpiCard icon={ShoppingCart} label="Total Orders" value={fmt(totalOrders)} sub="all time" trend={12.5} color="#ff6b00" link="/orders" />
        <KpiCard icon={Clock} label="Pending Orders" value={fmt(pendingOrders)} sub="avg 2.4h fulfillment" trend={-3.1} color="#f59e0b" link="/orders" />
        <KpiCard icon={CheckCircle} label="Delivered" value={fmt(deliveredOrders)} sub="99.2% success rate" trend={8.4} color="#10b981" link="/orders" />
        <KpiCard icon={Package} label="Products" value={fmt(totalProducts)} sub="active in catalog" trend={5.2} color="#3b82f6" link="/products" />
        <KpiCard icon={AlertTriangle} label="Return Requests" value={fmt(returnRequests)} sub="needs attention" trend={-2} color="#ef4444" link="/returns" />
        <KpiCard icon={Users} label="Customers" value="12.4k" sub="registered users" trend={18.3} color="#8b5cf6" link="/customers" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="charts-row">

        {/* Revenue / Orders toggle chart */}
        <div className="chart-card wide card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Platform Performance</h2>
              <p className="chart-subtitle">Monthly revenue & order volume across the Nitroxxin ecosystem.</p>
            </div>
            <div className="chart-tabs">
              <button className={`chart-tab ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>Revenue</button>
              <button className={`chart-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
            </div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTab === 'revenue' ? chartData : ordersSparkline} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} dy={8} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }}
                  formatter={(v) => [activeTab === 'revenue' ? fmtINR(v) : fmt(v), activeTab === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area type="monotone" dataKey="value" stroke="#ff6b00" strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category donut */}
        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Category Mix</h2>
              <p className="chart-subtitle">Revenue share by product category.</p>
            </div>
          </div>
          <div className="donut-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }}
                  formatter={(v) => [`${v}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store traffic bar */}
        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Store Traffic</h2>
              <p className="chart-subtitle">Daily visitor sessions this week.</p>
            </div>
          </div>
          <div className="traffic-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficBar} barSize={20} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f9fafb' }}
                  formatter={(v) => [fmt(v), 'Visitors']}
                />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {trafficBar.map((e, i) => <Cell key={i} fill={e.h ? '#ff6b00' : '#374151'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="traffic-summary">
              <span className="traffic-big">12.4k</span>
              <span className="traffic-label">Unique Visitors</span>
              <span className="traffic-growth">+22% growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW: Top Products + Recent Orders ── */}
      <div className="middle-row">

        {/* Top products table */}
        <div className="table-card card">
          <div className="table-card-header">
            <h2 className="chart-title">Top Performing Products</h2>
            <Link to="/products" className="view-all-link">View All <ExternalLink size={12} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? topProducts.map((p, i) => (
                <tr key={i}>
                  <td className="rank-num">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <div className="product-cell">
                      <div className="product-thumb" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{fmt(p.sales)}</td>
                  <td className="rev-cell">{fmtINR(p.revenue || 0)}</td>
                  <td><span className="growth-badge up"><ArrowUpRight size={11} />+0%</span></td>
                </tr>
              )) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="rank-num">{String(i + 1).padStart(2, '0')}</td>
                    <td><div className="product-cell"><div className="product-thumb" /><span className="skeleton-text" /></div></td>
                    <td><span className="skeleton-text short" /></td>
                    <td><span className="skeleton-text short" /></td>
                    <td><span className="growth-badge up"><ArrowUpRight size={11} />+0%</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent orders */}
        <div className="orders-card card">
          <div className="table-card-header">
            <h2 className="chart-title">Recent Orders</h2>
            <Link to="/orders" className="view-all-link">View All <ExternalLink size={12} /></Link>
          </div>
          <div className="orders-list">
            {recentOrders.length > 0 ? recentOrders.map((o, i) => {
              const st = String(o.status || 'pending').toLowerCase();
              return (
                <div className="order-row" key={i}>
                  <div className={`order-status-icon ${st}`}>
                    {st === 'delivered' ? <CheckCircle size={14} /> : st === 'shipped' ? <Globe size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="order-info">
                    <span className="order-id">#{String(o.id).slice(0, 8).toUpperCase()}</span>
                    <span className="order-meta">{o.itemCount || 1} item(s) · {timeAgo(o.createdAt)}</span>
                  </div>
                  <span className={`status-pill ${st}`}>{st.toUpperCase()}</span>
                </div>
              );
            }) : (
              <div className="empty-orders">
                <ShoppingCart size={32} style={{ color: '#9ca3af', marginBottom: 8 }} />
                <p>No recent orders yet.</p>
              </div>
            )}
          </div>
          <Link to="/orders" className="manage-btn">Manage All Orders</Link>
        </div>
      </div>

      {/* ── BOTTOM ROW: Low Stock + Reviews + Quick Actions + System Health ── */}
      <div className="bottom-row">

        {/* Low stock alerts */}
        <div className="bottom-card card alerts-card">
          <div className="bottom-card-header">
            <h2 className="bottom-card-title red">Low Stock Alerts</h2>
            <span className="priority-tag">PRIORITY</span>
          </div>
          {lowStock.length > 0 ? lowStock.map((item, i) => (
            <div className="alert-row" key={i}>
              <div className="alert-info">
                <span className="alert-name">{item.productName || item.productId}</span>
                <span className="alert-meta">Only {item.availableStock} units left</span>
              </div>
              <button className="restock-btn">Restock</button>
            </div>
          )) : (
            <div className="all-clear">
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <span>All products are fully stocked!</span>
            </div>
          )}
        </div>

        {/* Latest Reviews */}
        <div className="bottom-card card">
          <div className="bottom-card-header">
            <h2 className="bottom-card-title">Latest Reviews</h2>
            <div className="avg-rating">
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              {reviews.length > 0
                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
          {reviews.length > 0 ? reviews.map((r, i) => (
            <div className="review-row" key={i}>
              <div className="review-stars">
                {[1,2,3,4,5].map((s) => <Star key={s} size={10} fill={s <= r.rating ? '#f59e0b' : 'transparent'} color={s <= r.rating ? '#f59e0b' : '#d1d5db'} />)}
              </div>
              <span className="reviewer">{r.reviewerName}</span>
              <p className="review-comment">"{r.comment}"</p>
            </div>
          )) : <p className="no-data">No customer reviews found.</p>}
        </div>

        {/* Quick actions */}
        <div className="bottom-card card">
          <div className="bottom-card-header">
            <h2 className="bottom-card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to="/products/add" className="qa-btn"><Package size={18} /><span>Add Product</span></Link>
            <Link to="/reports" className="qa-btn"><BarChart2 size={18} /><span>Reports</span></Link>
            <Link to="/inventory" className="qa-btn"><RefreshCw size={18} /><span>Inventory</span></Link>
            <Link to="/promotions" className="qa-btn"><Zap size={18} /><span>Promotions</span></Link>
            <Link to="/vendors" className="qa-btn"><Store size={18} /><span>Vendors</span></Link>
            <Link to="/categories" className="qa-btn"><Tags size={18} /><span>Categories</span></Link>
            <Link to="/customers" className="qa-btn"><Users size={18} /><span>Customers</span></Link>
            <Link to="/notifications" className="qa-btn"><Bell size={18} /><span>Alerts</span></Link>
          </div>
        </div>

        {/* System Health */}
        <div className="bottom-card card">
          <div className="bottom-card-header">
            <h2 className="bottom-card-title">System Health</h2>
            <span className="live-tag"><Activity size={10} /> LIVE</span>
          </div>
          <div className="health-list">
            <HealthDot label="Firestore DB" ok={true} />
            <HealthDot label="Auth Service" ok={true} />
            <HealthDot label="Storage CDN" ok={true} />
            <HealthDot label="Order Pipeline" ok={true} />
            <HealthDot label="Payment Gateway" ok={true} />
            <HealthDot label="Email Service" ok={true} />
          </div>
          <div className="uptime-row">
            <Shield size={12} style={{ color: '#10b981' }} />
            <span>99.97% uptime this month</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
