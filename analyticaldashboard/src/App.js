import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/States/ErrorBoundary';
import ProtectedRoute from './components/RouteGuards/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import EventList from './pages/EventPlatform/EventList';
import EventForm from './pages/EventPlatform/EventForm';
import EventDetailsPage from './pages/EventPlatform/EventDetailsPage';
import PublicEvents from './pages/EventPlatform/PublicEvents';
import Participants from './pages/EventPlatform/Participants';
import Analytics from './pages/EventPlatform/Analytics';
import Profile from './pages/EventPlatform/Profile';
import Unauthorized from './pages/System/Unauthorized';
import NotFound from './pages/System/NotFound';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<Navigate to="/explore" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore" element={<PublicEvents />} />
                <Route path="/explore/:eventId" element={<EventDetailsPage />} />
                <Route path="/events/:eventId" element={<EventDetailsPage />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route element={<ProtectedRoute roles={['Host']} />}>
                <Route path="/events" element={<EventList />} />
                <Route path="/events/new" element={<EventForm />} />
                <Route path="/events/:eventId/edit" element={<EventForm />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
