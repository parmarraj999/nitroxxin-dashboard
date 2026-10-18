import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import { saveVendorProfile } from '../../services/vendorService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, refreshProfile } = useAuthVendor();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeName: '',
    contactName: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account.';
      case 'auth/weak-password':
        return 'The password is too weak. Choose at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return `${isSignUp ? 'Registration' : 'Sign in'} failed. Please try again.`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (!formData.email || !formData.password || !formData.storeName || !formData.contactName || !formData.phone || !formData.address || !formData.gstNumber) {
        setError('Please fill in all fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password.');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        // Create auth user
        const user = await signUp(formData.email, formData.password);
        
        // Write pending vendor profile
        await saveVendorProfile({
          displayName: formData.contactName,
          verificationStatus: 'pending',
          businessDetails: {
            businessName: formData.storeName,
            supportEmail: formData.email,
            businessType: '',
            pan: '',
            supportPhone: formData.phone
          },
          gstDetails: {
            gstNumber: formData.gstNumber,
            legalName: formData.storeName,
            registrationState: ''
          },
          warehouseAddress: {
            addressLine1: formData.address,
            city: '',
            state: '',
            pincode: ''
          },
          brandInformation: {
            brandName: formData.storeName,
            logoUrl: '',
            description: ''
          }
        }, user.uid);

        // Update auth state in context
        await refreshProfile();
        navigate('/dashboard', { replace: true });
      } else {
        await signIn(formData.email, formData.password);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((v) => !v);
    setError('');
    setFormData({ email: '', password: '', storeName: '', contactName: '', phone: '', address: '', gstNumber: '' });
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className={`login-container ${isSignUp ? 'signup-layout' : ''}`}>
        {/* Login form card */}
        <div className="login-card-panel">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-title">{isSignUp ? 'Store Registration' : 'Welcome back'}</h2>
              <p className="login-subtitle">
                {isSignUp ? 'Apply to sell your gear on Nitroxxin' : 'Sign in to your vendor account'}
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {isSignUp && (
                <>
                  <div className="form-group">
                    <label htmlFor="login-storeName" className="form-label-login" style={{color:'white'}}>Store / Company Name</label>
                    <div className="form-input-wrap">
                      <input
                        id="login-storeName"
                        type="text"
                        name="storeName"
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. Apex Riding Gears"
                        value={formData.storeName}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-contactName" className="form-label-login" style={{color:'white'}}>Contact Person Name</label>
                    <div className="form-input-wrap">
                      <input
                        id="login-contactName"
                        type="text"
                        name="contactName"
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.contactName}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="login-phone" className="form-label-login" style={{color:'white'}}>Phone Number</label>
                    <div className="form-input-wrap">
                      <input
                        id="login-phone"
                        type="tel"
                        name="phone"
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. +91 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-address" className="form-label-login" style={{color:'white'}}>Store Address</label>
                    <div className="form-input-wrap">
                      <input
                        id="login-address"
                        type="text"
                        name="address"
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. 123 Main St, City, State"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-gstNumber" className="form-label-login" style={{color:'white'}}>GST Number</label>
                    <div className="form-input-wrap">
                      <input
                        id="login-gstNumber"
                        type="text"
                        name="gstNumber"
                        className={`form-input ${error ? 'form-input-error' : ''}`}
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="login-email" className="form-label-login" style={{color:'white'}}>Email Address</label>
                <div className="form-input-wrap">
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    className={`form-input ${error ? 'form-input-error' : ''}`}
                    placeholder="vendor@nitroxxin.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label-login" style={{color:'white'}}>Password</label>
                <div className="form-input-wrap password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${error ? 'form-input-error' : ''}`}
                    placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="btn-spinner" />
                    {isSignUp ? 'Submitting Application…' : 'Signing in…'}
                  </>
                ) : (
                  isSignUp ? 'Submit Registration' : 'Sign In'
                )}
              </button>
            </form>

            <div className="login-toggle-mode">
              <span>{isSignUp ? 'Already registered?' : 'Want to partner with us?'}</span>
              <button className="toggle-btn" onClick={toggleMode} disabled={loading}>
                {isSignUp ? 'Sign In here' : 'Register Store here'}
              </button>
            </div>

            <p className="login-note">
              Vendor applications are checked and approved by the Nitroxxin admin team.
              <br />
              Need help? Contact <a href="mailto:support@nitroxxin.com">support@nitroxxin.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
