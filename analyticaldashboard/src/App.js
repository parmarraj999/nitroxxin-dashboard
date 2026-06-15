import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import EventManagement from './pages/EventManagement/EventManagement';
import HostDetail from './pages/HostDetail/HostDetail';
import TicketDetail from './pages/TicketDetail/TicketDetail';
import Payments from './pages/Payments/Payments';
import Reports from './pages/Reports/Reports';
import EventDetails from './pages/EventDetails/EventDetails';
import MonsoonExpedition from './pages/MonsoonExpedition/MonsoonExpedition';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventManagement />} />
          <Route path="/hosts" element={<HostDetail />} />
          <Route path="/tickets" element={<TicketDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/events/details" element={<EventDetails />} />
          <Route path="/events/monsoon" element={<MonsoonExpedition />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
