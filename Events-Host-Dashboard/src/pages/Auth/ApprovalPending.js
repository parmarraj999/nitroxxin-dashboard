import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Home, 
  Headphones, 
  LogOut, 
  Edit3, 
  X, 
  Mail, 
  Phone, 
  Building2, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadFile } from '../../services/firebaseService';
import LoadingState from '../../components/States/LoadingState';
import './ApprovalPending.css';

const ApprovalPending = () => {
  const { 
    user, 
    hostApplication, 
    hostStatus, 
    loading, 
    logout, 
    resubmitApplication 
  } = useAuth();
  const navigate = useNavigate();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Resubmission edit form state
  const [editForm, setEditForm] = useState({
    organizationName: '',
    fullName: '',
    phone: '',
    city: '',
    state: '',
    gstNumber: '',
    panNumber: '',
    documents: [],
  });

  const [docFile, setDocFile] = useState(null);

  // Sync edit form with current application data
  useEffect(() => {
    if (hostApplication) {
      setEditForm({
        organizationName: hostApplication.organizationName || '',
        fullName: hostApplication.fullName || user?.displayName || '',
        phone: hostApplication.phone || '',
        city: hostApplication.city || '',
        state: hostApplication.state || '',
        gstNumber: hostApplication.gstNumber || '',
        panNumber: hostApplication.panNumber || '',
        documents: hostApplication.documents || [],
      });
    }
  }, [hostApplication, user]);

  // If status becomes Approved in real-time listener, auto-redirect to dashboard after brief toast
  useEffect(() => {
    if (hostStatus === 'Approved') {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hostStatus, navigate]);

  if (loading) {
    return <LoadingState label="Checking your application status..." fullPage />;
  }

  // If unauthenticated, redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      let updatedDocuments = [...editForm.documents];

      if (docFile) {
        const downloadUrl = await uploadFile(
          docFile,
          `host_applications/${user.uid}/documents`,
          (progress) => setUploadProgress(progress)
        );
        updatedDocuments.push({
          name: docFile.name,
          url: downloadUrl,
          type: docFile.type,
          uploadedAt: new Date().toISOString(),
        });
      }

      await resubmitApplication({
        ...editForm,
        documents: updatedDocuments,
      });

      setActionSuccess('Application resubmitted successfully! Our team will review it shortly.');
      setDocFile(null);
      setUploadProgress(0);
      setEditModalOpen(false);
    } catch (err) {
      setActionError(err.message || 'Failed to resubmit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = hostStatus === 'Approved';
  const isRejected = hostStatus === 'Rejected';
  const isPending = !isApproved && !isRejected; // Default is pending

  return (
    <div className="approval-pending-page">
      <div style={{ width: '100%', maxWidth: '660px', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Link to="/explore" className="auth-brand-link">
          <span className="brand-dot" />
          <span>Nitroxx Events</span>
        </Link>
      </div>
      <div className="approval-card-wrapper">

        {/* 1. STATUS BADGE ICON */}
        {isApproved && (
          <div className="approval-icon-badge approved">
            <CheckCircle2 size={40} strokeWidth={2.2} />
          </div>
        )}

        {isRejected && (
          <div className="approval-icon-badge rejected">
            <XCircle size={40} strokeWidth={2.2} />
          </div>
        )}

        {isPending && (
          <div className="approval-icon-badge pending">
            <span className="pulse-ring" />
            <Clock size={38} strokeWidth={2.2} />
          </div>
        )}

        {/* 2. TITLES & DESCRIPTIONS */}
        {isApproved ? (
          <>
            <h1 className="approval-title">Application Approved! 🎉</h1>
            <p className="approval-subtitle">Your organizer account is now active and verified.</p>
            <p className="approval-description">
              Welcome to the Nitroxx Host community. You can now publish events, configure ticket classes, and manage bookings.
            </p>
          </>
        ) : isRejected ? (
          <>
            <h1 className="approval-title">Application Requires Review</h1>
            <p className="approval-subtitle">We were unable to approve your application at this time.</p>
            <p className="approval-description">
              Please review the feedback provided by our verification team below, update your details, and resubmit for verification.
            </p>
          </>
        ) : (
          <>
            <h1 className="approval-title">Application Submitted Successfully</h1>
            <p className="approval-subtitle">Your organizer account is currently under review.</p>
            <p className="approval-description">
              Our team usually verifies applications within 24-48 hours. You will receive an email once your account is approved.
            </p>
          </>
        )}

        {/* 3. STATUS PILL */}
        <div className="status-pill-container">
          {isApproved && (
            <div className="approval-status-pill approved">
              <span className="status-dot approved" />
              <span>Status: Verified & Approved</span>
            </div>
          )}

          {isRejected && (
            <div className="approval-status-pill rejected">
              <span className="status-dot rejected" />
              <span>Status: Rejected</span>
            </div>
          )}

          {isPending && (
            <div className="approval-status-pill pending">
              <span className="status-dot pending" />
              <span>Status: 🟡 Pending Verification</span>
            </div>
          )}
        </div>

        {/* 4. REJECTION REASON BOX (IF REJECTED) */}
        {isRejected && (
          <div className="rejection-reason-box">
            <div className="reason-header">
              <AlertTriangle size={18} />
              <span>Reason for Rejection</span>
            </div>
            <p className="reason-text">
              {hostApplication?.rejectionReason || 
                'Incomplete business documentation or invalid PAN/GST details. Please review your organization credentials and resubmit.'}
            </p>
          </div>
        )}

        {/* Success toast after resubmission */}
        {actionSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '13.5px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {actionSuccess}
          </div>
        )}

        {/* 5. APPLICATION DETAILS SUMMARY */}
        {hostApplication && (
          <div className="application-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Application ID</span>
              <span className="meta-val">{hostApplication.applicationId || `APP-${user.uid.slice(0, 8).toUpperCase()}`}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Organization</span>
              <span className="meta-val">{hostApplication.organizationName || 'Individual Organizer'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Contact Person</span>
              <span className="meta-val">{hostApplication.fullName || user.displayName || user.email}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-val">
                {[hostApplication.city, hostApplication.state].filter(Boolean).join(', ') || 'India'}
              </span>
            </div>
            {hostApplication.panNumber && (
              <div className="meta-item">
                <span className="meta-label">PAN Number</span>
                <span className="meta-val">{hostApplication.panNumber}</span>
              </div>
            )}
            {hostApplication.gstNumber && (
              <div className="meta-item">
                <span className="meta-label">GST Number</span>
                <span className="meta-val">{hostApplication.gstNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* 6. ACTION BUTTONS */}
        <div className="approval-actions">
          <div className="approval-btn-row">
            {isApproved ? (
              <button 
                className="btn-approval-primary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : isRejected ? (
              <>
                <button 
                  className="btn-approval-primary"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit3 size={16} /> Edit Details & Resubmit
                </button>
                <button 
                  className="btn-approval-secondary"
                  onClick={() => setSupportModalOpen(true)}
                >
                  <Headphones size={16} /> Contact Support
                </button>
              </>
            ) : (
              <>
                <Link to="/explore" className="btn-approval-secondary">
                  <Home size={16} /> Go to Home
                </Link>
                <button 
                  className="btn-approval-secondary"
                  onClick={() => setSupportModalOpen(true)}
                >
                  <Headphones size={16} /> Contact Support
                </button>
              </>
            )}
          </div>

          <button 
            className="btn-approval-ghost" 
            onClick={() => logout().then(() => navigate('/login'))}
          >
            <LogOut size={14} /> Sign out / Switch account
          </button>
        </div>

      </div>

      {/* 7. EDIT & RESUBMIT MODAL */}
      {editModalOpen && (
        <div className="approval-modal-backdrop" onClick={() => !submitting && setEditModalOpen(false)}>
          <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <h3>Edit Application & Resubmit</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => !submitting && setEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '14px'
              }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleResubmit} className="resubmit-form">
              <div className="resubmit-field">
                <span>Organization / Brand Name *</span>
                <input 
                  type="text" 
                  required 
                  value={editForm.organizationName}
                  onChange={(e) => handleEditChange('organizationName', e.target.value)}
                  placeholder="e.g. Apex Motorsports Club"
                />
              </div>

              <div className="resubmit-grid-2">
                <div className="resubmit-field">
                  <span>Contact Full Name *</span>
                  <input 
                    type="text" 
                    required 
                    value={editForm.fullName}
                    onChange={(e) => handleEditChange('fullName', e.target.value)}
                  />
                </div>
                <div className="resubmit-field">
                  <span>Phone Number *</span>
                  <input 
                    type="tel" 
                    required 
                    value={editForm.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="resubmit-grid-2">
                <div className="resubmit-field">
                  <span>City *</span>
                  <input 
                    type="text" 
                    required 
                    value={editForm.city}
                    onChange={(e) => handleEditChange('city', e.target.value)}
                  />
                </div>
                <div className="resubmit-field">
                  <span>State *</span>
                  <input 
                    type="text" 
                    required 
                    value={editForm.state}
                    onChange={(e) => handleEditChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="resubmit-grid-2">
                <div className="resubmit-field">
                  <span>PAN Number *</span>
                  <input 
                    type="text" 
                    required 
                    value={editForm.panNumber}
                    onChange={(e) => handleEditChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div className="resubmit-field">
                  <span>GST Number (Optional)</span>
                  <input 
                    type="text" 
                    value={editForm.gstNumber}
                    onChange={(e) => handleEditChange('gstNumber', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="resubmit-field">
                <span>Upload New Verification Document (PDF / Image)</span>
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setDocFile(e.target.files[0] || null)}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ fontSize: '12px', color: '#f97316', marginTop: '4px' }}>
                    Uploading document: {uploadProgress}%
                  </div>
                )}
              </div>

              {editForm.documents?.length > 0 && (
                <div className="resubmit-field">
                  <span>Previously Attached Documents:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {editForm.documents.map((doc, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '6px 10px',
                        borderRadius: '6px'
                      }}>
                        <FileText size={14} color="#f97316" />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.name || `Document #${idx + 1}`}
                        </span>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="resubmit-actions">
                <button 
                  type="button" 
                  className="btn-approval-secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-approval-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Resubmit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. CONTACT SUPPORT MODAL */}
      {supportModalOpen && (
        <div className="approval-modal-backdrop" onClick={() => setSupportModalOpen(false)}>
          <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <h3>Contact Nitroxx Support</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setSupportModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 16px' }}>
              Have questions regarding your verification or need urgent approval for an upcoming race or event? Our team is available 24/7.
            </p>

            <div className="support-contact-list">
              <a href="mailto:support@nitroxxin.com?subject=Host%20Application%20Inquiry%20-%20Nitroxx" className="support-contact-item">
                <div className="support-item-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Email Support</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>support@nitroxxin.com (Avg response: &lt; 2 hrs)</div>
                </div>
              </a>

              <a href="tel:+919876543210" className="support-contact-item">
                <div className="support-item-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Phone / WhatsApp Hotline</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>+91 (0) 80-4567-8900 (Mon-Sat, 9AM-8PM IST)</div>
                </div>
              </a>

              <div className="support-contact-item" style={{ cursor: 'default' }}>
                <div className="support-item-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Operations Desk</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Nitroxx Tech HQ, Bangalore, India</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button 
                className="btn-approval-secondary"
                onClick={() => setSupportModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApprovalPending;
