import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProductsContext } from './ProductsContext';
import { categoryCatalog, getFormConfig, getVariantTemplate } from '../pages/AddProduct/productFormConfig';

export const AddProductContext = createContext(null);

const DRAFT_KEY = 'nitroxx_add_product_draft';

const initialProductState = {
  title: '',
  subtitle: '',
  seoTitle: '',
  seoDescription: '',
  slug: '',
  sku: '',
  barcode: '',
  qrCode: '',
  brand: 'Nitroxx Gear',
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

export const AddProductProvider = ({ children }) => {
  const { vendorId, profile, user } = useAuth();
  const { getProductById, addProduct: saveNewProduct, editProduct: saveExistingProduct } = useProductsContext();
  const [form, setForm] = useState(initialProductState);
  const [activeStep, setActiveStep] = useState('category');
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const autoSaveTimerRef = useRef(null);

  const activeVendorName = useMemo(() => {
    return profile?.businessDetails?.businessName || profile?.brandInformation?.brandName || profile?.displayName || user?.displayName || 'Nitroxx Moto Gear';
  }, [profile, user]);

  // Load product for editing with cache lookup first (0 reads if already loaded in ProductsContext!)
  const loadProductForEdit = useCallback(async (productId) => {
    if (!productId) {
      // Check local draft for new product
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.form) {
            setForm(parsed.form);
            if (parsed.activeStep) setActiveStep(parsed.activeStep);
            if (parsed.savedAt) setLastSaved(parsed.savedAt);
          }
        }
      } catch (e) {
        console.error('Failed to load local draft:', e);
      }
      return;
    }

    setLoadingProduct(true);
    try {
      const product = await getProductById(productId);
      if (product) {
        setForm((prev) => ({
          ...prev,
          ...product,
          pricing: { ...prev.pricing, ...(product.pricing || {}) },
          inventory: { ...prev.inventory, ...(product.inventory || {}) },
          compatibility: { ...prev.compatibility, ...(product.compatibilityDetail || {}) },
          media: { ...prev.media, ...(product.media || {}) },
          attributes: product.attributes || {},
          variants: product.variants || []
        }));
      }
    } catch (e) {
      console.error('Failed to load product for edit:', e);
      setError('Failed to load product details.');
    } finally {
      setLoadingProduct(false);
    }
  }, [getProductById]);

  // Debounced auto-save to localStorage to prevent redundant execution
  const triggerAutoSave = useCallback((updatedForm, step) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: updatedForm, activeStep: step, savedAt: now }));
        setLastSaved(now);
      } catch (e) {
        console.error('Auto-save error:', e);
      }
    }, 1000);
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialProductState);
    setActiveStep('category');
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
  }, []);

  const value = useMemo(() => ({
    form,
    setForm,
    activeStep,
    setActiveStep,
    saving,
    setSaving,
    loadingProduct,
    error,
    setError,
    lastSaved,
    activeVendorName,
    loadProductForEdit,
    triggerAutoSave,
    resetForm,
    saveNewProduct,
    saveExistingProduct
  }), [
    form,
    activeStep,
    saving,
    loadingProduct,
    error,
    lastSaved,
    activeVendorName,
    loadProductForEdit,
    triggerAutoSave,
    resetForm,
    saveNewProduct,
    saveExistingProduct
  ]);

  return (
    <AddProductContext.Provider value={value}>
      {children}
    </AddProductContext.Provider>
  );
};

export const useAddProductContext = () => {
  const context = useContext(AddProductContext);
  if (!context) {
    throw new Error('useAddProductContext must be used within an AddProductProvider');
  }
  return context;
};
