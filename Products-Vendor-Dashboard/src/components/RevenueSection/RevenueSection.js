import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import './RevenueSection.css';

// All 31 days of the month (Days 1 to 31)
const allDaysOfMonthData = [
  { name: '1', dayNum: 1, value: 2400, orders: 12 },
  { name: '2', dayNum: 2, value: 3100, orders: 15 },
  { name: '3', dayNum: 3, value: 2800, orders: 14 },
  { name: '4', dayNum: 4, value: 3200, orders: 16 },
  { name: '5', dayNum: 5, value: 3100, orders: 15 },
  { name: '6', dayNum: 6, value: 2400, orders: 12 },
  { name: '7', dayNum: 7, value: 2300, orders: 10 },
  { name: '8', dayNum: 8, value: 2800, orders: 14 },
  { name: '9', dayNum: 9, value: 3200, orders: 16 },
  { name: '10', dayNum: 10, value: 3500, orders: 17 },
  { name: '11', dayNum: 11, value: 3200, orders: 16 },
  { name: '12', dayNum: 12, value: 3100, orders: 15 },
  { name: '13', dayNum: 13, value: 3300, orders: 16 },
  { name: '14', dayNum: 14, value: 3600, orders: 18 },
  { name: '15', dayNum: 15, value: 3100, orders: 15 },
  { name: '16', dayNum: 16, value: 3400, orders: 17 },
  { name: '17', dayNum: 17, value: 3200, orders: 16 },
  { name: '18', dayNum: 18, value: 3100, orders: 15 },
  { name: '19', dayNum: 19, value: 3300, orders: 16 },
  { name: '20', dayNum: 20, value: 9800, orders: 48 }, // Peak highlighted black bar matching orders calendar
  { name: '21', dayNum: 21, value: 3000, orders: 15 },
  { name: '22', dayNum: 22, value: 3200, orders: 16 },
  { name: '23', dayNum: 23, value: 3100, orders: 15 },
  { name: '24', dayNum: 24, value: 2900, orders: 14 },
  { name: '25', dayNum: 25, value: 3400, orders: 17 },
  { name: '26', dayNum: 26, value: 2800, orders: 14 },
  { name: '27', dayNum: 27, value: 3100, orders: 15 },
  { name: '28', dayNum: 28, value: 2900, orders: 14 },
  { name: '29', dayNum: 29, value: 3200, orders: 16 },
  { name: '30', dayNum: 30, value: 3400, orders: 17 },
  { name: '31', dayNum: 31, value: 3275.96, orders: 16 }
];

// All weeks of the month (Week 1 to Week 5)
const allWeeksOfMonthData = [
  { name: 'Week 1', shortName: 'W1', value: 19300, orders: 94, range: 'Days 1 - 7' },
  { name: 'Week 2', shortName: 'W2', value: 22700, orders: 112, range: 'Days 8 - 14' },
  { name: 'Week 3', shortName: 'W3', value: 28900, orders: 144, range: 'Days 15 - 21' }, // Peak highlighted black bar
  { name: 'Week 4', shortName: 'W4', value: 21400, orders: 106, range: 'Days 22 - 28' },
  { name: 'Week 5', shortName: 'W5', value: 9875.96, orders: 49, range: 'Days 29 - 31' }
];

// All 12 months of the year
const monthlyData = [
  { name: 'Jan', fullMonth: 'January', value: 9800, orders: 140 },
  { name: 'Feb', fullMonth: 'February', value: 10000, orders: 152 },
  { name: 'Mar', fullMonth: 'March', value: 8600, orders: 128 },
  { name: 'Apr', fullMonth: 'April', value: 7100, orders: 105 },
  { name: 'May', fullMonth: 'May', value: 6000, orders: 94 },
  { name: 'Jun', fullMonth: 'June', value: 5400, orders: 88 },
  { name: 'Jul', fullMonth: 'July', value: 9600, orders: 146 }, // Peak highlighted black bar matching reference image
  { name: 'Aug', fullMonth: 'August', value: 6100, orders: 92 },
  { name: 'Sep', fullMonth: 'September', value: 9500, orders: 139 },
  { name: 'Oct', fullMonth: 'October', value: 9500, orders: 142 },
  { name: 'Nov', fullMonth: 'November', value: 7000, orders: 110 },
  { name: 'Dec', fullMonth: 'December', value: 4200, orders: 68 }
];

