import React from 'react';
import {
  Download,
  Edit2,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { cleanObject, getVendorId, toDate, withVendor } from '../../services/firebaseUtils';
import { moduleConfigs } from './moduleConfigs';
import './EnterpriseModule.css';

const formatLabel = (value = '') => value
  .replace(/([A-Z])/g, ' $1')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())
  .trim();

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value?.seconds || typeof value?.toDate === 'function') {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : '-';
  }
  if (Array.isArray(value)) return value.join(', ');
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
    const raw = formatValue(row[column]).replace(/"/g, '""');
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

const EnterpriseModule = ({ moduleKey }) => {
  const config = moduleConfigs[moduleKey] || moduleConfigs.inventory;
  const Icon = config.icon;
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(getInitialForm(config.fields));
  const [toast, setToast] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    const vendorId = getVendorId();
    const vendorQuery = query(collection(db, config.collectionName), where('vendorId', '==', vendorId));

    const unsubscribe = onSnapshot(vendorQuery, (snapshot) => {
      const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      rows.sort((a, b) => {
        const aDate = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
        const bDate = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
        return bDate - aDate;
      });
      setRecords(rows);
      setLoading(false);
    }, (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [config.collectionName]);

  React.useEffect(() => {
    setForm(getInitialForm(config.fields));
    setEditing(null);
    setFormOpen(false);
    setSearch('');
    setStatusFilter('all');
  }, [moduleKey, config.fields]);

  const visibleRecords = React.useMemo(() => records.filter((record) => {
    const haystack = config.columns.map((column) => formatValue(record[column])).join(' ').toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(record.status || record.verificationStatus || record.priority || '').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }), [records, search, statusFilter, config.columns]);

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
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm(config.fields.reduce((acc, field) => {
      acc[field.key] = record[field.key] ?? (field.type === 'number' ? 0 : field.options?.[0] || '');
      return acc;
    }, {}));
    setFormOpen(true);
  };

  const updateField = (key, value, type) => {
    setForm((current) => ({ ...current, [key]: type === 'number' ? Number(value) : value }));
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    const payload = cleanObject(form);
    try {
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
      setError(saveError.message);
    }
  };

  const removeRecord = async (record) => {
    const label = record.name || record.displayName || record.title || record.code || record.id;
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await deleteDoc(doc(db, config.collectionName, record.id));
      setToast('Record deleted');
    } catch (deleteError) {
      setError(deleteError.message);
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
      setError(seedError.message);
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
            <p>Create a record or add sample accessories marketplace data to start working with this module.</p>
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
                  {config.columns.map((column) => <th key={column}>{formatLabel(column)}</th>)}
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="checkbox-col"><input type="checkbox" /></td>
                    {config.columns.map((column) => (
                      <td key={column}>
                        <span className={String(column).toLowerCase().includes('status') || column === 'priority' ? `module-badge ${String(record[column]).toLowerCase()}` : ''}>
                          {formatValue(record[column])}
                        </span>
                      </td>
                    ))}
                    <td className="actions-col">
                      <div className="row-actions">
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
                <label key={field.key} className={field.type === 'textarea' ? 'field full' : 'field'}>
                  <span>{field.label}</span>
                  {field.type === 'select' ? (
                    <select value={form[field.key] ?? ''} onChange={(event) => updateField(field.key, event.target.value, field.type)}>
                      {field.options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value, field.type)} rows={4} />
                  ) : (
                    <input type={field.type} value={form[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value, field.type)} />
                  )}
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="export-btn" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="quick-add-btn">{editing ? 'Save Changes' : 'Create Record'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EnterpriseModule;
