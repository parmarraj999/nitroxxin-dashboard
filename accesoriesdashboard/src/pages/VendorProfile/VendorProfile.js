import React, { useEffect, useState, useCallback } from 'react';
import {
  User, Store, FileText, Building2, Mail, Phone,
  Tag, Globe, CheckCircle2, Clock, Save, Loader2,
  Camera, ChevronRight, AlertCircle, Check
} from 'lucide-react';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import { getVendorProfile, saveVendorProfile } from '../../services/vendorService';
import { emptyVendorProfile } from '../../schemas/firestoreSchema';
import './VendorProfile.css';

/* ─── helpers ─── */
const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'V';

const BUSINESS_TYPES = [
  'Sole Proprietorship', 'Partnership', 'LLP',
  'Private Limited', 'Public Limited', 'OPC', 'HUF'
];

const GST_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

/* ─── Section Wrapper ─── */
const Section = ({ icon: Icon, title, children }) => (
  <div className="profile-section">
    <div className="section-header-row">
      <div className="section-icon-wrap">
        <Icon size={18} />
      </div>
      <h3 className="section-title-text">{title}</h3>
      <ChevronRight size={16} className="section-chevron" />
    </div>
    <div className="section-body">{children}</div>
  </div>
);

/* ─── Field ─── */
const Field = ({ label, children }) => (
  <div className="field-group">
    <label className="field-label">{label}</label>
    {children}
  </div>
);

const Input = (props) => <input className="field-input" {...props} />;
const Textarea = (props) => <textarea className="field-textarea" rows={3} {...props} />;

const Select = ({ value, onChange, options, placeholder }) => (
  <select className="field-select" value={value} onChange={onChange}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);