// Custom sleek tooltip
const CustomTooltip = ({ active, payload, label, timeframe }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedLabel =
      timeframe === 'day'
        ? `Day ${label}`
        : timeframe === 'weekly'
        ? `${label} (${data.range || ''})`
        : data.fullMonth || label;

    return (
      <div className="revenue-custom-tooltip">
        <span className="tooltip-period-label">{formattedLabel}</span>
        <span className="tooltip-value-amount">
          ${Number(data.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="tooltip-orders-count">{data.orders} orders recorded</span>
      </div>
    );
  }
  return null;
};

const RevenueSection = ({ analytics }) => {
  // Timeframe selector: 'day' | 'weekly' | 'monthly' - 'day' is default as requested
  const [timeframe, setTimeframe] = useState('day');

  // View mode switcher: 'bar' | 'line' (matching screenshot buttons: Line View | Bar View)
  const [viewMode, setViewMode] = useState('bar');

  // Currently active/highlighted bar ('20' by default for day view)
  const [activeItemName, setActiveItemName] = useState('20');

  // Select appropriate dataset based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === 'day') return allDaysOfMonthData;
    if (timeframe === 'weekly') return allWeeksOfMonthData;
    return monthlyData;
  }, [timeframe]);

  // Handle timeframe tab change and set appropriate default active bar
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    if (newTimeframe === 'day') setActiveItemName('20');
    else if (newTimeframe === 'weekly') setActiveItemName('Week 3');
    else if (newTimeframe === 'monthly') setActiveItemName('Jul');
  };

  // Fixed available balance matching UI reference image
  const balanceDisplay = '$102,175.96';

  // Compute dynamic domain and ticks based on selected timeframe
  const yAxisConfig = useMemo(() => {
    if (timeframe === 'weekly') {
      return {
        domain: [0, 30000],
        ticks: [0, 6000, 12000, 18000, 24000, 30000],
        tickFormatter: (val) => (val === 0 ? '0k' : `${val / 1000}k`)
      };
    }
    // Daily and Monthly have peak ~10k matching reference image
    return {
      domain: [0, 10000],
      ticks: [0, 2000, 4000, 6000, 8000, 10000],
      tickFormatter: (val) => (val === 0 ? '0k' : `${val / 1000}k`)
    };
  }, [timeframe]);

  // Dynamic barSize to ensure bars stay sleek, narrow, and proportionate
  const currentBarSize = useMemo(() => {
    if (timeframe === 'day') return 10; // Sleek narrow bar for 31 days
    if (timeframe === 'weekly') return 22; // Narrow bar for 5 weeks
    return 18; // Narrow bar for 12 months (matching reference screenshot)
  }, [timeframe]);

  const currentBarRadius = useMemo(() => {
    if (timeframe === 'day') return [3, 3, 3, 3];
    return [6, 6, 6, 6];
  }, [timeframe]);

  return (
    <div className="revenue-section-card">
      {/* ================= HEADER ROW ================= */}
      <div className="revenue-header-row">
        {/* Left: Available Balance */}
        <div className="revenue-balance-block">
          <span className="revenue-balance-amount">{balanceDisplay}</span>
          <span className="revenue-balance-subtitle">
            Available Balance
            {timeframe === 'day' && ' • Daily Breakdown (31 Days)'}
            {timeframe === 'weekly' && ' • Weekly Breakdown (5 Weeks)'}
            {timeframe === 'monthly' && ' • Monthly Breakdown (12 Months)'}
          </span>
        </div>

        {/* Right Controls: Day/Weekly/Monthly + Line View/Bar View */}
        <div className="revenue-controls-group">
          {/* Day, Weekly, Monthly segmented control */}
          <div className="timeframe-segmented-control">
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'day' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('day')}
            >
              Day
            </button>
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'weekly' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('weekly')}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'monthly' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('monthly')}
            >
              Monthly
            </button>
          </div>

          {/* Line View | Bar View switcher (matches reference image) */}
          <div className="viewmode-segmented-control">
            <button
              type="button"
              className={`viewmode-tab-btn ${viewMode === 'line' ? 'active' : ''}`}
              onClick={() => setViewMode('line')}
            >
              Line View
            </button>
            <button
              type="button"
              className={`viewmode-tab-btn ${viewMode === 'bar' ? 'active' : ''}`}
              onClick={() => setViewMode('bar')}
            >
              Bar View
            </button>
          </div>
        </div>
      </div>

      {/* ================= CHART CANVAS ================= */}
      <div className="revenue-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              barSize={currentBarSize} // Dynamically narrow bar width
            >
              {/* Horizontal dashed grid lines at 0k, 2k, 4k, 6k, 8k, 10k */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f3f5"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={2}
                tick={{
                  fontSize: timeframe === 'day' ? 10 : 12,
                  fill: '#9ca3af',
                  fontWeight: 500
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                tickFormatter={yAxisConfig.tickFormatter}
                domain={yAxisConfig.domain}
                ticks={yAxisConfig.ticks}
              />

              <Tooltip
                content={<CustomTooltip timeframe={timeframe} />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
              />

              {/* Narrow rounded bars with active black bar matching reference */}
              <Bar
                dataKey="value"
                radius={currentBarRadius}
                onClick={(entry) => setActiveItemName(entry.name)}
              >
                {chartData.map((entry) => {
                  const isActive = entry.name === activeItemName;
                  return (
                    <Cell
                      key={entry.name}
                      fill={isActive ? '#111827' : '#eeeeee'}
                      cursor="pointer"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f3f5"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={2}
                tick={{
                  fontSize: timeframe === 'day' ? 10 : 12,
                  fill: '#9ca3af',
                  fontWeight: 500
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                tickFormatter={yAxisConfig.tickFormatter}
                domain={yAxisConfig.domain}
                ticks={yAxisConfig.ticks}
              />

              <Tooltip content={<CustomTooltip timeframe={timeframe} />} />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#111827"
                strokeWidth={2.5}
                dot={{ r: timeframe === 'day' ? 2 : 4, fill: '#111827', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#111827' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueSection;
