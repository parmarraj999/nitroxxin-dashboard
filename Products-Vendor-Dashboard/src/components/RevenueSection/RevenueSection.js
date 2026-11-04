import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useOrdersContext } from '../../context/OrdersContext';
import { toDate } from '../../services/firebaseUtils';
import './RevenueSection.css';

const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsFull = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Custom sleek tooltip showing Rupee currency
const CustomTooltip = ({ active, payload, label, timeframe, allYearsMode, selectedMonthName, selectedYear }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let formattedLabel = label;
    if (timeframe === 'day') {
      formattedLabel = `Day ${label} • ${selectedMonthName} ${selectedYear}`;
    } else if (timeframe === 'weekly') {
      formattedLabel = `${label} (${data.range || ''}) • ${selectedMonthName} ${selectedYear}`;
    } else if (timeframe === 'monthly') {
      formattedLabel = `${data.fullMonth || label} ${selectedYear}`;
    } else if (timeframe === 'allYears') {
      formattedLabel = allYearsMode === 'monthOnly'
        ? `${selectedMonthName} ${label}`
        : `Full Year ${label}`;
    }

    return (
      <div className="revenue-custom-tooltip">
        <span className="tooltip-period-label">{formattedLabel}</span>
        <span className="tooltip-value-amount">
          ₹{Number(data.value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
        <span className="tooltip-orders-count">
          {data.orders} {data.orders === 1 ? 'order' : 'orders'} recorded
        </span>
      </div>
    );
  }
  return null;
};

const RevenueSection = ({ analytics }) => {
  const ordersCtx = useOrdersContext();
  const realOrders = (ordersCtx?.orders && ordersCtx.orders.length > 0)
    ? ordersCtx.orders
    : (analytics?.orders || []);

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  // Selected Month & Year states
  const [selectedYear, setSelectedYear] = useState(currentRealYear);
  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth);
  const hasUserSelectedRef = useRef(false);

  // Month Picker Dropdown state
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef(null);

  // Timeframe selector: 'day' | 'weekly' | 'monthly' | 'allYears'
  const [timeframe, setTimeframe] = useState('day');

  // For 'allYears' timeframe: 'total' (all months) or 'monthOnly' (that particular month across all years)
  const [allYearsMode, setAllYearsMode] = useState('total');

  // View mode switcher: 'bar' | 'line'
  const [viewMode, setViewMode] = useState('bar');

  // Currently active/highlighted bar
  const [activeItemName, setActiveItemName] = useState(null);

  // Close month dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setIsMonthPickerOpen(false);
      }
    };
    if (isMonthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  // Derive available years from real orders and current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentRealYear, currentRealYear - 1, currentRealYear - 2]);
    realOrders.forEach((o) => {
      const dt = toDate(o.createdAt);
      if (dt && !isNaN(dt.getTime())) {
        yearsSet.add(dt.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [realOrders, currentRealYear]);

  // If user hasn't explicitly chosen yet, auto-select month with orders if current month is empty
  useEffect(() => {
    if (hasUserSelectedRef.current || !realOrders.length) return;

    const hasCurrentMonthOrders = realOrders.some((o) => {
      const dt = toDate(o.createdAt);
      return dt && dt.getMonth() === currentRealMonth && dt.getFullYear() === currentRealYear;
    });

    if (!hasCurrentMonthOrders) {
      for (const o of realOrders) {
        const dt = toDate(o.createdAt);
        if (dt && !isNaN(dt.getTime())) {
          setSelectedYear(dt.getFullYear());
          setSelectedMonth(dt.getMonth());
          break;
        }
      }
    }
  }, [realOrders, currentRealMonth, currentRealYear]);

  const selectedMonthName = monthsFull[selectedMonth];
  const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedYear, selectedMonth]);

  // Quick navigation: Previous Month
  const handlePrevMonth = () => {
    hasUserSelectedRef.current = true;
    setActiveItemName(null);
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  // Quick navigation: Next Month
  const handleNextMonth = () => {
    hasUserSelectedRef.current = true;
    setActiveItemName(null);
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Select month from dropdown
  const handleSelectMonth = (monthIdx) => {
    hasUserSelectedRef.current = true;
    setSelectedMonth(monthIdx);
    setIsMonthPickerOpen(false);
    setActiveItemName(null);
  };

  // Select year from dropdown
  const handleSelectYear = (year) => {
    hasUserSelectedRef.current = true;
    setSelectedYear(year);
    setActiveItemName(null);
  };

  // Reset to today's month & year
  const handleResetToCurrent = () => {
    hasUserSelectedRef.current = true;
    setSelectedYear(currentRealYear);
    setSelectedMonth(currentRealMonth);
    setIsMonthPickerOpen(false);
    setActiveItemName(null);
  };

  // Total All-Time Balance
  const totalAllTimeRevenue = useMemo(() => {
    if (analytics?.revenue !== undefined && analytics.revenue > 0) {
      return analytics.revenue;
    }
    return realOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
  }, [analytics, realOrders]);

  // Selected Month Revenue & Order Count
  const { selectedMonthRevenue, selectedMonthOrderCount } = useMemo(() => {
    const filtered = realOrders.filter((o) => {
      const dt = toDate(o.createdAt);
      return dt && dt.getMonth() === selectedMonth && dt.getFullYear() === selectedYear;
    });
    const rev = filtered.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
    return { selectedMonthRevenue: rev, selectedMonthOrderCount: filtered.length };
  }, [realOrders, selectedMonth, selectedYear]);

  // Selected Year Revenue & Order Count
  const { selectedYearRevenue, selectedYearOrderCount } = useMemo(() => {
    const filtered = realOrders.filter((o) => {
      const dt = toDate(o.createdAt);
      return dt && dt.getFullYear() === selectedYear;
    });
    const rev = filtered.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
    return { selectedYearRevenue: rev, selectedYearOrderCount: filtered.length };
  }, [realOrders, selectedYear]);

  // Selected Month across ALL Years Revenue & Order Count
  const { allYearsMonthRevenue, allYearsMonthOrderCount } = useMemo(() => {
    const filtered = realOrders.filter((o) => {
      const dt = toDate(o.createdAt);
      return dt && dt.getMonth() === selectedMonth;
    });
    const rev = filtered.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
    return { allYearsMonthRevenue: rev, allYearsMonthOrderCount: filtered.length };
  }, [realOrders, selectedMonth]);

  // Compute live daily breakdown for selected month (Days 1 to daysInMonth)
  const allDaysOfMonthData = useMemo(() => {
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOrders = realOrders.filter((o) => {
        const dt = toDate(o.createdAt);
        return (
          dt &&
          dt.getDate() === day &&
          dt.getMonth() === selectedMonth &&
          dt.getFullYear() === selectedYear
        );
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
      data.push({
        name: String(day),
        dayNum: day,
        value: Math.round(dayRevenue),
        orders: dayOrders.length
      });
    }
    return data;
  }, [realOrders, selectedMonth, selectedYear, daysInMonth]);

  // Compute live weekly breakdown for selected month (Weeks 1 to 5)
  const allWeeksOfMonthData = useMemo(() => {
    const weeksConfig = [
      { name: 'Week 1', shortName: 'W1', start: 1, end: 7 },
      { name: 'Week 2', shortName: 'W2', start: 8, end: 14 },
      { name: 'Week 3', shortName: 'W3', start: 15, end: 21 },
      { name: 'Week 4', shortName: 'W4', start: 22, end: 28 },
      { name: 'Week 5', shortName: 'W5', start: 29, end: daysInMonth }
    ];

    return weeksConfig.map((w) => {
      const weekOrders = realOrders.filter((o) => {
        const dt = toDate(o.createdAt);
        return (
          dt &&
          dt.getMonth() === selectedMonth &&
          dt.getFullYear() === selectedYear &&
          dt.getDate() >= w.start &&
          dt.getDate() <= w.end
        );
      });

      const weekRevenue = weekOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
      return {
        name: w.name,
        shortName: w.shortName,
        range: `Days ${w.start} - ${w.end}`,
        value: Math.round(weekRevenue),
        orders: weekOrders.length
      };
    });
  }, [realOrders, selectedMonth, selectedYear, daysInMonth]);

  // Compute live monthly breakdown for selected year (12 Months: Jan - Dec)
  const monthlyData = useMemo(() => {
    return monthsAbbr.map((m, idx) => {
      const monthOrders = realOrders.filter((o) => {
        const dt = toDate(o.createdAt);
        return dt && dt.getMonth() === idx && dt.getFullYear() === selectedYear;
      });

      const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
      return {
        name: m,
        monthIndex: idx,
        fullMonth: monthsFull[idx],
        value: Math.round(monthRevenue),
        orders: monthOrders.length
      };
    });
  }, [realOrders, selectedYear]);

  // Compute live multi-year comparison data
  const allYearsData = useMemo(() => {
    const sortedYearsAsc = [...availableYears].sort((a, b) => a - b);

    return sortedYearsAsc.map((yr) => {
      let filteredOrders = [];
      if (allYearsMode === 'monthOnly') {
        // Only that chosen month across years
        filteredOrders = realOrders.filter((o) => {
          const dt = toDate(o.createdAt);
          return dt && dt.getMonth() === selectedMonth && dt.getFullYear() === yr;
        });
      } else {
        // Full year orders
        filteredOrders = realOrders.filter((o) => {
          const dt = toDate(o.createdAt);
          return dt && dt.getFullYear() === yr;
        });
      }

      const rev = filteredOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
      return {
        name: String(yr),
        year: yr,
        value: Math.round(rev),
        orders: filteredOrders.length
      };
    });
  }, [availableYears, realOrders, allYearsMode, selectedMonth]);

  // Active chart dataset
  const chartData = useMemo(() => {
    if (timeframe === 'day') return allDaysOfMonthData;
    if (timeframe === 'weekly') return allWeeksOfMonthData;
    if (timeframe === 'monthly') return monthlyData;
    return allYearsData;
  }, [timeframe, allDaysOfMonthData, allWeeksOfMonthData, monthlyData, allYearsData]);

  // Effective highlighted bar
  const peakItemName = useMemo(() => {
    if (timeframe === 'monthly') {
      return monthsAbbr[selectedMonth];
    }
    if (timeframe === 'allYears') {
      return String(selectedYear);
    }
    if (!chartData || chartData.length === 0) return null;
    let max = chartData[0];
    for (const item of chartData) {
      if (item.value > max.value) {
        max = item;
      }
    }
    return max.value > 0 ? max.name : chartData[0]?.name;
  }, [timeframe, selectedMonth, selectedYear, chartData]);

  const effectiveActiveName = activeItemName || peakItemName;

  // Handle timeframe tab change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setActiveItemName(null);
  };

  // Dynamic Y-axis scale based on chart values
  const yAxisConfig = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.value), 0);
    let topDomain = 10000;

    if (maxVal > 0) {
      if (maxVal <= 5000) topDomain = 5000;
      else if (maxVal <= 10000) topDomain = 10000;
      else if (maxVal <= 25000) topDomain = 25000;
      else if (maxVal <= 50000) topDomain = 50000;
      else if (maxVal <= 100000) topDomain = 100000;
      else if (maxVal <= 250000) topDomain = 250000;
      else topDomain = Math.ceil(maxVal * 1.25);
    }

    const step = topDomain / 5;
    const ticks = [0, step, step * 2, step * 3, step * 4, topDomain];

    return {
      domain: [0, topDomain],
      ticks,
      tickFormatter: (val) => {
        if (val === 0) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
        return `₹${val}`;
      }
    };
  }, [chartData]);

  const currentBarSize = useMemo(() => {
    if (timeframe === 'day') return 10;
    if (timeframe === 'weekly') return 24;
    if (timeframe === 'monthly') return 18;
    return 26; // allYears
  }, [timeframe]);

  const currentBarRadius = useMemo(() => {
    if (timeframe === 'day') return [3, 3, 3, 3];
    return [5, 5, 5, 5];
  }, [timeframe]);

  // Dynamic header amount and label based on active view
  const { displayAmount, periodTag, periodSubtitle } = useMemo(() => {
    if (timeframe === 'day' || timeframe === 'weekly') {
      return {
        displayAmount: `₹${Math.round(selectedMonthRevenue).toLocaleString('en-IN')}`,
        periodTag: `${monthsAbbr[selectedMonth]} ${selectedYear}`,
        periodSubtitle: `${selectedMonthName} ${selectedYear} Revenue • ${selectedMonthOrderCount} ${selectedMonthOrderCount === 1 ? 'order' : 'orders'}`
      };
    }
    if (timeframe === 'monthly') {
      return {
        displayAmount: `₹${Math.round(selectedYearRevenue).toLocaleString('en-IN')}`,
        periodTag: `Full Year ${selectedYear}`,
        periodSubtitle: `Annual ${selectedYear} Revenue • ${selectedYearOrderCount} ${selectedYearOrderCount === 1 ? 'order' : 'orders'} across 12 months`
      };
    }
    // allYears
    if (allYearsMode === 'monthOnly') {
      return {
        displayAmount: `₹${Math.round(allYearsMonthRevenue).toLocaleString('en-IN')}`,
        periodTag: `${selectedMonthName} Across All Years`,
        periodSubtitle: `Combined ${selectedMonthName} Revenue across all recorded years • ${allYearsMonthOrderCount} orders`
      };
    }
    return {
      displayAmount: `₹${Math.round(totalAllTimeRevenue).toLocaleString('en-IN')}`,
      periodTag: 'All-Time Total',
      periodSubtitle: `Total Store Revenue • ${realOrders.length} orders total across all years`
    };
  }, [
    timeframe,
    allYearsMode,
    selectedMonthRevenue,
    selectedMonthOrderCount,
    selectedYearRevenue,
    selectedYearOrderCount,
    allYearsMonthRevenue,
    allYearsMonthOrderCount,
    totalAllTimeRevenue,
    selectedMonth,
    selectedMonthName,
    selectedYear,
    realOrders.length
  ]);

  return (
    <div className="revenue-section-card">
      {/* ================= HEADER ROW ================= */}
      <div className="revenue-header-row">
        {/* Left: Dynamic Revenue Balance Block */}
        <div className="revenue-balance-block">
          <div className="revenue-balance-main-row">
            <span className="revenue-balance-amount">{displayAmount}</span>
            <span className="revenue-period-tag">{periodTag}</span>
          </div>
          <div className="revenue-balance-subtitle">
            <span className="subtitle-period-text">{periodSubtitle}</span>
            <span className="subtitle-dot">•</span>
            <span className="subtitle-alltime">
              All-Time Balance: <strong>₹{Math.round(totalAllTimeRevenue).toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        {/* Right Controls: Month/Year Navigator + Timeframe + View Mode */}
        <div className="revenue-controls-group">
          {/* Month & Year Navigator */}
          <div className="revenue-month-nav-group" ref={monthPickerRef}>
            <button
              type="button"
              className="month-nav-arrow-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className={`revenue-month-picker-btn ${isMonthPickerOpen ? 'active' : ''}`}
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              title="Click to select month and year"
            >
              <Calendar size={13} className="month-picker-cal-icon" />
              <span className="month-picker-text">{monthsAbbr[selectedMonth]} {selectedYear}</span>
              <ChevronDown size={13} className={`month-picker-chevron ${isMonthPickerOpen ? 'open' : ''}`} />
            </button>

            <button
              type="button"
              className="month-nav-arrow-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight size={15} />
            </button>

            {/* Dropdown Menu for Month & Year Picker */}
            {isMonthPickerOpen && (
              <div className="revenue-month-dropdown-menu">
                {/* Year Header & Quick Pills */}
                <div className="month-dropdown-year-header">
                  <button
                    type="button"
                    className="year-nav-btn"
                    onClick={() => handleSelectYear(selectedYear - 1)}
                    title="Previous Year"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="year-display-text">{selectedYear}</span>
                  <button
                    type="button"
                    className="year-nav-btn"
                    onClick={() => handleSelectYear(selectedYear + 1)}
                    title="Next Year"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="month-dropdown-year-pills">
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`year-pill-btn ${yr === selectedYear ? 'active' : ''}`}
                      onClick={() => handleSelectYear(yr)}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                {/* 12 Months Grid */}
                <div className="month-dropdown-grid">
                  {monthsAbbr.map((m, idx) => {
                    const isSelected = idx === selectedMonth;
                    const isCurrent = idx === currentRealMonth && selectedYear === currentRealYear;
                    const countInMonth = realOrders.filter((o) => {
                      const dt = toDate(o.createdAt);
                      return dt && dt.getMonth() === idx && dt.getFullYear() === selectedYear;
                    }).length;

                    return (
                      <button
                        key={m}
                        type="button"
                        className={`month-grid-item ${isSelected ? 'selected' : ''} ${isCurrent && !isSelected ? 'current-now' : ''}`}
                        onClick={() => handleSelectMonth(idx)}
                      >
                        <span className="month-grid-abbr">{m}</span>
                        {countInMonth > 0 && (
                          <span
                            className="month-grid-orders-badge"
                            title={`${countInMonth} orders in ${monthsFull[idx]} ${selectedYear}`}
                          >
                            {countInMonth}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Footer Actions */}
                <div className="month-dropdown-footer">
                  <button
                    type="button"
                    className="month-footer-btn"
                    onClick={handleResetToCurrent}
                    title="Jump to current real-world month"
                  >
                    <RotateCcw size={11} style={{ marginRight: 4 }} />
                    This Month
                  </button>
                  <button
                    type="button"
                    className="month-footer-btn primary"
                    onClick={() => {
                      setTimeframe('monthly');
                      setIsMonthPickerOpen(false);
                      setActiveItemName(null);
                    }}
                    title={`View all 12 months for year ${selectedYear}`}
                  >
                    All Year ({selectedYear})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Tabs: Day, Weekly, Monthly, All Years */}
          <div className="timeframe-segmented-control">
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'day' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('day')}
              title="Daily breakdown of selected month"
            >
              Day
            </button>
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'weekly' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('weekly')}
              title="Weekly breakdown of selected month"
            >
              Weekly
            </button>
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'monthly' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('monthly')}
              title="All 12 months of selected year"
            >
              Monthly
            </button>
            <button
              type="button"
              className={`timeframe-tab-btn ${timeframe === 'allYears' ? 'active' : ''}`}
              onClick={() => handleTimeframeChange('allYears')}
              title="Multi-year comparison"
            >
              All Years
            </button>
          </div>

          {/* Sub-mode switcher when 'All Years' is active */}
          {timeframe === 'allYears' && (
            <div className="all-years-mode-control">
              <button
                type="button"
                className={`all-years-mode-btn ${allYearsMode === 'total' ? 'active' : ''}`}
                onClick={() => setAllYearsMode('total')}
                title="Full annual totals across all years"
              >
                Full Year
              </button>
              <button
                type="button"
                className={`all-years-mode-btn ${allYearsMode === 'monthOnly' ? 'active' : ''}`}
                onClick={() => setAllYearsMode('monthOnly')}
                title={`Compare ${monthsAbbr[selectedMonth]} across all years`}
              >
                {monthsAbbr[selectedMonth]} Only
              </button>
            </div>
          )}

          {/* View Mode: Line View | Bar View */}
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
              margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
              barSize={currentBarSize}
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
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                tickFormatter={yAxisConfig.tickFormatter}
                domain={yAxisConfig.domain}
                ticks={yAxisConfig.ticks}
              />

              <Tooltip
                content={
                  <CustomTooltip
                    timeframe={timeframe}
                    allYearsMode={allYearsMode}
                    selectedMonthName={selectedMonthName}
                    selectedYear={selectedYear}
                  />
                }
                cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
              />

              <Bar
                dataKey="value"
                radius={currentBarRadius}
                onClick={(entry) => {
                  if (timeframe === 'monthly' && entry.monthIndex !== undefined) {
                    setSelectedMonth(entry.monthIndex);
                    hasUserSelectedRef.current = true;
                  }
                  setActiveItemName(entry.name);
                }}
              >
                {chartData.map((entry) => {
                  const isActive = entry.name === effectiveActiveName;
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
              margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
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
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                tickFormatter={yAxisConfig.tickFormatter}
                domain={yAxisConfig.domain}
                ticks={yAxisConfig.ticks}
              />

              <Tooltip
                content={
                  <CustomTooltip
                    timeframe={timeframe}
                    allYearsMode={allYearsMode}
                    selectedMonthName={selectedMonthName}
                    selectedYear={selectedYear}
                  />
                }
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#111827"
                strokeWidth={2.5}
                dot={{
                  r: timeframe === 'day' ? 2 : 4,
                  fill: '#111827',
                  strokeWidth: 1.5,
                  stroke: '#ffffff'
                }}
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
