import React, { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  Zap,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Info,
  Edit3,
  Check,
  ShieldCheck,
  Globe,
  ExternalLink,
  Building,
  User,
  CreditCard,
  MapPin,
  FileCheck
} from 'lucide-react';
import AppLayout from '../../components/AppLayout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, uploadFile } from '../../services/firebaseService';
import { saveSessionMemory } from '../../utils/sessionMemory';
import './Profile.css';

const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

// Fallback avatar
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

const Profile = () => {
  const { user, profile } = useAuth();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Notification & toast
  const [notificationSent, setNotificationSent] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // File upload state for modal
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state for all Firestore host fields shown in the screenshot
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || profile?.displayName || profile?.name || 'Ankit Hedau',
    email: profile?.email || user?.email || 'nitroxxin@gmail.com',
    phone: profile?.phone || '9174693956',
    alternatePhone: profile?.alternatePhone || '',
    organizationName: profile?.organizationName || 'Nitroxxion Global Private Limited',
    organizationType: profile?.organizationType || 'Club / Organization',
    role: profile?.role || 'Host',
    panNumber: profile?.panNumber || profile?.pan || 'AAKCN4836C',
    gstNumber: profile?.gstNumber || profile?.gst || '',
    address: profile?.address || '',
    city: profile?.city || 'Pune',
    state: profile?.state || 'maharashtra',
    country: profile?.country || 'India',
    pinCode: profile?.pinCode || '',
    bio: profile?.bio || '',
    socialLinks: {
      instagram: profile?.socialLinks?.instagram || '',
      linkedin: profile?.socialLinks?.linkedin || '',
      website: profile?.socialLinks?.website || '',
    },
  });

  // Sync state whenever profile updates from Firestore
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || profile.displayName || profile.name || 'Ankit Hedau',
        email: profile.email || user?.email || 'nitroxxin@gmail.com',
        phone: profile.phone || '9174693956',
        alternatePhone: profile.alternatePhone || '',
        organizationName: profile.organizationName || 'Nitroxxion Global Private Limited',
        organizationType: profile.organizationType || 'Club / Organization',
        role: profile.role || 'Host',
        panNumber: profile.panNumber || profile.pan || 'AAKCN4836C',
        gstNumber: profile.gstNumber || profile.gst || '',
        address: profile.address || '',
        city: profile.city || 'Pune',
        state: profile.state || 'maharashtra',
        country: profile.country || 'India',
        pinCode: profile.pinCode || '',
        bio: profile.bio || '',
        socialLinks: {
          instagram: profile?.socialLinks?.instagram || '',
          linkedin: profile?.socialLinks?.linkedin || '',
          website: profile?.socialLinks?.website || '',
        },
      });
    }
  }, [profile, user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSendNotification = () => {
    setNotificationSent(true);
    showToast(`Verification reminder sent to ${formData.email}!`);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB limit.');
      return;
    }

    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [network]: value,
      },
    }));
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalPhotoURL = profile?.photoURL || photoPreview || DEFAULT_AVATAR;

      if (photoFile && user?.uid) {
        try {
          finalPhotoURL = await uploadFile(photoFile, `users/${user.uid}/profile_${Date.now()}`);
        } catch (uploadErr) {
          console.warn('Could not upload photo to storage, keeping preview:', uploadErr);
        }
      }

      // Save all fields with their aliases to match Firestore schema
      const updatedPayload = {
        ...formData,
        displayName: formData.fullName,
        name: formData.fullName,
        pan: formData.panNumber,
        panNumber: formData.panNumber,
        gst: formData.gstNumber,
        gstNumber: formData.gstNumber,
        photoURL: finalPhotoURL,
      };

      if (user?.uid) {
        await updateUserProfile(user.uid, updatedPayload);
      }

      saveSessionMemory({
        profile: updatedPayload,
      });

      setIsEditModalOpen(false);
      showToast('Profile and organization details saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Failed to save profile: ' + (err.message || 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const currentAvatarSrc = photoPreview || profile?.photoURL || DEFAULT_AVATAR;

  // Format dates from Firestore timestamps or strings
  const parseFirestoreDate = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return String(timestamp);
  };

  const joinedDate = parseFirestoreDate(profile?.createdAt) || 'October 19, 2026';
  const approvedDate = parseFirestoreDate(profile?.approvedAt) || 'October 19, 2026';
  const approvedBy = profile?.approvedBy || 'Nitroxx Admin';
  const hostId = profile?.uid || profile?.applicationId || user?.uid || 'cFhSrP3u9XgZiskys1tW1Jq1PFm2';
  const documents = profile?.documents || [
    {
      name: 'Nitroxxion_COI.pdf',
      type: 'application/pdf',
      uploadedAt: '2026-10-19T07:47:15.142Z',
      url: '#',
    },
  ];

  return (
    <AppLayout>
      <div className="host-profile-page">
        {/* PAGE HEADER */}
        <div className="host-profile-header">
          <div className="host-profile-heading-group">
            <h1>Host Profile</h1>
            <p>Manage host identification, registered organization credentials, tax compliance, and verification details.</p>
          </div>
          <div className="host-header-actions">
            <button
              type="button"
              className="host-primary-edit-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 size={15} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* TOP ALERT / NOTIFICATION BANNER (MATCHING IMAGE 1 DESIGN) */}
        {/* <div className="host-alert-banner">
          <div className="host-alert-left">
            <div className="host-alert-icon-wrap">
              <AlertTriangle size={22} />
            </div>
            <div className="host-alert-text">
              <h4 className="host-alert-title">
                {formData.fullName} has some unverified information
              </h4>
              <p className="host-alert-desc">
                Notify {formData.fullName} to verify the information by clicking the send notification button.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`host-alert-action-btn ${notificationSent ? 'sent' : ''}`}
            onClick={handleSendNotification}
          >
            {notificationSent ? (
              <>
                <Check size={16} />
                <span>Notification Sent</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Send Notification</span>
              </>
            )}
          </button>
        </div> */}

        {/* TWO-COLUMN DETAILS CONTAINER (MATCHING IMAGE 1 WITH USER'S EXACT FIRESTORE FIELDS) */}
        <div className="host-details-container">
          <div className="host-columns-grid">
            {/* LEFT COLUMN: HOST PERSONAL & CONTACT INFORMATION */}
            <div className="host-col-block">
              <div className="host-col-header">
                <h2 className="host-col-title">Host Information</h2>
              </div>

              {/* Circular Avatar */}
              <div className="host-avatar-block">
                <img
                  src={currentAvatarSrc}
                  alt={formData.fullName}
                  className="host-avatar-image"
                />
              </div>

              {/* Left Column Fields */}
              <div className="host-fields-list">
                <div className="host-detail-row">
                  <span className="host-field-label">Host Name</span>
                  <span className="host-field-value">{formData.fullName}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Host Code / UID</span>
                  <span className="host-field-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {hostId}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Joined Date</span>
                  <span className="host-field-value">{joinedDate}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Email</span>
                  <span className="host-field-value with-alert">
                    <span>{formData.email}</span>
                    <span className="val-alert-icon" title="Email verification pending">
                      <AlertCircle size={15} />
                    </span>
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Address</span>
                  <span className="host-field-value">
                    {formData.address ? (
                      formData.address
                    ) : (
                      <span style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Not provided</span>
                        <AlertCircle size={14} />
                      </span>
                    )}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Phone Number</span>
                  <span className="host-field-value with-alert">
                    <span>{formData.phone}</span>
                    <span className="val-alert-icon" title="Phone needs verification">
                      <AlertCircle size={15} />
                    </span>
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Alternate Phone</span>
                  <span className="host-field-value">
                    {formData.alternatePhone || <span style={{ color: '#a1a1aa', fontWeight: 400 }}>Not provided</span>}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">City & State</span>
                  <span className="host-field-value">
                    {formData.city}, {formData.state}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Country & PIN</span>
                  <span className="host-field-value">
                    {formData.country} {formData.pinCode ? `· ${formData.pinCode}` : ''}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Bio</span>
                  <span className="host-field-value" style={{ fontWeight: 400, color: '#52525b' }}>
                    {formData.bio || <span style={{ color: '#a1a1aa' }}>No bio provided</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORGANIZATION, COMPLIANCE & STATUS */}
            <div className="host-col-block">
              <div className="host-col-header">
                <h2 className="host-col-title">Organization & Compliance</h2>
                <div className="fleet-header-actions">
                  <button
                    type="button"
                    className="fleet-action-btn"
                    onClick={() => setIsLegalModalOpen(true)}
                  >
                    <FileText size={14} />
                    <span>Documents ({documents.length})</span>
                  </button>
                  <button
                    type="button"
                    className="fleet-action-btn"
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    <ShieldCheck size={14} />
                    <span>Approval Details</span>
                  </button>
                </div>
              </div>

              {/* Spacer so row alignment matches left avatar */}
              <div style={{ height: "78px" }} />

              {/* Right Column Fields */}
              <div className="host-fields-list">
                <div className="host-detail-row">
                  <span className="host-field-label">Organization Name</span>
                  <span className="host-field-value">{formData.organizationName}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Organization Type</span>
                  <span className="host-field-value">{formData.organizationType}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Host Role</span>
                  <span className="host-field-value">{formData.role}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Account Status</span>
                  <span className="host-field-value">
                    <span className="host-condition-pill">
                      <span className="host-condition-bullet" />
                      <span style={{ textTransform: 'capitalize' }}>{profile?.status || 'active'}</span>
                    </span>
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Verification</span>
                  <span className="host-field-value">
                    <span className="host-condition-pill">
                      <span className="host-condition-bullet" />
                      <span>{profile?.isVerified ? 'Verified Active' : 'Pending Verification'}</span>
                    </span>
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">PAN Number</span>
                  <span className="host-field-value" style={{ fontFamily: 'monospace' }}>
                    {formData.panNumber}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">GST Number</span>
                  <span className="host-field-value">
                    {formData.gstNumber ? (
                      <span style={{ fontFamily: 'monospace' }}>{formData.gstNumber}</span>
                    ) : (
                      <span style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Not provided</span>
                        <AlertCircle size={14} />
                      </span>
                    )}
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Approved By</span>
                  <span className="host-field-value">{approvedBy}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Approved At</span>
                  <span className="host-field-value">{approvedDate}</span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Events Summary</span>
                  <span className="host-field-value">
                    {profile?.totalEventsHosted ?? 0} Events Hosted · {profile?.totalEventsJoined ?? 0} Joined
                  </span>
                </div>

                <div className="host-detail-row">
                  <span className="host-field-label">Social Channels</span>
                  <span className="host-field-value">
                    <div className="host-social-links-wrap">
                      {formData.socialLinks?.instagram ? (
                        <a
                          href={formData.socialLinks.instagram.startsWith('http') ? formData.socialLinks.instagram : `https://instagram.com/${formData.socialLinks.instagram}`}
                          target="_blank"
                          rel="noreferrer"
                          className="host-social-badge"
                        >
                          <InstagramIcon />
                          <span>Instagram</span>
                        </a>
                      ) : null}
                      {formData.socialLinks?.linkedin ? (
                        <a
                          href={formData.socialLinks.linkedin.startsWith('http') ? formData.socialLinks.linkedin : `https://${formData.socialLinks.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="host-social-badge"
                        >
                          <LinkedinIcon />
                          <span>LinkedIn</span>
                        </a>
                      ) : null}
                      {formData.socialLinks?.website ? (
                        <a
                          href={formData.socialLinks.website.startsWith('http') ? formData.socialLinks.website : `https://${formData.socialLinks.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="host-social-badge"
                        >
                          <Globe size={13} />
                          <span>Website</span>
                        </a>
                      ) : null}
                      {!formData.socialLinks?.instagram && !formData.socialLinks?.linkedin && !formData.socialLinks?.website && (
                        <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 400 }}>No social channels added</span>
                      )}
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT DETAILS POPUP MODAL (IMAGE 2 DESIGN - ALL FIRESTORE FIELDS EDITABLE) */}
        {isEditModalOpen && (
          <div className="host-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="host-modal-card" style={{ width: '740px' }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="host-modal-header">
                <h3 className="host-modal-title">Edit Profile Details</h3>
                <button
                  type="button"
                  className="host-modal-close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveModal}>
                <div className="host-modal-body">
                  {/* Left Column: Avatar upload with + badge (Matches Image 2) */}
                  <div className="modal-avatar-col">
                    <div className="modal-avatar-preview-box" onClick={triggerFileInput}>
                      <img
                        src={currentAvatarSrc}
                        alt="Upload preview"
                        className="modal-avatar-circle-img"
                      />
                      <div className="modal-avatar-plus-badge">
                        <Plus size={14} />
                      </div>
                    </div>
                    <h5 className="modal-upload-title">Upload Image</h5>
                    <p className="modal-upload-hint">Max file size: 2MB</p>
                    <button
                      type="button"
                      className="modal-add-img-btn"
                      onClick={triggerFileInput}
                    >
                      {photoFile ? 'Change Image' : 'Add Image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  {/* Vertical Dotted Divider (Matches Image 2) */}
                  <div className="modal-dotted-divider" />

                  {/* Right Column: All Firestore Fields Editable */}
                  <div className="modal-fields-col">
                    {/* SECTION 1: PERSONAL & CONTACT */}
                    <div className="modal-field-section-title">
                      <User size={13} />
                      <span>Personal & Contact Information</span>
                    </div>

                    {/* Full Name */}
                    <div className="modal-input-field">
                      <label className="modal-label-row">
                        <span>Full Name</span>
                        <span className="modal-required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="modal-text-input"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        placeholder="e.g. Ankit Hedau"
                      />
                    </div>

                    {/* Phone & Alternate Phone */}
                    <div className="modal-two-fields-row">
                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>Phone Number</span>
                          <span className="modal-required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          required
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="e.g. 9174693956"
                        />
                      </div>

                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>Alternate Phone</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.alternatePhone}
                          onChange={(e) => handleFieldChange('alternatePhone', e.target.value)}
                          placeholder="Secondary contact number"
                        />
                      </div>
                    </div>

                    {/* SECTION 2: ORGANIZATION & BUSINESS */}
                    <div className="modal-field-section-title">
                      <Building size={13} />
                      <span>Organization & Business Information</span>
                    </div>

                    {/* Organization Name & Type */}
                    <div className="modal-two-fields-row">
                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>Organization Name</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.organizationName}
                          onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                          placeholder="e.g. Nitroxxion Global Private Limited"
                        />
                      </div>

                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>Organization Type</span>
                        </label>
                        <select
                          className="modal-select-input"
                          value={formData.organizationType}
                          onChange={(e) => handleFieldChange('organizationType', e.target.value)}
                        >
                          <option value="Club / Organization">Club / Organization</option>
                          <option value="Tour Operator">Tour Operator</option>
                          <option value="Private Limited Company">Private Limited Company</option>
                          <option value="LLP">LLP</option>
                          <option value="Individual / Proprietor">Individual / Proprietor</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    {/* Role / Designation */}
                    <div className="modal-input-field">
                      <label className="modal-label-row">
                        <span>Role / Designation</span>
                        <span className="modal-info-icon-btn" title="Your designation or role in the organization">
                          <Info size={13} />
                        </span>
                      </label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={formData.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                        placeholder="e.g. Host / Director"
                      />
                    </div>

                    {/* SECTION 3: TAX & COMPLIANCE */}
                    <div className="modal-field-section-title">
                      <CreditCard size={13} />
                      <span>Tax & Compliance Information</span>
                    </div>

                    {/* PAN & GST */}
                    <div className="modal-two-fields-row">
                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>PAN Number</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.panNumber}
                          onChange={(e) => handleFieldChange('panNumber', e.target.value.toUpperCase())}
                          placeholder="e.g. AAKCN4836C"
                          maxLength={10}
                        />
                      </div>

                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>GST Number</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.gstNumber}
                          onChange={(e) => handleFieldChange('gstNumber', e.target.value.toUpperCase())}
                          placeholder="e.g. 27AAKCN4836C1Z5"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {/* SECTION 4: LOCATION & ADDRESS */}
                    <div className="modal-field-section-title">
                      <MapPin size={13} />
                      <span>Location & Address</span>
                    </div>

                    {/* Street Address */}
                    <div className="modal-input-field">
                      <label className="modal-label-row">
                        <span>Street Address</span>
                      </label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={formData.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        placeholder="Street / Office address"
                      />
                    </div>

                    {/* City & State */}
                    <div className="modal-two-fields-row">
                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>City</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          placeholder="e.g. Pune"
                        />
                      </div>

                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>State</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          placeholder="e.g. Maharashtra"
                        />
                      </div>
                    </div>

                    {/* PIN Code & Country */}
                    <div className="modal-two-fields-row">
                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>PIN Code</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.pinCode}
                          onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                          placeholder="e.g. 411001"
                        />
                      </div>

                      <div className="modal-input-field">
                        <label className="modal-label-row">
                          <span>Country</span>
                        </label>
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.country}
                          onChange={(e) => handleFieldChange('country', e.target.value)}
                          placeholder="e.g. India"
                        />
                      </div>
                    </div>

                    {/* SECTION 5: BIO & SOCIAL LINKS */}
                    <div className="modal-field-section-title">
                      <Globe size={13} />
                      <span>About & Social Presence</span>
                    </div>

                    {/* Bio */}
                    <div className="modal-input-field">
                      <label className="modal-label-row">
                        <span>About / Bio</span>
                      </label>
                      <textarea
                        rows="2"
                        className="modal-textarea"
                        value={formData.bio}
                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                        placeholder="Share a brief overview of your organization and experience..."
                      />
                    </div>

                    {/* Social Channels (Instagram, LinkedIn, Website) */}
                    <div className="modal-input-field">
                      <label className="modal-label-row">
                        <span>Social Links</span>
                      </label>
                      <div className="modal-three-fields-row">
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.socialLinks.instagram}
                          onChange={(e) => handleSocialChange('instagram', e.target.value)}
                          placeholder="Instagram handle"
                        />
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.socialLinks.linkedin}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          placeholder="LinkedIn URL"
                        />
                        <input
                          type="text"
                          className="modal-text-input"
                          value={formData.socialLinks.website}
                          onChange={(e) => handleSocialChange('website', e.target.value)}
                          placeholder="Website URL"
                        />
                      </div>
                    </div>

                    {/* Bottom Buttons: Cancel & Save Changes (Matches Image 2) */}
                    <div className="modal-footer-actions">
                      <button
                        type="button"
                        className="modal-cancel-btn"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="modal-save-btn"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="modal-spinner" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* APPROVAL DETAILS MODAL */}
        {isHistoryModalOpen && (
          <div className="host-modal-overlay" onClick={() => setIsHistoryModalOpen(false)}>
            <div className="host-modal-card" style={{ width: '560px' }} onClick={(e) => e.stopPropagation()}>
              <div className="host-modal-header">
                <h3 className="host-modal-title">Host Approval & System Credentials</h3>
                <button
                  type="button"
                  className="host-modal-close-btn"
                  onClick={() => setIsHistoryModalOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <div className="doc-modal-body">
                <div className="doc-list-group">
                  <div className="doc-item-card">
                    <div className="doc-item-left">
                      <div className="doc-icon-box">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 className="doc-title-text">Host Account Status: Active</h4>
                        <p className="doc-meta-text">Approved by {approvedBy} on {approvedDate}</p>
                      </div>
                    </div>
                    <span className="host-condition-pill">
                      <span className="host-condition-bullet" />
                      <span>Approved</span>
                    </span>
                  </div>

                  <div className="doc-item-card">
                    <div className="doc-item-left">
                      <div className="doc-icon-box">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <h4 className="doc-title-text">Application ID</h4>
                        <p className="doc-meta-text" style={{ fontFamily: 'monospace' }}>
                          {profile?.applicationId || hostId}
                        </p>
                      </div>
                    </div>
                    <span className="host-condition-pill">
                      <span className="host-condition-bullet" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="doc-item-card">
                    <div className="doc-item-left">
                      <div className="doc-icon-box">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <h4 className="doc-title-text">PAN Verification</h4>
                        <p className="doc-meta-text" style={{ fontFamily: 'monospace' }}>
                          {formData.panNumber}
                        </p>
                      </div>
                    </div>
                    <span className="host-condition-pill">
                      <span className="host-condition-bullet" />
                      <span>Valid</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOST DOCUMENTS MODAL (ACTUAL FIRESTORE DOCUMENTS ARRAY) */}
        {isLegalModalOpen && (
          <div className="host-modal-overlay" onClick={() => setIsLegalModalOpen(false)}>
            <div className="host-modal-card" style={{ width: '580px' }} onClick={(e) => e.stopPropagation()}>
              <div className="host-modal-header">
                <h3 className="host-modal-title">Host Verification Documents</h3>
                <button
                  type="button"
                  className="host-modal-close-btn"
                  onClick={() => setIsLegalModalOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <div className="doc-modal-body">
                <div className="doc-list-group">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="doc-item-card">
                      <div className="doc-item-left">
                        <div className="doc-icon-box">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="doc-title-text">{doc.name || 'Host_Document.pdf'}</h4>
                          <p className="doc-meta-text">
                            {doc.type || 'application/pdf'} · {doc.uploadedAt ? parseFirestoreDate(doc.uploadedAt) || 'Uploaded' : 'Verified'}
                          </p>
                        </div>
                      </div>
                      {doc.url && doc.url !== '#' ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="doc-download-link"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>View</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span
                          className="doc-download-link"
                          onClick={() => showToast(`Opening ${doc.name}...`)}
                        >
                          View Document
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING SUCCESS TOAST */}
        {toastMessage && (
          <div className="host-toast-notification">
            <CheckCircle2 size={16} color="#4ade80" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
