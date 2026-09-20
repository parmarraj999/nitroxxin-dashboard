import React from 'react';
import {
  Download,
  Edit2,
  Eye,
  Filter,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Star
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { cleanObject, getVendorId, toDate, withVendor } from '../../services/firebaseUtils';
import { uploadVendorAsset } from '../../services/mediaService';
import { moduleConfigs } from './moduleConfigs';
import BrandBikesModal from './BrandBikesModal';
import { Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import './EnterpriseModule.css';

const formatLabel = (value = '') => value
  .replace(/([A-Z])/g, ' $1')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())
  .trim();

const getValue = (record, column) => {
  if (record[column] !== undefined && record[column] !== null && record[column] !== '') {
    return record[column];
  }
  if (column === 'gstNumber') return record.gstDetails?.gstNumber;
  if (column === 'pan') return record.businessDetails?.pan;
  if (column === 'warehouse') return record.warehouseAddress?.city || record.warehouseAddress?.state;
  return undefined;
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value?.seconds || typeof value?.toDate === 'function') {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : '-';
  }
  if (Array.isArray(value)) return value.map((item) => (typeof item === 'object' ? item.name || item.title || '-' : item)).join(', ');
  if (typeof value === 'object') return Object.values(value).filter(Boolean).join(', ') || '-';
  return String(value);
};

const getInitialForm = (fields) => fields.reduce((acc, field) => {
  acc[field.key] = field.type === 'number' ? 0 : field.options?.[0] || '';
  return acc;
}, {});

