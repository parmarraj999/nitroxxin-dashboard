import React from 'react';
import { AreaChart, Area, XAxis, BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import './Charts.css';

const barData = [
  { name: '1', value: 40, active: false },
  { name: '2', value: 60, active: false },
  { name: '3', value: 100, active: true },
  { name: '4', value: 50, active: false },
  { name: '5', value: 75, active: false },
  { name: '6', value: 90, active: false },
  { name: '7', value: 40, active: false },
];

const Charts = ({ analytics }) => {
  const revenueData = analytics?.revenueChartData || [];

  return (
    <div className="charts-container">

      <div className="revenue-chart-card card">
        <div className="chart-header-row">
          <div>
            <h2 className="card-title">Monthly Revenue Performance</h2>
            <p className="card-subtitle">Visualizing total sales across high-performance gear categories.</p>
          </div>
          <div className="chart-tabs">
            <span className="chart-tab active">REVENUE</span>
            <span className="chart-tab">VOLUME</span>
          </div>
        </div>

        <div className="revenue-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-orange)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary-orange)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--text-light)', fontWeight: 700 }}
                dy={10}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--primary-orange)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="traffic-chart-card">
        <div className="traffic-header">
          <h2 className="traffic-title">Store Traffic</h2>
          <p className="traffic-subtitle">Daily active gear enthusiasts.</p>
        </div>

        <div className="traffic-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={24}>
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? 'var(--primary-orange)' : '#374151'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="traffic-footer">
          <div className="traffic-stat">
            <span className="traffic-stat-value">12.4k</span>
            <span className="traffic-stat-label">Unique Visitors</span>
          </div>
          <div className="traffic-growth">
            <span className="traffic-growth-value">+22%</span>
            <span className="traffic-growth-label">Growth</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Charts;
