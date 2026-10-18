import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container" style={{ maxWidth: '680px' }}>
        <header className="auth-split-header">
          <Link to="/login" className="auth-brand-link">
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </header>

        <main className="auth-main-panel" style={{ maxWidth: '100%', background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="panel-header-section">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <KeyRound size={22} color="#0f172a" />
            </div>
            <h1 className="panel-main-title">Reset Host Password</h1>
            <p className="panel-subtitle-label">
              Enter your registered organizer email and we will send you a password reset link.
            </p>
          </div>

          {error && <div className="auth-status-alert error">{error}</div>}
          {sent && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '18px' }}>
              Check your inbox! Password reset email sent to <strong>{email}</strong>.
            </div>
          )}

          <form className="auth-step-form" onSubmit={submit}>
            <div className="auth-field-group">
              <label>Host Email Address</label>
              <div className="auth-field-wrapper">
                <Mail size={16} className="field-icon" />
                <input 
                  type="email" 
                  required 
                  placeholder="host@club.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-action-btn-row">
              <button 
                type="submit" 
                className="btn-continue-black"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={15} />
              </button>
            </div>
          </form>

          <div style={{ marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
            Remember your credentials? <Link to="/login" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>Back to login →</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForgotPassword;
