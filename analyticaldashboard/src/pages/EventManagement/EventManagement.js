import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import EventTable from '../../components/EventTable/EventTable';
import { Download, SlidersHorizontal, Plus, Search, ChevronDown, Calendar } from 'lucide-react';
import './EventManagement.css';

const EventManagement = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header 
          searchPlaceholder="Search events, riders, or transactions..."
          showProfile={false}
          showQuickCreate={true}
        />

        <main className="event-management-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Event Management</h1>
              <p className="page-subtitle">Review, moderate and manage the pulse of Nitroxx community rides.</p>
            </div>

            <div className="header-actions">
              <button className="outline-btn">
                <Download size={18} />
                Export
              </button>
              <button className="outline-btn">
                <SlidersHorizontal size={18} />
                View Settings
              </button>
            </div>
          </div>

          <div className="tabs-container">
            <div className="tab active">
              Pending <span className="tab-badge">12</span>
            </div>
            <div className="tab">Approved</div>
            <div className="tab">Draft</div>
            <div className="tab">Processing</div>
            <div className="tab">Live</div>
            <div className="tab">Completed</div>
            <div className="tab">Cancelled</div>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <div className="filter-input-wrapper">
                <Search size={16} className="filter-icon" />
                <input type="text" placeholder="Filter by title or ID..." className="filter-input" />
              </div>

              <div className="filter-select-wrapper">
                <select className="filter-select">
                  <option>All Categories</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>

              <div className="filter-date-wrapper">
                <input type="text" placeholder="Date Range" className="filter-date" readOnly />
                <Calendar size={16} className="date-icon" />
              </div>
            </div>

            <button className="apply-filter-btn">
              Apply Filter
            </button>
          </div>

          <div className="table-wrapper">
            <EventTable />
          </div>

          <button className="fab-btn-orange">
            <Plus size={24} />
          </button>
        </main>
      </div>
    </div>
  );
};

export default EventManagement;
