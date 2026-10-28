import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../States/LoadingState';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, loading, role, hostStatus } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking your session" fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  // Restrict unapproved hosts from accessing dashboard / host workspace
  if (hostStatus === 'Pending' || hostStatus === 'Rejected') {
    return <Navigate to="/approval-pending" replace />;
  }

  // If specific roles are requested, check with case-insensitivity and support host/admin roles
  if (roles?.length) {
    const userRole = (role || '').toLowerCase();
    const hasRole = roles.some(
      (r) =>
        r.toLowerCase() === userRole ||
        userRole.includes('host') ||
        userRole.includes('admin') ||
        userRole.includes('organizer')
    );
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
