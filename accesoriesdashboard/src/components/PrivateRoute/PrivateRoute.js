import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import { Clock, ShieldAlert, XCircle, LogOut, RefreshCw } from 'lucide-react';
import './PrivateRoute.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, profile, signOut, refreshProfile } = useAuthVendor();
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="private-route-loading">
        <div className="loading-spinner-container">
          <div className="loading-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#111827" />
              <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
          <div className="loading-ring"></div>
          <p className="loading-text">Nitroxxin</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const status = profile?.verificationStatus || 'pending';

  if (status === 'verified') {
    return children;
  }

  // Define screen layout based on verification status
  let icon = <Clock className="status-screen-icon text-warning animate-pulse" size={48} />;
  let title = "Application Under Review";
  let subtitle = "Your vendor registration has been submitted to the Nitroxxin admin team.";
  let description = "We are currently reviewing your store details, GST details, and brand alignment. You will gain full access to the vendor dashboard as soon as your account is approved.";

  if (status === 'rejected') {
    icon = <XCircle className="status-screen-icon text-danger" size={48} />;
    title = "Application Rejected";
    subtitle = "Unfortunately, your application to become a vendor has been rejected.";
    description = "If you believe this was in error, or would like to submit additional compliance documents (GST/PAN/Certificates), please contact our partner operations team.";
  } else if (status === 'suspended') {
    icon = <ShieldAlert className="status-screen-icon text-danger" size={48} />;
    title = "Account Suspended";
    subtitle = "Access to the vendor dashboard has been temporarily suspended.";
    description = "Your account was suspended due to a compliance review or policy violation. Please get in touch with the admin support team to resolve this issue.";
  }

  return (
    <div className="vendor-status-screen">
      <div className="status-screen-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className="status-card-container">
        <div className="status-card">
          <div className="status-header">
            <div className="status-logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="10" fill="#111827" />
                <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="3" strokeDasharray="4 4" />
                <circle cx="24" cy="24" r="4" fill="white" />
              </svg>
            </div>
            <div className="status-logo-text">
              <h3>Nitroxxin</h3>
              <p>PARTNER PORTAL</p>
            </div>
          </div>

          <div className="status-body">
            <div className="status-icon-wrapper">
              {icon}
            </div>
            <h1 className="status-title">{title}</h1>
            <p className="status-subtitle">{subtitle}</p>
            <p className="status-desc">{description}</p>

            {profile && (
              <div className="submitted-details">
                <div className="detail-row">
                  <span className="detail-label">Store Name</span>
                  <span className="detail-value">{profile.businessDetails?.businessName || profile.displayName || 'Pending Submission'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact Name</span>
                  <span className="detail-value">{profile.displayName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{profile.businessDetails?.supportEmail || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-pill ${status}`}>{status}</span>
                </div>
              </div>
            )}

            <div className="status-actions">
              {status === 'pending' && (
                <button className="status-action-btn primary-btn" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Checking...' : 'Refresh Status'}
                </button>
              )}
              <button className="status-action-btn secondary-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>

          <div className="status-footer">
            <p>Need urgent activation? Contact <a href="mailto:onboarding@nitroxxin.com">onboarding@nitroxxin.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute;

