import React from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import './AddProduct.css';

const AddProduct = () => {
  return (
    <div className="add-product-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Create a new product listing for your gear store.</p>
        </div>
        <div className="header-actions-main">
          <button className="export-btn">Save Draft</button>
          <button className="quick-add-btn">Publish Product</button>
        </div>
      </div>

      <div className="add-product-layout">

        <div className="form-sidebar">
          <div className="step-item active">
            <div className="step-icon"><CheckCircle2 size={16} /></div>
            <div className="step-text">
              <h4>Product Identity</h4>
              <p>Basic details & categorization</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-icon step-pending">2</div>
            <div className="step-text">
              <h4>Pricing & Dimensions</h4>
              <p>Costs, weight, package</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-icon step-pending">3</div>
            <div className="step-text">
              <h4>Safety & Compliance</h4>
              <p>Certifications & docs</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-icon step-pending">4</div>
            <div className="step-text">
              <h4>Media Assets</h4>
              <p>Images & videos</p>
            </div>
          </div>
        </div>

        <div className="form-content">

          <div className="form-section card">
            <div className="section-header">
              <h3>1. Product Identity</h3>
              <span className="required-text">*Required</span>
            </div>

            <div className="form-group">
              <label>Product Title *</label>
              <input type="text" placeholder="e.g. Apex V3 Carbon Aero Helmet" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Brand *</label>
                <select><option>Nitroxx Precision Gear</option></select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select><option>Helmets - Full Face</option></select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SKU *</label>
                <input type="text" placeholder="e.g. NX-HELM-003" />
              </div>
              <div className="form-group">
                <label>Manufacturer Code</label>
                <input type="text" placeholder="Optional" />
              </div>
            </div>

            <div className="form-group">
              <div className="label-flex">
                <label>Item Description *</label>
                <span className="auto-assist"><SparklesIcon /> Auto-generate</span>
              </div>
              <div className="wysiwyg-editor">
                <div className="wysiwyg-toolbar">
                  <span>B</span><span>I</span><span>U</span><span>🔗</span><span>≡</span>
                </div>
                <textarea placeholder="Describe the product features, materials, and sizing guidelines in detail..."></textarea>
              </div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header">
              <h3>2. Pricing & Dimensions</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pricing (Retail) *</label>
                <input type="text" placeholder="$ 0.00" />
              </div>
              <div className="form-group">
                <label>Weight (lbs/oz) *</label>
                <input type="text" placeholder="e.g. 3.2 lbs" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Package Dimensions (L x W x H)</label>
                <div className="dims-inputs">
                  <input type="text" placeholder="L" />
                  <input type="text" placeholder="W" />
                  <input type="text" placeholder="H" />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header">
              <h3>3. Safety & Compliance</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Safety Rating</label>
                <select><option>SNELL M2020D</option></select>
              </div>
              <div className="form-group checkbox-group">
                <label>DOT Certified?</label>
                <div className="radio-flex">
                  <label><input type="radio" name="dot" defaultChecked /> Yes</label>
                  <label><input type="radio" name="dot" /> No</label>
                </div>
              </div>
              <div className="form-group">
                <label>CE Certification</label>
                <select><option>ECE 22.06</option></select>
              </div>
            </div>

            <div className="form-group">
              <label>Certification Documentation (PDF) *</label>
              <div className="upload-box">
                <Upload size={24} className="text-muted" />
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">PDF, MAX 10MB</p>
              </div>
            </div>
          </div>

          <div className="form-section card">
            <div className="section-header">
              <h3>4. Media Assets</h3>
              <div className="toggle-switch">360° View Setup <div className="switch-track"></div></div>
            </div>

            <div className="media-grid">
              <div className="media-primary">
                <div className="media-placeholder dark">
                  <span className="primary-badge">PRIMARY</span>
                  <div className="img-mock" style={{backgroundColor: '#1f2937'}}></div>
                </div>
                <div className="media-footer">
                  <CheckCircle2 size={14} className="text-success" />
                  <span>Image Quality Excellent</span>
                </div>
              </div>
              <div className="media-gallery">
                <div className="media-placeholder dashed"><Upload size={20} /></div>
                <div className="media-placeholder dashed"><Upload size={20} /></div>
                <div className="media-placeholder dashed"><Upload size={20} /></div>
              </div>
            </div>
          </div>

          <div className="form-actions-bottom">
            <button className="export-btn">Cancel</button>
            <button className="quick-add-btn">Save Product Details</button>
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
