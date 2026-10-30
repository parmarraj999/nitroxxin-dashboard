import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Package,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toDate } from '../../services/firebaseUtils';
import './OrdersCalendar.css';

// Initial realistic orders matching the screenshot reference layout and motorcycle store theme
const defaultOrdersData = [
  {
    id: 'NX-99820',
    day: 20,
    month: 11, // December (0-indexed)
    year: 2025,
    dayName: 'FRI',
    title: 'Axor Apex Carbon Pro Helmet',
    customer: 'Rahul Sharma',
    orderNumber: '#NX-99820',
    status: 'shipping',
    statusLabel: 'Shipping',
    timeStr: 'Dec 20 at 08:05 am',
    address: '3890 Poplar Dr., Mumbai',
    amount: 'Rs. 5,499'
  },
  {
    id: 'NX-99822',
    day: 22,
    month: 11,
    year: 2025,
    dayName: 'SUN',
    title: 'Vantage Leather Armor Jacket',
    customer: 'Elena Kraus',
    orderNumber: '#NX-99822',
    status: 'out_for_delivery',
    statusLabel: 'Out for delivery',
    timeStr: 'Dec 22 at 01:49 pm',
    address: '8558 Green Rd., Delhi',
    amount: 'Rs. 9,999'
  },
  {
    id: 'NX-99825',
    day: 25,
    month: 11,
    year: 2025,
    dayName: 'WED',
    title: 'Torque-S Racing Carbon Gloves',
    customer: 'Vikram Mehta',
    orderNumber: '#NX-99825',
    status: 'shipping',
    statusLabel: 'Shipping',
    timeStr: 'Dec 25 at 12:10 am',
    address: '775 Rolling Green Rd., Bangalore',
    amount: 'Rs. 3,250'
  },
  {
    id: 'NX-99803',
    day: 3,
    month: 11,
    year: 2025,
    dayName: 'MON',
    title: 'Ultimate Moto Spec & Shield',
    customer: 'David Miller',
    orderNumber: '#NX-99803',
    status: 'delivered',
    statusLabel: 'Delivered',
    timeStr: 'Dec 28 at 08:05 am',
    address: '8080 Railroad St., Pune',
    amount: 'Rs. 4,800'
  },
  {
    id: 'NX-99802',
    day: 2,
    month: 11,
    year: 2025,
    dayName: 'TUE',
    title: 'Motul 300V 4T Factory Synthetic Oil',
    customer: 'Arjun Nair',
    orderNumber: '#NX-99802',
    status: 'delivered',
    statusLabel: 'Delivered',
    timeStr: 'Dec 02 at 02:00 pm',
    address: '104 Willow Way, Kochi',
    amount: 'Rs. 1,850'
  },
  {
    id: 'NX-99806',
    day: 6,
    month: 11,
    year: 2025,
    dayName: 'SAT',
    title: 'Viaterra Claw Mini Tail Bag',
    customer: 'Siddharth Roy',
    orderNumber: '#NX-99806',
    status: 'delivered',
    statusLabel: 'Delivered',
    timeStr: 'Dec 06 at 09:15 am',
    address: '910 Pine St., Kolkata',
    amount: 'Rs. 3,899'
  },
  {
    id: 'NX-99808',
    day: 8,
    month: 11,
    year: 2025,
    dayName: 'MON',
    title: 'Rynox Storm Evo Riding Pants',
    customer: 'Pooja Verma',
    orderNumber: '#NX-99808',
    status: 'delivered',
    statusLabel: 'Delivered',
    timeStr: 'Dec 08 at 03:15 pm',
    address: '120 Sunset Blvd., Ahmedabad',
    amount: 'Rs. 7,450'
  },
  {
    id: 'NX-99811',
    day: 11,
    month: 11,
    year: 2025,
    dayName: 'THU',
    title: 'Brembo Racing Sintered Brake Pads',
    customer: 'Karan Patel',
    orderNumber: '#NX-99811',
    status: 'delivered',
    statusLabel: 'Delivered',
    timeStr: 'Dec 11 at 10:30 am',
    address: '244 Highland Ave., Mumbai',
    amount: 'Rs. 2,900'
  },
  {
    id: 'NX-99814',
    day: 14,
    month: 11,
    year: 2025,
    dayName: 'SUN',
    title: 'Axor Street Stealth Helmet',
    customer: 'Aniket Deshmukh',
    orderNumber: '#NX-99814',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    timeStr: 'Dec 14 at 05:20 pm',
    address: '512 Elm St., Nagpur',
    amount: 'Rs. 4,200'
  },
  {
    id: 'NX-99817',
    day: 17,
    month: 11,
    year: 2025,
    dayName: 'WED',
    title: 'Raida Tourer Motorcycle Boots',
    customer: 'Rohan Gupta',
    orderNumber: '#NX-99817',
    status: 'out_for_delivery',
    statusLabel: 'Out for delivery',
    timeStr: 'Dec 17 at 11:45 am',
    address: '633 Cedar Lane, Jaipur',
    amount: 'Rs. 6,800'
  }
];

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const OrdersCalendar = ({ analytics }) => {
  const navigate = useNavigate();

  // Active view date: initialize to December 2025 to match user UI reference
  const [viewDate, setViewDate] = useState(new Date(2025, 11, 1));
  // Selected day: 20 by default matching UI reference
  const [selectedDay, setSelectedDay] = useState(20);
  // Status filter: 'all' | 'shipping' | 'out_for_delivery' | 'delivered' | 'cancelled'
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Quick add order modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [newOrderForm, setNewOrderForm] = useState({
    title: '',
    customer: '',
    status: 'shipping',
    day: 20,
    time: '10:00 am',
    address: '3890 Poplar Dr.',
    amount: 'Rs. 4,999'
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0 - 11

  // Format month and year
  const monthName = viewDate.toLocaleString('en-US', { month: 'long' });
  const yearStr = currentYear;

  // Combine default mock orders, custom user orders, and any Firebase orders
  const allOrders = useMemo(() => {
    const list = [...defaultOrdersData, ...customOrders];

    // If analytics has real orders from Firestore, map them into the schedule
    if (analytics?.orders && Array.isArray(analytics.orders)) {
      analytics.orders.forEach((o) => {
        const d = toDate(o.createdAt);
        if (d) {
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
            mappedLabel = 'Out for delivery';
          } else if (rawStatus === 'cancelled' || rawStatus === 'returned') {
            mappedStatus = 'cancelled';
            mappedLabel = 'Cancelled';
          }

          list.push({
            id: o.id,
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            title: o.items?.[0]?.name || o.productTitle || `Order #${String(o.id).slice(0, 7)}`,
            customer: o.customer?.name || o.customerName || 'Customer',
            orderNumber: `#${String(o.id).slice(0, 8)}`,
            status: mappedStatus,
            statusLabel: mappedLabel,
            timeStr: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            address: o.shippingAddress?.line1 ? `${o.shippingAddress.line1}, ${o.shippingAddress.city || ''}` : (o.shippingAddress?.city || 'India'),
            amount: `Rs. ${Number(o.total || o.totalAmount || 0).toLocaleString()}`
          });
        }
      });
    }

    return list;
  }, [analytics?.orders, customOrders]);

  // Orders for current month
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

  // Find active day of week for column highlight (e.g. FRI in the UI mockup)
  const activeWeekdayIndex = useMemo(() => {
    if (selectedDay) {
      return new Date(currentYear, currentMonth, selectedDay).getDay();
    }
    return new Date().getDay();
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
      // Toggle off to show all
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
      list = list.filter((item) => item.status === statusFilter);
    }

    // If a specific day is selected, prioritize or filter to that day
    if (selectedDay !== null) {
      const selectedDayItems = list.filter((item) => item.day === selectedDay);
      const otherItems = list.filter((item) => item.day !== selectedDay);
      // Place selected day orders at top, followed by other upcoming orders
      list = [...selectedDayItems, ...otherItems];
    } else {
      // Sort chronologically
      list.sort((a, b) => a.day - b.day);
    }

    return list;
  }, [currentMonthOrders, statusFilter, selectedDay]);

  // Submit quick new order
  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrderForm.title.trim()) return;

    const dayNum = Number(newOrderForm.day) || 20;
    const tempDate = new Date(currentYear, currentMonth, dayNum);
    const dayName = tempDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    const createdOrder = {
      id: `NX-${Date.now().toString().slice(-5)}`,
      day: dayNum,
      month: currentMonth,
      year: currentYear,
      dayName,
      title: newOrderForm.title,
      customer: newOrderForm.customer || 'Guest Customer',
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
      address: newOrderForm.address || '3890 Poplar Dr.',
      amount: newOrderForm.amount || 'Rs. 4,999'
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
      address: '3890 Poplar Dr.',
      amount: 'Rs. 4,999'
    });
  };

  const statusFilterLabels = {
    all: 'All',
    shipping: 'Shipping',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
                        : currentMonthOrders.filter((o) => o.status === key).length}
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
                  onClick={() => navigate('/orders')}
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
                      {/* Status badge: shipping, out_for_delivery, delivered */}
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
              <p>No orders scheduled for this selection.</p>
              <button
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedDay(null);
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </button>
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
                    placeholder="e.g. Axor Apex Hunter Helmet"
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
                    placeholder="3890 Poplar Dr."
                    value={newOrderForm.address}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, address: e.target.value })
                    }
                  />
                </div>

                <div className="modal-form-group">
                  <label>Total Price (Rs.)</label>
                  <input
                    type="text"
                    placeholder="Rs. 4,999"
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
