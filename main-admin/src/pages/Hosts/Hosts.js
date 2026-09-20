import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  Ticket, 
  IndianRupee, 
  Mail, 
  Phone, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import './Hosts.css';

export default function Hosts() {
  const navigate = useNavigate();
  const { cache, subscribeToModule } = useDataContext();
  const [search, setSearch] = useState('');

  // Subscribe to required collections
  useEffect(() => {
    subscribeToModule('all-events', 'events', []);
    subscribeToModule('all-bookings', 'event_bookings', []);
    subscribeToModule('all-participants', 'event_participants', []);
  }, [subscribeToModule]);

  // Read raw collections
  const rawEvents = cache['all-events-[]']?.data || [];
  const rawBookings = cache['all-bookings-[]']?.data || [];

  const loading = cache['all-events-[]']?.loading || cache['all-bookings-[]']?.loading;

  // Aggregate hosts data
  const hosts = useMemo(() => {
    const hostsMap = {};

    rawEvents.forEach((event) => {
      const hostId = event.hostId || event.organizerId || event.vendorId || 'nitroxx-default-vendor';
      const hostName = event.hostName || event.organizerName || (hostId === 'nitroxx-default-vendor' ? 'Nitroxx Main' : 'Nitroxx Partner');
      const hostPhoto = event.hostPhotoURL || event.organizerPhoto || '';

      if (!hostsMap[hostId]) {
        hostsMap[hostId] = {
          id: hostId,
          name: hostName,
          photo: hostPhoto,
          email: event.hostEmail || `${hostName.toLowerCase().replace(/[^a-z0-9]/g, '')}@nitroxxin.com`,
          phone: event.hostPhone || '+91 98765 00000',
          events: [],
          bookings: [],
          revenue: 0,
          ticketsBooked: 0,
        };
      }

      hostsMap[hostId].events.push(event);
    });

    // Add bookings & calculate statistics
    rawBookings.forEach((booking) => {
      const event = rawEvents.find(e => e.id === booking.eventId || e.name === booking.eventName);
      if (event) {
        const hostId = event.hostId || event.organizerId || event.vendorId || 'nitroxx-default-vendor';
        if (hostsMap[hostId]) {
          hostsMap[hostId].bookings.push(booking);
          hostsMap[hostId].revenue += Number(booking.amount || booking.totalAmount || 0);
          hostsMap[hostId].ticketsBooked += Number(booking.tickets || booking.ticketCount || 1);
        }
      }
    });

    return Object.values(hostsMap);
  }, [rawEvents, rawBookings]);

  // Filter hosts based on search query
  const filteredHosts = useMemo(() => {
    return hosts.filter(host => 
      host.name.toLowerCase().includes(search.toLowerCase()) ||
      host.email.toLowerCase().includes(search.toLowerCase()) ||
      host.phone.toLowerCase().includes(search.toLowerCase())
    );
  }, [hosts, search]);

  return (
    <div className="hosts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Hosts</h1>
          <p className="page-subtitle">Manage organizers, track ticket sales, audit payouts, and monitor check-in activities.</p>
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
            <Calendar size={20} className="icon-purple" />
            <span>Total Events</span>
          </div>
          <strong>{loading ? '...' : rawEvents.length}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <Ticket size={20} className="icon-green" />
            <span>Tickets Sold</span>
          </div>
          <strong>{loading ? '...' : rawBookings.reduce((sum, b) => sum + Number(b.tickets || b.ticketCount || 1), 0)}</strong>
        </div>
        <div className="hosts-metric card">
          <div className="metric-header">
            <IndianRupee size={20} className="icon-orange" />
            <span>Marketplace Volume</span>
          </div>
          <strong>₹{loading ? '...' : rawBookings.reduce((sum, b) => sum + Number(b.amount || b.totalAmount || 0), 0).toLocaleString()}</strong>
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
                placeholder="Search hosts by name, email, or phone..." 
              />
            </div>
          </div>

          {loading ? (
            <div className="state-container">Loading hosts...</div>
          ) : filteredHosts.length === 0 ? (
            <div className="state-container empty-state">
              <Users size={40} className="text-muted" />
              <h3>No hosts found</h3>
              <p>Add events with unique host details to view them here.</p>
            </div>
          ) : (
            <div className="hosts-table-wrap">
              <table className="hosts-table">
                <thead>
                  <tr>
                    <th>HOST</th>
                    <th>CONTACT INFO</th>
                    <th>EVENTS</th>
                    <th>TICKETS SOLD</th>
                    <th>TOTAL REVENUE</th>
                    <th className="actions-col">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHosts.map((host) => (
                    <tr 
                      key={host.id} 
                      className="host-row"
                      onClick={() => navigate(`/events/hosts/${host.id}`)}
                    >
                      <td>
                        <div className="host-profile-cell">
                          {host.photo ? (
                            <img src={host.photo} alt={host.name} className="host-avatar-sm" />
                          ) : (
                            <div className="host-avatar-placeholder">{host.name.charAt(0)}</div>
                          )}
                          <span className="host-name-bold">{host.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-details">
                          <span className="contact-item"><Mail size={12} /> {host.email}</span>
                          <span className="contact-item"><Phone size={12} /> {host.phone}</span>
                        </div>
                      </td>
                      <td>{host.events.length}</td>
                      <td>{host.ticketsBooked}</td>
                      <td><span className="revenue-value">₹{host.revenue.toLocaleString()}</span></td>
                      <td className="actions-col">
                        <button className="icon-btn-chevron">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
