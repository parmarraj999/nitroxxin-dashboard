import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarDays, Copy, Download, Edit, Eye, Filter, Plus, Radio, Search, Trash2, Users } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { deleteEvent, duplicateEvent, updateEvent } from '../../services/firebaseService';
import { currency, downloadCsv, formatDate } from '../../utils/formatters';
import './EventPlatform.css';
import './EventManagementFlow.css';
import '../Auth/Auth.css';

const statusTone = {
  Published: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  Draft: 'warning',
  'Pending Approval': 'warning',
};

const EventList = () => {
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: 'all', category: '', ticketType: '' });
  const { events, loading, error } = useEvents({
    hostId: profile?.role === 'Host' ? user?.uid : undefined,
    ...filters,
  });

  const categories = useMemo(() => [...new Set(events.map((event) => event.category).filter(Boolean))], [events]);

  const portfolio = useMemo(() => {
    const totalRevenue = events.reduce((sum, event) => sum + Number(event.revenue || 0), 0);
    const totalBookings = events.reduce((sum, event) => sum + Number(event.registeredCount || 0), 0);
    const totalCapacity = events.reduce((sum, event) => sum + Number(event.capacity || 0), 0);
    const liveEvents = events.filter((event) => event.status === 'Published').length;
    const drafts = events.filter((event) => event.status === 'Draft').length;
    const soldOut = events.filter((event) => Number(event.capacity || 0) > 0 && Number(event.registeredCount || 0) >= Number(event.capacity || 0)).length;
    return {
      totalRevenue,
      totalBookings,
      totalCapacity,
      liveEvents,
      drafts,
      soldOut,
      fillRate: totalCapacity ? Math.round((totalBookings / totalCapacity) * 100) : 0,
    };
  }, [events]);

  const lanes = useMemo(
    () => ['Published', 'Draft', 'Completed', 'Cancelled'].map((status) => ({
      status,
      events: events.filter((event) => event.status === status).slice(0, 3),
      count: events.filter((event) => event.status === status).length,
    })),
    [events]
  );

  const remove = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Registrations will remain for audit history.`)) return;
    await deleteEvent(event.id);
  };

  const changeStatus = async (event, status) => {
    await updateEvent(event.id, { status });
  };

  const exportRows = () => {
    downloadCsv(
      'events.csv',
      events.map((event) => ({
        eventId: event.eventId || event.id,
        title: event.title,
        status: event.status,
        category: event.category,
        city: event.city,
        venue: event.venue,
        date: event.startDate,
        registeredCount: event.registeredCount || 0,
        capacity: event.capacity || 0,
        revenue: event.revenue || 0,
        views: event.views || 0,
      }))
    );
  };

  return (
    <AppLayout searchPlaceholder="Search events, ticket inventory, cities, or venues">
      <main className="page-shell management-flow">
        <div className="flow-hero compact">
          <div>
            <span className="eyebrow">Event management</span>
            <h1>Control every event lifecycle from draft to settlement.</h1>
            <p>Publish, pause, duplicate, export, monitor capacity, and jump into a single-event command center.</p>
          </div>
          <div className="hero-actions">
            <button className="ghost-btn" onClick={exportRows}><Download size={16} /> Export</button>
            <Link className="primary-btn" to="/events/new"><Plus size={16} /> Create Event</Link>
          </div>
        </div>

        <section className="ops-metric-grid">
          <div className="ops-metric"><Radio size={18} /><span>Live Events</span><strong>{portfolio.liveEvents}</strong><p>{portfolio.drafts} drafts waiting</p></div>
          <div className="ops-metric"><Users size={18} /><span>Bookings</span><strong>{portfolio.totalBookings}</strong><p>{portfolio.fillRate}% capacity filled</p></div>
          <div className="ops-metric"><BarChart3 size={18} /><span>Revenue</span><strong>{currency(portfolio.totalRevenue)}</strong><p>{portfolio.soldOut} sold out events</p></div>
          <div className="ops-metric"><CalendarDays size={18} /><span>Total Events</span><strong>{events.length}</strong><p>Connected in real time</p></div>
        </section>

        <section className="toolbar enterprise-toolbar">
          <label className="form-field search-field"><span>Search</span><div className="input-icon-wrap"><Search size={16} /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Event name, category, city, venue" /></div></label>
          <label className="form-field"><span>Status</span><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All</option><option>Draft</option><option>Published</option><option>Completed</option><option>Cancelled</option></select></label>
          <label className="form-field"><span>Category</span><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="form-field"><span>Price</span><select value={filters.ticketType} onChange={(e) => setFilters({ ...filters, ticketType: e.target.value })}><option value="">All</option><option>Free</option><option>Paid</option></select></label>
          <button className="ghost-btn" type="button"><Filter size={16} /> Filters</button>
        </section>

        {error && <div className="alert error">{error}</div>}
        {loading ? <LoadingState label="Loading events" /> : (
          <>
            <section className="status-lanes">
              {lanes.map((lane) => (
                <div className="status-lane" key={lane.status}>
                  <div className="lane-head"><strong>{lane.status}</strong><span>{lane.count}</span></div>
                  {lane.events.length ? lane.events.map((event) => (
                    <Link className="lane-card" to={`/events/${event.id}`} key={event.id}>
                      <strong>{event.title}</strong>
                      <p>{formatDate(event.startDate)} · {event.city || 'City not set'}</p>
                      <div className="mini-progress"><span style={{ width: `${Math.min(100, ((event.registeredCount || 0) / Math.max(1, Number(event.capacity || 0))) * 100)}%` }} /></div>
                    </Link>
                  )) : <p className="muted">No events</p>}
                </div>
              ))}
            </section>

            <div className="table-panel enterprise-table-panel">
              {events.length ? (
                <table className="data-table enterprise-table">
                  <thead>
                    <tr><th>Event</th><th>Schedule</th><th>Status</th><th>Inventory</th><th>Commercials</th><th>Flow Actions</th></tr>
                  </thead>
                  <tbody>
                    {events.map((event) => {
                      const capacity = Number(event.capacity || 0);
                      const sold = Number(event.registeredCount || 0);
                      const fill = capacity ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;
                      return (
                        <tr key={event.id}>
                          <td>
                            <div className="event-cell">
                              <img src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=240&q=80'} alt={event.title} />
                              <div>
                                <strong>{event.title}</strong>
                                <p className="muted">{event.category || 'Uncategorized'} · {event.city || 'City not set'}</p>
                                <span className="micro-id">{event.eventId || event.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(event.startDate)}<p className="muted">{event.startTime || 'Start'} - {event.endTime || 'End'}</p></td>
                          <td><span className={`badge ${statusTone[event.status] || 'warning'}`}>{event.status || 'Draft'}</span></td>
                          <td>
                            <strong>{sold} / {capacity || '∞'}</strong>
                            <div className="mini-progress"><span style={{ width: `${fill}%` }} /></div>
                            <p className="muted">{fill}% sold</p>
                          </td>
                          <td><strong>{currency(event.revenue)}</strong><p className="muted">{event.views || 0} views · {event.ticketType || 'Ticket'}</p></td>
                          <td>
                            <div className="action-row">
                              <Link className="ghost-btn" to={`/events/${event.id}`} title="Open control panel"><Eye size={15} /></Link>
                              <Link className="ghost-btn" to={`/events/${event.id}/edit`} title="Quick edit"><Edit size={15} /></Link>
                              <button className="ghost-btn" onClick={() => changeStatus(event, event.status === 'Published' ? 'Draft' : 'Published')}>{event.status === 'Published' ? 'Pause' : 'Publish'}</button>
                              <button className="ghost-btn" onClick={() => duplicateEvent(event)} title="Duplicate"><Copy size={15} /></button>
                              <button className="danger-btn" onClick={() => remove(event)} title="Delete"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <EmptyState title="No events found" message="Create an event or adjust your filters." action={<Link className="primary-btn" to="/events/new">Add Event</Link>} />
              )}
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
};

export default EventList;
