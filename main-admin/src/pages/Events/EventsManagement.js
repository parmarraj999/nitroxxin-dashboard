import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  Star 
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

export default function EventsManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real-time listener for events collection
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching events:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Reset page to 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Star toggle for hero slider / featured section
  const toggleFeatured = async (event, e) => {
    e.stopPropagation();
    try {
      const nextVal = !event.featuredForYou;
      await updateDoc(doc(db, 'events', event.id), { featuredForYou: nextVal });
    } catch (err) {
      console.error('Error updating featured status:', err);
    }
  };

  // Delete event with confirmation
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  // Filter events by search & status
  const visibleEvents = events.filter((ev) => {
    const term = search.toLowerCase();
    const eventTitle = ev.title || ev.name || '';
    const eventVenue = ev.venue || '';
    const eventCategory = ev.category || '';
    const matchesSearch = 
      eventTitle.toLowerCase().includes(term) ||
      eventVenue.toLowerCase().includes(term) ||
      eventCategory.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated events
  const paginatedEvents = visibleEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Management</h1>
          <p className="page-subtitle">Manage motorcycle rides, rallies, track days, and community tours.</p>
        </div>
        <div className="header-actions-main">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/events/create')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Events</span>
          <strong>{loading ? '...' : events.length}</strong>
        </div>
        <div className="management-metric">
          <span>Published</span>
          <strong>{events.filter((e) => e.status === 'published').length}</strong>
        </div>
        <div className="management-metric">
          <span>Drafts</span>
          <strong>{events.filter((e) => e.status === 'draft').length}</strong>
        </div>
        <div className="management-metric">
          <span>Featured on Web</span>
          <strong>{events.filter((e) => e.featuredForYou).length}</strong>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="management-toolbar">
          <div className="search-wrapper enterprise-search">
            <Search size={16} className="search-icon-small" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search event title, venue, or category..." 
            />
          </div>

          <div className="management-select-wrapper">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="enterprise-state">Loading events...</div>
        ) : visibleEvents.length === 0 ? (
          <div className="enterprise-state">
            <ClipboardCheck size={32} />
            <h3>No events found</h3>
            <p>Create your first event or adjust your search filter.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>★</th>
                    <th>Event Name</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Ticket Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((ev) => (
                    <tr key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button"
                          className={`star-btn ${ev.featuredForYou ? 'active' : ''}`}
                          onClick={(e) => toggleFeatured(ev, e)}
                          title={ev.featuredForYou ? 'Remove from Web Hero' : 'Add to Web Hero'}
                        >
                          <Star size={16} fill={ev.featuredForYou ? '#eab308' : 'none'} stroke={ev.featuredForYou ? '#eab308' : '#9ca3af'} />
                        </button>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{ev.title || ev.name || 'Untitled Event'}</strong>
                        {ev.category && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.category}</div>}
                      </td>
                      <td>{ev.venue || '-'}</td>
                      <td>{ev.startDate || ev.eventDate || ev.date || '-'}</td>
                      <td>₹{Number(ev.ticketPrice || 0).toLocaleString()}</td>
                      <td>{ev.capacity ? `${ev.capacity} riders` : '-'}</td>
                      <td>
                        <span className={`management-badge ${ev.status || 'draft'}`}>
                          {ev.status || 'draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button 
                            className="icon-btn" 
                            title="View Details"
                            onClick={() => navigate(`/events/${ev.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="icon-btn text-danger" 
                            title="Delete Event"
                            onClick={(e) => handleDelete(ev.id, e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalItems={visibleEvents.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
