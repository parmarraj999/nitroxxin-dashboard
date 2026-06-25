import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { deleteEvent, duplicateEvent } from '../../services/firebaseService';
import { currency, downloadCsv, formatDate } from '../../utils/formatters';
import './EventPlatform.css';
import '../Auth/Auth.css';

const EventList = () => {
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: 'all', category: '', ticketType: '' });
  const { events, loading, error } = useEvents({
    hostId: profile?.role === 'Host' ? user?.uid : undefined,
    ...filters,
  });

  const categories = useMemo(() => [...new Set(events.map((event) => event.category).filter(Boolean))], [events]);

  const remove = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Registrations will remain for audit history.`)) return;
    await deleteEvent(event.id);
  };

  const exportRows = () => {
    downloadCsv(
      'events.csv',
      events.map((event) => ({
        title: event.title,
        status: event.status,
        category: event.category,
        city: event.city,
        date: event.startDate,
        registeredCount: event.registeredCount || 0,
        revenue: event.revenue || 0,
      }))
    );
  };

  return (
    <AppLayout searchPlaceholder="Search events by title, city, category, or venue">
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>My Events</h1>
            <p>Create, edit, duplicate, publish, cancel, and review every hosted event.</p>
          </div>
          <div className="action-row">
            <button className="ghost-btn" onClick={exportRows}><Download size={16} /> Export</button>
            <Link className="primary-btn" to="/events/new"><Plus size={16} /> Add Event</Link>
          </div>
        </div>

        <section className="toolbar">
          <label className="form-field"><span>Search</span><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Event name, category, city" /></label>
          <label className="form-field"><span>Status</span><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All</option><option>Draft</option><option>Published</option><option>Completed</option><option>Cancelled</option></select></label>
          <label className="form-field"><span>Category</span><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="form-field"><span>Price</span><select value={filters.ticketType} onChange={(e) => setFilters({ ...filters, ticketType: e.target.value })}><option value="">All</option><option>Free</option><option>Paid</option></select></label>
        </section>

        {error && <div className="alert error">{error}</div>}
        {loading ? <LoadingState label="Loading events" /> : (
          <div className="table-panel">
            {events.length ? (
              <table className="data-table">
                <thead>
                  <tr><th>Event</th><th>Date</th><th>Status</th><th>Capacity</th><th>Revenue</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td><strong>{event.title}</strong><p className="muted">{event.category} in {event.city}</p></td>
                      <td>{formatDate(event.startDate)}<p className="muted">{event.startTime} - {event.endTime}</p></td>
                      <td><span className={`badge ${event.status === 'Published' ? 'success' : event.status === 'Cancelled' ? 'danger' : 'warning'}`}>{event.status}</span></td>
                      <td>{event.registeredCount || 0} / {event.capacity || 0}</td>
                      <td>{currency(event.revenue)}</td>
                      <td>
                        <div className="action-row">
                          <Link className="ghost-btn" to={`/events/${event.id}`}><Eye size={15} /></Link>
                          <Link className="ghost-btn" to={`/events/${event.id}/edit`}><Edit size={15} /></Link>
                          <button className="ghost-btn" onClick={() => duplicateEvent(event)}><Copy size={15} /></button>
                          <button className="danger-btn" onClick={() => remove(event)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No events found" message="Create an event or adjust your filters." action={<Link className="primary-btn" to="/events/new">Add Event</Link>} />
            )}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default EventList;
