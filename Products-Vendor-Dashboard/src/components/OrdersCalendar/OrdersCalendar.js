import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrdersContext } from '../../context/OrdersContext';
import { toDate } from '../../services/firebaseUtils';
import './OrdersCalendar.css';

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const statusFilterLabels = {
  all: 'All',
  pending: 'Pending / Ready',
  shipping: 'Shipping',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const monthsList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const OrdersCalendar = ({ analytics }) => {
  const navigate = useNavigate();
  const ordersCtx = useOrdersContext();

  const realOrders = (ordersCtx?.orders && ordersCtx.orders.length > 0)
    ? ordersCtx.orders
    : (analytics?.orders || []);

  // Determine initial view date: current month, or the month of the latest order
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    if (realOrders.length > 0) {
      const hasCurrentMonth = realOrders.some((o) => {
        const d = toDate(o.createdAt);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      if (hasCurrentMonth) return new Date(now.getFullYear(), now.getMonth(), 1);

      for (const o of realOrders) {
        const d = toDate(o.createdAt);
        if (d && !isNaN(d.getTime())) {
          return new Date(d.getFullYear(), d.getMonth(), 1);
        }
      }
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const hasAutoAdjustedRef = useRef(false);

  // Auto-adjust view date once real orders load if current month has no orders
  useEffect(() => {
    if (hasAutoAdjustedRef.current || !realOrders.length) return;
    const now = new Date();
    const hasCurrentMonth = realOrders.some((o) => {
      const d = toDate(o.createdAt);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (!hasCurrentMonth) {
      for (const o of realOrders) {
        const d = toDate(o.createdAt);
        if (d && !isNaN(d.getTime())) {
          setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
          hasAutoAdjustedRef.current = true;
          break;
        }
      }
    } else {
      hasAutoAdjustedRef.current = true;
    }
  }, [realOrders]);

  // Selected day: null by default so all orders for the current month are visible
  const [selectedDay, setSelectedDay] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Quick add order modal (for scheduling local orders)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [newOrderForm, setNewOrderForm] = useState({
    title: '',
    customer: '',
    status: 'shipping',
    day: new Date().getDate(),
    time: '10:00 am',
    address: '',
    amount: '₹4,999'
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0 - 11

  const monthName = viewDate.toLocaleString('en-US', { month: 'long' });
  const yearStr = currentYear;

  // Map real orders from Firestore + any user custom scheduled orders
  const allOrders = useMemo(() => {
    const list = [...customOrders];

    if (Array.isArray(realOrders) && realOrders.length > 0) {
      realOrders.forEach((o, idx) => {
        const d = toDate(o.createdAt);
        if (!d || isNaN(d.getTime())) return;

        const rawStatus = (o.status || 'pending').toLowerCase();
        let mappedStatus = 'shipping';
        let mappedLabel = 'Shipping';

        if (rawStatus === 'delivered') {
          mappedStatus = 'delivered';
          mappedLabel = 'Delivered';
        } else if (rawStatus === 'shipped' || rawStatus === 'transit') {
          mappedStatus = 'shipping';
          mappedLabel = 'Shipping';
        } else if (rawStatus === 'out_for_delivery' || rawStatus === 'packed') {
          mappedStatus = 'out_for_delivery';
          mappedLabel = rawStatus === 'packed' ? 'Preparing' : 'Out for delivery';
        } else if (rawStatus === 'confirmed' || rawStatus === 'ready') {
          mappedStatus = 'ready';
          mappedLabel = 'Ready';
        } else if (rawStatus === 'cancelled' || rawStatus === 'returned') {
          mappedStatus = 'cancelled';
          mappedLabel = rawStatus === 'returned' ? 'Returned' : 'Cancelled';
        } else if (rawStatus === 'pending') {
          mappedStatus = 'pending';
          mappedLabel = 'Pending';
        }

        const customerName = o.customer?.name || o.customerName || `Customer #${String(o.id || '').slice(0, 5) || (idx + 1)}`;

        const shortId = o.orderNumber
          ? (String(o.orderNumber).startsWith('#') ? o.orderNumber : `#${o.orderNumber}`)
          : `#${String(o.id || '').slice(0, 8).toUpperCase()}`;

        const items = o.items || [];
        let title = '';
        if (items.length === 1) {
          title = items[0].name || items[0].title || 'Product';
        } else if (items.length > 1) {
          title = `${items[0].name || items[0].title || 'Product'} +${items.length - 1} more`;
        } else {
          title = o.productTitle || o.title || `Order ${shortId}`;
        }

        const rawTotal = Number(o.total || o.totalAmount || 0);
        const amountStr = `₹${rawTotal.toLocaleString('en-IN')}`;

        const addr = o.shippingAddress || o.address || {};
        let addressStr = '';
        if (typeof addr === 'string' && addr.trim()) {
          addressStr = addr;
        } else {
          const parts = [
            addr.line1 || addr.addressLine1 || addr.street,
            addr.city,
            addr.state
          ].filter(Boolean);
          addressStr = parts.length ? parts.join(', ') : (addr.city || addr.country || 'India');
        }

        list.push({
          id: o.id,
          day: d.getDate(),
          month: d.getMonth(),
          year: d.getFullYear(),
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          title,
          customer: customerName,
          orderNumber: shortId,
          status: mappedStatus,
          rawStatus,
          statusLabel: mappedLabel,
          timeStr: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          address: addressStr,
          amount: amountStr,
          createdAtMs: d.getTime()
        });
      });
    }

    return list;
  }, [realOrders, customOrders]);

  // Orders for the current view month and year
  const currentMonthOrders = useMemo(() => {
    return allOrders.filter(
      (order) => order.month === currentMonth && order.year === currentYear
    );
  }, [allOrders, currentMonth, currentYear]);

  // Set of day numbers that have orders in the current month
  const daysWithOrders = useMemo(() => {
    const set = new Set();
    currentMonthOrders.forEach((o) => set.add(o.day));
    return set;
  }, [currentMonthOrders]);

  // Generate calendar grid cells
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Preceding month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        key: `prev-${i}`
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      cells.push({
        dayNumber: day,
        isCurrentMonth: true,
        hasOrders: daysWithOrders.has(day),
        key: `curr-${day}`
      });
    }

    // Trailing month days to round out to multiples of 7
    const remainingCells = 7 - (cells.length % 7);
    if (remainingCells < 7) {
      for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
        cells.push({
          dayNumber: nextDay,
          isCurrentMonth: false,
          key: `next-${nextDay}`
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, daysWithOrders]);

  // Find active day of week for column highlight
  const activeWeekdayIndex = useMemo(() => {
    if (selectedDay) {
      return new Date(currentYear, currentMonth, selectedDay).getDay();
    }
    const today = new Date();
    if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
      return today.getDay();
    }
    return -1;
  }, [currentYear, currentMonth, selectedDay]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleSelectMonth = (monthIndex) => {
    setViewDate((prev) => new Date(prev.getFullYear(), monthIndex, 1));
    setIsMonthPickerOpen(false);
    setSelectedDay(null);
  };

  const handleDayClick = (cell) => {
    if (!cell.isCurrentMonth) return;
    if (selectedDay === cell.dayNumber) {
      // Toggle off to show all orders for the month
      setSelectedDay(null);
    } else {
      setSelectedDay(cell.dayNumber);
    }
  };

  // Filter and sort displayed orders
  const displayedOrders = useMemo(() => {
    let list = [...currentMonthOrders];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((item) => {
        if (statusFilter === 'shipping') return item.status === 'shipping';
        if (statusFilter === 'out_for_delivery') return item.status === 'out_for_delivery';
        if (statusFilter === 'delivered') return item.status === 'delivered';
        if (statusFilter === 'cancelled') return item.status === 'cancelled';
        if (statusFilter === 'pending') return item.status === 'pending' || item.status === 'ready';
        return item.status === statusFilter;
      });
    }

    // If a specific day is selected, filter to that day
    if (selectedDay !== null) {
      list = list.filter((item) => item.day === selectedDay);
    }

    // Sort by latest order first
    list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

    return list;
  }, [currentMonthOrders, statusFilter, selectedDay]);

  // Submit quick new order
  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrderForm.title.trim()) return;

    const dayNum = Number(newOrderForm.day) || new Date().getDate();
    const tempDate = new Date(currentYear, currentMonth, dayNum);
    const dayName = tempDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    const createdOrder = {
      id: `NX-${Date.now().toString().slice(-6)}`,
      day: dayNum,
      month: currentMonth,
      year: currentYear,
      dayName,
      title: newOrderForm.title,
      customer: newOrderForm.customer || 'Customer',
      orderNumber: `#NX-${Math.floor(10000 + Math.random() * 90000)}`,
      status: newOrderForm.status,
      statusLabel:
        newOrderForm.status === 'shipping'
          ? 'Shipping'
          : newOrderForm.status === 'out_for_delivery'
          ? 'Out for delivery'
          : newOrderForm.status === 'delivered'
          ? 'Delivered'
          : 'Pending',
      timeStr: `${monthName.slice(0, 3)} ${dayNum} at ${newOrderForm.time || '10:00 am'}`,
      address: newOrderForm.address || 'India',
      amount: newOrderForm.amount || '₹4,999',
      createdAtMs: tempDate.getTime()
    };

    setCustomOrders((prev) => [createdOrder, ...prev]);
    setSelectedDay(dayNum);
    setIsAddModalOpen(false);
    setNewOrderForm({
      title: '',
      customer: '',
      status: 'shipping',
      day: dayNum,
      time: '10:00 am',
      address: '',
      amount: '₹4,999'
    });
  };

  return (
    <div className="orders-calendar-card">
      {/* ================= LEFT PANE: CALENDAR ================= */}
      <div className="calendar-pane">
        <div className="calendar-header">
          <div className="calendar-title-group">
            <span className="calendar-month-name">{monthName}</span>
            <span className="calendar-year-num">{yearStr}</span>
          </div>

          <div className="calendar-controls">
            <button
              className="nav-arrow-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              className="nav-arrow-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>

            <button
              className="month-picker-btn"
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            >
              <span>Month</span>
              <ChevronDown size={14} />
            </button>

            {isMonthPickerOpen && (
              <div className="month-picker-dropdown">
                {monthsList.map((m, idx) => (
                  <button
                    key={m}
                    className={`month-option-btn ${idx === currentMonth ? 'active' : ''}`}
                    onClick={() => handleSelectMonth(idx)}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Days of week header */}
        <div className="calendar-weekdays-row">
          {weekdays.map((w, idx) => (
            <div
              key={w}
              className={`calendar-weekday-cell ${
                idx === activeWeekdayIndex ? 'active-weekday' : ''
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 7x5 or 7x6 Days Grid */}
        <div className="calendar-grid">
          {calendarCells.map((cell) => {
            const isSelected = cell.isCurrentMonth && selectedDay === cell.dayNumber;

            return (
              <div
                key={cell.key}
                className={`calendar-day-cell ${
                  !cell.isCurrentMonth ? 'outside-month' : ''
                } ${cell.hasOrders ? 'has-orders' : ''} ${
                  isSelected ? 'selected-day' : ''
                }`}
                onClick={() => handleDayClick(cell)}
              >
                {cell.isCurrentMonth && cell.hasOrders ? (
                  <div className="calendar-day-dot" />
                ) : (
                  <div className="calendar-day-dot-placeholder" />
                )}
                <span className="day-number">{cell.dayNumber}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RIGHT PANE: ORDERS LIST ================= */}
      <div className="orders-pane">
        <div className="orders-pane-header">
          <h2 className="orders-pane-title">Your orders</h2>

          <div className="orders-header-actions">
            {/* Status Filter dropdown */}
            <button
              className="status-filter-btn"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <span>{statusFilterLabels[statusFilter]}</span>
              <ChevronDown size={14} />
            </button>

            {isFilterDropdownOpen && (
              <div className="status-filter-dropdown">
                {Object.entries(statusFilterLabels).map(([key, label]) => (
                  <button
                    key={key}
                    className={`filter-option-item ${statusFilter === key ? 'active' : ''}`}
                    onClick={() => {
                      setStatusFilter(key);
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    <span>{label}</span>
                    <span className="filter-count-badge">
                      {key === 'all'
                        ? currentMonthOrders.length
                        : currentMonthOrders.filter((o) => {
                            if (key === 'shipping') return o.status === 'shipping';
                            if (key === 'out_for_delivery') return o.status === 'out_for_delivery';
                            if (key === 'delivered') return o.status === 'delivered';
                            if (key === 'cancelled') return o.status === 'cancelled';
                            if (key === 'pending') return o.status === 'pending' || o.status === 'ready';
                            return o.status === key;
                          }).length}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* + Add new button */}
            <button
              className="add-new-order-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={15} />
              <span>Add new</span>
            </button>
          </div>
        </div>

        {/* Selected date filter notice banner */}
        {selectedDay && (
          <div className="selected-date-banner">
            <span>
              Focusing on <strong>{monthName.slice(0, 3)} {selectedDay}</strong> (
              {currentMonthOrders.filter((o) => o.day === selectedDay).length} order
              {currentMonthOrders.filter((o) => o.day === selectedDay).length !== 1 ? 's' : ''})
            </span>
            <span
              className="clear-filter-link"
              onClick={() => setSelectedDay(null)}
            >
              Show all orders
            </span>
          </div>
        )}

        {/* Orders list container */}
        <div className="orders-list-scroll">
          {displayedOrders.length > 0 ? (
            displayedOrders.map((order) => {
              const isCardHighlighted = selectedDay === order.day;

              return (
                <div
                  key={order.id}
                  className={`order-schedule-card ${isCardHighlighted ? 'highlighted' : ''}`}
                  onClick={() => navigate(order.id ? `/orders/details/${order.id}` : '/orders')}
                >
                  {/* Left Date Column */}
                  <div className="order-date-col">
                    <span className="order-day-num">
                      {String(order.day).padStart(2, '0')}
                    </span>
                    <span className="order-day-name">{order.dayName}</span>
                  </div>

                  {/* Vertical divider */}
                  <div className="order-card-divider" />

                  {/* Right Details Column */}
                  <div className="order-details-col">
                    <div className="order-title-line">
                      <span className="order-product-name">{order.title}</span>
                      <span className="order-amount-pill">{order.amount}</span>
                    </div>

                    <div className="order-meta-line">
                      {/* Status badge */}
                      <span
                        className={`order-status-badge-custom ${order.status}`}
                      >
                        {order.statusLabel}
                      </span>

                      {/* Date & Time */}
                      <span className="order-meta-item">
                        <CalendarIcon size={13} />
                        {order.timeStr}
                      </span>

                      {/* Location / Address */}
                      <span className="order-meta-item address" title={order.address}>
                        <MapPin size={13} />
                        {order.address}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-orders-view">
              <Package size={32} color="#9ca3af" />
              <p>
                {selectedDay
                  ? `No orders scheduled for ${monthName.slice(0, 3)} ${selectedDay}.`
                  : `No orders found for ${monthName} ${yearStr}.`}
              </p>
              {(selectedDay !== null || statusFilter !== 'all') && (
                <button
                  className="reset-filter-btn"
                  onClick={() => {
                    setSelectedDay(null);
                    setStatusFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= QUICK ADD NEW ORDER MODAL ================= */}
      {isAddModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h3>Schedule New Order</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="modal-body-custom">
                <div className="modal-form-group">
                  <label>Product / Item Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Carbon Pro Helmet"
                    value={newOrderForm.title}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="modal-row-two">
                  <div className="modal-form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newOrderForm.customer}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, customer: e.target.value })
                      }
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Order Status</label>
                    <select
                      value={newOrderForm.status}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, status: e.target.value })
                      }
                    >
                      <option value="shipping">Shipping</option>
                      <option value="out_for_delivery">Out for delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="modal-row-two">
                  <div className="modal-form-group">
                    <label>Schedule Day (in {monthName})</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={newOrderForm.day}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, day: e.target.value })
                      }
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Time</label>
                    <input
                      type="text"
                      placeholder="08:05 am"
                      value={newOrderForm.time}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 3890 Poplar Dr., Mumbai"
                    value={newOrderForm.address}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, address: e.target.value })
                    }
                  />
                </div>

                <div className="modal-form-group">
                  <label>Total Price (₹)</label>
                  <input
                    type="text"
                    placeholder="₹4,999"
                    value={newOrderForm.amount}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Add Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersCalendar;
