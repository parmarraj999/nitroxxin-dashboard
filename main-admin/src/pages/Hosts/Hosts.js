import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import './Hosts.css';

export default function Hosts() {
  const navigate = useNavigate();
  const [hosts, setHosts] = useState([]);
  console.log(hosts )
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real-time listener for event_host collection
  useEffect(() => {
    const q = query(collection(db, 'event_host'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching event_host collection:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to events collection to compute event counts per host
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching events for host counts:', err);
    });
    return () => unsubscribe();
  }, []);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filter hosts based on search query
  const filteredHosts = useMemo(() => {
    const term = search.toLowerCase();
    return hosts.filter((host) => {
      const name = host.fullName || '';
      const email = host.email || host.contactEmail || host.hostEmail || '';
      const phone = host.phone || host.phoneNumber || host.contactPhone || host.hostPhone || '';
      const city = host.city || host.location || host.address || '';
      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term)
      );
    });
  }, [hosts, search]);

  const paginatedHosts = filteredHosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Helper to count events for a host
  const getHostEventsCount = (host) => {
    if (host.totalEvents !== undefined) return host.totalEvents;
    if (host.eventsCount !== undefined) return host.eventsCount;
    if (Array.isArray(host.events)) return host.events.length;
    return events.filter(
      (e) => e.hostId === host.id || e.organizerId === host.id || (e.hostName && e.hostName === (host.name || host.displayName))
    ).length;
  };

  return (
    <div className="hosts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Hosts</h1>
          <p className="page-subtitle">Manage organizers, verified community leaders, contact info, and hosted events.</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="hosts-metrics">
        <div className="hosts-metric card">
          <div className="metric-header">
            <Users size={20} className="icon-blue" />
            <span>Total Hosts</span>
          </div>
          <strong>{loading ? '...' : hosts.length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <ShieldCheck size={20} className="icon-green" />
            <span>Active / Verified</span>
          </div>
          <strong>{loading ? '...' : hosts.filter((h) => (h.status || 'active') === 'active' || h.verified).length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <Calendar size={20} className="icon-purple" />
            <span>Total Events</span>
          </div>
          <strong>{loading ? '...' : events.length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <MapPin size={20} className="icon-orange" />
            <span>Host Locations</span>
          </div>
          <strong>
            {loading ? '...' : new Set(hosts.map((h) => h.city || h.location).filter(Boolean)).size || 1}
          </strong>
        </div>
      </div>

      <div className="hosts-layout">
        {/* Main List */}
        <div className="hosts-main-list card">
          <div className="table-toolbar">
            <div className="search-wrapper">
              <Search size={16} className="search-icon-small" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search hosts by name, email, phone, or city..." 
              />
            </div>
          </div>

          {loading ? (
            <div className="state-container">Loading hosts from event_host...</div>
          ) : filteredHosts.length === 0 ? (
            <div className="state-container empty-state">
              <Users size={40} className="text-muted" />
              <h3>No hosts found</h3>
              <p>Documents added to the <code>event_host</code> collection will appear here.</p>
            </div>
          ) : (
            <>
              <div className="hosts-table-wrap">
                <table className="hosts-table">
                  <thead>
                    <tr>
                      <th>HOST</th>
                      <th>CONTACT INFO</th>
                      <th>LOCATION</th>
                      <th>EVENTS</th>
                      <th>STATUS</th>
                      <th className="actions-col">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHosts.map((host) => {
                      const name = host.fullName || 'Unnamed Host';
                      const email = host.email || host.contactEmail || host.hostEmail || '-';
                      const phone = host.phone || host.phoneNumber || host.contactPhone || host.hostPhone || '';
                      const photo = host.photoURL || host.profilePhoto || host.photo || host.imageUrl || host.avatar;
                      const city = host.city || host.location || host.address || '-';
                      const status = host.status || (host.verified ? 'verified' : 'active');
                      const eventsCount = getHostEventsCount(host);

                      return (
                        <tr 
                          key={host.id} 
                          className="host-row"
                          onClick={() => navigate(`/events/hosts/${host.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="host-profile-cell">
                              {photo ? (
                                <img src={photo} alt={name} className="host-avatar-sm" />
                              ) : (
                                <div className="host-avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                              )}
                              <div>
                                <span className="host-name-bold">{name}</span>
                                {host.bio && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {host.bio}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-details">
                              <span className="contact-item"><Mail size={12} /> {email}</span>
                              {phone && <span className="contact-item"><Phone size={12} /> {phone}</span>}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-main)' }}>
                              <MapPin size={13} color="var(--text-muted)" />
                              <span>{city}</span>
                            </div>
                          </td>
                          <td>
                            <strong>{eventsCount}</strong>
                          </td>
                          <td>
                            <span className={`management-badge ${status}`}>
                              {status}
                            </span>
                          </td>
                          <td className="actions-col">
                            <button className="icon-btn-chevron" title="View Host Details">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={currentPage}
                totalItems={filteredHosts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
