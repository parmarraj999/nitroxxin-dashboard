import React from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import './MainChart.css';

const data = [
  { name: 'JAN', uv: 400 },
  { name: 'FEB', uv: 600 },
  { name: 'MAR', uv: 800 },
  { name: 'APR', uv: 700 },
  { name: 'MAY', uv: 1300 },
  { name: 'JUN', uv: 1100 },
];

const MainChart = () => {
  return (
    <div className="main-chart-card card">
      <div className="chart-header">
        <div className="chart-title-group">
          <h2 className="card-title">Monthly Registrations</h2>
          <p className="card-subtitle">User acquisition trajectory across all regions.</p>
        </div>
        <div className="chart-legend">
          <span className="legend-dot"></span>
          <span className="legend-text">Growth Rate</span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-blue)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600 }}
              dy={10}
            />
            <Area 
              type="monotone" 
              dataKey="uv" 
              stroke="var(--primary-blue)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUv)" 
              dot={{ stroke: 'var(--primary-blue)', strokeWidth: 2, r: 2, fill: 'white' }}
              activeDot={{ r: 6, fill: 'var(--primary-blue)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainChart;
