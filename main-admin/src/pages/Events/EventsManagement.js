import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Star, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import './EventsManagement.css';

// Default high-quality fallback artwork matching the reference screenshot
const DEFAULT_EVENT_IMG = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';

// Sample events that faithfully replicate the exact layout shown in reference screenshot
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    name: 'Festival Joy Winter Tour',
    title: 'Festival Joy Winter Tour',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Skyline Stadium',
    category: 'Rally & Festival',
    eventDate: '2026-11-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    featuredForYou: true
  },
  {
    id: 'demo-2',
    name: 'Festival Joy',
    title: 'Festival Joy',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Skyline Stadium',
    category: 'Rally & Festival',
    eventDate: '2025-03-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    featuredForYou: false
  },
  {
    id: 'demo-3',
    name: 'Festival Joy',
    title: 'Festival Joy',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Grand Amphitheater',
    category: 'Concert & Tour',
    eventDate: '2025-02-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80',
    featuredForYou: false
  },
  {
    id: 'demo-4',
    name: 'Festival Joy',
    title: 'Festival Joy',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Grand Amphitheater',
    category: 'Concert & Tour',
    eventDate: '2025-02-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    featuredForYou: false
  },
  {
    id: 'demo-5',
    name: 'Festival Joy',
    title: 'Festival Joy',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Sunset Arena',
    category: 'Music Festival',
    eventDate: '2025-01-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    featuredForYou: false
  },
  {
    id: 'demo-6',
    name: 'Festival Joy',
    title: 'Festival Joy',
    description: 'Feel the magic of Festival Joy! 💥✨',
    venue: 'Sunset Arena',
    category: 'Music Festival',
    eventDate: '2025-01-23',
    capacity: 20,
    soldCount: 16,
    ticketPrice: 65,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    featuredForYou: false
  }
];

// Helper to safely parse dates avoiding timezone offsets
const parseEventDate = (ev) => {
  const raw = ev.startDate || ev.eventDate || ev.date || ev.endDate || ev.createdAt;
  if (!raw) return new Date();
  if (typeof raw?.toDate === 'function') return raw.toDate();
  if (raw?.seconds) return new Date(raw.seconds * 1000);
  if (typeof raw === 'string') {
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Check if an event date is complete (has passed the current date/time)
const isEventComplete = (ev) => {
  const s = (ev.status || '').toLowerCase();
  if (s === 'completed' || s === 'complete') return true;
  if (s === 'cancelled') return false;

  // Use endDate if available, otherwise startDate/eventDate
  const rawDate = ev.endDate || ev.startDate || ev.eventDate || ev.date;
  if (!rawDate) return false;

  let targetDate;
  if (typeof rawDate?.toDate === 'function') {
    targetDate = rawDate.toDate();
  } else if (rawDate?.seconds) {
    targetDate = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      targetDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    } else {
      targetDate = new Date(rawDate);
    }
  } else {
    targetDate = new Date(rawDate);
  }

  if (isNaN(targetDate.getTime())) return false;

  // End of that day (23:59:59)
  const eventEnd = new Date(targetDate);
  eventEnd.setHours(23, 59, 59, 999);

  // If specific end time is specified
  if (ev.endTime && typeof ev.endTime === 'string') {
    const [h, m] = ev.endTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      eventEnd.setHours(h, m, 0, 0);
    }
  }

  return eventEnd.getTime() < Date.now();
};

// SVG Crimson Pie Chart Indicator matching screenshot
const SoldPieIndicator = ({ sold = 16, total = 20 }) => {
  const safeTotal = total > 0 ? total : 20;
  const pct = Math.min(100, Math.max(0, (sold / safeTotal) * 100));
  // Circle circumference with r=8 is 2 * PI * 8 = 50.265
  const circumference = 50.265;
  const strokeDash = (pct / 100) * circumference;

  return (
    <svg width="18" height="18" viewBox="0 0 32 32" className="event-pie-svg" aria-hidden="true">
      {/* Background circle track */}
      <circle cx="16" cy="16" r="8" fill="none" stroke="#ffe4e6" strokeWidth="16" />
      {/* Crimson filled wedge */}
      <circle
        cx="16"
        cy="16"
        r="8"
        fill="none"
        stroke="#e11d48"
        strokeWidth="16"
        strokeDasharray={`${strokeDash} ${circumference}`}
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
};

// Date Badge component (e.g. Jan 23), colored green when event is complete
const DateBadge = ({ date, isComplete }) => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return (
    <div className={`event-date-badge ${isComplete ? 'is-complete' : ''}`}>
      <span className="event-badge-month">{month}</span>
      <span className="event-badge-day">{day}</span>
    </div>
  );
};

