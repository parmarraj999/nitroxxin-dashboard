import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Star, 
  UploadCloud, 
  Link2,
  FileText,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Copy,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { uploadVendorAsset } from '../../services/mediaService';
import Pagination from '../../components/Common/Pagination';
import '../../components/Common/ManagementPageLayout.css';

// Preset motorcycle accessory brand packs for instant 1-click batch loading
const MOTORCYCLE_BRAND_PRESETS = [
  {
    id: 'indian_gear',
    name: 'Top Indian Gear',
    badge: '8 Brands',
    items: [
      { name: 'Rynox', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Viaterra', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Solace', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'DSG', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Mototorque', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Carbonado', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Raida', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'BBG (Biking Brotherhood)', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
    ]
  },
  {
    id: 'global_riding',
    name: 'Global Race & Helmets',
    badge: '10 Brands',
    items: [
      { name: 'Alpinestars', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Dainese', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Rev\'it', originCountry: 'Netherlands', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Klim', originCountry: 'USA', warrantyPeriod: 'Lifetime', status: 'active', imageUrl: '' },
      { name: 'Shoei', originCountry: 'Japan', warrantyPeriod: '5 Years', status: 'active', imageUrl: '' },
      { name: 'AGV', originCountry: 'Italy', warrantyPeriod: '3 Years', status: 'active', imageUrl: '' },
      { name: 'Arai', originCountry: 'Japan', warrantyPeriod: '5 Years', status: 'active', imageUrl: '' },
      { name: 'HJC', originCountry: 'South Korea', warrantyPeriod: '3 Years', status: 'active', imageUrl: '' },
      { name: 'Scorpion EXO', originCountry: 'USA', warrantyPeriod: '3 Years', status: 'active', imageUrl: '' },
      { name: 'TCX Boots', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
    ]
  },
  {
    id: 'comms_tech',
    name: 'Intercoms & Moto Tech',
    badge: '6 Brands',
    items: [
      { name: 'Sena', originCountry: 'USA', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Cardo Systems', originCountry: 'Israel', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'BluArmor', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Parani', originCountry: 'USA', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Quad Lock', originCountry: 'Australia', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Bobo Innov8', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
    ]
  },
  {
    id: 'exhaust_performance',
    name: 'Exhaust & Performance',
    badge: '6 Brands',
    items: [
      { name: 'Akrapovic', originCountry: 'Slovenia', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'SC Project', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Arrow Exhaust', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'K&N Filters', originCountry: 'USA', warrantyPeriod: '10 Years', status: 'active', imageUrl: '' },
      { name: 'BMC Air Filters', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Brembo', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
    ]
  },
  {
    id: 'touring_luggage',
    name: 'Luggage & Touring',
    badge: '6 Brands',
    items: [
      { name: 'Givi', originCountry: 'Italy', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Kriega', originCountry: 'UK', warrantyPeriod: '10 Years', status: 'active', imageUrl: '' },
      { name: 'SW-Motech', originCountry: 'Germany', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Shad', originCountry: 'Spain', warrantyPeriod: '2 Years', status: 'active', imageUrl: '' },
      { name: 'Barkbusters', originCountry: 'Australia', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
      { name: 'Zana Motorcycles', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active', imageUrl: '' },
    ]
  }
];

const createEmptyBulkRow = () => ({
  id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  name: '',
  originCountry: 'India',
  warrantyPeriod: '1 Year',
  status: 'active',
  imageUrl: '',
  imageFile: null,
  imagePreview: '',
  showUrlInput: false
});

const parseTextToRows = (rawText) => {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = [];
  
  if (lines.length === 1 && lines[0].includes(',')) {
    const parts = lines[0].split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((name) => {
      rows.push({
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name,
        originCountry: 'India',
        warrantyPeriod: '1 Year',
        status: 'active',
        imageUrl: '',
        imageFile: null,
        imagePreview: '',
        showUrlInput: false
      });
    });
    return rows;
  }

  for (const line of lines) {
    if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim());
      const name = parts[0] || '';
      if (['name', 'brand', 'brand name', 'title'].includes(name.toLowerCase())) continue;
      const originCountry = parts[1] || 'India';
      const warrantyPeriod = parts[2] || '1 Year';
      const imageUrl = parts[3] || '';
      const status = parts[4] && ['active', 'inactive'].includes(parts[4].toLowerCase()) ? parts[4].toLowerCase() : 'active';
      if (name) {
        rows.push({
          id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name,
          originCountry,
          warrantyPeriod,
          status,
          imageUrl,
          imageFile: null,
          imagePreview: imageUrl,
          showUrlInput: !!imageUrl
        });
      }
    } else {
      rows.push({
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: line,
        originCountry: 'India',
        warrantyPeriod: '1 Year',
        status: 'active',
        imageUrl: '',
        imageFile: null,
        imagePreview: '',
        showUrlInput: false
      });
    }
  }
  return rows;
};

export default function AccessoryBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Bulk Add State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState('table'); // 'table' | 'paste'
  const [bulkRows, setBulkRows] = useState([
    createEmptyBulkRow(),
    createEmptyBulkRow(),
    createEmptyBulkRow()
  ]);
  const [pasteText, setPasteText] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });
  const [bulkError, setBulkError] = useState('');
  const [bulkToast, setBulkToast] = useState('');

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    authorizedStatus: 'authorized',
    originCountry: 'India',
    warrantyPeriod: '1 Year',
    status: 'active'
  });

  // Modal body scroll lock & escape key handling
  useEffect(() => {
    if (modalOpen || bulkModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (!bulkSubmitting && bulkModalOpen) setBulkModalOpen(false);
          else if (!submitting && modalOpen) setModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalOpen, bulkModalOpen, bulkSubmitting, submitting]);

  // Real-time listener for brands
  useEffect(() => {
    const q = query(collection(db, 'brands'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBrands(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching accessory brands:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const toggleFeatured = async (brand, e) => {
    e.stopPropagation();
    try {
      const nextVal = !brand.featuredForYou;
      await updateDoc(doc(db, 'brands', brand.id), { featuredForYou: nextVal });
    } catch (err) {
      console.error('Error updating brand featured status:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setForm({
      name: '',
      imageUrl: '',
      authorizedStatus: 'authorized',
      originCountry: 'India',
      warrantyPeriod: '1 Year',
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    setUploadMode('file');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name || '',
      imageUrl: brand.imageUrl || '',
      authorizedStatus: brand.authorizedStatus || 'authorized',
      originCountry: brand.originCountry || 'India',
      warrantyPeriod: brand.warrantyPeriod || '1 Year',
      status: brand.status || 'active'
    });
    setImageFile(null);
    setImagePreview(brand.imageUrl || '');
    setUploadMode('file');
    setError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file size exceeds 8MB. Please choose a smaller image.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      let finalImageUrl = form.imageUrl.trim();

      // If user uploaded a file, upload it to storage
      if (imageFile) {
        const entityId = editingBrand?.id || `brand-${Date.now()}`;
        const uploaded = await uploadVendorAsset({
          file: imageFile,
          type: 'brands-image',
          productId: entityId
        });
        if (uploaded && uploaded.downloadUrl) {
          finalImageUrl = uploaded.downloadUrl;
        }
      }

      const payload = {
        name: form.name.trim(),
        imageUrl: finalImageUrl,
        authorizedStatus: form.authorizedStatus,
        originCountry: form.originCountry.trim() || 'India',
        warrantyPeriod: form.warrantyPeriod.trim() || '1 Year',
        status: form.status,
      };

      if (editingBrand) {
        await updateDoc(doc(db, 'brands', editingBrand.id), {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'brands'), {
          ...payload,
          featuredForYou: false,
          createdAt: serverTimestamp()
        });
      }

      setForm({ name: '', imageUrl: '', authorizedStatus: 'authorized', originCountry: 'India', warrantyPeriod: '1 Year', status: 'active' });
      setImageFile(null);
      setImagePreview('');
      setEditingBrand(null);
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving brand:', err);
      setError(err.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this accessory brand?')) {
      try {
        await deleteDoc(doc(db, 'brands', id));
      } catch (err) {
        console.error('Error deleting brand:', err);
      }
    }
  };

  // Bulk Add Handlers
  const handleOpenBulkModal = () => {
    if (bulkRows.length === 0) {
      setBulkRows([createEmptyBulkRow(), createEmptyBulkRow(), createEmptyBulkRow()]);
    }
    setBulkError('');
    setBulkToast('');
    setBulkModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    const newItems = preset.items.map((item) => ({
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: item.name,
      originCountry: item.originCountry || 'India',
      warrantyPeriod: item.warrantyPeriod || '1 Year',
      status: item.status || 'active',
      imageUrl: item.imageUrl || '',
      imageFile: null,
      imagePreview: item.imageUrl || '',
      showUrlInput: !!item.imageUrl
    }));

    const isCurrentEmpty = bulkRows.every((r) => !r.name.trim() && !r.imagePreview);
    if (isCurrentEmpty) {
      setBulkRows(newItems);
    } else {
      setBulkRows((prev) => [...prev, ...newItems]);
    }
    setBulkTab('table');
    setBulkToast(`Loaded preset "${preset.name}" (${preset.items.length} brands).`);
    setTimeout(() => setBulkToast(''), 3000);
  };

  const handleRowChange = (index, field, value) => {
    setBulkRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRowFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setBulkError(`File for row ${index + 1} exceeds 8MB.`);
        return;
      }
      setBulkRows((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
          imageUrl: ''
        };
        return copy;
      });
      setBulkError('');
    }
  };

  const handleClearRowImage = (index) => {
    setBulkRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        imageFile: null,
        imagePreview: '',
        imageUrl: '',
        showUrlInput: false
      };
      return copy;
    });
  };

  const handleAddRow = () => {
    setBulkRows((prev) => [...prev, createEmptyBulkRow()]);
  };

  const handleAddMultipleRows = (count = 5) => {
    const extra = Array.from({ length: count }, () => createEmptyBulkRow());
    setBulkRows((prev) => [...prev, ...extra]);
  };

  const handleRemoveRow = (index) => {
    setBulkRows((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      return copy.length === 0 ? [createEmptyBulkRow()] : copy;
    });
  };

  const handleClearAllRows = () => {
    setBulkRows([createEmptyBulkRow(), createEmptyBulkRow(), createEmptyBulkRow()]);
    setPasteText('');
  };

  const handleParsePaste = () => {
    const parsed = parseTextToRows(pasteText);
    if (parsed.length === 0) {
      setBulkError('No valid brand names found in the pasted text. Please check the format.');
      return;
    }
    const isCurrentEmpty = bulkRows.every((r) => !r.name.trim() && !r.imagePreview);
    if (isCurrentEmpty) {
      setBulkRows(parsed);
    } else {
      setBulkRows((prev) => [...prev, ...parsed]);
    }
    setBulkError('');
    setBulkTab('table');
    setBulkToast(`Successfully parsed and added ${parsed.length} brands!`);
    setTimeout(() => setBulkToast(''), 3000);
  };

  const handleSaveBulk = async () => {
    const validRows = bulkRows.filter((r) => r.name && r.name.trim().length > 0);
    if (validRows.length === 0) {
      setBulkError('Please enter at least one brand name before saving.');
      return;
    }

    setBulkSubmitting(true);
    setBulkError('');
    setBulkProgress({ current: 0, total: validRows.length, status: 'Starting bulk import...' });

    try {
      const preparedItems = [];
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        let finalImageUrl = (row.imageUrl || '').trim();

        if (row.imageFile) {
          setBulkProgress({
            current: i + 1,
            total: validRows.length,
            status: `Uploading logo for ${row.name}... (${i + 1}/${validRows.length})`
          });
          try {
            const uploaded = await uploadVendorAsset({
              file: row.imageFile,
              type: 'brands-image',
              productId: `brand-bulk-${Date.now()}-${i}`
            });
            if (uploaded && uploaded.downloadUrl) {
              finalImageUrl = uploaded.downloadUrl;
            }
          } catch (uploadErr) {
            console.warn(`Could not upload image for ${row.name}:`, uploadErr);
          }
        }

        preparedItems.push({
          name: row.name.trim(),
          imageUrl: finalImageUrl,
          authorizedStatus: 'authorized',
          originCountry: (row.originCountry || '').trim() || 'India',
          warrantyPeriod: (row.warrantyPeriod || '').trim() || '1 Year',
          status: row.status || 'active',
          featuredForYou: false,
          createdAt: serverTimestamp()
        });
      }

      setBulkProgress({
        current: validRows.length,
        total: validRows.length,
        status: 'Saving brands to Firestore database...'
      });

      // Write in batches of up to 400
      const chunkSize = 400;
      const brandsCol = collection(db, 'brands');
      for (let i = 0; i < preparedItems.length; i += chunkSize) {
        const chunk = preparedItems.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const item of chunk) {
          const newDocRef = doc(brandsCol);
          batch.set(newDocRef, item);
        }
        await batch.commit();
      }

      // Success cleanup
      setBulkModalOpen(false);
      setBulkRows([createEmptyBulkRow(), createEmptyBulkRow(), createEmptyBulkRow()]);
      setPasteText('');
    } catch (err) {
      console.error('Error during bulk brand save:', err);
      setBulkError(err.message || 'Failed to bulk save brands. Please try again.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const visibleBrands = brands.filter((b) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.originCountry || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginatedBrands = visibleBrands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const validBulkRowsCount = bulkRows.filter((r) => r.name && r.name.trim().length > 0).length;

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accessory Brands</h1>
          <p className="page-subtitle">Manage manufacturer authorizations, warranty terms, and featured partner brands.</p>
        </div>
        <div className="header-actions-main">
          <button 
            type="button"
            className="btn-secondary" 
            onClick={handleOpenBulkModal}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <UploadCloud size={16} />
            Bulk Add Brands
          </button>
          <button 
            className="btn-primary" 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Add Accessory Brand
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="management-metrics">
        <div className="management-metric">
          <span>Total Brands</span>
          <strong>{loading ? '...' : brands.length}</strong>
        </div>
        <div className="management-metric">
          <span>Authorized</span>
          <strong>{brands.filter((b) => (b.authorizedStatus || 'authorized') === 'authorized').length}</strong>
        </div>
        <div className="management-metric">
          <span>Active</span>
          <strong>{brands.filter((b) => b.status === 'active').length}</strong>
        </div>
        <div className="management-metric">
          <span>Featured on Web</span>
          <strong>{brands.filter((b) => b.featuredForYou).length}</strong>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="management-toolbar">
          <div className="search-wrapper enterprise-search">
            <Search size={16} className="search-icon-small" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search brand name or origin..." 
            />
          </div>
        </div>

        {loading ? (
          <div className="enterprise-state">Loading brands...</div>
        ) : visibleBrands.length === 0 ? (
          <div className="enterprise-state">
            <ShieldCheck size={32} />
            <h3>No brands found</h3>
            <p>Add a new accessory brand to your catalog.</p>
          </div>
        ) : (
          <>
            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>★</th>
                    <th style={{ width: 60 }}>Logo</th>
                    <th>Brand Name</th>
                    <th>Authorization</th>
                    <th>Origin</th>
                    <th>Warranty</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands.map((b) => (
                    <tr key={b.id}>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button"
                          className={`star-btn ${b.featuredForYou ? 'active' : ''}`}
                          onClick={(e) => toggleFeatured(b, e)}
                          title={b.featuredForYou ? 'Remove from Web Hero' : 'Add to Web Hero'}
                        >
                          <Star size={16} fill={b.featuredForYou ? '#eab308' : 'none'} stroke={b.featuredForYou ? '#eab308' : '#9ca3af'} />
                        </button>
                      </td>
                      <td>
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name} className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={16} color="#9ca3af" />
                          </div>
                        )}
                      </td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{b.name}</strong></td>
                      <td>
                        <span className={`management-badge ${b.authorizedStatus === 'authorized' ? 'active' : 'draft'}`}>
                          {b.authorizedStatus || 'Authorized'}
                        </span>
                      </td>
                      <td>{b.originCountry || '-'}</td>
                      <td>{b.warrantyPeriod || '-'}</td>
                      <td>
                        <span className={`management-badge ${b.status || 'active'}`}>
                          {b.status || 'active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            className="icon-btn" 
                            style={{ color: '#0f766e' }}
                            title="Edit Brand"
                            onClick={() => handleOpenEdit(b)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            type="button"
                            className="icon-btn text-danger" 
                            title="Delete Brand"
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleBrands.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Brand Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>{editingBrand ? 'Edit Accessory Brand' : 'Add Accessory Brand'}</h3>
              <button type="button" className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBrand}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {error && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Brand Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Axor, Alpinestars, MT Helmets" 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                {/* Brand Logo Image with File Upload option like before */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontWeight: 600, margin: 0 }}>Brand Logo Image</label>
                    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '2px 4px', borderRadius: 6 }}>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        style={{
                          border: 'none',
                          background: uploadMode === 'file' ? '#ffffff' : 'transparent',
                          color: uploadMode === 'file' ? 'var(--primary-orange, #ff6b00)' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: uploadMode === 'file' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        <UploadCloud size={12} /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        style={{
                          border: 'none',
                          background: uploadMode === 'url' ? '#ffffff' : 'transparent',
                          color: uploadMode === 'url' ? 'var(--primary-orange, #ff6b00)' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: uploadMode === 'url' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        <Link2 size={12} /> Image URL
                      </button>
                    </div>
                  </div>

                  {/* Logo Preview Container */}
                  {(imagePreview || form.imageUrl) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm, 6px)',
                      marginBottom: 8
                    }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: 4,
                        flexShrink: 0
                      }}>
                        <img
                          src={imagePreview || form.imageUrl}
                          alt="Logo Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {imageFile ? imageFile.name : (form.name ? `${form.name} Logo` : 'Brand Logo')}
                        </div>
                        <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                          {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Ready to use'}
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setForm({ ...form, imageUrl: '' });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          background: '#fee2e2',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {uploadMode === 'file' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px dashed var(--border-color)',
                          background: '#f8fafc',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      />
                      <small style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>
                        Upload a PNG, JPG, SVG or WEBP file from your computer (transparent PNG recommended).
                      </small>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="url" 
                        value={form.imageUrl} 
                        onChange={(e) => {
                          setForm({ ...form, imageUrl: e.target.value });
                          setImagePreview(e.target.value);
                          setImageFile(null);
                        }} 
                        placeholder="https://..." 
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                      />
                      <small style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>
                        Paste direct web image link.
                      </small>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Origin Country</label>
                    <input 
                      type="text" 
                      value={form.originCountry} 
                      onChange={(e) => setForm({ ...form, originCountry: e.target.value })} 
                      placeholder="e.g. India, Italy" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Warranty</label>
                    <input 
                      type="text" 
                      value={form.warrantyPeriod} 
                      onChange={(e) => setForm({ ...form, warrantyPeriod: e.target.value })} 
                      placeholder="e.g. 1 Year" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingBrand ? 'Save Changes' : 'Add Brand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BULK ADD BRANDS MODAL
          ========================================================================= */}
      {bulkModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => { if (!bulkSubmitting) setBulkModalOpen(false); }}
          style={{ zIndex: 10001 }}
        >
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: 1060, 
              width: '95%', 
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 10, 
                  background: 'rgba(255, 107, 0, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#ff6b00'
                }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Bulk Add Accessory Brands
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      background: validBulkRowsCount > 0 ? '#dcfce7' : '#f1f5f9', 
                      color: validBulkRowsCount > 0 ? '#15803d' : '#64748b' 
                    }}>
                      {validBulkRowsCount} {validBulkRowsCount === 1 ? 'brand' : 'brands'} ready
                    </span>
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Quickly onboard multiple motorcycle gear, helmet, exhaust, and accessories manufacturers.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { if (!bulkSubmitting) setBulkModalOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 6 }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets Ribbon */}
            <div style={{ 
              padding: '10px 22px', 
              background: '#f8fafc', 
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Sparkles size={13} color="#ff6b00" /> Presets:
              </span>
              {MOTORCYCLE_BRAND_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  disabled={bulkSubmitting}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 20,
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff6b00';
                    e.currentTarget.style.color = '#ff6b00';
                    e.currentTarget.style.background = 'rgba(255, 107, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <span>{p.name}</span>
                  <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: 8, background: '#f1f5f9', color: '#64748b' }}>
                    {p.badge}
                  </span>
                </button>
              ))}
              {bulkToast && (
                <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={13} /> {bulkToast}
                </span>
              )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 22px' }}>
              <button
                type="button"
                onClick={() => setBulkTab('table')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: bulkTab === 'table' ? '2px solid #ff6b00' : '2px solid transparent',
                  color: bulkTab === 'table' ? '#ff6b00' : '#64748b',
                  fontWeight: bulkTab === 'table' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Layers size={15} />
                Table Spreadsheet ({bulkRows.length} rows)
              </button>
              <button
                type="button"
                onClick={() => setBulkTab('paste')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: bulkTab === 'paste' ? '2px solid #ff6b00' : '2px solid transparent',
                  color: bulkTab === 'paste' ? '#ff6b00' : '#64748b',
                  fontWeight: bulkTab === 'paste' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FileText size={15} />
                Quick Paste / CSV Import
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
              {/* TAB 1: SPREADSHEET TABLE */}
              {bulkTab === 'table' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ 
                    overflowX: 'auto', 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0',
                    maxHeight: '440px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 3, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                          <th style={{ width: 34, padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>#</th>
                          <th style={{ minWidth: 170, padding: '10px 10px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Brand Name <span style={{ color: '#ef4444' }}>*</span></th>
                          <th style={{ minWidth: 200, padding: '10px 10px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Logo / Image</th>
                          <th style={{ minWidth: 130, padding: '10px 10px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Origin Country</th>
                          <th style={{ minWidth: 120, padding: '10px 10px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Warranty</th>
                          <th style={{ minWidth: 110, padding: '10px 10px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Status</th>
                          <th style={{ width: 44, padding: '10px 8px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, idx) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, padding: '8px 4px' }}>
                              {idx + 1}
                            </td>
                            {/* Brand Name */}
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                                placeholder="e.g. Rynox"
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  fontSize: '0.84rem',
                                  borderRadius: 5,
                                  border: row.name.trim() ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                                  fontWeight: row.name.trim() ? 600 : 400
                                }}
                              />
                            </td>
                            {/* Logo / Image */}
                            <td style={{ padding: '8px 10px' }}>
                              {row.imagePreview ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <img 
                                    src={row.imagePreview} 
                                    alt="Preview" 
                                    style={{ width: 34, height: 34, borderRadius: 5, objectFit: 'contain', background: '#f1f5f9', border: '1px solid #e2e8f0' }} 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleClearRowImage(idx)}
                                    style={{
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      border: 'none',
                                      padding: '3px 8px',
                                      borderRadius: 4,
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Clear
                                  </button>
                                </div>
                              ) : row.showUrlInput ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <input
                                    type="url"
                                    value={row.imageUrl}
                                    onChange={(e) => {
                                      handleRowChange(idx, 'imageUrl', e.target.value);
                                      handleRowChange(idx, 'imagePreview', e.target.value);
                                    }}
                                    placeholder="https://... logo.png"
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      fontSize: '0.78rem',
                                      borderRadius: 4,
                                      border: '1px solid #cbd5e1'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRowChange(idx, 'showUrlInput', false)}
                                    title="Switch to file upload"
                                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    File?
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <label style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '5px 9px',
                                    borderRadius: 5,
                                    background: '#f8fafc',
                                    border: '1px dashed #cbd5e1',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    color: '#334155',
                                    fontWeight: 600
                                  }}>
                                    <UploadCloud size={13} color="#ff6b00" /> Upload
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      hidden 
                                      onChange={(e) => handleRowFileChange(idx, e)} 
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRowChange(idx, 'showUrlInput', true)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#3b82f6',
                                      fontSize: '0.73rem',
                                      cursor: 'pointer',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    or URL
                                  </button>
                                </div>
                              )}
                            </td>
                            {/* Origin Country */}
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="text"
                                value={row.originCountry}
                                onChange={(e) => handleRowChange(idx, 'originCountry', e.target.value)}
                                placeholder="India"
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  fontSize: '0.84rem',
                                  borderRadius: 5,
                                  border: '1px solid #cbd5e1'
                                }}
                              />
                            </td>
                            {/* Warranty Period */}
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="text"
                                value={row.warrantyPeriod}
                                onChange={(e) => handleRowChange(idx, 'warrantyPeriod', e.target.value)}
                                placeholder="1 Year"
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  fontSize: '0.84rem',
                                  borderRadius: 5,
                                  border: '1px solid #cbd5e1'
                                }}
                              />
                            </td>
                            {/* Status */}
                            <td style={{ padding: '8px 10px' }}>
                              <select
                                value={row.status}
                                onChange={(e) => handleRowChange(idx, 'status', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '7px 8px',
                                  fontSize: '0.84rem',
                                  borderRadius: 5,
                                  border: '1px solid #cbd5e1'
                                }}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </td>
                            {/* Actions */}
                            <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                title="Remove row"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  padding: 4,
                                  borderRadius: 4
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Control Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleAddRow}
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        <Plus size={14} /> Add Row
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleAddMultipleRows(5)}
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        +5 Rows
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClearAllRows}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', color: '#dc2626' }}
                      >
                        <Trash2 size={14} /> Clear All
                      </button>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      <strong style={{ color: '#0f172a' }}>{validBulkRowsCount}</strong> valid brand{validBulkRowsCount === 1 ? '' : 's'} ready for Firestore
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUICK PASTE / CSV */}
              {bulkTab === 'paste' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    background: '#f8fafc', 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    color: '#475569',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 4 }}>
                      Paste formats supported:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      <li><strong>List of Names:</strong> Paste brand names line by line (e.g. <code>Rynox</code>, <code>Viaterra</code>, <code>Solace</code>).</li>
                      <li><strong>Comma Separated:</strong> <code>Rynox, Viaterra, Mototorque, Carbonado</code></li>
                      <li><strong>Full CSV:</strong> <code>Brand Name, Origin Country, Warranty, Image URL</code></li>
                    </ul>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.84rem' }}>Paste Text or CSV:</label>
                    <textarea
                      rows={10}
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={`Rynox\nViaterra\nSolace\nDSG\nAlpinestars, Italy, 2 Years\nDainese, Italy, 2 Years\nShoei, Japan, 5 Years`}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontFamily: 'monospace',
                        fontSize: '0.86rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        lineHeight: 1.5
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleParsePaste}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                      <ArrowRight size={15} /> Parse & Load into Table Editor
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setPasteText(`Rynox, India, 1 Year\nViaterra, India, 1 Year\nSolace, India, 1 Year\nAlpinestars, Italy, 2 Years\nDainese, Italy, 2 Years\nShoei, Japan, 5 Years\nAkrapovic, Slovenia, 2 Years`)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Copy size={13} /> Load Sample CSV
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="modal-actions" style={{ 
              padding: '14px 22px', 
              borderTop: '1px solid #e2e8f0', 
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Left side feedback / error */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {bulkSubmitting && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b00', fontSize: '0.84rem', fontWeight: 600 }}>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{bulkProgress.status || 'Saving brands...'}</span>
                  </div>
                )}
                {!bulkSubmitting && bulkError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: '0.82rem' }}>
                    <AlertCircle size={15} />
                    <span>{bulkError}</span>
                  </div>
                )}
              </div>

              {/* Right side action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { if (!bulkSubmitting) setBulkModalOpen(false); }}
                  disabled={bulkSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveBulk}
                  disabled={bulkSubmitting || validBulkRowsCount === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {bulkSubmitting ? (
                    'Saving Brands...'
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Save {validBulkRowsCount} {validBulkRowsCount === 1 ? 'Brand' : 'Brands'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
