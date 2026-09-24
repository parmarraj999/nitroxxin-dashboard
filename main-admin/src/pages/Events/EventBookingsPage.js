import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Ticket, Users, DollarSign } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function EventBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real-time listener for bookings
  useEffect(() => {
    const q = query(collection(db, 'event_bookings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const visibleBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (b.bookingId || b.id || '').toLowerCase().includes(term) ||
      (b.eventName || '').toLowerCase().includes(term) ||
      (b.customer || b.customerName || b.userName || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedBookings = visibleBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.amount || b.totalAmount || 0), 0);
  const totalTickets = bookings.reduce((sum, b) => sum + Number(b.tickets || b.ticketCount || 1), 0);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Bookings</h1>
          <p className="page-subtitle">Track registrations, ticket sales, attendee details, and revenue.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Bookings</span>
          <strong>{loading ? '...' : bookings.length}</strong>
        </div>
        <div className="management-metric">
          <span>Confirmed</span>
          <strong>{bookings.filter((b) => b.status === 'confirmed').length}</strong>
        </div>
        <div className="management-metric">
          <span>Tickets Sold</span>
          <strong>{totalTickets}</strong>
        </div>
        <div className="management-metric">
          <span>Revenue</span>
          <strong>₹{totalRevenue.toLocaleString()}</strong>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="management-toolbar">
          <div className="search-wrapper enterprise-search">
            <Search size={16} className="search-icon-small" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search booking ID, event name, or attendee..." 
            />
          </div>

          <div className="management-select-wrapper">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading bookings...</div>
        ) : visibleBookings.length === 0 ? (
          <div className="enterprise-state">
            <ClipboardCheck size={32} />
            <h3>No bookings found</h3>
            <p>Customer registrations for events will appear here.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event Name</th>
                    <th>Participant</th>
                    <th>Tickets</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => (
                    <tr key={b.id}>
                      <td><code>{b.bookingId || b.id.slice(0, 8).toUpperCase()}</code></td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{b.eventName || 'Event'}</strong></td>
                      <td>
                        <div>{b.customer || b.customerName || b.userName || 'Guest Rider'}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{b.email || b.phone || ''}</small>
                      </td>
                      <td>{b.tickets || b.ticketCount || 1}</td>
                      <td>₹{Number(b.amount || b.totalAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={`management-badge ${b.status || 'pending'}`}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleBookings.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
