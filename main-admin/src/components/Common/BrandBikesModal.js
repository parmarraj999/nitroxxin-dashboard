import React, { useState } from 'react';
import { X, Plus, Trash2, LoaderCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';
import { uploadVendorAsset } from '../../services/mediaService';

const BrandBikesModal = ({ brand, collectionName, onClose }) => {
  const [bikes, setBikes] = useState(brand.bikes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bikeImageFiles, setBikeImageFiles] = useState({});

  const handleAddBike = () => {
    setBikes([...bikes, { name: '', imageUrl: '', bannerUrl: '' }]);
  };

  const handleUpdateBike = (index, field, value) => {
    const updated = [...bikes];
    updated[index][field] = value;
    setBikes(updated);
  };

  const handleRemoveBike = (index) => {
    const updated = [...bikes];
    updated.splice(index, 1);
    setBikes(updated);
    setBikeImageFiles((current) => Object.entries(current).reduce((next, [fileIndex, file]) => {
      const numericIndex = Number(fileIndex);
      if (numericIndex < index) next[numericIndex] = file;
      if (numericIndex > index) next[numericIndex - 1] = file;
      return next;
    }, {}));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const bikesWithImages = await Promise.all(bikes.map(async (bike, index) => {
        const file = bikeImageFiles[index];
        if (!file) return bike;
        const uploaded = await uploadVendorAsset({ file, type: 'bike-image', productId: `${brand.id}-bike-${index}` });
        return { ...bike, imageUrl: uploaded.downloadUrl, imageStoragePath: uploaded.storagePath, imageMediaId: uploaded.id };
      }));
      const brandRef = doc(db, collectionName, brand.id);
      await updateDoc(brandRef, {
        bikes: bikesWithImages
      });
      setSuccess('Bikes successfully updated for ' + brand.name);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to save bikes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-modal-backdrop">
      <div className="management-modal" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="management-modal-header">
          <div>
            <h2>Manage Bikes for {brand.name}</h2>
            <p>Add and configure the bikes manufactured by this bike brand.</p>
          </div>
          <button type="button" className="management-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div className="management-toast error" style={{ position: 'relative', margin: '10px 24px', transform: 'none' }}><span>{error}</span></div>}
        {success && <div className="management-toast" style={{ position: 'relative', margin: '10px 24px', transform: 'none' }}><span>{success}</span></div>}

        <div style={{ display: 'block', maxHeight: '60vh', overflowY: 'auto', padding: '16px 24px' }}>
          {bikes.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No bikes added yet. Click 'Add Bike' below.</p>
          ) : (
            bikes.map((bike, index) => (
              <div key={index} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                <button 
                  type="button" 
                  onClick={() => handleRemoveBike(index)} 
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  title="Remove Bike"
                >
                  <Trash2 size={16} />
                </button>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155' }}>Bike #{index + 1}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <label className="management-field">
                    <span>Bike Name</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Duke 390" 
                      value={bike.name} 
                      onChange={(e) => handleUpdateBike(index, 'name', e.target.value)} 
                    />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label className="management-field">
                      <span>Bike Image</span>
                      {(bike.imageUrl || bikeImageFiles[index]) && <img className="management-image-preview" src={bikeImageFiles[index] ? URL.createObjectURL(bikeImageFiles[index]) : bike.imageUrl} alt={`${bike.name || 'Bike'} preview`} />}
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBikeImageFiles((current) => ({ ...current, [index]: e.target.files?.[0] || null }))}
                      />
                    </label>
                    <label className="management-field">
                      <span>Banner URL</span>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={bike.bannerUrl} 
                        onChange={(e) => handleUpdateBike(index, 'bannerUrl', e.target.value)} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <button 
            type="button" 
            onClick={handleAddBike}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b00', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: '600' }}
          >
            <Plus size={16} /> Add Bike
          </button>
        </div>

        <div className="management-modal-footer">
          <button type="button" className="export-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="quick-add-btn" onClick={handleSave} disabled={loading} style={{ background: '#ff6b00' }}>
            {loading ? <><LoaderCircle size={17} className="button-loader" /> Saving...</> : 'Save Bikes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandBikesModal;
