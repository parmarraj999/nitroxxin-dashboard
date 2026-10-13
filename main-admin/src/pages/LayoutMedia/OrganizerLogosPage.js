import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Image as ImageIcon,
  UploadCloud,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Link2,
  ChevronDown,
  Globe,
  LoaderCircle,
  Copy
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { uploadVendorAsset } from '../../services/mediaService';
import { toDate } from '../../services/firebaseUtils';
import Pagination from '../../components/Common/Pagination';
import './OrganizerLogosPage.css';

// Formats Firestore Timestamp or Date object cleanly
const formatDate = (val) => {
  const d = toDate(val);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Preset sample organizer logos for 1-click seeding & quick picker
const SAMPLE_ORGANIZERS = [
  {
    title: 'Apex Racing Academy',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://apexracingacademy.com',
    status: 'active',
    sortOrder: 1
  },
  {
    title: 'Red Bull Motorsports',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://redbull.com/motorsports',
    status: 'active',
    sortOrder: 2
  },
  {
    title: 'MotoGP World Tour',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://motogp.com',
    status: 'active',
    sortOrder: 3
  },
  {
    title: 'KTM Adventure Club',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://ktmindia.com/adventure',
    status: 'active',
    sortOrder: 4
  },
  {
    title: 'Royal Enfield Motoverse',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://royalenfield.com/motoverse',
    status: 'active',
    sortOrder: 5
  },
  {
    title: 'FIM Speedway Grand Prix',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://fimspeedway.com',
    status: 'active',
    sortOrder: 6
  },
  {
    title: 'Monster Energy Rally',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://monsterenergy.com',
    status: 'active',
    sortOrder: 7
  },
  {
    title: 'BMW Motorrad Community',
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://bmw-motorrad.com',
    status: 'active',
    sortOrder: 8
  }
];

export default function OrganizerLogosPage({ isEmbedded = false }) {
  // Main data list from Firestore `organizer_logos`
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortOption, setSortOption] = useState('order-asc'); // 'order-asc' | 'title-asc' | 'title-desc' | 'newest' | 'oldest'

  // View state (defaults to list / table form)
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [showPreviewRibbon, setShowPreviewRibbon] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Upload state
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Form values
  const [form, setForm] = useState({
    title: '',
    image: '',
    websiteUrl: '',
    status: 'active',
    sortOrder: 1
  });

  // Action states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [lightboxItem, setLightboxItem] = useState(null);

  // Toast notification helper
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3800);
  };

  // Scroll lock for modals
  useEffect(() => {
    if (modalOpen || deleteConfirmId || lightboxItem) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setModalOpen(false);
          setDeleteConfirmId(null);
          setLightboxItem(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalOpen, deleteConfirmId, lightboxItem]);

  // Real-time Firestore sync with collection `organizer_logos`
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'organizer_logos'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || data.name || '',
            image: data.image || data.imageUrl || '',
            imageUrl: data.imageUrl || data.image || '',
            websiteUrl: data.websiteUrl || '',
            status: data.status || 'active',
            sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 1,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
        });
        setLogos(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching organizer_logos:', error);
        showToast('Error syncing organizer logos from Firestore', true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortOption]);

  // Filtered and Sorted list
  const filteredLogos = useMemo(() => {
    let result = [...logos];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.websiteUrl && item.websiteUrl.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'order-asc') {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 999;
        return orderA - orderB;
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortOption === 'newest') {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      }
      if (sortOption === 'oldest') {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      }
      return 0;
    });

    return result;
  }, [logos, search, statusFilter, sortOption]);

  // Paginated items
  const paginatedLogos = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogos.slice(startIndex, startIndex + pageSize);
  }, [filteredLogos, currentPage, pageSize]);

  // Counts
  const stats = useMemo(() => {
    const total = logos.length;
    const active = logos.filter((l) => l.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [logos]);

  // Open modal in Create mode
  const handleOpenAdd = () => {
    setEditingLogo(null);
    setForm({
      title: '',
      image: '',
      websiteUrl: '',
      status: 'active',
      sortOrder: (logos.length || 0) + 1
    });
    setImageInputMode('upload');
    setUploadProgress(0);
    setFormError('');
    setModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEdit = (item) => {
    setEditingLogo(item);
    setForm({
      title: item.title || '',
      image: item.image || item.imageUrl || '',
      websiteUrl: item.websiteUrl || '',
      status: item.status || 'active',
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 1
    });
    setImageInputMode(item.image ? 'url' : 'upload');
    setUploadProgress(0);
    setFormError('');
    setModalOpen(true);
  };

  // Image Upload handler (Firebase Storage)
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check size (< 8MB)
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB. Please upload a smaller file.', true);
      return;
    }

    setUploadingImage(true);
    setUploadProgress(10);

    try {
      const result = await uploadVendorAsset({
        file,
        type: 'organizer-logos',
        productId: 'organizers-feed',
        onProgress: (pct) => setUploadProgress(pct)
      });

      if (result && result.downloadUrl) {
        setForm((prev) => ({ ...prev, image: result.downloadUrl }));
        showToast('Logo image uploaded to storage!');
      } else {
        throw new Error('Upload succeeded but no download URL returned');
      }
    } catch (err) {
      console.error('Failed to upload organizer logo:', err);
      showToast(err.message || 'Failed to upload image to Firebase Storage', true);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Submit Add / Edit Form to Firestore `organizer_logos`
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!form.image.trim()) {
      setFormError('Logo image URL or file upload is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const trimmedTitle = form.title.trim();
      const payload = {
        title: trimmedTitle,
        image: form.image.trim(),
        // Keep standard compatibility aliases
        imageUrl: form.image.trim(),
        name: trimmedTitle,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 1,
        updatedAt: serverTimestamp()
      };

      if (editingLogo) {
        await updateDoc(doc(db, 'organizer_logos', editingLogo.id), payload);
        showToast(trimmedTitle ? `Updated "${trimmedTitle}" organizer logo!` : 'Updated organizer logo!');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'organizer_logos'), payload);
        showToast(trimmedTitle ? `Added "${trimmedTitle}" to organizer_logos!` : 'Added organizer logo!');
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Error saving organizer logo:', err);
      setFormError(err.message || 'Failed to save organizer logo');
      showToast('Error saving logo to Firestore', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Instant Status Toggle
  const handleToggleStatus = async (item, e) => {
    e?.stopPropagation();
    try {
      const nextStatus = item.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'organizer_logos', item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      showToast(`Set "${item.title}" to ${nextStatus}`);
    } catch (err) {
      console.error('Error toggling organizer logo status:', err);
      showToast('Failed to update status', true);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'organizer_logos', deleteConfirmId));
      showToast('Organizer logo deleted.');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting organizer logo:', err);
      showToast('Failed to delete logo', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 1-Click Seed Sample Organizers into `organizer_logos` collection
  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        'Populate sample event hosts & organizer logos into the "organizer_logos" collection in Firestore?'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      SAMPLE_ORGANIZERS.forEach((item) => {
        const newRef = doc(collection(db, 'organizer_logos'));
        batch.set(newRef, {
          title: item.title,
          image: item.image,
          imageUrl: item.image,
          name: item.title,
          websiteUrl: item.websiteUrl,
          status: item.status,
          sortOrder: item.sortOrder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      showToast(`Successfully seeded ${SAMPLE_ORGANIZERS.length} organizer logos!`);
    } catch (err) {
      console.error('Error seeding organizer logos:', err);
      showToast('Failed to seed sample logos: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // Copy collection name helper
  const handleCopyCollectionName = () => {
    navigator.clipboard.writeText('organizer_logos');
    showToast('Copied "organizer_logos" to clipboard!');
  };

  return (
    <div className={`organizer-logos-page ${isEmbedded ? 'embedded-mode' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`org-toast ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Top Header Banner */}
      <div className="org-hero-card">
        <div className="org-hero-left">
          <div className="org-hero-badge-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="org-hero-title-row">
              <h1 className="org-page-title">Event Hosts & Organizers Logos</h1>
              <div
                className="org-collection-pill"
                onClick={handleCopyCollectionName}
                title="Click to copy Firestore collection name"
              >
                <Layers size={13} />
                <span>organizer_logos</span>
                <Copy size={12} className="copy-icon" />
              </div>
            </div>
            <p className="org-page-subtitle">
              Manage event host and partner logos displayed on the web and mobile app event feeds.
              Data is stored directly in the Firestore <code>organizer_logos</code> collection with <code>[image, title]</code>.
            </p>
          </div>
        </div>

        <div className="org-hero-actions">
          <button
            type="button"
            className="btn-seed-sample"
            onClick={handleSeedDefaults}
            disabled={actionLoading}
            title="Populate demo organizer logos for quick testing"
          >
            <Sparkles size={16} />
            <span>Seed Sample Logos</span>
          </button>

          <button
            type="button"
            className="btn-add-organizer"
            onClick={handleOpenAdd}
          >
            <Plus size={18} />
            <span>Add Organizer Logo</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="org-stats-grid">
        <div className="org-stat-card">
          <div className="org-stat-info">
            <span className="org-stat-label">Total Logos</span>
            <span className="org-stat-value">{stats.total}</span>
          </div>
          <div className="org-stat-icon-wrap total">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-info">
            <span className="org-stat-label">Active on Feed</span>
            <span className="org-stat-value text-green">{stats.active}</span>
          </div>
          <div className="org-stat-icon-wrap active">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-info">
            <span className="org-stat-label">Hidden / Inactive</span>
            <span className="org-stat-value text-muted">{stats.inactive}</span>
          </div>
          <div className="org-stat-icon-wrap inactive">
            <Eye size={22} />
          </div>
        </div>

        <div className="org-stat-card interactive" onClick={() => setShowPreviewRibbon(!showPreviewRibbon)}>
          <div className="org-stat-info">
            <span className="org-stat-label">Live Reel Preview</span>
            <span className="org-stat-value toggle-text">
              {showPreviewRibbon ? 'Displaying Strip' : 'Hidden'}
            </span>
          </div>
          <div className="org-stat-icon-wrap preview">
            <SlidersHorizontal size={22} />
          </div>
        </div>
      </div>

      {/* Interactive Live App/Web Carousel Strip Preview */}
      {showPreviewRibbon && (
        <div className="org-ribbon-preview-card">
          <div className="org-ribbon-header">
            <div className="org-ribbon-title">
              <Sparkles size={16} color="#ff6b00" />
              <span>Live Feed Simulation: Official Event Hosts & Partners Reel</span>
            </div>
            <span className="org-ribbon-tag">Web & Mobile App Component Preview</span>
          </div>

          {logos.filter((l) => l.status === 'active').length === 0 ? (
            <div className="org-ribbon-empty">
              <span>No active organizer logos to preview. Add logos or toggle status to active.</span>
            </div>
          ) : (
            <div className="org-ribbon-track">
              {logos
                .filter((l) => l.status === 'active')
                .map((item) => (
                  <div
                    key={`preview-${item.id}`}
                    className="org-ribbon-logo-item"
                    title={`${item.title} (Active)`}
                    onClick={() => setLightboxItem(item)}
                  >
                    <div className="org-ribbon-logo-thumb">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="org-ribbon-logo-name">{item.title || 'Organizer Logo'}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Filters, Search & View Controls Bar */}
      <div className="org-controls-card">
        <div className="org-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search event hosts & organizers by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="org-filters-group">
          {/* Status Filter */}
          <div className="org-filter-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="org-select"
            >
              <option value="all">All Statuses ({logos.length})</option>
              <option value="active">Active Only ({stats.active})</option>
              <option value="inactive">Inactive Only ({stats.inactive})</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="org-filter-select-wrap">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="org-select"
            >
              <option value="order-asc">Sort: Sequence Order (1, 2, 3)</option>
              <option value="title-asc">Sort: Title (A - Z)</option>
              <option value="title-desc">Sort: Title (Z - A)</option>
              <option value="newest">Sort: Newly Added</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          {/* View Toggle (List / Grid) */}
          <div className="org-view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="List View"
            >
              <List size={16} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area: Grid View or Table View */}
      {loading ? (
        <div className="org-loading-state">
          <LoaderCircle size={38} className="spin-loader" />
          <h3>Loading Organizer Logos...</h3>
          <p>Connecting to Firestore collection <code>organizer_logos</code></p>
        </div>
      ) : filteredLogos.length === 0 ? (
        <div className="org-empty-state">
          <div className="org-empty-icon-wrap">
            <ShieldCheck size={44} />
          </div>
          <h3>No Organizer Logos Found</h3>
          <p>
            {search || statusFilter !== 'all'
              ? 'No organizer logos match your search filters. Try clearing filters.'
              : 'The "organizer_logos" collection is currently empty in Firestore.'}
          </p>
          <div className="org-empty-actions">
            {search || statusFilter !== 'all' ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-add-organizer"
                  onClick={handleOpenAdd}
                >
                  <Plus size={16} /> Add First Organizer Logo
                </button>
                <button
                  type="button"
                  className="btn-seed-sample"
                  onClick={handleSeedDefaults}
                  disabled={actionLoading}
                >
                  <Sparkles size={16} /> Seed 8 Sample Logos
                </button>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="org-grid">
          {paginatedLogos.map((item) => (
            <div
              key={item.id}
              className={`org-card ${item.status === 'inactive' ? 'inactive' : ''}`}
            >
              {/* Card Top Header: Order Badge + Status Switch */}
              <div className="org-card-top-bar">
                <span className="org-order-badge" title="Sort sequence order">
                  #{item.sortOrder || 1}
                </span>

                <div className="org-card-status-switch">
                  <button
                    type="button"
                    className={`status-pill-toggle ${item.status === 'active' ? 'active' : 'inactive'}`}
                    onClick={(e) => handleToggleStatus(item, e)}
                    title={`Click to switch to ${item.status === 'active' ? 'inactive' : 'active'}`}
                  >
                    <span className="status-dot" />
                    <span>{item.status === 'active' ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>

              {/* Logo Preview Container (Checkerboard for transparent PNGs) */}
              <div
                className="org-logo-preview-box"
                onClick={() => setLightboxItem(item)}
                title="Click to view full-size logo"
              >
                <div className="org-logo-aspect-wrapper">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x200/1e293b/ffffff?text=Logo+Not+Found';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <ImageIcon size={32} />
                      <span>No Logo Image</span>
                    </div>
                  )}
                </div>
                <div className="org-logo-zoom-overlay">
                  <Eye size={18} />
                  <span>View Fullsize</span>
                </div>
              </div>

              {/* Card Body: Title & Website */}
              <div className="org-card-body">
                <h3 className="org-card-title" title={item.title || 'Untitled Logo'}>
                  {item.title || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>Untitled Logo</span>}
                </h3>

                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="org-card-link"
                    title={item.websiteUrl}
                  >
                    <Globe size={13} />
                    <span>{item.websiteUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink size={12} className="ext-icon" />
                  </a>
                ) : (
                  <span className="org-card-no-link">No website specified</span>
                )}
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="org-card-footer">
                <button
                  type="button"
                  className="org-action-btn edit"
                  onClick={() => handleOpenEdit(item)}
                  title="Edit Organizer Logo"
                >
                  <Edit2 size={15} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className="org-action-btn delete"
                  onClick={() => setDeleteConfirmId(item.id)}
                  title="Delete Organizer Logo"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= LIST / TABLE VIEW ================= */
        <div className="org-table-container">
          <table className="org-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Order</th>
                <th style={{ width: '110px' }}>Logo</th>
                <th>Organizer / Host Title</th>
                <th style={{ width: '140px' }}>Date Added</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogos.map((item) => (
                <tr key={item.id} className={item.status === 'inactive' ? 'row-inactive' : ''}>
                  <td>
                    <span className="org-order-badge">#{item.sortOrder || 1}</span>
                  </td>
                  <td>
                    <div
                      className="org-table-thumb-box"
                      onClick={() => setLightboxItem(item)}
                      title="Click to view image"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title || 'Organizer Logo'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x60/1e293b/ffffff?text=N/A';
                          }}
                        />
                      ) : (
                        <ImageIcon size={18} color="#94a3b8" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="org-table-title-cell">
                      <strong className="org-table-title-text">
                        {item.title || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>Untitled Logo</span>}
                      </strong>
                      <div className="org-table-meta-row">
                        <span className="doc-id-pill" title="Firestore Document ID">
                          ID: {item.id.slice(0, 8)}...
                        </span>
                        {item.websiteUrl && (
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="org-table-link"
                          >
                            <Globe size={11} />
                            <span>{item.websiteUrl.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="org-table-date-text">{formatDate(item.createdAt)}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-pill-toggle ${item.status === 'active' ? 'active' : 'inactive'}`}
                      onClick={(e) => handleToggleStatus(item, e)}
                      title="Click to toggle status"
                    >
                      <span className="status-dot" />
                      <span>{item.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="org-table-actions">
                      <button
                        type="button"
                        className="org-action-icon-btn edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Logo"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="org-action-icon-btn delete"
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete Logo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredLogos.length > pageSize && (
        <div className="org-pagination-wrapper">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogos.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* ========================================================
          ADD / EDIT MODAL
          ======================================================== */}
      {modalOpen && (
        <div className="org-modal-overlay" onClick={() => !submitting && setModalOpen(false)}>
          <div className="org-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="org-modal-header">
              <div className="org-modal-header-left">
                <div className="org-modal-header-icon">
                  {editingLogo ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="org-modal-title">
                    {editingLogo ? 'Edit Event Host / Organizer Logo' : 'Add Event Host / Organizer Logo'}
                  </h2>
                  <p className="org-modal-subtitle">
                    Saves to Firestore collection <code>organizer_logos</code> with <code>image</code> and <code>title</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="org-modal-close-btn"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="org-modal-form">
              {formError && (
                <div className="org-form-alert error">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title Input (Optional) */}
              <div className="org-form-group">
                <label className="org-form-label">
                  Host / Organizer Title <span className="org-optional-badge">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="org-form-input"
                  placeholder="e.g. Apex Racing Academy, Red Bull Motorsports, KTM India (Optional)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <span className="org-form-hint">
                  Optional name or label for this event organizer logo.
                </span>
              </div>

              {/* Image Input Section (Upload or URL) */}
              <div className="org-form-group">
                <div className="org-image-mode-tabs">
                  <label className="org-form-label" style={{ margin: 0 }}>
                    Logo Image <span className="req">*</span>
                  </label>
                  <div className="org-mode-pill-group">
                    <button
                      type="button"
                      className={`org-mode-pill ${imageInputMode === 'upload' ? 'active' : ''}`}
                      onClick={() => setImageInputMode('upload')}
                    >
                      <UploadCloud size={13} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      className={`org-mode-pill ${imageInputMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageInputMode('url')}
                    >
                      <Link2 size={13} />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div className="org-upload-dropzone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    />

                    {uploadingImage ? (
                      <div className="org-upload-in-progress">
                        <LoaderCircle size={28} className="spin-loader" />
                        <span>Uploading logo image to Firebase Storage... {uploadProgress}%</span>
                        <div className="org-progress-bar">
                          <div
                            className="org-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="org-upload-trigger"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud size={32} className="upload-icon" />
                        <strong>Click to browse or drop logo file here</strong>
                        <span>Supports PNG, SVG, WebP, JPG up to 8MB. Transparent PNG/SVG recommended.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="org-url-input-wrap">
                    <input
                      type="url"
                      className="org-form-input"
                      placeholder="https://example.com/images/organizer-logo.png"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                  </div>
                )}

                {/* Instant Image Preview */}
                {form.image && (
                  <div className="org-form-image-preview-card">
                    <div className="preview-label">Selected Logo Preview:</div>
                    <div className="preview-checkerboard">
                      <img
                        src={form.image}
                        alt="Logo Preview"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x160/1e293b/ffffff?text=Image+Load+Failed';
                        }}
                      />
                    </div>
                    <div className="preview-actions">
                      <span className="preview-url-text" title={form.image}>
                        {form.image}
                      </span>
                      <button
                        type="button"
                        className="btn-clear-img"
                        onClick={() => setForm({ ...form, image: '' })}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>


              {/* Status and Sort Order Grid */}
              <div className="org-form-row-2">
                <div className="org-form-group">
                  <label className="org-form-label">Display Status</label>
                  <select
                    className="org-form-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active (Visible on Feed)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                <div className="org-form-group">
                  <label className="org-form-label">Sequence Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    className="org-form-input"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 1 })}
                  />
                  <span className="org-form-hint">Lower numbers appear first.</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="org-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-add-organizer"
                  disabled={submitting || uploadingImage}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={16} className="spin-loader" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingLogo ? 'Save Changes' : 'Add Organizer Logo'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      {deleteConfirmId && (
        <div className="org-modal-overlay" onClick={() => !actionLoading && setDeleteConfirmId(null)}>
          <div className="org-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="org-confirm-icon-wrap">
              <Trash2 size={28} />
            </div>
            <h3>Delete Organizer Logo?</h3>
            <p>
              Are you sure you want to remove this organizer logo from the <code>organizer_logos</code> Firestore collection?
              This action cannot be undone.
            </p>
            <div className="org-confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Logo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          LIGHTBOX PREVIEW MODAL
          ======================================================== */}
      {lightboxItem && (
        <div className="org-modal-overlay" onClick={() => setLightboxItem(null)}>
          <div className="org-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="org-lightbox-close"
              onClick={() => setLightboxItem(null)}
            >
              <X size={20} />
            </button>
            <div className="org-lightbox-img-wrapper">
              <img src={lightboxItem.image} alt={lightboxItem.title} />
            </div>
            <div className="org-lightbox-footer">
              <h4>{lightboxItem.title}</h4>
              {lightboxItem.websiteUrl && (
                <a
                  href={lightboxItem.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="org-lightbox-link"
                >
                  <Globe size={14} />
                  <span>{lightboxItem.websiteUrl}</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
