import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <h1>Recover access without leaving the Firebase flow.</h1>
        <p>Password reset emails are sent with Firebase Authentication and honor your project email templates.</p>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <h2>Forgot password</h2>
          <p>Enter your account email and we will send a reset link.</p>
          {error && <div className="alert error">{error}</div>}
          {sent && <div className="alert success">Password reset email sent.</div>}
          <div className="form-grid">
            <label className="form-field">
              <span>Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="primary-btn" disabled={loading} type="submit">
              <KeyRound size={18} /> {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
          <div className="auth-links">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword;