export default function EventsManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);

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

  // Star toggle for hero slider / featured section
  const toggleFeatured = async (event, e) => {
    e.stopPropagation();
    if (event.id && event.id.startsWith('demo-')) {
      setEvents((prev) => 
        prev.length ? prev.map((ev) => ev.id === event.id ? { ...ev, featuredForYou: !ev.featuredForYou } : ev)
        : DEMO_EVENTS.map((ev) => ev.id === event.id ? { ...ev, featuredForYou: !ev.featuredForYou } : ev)
      );
      return;
    }
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
      if (id.startsWith('demo-')) {
        alert('This is a demo preview event.');
        return;
      }
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  // Seed sample demo events into Firestore if collection is empty
  const handleSeedDemoEvents = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      for (const ev of DEMO_EVENTS) {
        await addDoc(collection(db, 'events'), {
          name: ev.title,
          category: ev.category,
          venue: ev.venue,
          eventDate: ev.eventDate,
          startDate: ev.eventDate,
          ticketPrice: ev.ticketPrice,
          capacity: ev.capacity,
          soldCount: ev.soldCount,
          status: ev.status,
          imageUrl: ev.imageUrl,
          description: ev.description,
          featuredForYou: ev.featuredForYou,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Failed to seed events:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Format Gross Price: Rupees (₹) for real events or $ for demo events
  const formatGross = (ev) => {
    const price = Number(ev.ticketPrice);
    if (!isNaN(price) && price > 0) {
      if (ev.currency === '$' || (ev.id && ev.id.startsWith('demo-'))) {
        return `$${price.toFixed(2)}`;
      }
      return `₹${price.toLocaleString()}`;
    }
    return ev.id && ev.id.startsWith('demo-') ? '$65.00' : '₹0.00';
  };

  // Export CSV for a specific month
  const handleExportCsv = (eventsToExport, monthTitle, e) => {
    if (e) e.stopPropagation();
    if (!eventsToExport || eventsToExport.length === 0) return;

    const filename = `${monthTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_events.csv`;
    const headers = ['Event Name', 'Category', 'Venue', 'Date', 'Capacity', 'Sold', 'Gross', 'Status'];
    const rows = eventsToExport.map((ev) => {
      const d = parseEventDate(ev);
      const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const sold = ev.soldCount !== undefined ? ev.soldCount : (ev.registeredCount !== undefined ? ev.registeredCount : 16);
      const capacity = Number(ev.capacity) || 20;
      const gross = formatGross(ev);
      const statusLabel = isEventComplete(ev) ? 'Complete' : (ev.status || 'draft');
      return [
        `"${(ev.title || ev.name || 'Untitled').replace(/"/g, '""')}"`,
        `"${(ev.category || '').replace(/"/g, '""')}"`,
        `"${(ev.venue || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        capacity,
        sold,
        `"${gross}"`,
        `"${statusLabel}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Status pill with distinctive colors for Complete, Published, Draft, Cancelled
  const renderStatus = (ev) => {
    const isComplete = isEventComplete(ev);
    const s = (ev.status || 'draft').toLowerCase();

    if (s === 'cancelled') {
      return (
        <span className="event-status-pill cancelled">
          <XCircle size={12} strokeWidth={2.4} />
          <span>Cancelled</span>
        </span>
      );
    }

    if (isComplete) {
      return (
        <span className="event-status-pill complete">
          <CheckCircle2 size={12} strokeWidth={2.5} />
          <span>Complete</span>
        </span>
      );
    }

    if (s === 'published' || s === 'live' || s === 'active') {
      return (
        <span className="event-status-pill published">
          <Clock size={12} strokeWidth={2.4} />
          <span>Published</span>
        </span>
      );
    }

    return (
      <span className="event-status-pill draft">
        <FileText size={12} strokeWidth={2.4} />
        <span>Draft</span>
      </span>
    );
  };

  // Base list: use Firestore if available, otherwise DEMO_EVENTS for instant visual fidelity
  const isUsingDemo = !loading && events.length === 0;
  const sourceList = events.length > 0 ? events : (loading ? [] : DEMO_EVENTS);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return sourceList.filter((ev) => {
      const term = search.toLowerCase();
      const title = ev.title || ev.name || '';
      const venue = ev.venue || '';
      const cat = ev.category || '';
      const desc = ev.description || '';
      const matchesSearch = 
        title.toLowerCase().includes(term) ||
        venue.toLowerCase().includes(term) ||
        cat.toLowerCase().includes(term) ||
        desc.toLowerCase().includes(term);

      const complete = isEventComplete(ev);
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'complete' && complete) ||
        (statusFilter === 'published' && !complete && (ev.status || '').toLowerCase() === 'published') ||
        (statusFilter === 'draft' && !complete && (ev.status || 'draft').toLowerCase() === 'draft') ||
        (statusFilter === 'cancelled' && (ev.status || '').toLowerCase() === 'cancelled');

      return matchesSearch && matchesStatus;
    });
  }, [sourceList, search, statusFilter]);

  // Group events by Month & Year, arranged from NEW to OLD (descending)
  const groupedMonths = useMemo(() => {
    const groups = {};
    filteredEvents.forEach((ev) => {
      const d = parseEventDate(ev);
      const title = `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
      const sortVal = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      if (!groups[title]) {
        groups[title] = {
          title,
          timestamp: sortVal,
          events: []
        };
      }
      groups[title].events.push(ev);
    });

    // Arrange from NEW to OLD:
    // 1. Month groups descending by timestamp
    // 2. Events within each month descending by date
    return Object.values(groups)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((group) => ({
        ...group,
        events: [...group.events].sort(
          (a, b) => parseEventDate(b).getTime() - parseEventDate(a).getTime()
        )
      }));
  }, [filteredEvents]);

  // Stats calculation
  const totalCount = sourceList.length;
  const completedCount = sourceList.filter(isEventComplete).length;
  const publishedCount = sourceList.filter((e) => !isEventComplete(e) && (e.status || '').toLowerCase() === 'published').length;
  const draftCount = sourceList.filter((e) => !isEventComplete(e) && (e.status || 'draft').toLowerCase() === 'draft').length;
  const featuredCount = sourceList.filter((e) => e.featuredForYou).length;

  return (
    <div className="events-mgmt-page">
      {/* Top Header */}
      <div className="events-header">
        <div>
          <h1 className="events-title">Event Management</h1>
          <p className="events-subtitle">Manage upcoming rides, track sessions, rallies, and festival joy tours.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUsingDemo && (
            <button
              type="button"
              className="export-csv-btn"
              onClick={handleSeedDemoEvents}
              disabled={seeding}
              title="Add these preview demo events to Firestore database"
            >
              <Sparkles size={14} color="#ff6b00" />
              <span>{seeding ? 'Seeding...' : 'Save Demo Events to DB'}</span>
            </button>
          )}
          <button 
            type="button"
            className="create-event-btn" 
            onClick={() => navigate('/events/create')}
          >
            <Plus size={16} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="events-metrics-row">
        <div className="event-metric-card">
          <span>Total Events</span>
          <strong>{loading ? '...' : totalCount}</strong>
        </div>
        <div className="event-metric-card">
          <span>Complete</span>
          <strong style={{ color: '#047857' }}>{loading ? '...' : completedCount}</strong>
        </div>
        <div className="event-metric-card">
          <span>Published</span>
          <strong>{loading ? '...' : publishedCount}</strong>
        </div>
        <div className="event-metric-card">
          <span>Drafts</span>
          <strong>{loading ? '...' : draftCount}</strong>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="events-controls-card">
        <div className="events-search-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event name, venue, category..."
          />
        </div>

        <div className="events-filter-tabs">
          <button
            type="button"
            className={`event-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`event-tab-btn ${statusFilter === 'complete' ? 'active' : ''}`}
            onClick={() => setStatusFilter('complete')}
          >
            Complete ({completedCount})
          </button>
          <button
            type="button"
            className={`event-tab-btn ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            className={`event-tab-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({draftCount})
          </button>
          <button
            type="button"
            className={`event-tab-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="events-empty-card">
          <Calendar size={36} color="#94a3b8" style={{ animation: 'pulse 1.5s infinite' }} />
          <h3>Loading events...</h3>
          <p>Fetching scheduled events from database.</p>
        </div>
      ) : groupedMonths.length === 0 ? (
        <div className="events-empty-card">
          <Calendar size={36} color="#94a3b8" />
          <h3>No events match your criteria</h3>
          <p>Try searching for a different keyword or adjusting the status filter.</p>
        </div>
      ) : (
        <div className="events-month-groups-container">
          {groupedMonths.map((group) => (
            <div key={group.title} className="events-month-group">
              {/* Month Header with Export CSV button matching screenshot */}
              <div className="events-month-header">
                <h2 className="events-month-title">{group.title}</h2>
                <button
                  type="button"
                  className="export-csv-btn"
                  onClick={(e) => handleExportCsv(group.events, group.title, e)}
                  title={`Export CSV for ${group.title}`}
                >
                  <Download size={13} strokeWidth={2.2} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Event Cards List (Arranged New to Old) */}
              <div className="events-cards-list">
                {group.events.map((ev) => {
                  const date = parseEventDate(ev);
                  const isComplete = isEventComplete(ev);
                  const title = (ev.title || ev.name || 'Untitled Event').trim();
                  const venueCategory = [ev.venue, ev.category || ev.subCategory].filter(Boolean).join(' · ');
                  const subtitle = ev.description 
                    ? ev.description.split('\n')[0] 
                    : (venueCategory || 'Feel the magic of Festival Joy! 💥✨');
                  
                  const sold = Number(
                    ev.soldCount !== undefined 
                      ? ev.soldCount 
                      : (ev.registeredCount !== undefined ? ev.registeredCount : (ev.id?.startsWith('demo-') ? 16 : 0))
                  );
                  const total = Number(ev.capacity) || 20;

                  // High-quality artwork from real Firestore fields or fallback
                  const eventImg = 
                    ev.thumbnailImage || 
                    ev.imageUrl || 
                    ev.bannerImage || 
                    (Array.isArray(ev.galleryImages) && ev.galleryImages[0]) || 
                    DEFAULT_EVENT_IMG;

                  return (
                    <div
                      key={ev.id}
                      className={`event-row-card ${isComplete ? 'is-complete' : ''}`}
                      onClick={() => {
                        if (!ev.id.startsWith('demo-')) {
                          navigate(`/events/${ev.id}`);
                        }
                      }}
                    >
                      {/* 1. Date Badge (Rose for upcoming/draft, Emerald Green when complete) */}
                      <DateBadge date={date} isComplete={isComplete} />

                      {/* 2. Thumbnail Artwork */}
                      <div className="event-thumb-wrap">
                        <img
                          src={eventImg}
                          alt={title}
                          className="event-thumb-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_EVENT_IMG;
                          }}
                        />
                      </div>

                      {/* 3. Title & Subtitle */}
                      <div className="event-info-col">
                        <h3 className="event-card-title">{title}</h3>
                        <p className="event-card-subtitle">{subtitle}</p>
                      </div>

                      {/* 4. Sold Column */}
                      <div className="event-column-cell event-sold-col">
                        <span className="event-column-label">Sold</span>
                        <div className="event-sold-metric">
                          <SoldPieIndicator sold={sold} total={total} />
                          <span className="event-sold-text">
                            <strong>{sold}</strong> / {total}
                          </span>
                        </div>
                      </div>

                      {/* 5. Gross Column */}
                      <div className="event-column-cell event-gross-col">
                        <span className="event-column-label">Gross</span>
                        <span className="event-gross-val">{formatGross(ev)}</span>
                      </div>

                      {/* 6. Status Column (Shows Complete with Green color if date passed) */}
                      <div className="event-column-cell event-status-col">
                        <span className="event-column-label">Status</span>
                        {renderStatus(ev)}
                      </div>

                      {/* 7. Actions Column */}
                      <div className="event-column-cell event-actions-col">
                        <span className="event-column-label">Actions</span>
                        <div className="event-actions-row">
                          <button
                            type="button"
                            className="event-icon-btn"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!ev.id.startsWith('demo-')) {
                                navigate(`/events/${ev.id}`);
                              } else {
                                alert(`Viewing "${title}" details.`);
                              }
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="event-icon-btn"
                            title="Edit Event"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!ev.id.startsWith('demo-')) {
                                navigate(`/events/${ev.id}`);
                              } else {
                                alert(`Edit "${title}"`);
                              }
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="event-icon-btn btn-danger"
                            title="Delete Event"
                            onClick={(e) => handleDelete(ev.id, e)}
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="event-star-btn"
                            title={ev.featuredForYou ? 'Remove from Web Hero' : 'Add to Web Hero'}
                            onClick={(e) => toggleFeatured(ev, e)}
                          >
                            <Star
                              size={15}
                              fill={ev.featuredForYou ? '#eab308' : 'none'}
                              stroke={ev.featuredForYou ? '#eab308' : '#94a3b8'}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
