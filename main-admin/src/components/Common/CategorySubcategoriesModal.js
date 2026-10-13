import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, LoaderCircle, Upload, Image as ImageIcon, Check, Link as LinkIcon } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { uploadVendorAsset } from '../../services/mediaService';

// Normalize any subcategory representation into standard map structure
export const normalizeSubcategory = (item) => {
  const tempId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!item) return { _tempId: tempId, name: '', imageUrl: '', imageName: '', imageMediaId: '', imageStoragePath: '' };
  if (typeof item === 'string') {
    return { _tempId: tempId, name: item.trim(), imageUrl: '', imageName: '', imageMediaId: '', imageStoragePath: '' };
  }
  return {
    _tempId: item._tempId || tempId,
    name: item.name || '',
    imageUrl: item.imageUrl || '',
    imageName: item.imageName || '',
    imageMediaId: item.imageMediaId || '',
    imageStoragePath: item.imageStoragePath || ''
  };
};

export const normalizeSubcategoriesList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeSubcategory).filter((s) => s.name);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => normalizeSubcategory(s))
      .filter((s) => s.name);
  }
  return [];
};

export default function CategorySubcategoriesModal({ category, onClose, onSaveSuccess }) {
  const [subcategories, setSubcategories] = useState(() => {
    return normalizeSubcategoriesList(category?.subcategories);
  });

  // Map of temporary ID to pending File object: { [tempId]: File }
  const [pendingFiles, setPendingFiles] = useState({});
  
  // URL edit toggles for existing items: { [tempId]: boolean }
  const [showUrlInputs, setShowUrlInputs] = useState({});

  // New subcategory form state
  const [newSubcat, setNewSubcat] = useState({ name: '', imageUrl: '', file: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saving, onClose]);

  // Handle adding new subcategory from the top form
  const handleAddNewSubcat = () => {
    const trimmed = newSubcat.name.trim();
    if (!trimmed) {
      setError('Please enter a subcategory name.');
      return;
    }
    if (subcategories.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Subcategory "${trimmed}" already exists.`);
      return;
    }

    const tempId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item = {
      _tempId: tempId,
      name: trimmed,
      imageUrl: newSubcat.imageUrl.trim(),
      imageStoragePath: '',
      imageMediaId: ''
    };

    setSubcategories([...subcategories, item]);
    if (newSubcat.file) {
      setPendingFiles((prev) => ({ ...prev, [tempId]: newSubcat.file }));
    }

    setNewSubcat({ name: '', imageUrl: '', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
  };

  // Update existing subcategory name
  const handleUpdateName = (tempId, name) => {
    setSubcategories((prev) =>
      prev.map((s) => (s._tempId === tempId ? { ...s, name } : s))
    );
  };

  // Update existing subcategory imageUrl directly
  const handleUpdateImageUrl = (tempId, imageUrl) => {
    setSubcategories((prev) =>
      prev.map((s) => (s._tempId === tempId ? { ...s, imageUrl } : s))
    );
  };

  // Update existing subcategory image file
  const handleUpdateFile = (tempId, file) => {
    if (!file) return;
    setPendingFiles((prev) => ({ ...prev, [tempId]: file }));
  };

  // Remove a subcategory
  const handleRemove = (tempId) => {
    setSubcategories((prev) => prev.filter((s) => s._tempId !== tempId));
    setPendingFiles((prev) => {
      const copy = { ...prev };
      delete copy[tempId];
      return copy;
    });
  };

  // Drag and drop handlers for new subcategory box
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewSubcat((prev) => ({ ...prev, file }));
    }
  };

  // Save all subcategories to Firestore
  const handleSave = async () => {
    if (!category?.id) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const validSubcats = subcategories.filter((s) => s.name.trim());
      if (validSubcats.length === 0 && subcategories.length > 0) {
        setError('Subcategory name cannot be empty.');
        setSaving(false);
        return;
      }

      // Upload all pending files in parallel
      const finalSubcategories = await Promise.all(
        validSubcats.map(async (sub, idx) => {
          const file = pendingFiles[sub._tempId];
          if (file) {
            const uploaded = await uploadVendorAsset({
              file,
              type: 'subcategory-image',
              productId: `${category.id}-subcat-${Date.now()}-${idx}`
            });

            return {
              name: sub.name.trim(),
              imageUrl: uploaded.downloadUrl,
              imageName: sub.imageName || '',
              imageStoragePath: uploaded.storagePath,
              imageMediaId: uploaded.id
            };
          }

          // Preserve existing subcategory map structure
          return {
            name: sub.name.trim(),
            imageUrl: sub.imageUrl || '',
            imageName: sub.imageName || '',
            imageStoragePath: sub.imageStoragePath || '',
            imageMediaId: sub.imageMediaId || ''
          };
        })
      );

      // Update Firestore product_categories document
      const catRef = doc(db, 'product_categories', category.id);
      await updateDoc(catRef, {
        subcategories: finalSubcategories,
        updatedAt: serverTimestamp()
      });

      setSuccess('Subcategories successfully updated!');
      if (onSaveSuccess) onSaveSuccess(finalSubcategories);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error('Error saving subcategories:', err);
      setError(err.message || 'Failed to save subcategories.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 660, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.15)',
              overflow: 'hidden'
            }}>
              {category.imageUrl ? (
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <ImageIcon size={22} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Manage Subcategories
                </h3>
                <span className="subcat-pill count-badge" style={{ fontSize: '0.72rem' }}>
                  {subcategories.length} Total
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Category: <strong style={{ color: '#0f172a' }}>{category.name}</strong>
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="icon-btn" 
            onClick={onClose} 
            disabled={saving}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* ========================================================
              Section: Add New Subcategory Box
              ======================================================== */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              background: isDragging ? '#eff6ff' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: isDragging ? '2px dashed #2563eb' : '1px solid #cbd5e1',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                + Add New Subcategory
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Enter name & select image/icon
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr auto', gap: 12, alignItems: 'center' }}>
              {/* Thumbnail Selector / Preview */}
              <label 
                style={{
                  width: 84,
                  height: 74,
                  borderRadius: 8,
                  border: newSubcat.file || newSubcat.imageUrl ? '1px solid #cbd5e1' : '2px dashed #94a3b8',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }} 
                title="Click or drag image here"
              >
                {newSubcat.file ? (
                  <img 
                    src={URL.createObjectURL(newSubcat.file)} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : newSubcat.imageUrl ? (
                  <img 
                    src={newSubcat.imageUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <>
                    <Upload size={18} color="#64748b" />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4, fontWeight: 600 }}>Image</span>
                  </>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setNewSubcat({ ...newSubcat, file: f });
                  }}
                />
              </label>

              {/* Name & URL Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input 
                  type="text" 
                  value={newSubcat.name} 
                  onChange={(e) => setNewSubcat({ ...newSubcat, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewSubcat();
                    }
                  }}
                  placeholder="Subcategory Name (e.g. Full Face Helmet, Riding Boots)*"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <input 
                  type="url" 
                  value={newSubcat.imageUrl} 
                  onChange={(e) => setNewSubcat({ ...newSubcat, imageUrl: e.target.value })}
                  placeholder="Or paste direct Image URL (optional)..."
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '0.78rem',
                    color: '#64748b',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Add Button */}
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleAddNewSubcat}
                disabled={!newSubcat.name.trim()}
                style={{ height: 'fit-content', padding: '10px 16px', fontSize: '0.84rem' }}
              >
                <Plus size={16} /> Add to List
              </button>
            </div>
          </div>

          {/* ========================================================
              Section: Existing Subcategories List
              ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Subcategories ({subcategories.length})
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Edit names, replace images, or remove items below
              </span>
            </div>

            {subcategories.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                <ImageIcon size={32} color="#94a3b8" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>No subcategories added yet</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', maxWidth: 360 }}>
                  Add subcategories above to organize products inside <strong>{category.name}</strong>.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: '44vh',
                overflowY: 'auto',
                paddingRight: 4
              }}>
                {subcategories.map((sub, index) => {
                  const pendingFile = pendingFiles[sub._tempId];
                  const displayImage = pendingFile 
                    ? URL.createObjectURL(pendingFile) 
                    : sub.imageUrl;
                  const isUrlVisible = !!showUrlInputs[sub._tempId];

                  return (
                    <div 
                      key={sub._tempId} 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: '10px 14px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 52px 1fr auto auto auto',
                        gap: 12,
                        alignItems: 'center'
                      }}>
                        {/* Index # */}
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textAlign: 'center' }}>
                          #{index + 1}
                        </span>

                        {/* Subcategory Image Preview with change trigger */}
                        <label 
                          style={{
                            width: 52,
                            height: 48,
                            borderRadius: 8,
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative'
                          }} 
                          title="Click to replace image"
                        >
                          {displayImage ? (
                            <img 
                              src={displayImage} 
                              alt={sub.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <ImageIcon size={18} color="#94a3b8" />
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={(e) => handleUpdateFile(sub._tempId, e.target.files?.[0])}
                          />
                        </label>

                        {/* Subcategory Name input */}
                        <div>
                          <input 
                            type="text" 
                            value={sub.name} 
                            onChange={(e) => handleUpdateName(sub._tempId, e.target.value)} 
                            placeholder="Subcategory Name"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                          {pendingFile && (
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginTop: 2, display: 'block' }}>
                              ✓ New image selected (will upload on save)
                            </span>
                          )}
                        </div>

                        {/* Change Image Button */}
                        <label 
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Upload new image"
                        >
                          <Upload size={13} />
                          <span>{displayImage ? 'Change' : 'Upload'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={(e) => handleUpdateFile(sub._tempId, e.target.files?.[0])}
                          />
                        </label>

                        {/* Toggle URL Input Button */}
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ color: isUrlVisible ? '#2563eb' : '#64748b' }}
                          title="Edit Image URL"
                          onClick={() => setShowUrlInputs((prev) => ({ ...prev, [sub._tempId]: !prev[sub._tempId] }))}
                        >
                          <LinkIcon size={15} />
                        </button>

                        {/* Delete button */}
                        <button 
                          type="button" 
                          className="icon-btn text-danger" 
                          onClick={() => handleRemove(sub._tempId)}
                          title="Delete Subcategory"
                          disabled={saving}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Optional Expandable Image URL row */}
                      {isUrlVisible && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 40 }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>Image URL:</span>
                          <input 
                            type="url"
                            value={sub.imageUrl || ''}
                            onChange={(e) => handleUpdateImageUrl(sub._tempId, e.target.value)}
                            placeholder="https://firebasestorage... or https://..."
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              color: '#334155',
                              background: '#ffffff'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="modal-actions" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose} 
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ minWidth: 160 }}
          >
            {saving ? (
              <>
                <LoaderCircle size={16} className="button-loader" />
                <span>Saving Subcategories...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Subcategories</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
