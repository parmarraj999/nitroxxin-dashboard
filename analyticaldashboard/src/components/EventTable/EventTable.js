import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './EventTable.css';

const eventsData = [
  {
    id: 'NX-4902',
    bannerColor: '#1e293b', // Dark background placeholder
    title: 'Midnight City Run',
    organizerInitials: 'SM',
    organizerColor: '#dbeafe', // light blue
    organizerText: '#2563eb', // blue
    organizerName: 'Shadow Moto Club',
    category: 'Night Ride',
    city: 'Tokyo, JP',
    price: '$45.00',
    status: 'PENDING'
  },
  {
    id: 'NX-4891',
    bannerColor: '#475569',
    title: 'Rocky Ridge Pursuit',
    organizerInitials: 'AA',
    organizerColor: '#e0e7ff', // light indigo
    organizerText: '#4f46e5', // indigo
    organizerName: 'Apex Adventures',
    category: 'Cross Country',
    city: 'Denver, USA',
    price: '$120.00',
    status: 'PENDING'
  },
  {
    id: 'NX-4877',
    bannerColor: '#334155',
    title: 'Redline Sprint Qualifiers',
    organizerInitials: 'RT',
    organizerColor: '#ffedd5', // light orange
    organizerText: '#ea580c', // orange
    organizerName: 'Redline Tracks',
    category: 'Race Day',
    city: 'Monza, IT',
    price: '$250.00',
    status: 'PENDING'
  },
  {
    id: 'NX-4865',
    bannerColor: '#0f172a',
    title: 'Pacific Coast Wanderer',
    organizerInitials: 'NH',
    organizerColor: '#e0e7ff',
    organizerText: '#4f46e5',
    organizerName: 'Nomad Hub',
    category: 'Tourism',
    city: 'Malibu, USA',
    price: '$75.00',
    status: 'PENDING'
  }
];

const EventTable = () => {
  return (
    <div className="event-table-container">
      <table className="event-table">
        <thead>
          <tr>
            <th>EVENT ID</th>
            <th>BANNER</th>
            <th>TITLE</th>
            <th>ORGANIZER</th>
            <th>CATEGORY</th>
            <th>CITY & PRICE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {eventsData.map((event, index) => (
            <tr key={index}>
              <td className="event-id">{event.id}</td>
              <td>
                <div 
                  className="event-banner-placeholder" 
                  style={{ backgroundColor: event.bannerColor }}
                ></div>
              </td>
              <td className="event-title">{event.title}</td>
              <td>
                <div className="organizer-cell">
                  <div 
                    className="organizer-avatar"
                    style={{ backgroundColor: event.organizerColor, color: event.organizerText }}
                  >
                    {event.organizerInitials}
                  </div>
                  <span className="organizer-name">{event.organizerName}</span>
                </div>
              </td>
              <td>
                <span className="category-badge">{event.category}</span>
              </td>
              <td>
                <div className="city-price-cell">
                  <span className="city-text">{event.city}</span>
                  <span className="price-text">{event.price}</span>
                </div>
              </td>
              <td>
                <span className="status-badge-pending">{event.status}</span>
              </td>
              <td>
                {/* Actions column empty in design */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="table-footer">
        <span className="showing-text">Showing 1-4 of 12 pending events</span>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="pagination-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventTable;
