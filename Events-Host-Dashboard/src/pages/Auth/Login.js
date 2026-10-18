import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHostApplication } from '../../services/firebaseService';
import './Auth.css';

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated, hostStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    if (hostStatus === 'Pending' || hostStatus === 'Rejected') {
      return <Navigate to="/approval-pending" replace />;
    }
    return <Navigate to={from === '/approval-pending' ? '/dashboard' : from} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      const app = await getHostApplication(user.uid);
      if (app && (app.status === 'Pending' || app.status === 'Rejected')) {
        navigate('/approval-pending', { replace: true });
      } else {
        navigate(from === '/approval-pending' ? '/dashboard' : from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle('Host');
      const app = await getHostApplication(user.uid);
      if (app && (app.status === 'Pending' || app.status === 'Rejected')) {
        navigate('/approval-pending', { replace: true });
      } else {
        navigate(from === '/approval-pending' ? '/dashboard' : from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container" style={{ maxWidth: '480px' }}>

        {/* 1. TOP HEADER */}
        <header className="auth-split-header">
          <Link to="/explore" className="auth-brand-link">
            <span className="brand-dot" />
            <span>Nitroxx Events</span>
          </Link>
          <div className="auth-header-action">
            <span>New organizer?</span>
            <Link to="/signup">Apply for Host</Link>
          </div>
        </header>

        {/* 2. MAIN LOGIN PANEL (Centered, no side progress bar) */}
        <main className="auth-main-panel" style={{ maxWidth: '100%' }}>
          <div className="panel-header-section">
            <h1 className="panel-main-title">
              Sign in to your<br />Host Account
            </h1>
            <p className="panel-subtitle-label">
              Access your event management operations and ticketing center
            </p>
          </div>

          {error && <div className="auth-status-alert error">{error}</div>}

          <form className="auth-step-form" onSubmit={submit}>
            <div className="auth-field-group">
              <label>Email Address</label>
              <div className="auth-field-wrapper">
                <Mail size={16} className="field-icon" />
                <input 
                  type="email" 
                  required 
                  placeholder="host@club.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="auth-field-wrapper">
                <Lock size={16} className="field-icon" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="auth-action-btn-row" style={{ marginTop: '6px' }}>
              <button 
                type="submit" 
                className="btn-continue-black"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={15} />
              </button>
            </div>

            <button 
              type="button" 
              className="btn-google-sign"
              onClick={google}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
            Want to organize events? <Link to="/signup" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>Apply for host access →</Link>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Login;
