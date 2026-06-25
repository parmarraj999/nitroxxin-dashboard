import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { categoryAttributeDefinitions } from '../../schemas/firestoreSchema';
import { uploadVendorAsset } from '../../services/mediaService';
import { createProduct, publishProduct, updateProduct } from '../../services/productService';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { product } = useProduct(productId);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    brand: 'Nitroxx Precision Gear',
    category: 'Helmet',
    subCategory: 'Full Face',
    sku: '',
    manufacturerCode: '',
    fullDescription: '',
    sellingPrice: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    certification: 'ECE 22.06',
    dotCertified: true,
    stockQuantity: '',
    lowStockThreshold: '5',
    shippingOrigin: '',
    returnPolicy: '',
    media: {}
  });

  React.useEffect(() => {
    if (!product) return;
    setForm((current) => ({
      ...current,
      ...product,
      sellingPrice: product.pricing?.sellingPrice || '',
      length: product.dimensions?.length || '',
      width: product.dimensions?.width || '',
      height: product.dimensions?.height || '',
      certification: product.attributes?.certification || 'ECE 22.06',
      dotCertified: Boolean(product.safety?.DOT),
      stockQuantity: product.inventory?.stockQuantity || '',
      lowStockThreshold: product.inventory?.lowStockThreshold || '5',
      shippingOrigin: product.shipping?.shippingOrigin || '',
      returnPolicy: product.shipping?.returnPolicy || '',
      media: product.media || {}
    }));
  }, [product]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const payload = (status) => ({
    title: form.title,
    brand: form.brand,
    category: form.category,
    subCategory: form.subCategory,
    sku: form.sku,
    manufacturerCode: form.manufacturerCode,
    shortDescription: form.fullDescription.slice(0, 160),
    fullDescription: form.fullDescription,
    weight: form.weight,
    dimensions: { length: form.length, width: form.width, height: form.height, unit: 'cm' },
    safety: {
      BIS: form.certification === 'BIS',
      DOT: form.dotCertified || form.certification === 'DOT',
      ECE: form.certification.includes('ECE'),
      CELevel1: form.certification === 'CE Level 1',
      CELevel2: form.certification === 'CE Level 2'
    },
    pricing: {
      mrp: Number(form.sellingPrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      discountPercent: 0,
      gstRate: 18
    },
    inventory: {
      stockQuantity: Number(form.stockQuantity || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 5)
    },
    shipping: {
      dispatchTime: '2 business days',
      shippingOrigin: form.shippingOrigin,
      codAvailable: true,
      returnPolicy: form.returnPolicy
    },
    attributes: {
      certification: form.certification,
      supportedAttributes: categoryAttributeDefinitions[form.category] || []
    },
    media: form.media,
    status
  });

  const save = async (status) => {
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, payload(status));
        if (status === 'published') await publishProduct(productId);
        navigate(`/products/details/${productId}`);
        return;
      }
      const id = await createProduct(payload(status), { status });
      navigate(`/products/details/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const uploadPrimaryImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadVendorAsset({ file, type: 'primaryImage', productId: productId || 'draft' });
      setForm((current) => ({
        ...current,
        media: { ...current.media, primaryImage: uploaded.downloadUrl, primaryImagePath: uploaded.storagePath }
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{productId ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">Create a new product listing for your gear store.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn" onClick={() => save('draft')} disabled={saving}>Save Draft</button>
          <button className="quick-add-btn" onClick={() => save('published')} disabled={saving}>Publish Product</button>
        </div>
      </div>

      <div className="add-product-layout">
        <div className="form-sidebar">
          <div className="step-item active">
            <div className="step-icon"><CheckCircle2 size={16} /></div>
            <div className="step-text"><h4>Product Identity</h4><p>Basic details & categorization</p></div>
          </div>
          <div className="step-item"><div className="step-icon step-pending">2</div><div className="step-text"><h4>Pricing & Dimensions</h4><p>Costs, weight, package</p></div></div>
          <div className="step-item"><div className="step-icon step-pending">3</div><div className="step-text"><h4>Safety & Compliance</h4><p>Certifications & docs</p></div></div>
          <div className="step-item"><div className="step-icon step-pending">4</div><div className="step-text"><h4>Media Assets</h4><p>Images & videos</p></div></div>
        </div>

        <div className="form-content">
          <div className="form-section card">
            <div className="section-header"><h3>1. Product Identity</h3><span className="required-text">*Required</span></div>
            <div className="form-group"><label>Product Title *</label><input type="text" placeholder="e.g. Apex V3 Carbon Aero Helmet" value={form.title} onChange={(event) => setField('title', event.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>Brand *</label><select value={form.brand} onChange={(event) => setField('brand', event.target.value)}><option>Nitroxx Precision Gear</option></select></div>
              <div className="form-group"><label>Category *</label><select value={form.category} onChange={(event) => setField('category', event.target.value)}>{Object.keys(categoryAttributeDefinitions).map((category) => <option key={category}>{category}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>SKU *</label><input type="text" placeholder="e.g. NX-HELM-003" value={form.sku} onChange={(event) => setField('sku', event.target.value)} /></div>
              <div className="form-group"><label>Manufacturer Code</label><input type="text" placeholder="Optional" value={form.manufacturerCode} onChange={(event) => setField('manufacturerCode', event.target.value)} /></div>
            </div>
            <div className="form-group">
              <div className="label-flex"><label>Item Description *</label><span className="auto-assist"><SparklesIcon /> Auto-generate</span></div>
              <div className="wysiwyg-editor">
                <div className="wysiwyg-toolbar"><span>B</span><span>I</span><span>U</span><span>Link</span><span>List</span></div>
                <textarea placeholder="Describe the product features, materials, and sizing guidelines in detail..." value={form.fullDescription} onChange={(event) => setField('fullDescription', event.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header"><h3>2. Pricing & Dimensions</h3></div>
            <div className="form-row">
              <div className="form-group"><label>Pricing (Retail) *</label><input type="text" placeholder="$ 0.00" value={form.sellingPrice} onChange={(event) => setField('sellingPrice', event.target.value)} /></div>
              <div className="form-group"><label>Weight (lbs/oz) *</label><input type="text" placeholder="e.g. 3.2 lbs" value={form.weight} onChange={(event) => setField('weight', event.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Package Dimensions (L x W x H)</label><div className="dims-inputs"><input type="text" placeholder="L" value={form.length} onChange={(event) => setField('length', event.target.value)} /><input type="text" placeholder="W" value={form.width} onChange={(event) => setField('width', event.target.value)} /><input type="text" placeholder="H" value={form.height} onChange={(event) => setField('height', event.target.value)} /></div></div>
              <div className="form-group"><label>Stock Quantity</label><input type="text" placeholder="0" value={form.stockQuantity} onChange={(event) => setField('stockQuantity', event.target.value)} /></div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header"><h3>3. Safety & Compliance</h3></div>
            <div className="form-row">
              <div className="form-group"><label>Safety Rating</label><select value={form.certification} onChange={(event) => setField('certification', event.target.value)}><option>ECE 22.06</option><option>DOT</option><option>BIS</option><option>CE Level 1</option><option>CE Level 2</option></select></div>
              <div className="form-group checkbox-group"><label>DOT Certified?</label><div className="radio-flex"><label><input type="radio" name="dot" checked={form.dotCertified} onChange={() => setField('dotCertified', true)} /> Yes</label><label><input type="radio" name="dot" checked={!form.dotCertified} onChange={() => setField('dotCertified', false)} /> No</label></div></div>
              <div className="form-group"><label>CE Certification</label><select value={form.certification} onChange={(event) => setField('certification', event.target.value)}><option>ECE 22.06</option><option>CE Level 1</option><option>CE Level 2</option></select></div>
            </div>
            <div className="form-group">
              <label>Certification Documentation (PDF) *</label>
              <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
                <Upload size={24} className="text-muted" />
                <p><strong>{uploading ? 'Uploading...' : 'Click to upload'}</strong> or drag and drop</p>
                <p className="upload-hint">PDF, MAX 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={uploadPrimaryImage} />
              </div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header"><h3>4. Media Assets</h3><div className="toggle-switch">360 View Setup <div className="switch-track"></div></div></div>
            <div className="media-grid">
              <div className="media-primary">
                <div className="media-placeholder dark">
                  <span className="primary-badge">PRIMARY</span>
                  <div className="img-mock" style={{ backgroundColor: '#1f2937', backgroundImage: form.media.primaryImage ? `url(${form.media.primaryImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                </div>
                <div className="media-footer"><CheckCircle2 size={14} className="text-success" /><span>Image Quality Excellent</span></div>
              </div>
              <div className="media-gallery"><div className="media-placeholder dashed"><Upload size={20} /></div><div className="media-placeholder dashed"><Upload size={20} /></div><div className="media-placeholder dashed"><Upload size={20} /></div></div>
            </div>
          </div>

          <div className="form-actions-bottom">
            <button className="export-btn" onClick={() => navigate('/products')}>Cancel</button>
            <button className="quick-add-btn" onClick={() => save('draft')} disabled={saving}>Save Product Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"></path>
  </svg>
);

export default AddProduct;