const buildCsv = (rows, columns) => {
  const header = columns.map(formatLabel).join(',');
  const body = rows.map((row) => columns.map((column) => {
    const raw = formatValue(getValue(row, column)).replace(/"/g, '""');
    return `"${raw}"`;
  }).join(','));
  return [header, ...body].join('\n');
};

const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const EnterpriseModule = ({ moduleKey, createMode = false }) => {
  const config = moduleConfigs[moduleKey] || moduleConfigs.inventory;
  const navigate = useNavigate();
  const Icon = config.icon;
  const { cache, subscribeToModule } = useDataContext();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [tableFilters, setTableFilters] = React.useState({});
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [managingBikesFor, setManagingBikesFor] = React.useState(null);
  const [form, setForm] = React.useState(getInitialForm(config.fields));
  const [imageFiles, setImageFiles] = React.useState({});
  const [toast, setToast] = React.useState('');
  const [actionError, setActionError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const vendorId = getVendorId();
  const isGlobal = config.global || ['reviews', 'categories', 'brands', 'settings', 'vendors'].includes(moduleKey) || config.collectionName === 'reviews';
  const constraints = React.useMemo(() => {
    return config.filters || (isGlobal ? [] : [['vendorId', '==', vendorId]]);
  }, [config.filters, isGlobal, vendorId]);

  React.useEffect(() => {
    subscribeToModule(moduleKey, config.collectionName, constraints);
  }, [moduleKey, config.collectionName, constraints, subscribeToModule]);

  const cacheKey = `${moduleKey}-${JSON.stringify(constraints)}`;
  const cachedState = cache[cacheKey] || { data: [], loading: true, error: null };

  const records = cachedState.data;
  const loading = cachedState.loading;
  const error = actionError || cachedState.error || '';

  React.useEffect(() => {
    setForm(getInitialForm(config.fields));
    setEditing(null);
    setFormOpen(false);
    setSearch('');
    setStatusFilter('all');
    setTableFilters({});
    setActionError('');
  }, [moduleKey, config.fields]);

  const visibleRecords = React.useMemo(() => records.filter((record) => {
    const haystack = config.columns.map((column) => formatValue(getValue(record, column))).join(' ').toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(record.status || record.verificationStatus || record.priority || '').toLowerCase() === statusFilter;
    const matchesTableFilters = (config.tableFilters || []).every((filter) => !tableFilters[filter.key] || String(record[filter.key] || '') === tableFilters[filter.key]);
    return matchesSearch && matchesStatus && matchesTableFilters;
  }), [records, search, statusFilter, tableFilters, config.columns, config.tableFilters]);

  const statusOptions = React.useMemo(() => {
    const values = new Set(records.map((record) => String(record.status || record.verificationStatus || record.priority || '')).filter(Boolean));
    return ['all', ...Array.from(values)];
  }, [records]);

  const totals = React.useMemo(() => {
    const numericFields = config.fields.filter((field) => field.type === 'number').map((field) => field.key);
    const totalValue = numericFields.reduce((sum, field) => (
      sum + records.reduce((fieldSum, record) => fieldSum + Number(record[field] || 0), 0)
    ), 0);
    const activeCount = records.filter((record) => ['active', 'verified', 'paid', 'ready', 'resolved'].includes(String(record.status || record.verificationStatus || '').toLowerCase())).length;
    return { totalValue, activeCount };
  }, [records, config.fields]);

  const openCreate = () => {
    setEditing(null);
    setForm(getInitialForm(config.fields));
    setImageFiles({});
    setFormOpen(true);
  };

  React.useEffect(() => {
    if (createMode) openCreate();
  // Open the existing generic create form for the dedicated Create Event route.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createMode, moduleKey]);

  const openEdit = (record) => {
    setEditing(record);
    setForm(config.fields.reduce((acc, field) => {
      const value = getValue(record, field.key);
      acc[field.key] = field.type === 'subcategories' && typeof value === 'string'
        ? value.split(',').map((name) => ({ name: name.trim(), imageUrl: '' })).filter((subcategory) => subcategory.name)
        : value ?? (field.type === 'number' ? 0 : field.options?.[0] || '');
      return acc;
    }, {}));
    setImageFiles({});
    setFormOpen(true);
  };

  const updateField = (key, value, type) => {
    setForm((current) => ({ ...current, [key]: type === 'number' ? Number(value) : value }));
  };

  const updateSubcategory = (index, key, value) => {
    setForm((current) => {
      const subcategories = Array.isArray(current.subcategories) ? [...current.subcategories] : [];
      subcategories[index] = { ...subcategories[index], [key]: value };
      return { ...current, subcategories };
    });
  };

  const addSubcategory = () => setForm((current) => ({
    ...current,
    subcategories: [...(Array.isArray(current.subcategories) ? current.subcategories : []), { name: '', imageUrl: '' }]
  }));

  const removeSubcategory = (index) => setForm((current) => ({
    ...current,
    subcategories: (Array.isArray(current.subcategories) ? current.subcategories : []).filter((_, itemIndex) => itemIndex !== index)
  }));

  const saveRecord = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    let payload = { ...(config.defaults || {}), ...cleanObject(form) };
    const entityId = editing?.id || `${moduleKey}-${Date.now()}`;

    try {
      const subcategoryFiles = Object.entries(imageFiles).filter(([key]) => key.startsWith('subcategory-'));
      for (const [key, file] of Object.entries(imageFiles).filter(([key]) => !key.startsWith('subcategory-'))) {
        if (!file) continue;
        const uploaded = await uploadVendorAsset({ file, type: `${moduleKey}-image`, productId: entityId });
        payload[key] = uploaded.downloadUrl;
        payload[`${key}StoragePath`] = uploaded.storagePath;
        payload[`${key}MediaId`] = uploaded.id;
      }

      if (moduleKey === 'categories') {
        let subcategories = (Array.isArray(payload.subcategories) ? payload.subcategories : [])
          .map((subcategory) => ({ ...subcategory, name: subcategory.name?.trim() || '' }));
        for (const [key, file] of subcategoryFiles) {
          if (!file) continue;
          const index = Number(key.replace('subcategory-', ''));
          if (!subcategories[index]) continue;
          const uploaded = await uploadVendorAsset({ file, type: 'subcategory-image', productId: `${entityId}-${index}` });
          subcategories[index] = { ...subcategories[index], imageUrl: uploaded.downloadUrl, imageStoragePath: uploaded.storagePath, imageMediaId: uploaded.id };
        }
        payload.subcategories = subcategories.filter((subcategory) => subcategory.name);
      }

    // Merge flat vendor fields to nested Firestore schema structure for complete compatibility
    if (moduleKey === 'vendors') {
      payload = {
        ...payload,
        gstDetails: {
          gstNumber: payload.gstNumber || '',
          legalName: payload.displayName || '',
          registrationState: ''
        },
        businessDetails: {
          businessName: payload.displayName || '',
          pan: payload.pan || '',
          supportEmail: payload.supportEmail || ''
        }
      };
    }

      if (editing) {
        await updateDoc(doc(db, config.collectionName, editing.id), {
          ...payload,
          updatedAt: serverTimestamp()
        });
        setToast(`${config.title} record updated`);
      } else {
        await addDoc(collection(db, config.collectionName), {
          ...withVendor(payload),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setToast(`${config.title} record created`);
      }
      setFormOpen(false);
    } catch (saveError) {
      setActionError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (record) => {
    const label = record.name || record.displayName || record.title || record.code || record.id;
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await deleteDoc(doc(db, config.collectionName, record.id));
      setToast('Record deleted');
    } catch (deleteError) {
      setActionError(deleteError.message);
    }
  };

  const handleToggleFeatured = async (record) => {
    try {
      const isFeatured = !!record.featuredForYou;
      if (!isFeatured && moduleKey === 'events') {
        const featuredCount = records.filter((r) => r.featuredForYou).length;
        if (featuredCount >= 9) {
          alert('You can only select up to 9 featured events. Please remove an existing featured event first.');
          return;
        }
      }

      await updateDoc(doc(db, config.collectionName, record.id), {
        featuredForYou: !isFeatured,
        updatedAt: serverTimestamp()
      });
      setToast(`${config.title} featured status updated`);
    } catch (toggleError) {
      setActionError(toggleError.message);
    }
  };

  const seedRecords = async () => {
    try {
      await Promise.all((config.seed || []).map((record) => addDoc(collection(db, config.collectionName), {
        ...withVendor(record),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })));
      setToast('Sample operational records added');
    } catch (seedError) {
      setActionError(seedError.message);
    }
  };

  const exportRows = () => {
    downloadCsv(`${moduleKey}-export.csv`, buildCsv(visibleRecords, config.columns));
    setToast('CSV export generated');
  };

  return (
    <div className="enterprise-page">
      <div className="enterprise-hero">
        <div className="hero-icon" style={{ backgroundColor: `${config.accent}15`, color: config.accent }}>
          <Icon size={28} />
        </div>
        <div>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">{config.subtitle}</p>
        </div>
        <div className="enterprise-actions">
          <button className="export-btn" onClick={exportRows}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="quick-add-btn" onClick={openCreate}>
            <Plus size={16} />
            {config.primaryAction}
          </button>
        </div>
      </div>

      {(toast || error) && (
        <div className={`enterprise-toast ${error ? 'error' : ''}`}>
          <span>{error || toast}</span>
          <button onClick={() => { setToast(''); setError(''); }} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}

      <div className="enterprise-metrics">
        <div className="enterprise-metric">
          <span>Total Records</span>
          <strong>{loading ? '...' : records.length}</strong>
        </div>
        <div className="enterprise-metric">
          <span>Active / Ready</span>
          <strong>{totals.activeCount}</strong>
        </div>
        <div className="enterprise-metric">
          <span>Operational Value</span>
          <strong>{totals.totalValue ? totals.totalValue.toLocaleString() : '-'}</strong>
        </div>
        <div className="enterprise-metric">
          <span>Firestore</span>
          <strong>Live</strong>
        </div>
      </div>

      <div className="enterprise-toolbar card">
        <div className="search-wrapper enterprise-search">
          <Search size={16} className="search-icon-small" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} />
        </div>
        <div className="filter-select-wrapper">
          <Filter size={14} className="select-leading-icon" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : formatLabel(option)}</option>)}
          </select>
        </div>
        {(config.tableFilters || []).map((filter) => (
          <div className="filter-select-wrapper" key={filter.key}>
            <select value={tableFilters[filter.key] || ''} onChange={(event) => setTableFilters((current) => ({ ...current, [filter.key]: event.target.value }))}>
              <option value="">All {filter.label}</option>
              {filter.options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
            </select>
          </div>
        ))}
        <button className="export-btn" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="enterprise-table-card card">
        <div className="table-tabs">
          <span className="tab active">All ({loading ? '...' : visibleRecords.length})</span>
          <span className="tab">Live Firestore</span>
          <span className="tab">Vendor Scoped</span>
          <span className="tab">Bulk Ready</span>
        </div>

        {loading ? (
          <div className="enterprise-state">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="enterprise-state">
            <h3>No records yet</h3>
            <p>Create a record or add sample data to start working with this module.</p>
            <div className="empty-actions">
              <button className="quick-add-btn" onClick={openCreate}><Plus size={16} /> {config.primaryAction}</button>
              {(config.seed || []).length > 0 && <button className="export-btn" onClick={seedRecords}>Add Sample Data</button>}
            </div>
          </div>
        ) : (
          <div className="enterprise-table-wrap">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th className="checkbox-col"><input type="checkbox" /></th>
                  {(moduleKey === 'events' || moduleKey === 'brands') && <th className="star-col" style={{ width: '80px', textAlign: 'center' }}>Featured</th>}
                  {config.columns.map((column) => <th key={column}>{formatLabel(column)}</th>)}
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={moduleKey === 'vendors' || moduleKey === 'events' ? 'vendor-list-row' : ''}
                    onClick={() => {
                      if (moduleKey === 'vendors') navigate(`/vendors/${record.id}`);
                      if (moduleKey === 'events') navigate(`/events/${record.id}`);
                    }}
                  >
                    <td className="checkbox-col"><input type="checkbox" /></td>
                    {(moduleKey === 'events' || moduleKey === 'brands') && (
                      <td className="star-col" onClick={(event) => event.stopPropagation()} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={`star-btn ${record.featuredForYou ? 'active' : ''}`}
                          onClick={() => handleToggleFeatured(record)}
                          title={record.featuredForYou ? 'Remove from For You Page' : 'Add to For You Page'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: record.featuredForYou ? '#eab308' : '#9ca3af',
                            transition: 'color 0.2s ease, transform 0.2s ease'
                          }}
                        >
                          <Star size={18} fill={record.featuredForYou ? '#eab308' : 'none'} stroke={record.featuredForYou ? '#eab308' : 'currentColor'} />
                        </button>
                      </td>
                    )}
                    {config.columns.map((column) => (
                      <td key={column}>
                        {column === 'imageUrl' && getValue(record, column) ? (
                          <img className="brand-table-image" src={getValue(record, column)} alt={`${record.name || 'Brand'} logo`} />
                        ) : (
                          <span className={String(column).toLowerCase().includes('status') || column === 'priority' ? `module-badge ${String(getValue(record, column)).toLowerCase()}` : ''}>
                            {formatValue(getValue(record, column))}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="actions-col">
                      <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                        {moduleKey === 'vendors' && (
                          <button className="icon-btn" onClick={() => navigate(`/vendors/${record.id}`)} aria-label="View vendor details" title="View vendor details"><MoreHorizontal size={16} /></button>
                        )}
                        {moduleKey === 'events' && (
                          <button className="icon-btn" onClick={() => navigate(`/events/${record.id}`)} aria-label="View event details" title="View event details"><Eye size={16} /></button>
                        )}
                        {moduleKey === 'bikeBrands' && (
                          <button className="icon-btn text-blue" onClick={() => setManagingBikesFor(record)} aria-label="Manage Bikes" title="Manage Bikes">
                            <Bike size={16} />
                          </button>
                        )}
                        <button className="icon-btn" onClick={() => openEdit(record)} aria-label="Edit"><Edit2 size={16} /></button>
                        <button className="icon-btn text-red" onClick={() => removeRecord(record)} aria-label="Delete"><Trash2 size={16} /></button>
                        <button className="icon-btn" aria-label="More"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="module-modal-backdrop">
          <form className="module-modal" onSubmit={saveRecord}>
            <div className="modal-header">
              <div>
                <h2>{editing ? 'Edit Record' : config.primaryAction}</h2>
                <p>{config.title} data is saved directly in Firestore.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setFormOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="modal-grid">
              {config.fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' || field.type === 'subcategories' ? 'field full' : 'field'}>
                  <span>{field.label}</span>
                  {field.type === 'select' ? (
                    <select value={form[field.key] ?? ''} onChange={(event) => updateField(field.key, event.target.value, field.type)}>
                      {field.options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value, field.type)} rows={4} />
                  ) : field.type === 'image' ? (
                    <>
                      {(imageFiles[field.key] || form[field.key]) && <img className="module-image-preview" src={imageFiles[field.key] ? URL.createObjectURL(imageFiles[field.key]) : form[field.key]} alt="Selected upload preview" />}
                      <input type="file" accept="image/*" onChange={(event) => setImageFiles((current) => ({ ...current, [field.key]: event.target.files?.[0] || null }))} />
                      <small>Upload a JPG, PNG, WEBP, or other image file.</small>
                    </>
                  ) : field.type === 'subcategories' ? (
                    <div className="subcategory-editor">
                      {(Array.isArray(form.subcategories) ? form.subcategories : []).map((subcategory, index) => (
                        <div className="subcategory-entry" key={index}>
                          <input value={subcategory.name || ''} placeholder="Subcategory name" onChange={(event) => updateSubcategory(index, 'name', event.target.value)} />
                          {(subcategory.imageUrl || imageFiles[`subcategory-${index}`]) && <img className="subcategory-image-preview" src={imageFiles[`subcategory-${index}`] ? URL.createObjectURL(imageFiles[`subcategory-${index}`]) : subcategory.imageUrl} alt="Subcategory preview" />}
                          <input type="file" accept="image/*" onChange={(event) => setImageFiles((current) => ({ ...current, [`subcategory-${index}`]: event.target.files?.[0] || null }))} />
                          <button type="button" className="icon-btn text-red" onClick={() => removeSubcategory(index)} aria-label="Remove subcategory"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button type="button" className="add-subcategory-btn" onClick={addSubcategory}><Plus size={16} /> Add Subcategory</button>
                    </div>
                  ) : (
                    <input type={field.type} value={form[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value, field.type)} />
                  )}
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="export-btn" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="quick-add-btn modal-save-button" disabled={saving}>
                {saving ? <><LoaderCircle size={17} className="button-loader" /> Saving...</> : editing ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {managingBikesFor && (
        <BrandBikesModal 
          brand={managingBikesFor} 
          collectionName={config.collectionName}
          onClose={() => setManagingBikesFor(null)} 
        />
      )}
    </div>
  );
};

export default EnterpriseModule;
