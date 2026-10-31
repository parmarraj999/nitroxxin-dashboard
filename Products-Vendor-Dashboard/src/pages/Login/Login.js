import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import { saveVendorProfile, generateVendorId } from '../../services/vendorService';
import { validatePhoneNumber, validateGstNumber } from '../../services/validationService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, refreshProfile, isAuthenticated, loading: authLoading } = useAuthVendor();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);


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
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleanDigits }));
    } else if (name === 'gstNumber') {
      const upperGst = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
      setFormData((prev) => ({ ...prev, gstNumber: upperGst }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    let phoneVal = null;
    let gstVal = null;

    if (isSignUp) {
      if (!formData.email || !formData.password || !formData.storeName || !formData.contactName || !formData.phone || !formData.address || !formData.gstNumber) {
        setError('Please fill in all fields.');
        return;
      }

      // Validate Phone Number: min 10 & max 10 digits
      phoneVal = validatePhoneNumber(formData.phone);
      if (!phoneVal.isValid) {
        setError(phoneVal.error);
        return;
      }

      // Validate GST Number: 15-character structure
      gstVal = validateGstNumber(formData.gstNumber);
      if (!gstVal.isValid) {
        setError(gstVal.error);
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
        
        // Generate custom vendor ID: name-last5phone-random8
        const customVendorId = generateVendorId(formData.contactName || formData.storeName, phoneVal?.cleanPhone || formData.phone);
        try {
          localStorage.setItem('nitroxx_vendor_id', customVendorId);
        } catch (e) {}

        // Write pending vendor profile with ID: vendors/customVendorId
        await saveVendorProfile({
          vendorId: customVendorId,
          customVendorId: customVendorId,
          ownerId: user.uid,
          uid: user.uid,
          authUid: user.uid,
          displayName: formData.contactName,
          verificationStatus: 'pending',
          businessDetails: {
            businessName: formData.storeName,
            supportEmail: formData.email,
            businessType: '',
            pan: gstVal?.pan || '',
            supportPhone: phoneVal?.cleanPhone || formData.phone
          },
          gstDetails: {
            gstNumber: gstVal?.cleanGst || formData.gstNumber,
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
        }, customVendorId);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="login-phone" className="form-label-login" style={{color:'white'}}>Phone Number</label>
                      <span style={{ fontSize: '0.72rem', color: formData.phone.length === 10 ? '#10b981' : '#9ca3af', fontWeight: 500 }}>
                        {formData.phone ? `${formData.phone.length}/10 digits` : '10 digits'}
                      </span>
                    </div>
                    <div className="form-input-wrap">
                      <input
                        id="login-phone"
                        type="tel"
                        name="phone"
                        className={`form-input ${error && error.toLowerCase().includes('phone') ? 'form-input-error' : ''}`}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric"
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
                        className="form-input"
                        placeholder="e.g. 123 Main St, City, State"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="login-gstNumber" className="form-label-login" style={{color:'white'}}>GST Number</label>
                      <span style={{ fontSize: '0.72rem', color: formData.gstNumber.length === 15 ? '#10b981' : '#9ca3af', fontWeight: 500 }}>
                        {formData.gstNumber ? `${formData.gstNumber.length}/15 chars` : '15 characters'}
                      </span>
                    </div>
                    <div className="form-input-wrap">
                      <input
                        id="login-gstNumber"
                        type="text"
                        name="gstNumber"
                        className={`form-input ${error && error.toLowerCase().includes('gst') ? 'form-input-error' : ''}`}
                        placeholder="15-character GSTIN (e.g. 27ABCDE1234F1Z5)"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        maxLength={15}
                        autoCapitalize="characters"
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
