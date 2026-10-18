import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { uploadVendorAsset } from '../../services/mediaService';
import { createProduct, updateProduct } from '../../services/productService';
import { bikeBrands, brands, categoryCatalog, getVariantTemplate, getFormConfig } from './productFormConfig';
import './AddProduct.css';

const steps = [
  { id: 'category', label: 'Category', description: 'Product tree and brand' },
  { id: 'content', label: 'Content', description: 'SEO, descriptions, policies' },
  { id: 'attributes', label: 'Attributes', description: 'Dynamic specs and filters' },
  { id: 'commerce', label: 'Commerce', description: 'Pricing, stock, variants' },
  { id: 'media', label: 'Media', description: 'Images, videos, certificates' },
  { id: 'preview', label: 'Preview', description: 'Validation and publish' }
];

const initialProduct = {
  title: '',
  subtitle: '',
  seoTitle: '',
  seoDescription: '',
  slug: '',
  sku: '',
  barcode: '',
  qrCode: '',
  brand: brands[0],
  vendorName: 'Nitroxx Moto Gear',
  manufacturer: '',
  countryOfManufacture: 'India',
  category: 'Rider Wear',
  subCategory: 'Riding Jackets',
  childCategory: 'Mesh',
  productType: 'Jacket',
  collection: 'Riders Accessories',
  tags: '',
  shortDescription: '',
  fullDescription: '',
  highlights: '',
  features: '',
  specifications: '',
  boxContents: '',
  warranty: '1 year manufacturer warranty',
  returnPolicy: '7-day return for unused product with original packaging',
  replacementPolicy: 'Replacement available for manufacturing defects',
  installationGuide: '',
  careInstructions: '',
  faq: '',
  videoLinks: '',
  manualPdf: '',
  certificates: '',
  attributes: {},
  customAttributes: [{ key: '', value: '' }],
  pricing: {
    mrp: '',
    sellingPrice: '',
    offerPrice: '',
    costPrice: '',
    dealerPrice: '',
    wholesalePrice: '',
    gstRate: 18,
    platformFee: 5,
    shippingFee: 0,
    codCharges: 40,
    bulkDiscount: '',
    flashSale: 'No',
    couponEligibility: 'Yes'
  },
  inventory: {
    warehouse: 'Mumbai FC',
    stockQuantity: '',
    reservedStock: 0,
    incomingStock: 0,
    minimumStock: 5,
    maximumStock: 500,
    lowStockThreshold: 5,
    restockDate: '',
    batchNumber: '',
    serialNumber: ''
  },
  variants: [],
  compatibility: {
    bikeBrand: 'Universal',
    bikeModel: '',
    variant: '',
    engine: '',
    generation: '',
    compatibleYear: '',
    universalProduct: true,
    compatibleAccessories: ''
  },
  media: {
    primaryImage: '',
    coverImage: '',
    galleryImages: [],
    images360: [],
    videos: [],
    installationVideo: '',
    packagingImages: [],
    lifestyleImages: [],
    dimensionDiagram: ''
  }
};

const titleCase = (value) => String(value || '').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
const listFromText = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
const tagsFromText = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const money = (value) => Number(value || 0);

const AddProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { product } = useProduct(productId);
  const fileInputRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState('category');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lastSaved, setLastSaved] = React.useState('');
  const [form, setForm] = React.useState(initialProduct);

  const config = getFormConfig(form.category, form.subCategory);
  const variantFields = getVariantTemplate(form.category);

  const DRAFT_KEY = 'nitroxx_add_product_draft';

  // Load saved draft on mount if not editing an existing product
  React.useEffect(() => {
    if (productId) return;
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.form) {
          setForm(parsed.form);
          if (parsed.activeStep) {
            setActiveStep(parsed.activeStep);
          }
          if (parsed.savedAt) {
            setLastSaved(parsed.savedAt);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage:', e);
    }
  }, [productId]);

  // Auto-save form state to localStorage whenever form or activeStep changes (only for new products)
  React.useEffect(() => {
    if (productId) return;
    // Don't auto-save if form is completely pristine / empty default
    const isPristine = JSON.stringify(form) === JSON.stringify(initialProduct);
    if (isPristine) return;

    const timer = setTimeout(() => {
      try {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const draftData = {
          form,
          activeStep,
          savedAt: timestamp
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setLastSaved(timestamp);
      } catch (e) {
        console.error('Failed to save draft to localStorage:', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form, activeStep, productId]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setForm(initialProduct);
      setActiveStep('category');
      setLastSaved('');
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  };

  React.useEffect(() => {
    if (!product) return;
    setForm((current) => ({
      ...current,
      ...product,
      title: product.title || '',
      subtitle: product.subtitle || '',
      category: product.category || current.category,
      subCategory: product.subCategory || current.subCategory,
      childCategory: product.childCategory || current.childCategory,
      productType: product.productType || current.productType,
      vendorName: product.vendorName || current.vendorName,
      countryOfManufacture: product.countryOfManufacture || current.countryOfManufacture,
      tags: Array.isArray(product.seo?.tags) ? product.seo.tags.join(', ') : product.tags || '',
      seoTitle: product.seo?.seoTitle || product.seoTitle || '',
      seoDescription: product.seo?.metaDescription || product.seoDescription || '',
      pricing: { ...current.pricing, ...(product.pricing || {}) },
      inventory: {
        ...current.inventory,
        ...(product.inventory || {}),
        warehouse: product.shipping?.shippingOrigin || product.inventory?.warehouse || current.inventory.warehouse
      },
      compatibility: { ...current.compatibility, ...(product.compatibilityDetail || {}), compatibleAccessories: product.compatibility || '' },
      media: { ...current.media, ...(product.media || {}) },
      attributes: product.attributes || {},
      variants: product.variants || [],
      customAttributes: product.customAttributes || current.customAttributes
    }));
  }, [product]);

  React.useEffect(() => {
    const catConfig = categoryCatalog[form.category];
    if (!catConfig) return;

    const validSubCategory = catConfig.subcategories.includes(form.subCategory)
      ? form.subCategory
      : catConfig.subcategories[0];

    const currentConfig = getFormConfig(form.category, validSubCategory);

    setForm((current) => ({
      ...current,
      subCategory: validSubCategory,
      productType: currentConfig.productTypes.includes(current.productType)
        ? current.productType
        : currentConfig.productTypes[0]
    }));
  }, [form.category, form.subCategory]);

  React.useEffect(() => {
    if (!form.title || form.slug) return;
    setForm((current) => ({
      ...current,
      slug: current.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  }, [form.title, form.slug]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setNested = (section, field, value) => setForm((current) => ({
    ...current,
    [section]: { ...current[section], [field]: value }
  }));
  const setAttribute = (field, value) => setNested('attributes', field, value);

  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          id: crypto.randomUUID(),
          options: variantFields.reduce((acc, field) => ({ ...acc, [field.toLowerCase()]: '' }), {}),
          sku: current.sku ? `${current.sku}-${current.variants.length + 1}` : '',
          barcode: '',
          stock: 0,
          price: current.pricing.sellingPrice || 0,
          images: ''
        }
      ]
    }));
  };

  const updateVariant = (variantId, path, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) => {
        if (variant.id !== variantId) return variant;
        if (path.startsWith('options.')) {
          const key = path.replace('options.', '');
          return { ...variant, options: { ...variant.options, [key]: value } };
        }
        return { ...variant, [path]: value };
      })
    }));
  };

  const removeVariant = (variantId) => {
    setForm((current) => ({ ...current, variants: current.variants.filter((variant) => variant.id !== variantId) }));
  };

  const updateCustomAttribute = (index, field, value) => {
    setForm((current) => ({
      ...current,
      customAttributes: current.customAttributes.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const addCustomAttribute = () => {
    setForm((current) => ({ ...current, customAttributes: [...current.customAttributes, { key: '', value: '' }] }));
  };

  const validation = React.useMemo(() => {
    const missing = [];
    if (!form.title) missing.push('Product name');
    if (!form.sku) missing.push('SKU');
    if (!form.brand) missing.push('Brand');
    if (!form.category) missing.push('Category');
    if (!form.fullDescription) missing.push('Long description');
    if (!form.pricing.sellingPrice) missing.push('Selling price');
    if (form.inventory.stockQuantity === '') missing.push('Stock');
    if (!form.returnPolicy) missing.push('Return policy');
    config.required.forEach((key) => {
      const value = form.attributes[key];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        missing.push(titleCase(key));
      }
    });
    return missing;
  }, [form, config.required]);

  const payload = (status) => {
    const customAttributes = form.customAttributes.filter((item) => item.key && item.value);
    const attributeMap = customAttributes.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), form.attributes);
    const primaryCertification = Array.isArray(attributeMap.certification) ? attributeMap.certification.join(', ') : attributeMap.certification;
    return {
      title: form.title,
      subtitle: form.subtitle,
      brand: form.brand,
      vendorName: form.vendorName,
      manufacturer: form.manufacturer,
      countryOfManufacture: form.countryOfManufacture,
      category: form.category,
      subCategory: form.subCategory,
      childCategory: form.childCategory,
      productType: form.productType,
      collection: form.collection,
      sku: form.sku,
      barcode: form.barcode,
      qrCode: form.qrCode,
      shortDescription: form.shortDescription || form.fullDescription.slice(0, 180),
      fullDescription: form.fullDescription,
      highlights: listFromText(form.highlights),
      features: listFromText(form.features),
      specifications: listFromText(form.specifications),
      boxContents: listFromText(form.boxContents),
      warranty: form.warranty,
      returnPolicy: form.returnPolicy,
      replacementPolicy: form.replacementPolicy,
      installationGuide: form.installationGuide,
      careInstructions: form.careInstructions,
      faq: listFromText(form.faq),
      videoLinks: tagsFromText(form.videoLinks),
      manualPdf: form.manualPdf,
      certificates: form.certificates,
      weight: attributeMap.weight || '',
      dimensions: {
        length: attributeMap.length || '',
        width: attributeMap.width || '',
        height: attributeMap.height || '',
        unit: 'cm'
      },
      pricing: {
        mrp: money(form.pricing.mrp),
        sellingPrice: money(form.pricing.sellingPrice),
        offerPrice: money(form.pricing.offerPrice),
        costPrice: money(form.pricing.costPrice),
        dealerPrice: money(form.pricing.dealerPrice),
        wholesalePrice: money(form.pricing.wholesalePrice),
        discountPercent: form.pricing.mrp ? Math.max(0, Math.round(((money(form.pricing.mrp) - money(form.pricing.sellingPrice)) / money(form.pricing.mrp)) * 100)) : 0,
        gstRate: money(form.pricing.gstRate),
        platformFee: money(form.pricing.platformFee),
        shippingFee: money(form.pricing.shippingFee),
        codCharges: money(form.pricing.codCharges),
        bulkDiscount: form.pricing.bulkDiscount,
        flashSale: form.pricing.flashSale,
        couponEligibility: form.pricing.couponEligibility
      },
      inventory: {
        stockQuantity: money(form.inventory.stockQuantity),
        reservedStock: money(form.inventory.reservedStock),
        incomingStock: money(form.inventory.incomingStock),
        minimumStock: money(form.inventory.minimumStock),
        maximumStock: money(form.inventory.maximumStock),
        lowStockThreshold: money(form.inventory.lowStockThreshold),
        restockDate: form.inventory.restockDate,
        batchNumber: form.inventory.batchNumber,
        serialNumber: form.inventory.serialNumber,
        warehouse: form.inventory.warehouse
      },
      shipping: {
        dispatchTime: '24-48 hours',
        shippingOrigin: form.inventory.warehouse,
        codAvailable: form.pricing.codCharges !== '',
        returnPolicy: form.returnPolicy
      },
      compatibility: form.compatibility.compatibleAccessories,
      compatibilityDetail: form.compatibility,
      universalProduct: form.compatibility.universalProduct,
      variants: form.variants,
      attributes: {
        ...attributeMap,
        primaryCertification,
        generatedSearchFilters: Object.entries(attributeMap)
          .filter(([, value]) => value !== '' && value !== false)
          .map(([key, value]) => ({ key, value }))
      },
      customAttributes,
      media: form.media,
      seo: {
        seoTitle: form.seoTitle,
        metaDescription: form.seoDescription,
        slug: form.slug,
        tags: tagsFromText(form.tags),
        keywords: tagsFromText(form.tags),
        compatibleBikes: [form.compatibility.bikeBrand, form.compatibility.bikeModel].filter(Boolean),
        badges: [form.category, form.subCategory, form.brand].filter(Boolean)
      },
      safety: {
        BIS: String(primaryCertification || '').includes('ISI'),
        DOT: String(primaryCertification || '').includes('DOT'),
        ECE: String(primaryCertification || '').includes('ECE'),
        CELevel1: String(attributeMap.ceArmour || '').includes('Level 1'),
        CELevel2: String(attributeMap.ceArmour || '').includes('Level 2')
      },
      status
    };
  };

  const save = async (status) => {
    setError('');
    if (status === 'published' && validation.length) {
      setError(`Complete required fields: ${validation.join(', ')}`);
      setActiveStep('preview');
      return;
    }
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, payload(status));
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        navigate(`/products/details/${productId}`);
        return;
      }
      const id = await createProduct(payload(status), { status });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        console.error('Failed to clear draft:', e);
      }
      navigate(`/products/details/${id}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const uploadPromises = files.map(file => uploadVendorAsset({ file, type: 'galleryImage', productId: productId || 'draft' }));
      const uploadedAssets = await Promise.all(uploadPromises);
      const newImages = uploadedAssets.map(asset => asset.downloadUrl);
      
      setForm((current) => {
        const isFirstUpload = !current.media.primaryImage;
        return {
          ...current,
          media: { 
            ...current.media, 
            primaryImage: isFirstUpload ? newImages[0] : current.media.primaryImage,
            galleryImages: [...(current.media.galleryImages || []), ...newImages]
          }
        };
      });
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const renderField = (field) => {
    const value = form.attributes[field.key];
    if (field.type === 'select') {
      return (
        <select value={value || ''} onChange={(event) => setAttribute(field.key, event.target.value)}>
          <option value="">Select {field.label}</option>
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    if (field.type === 'multi') {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="chip-group">
          {field.options.map((option) => (
            <button
              type="button"
              key={option}
              className={`choice-chip ${selected.includes(option) ? 'active' : ''}`}
              onClick={() => setAttribute(field.key, selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }
    if (field.type === 'boolean') {
      return (
        <label className="toggle-field">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => setAttribute(field.key, event.target.checked)} />
          <span>{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    }
    return <input type={field.type || 'text'} value={value || ''} onChange={(event) => setAttribute(field.key, field.type === 'number' ? Number(event.target.value) : event.target.value)} />;
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/products')}><ArrowLeft size={16} /> Products</button>
          <h1 className="page-title">{productId ? 'Edit Product Listing' : 'Create Product Listing'}</h1>
          <p className="page-subtitle">Category-driven product onboarding for Nitroxx riders and automotive accessories.</p>
        </div>
        <div className="header-actions-main">
          {!productId && (
            <button type="button" className="export-btn danger-btn" onClick={clearDraft} title="Discard unsaved local draft">
              <Trash2 size={16} /> Discard Draft
            </button>
          )}
          <button className="export-btn" onClick={() => save('draft')} disabled={saving}><Save size={16} /> Save Draft</button>
          <button className="quick-add-btn" onClick={() => save('published')} disabled={saving}><CheckCircle2 size={16} /> Publish Product</button>
        </div>
      </div>

      {error && <div className="form-alert"><AlertTriangle size={18} /> {error}</div>}
      {lastSaved && <div className="autosave-strip"><CheckCircle2 size={16} /> Auto-saved draft locally at {lastSaved}</div>}

      <div className="wizard-progress">
        {steps.map((step, index) => (
          <button key={step.id} className={`wizard-step ${activeStep === step.id ? 'active' : ''}`} onClick={() => setActiveStep(step.id)}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </button>
        ))}
      </div>

      <div className="add-product-layout">
        <aside className="form-sidebar">
          <div className="preview-card card">
            <div className="preview-image" style={{ backgroundImage: form.media.primaryImage ? `url(${form.media.primaryImage})` : undefined }}>
              {!form.media.primaryImage && <ImagePlus size={28} />}
            </div>
            <h3>{form.title || 'Untitled accessory'}</h3>
            <p>{form.brand} / {form.category}</p>
            <div className="preview-price">Rs. {money(form.pricing.sellingPrice).toLocaleString()}</div>
            <span className={`readiness ${validation.length ? 'pending' : 'ready'}`}>{validation.length ? `${validation.length} issues` : 'Ready to publish'}</span>
          </div>
          <div className="requirements-card card">
            <h4>Smart Validation</h4>
            {validation.length ? validation.slice(0, 8).map((item) => <p key={item}><AlertTriangle size={13} /> {item}</p>) : <p><CheckCircle2 size={13} /> All required fields complete</p>}
          </div>
        </aside>

        <main className="form-content">
          {activeStep === 'category' && (
            <section className="form-section card">
              <div className="section-header"><h3>Category Selection</h3><span className="required-text">Dynamic fields load from category</span></div>
              <div className="form-grid three">
                <div className="form-group"><label>Category *</label><select value={form.category} onChange={(event) => setField('category', event.target.value)}>{Object.keys(categoryCatalog).map((category) => <option key={category}>{category}</option>)}</select></div>
                <div className="form-group"><label>Sub Category *</label><select value={form.subCategory} onChange={(event) => setField('subCategory', event.target.value)}>{config.subcategories.map((category) => <option key={category}>{category}</option>)}</select></div>
                <div className="form-group"><label>Child Category</label><input value={form.childCategory} onChange={(event) => setField('childCategory', event.target.value)} placeholder="Racing, Touring, Urban" /></div>
                <div className="form-group"><label>Product Type *</label><select value={form.productType} onChange={(event) => setField('productType', event.target.value)}>{config.productTypes.map((type) => <option key={type}>{type}</option>)}</select></div>
                <div className="form-group">
                  <label>Brand *</label>
                  <select
                    value={brands.includes(form.brand) ? form.brand : 'Other'}
                    onChange={(event) => {
                      const selected = event.target.value;
                      if (selected === 'Other') {
                        setField('brand', '');
                      } else {
                        setField('brand', selected);
                      }
                    }}
                  >
                    {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                  {(!brands.includes(form.brand) || form.brand === '' || form.brand === 'Other') && (
                    <input
                      type="text"
                      style={{ marginTop: '8px' }}
                      value={form.brand === 'Other' ? '' : form.brand}
                      onChange={(event) => setField('brand', event.target.value)}
                      placeholder="Enter custom brand name"
                    />
                  )}
                </div>
                <div className="form-group"><label>Compatible Vehicle</label><select value={form.compatibility.bikeBrand} onChange={(event) => setNested('compatibility', 'bikeBrand', event.target.value)}>{bikeBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></div>
              </div>
            </section>
          )}

          {activeStep === 'content' && (
            <section className="form-section card">
              <div className="section-header"><h3>Listing Content</h3><span className="auto-assist"><Sparkles size={14} /> Seller Central style content</span></div>
              <div className="form-grid two">
                <div className="form-group"><label>Product Name *</label><input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Axor Apex Carbon Full Face Helmet" /></div>
                <div className="form-group"><label>Product Subtitle</label><input value={form.subtitle} onChange={(event) => setField('subtitle', event.target.value)} placeholder="ECE certified lightweight touring helmet" /></div>
                <div className="form-group"><label>SKU *</label><input value={form.sku} onChange={(event) => setField('sku', event.target.value)} placeholder="NX-HEL-APX-BLK-L" /></div>
                <div className="form-group"><label>Barcode</label><input value={form.barcode} onChange={(event) => setField('barcode', event.target.value)} /></div>
                <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer} onChange={(event) => setField('manufacturer', event.target.value)} /></div>
                <div className="form-group"><label>Country of Origin</label><input value={form.countryOfManufacture} onChange={(event) => setField('countryOfManufacture', event.target.value)} /></div>
                <div className="form-group full"><label>Tags</label><input value={form.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="helmet, ece, touring, waterproof" /></div>
                <div className="form-group full"><label>Short Description</label><textarea value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} /></div>
                <div className="form-group full"><label>Long Description *</label><textarea value={form.fullDescription} onChange={(event) => setField('fullDescription', event.target.value)} /></div>
                <div className="form-group"><label>Highlights</label><textarea value={form.highlights} onChange={(event) => setField('highlights', event.target.value)} placeholder="One per line" /></div>
                <div className="form-group"><label>Features</label><textarea value={form.features} onChange={(event) => setField('features', event.target.value)} placeholder="One per line" /></div>
                <div className="form-group"><label>Package Contents</label><textarea value={form.boxContents} onChange={(event) => setField('boxContents', event.target.value)} /></div>
                <div className="form-group"><label>FAQ</label><textarea value={form.faq} onChange={(event) => setField('faq', event.target.value)} /></div>
                <div className="form-group"><label>Warranty</label><textarea value={form.warranty} onChange={(event) => setField('warranty', event.target.value)} /></div>
                <div className="form-group"><label>Return Policy *</label><textarea value={form.returnPolicy} onChange={(event) => setField('returnPolicy', event.target.value)} /></div>
                <div className="form-group"><label>Replacement Policy</label><textarea value={form.replacementPolicy} onChange={(event) => setField('replacementPolicy', event.target.value)} /></div>
                <div className="form-group"><label>Care Instructions</label><textarea value={form.careInstructions} onChange={(event) => setField('careInstructions', event.target.value)} /></div>
              </div>
            </section>
          )}

          {activeStep === 'attributes' && (
            <section className="form-section card">
              <div className="section-header"><h3>{form.category} Attributes</h3><span className="required-text">Required: {config.required.map(titleCase).join(', ')}</span></div>
              <div className="form-grid two dynamic-grid">
                {config.attributes.map((field) => (
                  <div className="form-group" key={field.key}>
                    <label>{field.label}{config.required.includes(field.key) ? ' *' : ''}</label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
              <div className="subsection-title">Custom Attributes</div>
              {form.customAttributes.map((item, index) => (
                <div className="custom-attribute-row" key={index}>
                  <input value={item.key} onChange={(event) => updateCustomAttribute(index, 'key', event.target.value)} placeholder="Attribute name" />
                  <input value={item.value} onChange={(event) => updateCustomAttribute(index, 'value', event.target.value)} placeholder="Value" />
                </div>
              ))}
              <button className="export-btn" onClick={addCustomAttribute}><Plus size={16} /> Add Custom Field</button>
            </section>
          )}

          {activeStep === 'commerce' && (
            <section className="form-section card">
              <div className="section-header"><h3>Pricing, Inventory & Variants</h3><span className="required-text">Marketplace commerce controls</span></div>
              <div className="subsection-title">Pricing</div>
              <div className="form-grid four">
                {['mrp', 'sellingPrice', 'offerPrice', 'costPrice', 'dealerPrice', 'wholesalePrice', 'gstRate', 'platformFee', 'shippingFee', 'codCharges'].map((field) => (
                  <div className="form-group" key={field}><label>{titleCase(field)}{field === 'sellingPrice' ? ' *' : ''}</label><input type="number" value={form.pricing[field]} onChange={(event) => setNested('pricing', field, event.target.value)} /></div>
                ))}
              </div>
              <div className="form-grid three">
                <div className="form-group"><label>Bulk Discount</label><input value={form.pricing.bulkDiscount} onChange={(event) => setNested('pricing', 'bulkDiscount', event.target.value)} /></div>
                <div className="form-group"><label>Flash Sale</label><select value={form.pricing.flashSale} onChange={(event) => setNested('pricing', 'flashSale', event.target.value)}><option>Yes</option><option>No</option></select></div>
                <div className="form-group"><label>Coupon Eligibility</label><select value={form.pricing.couponEligibility} onChange={(event) => setNested('pricing', 'couponEligibility', event.target.value)}><option>Yes</option><option>No</option></select></div>
              </div>
              <div className="subsection-title">Inventory</div>
              <div className="form-grid four">
                {Object.keys(form.inventory).map((field) => (
                  <div className="form-group" key={field}><label>{titleCase(field)}{field === 'stockQuantity' ? ' *' : ''}</label><input type={['stockQuantity', 'reservedStock', 'incomingStock', 'minimumStock', 'maximumStock', 'lowStockThreshold'].includes(field) ? 'number' : 'text'} value={form.inventory[field]} onChange={(event) => setNested('inventory', field, event.target.value)} /></div>
                ))}
              </div>
              <div className="subsection-title">Unlimited Variants</div>
              <div className="variant-table">
                {form.variants.map((variant) => (
                  <div className="variant-row" key={variant.id}>
                    {variantFields.map((field) => <input key={field} value={variant.options[field.toLowerCase()] || ''} onChange={(event) => updateVariant(variant.id, `options.${field.toLowerCase()}`, event.target.value)} placeholder={field} />)}
                    <input value={variant.sku} onChange={(event) => updateVariant(variant.id, 'sku', event.target.value)} placeholder="SKU" />
                    <input type="number" value={variant.stock} onChange={(event) => updateVariant(variant.id, 'stock', Number(event.target.value))} placeholder="Stock" />
                    <input type="number" value={variant.price} onChange={(event) => updateVariant(variant.id, 'price', Number(event.target.value))} placeholder="Price" />
                    <button className="icon-btn text-red" onClick={() => removeVariant(variant.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button className="export-btn" onClick={addVariant}><Plus size={16} /> Add Variant</button>
              </div>
            </section>
          )}

          {activeStep === 'media' && (
            <section className="form-section card">
              <div className="section-header"><h3>Media & Documents</h3><span className="required-text">Gallery, 360, manual, certificate</span></div>
              <div className="media-uploader">
                <div className="upload-box large" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={28} />
                  <strong>{uploading ? 'Uploading...' : 'Upload bulk images'}</strong>
                  <span>Select multiple images. The first image will be used as the primary thumbnail.</span>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={uploadImages} />
                </div>
                <div className="media-gallery-preview">
                  {form.media.primaryImage ? (
                    [form.media.primaryImage, ...(form.media.galleryImages || []).filter(img => img !== form.media.primaryImage)].map((imgUrl, idx) => (
                      <div key={idx} className="media-preview small" style={{ backgroundImage: `url(${imgUrl})` }}>
                        {idx === 0 && <span className="primary-badge">Primary</span>}
                      </div>
                    ))
                  ) : (
                    <div className="media-preview" style={{ backgroundImage: undefined }}>
                      <ImagePlus size={40} />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-grid two">
                <div className="form-group"><label>Cover Image URL</label><input value={form.media.coverImage} onChange={(event) => setNested('media', 'coverImage', event.target.value)} /></div>
                <div className="form-group"><label>Installation Video URL</label><input value={form.media.installationVideo} onChange={(event) => setNested('media', 'installationVideo', event.target.value)} /></div>
                <div className="form-group"><label>Manual PDF URL</label><input value={form.manualPdf} onChange={(event) => setField('manualPdf', event.target.value)} /></div>
                <div className="form-group"><label>Certificates URL</label><input value={form.certificates} onChange={(event) => setField('certificates', event.target.value)} /></div>
                <div className="form-group full"><label>Video Links</label><input value={form.videoLinks} onChange={(event) => setField('videoLinks', event.target.value)} placeholder="Comma-separated URLs" /></div>
              </div>
            </section>
          )}

          {activeStep === 'preview' && (
            <section className="form-section card">
              <div className="section-header"><h3>Preview & Publish</h3><span className={validation.length ? 'required-text' : 'ready-text'}>{validation.length ? 'Needs attention' : 'Ready'}</span></div>
              <div className="publish-preview">
                <div className="preview-image wide" style={{ backgroundImage: form.media.primaryImage ? `url(${form.media.primaryImage})` : undefined }}></div>
                <div>
                  <h2>{form.title || 'Untitled Product'}</h2>
                  <p>{form.shortDescription || form.fullDescription || 'No description added yet.'}</p>
                  <div className="preview-meta">
                    <span>{form.category}</span>
                    <span>{form.subCategory}</span>
                    <span>{form.brand}</span>
                    <span>Rs. {money(form.pricing.sellingPrice).toLocaleString()}</span>
                    <span>{money(form.inventory.stockQuantity)} units</span>
                  </div>
                </div>
              </div>
              <div className="subsection-title">Bike Compatibility</div>
              <div className="form-grid three">
                <div className="form-group"><label>Bike Brand</label><select value={form.compatibility.bikeBrand} onChange={(event) => setNested('compatibility', 'bikeBrand', event.target.value)}>{bikeBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></div>
                <div className="form-group"><label>Bike Model</label><input value={form.compatibility.bikeModel} onChange={(event) => setNested('compatibility', 'bikeModel', event.target.value)} /></div>
                <div className="form-group"><label>Variant</label><input value={form.compatibility.variant} onChange={(event) => setNested('compatibility', 'variant', event.target.value)} /></div>
                <div className="form-group"><label>Engine CC</label><input value={form.compatibility.engine} onChange={(event) => setNested('compatibility', 'engine', event.target.value)} /></div>
                <div className="form-group"><label>Manufacturing Year</label><input value={form.compatibility.compatibleYear} onChange={(event) => setNested('compatibility', 'compatibleYear', event.target.value)} /></div>
                <div className="form-group"><label>Compatible Accessories</label><input value={form.compatibility.compatibleAccessories} onChange={(event) => setNested('compatibility', 'compatibleAccessories', event.target.value)} /></div>
              </div>
              <div className="form-actions-bottom">
                <button className="export-btn" onClick={() => navigate('/products')}><Eye size={16} /> Product List</button>
                <button className="export-btn" onClick={() => save('draft')} disabled={saving}><Save size={16} /> Save Draft</button>
                <button className="quick-add-btn" onClick={() => save('published')} disabled={saving}><CheckCircle2 size={16} /> Publish Listing</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddProduct;
