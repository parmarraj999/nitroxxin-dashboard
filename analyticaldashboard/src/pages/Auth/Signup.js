import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Participant',
    phone: '',
    city: '',
    state: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <h1>Create events, publish them, and manage registrations end to end.</h1>
        <p>Signup creates your Firebase Auth account and stores the production user profile document in Firestore.</p>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <h2>Create account</h2>
          <p>Email verification is sent immediately after signup.</p>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <label className="form-field">
              <span>Full name</span>
              <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </label>
            <div className="form-grid two">
              <label className="form-field">
                <span>Email</span>
                <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Password</span>
                <input type="password" minLength="6" required value={form.password} onChange={(e) => update('password', e.target.value)} />
              </label>
            </div>
            <div className="form-grid two">
              <label className="form-field">
                <span>Role</span>
                <select value={form.role} onChange={(e) => update('role', e.target.value)}>
                  <option>Participant</option>
                  <option>Host</option>
                </select>
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </label>
            </div>
            <div className="form-grid two">
              <label className="form-field">
                <span>City</span>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} />
              </label>
              <label className="form-field">
                <span>State</span>
                <input value={form.state} onChange={(e) => update('state', e.target.value)} />
              </label>
            </div>
            <button className="primary-btn" disabled={loading} type="submit">
              <UserPlus size={18} /> {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
          <div className="auth-links">
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Signup;
