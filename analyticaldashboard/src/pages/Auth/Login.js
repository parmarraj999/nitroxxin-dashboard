import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', role: 'Participant' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(form.role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <h1>Nitroxx event operations, built for real hosts.</h1>
        <p>Run registrations, check-ins, participant exports, revenue analytics, and live event updates from one Firebase-backed dashboard.</p>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <h2>Login</h2>
          <p>Access your host or participant workspace.</p>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <label className="form-field">
              <span>Email</span>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <label className="form-field">
              <span>Google role</span>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Participant</option>
                <option>Host</option>
              </select>
            </label>
            <button className="primary-btn" disabled={loading} type="submit">
              <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button className="ghost-btn" disabled={loading} type="button" onClick={google}>
              <Globe2 size={18} /> Continue with Google
            </button>
          </div>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/signup">Create account</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
