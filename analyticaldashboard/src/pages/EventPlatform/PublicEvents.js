import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import EmptyState from '../../components/States/EmptyState';
import LoadingState from '../../components/States/LoadingState';
import { useEvents } from '../../hooks/useEvents';
import { currency, formatDate } from '../../utils/formatters';
import './EventPlatform.css';
import '../Auth/Auth.css';

const PublicEvents = () => {
  const [filters, setFilters] = useState({ search: '', category: '', city: '', ticketType: '' });
  const { events, loading, error } = useEvents({ status: 'Published', ...filters });
  const categories = useMemo(() => [...new Set(events.map((event) => event.category).filter(Boolean))], [events]);
  const cities = useMemo(() => [...new Set(events.map((event) => event.city).filter(Boolean))], [events]);

  return (
    <AppLayout searchPlaceholder="Search public events">
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>Explore Events</h1>
            <p>Find published events by category, location, date, and ticket type.</p>
          </div>
        </div>
        <section className="toolbar">
          <label className="form-field"><span>Search</span><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Event name or keyword" /></label>
          <label className="form-field"><span>Category</span><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Location</span><select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}><option value="">All</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Free/Paid</span><select value={filters.ticketType} onChange={(e) => setFilters({ ...filters, ticketType: e.target.value })}><option value="">All</option><option>Free</option><option>Paid</option></select></label>
          <button className="secondary-btn"><Search size={16} /> Search</button>
        </section>
        {error && <div className="alert error">{error}</div>}
        {loading ? <LoadingState label="Loading public events" /> : (
          <section className="event-grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <img src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80'} alt={event.title} />
                <div className="event-card-body">
                  <div className="badge-row"><span className="badge success">{event.category}</span><span className="badge">{event.ticketType}</span></div>
                  <h3>{event.title}</h3>
                  <div className="event-meta">
                    <span><Calendar size={14} /> {formatDate(event.startDate)} at {event.startTime}</span>
                    <span><MapPin size={14} /> {event.venue}, {event.city}</span>
                  </div>
                  <p className="muted">{event.description?.slice(0, 120)}{event.description?.length > 120 ? '...' : ''}</p>
                  <div className="inline-row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
                    <strong>{event.ticketType === 'Free' ? 'Free' : currency(event.ticketPrice)}</strong>
                    <Link className="primary-btn" to={`/explore/${event.id}`}>View Details</Link>
                  </div>
                </div>
              </article>
            ))}
            {!events.length && <EmptyState title="No matching events" message="Try a wider search or different filters." />}
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default PublicEvents;
