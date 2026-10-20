import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Save, Ticket, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import '../../components/Common/ManagementPageLayout.css';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketTemplates, setTicketTemplates] = useState([]);

  const [form, setForm] = useState({
    name: '',
    category: 'Group Ride',
    venue: '',
    eventDate: '',
    ticketPrice: '',
    capacity: '',
    status: 'draft',
    imageUrl: '',
    description: '',
    ticketTemplateId: '',
    ticketTemplateUrl: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ticket_tamplate'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        image: d.data().image || d.data().imageUrl || ''
      }));
      setTicketTemplates(list);
      // Auto-select default template if none selected yet
      const defaultTemplate = list.find((t) => t.isDefault && t.status !== 'inactive');
      if (defaultTemplate) {
        setForm((prev) => ({
          ...prev,
          ticketTemplateId: prev.ticketTemplateId || defaultTemplate.id,
          ticketTemplateUrl: prev.ticketTemplateUrl || defaultTemplate.image
        }));
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Event name is required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'events'), {
        name: form.name.trim(),
        category: form.category,
        venue: form.venue.trim(),
        eventDate: form.eventDate,
        ticketPrice: Number(form.ticketPrice) || 0,
        capacity: Number(form.capacity) || 0,
        status: form.status,
        imageUrl: form.imageUrl.trim(),
        description: form.description.trim(),
        ticketTemplateId: form.ticketTemplateId || '',
        ticketTemplateUrl: form.ticketTemplateUrl || '',
        featuredForYou: false,
        createdAt: serverTimestamp()
      });
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="management-page" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <button 
            type="button" 
            onClick={() => navigate('/events')} 
            className="icon-btn" 
            style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Events
          </button>
          <h1 className="page-title">Create New Event</h1>
          <p className="page-subtitle">Publish a new riding event, track day, tour, or rally for the community.</p>
        </div>
      </div>

      {error && (
        <div className="management-toast error">
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Event Name *</label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="e.g. Monsoon Mountain Ride 2026" 
            required 
            style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Event Category</label>
            <select 
              name="category" 
              value={form.category} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            >
              <option value="Group Ride">Group Ride</option>
              <option value="Track Day">Track Day</option>
              <option value="Off-Road & Enduro">Off-Road & Enduro</option>
              <option value="Touring & Rally">Touring & Rally</option>
              <option value="Workshop & Training">Workshop & Training</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Venue / Starting Location</label>
            <input 
              type="text" 
              name="venue" 
              value={form.venue} 
              onChange={handleChange} 
              placeholder="e.g. Lonavala Hills, Pune" 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Event Date</label>
            <input 
              type="date" 
              name="eventDate" 
              value={form.eventDate} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Ticket Price (₹)</label>
            <input 
              type="number" 
              name="ticketPrice" 
              value={form.ticketPrice} 
              onChange={handleChange} 
              placeholder="0 for free" 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Rider Capacity</label>
            <input 
              type="number" 
              name="capacity" 
              value={form.capacity} 
              onChange={handleChange} 
              placeholder="e.g. 150" 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Event Banner Image URL</label>
          <input 
            type="url" 
            name="imageUrl" 
            value={form.imageUrl} 
            onChange={handleChange} 
            placeholder="https://images.unsplash.com/..." 
            style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          />
        </div>

        {/* Ticket Template Selection */}
        <div className="form-group" style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              <Ticket size={16} color="#ea580c" />
              Event Ticket Template (1080 × 1920 px)
            </label>
            <Link 
              to="/events/ticket-templates" 
              target="_blank"
              style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            >
              <span>Manage Templates</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b' }}>
            Choose the 1080x1920 template that will be used when attendees book tickets for this event.
          </p>

          <select
            value={form.ticketTemplateId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const chosen = ticketTemplates.find((t) => t.id === selectedId);
              setForm((prev) => ({
                ...prev,
                ticketTemplateId: selectedId,
                ticketTemplateUrl: chosen ? chosen.image : ''
              }));
            }}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#ffffff', marginBottom: form.ticketTemplateUrl ? 12 : 0 }}
          >
            <option value="">-- Choose Ticket Template --</option>
            {ticketTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.title || 'Ticket Template'}
              </option>
            ))}
          </select>

          {/* Template Thumbnail Preview */}
          {form.ticketTemplateUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 45, height: 80, borderRadius: 4, overflow: 'hidden', background: '#090d16', flexShrink: 0, border: '1px solid #cbd5e1' }}>
                <img src={form.ticketTemplateUrl} alt="Ticket Template" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                  {ticketTemplates.find((t) => t.id === form.ticketTemplateId)?.name || 'Selected Ticket Template'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600 }}>1080 × 1920 PX IMAGE</span>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Description & Details</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            rows={4} 
            placeholder="Include route details, gear requirements, safety rules, and meet-up times..." 
            style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', resize: 'vertical' }}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/events')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={16} />
            {submitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
