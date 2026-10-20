import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { uploadVendorAsset } from '../../services/mediaService';
import './TicketTemplatesPage.css';

// Preset sample 1080x1920 ticket template images for quick seeding
const SAMPLE_TICKET_TEMPLATES = [
  {
    name: 'Nitro Apex Racing Template',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1080&h=1920&q=85'
  },
  {
    name: 'Cyber Horizon Night Ride Template',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1080&h=1920&q=85'
  },
  {
    name: 'Golden Grand Prix VIP Template',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1080&h=1920&q=85'
  },
  {
    name: 'Monsoon Trail Rally Template',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&h=1920&q=85'
  },
  {
    name: 'Neon Stunt Arena Template',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1080&h=1920&q=85'
  },
  {
    name: 'Heritage Coastal Tour Template',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1080&h=1920&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1080&h=1920&q=85'
  }
];

export default function TicketTemplatesPage() {
  // Main data list from Firestore `ticket_tamplate`
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedDimensions, setDetectedDimensions] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State: only image and optional name
  const [templateName, setTemplateName] = useState('');
  const [templateImageUrl, setTemplateImageUrl] = useState('');

  // Action states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [lightboxTemplate, setLightboxTemplate] = useState(null);

  const fileInputRef = useRef(null);

  // Toast notification helper
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Scroll lock for modals
  useEffect(() => {
    if (modalOpen || deleteConfirmId || lightboxTemplate) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setModalOpen(false);
          setDeleteConfirmId(null);
          setLightboxTemplate(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalOpen, deleteConfirmId, lightboxTemplate]);

  // Real-time Firestore Sync with collection `ticket_tamplate`
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'ticket_tamplate'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const img = data.image || data.imageUrl || data.templateUrl || '';
          return {
            id: docSnap.id,
            name: data.name || data.title || `Template ${docSnap.id.slice(0, 5)}`,
            image: img,
            imageUrl: img,
            createdAt: data.createdAt
          };
        });
        setTemplates(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching ticket_tamplate:', error);
        showToast('Error syncing ticket templates from Firestore', true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Open Upload Modal
  const handleOpenUpload = () => {
    setTemplateName(`Ticket Template ${templates.length + 1}`);
    setTemplateImageUrl('');
    setDetectedDimensions(null);
    setImageInputMode('upload');
    setUploadProgress(0);
    setFormError('');
    setModalOpen(true);
  };

  // Image File Inspection & Upload (1080 x 1920 px validation)
  const inspectAndUploadFile = async (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB. Please choose a smaller file.', true);
      return;
    }

    // Inspect natural dimensions via Image object
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = async () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setDetectedDimensions({ width, height });
      URL.revokeObjectURL(objectUrl);

      // Auto-set name from file if empty or default
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTemplateName((prev) => (prev.startsWith('Ticket Template') ? cleanFileName : prev));

      // Upload to Firebase Storage
      setUploadingImage(true);
      setUploadProgress(15);

      try {
        const result = await uploadVendorAsset({
          file,
          type: 'ticket-templates',
          productId: 'ticket-images',
          onProgress: (pct) => setUploadProgress(pct)
        });

        if (result && result.downloadUrl) {
          setTemplateImageUrl(result.downloadUrl);
          showToast(`Image uploaded (${width} × ${height} px)`);
        } else {
          throw new Error('Upload succeeded but no download URL returned');
        }
      } catch (err) {
        console.warn('Fallback: reading as local Data URL:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setTemplateImageUrl(reader.result);
          showToast('Image loaded successfully');
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
        setUploadProgress(0);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      showToast('Could not parse the selected image file.', true);
    };
  };

  // Save Template to Firestore collection `ticket_tamplate`
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!templateImageUrl.trim()) {
      setFormError('Please select or upload a 1080x1920 ticket template image.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const finalName = templateName.trim() || `Ticket Template ${templates.length + 1}`;
      const payload = {
        name: finalName,
        title: finalName,
        image: templateImageUrl.trim(),
        imageUrl: templateImageUrl.trim(),
        templateUrl: templateImageUrl.trim(),
        dimensions: detectedDimensions || { width: 1080, height: 1920, aspectRatio: '9:16' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'ticket_tamplate'), payload);
      showToast('Ticket template image uploaded to collection!');
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving to ticket_tamplate:', err);
      setFormError(err.message || 'Failed to save ticket template to Firestore');
      showToast('Error saving ticket template', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Template from `ticket_tamplate`
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'ticket_tamplate', deleteConfirmId));
      showToast('Ticket template deleted.');
      setDeleteConfirmId(null);
      if (lightboxTemplate?.id === deleteConfirmId) {
        setLightboxTemplate(null);
      }
    } catch (err) {
      console.error('Error deleting ticket template:', err);
      showToast('Failed to delete template', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 1-Click Seed Sample 1080x1920 Template Images
  const handleSeedDefaults = async () => {
    if (!window.confirm('Add 6 sample 1080x1920 ticket template images to the "ticket_tamplate" collection?')) {
      return;
    }

    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      SAMPLE_TICKET_TEMPLATES.forEach((item) => {
        const newRef = doc(collection(db, 'ticket_tamplate'));
        batch.set(newRef, {
          name: item.name,
          title: item.name,
          image: item.image,
          imageUrl: item.imageUrl,
          templateUrl: item.image,
          dimensions: { width: 1080, height: 1920, aspectRatio: '9:16' },
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      showToast('6 sample 1080x1920 templates added to ticket_tamplate!');
    } catch (err) {
      console.error('Error seeding sample templates:', err);
      showToast('Failed to seed templates', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Download template image file
  const handleDownloadImage = (item, e) => {
    e?.stopPropagation();
    const link = document.createElement('a');
    link.href = item.image;
    link.download = `${item.name.toLowerCase().replace(/\s+/g, '-')}-1080x1920.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download started for ticket template image');
  };

  return (
    <div className="ticket-templates-page">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <div className="ticket-templates-header">
        <div className="ticket-header-title-wrap">
          <div className="ticket-header-badges">
            <span className="dimension-badge">1080 × 1920 PX</span>
            <span className="collection-badge">COLLECTION: ticket_tamplate</span>
          </div>
          <h1 className="page-title">
            <Ticket size={28} />
            Ticket Templates
          </h1>
          <p className="page-subtitle">
            Upload 1080x1920 px event ticket template images used in event ticket bookings and chosen by hosts.
          </p>
        </div>

        <div className="ticket-header-actions">
          <button
            type="button"
            className="btn-seed-templates"
            onClick={handleSeedDefaults}
            disabled={actionLoading}
            title="Populate sample 1080x1920 templates"
          >
            <Sparkles size={16} color="#ea580c" />
            <span>Seed 1080x1920 Samples</span>
          </button>

          <button
            type="button"
            className="btn-upload-template"
            onClick={handleOpenUpload}
          >
            <Plus size={18} />
            <span>Upload Ticket Template</span>
          </button>
        </div>
      </div>

      {/* ── 2. Info Bar ────────────────────────────────────────── */}
      <div className="ticket-info-bar">
        <span className="ticket-count-text">
          Total Uploaded Templates: <strong>{templates.length}</strong>
        </span>
        <span className="spec-info-pill">
          Resolution: 1080 × 1920 px · 9:16 Vertical Ratio
        </span>
      </div>

      {/* ── 3. Pure Image Gallery Grid (1080x1920 / 9:16 cards) ────────────────────────── */}
      {loading ? (
        <div className="ticket-empty-state">
          <RefreshCw size={32} className="spin-icon" color="#ea580c" />
          <p className="empty-sub">Syncing ticket template images from "ticket_tamplate"...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="ticket-empty-state">
          <div className="empty-icon-wrap">
            <Ticket size={32} />
          </div>
          <h3 className="empty-title">No Ticket Templates Uploaded Yet</h3>
          <p className="empty-sub">
            Upload your first 1080x1920 px ticket template image or seed samples to get started.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              className="btn-seed-templates"
              onClick={handleSeedDefaults}
            >
              <Sparkles size={16} color="#ea580c" />
              <span>Seed Samples</span>
            </button>
            <button
              type="button"
              className="btn-upload-template"
              onClick={handleOpenUpload}
            >
              <Plus size={16} />
              <span>Upload Ticket Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((item) => (
            <div key={item.id} className="template-card">
              {/* Pure 9:16 Ticket Poster Image (No text overlays) */}
              <div
                className="ticket-preview-box"
                onClick={() => setLightboxTemplate(item)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="ticket-bg-image"
                  loading="lazy"
                />

                {/* Hover Action Overlay */}
                <div className="ticket-hover-scrim">
                  <button
                    type="button"
                    className="preview-click-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxTemplate(item);
                    }}
                  >
                    <Eye size={15} />
                    <span>View Full Size</span>
                  </button>

                  <div className="preview-action-row">
                    <button
                      type="button"
                      className="preview-sub-btn"
                      onClick={(e) => handleDownloadImage(item, e)}
                      title="Download 1080x1920 image"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      className="preview-sub-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(item.id);
                      }}
                      title="Delete template"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Footer: Name & Delete */}
              <div className="template-card-footer">
                <span className="template-card-name" title={item.name}>
                  {item.name}
                </span>
                <button
                  type="button"
                  className="icon-action-btn danger"
                  onClick={() => setDeleteConfirmId(item.id)}
                  title="Delete template"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. Upload Modal ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="ticket-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="ticket-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="ticket-modal-header">
              <h2 className="ticket-modal-title">
                <Ticket size={22} color="#ea580c" />
                <span>Upload Ticket Template (1080 × 1920 px)</span>
              </h2>
              <button
                type="button"
                className="ticket-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm}>
              <div className="ticket-modal-body">
                {formError && (
                  <div className="dimension-detected-banner warn">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Input Mode Switch */}
                <div className="upload-mode-tabs">
                  <button
                    type="button"
                    className={`upload-mode-tab ${imageInputMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setImageInputMode('upload')}
                  >
                    Upload Image File
                  </button>
                  <button
                    type="button"
                    className={`upload-mode-tab ${imageInputMode === 'url' ? 'active' : ''}`}
                    onClick={() => setImageInputMode('url')}
                  >
                    Image URL
                  </button>
                </div>

                {/* File Dropzone */}
                {imageInputMode === 'upload' ? (
                  <div
                    className="upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('dragging');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragging');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragging');
                      const file = e.dataTransfer.files?.[0];
                      if (file) inspectAndUploadFile(file);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) inspectAndUploadFile(file);
                      }}
                    />
                    <UploadCloud size={34} className="dropzone-icon" />
                    <span className="dropzone-title">
                      {uploadingImage ? 'Uploading image...' : 'Click or drag & drop 1080 × 1920 px ticket image'}
                    </span>
                    <span className="dropzone-sub">PNG, JPG, or WEBP supported</span>
                    <span className="dropzone-spec">1080 × 1920 PX (9:16 VERTICAL RATIO)</span>

                    {uploadingImage && (
                      <div className="upload-progress-wrap" style={{ marginTop: 8 }}>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="progress-label">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-field-group">
                    <label className="form-field-label">Template Image URL *</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or CDN link"
                      value={templateImageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTemplateImageUrl(val);
                        if (val) {
                          const img = new Image();
                          img.src = val;
                          img.onload = () => {
                            setDetectedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                          };
                        }
                      }}
                      className="form-field-input"
                      required
                    />
                  </div>
                )}

                {/* Pure Image Preview (No text or overlays) */}
                {templateImageUrl && (
                  <div className="modal-pure-preview-wrap">
                    <div className="modal-pure-preview-box">
                      <img
                        src={templateImageUrl}
                        alt="Uploaded Ticket Preview"
                        className="modal-pure-preview-img"
                      />
                    </div>

                    {detectedDimensions && (
                      <div
                        className={`dimension-detected-banner ${
                          detectedDimensions.width === 1080 && detectedDimensions.height === 1920
                            ? 'exact'
                            : 'warn'
                        }`}
                      >
                        {detectedDimensions.width === 1080 && detectedDimensions.height === 1920 ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>✓ Exact 1080 × 1920 px detected</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} />
                            <span>
                              Image Size: {detectedDimensions.width} × {detectedDimensions.height} px (1080 × 1920 px recommended)
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Template Name */}
                <div className="form-field-group">
                  <label className="form-field-label">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nitro Track Pass Template"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="form-field-input"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="ticket-modal-footer">
                <button
                  type="button"
                  className="btn-seed-templates"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-upload-template"
                  disabled={submitting || uploadingImage || !templateImageUrl}
                >
                  {submitting ? 'Saving...' : 'Upload Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Clean Lightbox Modal (Pure Image Only) ────────────────────────── */}
      {lightboxTemplate && (
        <div className="ticket-modal-overlay" onClick={() => setLightboxTemplate(null)}>
          <div
            className="lightbox-clean-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-clean-header">
              <span className="lightbox-clean-title">{lightboxTemplate.name}</span>
              <button
                type="button"
                className="ticket-modal-close-btn"
                onClick={() => setLightboxTemplate(null)}
                style={{ color: '#ffffff' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="lightbox-clean-body">
              <div className="lightbox-clean-box">
                <img
                  src={lightboxTemplate.image}
                  alt={lightboxTemplate.name}
                  className="lightbox-clean-img"
                />
              </div>
            </div>

            <div className="lightbox-clean-footer">
              <button
                type="button"
                className="btn-seed-templates"
                onClick={(e) => handleDownloadImage(lightboxTemplate, e)}
              >
                <Download size={15} />
                <span>Download Image</span>
              </button>

              <button
                type="button"
                className="icon-action-btn danger"
                onClick={() => setDeleteConfirmId(lightboxTemplate.id)}
                title="Delete template"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Delete Confirmation Modal ────────────────────────── */}
      {deleteConfirmId && (
        <div className="ticket-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div
            className="ticket-modal-container"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ticket-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={20} />
                Delete Ticket Template?
              </h3>
              <button
                type="button"
                className="ticket-modal-close-btn"
                onClick={() => setDeleteConfirmId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="ticket-modal-body" style={{ padding: 20 }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Are you sure you want to delete this template from the <strong>ticket_tamplate</strong> collection?
              </p>
            </div>
            <div className="ticket-modal-footer">
              <button
                type="button"
                className="btn-seed-templates"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-upload-template"
                style={{ background: '#ef4444', borderColor: '#dc2626' }}
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Toast Notifications ────────────────────────────────────────── */}
      {toast && (
        <div className={`ticket-toast ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
