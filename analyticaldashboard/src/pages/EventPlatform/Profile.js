import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout/AppLayout';
import LoadingState from '../../components/States/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEvents } from '../../hooks/useEvents';
import { useRegistrations } from '../../hooks/useRegistrations';
import { updateUserProfile, uploadFile } from '../../services/firebaseService';
import { currency } from '../../utils/formatters';
import './EventPlatform.css';
import '../Auth/Auth.css';

const Profile = () => {
  const { user, profile } = useAuth();
  const { events } = useEvents({ hostId: user?.uid });
  const { registrations } = useRegistrations({ hostId: user?.uid });
  const analytics = useAnalytics(events, registrations);
  const [form, setForm] = useState(() => ({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    state: profile?.state || '',
    organizationName: profile?.organizationName || '',
    socialLinks: profile?.socialLinks || { website: '', instagram: '', linkedin: '' },
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      city: profile.city || '',
      state: profile.state || '',
      organizationName: profile.organizationName || '',
      socialLinks: profile.socialLinks || { website: '', instagram: '', linkedin: '' },
    });
  }, [profile]);

  if (!profile) return <AppLayout><LoadingState label="Loading profile" /></AppLayout>;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateSocial = (field, value) =>
    setForm((current) => ({ ...current, socialLinks: { ...current.socialLinks, [field]: value } }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const photoURL = photoFile ? await uploadFile(photoFile, `users/${user.uid}/profile`) : profile.photoURL;
      await updateUserProfile(user.uid, { ...form, photoURL });
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <h1>Host Profile</h1>
            <p>Keep organizer identity, contact details, social links, and profile analytics current.</p>
          </div>
        </div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <div className="profile-grid">
          <aside className="panel">
            <img className="avatar-preview" src={profile.photoURL || 'https://i.pravatar.cc/150?u=nitroxx-profile'} alt={profile.fullName} />
            <h2>{profile.fullName}</h2>
            <p className="muted">{profile.organizationName || profile.role}</p>
            <section className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 18 }}>
              <div className="metric-card"><span>Events Hosted</span><strong>{analytics.totalEvents}</strong></div>
              <div className="metric-card"><span>Total Registrations</span><strong>{analytics.totalRegistrations}</strong></div>
              <div className="metric-card"><span>Total Revenue</span><strong>{currency(analytics.totalRevenue)}</strong></div>
              <div className="metric-card"><span>Upcoming Events</span><strong>{analytics.upcomingEvents}</strong></div>
              <div className="metric-card"><span>Completed Events</span><strong>{analytics.completedEvents}</strong></div>
            </section>
          </aside>
          <form className="form-section" onSubmit={submit}>
            <h2>Profile Details</h2>
            <label className="form-field"><span>Profile Photo</span><input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} /></label>
            <div className="form-grid two">
              <label className="form-field"><span>Name</span><input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></label>
              <label className="form-field"><span>Phone</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
            </div>
            <label className="form-field"><span>Organization Name</span><input value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} /></label>
            <label className="form-field"><span>Bio</span><textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} /></label>
            <div className="form-grid two">
              <label className="form-field"><span>City</span><input value={form.city} onChange={(e) => update('city', e.target.value)} /></label>
              <label className="form-field"><span>State</span><input value={form.state} onChange={(e) => update('state', e.target.value)} /></label>
            </div>
            <div className="form-grid two">
              <label className="form-field"><span>Website</span><input value={form.socialLinks.website} onChange={(e) => updateSocial('website', e.target.value)} /></label>
              <label className="form-field"><span>Instagram</span><input value={form.socialLinks.instagram} onChange={(e) => updateSocial('instagram', e.target.value)} /></label>
              <label className="form-field"><span>LinkedIn</span><input value={form.socialLinks.linkedin} onChange={(e) => updateSocial('linkedin', e.target.value)} /></label>
            </div>
            <button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
          </form>
        </div>
      </main>
    </AppLayout>
  );
};

export default Profile;
