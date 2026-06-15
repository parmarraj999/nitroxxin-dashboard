import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { CreditCard, DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './Payments.css';

const chartData = [
  { name: 'May', Revenue: 42000 },
  { name: 'Jun', Revenue: 58000 },
  { name: 'Jul', Revenue: 51000 },
  { name: 'Aug', Revenue: 72000 },
  { name: 'Sep', Revenue: 64000 },
  { name: 'Oct', Revenue: 89000 }
];

const transactions = [
  { id: '#TX-99824', date: 'Oct 15, 2026', name: 'Marco Rossi', event: 'Apex Helmet Tour', amount: '$629.00', method: 'Visa', status: 'Paid', statusClass: 'status-paid' },
  { id: '#TX-99823', date: 'Oct 14, 2026', name: 'Elena Kraus', event: 'Vantage Launch', amount: '$349.00', method: 'Mastercard', status: 'Paid', statusClass: 'status-paid' },
  { id: '#TX-99820', date: 'Oct 14, 2026', name: 'James Miller', event: 'Torque-S Gloves', amount: '$179.00', method: 'PayPal', status: 'Processing', statusClass: 'status-processing' },
  { id: '#TX-99818', date: 'Oct 13, 2026', name: 'Sarah Jenkins', event: 'Monsoon Expedition', amount: '$250.00', method: 'Apple Pay', status: 'Paid', statusClass: 'status-paid' }
];

const Payments = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">

          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Payments Overview</h1>
              <p className="dashboard-subtitle">Monitor payouts, net revenues, and transaction logs.</p>
            </div>
            <button className="export-btn">Payout Settings</button>
          </div>

          <div className="payments-stats-grid">
            <div className="payment-stat-card card-blue">
              <div className="stat-inner-flex">
                <div>
                  <span className="p-stat-lbl">NET REVENUE</span>
                  <h3 className="p-stat-val">$342,850.00</h3>
                  <span className="p-stat-change text-success-bold">
                    <ArrowUpRight size={14} /> +12.4% this month
                  </span>
                </div>
                <div className="stat-icon-wrapper-blue green">
                  <DollarSign size={20} />
                </div>
              </div>
            </div>

            <div className="payment-stat-card card-blue">
              <div className="stat-inner-flex">
                <div>
                  <span className="p-stat-lbl">PENDING PAYOUTS</span>
                  <h3 className="p-stat-val">$12,450.00</h3>
                  <span className="p-stat-change text-muted">
                    Next payout Oct 20, 2026
                  </span>
                </div>
                <div className="stat-icon-wrapper-blue blue">
                  <CreditCard size={20} />
                </div>
              </div>
            </div>

            <div className="payment-stat-card card-blue">
              <div className="stat-inner-flex">
                <div>
                  <span className="p-stat-lbl">ACTIVE REFUNDS</span>
                  <h3 className="p-stat-val">0.8%</h3>
                  <span className="p-stat-change text-danger-bold">
                    <ArrowDownRight size={14} /> -0.2% improvement
                  </span>
                </div>
                <div className="stat-icon-wrapper-blue orange">
                  <RefreshCw size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="payments-layout-grid">

            <div className="payments-chart-card card-blue">
              <h3 className="card-title-blue" style={{ marginBottom: '24px' }}>Revenue Performance</h3>
              <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="Revenue" fill="var(--primary, #0284c7)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="payments-table-card card-blue">
              <div className="card-header-flex" style={{ marginBottom: '20px' }}>
                <h3 className="card-title-blue">Transaction History</h3>
                <button className="view-all-btn-blue">Export CSV</button>
              </div>

              <div className="table-responsive-blue">
                <table className="payments-table-el">
                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>DATE</th>
                      <th>ATTENDEE</th>
                      <th>EVENT</th>
                      <th>AMOUNT</th>
                      <th>METHOD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, index) => (
                      <tr key={index}>
                        <td className="tx-id-cell">{t.id}</td>
                        <td className="tx-date-cell">{t.date}</td>
                        <td className="tx-name-cell">{t.name}</td>
                        <td className="tx-event-cell">{t.event}</td>
                        <td className="tx-amount-cell">{t.amount}</td>
                        <td className="tx-method-cell">{t.method}</td>
                        <td>
                          <span className={`status-pill-blue ${t.statusClass}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payments;
