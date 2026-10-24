import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/States/ErrorBoundary';
import LoadingState from './components/States/LoadingState';
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
import ApprovalPending from './pages/Auth/ApprovalPending';
import Transactions from './pages/Transactions/Transactions';
import EventCheckInMobile from './pages/EventPlatform/EventCheckInMobile';
import './App.css';

/**
 * Root route handler:
 * - Checks memory login session immediately.
 * - If user logged in previously, automatically navigates to /dashboard or /approval-pending.
 * - If no session in memory, navigates to /login.
 */
const RootRedirect = () => {
  const { isAuthenticated, loading, hostStatus } = useAuth();

  if (loading) {
    return <LoadingState label="Restoring your session..." fullPage />;
  }

  if (isAuthenticated) {
    if (hostStatus === 'Pending' || hostStatus === 'Rejected') {
      return <Navigate to="/approval-pending" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/approval-pending" element={<ApprovalPending />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/events-preview" element={<EventList />} />
                <Route path="/participants-preview" element={<Participants />} />
                <Route path="/dashboard-preview" element={<Dashboard />} />
                <Route path="/transactions-preview" element={<Transactions />} />
                <Route path="/profile-preview" element={<Profile />} />
                <Route path="/events/:eventId/checkin" element={<EventCheckInMobile />} />
                <Route path="/checkin/:eventId" element={<EventCheckInMobile />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/explore" element={<PublicEvents />} />
                  <Route path="/explore/:eventId" element={<EventDetailsPage />} />
                  <Route path="/events/:eventId" element={<EventDetailsPage />} />
                  <Route path="/transactions" element={<Transactions />} />
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
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
