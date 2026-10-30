import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Box,
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  FileText,
  ImagePlus,
  Layers,
  Package,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Upload,
  User
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthVendor } from '../../hooks/useAuthVendor';
import { useProduct } from '../../hooks/useProducts';
import { getVendorId } from '../../services/firebaseUtils';
import { uploadVendorAsset } from '../../services/mediaService';
import { useProductsContext } from '../../context/ProductsContext';
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
  vendorName: '',
  manufacturer: '',
  countryOfManufacture: 'India',
  category: 'Rider Wear',
  subCategory: 'Riding Jackets',
  gender: 'Unisex',
  childCategory: '',
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
  const { createProduct, updateProduct } = useProductsContext();


  const { vendorId: authVendorId, user, profile, loading: authLoading } = useAuthVendor();
  const activeVendorId = authVendorId || user?.uid || getVendorId();
  const activeVendorName = profile?.businessDetails?.businessName || profile?.brandInformation?.brandName || profile?.displayName || user?.displayName || 'Nitroxx Moto Gear';
  const activeVendorEmail = profile?.businessDetails?.supportEmail || user?.email || '';
  const activeVendorPhone = profile?.businessDetails?.supportPhone || user?.phoneNumber || '';

  const fileInputRef = React.useRef(null);
  const primaryFileInputRef = React.useRef(null);
  const gallerySlotInputRef = React.useRef(null);
  const galleryBulkInputRef = React.useRef(null);
  const [activeSlotTarget, setActiveSlotTarget] = React.useState(null);
  const [uploadingSlot, setUploadingSlot] = React.useState(null);
  const [activeStep, setActiveStep] = React.useState('category');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lastSaved, setLastSaved] = React.useState('');
  const [previewSelectedImg, setPreviewSelectedImg] = React.useState('');
  const [form, setForm] = React.useState(initialProduct);

  const config = getFormConfig(form.category, form.subCategory);
  const variantFields = getVariantTemplate(form.category);

  const DRAFT_KEY = 'nitroxx_add_product_draft';

  // Sync vendor store name from profile/auth for new products
  React.useEffect(() => {
    if (productId) return;
    if (activeVendorName && !form.vendorName) {
      setForm((current) => ({
        ...current,
        vendorName: current.vendorName || activeVendorName
      }));
    }
  }, [activeVendorName, productId, form.vendorName]);

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
      gender: product.gender || product.attributes?.gender || current.gender || 'Unisex',
      childCategory: product.childCategory || current.childCategory,
      productType: product.productType || current.productType,
      vendorName: product.vendorName || current.vendorName || activeVendorName,
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
    const isRiderWear = form.category === 'Rider Wear';
    const customAttributes = form.customAttributes.filter((item) => item.key && item.value);
    const attributeMap = customAttributes.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {
      ...form.attributes,
      ...(isRiderWear ? { gender: form.gender || form.attributes.gender || 'Unisex' } : {})
    });
    const primaryCertification = Array.isArray(attributeMap.certification) ? attributeMap.certification.join(', ') : attributeMap.certification;
    const finalVendorId = product?.vendorId || activeVendorId;
    const finalVendorName = form.vendorName || activeVendorName;

    return {
      vendorId: finalVendorId,
      vendorName: finalVendorName,
      vendorEmail: activeVendorEmail,
      vendorPhone: activeVendorPhone,
      vendorDetails: {
        vendorId: finalVendorId,
        vendorName: finalVendorName,
        storeName: profile?.brandInformation?.brandName || profile?.businessDetails?.businessName || finalVendorName,
        businessName: profile?.businessDetails?.businessName || finalVendorName,
        displayName: profile?.displayName || user?.displayName || '',
        email: activeVendorEmail,
        phone: activeVendorPhone,
        gstNumber: profile?.gstDetails?.gstNumber || '',
        pan: profile?.businessDetails?.pan || '',
        warehouseAddress: profile?.warehouseAddress || null,
        returnAddress: profile?.returnAddress || null
      },
      title: form.title,
      subtitle: form.subtitle,
      brand: form.brand,
      gender: isRiderWear ? (form.gender || form.attributes.gender || 'Unisex') : '',
      manufacturer: form.manufacturer,
      countryOfManufacture: form.countryOfManufacture,
      category: form.category,
      subCategory: form.subCategory,
      childCategory: form.childCategory || '',
      productType: form.productType,
      collection: form.collection,
      sku: form.sku,
      barcode: form.barcode || '',
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
      const id = await createProduct(payload(status), { status, vendorId: activeVendorId });
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

  const handlePrimaryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadingSlot('primary');
    setError('');
    try {
      const asset = await uploadVendorAsset({
        file,
        type: 'primaryImage',
        productId: productId || 'draft',
        vendorId: activeVendorId
      });
      setForm((current) => ({
        ...current,
        media: {
          ...current.media,
          primaryImage: asset.downloadUrl
        }
      }));
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload primary image');
    } finally {
      setUploading(false);
      setUploadingSlot(null);
      if (event.target) event.target.value = '';
    }
  };

  const deletePrimaryImage = (e) => {
    if (e) e.stopPropagation();
    const oldPrimary = form.media.primaryImage;
    setForm((current) => ({
      ...current,
      media: {
        ...current.media,
        primaryImage: ''
      }
    }));
    if (previewSelectedImg === oldPrimary) {
      setPreviewSelectedImg('');
    }
  };

  const handleGallerySlotClick = (slotIndex) => {
    setActiveSlotTarget(slotIndex);
    gallerySlotInputRef.current?.click();
  };

  const handleGallerySlotUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || activeSlotTarget === null) return;
    const targetIdx = activeSlotTarget;
    setUploading(true);
    setUploadingSlot(targetIdx);
    setError('');
    try {
      const asset = await uploadVendorAsset({
        file,
        type: 'galleryImage',
        productId: productId || 'draft',
        vendorId: activeVendorId
      });
      setForm((current) => {
        const currentGallery = [...(current.media.galleryImages || [])];
        if (targetIdx < currentGallery.length) {
          currentGallery[targetIdx] = asset.downloadUrl;
        } else {
          currentGallery.push(asset.downloadUrl);
        }
        return {
          ...current,
          media: {
            ...current.media,
            galleryImages: currentGallery.slice(0, 5)
          }
        };
      });
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload gallery image');
    } finally {
      setUploading(false);
      setUploadingSlot(null);
      setActiveSlotTarget(null);
      if (event.target) event.target.value = '';
    }
  };

  const handleGalleryBulkUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const currentCount = (form.media.galleryImages || []).length;
    const remaining = Math.max(0, 5 - currentCount);
    if (remaining <= 0) {
      setError('Maximum 5 additional product images allowed.');
      if (event.target) event.target.value = '';
      return;
    }
    const filesToUpload = files.slice(0, remaining);
    setUploading(true);
    setUploadingSlot('bulk');
    setError('');
    try {
      const uploadPromises = filesToUpload.map((file) =>
        uploadVendorAsset({
          file,
          type: 'galleryImage',
          productId: productId || 'draft',
          vendorId: activeVendorId
        })
      );
      const uploadedAssets = await Promise.all(uploadPromises);
      const newUrls = uploadedAssets.map((a) => a.downloadUrl);
      setForm((current) => ({
        ...current,
        media: {
          ...current.media,
          galleryImages: [...(current.media.galleryImages || []), ...newUrls].slice(0, 5)
        }
      }));
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadingSlot(null);
      if (event.target) event.target.value = '';
    }
  };

  const deleteGalleryImage = (indexToDelete, e) => {
    if (e) e.stopPropagation();
    const deletedUrl = (form.media.galleryImages || [])[indexToDelete];
    setForm((current) => {
      const currentGallery = current.media.galleryImages || [];
      const updated = currentGallery.filter((_, idx) => idx !== indexToDelete);
      return {
        ...current,
        media: {
          ...current.media,
          galleryImages: updated
        }
      };
    });
    if (previewSelectedImg === deletedUrl) {
      setPreviewSelectedImg('');
    }
  };

  const makeGalleryImagePrimary = (galleryIndex, e) => {
    if (e) e.stopPropagation();
    setForm((current) => {
      const currentGallery = [...(current.media.galleryImages || [])];
      const selectedImg = currentGallery[galleryIndex];
      const oldPrimary = current.media.primaryImage;
      if (oldPrimary) {
        currentGallery[galleryIndex] = oldPrimary;
      } else {
        currentGallery.splice(galleryIndex, 1);
      }
      return {
        ...current,
        media: {
          ...current.media,
          primaryImage: selectedImg,
          galleryImages: currentGallery
        }
      };
    });
  };

  const uploadImages = handleGalleryBulkUpload;

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
        <label className="custom-toggle-switch">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => setAttribute(field.key, event.target.checked)} />
          <span className="toggle-slider"></span>
          <span className="toggle-label">{value ? 'Enabled' : 'Disabled'}</span>
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
            <p>{form.brand} / {form.category} • {form.vendorName || activeVendorName}</p>
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

                {/* Conditional Compatibility / Gender depending on category */}
                {(form.category === 'Bike Accessories' || form.category === 'Bike Customization & Performance') && (
                  <div className="form-group">
                    <label>Compatible Vehicle</label>
                    <select value={form.compatibility.bikeBrand} onChange={(event) => setNested('compatibility', 'bikeBrand', event.target.value)}>
                      {bikeBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                  </div>
                )}

                {form.category === 'Rider Wear' && (
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={form.gender || form.attributes.gender || 'Unisex'}
                      onChange={(event) => {
                        setField('gender', event.target.value);
                        setAttribute('gender', event.target.value);
                      }}
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                )}

                {form.category === 'Tech & Gadgets' && (
                  <div className="form-group">
                    <label>Compatibility</label>
                    <input
                      value={form.compatibility.compatibleAccessories || ''}
                      onChange={(event) => setNested('compatibility', 'compatibleAccessories', event.target.value)}
                      placeholder="e.g. Universal, Android & iOS, Action Cam Mount, Type-C"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Vendor / Seller</label>
                  <input
                    value={form.vendorName}
                    onChange={(event) => setField('vendorName', event.target.value)}
                    placeholder="Seller / Store Name"
                  />
                  {activeVendorId && (
                    <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Vendor ID: {activeVendorId}
                    </small>
                  )}
                </div>
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
                <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer} onChange={(event) => setField('manufacturer', event.target.value)} /></div>
                <div className="form-group"><label>Country of Origin</label><input value={form.countryOfManufacture} onChange={(event) => setField('countryOfManufacture', event.target.value)} /></div>
                <div className="form-group full">
                  <label>Product Related Keywords</label>
                  <input
                    value={form.tags}
                    onChange={(event) => setField('tags', event.target.value)}
                    placeholder="e.g. riding jacket, waterproof jacket, ce level 2, touring gear (comma-separated)"
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Keywords help riders discover your listing in marketplace searches
                  </small>
                </div>
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
                {['mrp', 'sellingPrice', 'offerPrice', 'costPrice', 'dealerPrice', 'wholesalePrice', 'gstRate', 'shippingFee', 'codCharges'].map((field) => (
                  <div className="form-group" key={field}><label>{titleCase(field)}{field === 'sellingPrice' ? ' *' : ''}</label><input type="number" value={form.pricing[field]} onChange={(event) => setNested('pricing', field, event.target.value)} /></div>
                ))}
              </div>
              <div className="form-grid two">
                <div className="form-group"><label>Flash Sale</label><select value={form.pricing.flashSale} onChange={(event) => setNested('pricing', 'flashSale', event.target.value)}><option>Yes</option><option>No</option></select></div>
                <div className="form-group"><label>Coupon Eligibility</label><select value={form.pricing.couponEligibility} onChange={(event) => setNested('pricing', 'couponEligibility', event.target.value)}><option>Yes</option><option>No</option></select></div>
              </div>
              <div className="subsection-title">Inventory</div>
              <div className="form-grid four">
                {Object.keys(form.inventory)
                  .filter((field) => !['incomingStock', 'restockDate'].includes(field))
                  .map((field) => (
                    <div className="form-group" key={field}>
                      <label>{titleCase(field)}{field === 'stockQuantity' ? ' *' : ''}</label>
                      <input
                        type={['stockQuantity', 'reservedStock', 'minimumStock', 'maximumStock', 'lowStockThreshold'].includes(field) ? 'number' : 'text'}
                        value={form.inventory[field]}
                        onChange={(event) => setNested('inventory', field, event.target.value)}
                      />
                    </div>
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
            <section className="form-section card media-management-section">
              <div className="section-header">
                <div>
                  <h3>Media & Product Imagery</h3>
                  <p className="media-section-subtitle">
                    Provide 1 primary photo (main thumbnail) and up to 5 additional gallery angle shots.
                  </p>
                </div>
                <div className="media-stats-badge">
                  <span>{(form.media.primaryImage ? 1 : 0) + (form.media.galleryImages?.length || 0)} / 6 Photos Total</span>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={primaryFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePrimaryImageUpload}
              />
              <input
                ref={gallerySlotInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleGallerySlotUpload}
              />
              <input
                ref={galleryBulkInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleGalleryBulkUpload}
              />

              {/* 1. PRIMARY PRODUCT IMAGE */}
              <div className="primary-image-card">
                <div className="media-card-title-row">
                  <div className="media-title-group">
                    <span className="media-type-badge primary">Primary Image</span>
                    <h4>Main Product Photo (Required)</h4>
                  </div>
                  <span className="media-hint-text">1:1 Square recommended • Min 800×800px</span>
                </div>

                {form.media.primaryImage ? (
                  <div className="primary-preview-container">
                    <div
                      className="primary-preview-img"
                      style={{ backgroundImage: `url(${form.media.primaryImage})` }}
                    >
                      <span className="primary-corner-tag">Main Thumbnail</span>
                      <button
                        type="button"
                        className="delete-img-btn"
                        title="Delete primary image"
                        onClick={deletePrimaryImage}
                      >
                        <Trash2 size={16} />
                        <span>Delete Image</span>
                      </button>
                    </div>

                    <div className="primary-image-details">
                      <div className="primary-status-note">
                        <CheckCircle2 size={16} className="text-success" />
                        <span>Primary image uploaded and active as main product thumbnail.</span>
                      </div>
                      <div className="primary-action-buttons">
                        <button
                          type="button"
                          className="action-btn-secondary"
                          onClick={() => primaryFileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          <Upload size={14} />
                          {uploadingSlot === 'primary' ? 'Uploading...' : 'Replace Image'}
                        </button>
                        <button
                          type="button"
                          className="action-btn-danger"
                          onClick={deletePrimaryImage}
                        >
                          <Trash2 size={14} />
                          Delete Image
                        </button>
                      </div>
                      <div className="form-group url-fallback">
                        <label>Or edit Image URL</label>
                        <input
                          value={form.media.primaryImage}
                          onChange={(e) => setNested('media', 'primaryImage', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="upload-dropzone primary-dropzone"
                    onClick={() => primaryFileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon-circle">
                      <ImagePlus size={32} />
                    </div>
                    <strong>{uploadingSlot === 'primary' ? 'Uploading Primary Image...' : 'Click to Upload Primary Image'}</strong>
                    <p>PNG, JPG, or WebP up to 5MB. This will be the main photo customers see.</p>
                    <div className="dropzone-browse-pill">
                      <Upload size={14} />
                      Browse File
                    </div>
                    <div className="url-quick-input" onClick={(e) => e.stopPropagation()}>
                      <span>or paste image URL:</span>
                      <input
                        value={form.media.primaryImage}
                        onChange={(e) => setNested('media', 'primaryImage', e.target.value)}
                        placeholder="https://example.com/primary-image.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. FIVE OTHER PRODUCT IMAGES */}
              <div className="gallery-images-section">
                <div className="gallery-header-row">
                  <div>
                    <div className="media-title-group">
                      <span className="media-type-badge gallery">Gallery</span>
                      <h4>Additional Product Images (5 Images)</h4>
                    </div>
                    <p className="gallery-subtitle-text">
                      Add up to 5 alternate angles, close-ups, packaging, or features.
                    </p>
                  </div>

                  <div className="gallery-actions-right">
                    <span className="gallery-count-chip">
                      {(form.media.galleryImages || []).length} / 5 Slots Filled
                    </span>
                    {(form.media.galleryImages || []).length < 5 && (
                      <button
                        type="button"
                        className="bulk-upload-btn"
                        onClick={() => galleryBulkInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload size={14} />
                        {uploadingSlot === 'bulk' ? 'Uploading...' : 'Bulk Upload'}
                      </button>
                    )}
                  </div>
                </div>

                {/* 5-Slot Grid */}
                <div className="gallery-five-grid">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const imgUrl = (form.media.galleryImages || [])[slotIdx];
                    const isUploadingThisSlot = uploadingSlot === slotIdx;

                    return (
                      <div key={slotIdx} className={`gallery-slot-card ${imgUrl ? 'has-image' : 'empty-slot'}`}>
                        <div className="slot-header-pill">
                          <span>Image {slotIdx + 1}</span>
                          {imgUrl && <span className="slot-filled-indicator">✓</span>}
                        </div>

                        {imgUrl ? (
                          <div className="slot-preview-wrapper">
                            <div
                              className="slot-img-preview"
                              style={{ backgroundImage: `url(${imgUrl})` }}
                            />
                            <div className="slot-overlay-actions">
                              <button
                                type="button"
                                className="slot-action-btn delete-btn"
                                title="Delete this image"
                                onClick={(e) => deleteGalleryImage(slotIdx, e)}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                              <button
                                type="button"
                                className="slot-action-btn primary-btn"
                                title="Set as primary image"
                                onClick={(e) => makeGalleryImagePrimary(slotIdx, e)}
                              >
                                <Sparkles size={12} />
                                <span>Make Primary</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              className="slot-replace-link"
                              onClick={() => handleGallerySlotClick(slotIdx)}
                            >
                              Replace Photo
                            </button>
                          </div>
                        ) : (
                          <div
                            className="slot-empty-dropzone"
                            onClick={() => handleGallerySlotClick(slotIdx)}
                          >
                            <div className="slot-plus-circle">
                              {isUploadingThisSlot ? <Upload size={18} className="animate-spin" /> : <Plus size={18} />}
                            </div>
                            <span className="slot-upload-label">
                              {isUploadingThisSlot ? 'Uploading...' : `+ Add Image ${slotIdx + 1}`}
                            </span>
                            <span className="slot-upload-hint">Click to upload</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. ADDITIONAL DOCUMENTS & VIDEOS */}
              <div className="documents-section">
                <div className="section-subheader">
                  <h4>Documents, Manuals & Video URLs</h4>
                  <span className="optional-text">Optional</span>
                </div>
                <div className="form-grid two">
                  <div className="form-group">
                    <label>Cover / Banner Image URL</label>
                    <input
                      value={form.media.coverImage}
                      onChange={(event) => setNested('media', 'coverImage', event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Installation Video URL</label>
                    <input
                      value={form.media.installationVideo}
                      onChange={(event) => setNested('media', 'installationVideo', event.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Manual PDF URL</label>
                    <input
                      value={form.manualPdf}
                      onChange={(event) => setField('manualPdf', event.target.value)}
                      placeholder="https://.../user-manual.pdf"
                    />
                  </div>
                  <div className="form-group">
                    <label>Certificates URL</label>
                    <input
                      value={form.certificates}
                      onChange={(event) => setField('certificates', event.target.value)}
                      placeholder="https://.../isi-ece-cert.pdf"
                    />
                  </div>
                  <div className="form-group full">
                    <label>Other Video Links</label>
                    <input
                      value={form.videoLinks}
                      onChange={(event) => setField('videoLinks', event.target.value)}
                      placeholder="Comma-separated URLs"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeStep === 'preview' && (
            <section className="form-section card real-preview-section">
              <div className="section-header">
                <div>
                  <h3>Product Listing Preview</h3>
                  <p className="preview-subtitle-text">This is exactly how your listing will appear to buyers across the marketplace.</p>
                </div>
                <span className={validation.length ? 'required-text' : 'ready-text'}>
                  {validation.length ? `${validation.length} Issues to Fix` : '✓ Ready to Publish'}
                </span>
              </div>

              {/* 1. Hero Showcase */}
              <div className="preview-hero-grid">
                {/* Image Gallery */}
                <div className="preview-gallery-col">
                  <div
                    className="preview-main-img"
                    style={{
                      backgroundImage: (previewSelectedImg || form.media.primaryImage || form.media.coverImage)
                        ? `url(${previewSelectedImg || form.media.primaryImage || form.media.coverImage})`
                        : undefined
                    }}
                  >
                    {!(previewSelectedImg || form.media.primaryImage || form.media.coverImage) && (
                      <div className="preview-no-img">
                        <Package size={48} />
                        <span>No image uploaded</span>
                      </div>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {([form.media.primaryImage, form.media.coverImage, ...(form.media.galleryImages || [])].filter(Boolean).length > 0) && (
                    <div className="preview-thumbs-row">
                      {[form.media.primaryImage, form.media.coverImage, ...(form.media.galleryImages || [])].filter(Boolean).map((imgUrl, i) => (
                        <div
                          key={i}
                          className={`preview-thumb ${((previewSelectedImg || form.media.primaryImage || form.media.coverImage) === imgUrl) ? 'active' : ''}`}
                          style={{ backgroundImage: `url(${imgUrl})` }}
                          onClick={() => setPreviewSelectedImg(imgUrl)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Info & Pricing Column */}
                <div className="preview-info-col">
                  <div className="preview-badge-row">
                    <span className="preview-chip status-chip">
                      {form.pricing.sellingPrice ? 'Active Preview' : 'Draft'}
                    </span>
                    <span className="preview-chip category-chip">{form.category}</span>
                    <span className="preview-chip subcat-chip">{form.subCategory}</span>
                    {form.brand && <span className="preview-chip brand-chip">{form.brand}</span>}
                    {form.sku && <span className="preview-chip sku-chip">SKU: {form.sku}</span>}
                  </div>

                  <h1 className="preview-title">{form.title || 'Untitled Product'}</h1>
                  {form.subtitle && <p className="preview-subtitle">{form.subtitle}</p>}

                  {/* Target / Category Specs */}
                  <div className="preview-highlight-tags">
                    {form.category === 'Rider Wear' && (
                      <span className="preview-tag-pill"><User size={13} /> Gender: {form.gender || form.attributes.gender || 'Unisex'}</span>
                    )}
                    {(form.category === 'Bike Accessories' || form.category === 'Bike Customization & Performance') && (
                      <span className="preview-tag-pill"><Truck size={13} /> Fit: {form.compatibility.bikeBrand || 'Universal'}</span>
                    )}
                    {form.category === 'Tech & Gadgets' && form.compatibility.compatibleAccessories && (
                      <span className="preview-tag-pill"><Cpu size={13} /> Compatibility: {form.compatibility.compatibleAccessories}</span>
                    )}
                    <span className="preview-tag-pill"><Box size={13} /> Type: {form.productType}</span>
                    <span className="preview-tag-pill"><Tag size={13} /> Origin: {form.countryOfManufacture || 'India'}</span>
                  </div>

                  {/* Pricing Box */}
                  <div className="preview-price-box">
                    <div className="preview-price-main">
                      <span className="preview-selling-price">
                        Rs. {money(form.pricing.sellingPrice).toLocaleString()}
                      </span>
                      {money(form.pricing.mrp) > money(form.pricing.sellingPrice) && (
                        <>
                          <span className="preview-mrp">Rs. {money(form.pricing.mrp).toLocaleString()}</span>
                          <span className="preview-discount-badge">
                            {Math.round(((money(form.pricing.mrp) - money(form.pricing.sellingPrice)) / money(form.pricing.mrp)) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="preview-price-subnotes">
                      <span>• {form.pricing.gstRate}% GST Inclusive</span>
                      <span>• {money(form.pricing.shippingFee) === 0 ? 'Free Shipping' : `Shipping Rs. ${form.pricing.shippingFee}`}</span>
                      <span>• {form.pricing.codCharges ? `COD Charges: Rs. ${form.pricing.codCharges}` : 'COD Available'}</span>
                    </div>
                  </div>

                  {/* Stock & Fulfillment */}
                  <div className="preview-stock-banner">
                    <div>
                      <strong>
                        {money(form.inventory.stockQuantity) > 0
                          ? `${money(form.inventory.stockQuantity)} units available in stock`
                          : 'Out of Stock (Quantity is 0)'}
                      </strong>
                      <span>Warehouse: {form.inventory.warehouse || 'Mumbai FC'} | Dispatch: 24-48 hrs</span>
                    </div>
                    <span className={`preview-stock-badge ${money(form.inventory.stockQuantity) > money(form.inventory.lowStockThreshold) ? 'in-stock' : 'low-stock'}`}>
                      {money(form.inventory.stockQuantity) > money(form.inventory.lowStockThreshold) ? 'In Stock' : 'Low Stock'}
                    </span>
                  </div>

                  {/* Seller info */}
                  <div className="preview-seller-strip">
                    <span>Sold by: <strong>{form.vendorName || activeVendorName}</strong></span>
                    {activeVendorId && <span className="preview-vendor-id">ID: {activeVendorId}</span>}
                  </div>
                </div>
              </div>

              {/* 2. Key Metrics Grid */}
              <div className="product-health-grid">
                <div className="health-card card">
                  <Tag size={18} />
                  <span>Catalog Status</span>
                  <strong>{validation.length ? `${validation.length} pending` : 'Ready to Publish'}</strong>
                </div>
                <div className="health-card card">
                  <Package size={18} />
                  <span>Available Stock</span>
                  <strong className={money(form.inventory.stockQuantity) <= money(form.inventory.lowStockThreshold) ? 'risk' : ''}>
                    {money(form.inventory.stockQuantity)} units
                  </strong>
                </div>
                <div className="health-card card">
                  <BarChart3 size={18} />
                  <span>Profit Margin</span>
                  <strong>
                    {money(form.pricing.sellingPrice) && money(form.pricing.costPrice)
                      ? `${Math.round(((money(form.pricing.sellingPrice) - money(form.pricing.costPrice)) / money(form.pricing.sellingPrice)) * 100)}%`
                      : '-'}
                  </strong>
                </div>
                <div className="health-card card">
                  <ShieldCheck size={18} />
                  <span>Safety Compliance</span>
                  <strong>{form.attributes.certification || form.attributes.ceArmour ? 'Certified' : 'Standard'}</strong>
                </div>
              </div>

              {/* 3. Description & Highlights */}
              <div className="preview-detail-card card">
                <h4>Description & Highlights</h4>
                {form.shortDescription && <p className="preview-short-desc">{form.shortDescription}</p>}
                <div className="preview-full-desc">{form.fullDescription || 'No detailed description provided yet.'}</div>

                {listFromText(form.highlights).length > 0 && (
                  <div className="preview-highlights-section">
                    <h5>Key Highlights</h5>
                    <ul className="preview-bullet-list">
                      {listFromText(form.highlights).map((item, idx) => (
                        <li key={idx}><Check size={14} className="bullet-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {listFromText(form.features).length > 0 && (
                  <div className="preview-highlights-section">
                    <h5>Features</h5>
                    <ul className="preview-bullet-list">
                      {listFromText(form.features).map((item, idx) => (
                        <li key={idx}><Check size={14} className="bullet-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {listFromText(form.boxContents).length > 0 && (
                  <div className="preview-highlights-section">
                    <h5>Package Contents</h5>
                    <ul className="preview-bullet-list">
                      {listFromText(form.boxContents).map((item, idx) => (
                        <li key={idx}><Box size={14} className="bullet-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Specifications & Attributes */}
              <div className="preview-detail-card card">
                <h4>Dynamic Specifications ({form.category})</h4>
                <div className="preview-spec-grid">
                  {form.category === 'Rider Wear' && (
                    <div className="preview-spec-item">
                      <span className="spec-label">Target Gender</span>
                      <strong className="spec-value">{form.gender || form.attributes.gender || 'Unisex'}</strong>
                    </div>
                  )}
                  {Object.entries(form.attributes)
                    .filter(([key, val]) => val !== '' && val !== undefined && val !== null && key !== 'gender')
                    .map(([key, val]) => (
                      <div className="preview-spec-item" key={key}>
                        <span className="spec-label">{titleCase(key)}</span>
                        <strong className="spec-value">
                          {Array.isArray(val) ? val.join(', ') : typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                        </strong>
                      </div>
                  ))}
                  {form.customAttributes.filter(item => item.key && item.value).map((item, i) => (
                    <div className="preview-spec-item" key={i}>
                      <span className="spec-label">{item.key}</span>
                      <strong className="spec-value">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Variants (if added) */}
              {form.variants.length > 0 && (
                <div className="preview-detail-card card">
                  <h4>Product Variants ({form.variants.length})</h4>
                  <div className="seller-table-wrap">
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Options</th>
                          <th>Stock</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v) => (
                          <tr key={v.id}>
                            <td><strong>{v.sku || 'N/A'}</strong></td>
                            <td>{Object.entries(v.options || {}).filter(([, val]) => val).map(([k, val]) => `${titleCase(k)}: ${val}`).join(' | ') || '-'}</td>
                            <td>{v.stock} units</td>
                            <td>Rs. {money(v.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. Policies & Delivery */}
              <div className="preview-detail-card card">
                <h4>Policies, Warranty & Support</h4>
                <div className="policy-grid">
                  <div>
                    <h4>Return Policy</h4>
                    <p>{form.returnPolicy || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4>Replacement Policy</h4>
                    <p>{form.replacementPolicy || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4>Warranty</h4>
                    <p>{form.warranty || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4>Care Instructions</h4>
                    <p>{form.careInstructions || 'Standard care guidelines'}</p>
                  </div>
                </div>
              </div>

              {/* 7. Action Buttons */}
              <div className="form-actions-bottom">
                <button type="button" className="export-btn" onClick={() => setActiveStep('category')}>Edit Details</button>
                <button type="button" className="export-btn" onClick={() => save('draft')} disabled={saving}><Save size={16} /> Save Draft</button>
                <button type="button" className="quick-add-btn" onClick={() => save('published')} disabled={saving}><CheckCircle2 size={16} /> Publish Listing</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddProduct;
