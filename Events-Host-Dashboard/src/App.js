import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/States/ErrorBoundary';
import LoadingState from './components/States/LoadingState';
import ProtectedRoute from './components/RouteGuards/ProtectedRoute';
import './App.css';

// Lazy-loaded route components for fast asynchronous chunk splitting & zero-lag navigation
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const EventList = lazy(() => import('./pages/EventPlatform/EventList'));
const EventForm = lazy(() => import('./pages/EventPlatform/EventForm'));
const EventDetailsPage = lazy(() => import('./pages/EventPlatform/EventDetailsPage'));
const PublicEvents = lazy(() => import('./pages/EventPlatform/PublicEvents'));
const Participants = lazy(() => import('./pages/EventPlatform/Participants'));
const Analytics = lazy(() => import('./pages/EventPlatform/Analytics'));
const Profile = lazy(() => import('./pages/EventPlatform/Profile'));
const Unauthorized = lazy(() => import('./pages/System/Unauthorized'));
const NotFound = lazy(() => import('./pages/System/NotFound'));
const ApprovalPending = lazy(() => import('./pages/Auth/ApprovalPending'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const EventCheckInMobile = lazy(() => import('./pages/EventPlatform/EventCheckInMobile'));

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
              <Suspense fallback={<LoadingState label="Loading view..." />}>
                <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/approval-pending" element={<ApprovalPending />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                {/* Preview routes for previewing without auth */}
                <Route path="/dashboard-preview" element={<Dashboard />} />
                <Route path="/events-preview" element={<EventList />} />
                <Route path="/events-new-preview" element={<EventForm />} />
                <Route path="/events-preview/:eventId" element={<EventDetailsPage />} />
                <Route path="/participants-preview" element={<Participants />} />
                <Route path="/transactions-preview" element={<Transactions />} />
                <Route path="/analytics-preview" element={<Analytics />} />
                <Route path="/profile-preview" element={<Profile />} />

                {/* Mobile check-in routes */}
                <Route path="/events/:eventId/checkin" element={<EventCheckInMobile />} />
                <Route path="/checkin/:eventId" element={<EventCheckInMobile />} />

                {/* Protected Host Workspace routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<EventList />} />
                  <Route path="/events/new" element={<EventForm />} />
                  <Route path="/events/:eventId/edit" element={<EventForm />} />
                  <Route path="/events/:eventId" element={<EventDetailsPage />} />
                  <Route path="/participants" element={<Participants />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/explore" element={<PublicEvents />} />
                  <Route path="/explore/:eventId" element={<EventDetailsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
