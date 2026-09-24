import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Eye,
  Star,
  LoaderCircle,
  X,
  ChevronDown
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import { cleanObject, getVendorId, toDate, withVendor } from '../../services/firebaseUtils';
import { uploadVendorAsset } from '../../services/mediaService';
import { useDataContext } from '../../context/DataContext';
import './ManagementPageLayout.css';

const formatLabel = (value = '') =>
  value
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
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value?.seconds || typeof value?.toDate === 'function') {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : '-';
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'object' ? item.name || item.title || '-' : item))
      .join(', ');
  }
  if (typeof value === 'object') return Object.values(value).filter(Boolean).join(', ') || '-';
  return String(value);
};

const buildCsv = (rows, columns) => {
  const header = columns.map(formatLabel).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const raw = formatValue(getValue(row, column)).replace(/"/g, '""');
          return `"${raw}"`;
        })
        .join(',')
    )
    .join('\n');
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

const ManagementPageLayout = ({
  pageKey,
  title,
  subtitle,
  icon: Icon,
  accent = '#ff6b00',
  collectionName,
  primaryAction = 'Add New',
  onPrimaryAction,
  createMode = false,
  global = true,
  filters = [],
  tableFiltersConfig = [],
  fields = [],
  columns = [],
  columnLabels = {},
  customRenderers = {},
  metricsConfig,
  enableStar = false,
  onRowClick,
  onViewClick,
  extraRowActions,
  extraModals,
  defaults = {}
}) => {
  const navigate = useNavigate();
  const { cache, subscribeToModule } = useDataContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableFilters, setTableFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState({});

  const initialForm = useMemo(() => {
    return fields.reduce((acc, field) => {
      acc[field.key] = field.type === 'number' ? 0 : field.options?.[0] || '';
      return acc;
    }, {});
  }, [fields]);

  const [form, setForm] = useState(initialForm);

  const vendorId = getVendorId();
  const constraints = useMemo(() => {
    return filters.length > 0 ? filters : global ? [] : [['vendorId', '==', vendorId]];
  }, [filters, global, vendorId]);

  useEffect(() => {
    subscribeToModule(pageKey, collectionName, constraints);
  }, [pageKey, collectionName, constraints, subscribeToModule]);

  const cacheKey = `${pageKey}-${JSON.stringify(constraints)}`;
  const cachedState = cache[cacheKey] || { data: [], loading: true, error: null };
  const records = cachedState.data;
  const loading = cachedState.loading;
  const error = actionError || cachedState.error || '';

  useEffect(() => {
    if (createMode) {
      setEditing(null);
      setForm(initialForm);
      setImageFiles({});
      setFormOpen(true);
    }
  }, [createMode, initialForm]);

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const haystack = columns.map((col) => formatValue(getValue(record, col))).join(' ').toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        String(record.status || record.verificationStatus || record.priority || '').toLowerCase() ===
          statusFilter;
      const matchesTableFilters = (tableFiltersConfig || []).every(
        (filter) => !tableFilters[filter.key] || String(record[filter.key] || '') === tableFilters[filter.key]
      );
      return matchesSearch && matchesStatus && matchesTableFilters;
    });
  }, [records, search, statusFilter, tableFilters, columns, tableFiltersConfig]);

  const statusOptions = useMemo(() => {
    const values = new Set(
      records.map((r) => String(r.status || r.verificationStatus || r.priority || '')).filter(Boolean)
    );
    return ['all', ...Array.from(values)];
  }, [records]);

  // Metrics calculation
  const computedMetrics = useMemo(() => {
    if (typeof metricsConfig === 'function') {
      return metricsConfig(records);
    }
    if (Array.isArray(metricsConfig)) {
      return metricsConfig;
    }
    const numericFields = fields.filter((f) => f.type === 'number').map((f) => f.key);
    const totalSum = numericFields.reduce((sum, field) => {
      return sum + records.reduce((fSum, r) => fSum + Number(r[field] || 0), 0);
    }, 0);
    const activeCount = records.filter((r) =>
      ['active', 'verified', 'paid', 'ready', 'resolved', 'published', 'confirmed'].includes(
        String(r.status || r.verificationStatus || '').toLowerCase()
      )
    ).length;

    return [
      { label: `Total ${title}`, value: records.length },
      { label: 'Active / Published', value: activeCount },
      { label: 'Filtered', value: visibleRecords.length },
      { label: 'Volume Metric', value: totalSum > 0 ? totalSum.toLocaleString() : records.length }
    ];
  }, [records, metricsConfig, fields, title, visibleRecords.length]);

  const openCreate = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    setEditing(null);
    setForm(initialForm);
    setImageFiles({});
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    const populated = fields.reduce((acc, field) => {
      const value = getValue(record, field.key);
      acc[field.key] =
        field.type === 'subcategories' && typeof value === 'string'
          ? value
              .split(',')
              .map((name) => ({ name: name.trim(), imageUrl: '' }))
              .filter((sub) => sub.name)
          : value ?? (field.type === 'number' ? 0 : field.options?.[0] || '');
      return acc;
    }, {});
    setForm(populated);
    setImageFiles({});
    setFormOpen(true);
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`Are you sure you want to delete this ${title} record?`)) return;
    try {
      await deleteDoc(doc(db, collectionName, record.id));
      setToast('Record deleted successfully');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggleStar = async (record) => {
    try {
      const isFeatured = !!record.featuredForYou;
      if (!isFeatured && pageKey === 'events') {
        const count = records.filter((r) => r.featuredForYou).length;
        if (count >= 9) {
          alert('You can select a maximum of 9 featured events. Please unstar another event first.');
          return;
        }
      }
      await updateDoc(doc(db, collectionName, record.id), {
        featuredForYou: !isFeatured,
        updatedAt: serverTimestamp()
      });
      setToast('Featured status updated');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    let payload = { ...defaults, ...cleanObject(form) };
    const entityId = editing?.id || `${pageKey}-${Date.now()}`;

    try {
      const subcategoryFiles = Object.entries(imageFiles).filter(([key]) => key.startsWith('subcategory-'));
      for (const [key, file] of Object.entries(imageFiles).filter(([key]) => !key.startsWith('subcategory-'))) {
        if (!file) continue;
        const uploaded = await uploadVendorAsset({ file, type: `${pageKey}-image`, productId: entityId });
        payload[key] = uploaded.downloadUrl;
        payload[`${key}StoragePath`] = uploaded.storagePath;
        payload[`${key}MediaId`] = uploaded.id;
      }

      if (pageKey === 'categories') {
        let subcategories = (Array.isArray(payload.subcategories) ? payload.subcategories : []).map(
          (subcategory) => ({ ...subcategory, name: subcategory.name?.trim() || '' })
        );
        for (const [key, file] of subcategoryFiles) {
          if (!file) continue;
          const index = Number(key.replace('subcategory-', ''));
          if (!subcategories[index]) continue;
          const uploaded = await uploadVendorAsset({
            file,
            type: 'subcategory-image',
            productId: `${entityId}-${index}`
          });
          subcategories[index] = {
            ...subcategories[index],
            imageUrl: uploaded.downloadUrl,
            imageStoragePath: uploaded.storagePath,
            imageMediaId: uploaded.id
          };
        }
        payload.subcategories = subcategories.filter((subcategory) => subcategory.name);
      }

      if (pageKey === 'vendors') {
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
        await updateDoc(doc(db, collectionName, editing.id), {
          ...payload,
          updatedAt: serverTimestamp()
        });
        setToast(`${title} record updated successfully`);
      } else {
        await addDoc(collection(db, collectionName), {
          ...withVendor(payload),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setToast(`${title} record created successfully`);
      }
      setFormOpen(false);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-page">
      {toast && (
        <div className="management-toast">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {error && (
        <div className="management-toast error">
          <span>{error}</span>
          <button type="button" onClick={() => setActionError('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="management-hero">
        {Icon && (
          <div className="management-hero-icon" style={{ backgroundColor: `${accent}15`, color: accent }}>
            <Icon size={28} />
          </div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="management-actions">
          <button
            type="button"
            className="export-btn"
            onClick={() => downloadCsv(`${pageKey}-export.csv`, buildCsv(visibleRecords, columns))}
          >
            <Download size={16} /> Export CSV
          </button>
          {primaryAction && (
            <button type="button" className="quick-add-btn" onClick={openCreate} style={{ background: accent }}>
              <Plus size={16} /> {primaryAction}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="management-metrics">
        {computedMetrics.map((m, idx) => (
          <div className="management-metric" key={idx}>
            <span>{m.label}</span>
            <strong>{loading ? '...' : m.value}</strong>
            {m.sub && <small style={{ color: accent, display: 'block', marginTop: '4px' }}>{m.sub}</small>}
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="management-toolbar">
          <div className="search-wrapper management-search">
            <Search size={16} className="search-icon-small" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>

          <div className="management-select-wrapper">
            <Filter size={15} className="select-leading-icon" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Status: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-trailing-icon" />
          </div>

          {tableFiltersConfig.map((tf) => (
            <div key={tf.key} className="management-select-wrapper">
              <select
                value={tableFilters[tf.key] || ''}
                onChange={(e) => setTableFilters((p) => ({ ...p, [tf.key]: e.target.value }))}
              >
                <option value="">{tf.label}: All</option>
                {tf.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="management-empty-state">
            <LoaderCircle size={32} className="button-loader" style={{ color: accent }} />
            <p>Loading {title.toLowerCase()}...</p>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="management-empty-state">
            {Icon && <Icon size={36} color="#94a3b8" />}
            <h3>No {title} Found</h3>
            <p>Records will appear here once added or matched by current filters.</p>
            {primaryAction && (
              <button type="button" className="quick-add-btn" onClick={openCreate} style={{ background: accent }}>
                <Plus size={15} /> {primaryAction}
              </button>
            )}
          </div>
        ) : (
          <div className="management-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  {enableStar && <th className="star-col">Star</th>}
                  {columns.map((col) => (
                    <th key={col}>{columnLabels[col] || formatLabel(col)}</th>
                  ))}
                  <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={onRowClick ? 'clickable-row' : ''}
                    onClick={() => onRowClick && onRowClick(record)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" />
                    </td>

                    {enableStar && (
                      <td className="star-col" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`star-btn ${record.featuredForYou ? 'active' : ''}`}
                          onClick={() => handleToggleStar(record)}
                          title={record.featuredForYou ? 'Remove featured star' : 'Star as featured'}
                        >
                          <Star size={18} fill={record.featuredForYou ? '#eab308' : 'none'} />
                        </button>
                      </td>
                    )}

                    {columns.map((col) => {
                      if (customRenderers[col]) {
                        return (
                          <td key={col} onClick={(e) => col === 'actions' && e.stopPropagation()}>
                            {customRenderers[col](getValue(record, col), record)}
                          </td>
                        );
                      }

                      const val = getValue(record, col);
                      const isImg =
                        col.toLowerCase().includes('image') ||
                        (typeof val === 'string' && val.startsWith('https://images.unsplash.com'));

                      if (isImg && val) {
                        return (
                          <td key={col}>
                            <img src={val} alt="thumb" className="table-thumbnail" />
                          </td>
                        );
                      }

                      const isStatus =
                        col.toLowerCase().includes('status') || col === 'priority' || col === 'verificationStatus';

                      if (isStatus) {
                        return (
                          <td key={col}>
                            <span className={`management-badge ${String(val).toLowerCase()}`}>
                              {formatValue(val)}
                            </span>
                          </td>
                        );
                      }

                      return <td key={col}>{formatValue(val)}</td>;
                    })}

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="management-actions-cell">
                        {onViewClick && (
                          <button
                            type="button"
                            className="management-icon-btn"
                            title="View Details"
                            onClick={() => onViewClick(record)}
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {extraRowActions && extraRowActions(record)}
                        <button
                          type="button"
                          className="management-icon-btn"
                          title="Edit"
                          onClick={() => openEdit(record)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="management-icon-btn text-red"
                          title="Delete"
                          onClick={() => removeRecord(record)}
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
      </div>

      {/* Add / Edit Record Modal */}
      {formOpen && (
        <div className="management-modal-backdrop" onClick={() => setFormOpen(false)}>
          <div className="management-modal" onClick={(e) => e.stopPropagation()}>
            <div className="management-modal-header">
              <div>
                <h2>{editing ? `Edit ${title}` : `Add New ${title}`}</h2>
                <p>Fill out the fields below and save.</p>
              </div>
              <button type="button" className="management-icon-btn" onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveRecord}>
              <div className="management-modal-body">
                <div className="management-modal-grid">
                  {fields.map((field) => {
                    const isFull = field.type === 'textarea' || field.type === 'subcategories' || field.full;
                    return (
                      <div
                        key={field.key}
                        className={`management-field ${isFull ? 'management-field-full' : ''}`}
                      >
                        <span>{field.label}</span>

                        {field.type === 'select' ? (
                          <select
                            value={form[field.key] ?? ''}
                            onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder || ''}
                            value={form[field.key] ?? ''}
                            onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                          />
                        ) : field.type === 'image' ? (
                          <div>
                            {(form[field.key] || imageFiles[field.key]) && (
                              <img
                                src={
                                  imageFiles[field.key]
                                    ? URL.createObjectURL(imageFiles[field.key])
                                    : form[field.key]
                                }
                                alt="preview"
                                className="management-image-preview"
                              />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setImageFiles((p) => ({ ...p, [field.key]: e.target.files?.[0] || null }))
                              }
                            />
                          </div>
                        ) : field.type === 'subcategories' ? (
                          <div>
                            {(Array.isArray(form.subcategories) ? form.subcategories : []).map((sub, idx) => (
                              <div
                                key={idx}
                                style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}
                              >
                                <input
                                  type="text"
                                  placeholder="Subcategory Name"
                                  value={sub.name || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setForm((p) => {
                                      const updated = [...(p.subcategories || [])];
                                      updated[idx] = { ...updated[idx], name: val };
                                      return { ...p, subcategories: updated };
                                    });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="management-icon-btn text-red"
                                  onClick={() =>
                                    setForm((p) => ({
                                      ...p,
                                      subcategories: p.subcategories.filter((_, i) => i !== idx)
                                    }))
                                  }
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  subcategories: [...(p.subcategories || []), { name: '', imageUrl: '' }]
                                }))
                              }
                              style={{
                                color: accent,
                                background: 'none',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                padding: '4px 0'
                              }}
                            >
                              + Add Subcategory
                            </button>
                          </div>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            placeholder={field.placeholder || ''}
                            value={form[field.key] ?? ''}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value
                              }))
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="management-modal-footer">
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="quick-add-btn"
                  disabled={saving}
                  style={{ background: accent }}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={16} className="button-loader" /> Saving...
                    </>
                  ) : editing ? (
                    'Update Record'
                  ) : (
                    'Save Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {extraModals}
    </div>
  );
};

export default ManagementPageLayout;
