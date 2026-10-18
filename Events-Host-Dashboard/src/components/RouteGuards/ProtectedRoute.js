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

  if (roles?.length && !roles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
