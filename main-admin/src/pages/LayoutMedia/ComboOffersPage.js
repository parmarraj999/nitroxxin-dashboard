import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/firebase.config';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { uploadVendorAsset } from '../../services/mediaService';
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Star,
  CheckCircle,
  LoaderCircle,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Tag,
  Building,
  Sparkles,
  Layers,
  Edit3,
  ExternalLink,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Database,
  RotateCcw,
  CheckSquare,
  Square,
  Filter,
  Eye,
  Sliders
} from 'lucide-react';
import './ComboOffersPage.css';

// Default initial starter seed data
export const DEFAULT_COMBO_CATEGORIES = [
  {
    id: 'combo-cat-1',
    title: 'Weekend Rider Starter Packs',
    name: 'Weekend Rider Starter Packs',
    thumbnailImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    order: 0,
    bundles: [
      {
        id: 'bundle-1-1',
        title: 'Weekend Rider Essential Combo',
        description: 'Complete touring starter kit featuring aerodynamic helmet, all-weather gloves, and phone mount with waterproof protection.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        order: 0,
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-2',
    title: 'Track & Racing Bundles',
    name: 'Track & Racing Bundles',
    thumbnailImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    order: 1,
    bundles: [
      {
        id: 'bundle-2-1',
        title: 'Pro Track Day Performance Pack',
        description: 'Track-ready aerodynamic full-face helmet paired with carbon knuckle racing gloves and knee sliders.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        order: 0,
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-3',
    title: 'Touring & Adventure Kits',
    name: 'Touring & Adventure Kits',
    thumbnailImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    order: 2,
    bundles: [
      {
        id: 'bundle-3-1',
        title: 'All-Terrain Adventure Touring Combo',
        description: 'Multi-season adventure jacket, waterproof riding boots, and heavy-duty tail bag for cross-country rides.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        order: 0,
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-4',
    title: 'City Commuter Bundles',
    name: 'City Commuter Bundles',
    thumbnailImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    order: 3,
    bundles: [
      {
        id: 'bundle-4-1',
        title: 'Daily Urban Commuter Kit',
        description: 'Lightweight open/modular helmet, breathable mesh gloves, and vibration-damped quick-mount phone holder.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        order: 0,
        productList: []
      }
    ]
  },
  {
    id: 'combo-cat-5',
    title: 'Rider Safety & Armor Combos',
    name: 'Rider Safety & Armor Combos',
    thumbnailImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
    order: 4,
    bundles: [
      {
        id: 'bundle-5-1',
        title: 'Complete CE Level-2 Armor Pack',
        description: 'Full body armor jacket insert, knee guards, and certified high-impact ankle protection boots.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        order: 0,
        productList: []
      }
    ]
  }
];

const ComboOffersPage = ({ isEmbedded = false, externalComboCategories = null, onExternalUpdate = null }) => {
  // Top-level categories from `combos` collection
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Sub-collection bundles in active category: `combos/{selectedCategoryId}/combo-bundles`
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundleCounts, setBundleCounts] = useState({}); // { [catId]: number }

  // All catalog products from firestore for picker
  const [allProducts, setAllProducts] = useState([]);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = new, object = edit
  const [categoryFormData, setCategoryFormData] = useState({
    title: '',
    thumbnailImage: ''
  });

  // Combo Bundle Modal State
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null); // null = new, object = edit
  const [comboActiveTab, setComboActiveTab] = useState('details'); // 'details' | 'media' | 'products'
  const [bundleFormData, setBundleFormData] = useState({
    title: '',
    thumbnailUrl: '',
    bannerUrl: '',
    description: '',
    status: 'active',
    productList: []
  });

  // Product Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');
  const [pickerBrandFilter, setPickerBrandFilter] = useState('all');
  const [pickerStockFilter, setPickerStockFilter] = useState('all'); // 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  const [pickerStarredFilter, setPickerStarredFilter] = useState('all'); // 'all' | 'starred' | 'unstarred'
  const [pickerSortField, setPickerSortField] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock'
  const [pickerViewMode, setPickerViewMode] = useState('table'); // 'table' | 'grid'
  const [pickerCurrentPage, setPickerCurrentPage] = useState(1);
  const [pickerPageSize, setPickerPageSize] = useState(10);

  // Async States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3800);
  };

  // 1. Fetch all catalog products for the product picker
  useEffect(() => {
    const productsCol = collection(db, 'product-collection');
    const unsubscribe = onSnapshot(
      productsCol,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (items.length > 0) {
          setAllProducts(items);
        } else {
          const fallbackCol = collection(db, 'products');
          onSnapshot(fallbackCol, (snap) => {
            const fallbackItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setAllProducts(fallbackItems);
          });
        }
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
    return unsubscribe;
  }, []);

  // 2. Realtime Listener for `combos` Top-Level Collection
  useEffect(() => {
    const combosRef = collection(db, 'combos');
    const q = query(combosRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        let catList = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || data.name || 'Untitled Category',
            name: data.title || data.name || 'Untitled Category',
            thumbnailImage: data.thumbnailImage || data.imageUrl || '',
            imageUrl: data.thumbnailImage || data.imageUrl || '',
            order: typeof data.order === 'number' ? data.order : 0,
            ...data
          };
        });

        // If collection is empty, check fallback or seed
        if (catList.length === 0) {
          setCategories([]);
          setSelectedCategoryId(null);
          setLoading(false);
          return;
        }

        // Sort by order
        catList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(catList);

        // Maintain selection
        setSelectedCategoryId((prevSelected) => {
          if (prevSelected && catList.some((c) => c.id === prevSelected)) {
            return prevSelected;
          }
          return catList[0]?.id || null;
        });

        setLoading(false);

        // Load bundle counts for all categories in background
        catList.forEach(async (cat) => {
          try {
            const bCol = collection(db, 'combos', cat.id, 'combo-bundles');
            const bSnap = await getDocs(bCol);
            let count = bSnap.size;
            if (count === 0) {
              // Try alternate subcollection name 'combo-bundle'
              const altSnap = await getDocs(collection(db, 'combos', cat.id, 'combo-bundle'));
              count = altSnap.size;
            }
            setBundleCounts((prev) => ({ ...prev, [cat.id]: count }));
          } catch (e) {
            // Ignore count errors
          }
        });
      },
      async (err) => {
        console.warn('Ordered query on combos failed, falling back to simple snapshot:', err);
        // Fallback without orderBy if index is creating
        const unsubFallback = onSnapshot(combosRef, (snapshot) => {
          const catList = snapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title || d.data().name || 'Untitled Category',
            thumbnailImage: d.data().thumbnailImage || d.data().imageUrl || '',
            order: d.data().order ?? 0,
            ...d.data()
          }));
          catList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setCategories(catList);
          setSelectedCategoryId((prev) => (prev && catList.some((c) => c.id === prev) ? prev : catList[0]?.id || null));
          setLoading(false);
        });
        return unsubFallback;
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Realtime Listener for Sub-collection: `combos/{selectedCategoryId}/combo-bundles`
  useEffect(() => {
    if (!selectedCategoryId) {
      setBundles([]);
      setBundlesLoading(false);
      return;
    }

    setBundlesLoading(true);
    const bundlesCol = collection(db, 'combos', selectedCategoryId, 'combo-bundles');
    const q = query(bundlesCol, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bundleList = snapshot.docs.map((d) => ({
          id: d.id,
          comboId: selectedCategoryId,
          ...d.data()
        }));

        bundleList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setBundles(bundleList);
        setBundleCounts((prev) => ({ ...prev, [selectedCategoryId]: bundleList.length }));
        setBundlesLoading(false);
      },
      (err) => {
        // Fallback without orderBy
        const unsubFallback = onSnapshot(bundlesCol, (snap) => {
          const bList = snap.docs.map((d) => ({ id: d.id, comboId: selectedCategoryId, ...d.data() }));
          bList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setBundles(bList);
          setBundleCounts((prev) => ({ ...prev, [selectedCategoryId]: bList.length }));
          setBundlesLoading(false);
        });
        return unsubFallback;
      }
    );

    return () => unsubscribe();
  }, [selectedCategoryId]);

  // Helper to extract current category object
  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;
  const currentCategoryIndex = categories.findIndex((c) => c.id === selectedCategoryId);

  // Helper to extract image URL from product
  const getProductImage = (product) => {
    if (!product) return '';
    return (
      product.media?.primaryImage ||
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.media?.galleryImages) && product.media.galleryImages[0]) ||
      (Array.isArray(product.images) && product.images[0]) ||
      ''
    );
  };

  // Helper to extract product price
  const getProductPrice = (product) => {
    if (!product) return '0';
    return (
      product.pricing?.sellingPrice ||
      product.price ||
      product.pricing?.mrp ||
      '0'
    );
  };

  // Helper to extract product MRP
  const getProductMRP = (product) => {
    if (!product) return '0';
    return (
      product.pricing?.mrp ||
      product.mrp ||
      product.price ||
      '0'
    );
  };

  // Helper to resolve product object
  const resolveProduct = (item) => {
    if (!item) return null;
    const itemId = typeof item === 'string' ? item : (item.id || item.productId);
    const matched = allProducts.find((p) => p.id === itemId);
    if (matched) {
      return {
        id: matched.id,
        productId: matched.id,
        title: matched.title || matched.name || (typeof item === 'object' ? item.title : 'Product'),
        brand: matched.brand || (typeof item === 'object' ? item.brand : 'Nitroxx'),
        category: matched.category || (typeof item === 'object' ? item.category : 'Accessories'),
        price: getProductPrice(matched) || (typeof item === 'object' ? item.price : '0'),
        mrp: getProductMRP(matched) || (typeof item === 'object' ? item.mrp : '0'),
        imageUrl: getProductImage(matched) || (typeof item === 'object' ? item.imageUrl : ''),
        sku: matched.sku || (typeof item === 'object' ? item.sku : '')
      };
    }
    return typeof item === 'object' ? item : { id: item, title: item };
  };

  // Helper to check stock status
  const getProductStockStatus = (product) => {
    if (!product) return { label: 'In Stock', type: 'in-stock', quantity: null };
    const stock = Number(
      product.inventory?.stockQuantity ??
      product.inventory?.quantity ??
      product.inventory?.stock ??
      product.stock ??
      product.quantity ??
      0
    );
    const lowThreshold = Number(product.inventory?.lowStockThreshold ?? 5);

    if (stock <= 0 || product.inStock === false) {
      return { label: 'Out of Stock', type: 'out-of-stock', quantity: 0 };
    }
    if (stock <= lowThreshold) {
      return { label: `Low Stock (${stock})`, type: 'low-stock', quantity: stock };
    }
    return { label: `In Stock (${stock})`, type: 'in-stock', quantity: stock };
  };

  // Image Upload handler
  const handleUploadImage = async (file, uploadKey, onSuccess) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));
    try {
      const result = await uploadVendorAsset({
        file,
        type: `combos-${uploadKey}`,
        productId: 'combos'
      });
      onSuccess(result.downloadUrl);
      showToast('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('Failed to upload image.', true);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ========================================================
  // SEED / INITIALIZE DEFAULT COMBOS COLLECTION
  // ========================================================
  const handleSeedDefaults = async () => {
    if (!window.confirm('Populate initial combo categories and bundles into Firestore collection "combos"?')) {
      return;
    }
    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      for (let i = 0; i < DEFAULT_COMBO_CATEGORIES.length; i++) {
        const cat = DEFAULT_COMBO_CATEGORIES[i];
        const catDocRef = doc(db, 'combos', cat.id);

        batch.set(catDocRef, {
          id: cat.id,
          title: cat.title || cat.name,
          name: cat.title || cat.name,
          thumbnailImage: cat.thumbnailImage || cat.imageUrl,
          imageUrl: cat.thumbnailImage || cat.imageUrl,
          order: i,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Add bundles into sub-collection: `combos/{cat.id}/combo-bundles`
        for (let j = 0; j < (cat.bundles || []).length; j++) {
          const bundle = cat.bundles[j];
          const bundleDocRef = doc(db, 'combos', cat.id, 'combo-bundles', bundle.id);
          batch.set(bundleDocRef, {
            id: bundle.id,
            comboId: cat.id,
            title: bundle.title,
            description: bundle.description || '',
            thumbnailUrl: bundle.thumbnailUrl || '',
            bannerUrl: bundle.bannerUrl || '',
            status: bundle.status || 'active',
            order: j,
            productList: bundle.productList || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      await batch.commit();
      setSelectedCategoryId(DEFAULT_COMBO_CATEGORIES[0].id);
      showToast('Successfully initialized "combos" collection and sub-collections!');
    } catch (err) {
      console.error('Error seeding combos:', err);
      showToast('Failed to seed combos: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================================
  // CATEGORY ACTIONS (Direct on `combos` collection)
  // ========================================================
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      title: `Combo Category #${categories.length + 1}`,
      thumbnailImage: ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    if (!cat) return;
    setEditingCategory(cat);
    setCategoryFormData({
      title: cat.title || cat.name || '',
      thumbnailImage: cat.thumbnailImage || cat.imageUrl || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryModal = async () => {
    if (!categoryFormData.title.trim()) {
      showToast('Please enter a Category Title.', true);
      return;
    }

    setActionLoading(true);
    try {
      if (!editingCategory) {
        // Create new category doc in `combos` collection
        const newCatRef = doc(collection(db, 'combos'));
        await setDoc(newCatRef, {
          id: newCatRef.id,
          title: categoryFormData.title.trim(),
          name: categoryFormData.title.trim(),
          thumbnailImage: categoryFormData.thumbnailImage.trim(),
          imageUrl: categoryFormData.thumbnailImage.trim(),
          order: categories.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setSelectedCategoryId(newCatRef.id);
        showToast(`Created category "${categoryFormData.title}"!`);
      } else {
        // Update existing category doc in `combos`
        const catRef = doc(db, 'combos', editingCategory.id);
        await updateDoc(catRef, {
          title: categoryFormData.title.trim(),
          name: categoryFormData.title.trim(),
          thumbnailImage: categoryFormData.thumbnailImage.trim(),
          imageUrl: categoryFormData.thumbnailImage.trim(),
          updatedAt: serverTimestamp()
        });
        showToast(`Updated category "${categoryFormData.title}"!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      showToast('Failed to save category: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!cat) return;
    if (categories.length <= 1) {
      showToast('You must keep at least one combo category.', true);
      return;
    }

    if (!window.confirm(`Delete combo category "${cat.title || 'Category'}" and all its bundled packages?`)) {
      return;
    }

    setActionLoading(true);
    try {
      // 1. Delete all sub-collection documents inside `combos/{cat.id}/combo-bundles`
      const bundlesSnap = await getDocs(collection(db, 'combos', cat.id, 'combo-bundles'));
      const batch = writeBatch(db);
      bundlesSnap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();

      // 2. Delete the category document in `combos`
      await deleteDoc(doc(db, 'combos', cat.id));

      // 3. Switch selected category
      const remaining = categories.filter((c) => c.id !== cat.id);
      if (remaining.length > 0) {
        setSelectedCategoryId(remaining[0].id);
      }
      showToast(`Deleted category "${cat.title}".`);
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast('Failed to delete category: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveCategory = async (catIndex, direction) => {
    if (direction === 'up' && catIndex === 0) return;
    if (direction === 'down' && catIndex === categories.length - 1) return;

    const targetIdx = direction === 'up' ? catIndex - 1 : catIndex + 1;
    const reordered = [...categories];
    const [moved] = reordered.splice(catIndex, 1);
    reordered.splice(targetIdx, 0, moved);

    try {
      const batch = writeBatch(db);
      reordered.forEach((c, idx) => {
        batch.update(doc(db, 'combos', c.id), { order: idx, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error reordering categories:', err);
      showToast('Failed to update category order.', true);
    }
  };

  // ========================================================
  // BUNDLE ACTIONS (Direct on `combos/{catId}/combo-bundles`)
  // ========================================================
  const handleOpenAddComboModal = () => {
    if (!selectedCategoryId) {
      showToast('Please select or create a combo category first.', true);
      return;
    }
    setEditingBundle(null);
    setComboActiveTab('details');
    setBundleFormData({
      title: '',
      thumbnailUrl: '',
      bannerUrl: '',
      description: '',
      status: 'active',
      productList: []
    });
    setIsComboModalOpen(true);
  };

  const handleOpenEditComboModal = (bundle) => {
    if (!bundle) return;
    setEditingBundle(bundle);
    setComboActiveTab('details');
    setBundleFormData({
      title: bundle.title || '',
      thumbnailUrl: bundle.thumbnailUrl || bundle.imageUrl || '',
      bannerUrl: bundle.bannerUrl || '',
      description: bundle.description || '',
      status: bundle.status || 'active',
      productList: Array.isArray(bundle.productList) ? bundle.productList : []
    });
    setIsComboModalOpen(true);
  };

  const handleSaveComboModal = async () => {
    if (!bundleFormData.title.trim()) {
      showToast('Please enter a Title for the Combo bundle.', true);
      return;
    }
    if (!selectedCategoryId) {
      showToast('No active category selected.', true);
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: bundleFormData.title.trim(),
        thumbnailUrl: bundleFormData.thumbnailUrl.trim(),
        bannerUrl: bundleFormData.bannerUrl.trim(),
        description: bundleFormData.description.trim(),
        status: bundleFormData.status || 'active',
        productList: bundleFormData.productList || [],
        updatedAt: serverTimestamp()
      };

      if (!editingBundle) {
        // Create new bundle doc in sub-collection: `combos/{selectedCategoryId}/combo-bundles`
        const newBundleRef = doc(collection(db, 'combos', selectedCategoryId, 'combo-bundles'));
        await setDoc(newBundleRef, {
          ...payload,
          id: newBundleRef.id,
          comboId: selectedCategoryId,
          order: bundles.length,
          createdAt: serverTimestamp()
        });
        showToast(`Created combo bundle "${bundleFormData.title}"!`);
      } else {
        // Update existing bundle doc
        const bundleRef = doc(db, 'combos', selectedCategoryId, 'combo-bundles', editingBundle.id);
        await updateDoc(bundleRef, payload);
        showToast(`Updated combo bundle "${bundleFormData.title}"!`);
      }

      setIsComboModalOpen(false);
    } catch (err) {
      console.error('Error saving combo bundle:', err);
      showToast('Failed to save combo bundle: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCombo = async (bundle) => {
    if (!bundle || !selectedCategoryId) return;
    if (!window.confirm(`Delete combo bundle "${bundle.title || 'Combo'}"?`)) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'combos', selectedCategoryId, 'combo-bundles', bundle.id));
      showToast(`Deleted combo "${bundle.title}".`);
    } catch (err) {
      console.error('Error deleting combo bundle:', err);
      showToast('Failed to delete bundle: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveCombo = async (bundleIndex, direction) => {
    if (direction === 'up' && bundleIndex === 0) return;
    if (direction === 'down' && bundleIndex === bundles.length - 1) return;
    if (!selectedCategoryId) return;

    const targetIdx = direction === 'up' ? bundleIndex - 1 : bundleIndex + 1;
    const reordered = [...bundles];
    const [moved] = reordered.splice(bundleIndex, 1);
    reordered.splice(targetIdx, 0, moved);

    try {
      const batch = writeBatch(db);
      reordered.forEach((b, idx) => {
        batch.update(doc(db, 'combos', selectedCategoryId, 'combo-bundles', b.id), {
          order: idx,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error reordering combo bundles:', err);
      showToast('Failed to update bundle order.', true);
    }
  };

  // Star / Unstar product toggle in Combo modal
  const handleToggleStarProduct = (prodId) => {
    const list = bundleFormData.productList || [];
    const isAlreadyStarred = list.some((item) => (item.id || item.productId || item) === prodId);

    let updatedList;
    if (isAlreadyStarred) {
      updatedList = list.filter((item) => (item.id || item.productId || item) !== prodId);
    } else {
      const prod = allProducts.find((p) => p.id === prodId);
      const newProductEntry = {
        id: prodId,
        productId: prodId,
        title: prod?.title || prod?.name || 'Product',
        price: getProductPrice(prod) || '0',
        mrp: getProductMRP(prod) || '0',
        imageUrl: getProductImage(prod) || '',
        category: prod?.category || 'Accessories',
        brand: prod?.brand || 'Nitroxx',
        sku: prod?.sku || ''
      };
      updatedList = [...list, newProductEntry];
    }

    setBundleFormData({
      ...bundleFormData,
      productList: updatedList
    });
  };

  const handleRemoveProductFromCombo = (prodId) => {
    const list = bundleFormData.productList || [];
    const updated = list.filter((item) => (item.id || item.productId || item) !== prodId);
    setBundleFormData({
      ...bundleFormData,
      productList: updated
    });
  };

  // Sync / Export to legacy `page_layouts/accessories_layout` for frontend compatibility
  const handleExportToLayout = async () => {
    setActionLoading(true);
    try {
      // Gather all categories & their bundles
      const compiledCategories = [];
      const compiledCombos = [];

      for (const cat of categories) {
        const bSnap = await getDocs(collection(db, 'combos', cat.id, 'combo-bundles'));
        const bList = bSnap.docs.map((d) => ({ id: d.id, comboId: cat.id, ...d.data() }));
        bList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        compiledCategories.push({
          id: cat.id,
          name: cat.title || cat.name,
          title: cat.title || cat.name,
          imageUrl: cat.thumbnailImage || cat.imageUrl || '',
          thumbnailImage: cat.thumbnailImage || cat.imageUrl || '',
          combos: bList
        });

        bList.forEach((b) => {
          compiledCombos.push({
            ...b,
            categoryId: cat.id,
            categoryName: cat.title || cat.name
          });
        });
      }

      const layoutRef = doc(db, 'page_layouts', 'accessories_layout');
      await setDoc(
        layoutRef,
        {
          comboCategories: compiledCategories,
          combos: compiledCombos,
          combosUpdatedAt: serverTimestamp()
        },
        { merge: true }
      );

      if (onExternalUpdate) {
        onExternalUpdate(compiledCategories);
      }

      showToast('All combo categories & sub-collection bundles synced to store layout!');
    } catch (err) {
      console.error('Error syncing combos to layout:', err);
      showToast('Failed to sync: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================================
  // PRODUCT PICKER FILTERING & BATCH ACTIONS
  // ========================================================
  const pickerCategories = ['all', ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))).sort()];
  const pickerBrands = ['all', ...Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))).sort()];

  const isFilterActive =
    Boolean(pickerSearchQuery.trim()) ||
    pickerCategoryFilter !== 'all' ||
    pickerBrandFilter !== 'all' ||
    pickerStockFilter !== 'all' ||
    pickerStarredFilter !== 'all';

  const filteredPickerProducts = allProducts.filter((p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const query = pickerSearchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      title.includes(query) ||
      sku.includes(query) ||
      brand.includes(query) ||
      cat.includes(query);

    const matchCat = pickerCategoryFilter === 'all' || p.category === pickerCategoryFilter;
    const matchBrand = pickerBrandFilter === 'all' || p.brand === pickerBrandFilter;

    const stockInfo = getProductStockStatus(p);
    const matchStock =
      pickerStockFilter === 'all' ||
      (pickerStockFilter === 'in-stock' && stockInfo.type === 'in-stock') ||
      (pickerStockFilter === 'low-stock' && stockInfo.type === 'low-stock') ||
      (pickerStockFilter === 'out-of-stock' && stockInfo.type === 'out-of-stock');

    const isStarred = (bundleFormData.productList || []).some(
      (item) => (item.id || item.productId || item) === p.id
    );
    const matchStarred =
      pickerStarredFilter === 'all' ||
      (pickerStarredFilter === 'starred' && isStarred) ||
      (pickerStarredFilter === 'unstarred' && !isStarred);

    return matchSearch && matchCat && matchBrand && matchStock && matchStarred;
  });

  filteredPickerProducts.sort((a, b) => {
    if (pickerSortField === 'name-asc') {
      const nameA = (a.title || a.name || '').toLowerCase();
      const nameB = (b.title || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (pickerSortField === 'name-desc') {
      const nameA = (a.title || a.name || '').toLowerCase();
      const nameB = (b.title || b.name || '').toLowerCase();
      return nameB.localeCompare(nameA);
    }
    if (pickerSortField === 'price-asc') {
      const priceA = Number(getProductPrice(a)) || 0;
      const priceB = Number(getProductPrice(b)) || 0;
      return priceA - priceB;
    }
    if (pickerSortField === 'price-desc') {
      const priceA = Number(getProductPrice(a)) || 0;
      const priceB = Number(getProductPrice(b)) || 0;
      return priceB - priceA;
    }
    if (pickerSortField === 'stock') {
      const stockA = Number(a.inventory?.stockQuantity ?? a.stock ?? 0);
      const stockB = Number(b.inventory?.stockQuantity ?? b.stock ?? 0);
      return stockB - stockA;
    }
    return 0;
  });

  const pickerTotalPages = Math.ceil(filteredPickerProducts.length / pickerPageSize) || 1;
  const pickerStartIndex = (pickerCurrentPage - 1) * pickerPageSize;
  const pickerPageItems = filteredPickerProducts.slice(pickerStartIndex, pickerStartIndex + pickerPageSize);

  // Batch actions
  const handleSelectAllFiltered = () => {
    const currentList = bundleFormData.productList || [];
    const currentIds = new Set(currentList.map((item) => item.id || item.productId || item));
    const newItems = [];

    filteredPickerProducts.forEach((prod) => {
      if (!currentIds.has(prod.id)) {
        newItems.push({
          id: prod.id,
          productId: prod.id,
          title: prod.title || prod.name || 'Product',
          price: getProductPrice(prod) || '0',
          mrp: getProductMRP(prod) || '0',
          imageUrl: getProductImage(prod) || '',
          category: prod.category || 'Accessories',
          brand: prod.brand || 'Nitroxx',
          sku: prod.sku || ''
        });
      }
    });

    setBundleFormData({
      ...bundleFormData,
      productList: [...currentList, ...newItems]
    });
    showToast(`Added ${newItems.length} products to bundle!`);
  };

  const handleDeselectFiltered = () => {
    const filteredIdSet = new Set(filteredPickerProducts.map((p) => p.id));
    const updated = (bundleFormData.productList || []).filter(
      (item) => !filteredIdSet.has(item.id || item.productId || item)
    );
    setBundleFormData({
      ...bundleFormData,
      productList: updated
    });
    showToast('Removed filtered products from selection.');
  };

  const handleResetPickerFilters = () => {
    setPickerSearchQuery('');
    setPickerCategoryFilter('all');
    setPickerBrandFilter('all');
    setPickerStockFilter('all');
    setPickerStarredFilter('all');
    setPickerSortField('name-asc');
    setPickerCurrentPage(1);
  };

  // Total statistics
  const totalCombosCount = Object.values(bundleCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="combo-loading-state">
        <LoaderCircle size={36} className="button-loader" color="#ff6b00" />
        <h3>Loading Combo Collection...</h3>
        <p>Connecting to Firestore collection <code>combos</code> and sub-collections.</p>
      </div>
    );
  }

  return (
    <div className={`combo-page-container ${isEmbedded ? 'embedded-mode' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`combo-toast-notification ${toast.isError ? 'error' : 'success'}`}>
          {toast.isError ? <X size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      {!isEmbedded && (
        <div className="combo-hero-header">
          <div className="combo-hero-info">
            <div className="combo-hero-badge">
              <Database size={13} />
              <span>Firestore Collection: <code>combos/&#123;comboId&#125;/combo-bundles</code></span>
            </div>
            <h1 className="combo-hero-title">Combo Categories & Bundles Manager</h1>
            <p className="combo-hero-desc">
              Manage combo categories in the <code>combos</code> collection and bundle packages inside their <code>combo-bundles</code> sub-collections with real-time on-demand loading.
            </p>
          </div>

          <div className="combo-hero-stats">
            <div className="combo-stat-pill">
              <span className="stat-label">Categories</span>
              <span className="stat-num">{categories.length}</span>
            </div>
            <div className="combo-stat-pill">
              <span className="stat-label">Total Bundles</span>
              <span className="stat-num">{totalCombosCount}</span>
            </div>
          </div>

          <div className="combo-hero-actions">
            <button
              type="button"
              className="combo-sec-btn"
              onClick={handleExportToLayout}
              disabled={actionLoading || categories.length === 0}
              title="Sync all categories and sub-collection bundles to accessories_layout"
            >
              {actionLoading ? <LoaderCircle size={14} className="button-loader" /> : <Save size={14} />}
              <span>Sync to Store Layout</span>
            </button>

            <button
              type="button"
              className="combo-prim-btn"
              onClick={handleOpenAddCategoryModal}
            >
              <Plus size={15} />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Master - Detail Workspace */}
      <div className="combo-workspace-grid">
        {/* ========================================================
            LEFT COLUMN: Combo Categories List (Master)
            ======================================================== */}
        <aside className="combo-sidebar-panel">
          <div className="combo-sidebar-header">
            <div className="combo-sidebar-title">
              <Layers size={16} color="#ff6b00" />
              <span>Categories ({categories.length})</span>
            </div>
            <button
              type="button"
              className="combo-icon-action-btn"
              title="Add New Category"
              onClick={handleOpenAddCategoryModal}
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="combo-categories-list">
            {categories.length === 0 ? (
              <div className="combo-empty-sidebar-box">
                <Layers size={28} color="#94a3b8" />
                <p>No combo categories in Firestore yet.</p>
                <button
                  type="button"
                  className="combo-prim-btn"
                  style={{ marginTop: '0.6rem', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                  onClick={handleSeedDefaults}
                  disabled={actionLoading}
                >
                  <Sparkles size={13} /> Initialize 5 Default Categories
                </button>
              </div>
            ) : (
              categories.map((cat, catIdx) => {
                const isSelected = selectedCategoryId === cat.id;
                const bundleCount = bundleCounts[cat.id] ?? (isSelected ? bundles.length : 0);

                return (
                  <div
                    key={cat.id}
                    className={`combo-cat-list-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <div className="combo-cat-card-thumb">
                      {cat.thumbnailImage || cat.imageUrl ? (
                        <img src={cat.thumbnailImage || cat.imageUrl} alt={cat.title} />
                      ) : (
                        <Sparkles size={16} color={isSelected ? '#ff6b00' : '#94a3b8'} />
                      )}
                    </div>

                    <div className="combo-cat-card-main">
                      <div className="combo-cat-card-top-row">
                        <span className="combo-cat-order-pill">#{catIdx + 1}</span>
                        <span className="combo-cat-bundles-count">{bundleCount} {bundleCount === 1 ? 'Bundle' : 'Bundles'}</span>
                      </div>

                      <h4 className="combo-cat-card-name">{cat.title || cat.name || `Category #${catIdx + 1}`}</h4>
                    </div>

                    {/* Card quick actions */}
                    <div className="combo-cat-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="combo-card-action-icon edit"
                        title="Edit Category"
                        onClick={() => handleOpenEditCategoryModal(cat)}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="combo-card-action-icon"
                        title="Move Up"
                        disabled={catIdx === 0}
                        onClick={() => handleMoveCategory(catIdx, 'up')}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="combo-card-action-icon"
                        title="Move Down"
                        disabled={catIdx === categories.length - 1}
                        onClick={() => handleMoveCategory(catIdx, 'down')}
                      >
                        <ChevronDown size={13} />
                      </button>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          className="combo-card-action-icon delete"
                          title="Delete Category"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {categories.length > 0 && (
              <button
                type="button"
                className="combo-cat-add-dashed-btn"
                onClick={handleOpenAddCategoryModal}
              >
                <Plus size={16} />
                <span>Add New Combo Category</span>
              </button>
            )}
          </div>
        </aside>

        {/* ========================================================
            RIGHT COLUMN: Active Category & Sub-collection Bundles (Detail)
            ======================================================== */}
        <main className="combo-main-content-panel">
          {currentCategory ? (
            <>
              {/* Category Showcase Header Card */}
              <div className="combo-active-cat-card">
                <div className="combo-active-cat-thumb">
                  {currentCategory.thumbnailImage || currentCategory.imageUrl ? (
                    <img src={currentCategory.thumbnailImage || currentCategory.imageUrl} alt={currentCategory.title} />
                  ) : (
                    <Layers size={28} color="#94a3b8" />
                  )}
                </div>

                <div className="combo-active-cat-info">
                  <div className="combo-active-cat-badges">
                    <span className="combo-order-indicator">
                      Category #{currentCategoryIndex + 1} of {categories.length}
                    </span>
                    <span className="combo-cat-bundles-count-pill">
                      {bundles.length} {bundles.length === 1 ? 'Combo Bundle' : 'Combo Bundles'}
                    </span>
                    <span className="combo-asset-pill" title={`Firestore Sub-collection: combos/${currentCategory.id}/combo-bundles`}>
                      📂 <code>combos/{currentCategory.id}/combo-bundles</code>
                    </span>
                  </div>

                  <h3 className="combo-active-cat-title">{currentCategory.title || currentCategory.name}</h3>
                </div>

                <div className="combo-active-cat-actions">
                  <button
                    type="button"
                    className="combo-edit-cat-btn"
                    onClick={() => handleOpenEditCategoryModal(currentCategory)}
                  >
                    <Edit3 size={14} /> Edit Category
                  </button>
                  <button
                    type="button"
                    className="combo-add-combo-btn"
                    onClick={handleOpenAddComboModal}
                  >
                    <Plus size={15} /> Create Bundle
                  </button>
                </div>
              </div>

              {/* Bundles Grid Section Header */}
              <div className="combo-bundles-section-header">
                <div>
                  <h4 className="combo-section-heading">
                    Bundles in "{currentCategory.title || currentCategory.name}" ({bundles.length})
                  </h4>
                  <span className="combo-section-sub">
                    Packages bundled under this category for mobile app & website showcase.
                  </span>
                </div>

                <button
                  type="button"
                  className="combo-inline-add-btn"
                  onClick={handleOpenAddComboModal}
                >
                  <Plus size={14} /> Add Bundle
                </button>
              </div>

              {/* Bundles Grid Content */}
              {bundlesLoading ? (
                <div className="combo-bundles-loading-skeleton">
                  <LoaderCircle size={28} className="button-loader" color="#ff6b00" />
                  <p>Loading bundles from sub-collection...</p>
                </div>
              ) : bundles.length === 0 ? (
                <div className="combo-empty-bundles-box">
                  <Sparkles size={36} color="#94a3b8" />
                  <h4>No Combo Bundles in this Category Yet</h4>
                  <p>
                    Create promotional combo bundles (e.g. Helmet + Jacket + Gloves) with custom discounts and asset names.
                  </p>
                  <button
                    type="button"
                    className="combo-prim-btn"
                    style={{ marginTop: '0.75rem' }}
                    onClick={handleOpenAddComboModal}
                  >
                    <Plus size={15} /> Create First Bundle
                  </button>
                </div>
              ) : (
                <div className="combo-bundles-grid">
                  {bundles.map((bundle, bundleIndex) => {
                    const starredCount = bundle.productList?.length || 0;

                    // Calculate total MRP of resolved products
                    const totalCatalogMRP = (bundle.productList || []).reduce((sum, item) => {
                      const prod = resolveProduct(item);
                      return sum + (Number(getProductPrice(prod)) || 0);
                    }, 0);

                    // Calculate effective offer price
                    let offerPrice = totalCatalogMRP;
                    let savings = 0;
                    if (bundle.customPrice && Number(bundle.customPrice) > 0) {
                      offerPrice = Number(bundle.customPrice);
                      savings = Math.max(0, totalCatalogMRP - offerPrice);
                    } else if (bundle.discountPercent && Number(bundle.discountPercent) > 0) {
                      const disc = Number(bundle.discountPercent);
                      offerPrice = Math.round(totalCatalogMRP * (1 - disc / 100));
                      savings = totalCatalogMRP - offerPrice;
                    }

                    return (
                      <div key={bundle.id} className="combo-bundle-card">
                        {/* Card Header Media */}
                        <div className="combo-bundle-media-wrap">
                          {bundle.thumbnailUrl ? (
                            <img
                              src={bundle.thumbnailUrl}
                              alt={bundle.title}
                              className="combo-bundle-thumb-img"
                            />
                          ) : (
                            <div className="combo-bundle-thumb-empty">
                              <Package size={32} color="#94a3b8" />
                            </div>
                          )}

                          <span className={`combo-bundle-status-tag ${bundle.status === 'draft' ? 'draft' : 'active'}`}>
                            {bundle.status === 'draft' ? 'Draft' : 'Active'}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="combo-bundle-body">
                          <div className="combo-bundle-order-bar">
                            <span className="combo-bundle-index">#{bundleIndex + 1}</span>
                          </div>

                          <h4 className="combo-bundle-title">{bundle.title || 'Untitled Combo'}</h4>

                          {bundle.description && (
                            <p className="combo-bundle-description">{bundle.description}</p>
                          )}

                          {/* Starred Products Avatars Bar */}
                          <div className="combo-bundled-products-summary">
                            <span className="combo-bundled-label">
                              Included Products ({starredCount}):
                            </span>
                            {starredCount === 0 ? (
                              <span className="combo-bundled-none">No products attached</span>
                            ) : (
                              <div className="combo-bundled-avatars-row">
                                {bundle.productList.slice(0, 4).map((item, pIdx) => {
                                  const prod = resolveProduct(item);
                                  const pImg = prod?.imageUrl;
                                  return (
                                    <div
                                      key={prod?.id || pIdx}
                                      className="combo-bundled-mini-avatar"
                                      title={prod?.title || 'Product'}
                                    >
                                      {pImg ? <img src={pImg} alt="" /> : <Package size={12} color="#64748b" />}
                                    </div>
                                  );
                                })}
                                {starredCount > 4 && (
                                  <div className="combo-bundled-mini-avatar more">
                                    +{starredCount - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Pricing Footer Box */}
                          <div className="combo-bundle-pricing-footer">
                            <div className="combo-price-block">
                              <span className="combo-price-sub">Total Bundle Value</span>
                              <div className="combo-price-row">
                                <span className="combo-current-price">
                                  ₹{totalCatalogMRP.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="combo-bundle-actions-bar">
                          <button
                            type="button"
                            className="combo-card-btn edit"
                            onClick={() => handleOpenEditComboModal(bundle)}
                          >
                            <Edit3 size={13} /> Edit
                          </button>

                          <div className="combo-reorder-group">
                            <button
                              type="button"
                              className="combo-card-btn mini"
                              title="Move Left / Up"
                              disabled={bundleIndex === 0}
                              onClick={() => handleMoveCombo(bundleIndex, 'up')}
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              type="button"
                              className="combo-card-btn mini"
                              title="Move Right / Down"
                              disabled={bundleIndex === bundles.length - 1}
                              onClick={() => handleMoveCombo(bundleIndex, 'down')}
                            >
                              <ChevronRight size={13} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="combo-card-btn delete"
                            title="Delete Combo"
                            onClick={() => handleDeleteCombo(bundle)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="combo-empty-state-card">
              <Layers size={40} color="#94a3b8" />
              <h3>No Combo Category Selected</h3>
              <p>Create or select a category from the left panel to manage its bundles.</p>
              <button
                type="button"
                className="combo-prim-btn"
                style={{ marginTop: '0.85rem' }}
                onClick={handleOpenAddCategoryModal}
              >
                <Plus size={15} /> Add First Category
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL 1: Edit / Create Category Modal
          ======================================================== */}
      {isCategoryModalOpen && (
        <div className="combo-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="combo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="combo-modal-header">
              <div className="combo-modal-title-group">
                <div className="combo-modal-icon-badge">
                  <Layers size={18} />
                </div>
                <div>
                  <h3>{!editingCategory ? 'Add New Combo Category' : 'Edit Combo Category'}</h3>
                  <p>Configure category title and thumbnail image in the <code>combos</code> collection.</p>
                </div>
              </div>
              <button
                type="button"
                className="combo-modal-close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="combo-modal-body">
              {/* Category Title */}
              <div className="combo-form-group">
                <label>
                  Category Title / Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="combo-form-input"
                  placeholder="e.g. Weekend Rider Starter Packs, Track & Racing Bundles"
                  value={categoryFormData.title}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Thumbnail Image */}
              <div className="combo-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={14} color="#ff6b00" />
                  <span>Category Thumbnail Image (Upload or URL)</span>
                </label>

                <div className="combo-modal-thumb-row">
                  <div className="combo-modal-thumb-box">
                    {uploading['cat-thumb'] ? (
                      <LoaderCircle size={22} className="button-loader" color="#ff6b00" />
                    ) : categoryFormData.thumbnailImage ? (
                      <div className="combo-modal-thumb-preview">
                        <img src={categoryFormData.thumbnailImage} alt="Category Thumb" />
                        <button
                          type="button"
                          className="combo-modal-thumb-del"
                          onClick={() => setCategoryFormData({ ...categoryFormData, thumbnailImage: '' })}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="combo-modal-thumb-placeholder">
                        <ImageIcon size={22} color="#94a3b8" />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="combo-modal-thumb-controls">
                    <label className="combo-upload-btn">
                      <ImageIcon size={14} /> Upload Thumbnail
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          handleUploadImage(e.target.files?.[0], 'cat-thumb', (url) =>
                            setCategoryFormData({ ...categoryFormData, thumbnailImage: url })
                          )
                        }
                        disabled={uploading['cat-thumb']}
                      />
                    </label>

                    <div className="combo-modal-url-input">
                      <Link2 size={13} className="url-icon" />
                      <input
                        type="text"
                        placeholder="Or enter direct image URL..."
                        value={categoryFormData.thumbnailImage}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, thumbnailImage: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="combo-modal-footer">
              <button
                type="button"
                className="combo-modal-cancel-btn"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="combo-prim-btn"
                onClick={handleSaveCategoryModal}
                disabled={actionLoading}
              >
                {actionLoading ? <LoaderCircle size={15} className="button-loader" /> : <CheckCircle size={15} />}
                <span>Save Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: Edit / Create Combo Bundle Modal
          ======================================================== */}
      {isComboModalOpen && (
        <div className="combo-modal-backdrop" onClick={() => setIsComboModalOpen(false)}>
          <div className="combo-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="combo-modal-header">
              <div className="combo-modal-title-group">
                <div className="combo-modal-icon-badge">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3>{!editingBundle ? 'Create New Combo Bundle' : `Edit Combo: ${bundleFormData.title}`}</h3>
                  <p>In Category: <strong>{currentCategory?.title || currentCategory?.name}</strong> (Sub-collection: <code>combo-bundles</code>)</p>
                </div>
              </div>
              <button
                type="button"
                className="combo-modal-close"
                onClick={() => setIsComboModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="combo-modal-nav-tabs">
              <button
                type="button"
                className={`combo-modal-tab-btn ${comboActiveTab === 'details' ? 'active' : ''}`}
                onClick={() => setComboActiveTab('details')}
              >
                <SlidersHorizontal size={14} /> 1. Basic Details
              </button>
              <button
                type="button"
                className={`combo-modal-tab-btn ${comboActiveTab === 'media' ? 'active' : ''}`}
                onClick={() => setComboActiveTab('media')}
              >
                <ImageIcon size={14} /> 2. Media & Thumbnails
              </button>
              <button
                type="button"
                className={`combo-modal-tab-btn ${comboActiveTab === 'products' ? 'active' : ''}`}
                onClick={() => setComboActiveTab('products')}
              >
                <Star size={14} /> 3. Bundled Products ({bundleFormData.productList?.length || 0})
              </button>
            </div>

            <div className="combo-modal-body">
              {/* TAB 1: Basic Details */}
              {comboActiveTab === 'details' && (
                <div className="combo-tab-pane">
                  <div className="combo-form-row-2col">
                    <div className="combo-form-group">
                      <label>
                        Combo Bundle Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="combo-form-input"
                        placeholder="e.g. Weekend Rider Essential Combo"
                        value={bundleFormData.title}
                        onChange={(e) => setBundleFormData({ ...bundleFormData, title: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div className="combo-form-group">
                      <label>Visibility Status</label>
                      <select
                        className="combo-form-select"
                        value={bundleFormData.status}
                        onChange={(e) => setBundleFormData({ ...bundleFormData, status: e.target.value })}
                      >
                        <option value="active">🟢 Active</option>
                        <option value="draft">🟡 Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="combo-form-group">
                    <label>Combo Bundle Description</label>
                    <textarea
                      className="combo-form-textarea"
                      rows={3}
                      placeholder="Highlight what makes this bundle special, who it is for, and key gear included..."
                      value={bundleFormData.description}
                      onChange={(e) => setBundleFormData({ ...bundleFormData, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Media & Thumbnails */}
              {comboActiveTab === 'media' && (
                <div className="combo-tab-pane">
                  {/* Thumbnail Image */}
                  <div className="combo-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ImageIcon size={14} color="#ff6b00" />
                      <span>Primary Combo Thumbnail (Card Preview)</span>
                    </label>

                    <div className="combo-modal-thumb-row">
                      <div className="combo-modal-thumb-box large">
                        {uploading['combo-thumb'] ? (
                          <LoaderCircle size={24} className="button-loader" color="#ff6b00" />
                        ) : bundleFormData.thumbnailUrl ? (
                          <div className="combo-modal-thumb-preview">
                            <img src={bundleFormData.thumbnailUrl} alt="Combo Thumb" />
                            <button
                              type="button"
                              className="combo-modal-thumb-del"
                              onClick={() => setBundleFormData({ ...bundleFormData, thumbnailUrl: '' })}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="combo-modal-thumb-placeholder">
                            <ImageIcon size={24} color="#94a3b8" />
                            <span>No Thumbnail</span>
                          </div>
                        )}
                      </div>

                      <div className="combo-modal-thumb-controls">
                        <label className="combo-upload-btn">
                          <ImageIcon size={14} /> Upload Thumbnail
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) =>
                              handleUploadImage(e.target.files?.[0], 'combo-thumb', (url) =>
                                setBundleFormData({ ...bundleFormData, thumbnailUrl: url })
                              )
                            }
                            disabled={uploading['combo-thumb']}
                          />
                        </label>

                        <div className="combo-modal-url-input">
                          <Link2 size={13} className="url-icon" />
                          <input
                            type="text"
                            placeholder="Or enter direct image URL..."
                            value={bundleFormData.thumbnailUrl}
                            onChange={(e) => setBundleFormData({ ...bundleFormData, thumbnailUrl: e.target.value })}
                          />
                        </div>

                        <small className="combo-form-tip">
                          Recommended ratio: 4:3 or 1:1 square. Displayed in combo cards.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Wide Banner Image */}
                  <div className="combo-form-group" style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} color="#ff6b00" />
                      <span>Wide Promotional Header Banner (Optional)</span>
                    </label>

                    <div className="combo-modal-banner-box">
                      {uploading['combo-banner'] ? (
                        <div className="combo-modal-banner-placeholder">
                          <LoaderCircle size={28} className="button-loader" color="#ff6b00" />
                          <span>Uploading promotional banner...</span>
                        </div>
                      ) : bundleFormData.bannerUrl ? (
                        <div className="combo-modal-banner-preview">
                          <img src={bundleFormData.bannerUrl} alt="Banner" />
                          <button
                            type="button"
                            className="combo-modal-banner-del"
                            onClick={() => setBundleFormData({ ...bundleFormData, bannerUrl: '' })}
                          >
                            <Trash2 size={13} /> Remove Banner
                          </button>
                        </div>
                      ) : (
                        <div className="combo-modal-banner-placeholder">
                          <ImageIcon size={28} color="#94a3b8" />
                          <span>No Promotional Banner</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
                      <label className="combo-upload-btn">
                        <ImageIcon size={14} /> Upload Banner
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleUploadImage(e.target.files?.[0], 'combo-banner', (url) =>
                              setBundleFormData({ ...bundleFormData, bannerUrl: url })
                            )
                          }
                          disabled={uploading['combo-banner']}
                        />
                      </label>

                      <div className="combo-modal-url-input" style={{ flex: 1 }}>
                        <Link2 size={13} className="url-icon" />
                        <input
                          type="text"
                          placeholder="Or enter direct banner URL..."
                          value={bundleFormData.bannerUrl}
                          onChange={(e) => setBundleFormData({ ...bundleFormData, bannerUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Bundled Products */}
              {comboActiveTab === 'products' && (() => {
                const totalMRP = (bundleFormData.productList || []).reduce((sum, item) => {
                  const prod = resolveProduct(item);
                  return sum + (Number(getProductPrice(prod)) || 0);
                }, 0);

                return (
                  <div className="combo-tab-pane">
                    {/* Live Calculation Bar */}
                    <div className="combo-calc-summary-banner">
                      <div className="combo-calc-item">
                        <span className="calc-lbl">Bundled Items</span>
                        <strong className="calc-val">{bundleFormData.productList?.length || 0} Products</strong>
                      </div>
                      <div className="combo-calc-item">
                        <span className="calc-lbl">Total Catalog Value</span>
                        <strong className="calc-val offer">₹{totalMRP.toLocaleString()}</strong>
                      </div>

                      <button
                        type="button"
                        className="combo-prim-btn"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => setIsPickerOpen(true)}
                      >
                        <Star size={15} fill="#ffffff" /> Open Catalog & Star Items
                      </button>
                    </div>

                    {/* Starred Products Table */}
                    {(!bundleFormData.productList || bundleFormData.productList.length === 0) ? (
                      <div className="combo-empty-bundles-box" style={{ padding: '2.5rem' }}>
                        <Package size={32} color="#94a3b8" />
                        <h4>No Products Starred in this Combo Yet</h4>
                        <p>Search and star products from your catalog to bundle them into this combo.</p>
                        <button
                          type="button"
                          className="combo-prim-btn"
                          style={{ marginTop: '0.75rem' }}
                          onClick={() => setIsPickerOpen(true)}
                        >
                          <Plus size={15} /> Add Products Now
                        </button>
                      </div>
                    ) : (
                      <div className="combo-modal-table-wrap">
                        <table className="combo-modal-table">
                          <thead>
                            <tr>
                              <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                              <th>Product</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Brand</th>
                              <th style={{ textAlign: 'right', width: '80px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bundleFormData.productList.map((item, idx) => {
                              const prod = resolveProduct(item);
                              if (!prod) return null;
                              const pImg = prod.imageUrl;
                              const pPrice = prod.price;
                              const stock = getProductStockStatus(prod);

                              return (
                                <tr key={prod.id || idx}>
                                  <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>{idx + 1}</td>
                                  <td>
                                    <div className="combo-table-product-cell">
                                      <div className="combo-table-avatar">
                                        {pImg ? <img src={pImg} alt={prod.title} /> : <Package size={16} color="#94a3b8" />}
                                      </div>
                                      <div className="combo-table-meta">
                                        <span className="combo-table-title">{prod.title}</span>
                                        <span className="combo-table-sku">{prod.sku ? `SKU: ${prod.sku}` : `ID: ${prod.id.slice(0, 8)}`}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="combo-table-cat-badge">{prod.category || 'Accessories'}</span>
                                  </td>
                                  <td>
                                    <span className="combo-table-price">₹{Number(pPrice || 0).toLocaleString()}</span>
                                  </td>
                                  <td>
                                    <span className={`combo-status-pill ${stock.type}`}>{stock.label}</span>
                                  </td>
                                  <td>
                                    <span className="combo-table-brand">{prod.brand || 'Nitroxx'}</span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      className="combo-table-del-btn"
                                      title="Remove from Combo"
                                      onClick={() => handleRemoveProductFromCombo(prod.id)}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="combo-modal-footer">
              <button
                type="button"
                className="combo-modal-cancel-btn"
                onClick={() => setIsComboModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="combo-prim-btn"
                onClick={handleSaveComboModal}
                disabled={actionLoading}
              >
                {actionLoading ? <LoaderCircle size={15} className="button-loader" /> : <CheckCircle size={15} />}
                <span>Save Combo Bundle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Product Catalog Picker & Star Multi-Select Modal
          ======================================================== */}
      {isPickerOpen && (
        <div className="combo-modal-backdrop" onClick={() => setIsPickerOpen(false)}>
          <div className="combo-modal-card picker" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="combo-modal-header">
              <div className="combo-modal-title-group">
                <div className="combo-modal-icon-badge">
                  <Star size={18} fill="#ff6b00" color="#ff6b00" />
                </div>
                <div>
                  <h3>Select Products for Combo Bundle</h3>
                  <p>
                    Curating items for: <strong>{bundleFormData.title || 'Untitled Bundle'}</strong> • {bundleFormData.productList?.length || 0} items selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="combo-modal-close"
                onClick={() => setIsPickerOpen(false)}
                title="Close picker"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Products Quick Summary & Action Strip */}
            <div className="combo-picker-status-strip">
              <div className="combo-picker-status-left">
                <span className="combo-picker-badge-pill">
                  ⭐ <strong>{bundleFormData.productList?.length || 0}</strong> products selected
                </span>
                {bundleFormData.productList?.length > 0 && (
                  <span className="combo-picker-value-pill">
                    Total Catalog Value: <strong>₹{((bundleFormData.productList || []).reduce((sum, item) => {
                      const prod = resolveProduct(item);
                      return sum + (Number(getProductPrice(prod)) || 0);
                    }, 0)).toLocaleString()}</strong>
                  </span>
                )}
              </div>

              <div className="combo-picker-status-right">
                {filteredPickerProducts.length > 0 && (
                  <button
                    type="button"
                    className="combo-picker-batch-btn"
                    onClick={handleSelectAllFiltered}
                    title="Add all currently filtered products to bundle"
                  >
                    <CheckSquare size={13} /> Select All Filtered ({filteredPickerProducts.length})
                  </button>
                )}
                {bundleFormData.productList?.length > 0 && (
                  <button
                    type="button"
                    className="combo-picker-clear-all-btn"
                    onClick={() => setBundleFormData({ ...bundleFormData, productList: [] })}
                  >
                    Clear all ({bundleFormData.productList.length})
                  </button>
                )}
              </div>
            </div>

            {/* Selected Products Interactive Chip Tray */}
            {bundleFormData.productList?.length > 0 && (
              <div className="combo-picker-chips-tray">
                <span className="combo-chips-tray-lbl">Selected items:</span>
                <div className="combo-chips-scroll-wrap">
                  {bundleFormData.productList.map((item, idx) => {
                    const prod = resolveProduct(item);
                    if (!prod) return null;
                    return (
                      <div key={prod.id || idx} className="combo-selected-chip">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt="" className="combo-chip-img" />
                        ) : (
                          <Package size={12} color="#64748b" />
                        )}
                        <span className="combo-chip-title" title={prod.title}>{prod.title}</span>
                        <span className="combo-chip-price">₹{Number(prod.price || 0).toLocaleString()}</span>
                        <button
                          type="button"
                          className="combo-chip-del"
                          title="Remove from bundle"
                          onClick={() => handleRemoveProductFromCombo(prod.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className="combo-picker-filter-bar">
              {/* Search Box */}
              <div className="combo-picker-search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search catalog products by title, SKU, brand, or category..."
                  value={pickerSearchQuery}
                  onChange={(e) => {
                    setPickerSearchQuery(e.target.value);
                    setPickerCurrentPage(1);
                  }}
                  autoFocus
                />
                {pickerSearchQuery && (
                  <button
                    type="button"
                    className="combo-picker-clear-btn"
                    onClick={() => {
                      setPickerSearchQuery('');
                      setPickerCurrentPage(1);
                    }}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Selects & Controls Row */}
              <div className="combo-picker-selects-row">
                <div className="combo-picker-select-group">
                  <label>Category:</label>
                  <select
                    className="combo-picker-select"
                    value={pickerCategoryFilter}
                    onChange={(e) => {
                      setPickerCategoryFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">All Categories</option>
                    {pickerCategories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="combo-picker-select-group">
                  <label>Brand:</label>
                  <select
                    className="combo-picker-select"
                    value={pickerBrandFilter}
                    onChange={(e) => {
                      setPickerBrandFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">All Brands</option>
                    {pickerBrands.filter((b) => b !== 'all').map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="combo-picker-select-group">
                  <label>Stock:</label>
                  <select
                    className="combo-picker-select"
                    value={pickerStockFilter}
                    onChange={(e) => {
                      setPickerStockFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">All Stock Status</option>
                    <option value="in-stock">🟢 In Stock Only</option>
                    <option value="low-stock">🟡 Low Stock</option>
                    <option value="out-of-stock">🔴 Out of Stock</option>
                  </select>
                </div>

                <div className="combo-picker-select-group">
                  <label>Selection:</label>
                  <select
                    className="combo-picker-select"
                    value={pickerStarredFilter}
                    onChange={(e) => {
                      setPickerStarredFilter(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="all">All Products</option>
                    <option value="starred">⭐ Selected Only ({bundleFormData.productList?.length || 0})</option>
                    <option value="unstarred">Unselected Only</option>
                  </select>
                </div>

                <div className="combo-picker-select-group">
                  <label>Sort:</label>
                  <select
                    className="combo-picker-select"
                    value={pickerSortField}
                    onChange={(e) => {
                      setPickerSortField(e.target.value);
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="name-desc">Name (Z → A)</option>
                    <option value="price-asc">Price (Low → High)</option>
                    <option value="price-desc">Price (High → Low)</option>
                    <option value="stock">Stock (Highest First)</option>
                  </select>
                </div>

                {isFilterActive && (
                  <button
                    type="button"
                    className="combo-picker-reset-btn"
                    onClick={handleResetPickerFilters}
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                )}

                {/* View Mode Toggle */}
                <div className="combo-picker-view-toggle">
                  <button
                    type="button"
                    className={`combo-view-btn ${pickerViewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setPickerViewMode('table')}
                    title="Table View"
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    className={`combo-view-btn ${pickerViewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setPickerViewMode('grid')}
                    title="Grid / Card View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Products Listing Area */}
            <div className="combo-picker-table-wrap">
              {filteredPickerProducts.length === 0 ? (
                <div className="combo-picker-empty-state">
                  <Package size={36} color="#94a3b8" />
                  <h4>No Products Match Filters</h4>
                  <p>
                    {pickerSearchQuery
                      ? `No catalog products found matching "${pickerSearchQuery}".`
                      : 'Try broadening your filter criteria.'}
                  </p>
                  {isFilterActive && (
                    <button
                      type="button"
                      className="combo-sec-btn"
                      style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                      onClick={handleResetPickerFilters}
                    >
                      <RotateCcw size={13} /> Clear All Filters
                    </button>
                  )}
                </div>
              ) : pickerViewMode === 'table' ? (
                /* ── Table View ── */
                <table className="combo-picker-table">
                  <thead>
                    <tr>
                      <th style={{ width: '48px', textAlign: 'center' }}>Select</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Selling Price</th>
                      <th>Stock Status</th>
                      <th style={{ textAlign: 'right', width: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickerPageItems.map((prod) => {
                      const isStarred = (bundleFormData.productList || []).some(
                        (item) => (item.id || item.productId || item) === prod.id
                      );
                      const pImg = getProductImage(prod);
                      const pPrice = getProductPrice(prod);
                      const pMRP = getProductMRP(prod);
                      const stock = getProductStockStatus(prod);

                      return (
                        <tr
                          key={prod.id}
                          className={`combo-picker-row ${isStarred ? 'starred-row' : ''}`}
                          onClick={() => handleToggleStarProduct(prod.id)}
                        >
                          {/* Checkbox / Star toggle */}
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`combo-star-btn ${isStarred ? 'starred' : ''}`}
                              onClick={() => handleToggleStarProduct(prod.id)}
                              title={isStarred ? 'Remove from combo' : 'Select product for combo'}
                            >
                              <Star
                                size={17}
                                fill={isStarred ? '#ff6b00' : 'none'}
                                color={isStarred ? '#ff6b00' : '#94a3b8'}
                              />
                            </button>
                          </td>

                          {/* Product Info */}
                          <td>
                            <div className="combo-table-product-cell">
                              <div className="combo-table-avatar">
                                {pImg ? <img src={pImg} alt={prod.title} /> : <Package size={16} color="#94a3b8" />}
                              </div>
                              <div className="combo-table-meta">
                                <span className="combo-table-title" title={prod.title || prod.name}>
                                  {prod.title || prod.name}
                                </span>
                                <span className="combo-table-sku">
                                  {prod.sku ? `SKU: ${prod.sku}` : `ID: ${prod.id.slice(0, 8)}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span className="combo-table-cat-badge">{prod.category || 'Accessories'}</span>
                          </td>

                          {/* Brand */}
                          <td>
                            <span className="combo-table-brand">{prod.brand || 'Nitroxx'}</span>
                          </td>

                          {/* Price */}
                          <td>
                            <div className="combo-picker-price-stack">
                              <span className="combo-table-price">₹{Number(pPrice || 0).toLocaleString()}</span>
                              {Number(pMRP) > Number(pPrice) && (
                                <span className="combo-table-mrp">MRP ₹{Number(pMRP).toLocaleString()}</span>
                              )}
                            </div>
                          </td>

                          {/* Stock Status */}
                          <td>
                            <span className={`combo-status-pill ${stock.type}`}>{stock.label}</span>
                          </td>

                          {/* Action Button */}
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`combo-picker-item-btn ${isStarred ? 'selected' : ''}`}
                              onClick={() => handleToggleStarProduct(prod.id)}
                            >
                              {isStarred ? (
                                <>
                                  <Check size={13} /> Selected
                                </>
                              ) : (
                                <>
                                  <Plus size={13} /> Select
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                /* ── Card Grid View ── */
                <div className="combo-picker-cards-grid">
                  {pickerPageItems.map((prod) => {
                    const isStarred = (bundleFormData.productList || []).some(
                      (item) => (item.id || item.productId || item) === prod.id
                    );
                    const pImg = getProductImage(prod);
                    const pPrice = getProductPrice(prod);
                    const pMRP = getProductMRP(prod);
                    const stock = getProductStockStatus(prod);

                    return (
                      <div
                        key={prod.id}
                        className={`combo-picker-card ${isStarred ? 'selected' : ''}`}
                        onClick={() => handleToggleStarProduct(prod.id)}
                      >
                        <div className="combo-picker-card-thumb">
                          {pImg ? (
                            <img src={pImg} alt={prod.title} />
                          ) : (
                            <div className="combo-picker-card-empty-thumb">
                              <Package size={32} color="#94a3b8" />
                            </div>
                          )}

                          <button
                            type="button"
                            className={`combo-card-star-tag ${isStarred ? 'starred' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStarProduct(prod.id);
                            }}
                          >
                            <Star
                              size={15}
                              fill={isStarred ? '#ff6b00' : 'none'}
                              color={isStarred ? '#ff6b00' : '#64748b'}
                            />
                          </button>

                          <span className={`combo-status-pill card ${stock.type}`}>{stock.label}</span>
                        </div>

                        <div className="combo-picker-card-body">
                          <div className="combo-picker-card-tags">
                            <span className="combo-table-cat-badge">{prod.category || 'Accessories'}</span>
                            <span className="combo-table-brand">{prod.brand || 'Nitroxx'}</span>
                          </div>

                          <h4 className="combo-picker-card-title" title={prod.title || prod.name}>
                            {prod.title || prod.name}
                          </h4>

                          <span className="combo-table-sku">
                            {prod.sku ? `SKU: ${prod.sku}` : `ID: ${prod.id.slice(0, 8)}`}
                          </span>

                          <div className="combo-picker-card-pricing">
                            <span className="combo-table-price">₹{Number(pPrice || 0).toLocaleString()}</span>
                            {Number(pMRP) > Number(pPrice) && (
                              <span className="combo-table-mrp">₹{Number(pMRP).toLocaleString()}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            className={`combo-card-select-btn ${isStarred ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStarProduct(prod.id);
                            }}
                          >
                            {isStarred ? (
                              <>
                                <Check size={14} /> Selected for Bundle
                              </>
                            ) : (
                              <>
                                <Plus size={14} /> Add to Bundle
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination & Done Footer */}
            <div className="combo-picker-footer">
              <div className="combo-picker-footer-left">
                {/* Page Size Selector */}
                <div className="combo-picker-pagesize">
                  <span>Show:</span>
                  <select
                    value={pickerPageSize}
                    onChange={(e) => {
                      setPickerPageSize(Number(e.target.value));
                      setPickerCurrentPage(1);
                    }}
                  >
                    <option value={8}>8 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={40}>40 / page</option>
                  </select>
                </div>

                <div className="combo-picker-info-text">
                  Showing {filteredPickerProducts.length === 0 ? 0 : pickerStartIndex + 1}–
                  {Math.min(pickerStartIndex + pickerPageSize, filteredPickerProducts.length)} of{' '}
                  <strong>{filteredPickerProducts.length}</strong> products
                </div>
              </div>

              {/* Pagination controls */}
              <div className="combo-picker-pagination">
                <button
                  type="button"
                  disabled={pickerCurrentPage <= 1}
                  onClick={() => setPickerCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                <div className="combo-picker-page-numbers">
                  {Array.from({ length: Math.min(5, pickerTotalPages) }, (_, i) => {
                    let pageNum;
                    if (pickerTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pickerCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pickerCurrentPage >= pickerTotalPages - 2) {
                      pageNum = pickerTotalPages - 4 + i;
                    } else {
                      pageNum = pickerCurrentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`combo-page-num ${pickerCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setPickerCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={pickerCurrentPage >= pickerTotalPages}
                  onClick={() => setPickerCurrentPage((p) => Math.min(pickerTotalPages, p + 1))}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>

              {/* Primary Done Button */}
              <button
                type="button"
                className="combo-prim-btn"
                style={{ padding: '0.5rem 1.2rem', gap: '0.5rem' }}
                onClick={() => setIsPickerOpen(false)}
              >
                <CheckCircle size={15} />
                <span>Done ({bundleFormData.productList?.length || 0} Selected)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboOffersPage;