/* ════════════════════════════════════════ */
const VendorProfile = () => {
  const { user } = useAuthVendor();

  const [profile, setProfile]   = useState({ ...emptyVendorProfile });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  /* fetch on mount */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getVendorProfile(user.uid);
        if (data) setProfile({ ...emptyVendorProfile, ...data });
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* deep-update helpers */
  const setTop = useCallback((key, val) =>
    setProfile((p) => ({ ...p, [key]: val })), []);

  const setNested = useCallback((section, key, val) =>
    setProfile((p) => ({ ...p, [section]: { ...p[section], [key]: val } })), []);

  /* save */
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await saveVendorProfile(profile, user.uid);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 size={32} className="profile-loader-icon" />
        <p>Loading profile…</p>
      </div>
    );
  }

  const initials = getInitials(profile.displayName || profile.businessDetails?.businessName);
  const verificationColor = {
    verified: '#10b981',
    pending:  '#f59e0b',
    rejected: '#ef4444'
  }[profile.verificationStatus] || '#f59e0b';

  return (
    <div className="vendor-profile-page">

      {/* ── Page header ── */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Vendor Profile</h1>
          <p className="profile-page-subtitle">Manage your personal details and shop information</p>
        </div>
        <button
          id="save-profile-btn"
          className={`save-profile-btn ${saved ? 'save-success' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 size={16} className="btn-spinner" /> Saving…</>
          ) : saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>

      {saveError && (
        <div className="save-error-banner">
          <AlertCircle size={16} /> {saveError}
        </div>
      )}

      {/* ── Hero card ── */}
      <div className="profile-hero-card">
        <div className="hero-avatar-wrap">
          <div className="hero-avatar" style={{ '--initials-color': verificationColor }}>
            {initials}
          </div>
          <button className="avatar-camera-btn" title="Change avatar">
            <Camera size={14} />
          </button>
        </div>
        <div className="hero-info">
          <div className="hero-name-row">
            <h2 className="hero-name">
              {profile.displayName || profile.businessDetails?.businessName || 'Your Store'}
            </h2>
            <span
              className="verification-badge"
              style={{ '--badge-color': verificationColor }}
            >
              {profile.verificationStatus === 'verified' ? (
                <CheckCircle2 size={13} />
              ) : (
                <Clock size={13} />
              )}
              {profile.verificationStatus || 'Pending'}
            </span>
          </div>
          <p className="hero-email">{user?.email}</p>
          <p className="hero-uid">Vendor ID: {user?.uid?.slice(0, 16)}…</p>
        </div>
      </div>

      {/* ── Sections grid ── */}
      <div className="profile-grid">

        {/* Personal Info */}
        <Section icon={User} title="Personal Information">
          <Field label="Display Name">
            <Input
              id="profile-display-name"
              placeholder="Your public display name"
              value={profile.displayName || ''}
              onChange={(e) => setTop('displayName', e.target.value)}
            />
          </Field>
          <Field label="Support Email">
            <Input
              id="profile-support-email"
              type="email"
              placeholder="support@yourstore.com"
              value={profile.businessDetails?.supportEmail || ''}
              onChange={(e) => setNested('businessDetails', 'supportEmail', e.target.value)}
            />
          </Field>
          <Field label="Support Phone">
            <Input
              id="profile-support-phone"
              type="tel"
              placeholder="+91 9876543210"
              value={profile.businessDetails?.supportPhone || ''}
              onChange={(e) => setNested('businessDetails', 'supportPhone', e.target.value)}
            />
          </Field>
        </Section>

        {/* Business Details */}
        <Section icon={Building2} title="Business Details">
          <Field label="Business Name">
            <Input
              id="profile-business-name"
              placeholder="Registered business name"
              value={profile.businessDetails?.businessName || ''}
              onChange={(e) => setNested('businessDetails', 'businessName', e.target.value)}
            />
          </Field>
          <Field label="Business Type">
            <Select
              value={profile.businessDetails?.businessType || ''}
              onChange={(e) => setNested('businessDetails', 'businessType', e.target.value)}
              options={BUSINESS_TYPES}
              placeholder="Select business type"
            />
          </Field>
          <Field label="PAN Number">
            <Input
              id="profile-pan"
              placeholder="ABCDE1234F"
              value={profile.businessDetails?.pan || ''}
              onChange={(e) => setNested('businessDetails', 'pan', e.target.value.toUpperCase())}
              maxLength={10}
            />
          </Field>
        </Section>

        {/* GST Details */}
        <Section icon={FileText} title="GST Information">
          <Field label="GST Number">
            <Input
              id="profile-gst-number"
              placeholder="22AAAAA0000A1Z5"
              value={profile.gstDetails?.gstNumber || ''}
              onChange={(e) => setNested('gstDetails', 'gstNumber', e.target.value.toUpperCase())}
              maxLength={15}
            />
          </Field>
          <Field label="Legal Name (as per GST)">
            <Input
              id="profile-gst-legal-name"
              placeholder="Legal entity name"
              value={profile.gstDetails?.legalName || ''}
              onChange={(e) => setNested('gstDetails', 'legalName', e.target.value)}
            />
          </Field>
          <Field label="Registration State">
            <Select
              value={profile.gstDetails?.registrationState || ''}
              onChange={(e) => setNested('gstDetails', 'registrationState', e.target.value)}
              options={GST_STATES}
              placeholder="Select state"
            />
          </Field>
        </Section>

        {/* Brand Information */}
        <Section icon={Tag} title="Brand Information">
          <Field label="Brand Name">
            <Input
              id="profile-brand-name"
              placeholder="Your brand name"
              value={profile.brandInformation?.brandName || ''}
              onChange={(e) => setNested('brandInformation', 'brandName', e.target.value)}
            />
          </Field>
          <Field label="Brand Logo URL">
            <Input
              id="profile-brand-logo"
              type="url"
              placeholder="https://yourbrand.com/logo.png"
              value={profile.brandInformation?.logoUrl || ''}
              onChange={(e) => setNested('brandInformation', 'logoUrl', e.target.value)}
            />
          </Field>
          <Field label="Brand Description">
            <Textarea
              id="profile-brand-desc"
              placeholder="Describe your brand and what makes it unique…"
              value={profile.brandInformation?.description || ''}
              onChange={(e) => setNested('brandInformation', 'description', e.target.value)}
            />
          </Field>
        </Section>

      </div>

      {/* Bottom save */}
      <div className="profile-bottom-bar">
        <p className="bottom-bar-note">
          <AlertCircle size={14} />
          Changes are saved to Firestore and take effect immediately.
        </p>
        <button
          id="save-profile-bottom-btn"
          className={`save-profile-btn ${saved ? 'save-success' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 size={16} className="btn-spinner" /> Saving…</>
          ) : saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
};

export default VendorProfile;
