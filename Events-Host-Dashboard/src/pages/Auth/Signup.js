import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  UploadCloud, 
  Mail, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const STEPS = [
  { id: 1, label: 'Account Type' },
  { id: 2, label: 'Personal Info' },
  { id: 3, label: 'Organization Info' },
  { id: 4, label: 'Account Security' },
];

const Signup = () => {
  const { signUp, isAuthenticated, hostStatus } = useAuth();
  const navigate = useNavigate();

  // Current active step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [form, setForm] = useState({
    accountType: 'Individual', // 'Individual' or 'Business'
    fullName: '',
    phone: '',
    city: '',
    state: '',
    organizationName: '',
    panNumber: '',
    gstNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [docFile, setDocFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (hostStatus === 'Pending' || hostStatus === 'Rejected') {
      return <Navigate to="/approval-pending" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  // Step validation before moving to next step
  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (currentStep === 1) {
      if (!form.accountType) {
        setError('Please select an account type.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!form.fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!form.phone.trim()) {
        setError('Please enter your phone number.');
        return;
      }
      if (!form.city.trim() || !form.state.trim()) {
        setError('Please enter your city and state.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!form.organizationName.trim()) {
        setError('Please enter your organization, club, or brand name.');
        return;
      }
      if (!form.panNumber.trim() || form.panNumber.trim().length < 10) {
        setError('Please enter a valid 10-character PAN number.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        organizationName: form.organizationName || `${form.fullName} (Individual)`,
        city: form.city,
        state: form.state,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
        docFile,
      });

      navigate('/approval-pending', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container">

        {/* 1. TOP HEADER */}
        <header className="auth-split-header">
          <Link to="/explore" className="auth-brand-link">
            <span className="brand-dot" />
            <span>Nitroxx Events</span>
          </Link>
          <div className="auth-header-action">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </header>

        {/* 2. SPLIT BODY */}
        <div className="auth-split-body">

          {/* LEFT: VERTICAL STEP PROGRESS BAR (Exact match to reference image) */}
          <aside className="auth-sidebar-progress" aria-label="Progress steps">
            <h3 className="sidebar-progress-title">Account Setup</h3>

            <div className="step-progress-list">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const isPending = currentStep < step.id;

                return (
                  <div 
                    key={step.id} 
                    className={`step-progress-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                  >
                    {/* Vertical connecting line */}
                    {idx < STEPS.length - 1 && (
                      <div className="step-connector-line" />
                    )}

                    {/* Step Indicator */}
                    <div className={`step-indicator ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
                      {isCompleted ? (
                        <Check size={14} strokeWidth={2.8} />
                      ) : isActive ? (
                        <Sparkles size={13} className="active-spinner-icon" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="step-label-box">
                      <span className="step-label">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* RIGHT: MAIN STEP CONTENT */}
          <main className="auth-main-panel">
            {error && <div className="auth-status-alert error">{error}</div>}

            {/* ================= STEP 1: ACCOUNT TYPE ================= */}
            {currentStep === 1 && (
              <div>
                <div className="panel-header-section">
                  <h1 className="panel-main-title">
                    Are you signing up as<br />an individual or a business?
                  </h1>
                  <p className="panel-subtitle-label">Choose account type</p>
                </div>

                <div className="selection-cards-group">
                  {/* Individual Card */}
                  <div 
                    className={`selection-card ${form.accountType === 'Individual' ? 'selected' : ''}`}
                    onClick={() => update('accountType', 'Individual')}
                  >
                    <div className="selection-radio-circle">
                      {form.accountType === 'Individual' && (
                        <div className="selection-radio-inner-dot" />
                      )}
                    </div>
                    <div className="selection-card-details">
                      <span className="selection-card-title">Individual</span>
                      <span className="selection-card-desc">
                        For solo event organizers, race marshals, and independent creators.
                      </span>
                    </div>
                  </div>

                  {/* Business / Organization Card */}
                  <div 
                    className={`selection-card ${form.accountType === 'Business' ? 'selected' : ''}`}
                    onClick={() => update('accountType', 'Business')}
                  >
                    <div className="selection-radio-circle">
                      {form.accountType === 'Business' && (
                        <div className="selection-radio-inner-dot" />
                      )}
                    </div>
                    <div className="selection-card-details">
                      <span className="selection-card-title">Business</span>
                      <span className="selection-card-desc">
                        For companies or agencies managing multiple accounts and racing clubs.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="auth-action-btn-row">
                  <button 
                    type="button" 
                    className="btn-continue-black"
                    onClick={handleNextStep}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: PERSONAL INFO ================= */}
            {currentStep === 2 && (
              <div>
                <div className="panel-header-section">
                  <h1 className="panel-main-title">Personal Information</h1>
                  <p className="panel-subtitle-label">Enter your contact and identity details</p>
                </div>

                <form className="auth-step-form" onSubmit={handleNextStep}>
                  <div className="auth-field-group">
                    <label>Full Name *</label>
                    <div className="auth-field-wrapper">
                      <User size={16} className="field-icon" />
                      <input 
                        type="text" 
                        required 
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label>Phone Number *</label>
                    <div className="auth-field-wrapper">
                      <Phone size={16} className="field-icon" />
                      <input 
                        type="tel" 
                        required 
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="auth-field-group">
                      <label>City *</label>
                      <div className="auth-field-wrapper">
                        <MapPin size={16} className="field-icon" />
                        <input 
                          type="text" 
                          required 
                          placeholder="Bangalore"
                          value={form.city}
                          onChange={(e) => update('city', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label>State *</label>
                      <div className="auth-field-wrapper no-icon">
                        <input 
                          type="text" 
                          required 
                          placeholder="Karnataka"
                          value={form.state}
                          onChange={(e) => update('state', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-action-btn-row">
                    <button 
                      type="button" 
                      className="btn-back-text"
                      onClick={handlePrevStep}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-continue-black"
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 3: ORGANIZATION & COMPLIANCE ================= */}
            {currentStep === 3 && (
              <div>
                <div className="panel-header-section">
                  <h1 className="panel-main-title">Organization & Tax Details</h1>
                  <p className="panel-subtitle-label">Business compliance & identity verification</p>
                </div>

                <form className="auth-step-form" onSubmit={handleNextStep}>
                  <div className="auth-field-group">
                    <label>Organization / Club / Brand Name *</label>
                    <div className="auth-field-wrapper">
                      <Building2 size={16} className="field-icon" />
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Apex Motorsports Club"
                        value={form.organizationName}
                        onChange={(e) => update('organizationName', e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="auth-field-group">
                      <label>PAN Number *</label>
                      <div className="auth-field-wrapper">
                        <CreditCard size={16} className="field-icon" />
                        <input 
                          type="text" 
                          required 
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          value={form.panNumber}
                          onChange={(e) => update('panNumber', e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label>GST Number (Optional)</label>
                      <div className="auth-field-wrapper no-icon">
                        <input 
                          type="text" 
                          placeholder="22AAAAA0000A1Z5"
                          value={form.gstNumber}
                          onChange={(e) => update('gstNumber', e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label>Verification Document (Incorporation / ID / License)</label>
                    <label className="auth-upload-card">
                      <UploadCloud size={20} color="#2563eb" />
                      <div className="upload-text-box">
                        <span>{docFile ? <strong>{docFile.name}</strong> : 'Upload ID or registration proof'}</span>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>PDF, PNG, or JPG (Max 10MB)</span>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf,image/*"
                        onChange={(e) => setDocFile(e.target.files[0] || null)}
                      />
                    </label>
                  </div>

                  <div className="auth-action-btn-row">
                    <button 
                      type="button" 
                      className="btn-back-text"
                      onClick={handlePrevStep}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-continue-black"
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 4: ACCOUNT SECURITY & REVIEW ================= */}
            {currentStep === 4 && (
              <div>
                <div className="panel-header-section">
                  <h1 className="panel-main-title">Account Security & Credentials</h1>
                  <p className="panel-subtitle-label">Final step to create your host account</p>
                </div>

                <form className="auth-step-form" onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }}>
                  <div className="auth-field-group">
                    <label>Host Email Address *</label>
                    <div className="auth-field-wrapper">
                      <Mail size={16} className="field-icon" />
                      <input 
                        type="email" 
                        required 
                        placeholder="host@club.com"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="auth-field-group">
                      <label>Create Password *</label>
                      <div className="auth-field-wrapper">
                        <Lock size={16} className="field-icon" />
                        <input 
                          type="password" 
                          required 
                          minLength={6}
                          placeholder="••••••••••••"
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label>Confirm Password *</label>
                      <div className="auth-field-wrapper no-icon">
                        <input 
                          type="password" 
                          required 
                          minLength={6}
                          placeholder="••••••••••••"
                          value={form.confirmPassword}
                          onChange={(e) => update('confirmPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Review Card */}
                  <div className="review-summary-card">
                    <div className="review-summary-row">
                      <span className="review-key">Account Type</span>
                      <span className="review-val">{form.accountType}</span>
                    </div>
                    <div className="review-summary-row">
                      <span className="review-key">Contact Person</span>
                      <span className="review-val">{form.fullName}</span>
                    </div>
                    <div className="review-summary-row">
                      <span className="review-key">Organization</span>
                      <span className="review-val">{form.organizationName}</span>
                    </div>
                    <div className="review-summary-row">
                      <span className="review-key">Location</span>
                      <span className="review-val">{form.city}, {form.state}</span>
                    </div>
                    <div className="review-summary-row">
                      <span className="review-key">PAN Number</span>
                      <span className="review-val">{form.panNumber}</span>
                    </div>
                    {docFile && (
                      <div className="review-summary-row">
                        <span className="review-key">Attached Proof</span>
                        <span className="review-val" style={{ color: '#2563eb' }}>{docFile.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="auth-action-btn-row">
                    <button 
                      type="button" 
                      className="btn-back-text"
                      onClick={handlePrevStep}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-continue-black"
                      disabled={loading}
                    >
                      {loading ? 'Submitting Application...' : 'Submit Host Application'} <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default Signup;
