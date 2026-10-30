import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { toDate, getVendorId } from '../services/firebaseUtils';
import {
  listProducts,
  getProduct as fetchProductFromDb,
  createProduct as createProductInDb,
  updateProduct as updateProductInDb,
  deleteProduct as deleteProductInDb,
  publishProduct as publishProductInDb,
  draftProduct as draftProductInDb,
  archiveProduct as archiveProductInDb
} from '../services/productService';
import { useAuth } from './AuthContext';

export const ProductsContext = createContext(null);

export const ProductsProvider = ({ children }) => {
  const { vendorId, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fast O(1) lookup dictionary
  const productsMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.id) map[p.id] = p;
    });
    return map;
  }, [products]);

  // Real-time query to products collection filtered strictly by vendorId
  useEffect(() => {
    if (authLoading) return;
    const targetVendorId = vendorId || getVendorId();
    if (!targetVendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('[ProductsContext] Establishing real-time products query by vendorId:', targetVendorId);
    const productsQuery = query(
      collection(db, COLLECTIONS.products),
      where('vendorId', '==', targetVendorId)
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Client-side sort by updatedAt / createdAt descending to avoid composite index requirements
        items.sort((a, b) => {
          const aTime = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
          const bTime = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
          return bTime - aTime;
        });

        console.log(`[ProductsContext] Loaded ${items.length} products for vendor:`, targetVendorId);
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error('[ProductsContext] Error fetching products by vendorId query:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authLoading, vendorId]);

  const fetchProducts = useCallback(async (options = {}) => {
    const targetVendorId = vendorId || getVendorId();
    if (!targetVendorId) return [];
    try {
      const page = await listProducts({ ...options, vendorId: targetVendorId });
      return page.data || [];
    } catch (e) {
      console.error('[ProductsContext] Error in fetchProducts:', e);
      return [];
    }
  }, [vendorId]);


  // Read single product: checks in-memory cache first! Only reads Firestore if not in cache.
  const getProductById = useCallback(async (productId) => {
    if (!productId) return null;

    // 1. Check in-memory products map
    if (productsMap[productId]) {
      console.log('[ProductsContext] Cache hit for product:', productId, '(0 database reads)');
      return productsMap[productId];
    }

    // 2. Fall back to single Firestore document read if not yet cached
    console.log('[ProductsContext] Cache miss. Reading product from Firestore:', productId);
    try {
      const data = await fetchProductFromDb(productId);
      if (data) {
        // Cache it locally
        setProducts((prev) => {
          const exists = prev.some((p) => p.id === data.id);
          return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [data, ...prev];
        });
      }
      return data;
    } catch (err) {
      console.error('[ProductsContext] Error fetching product by ID:', err);
      throw err;
    }
  }, [productsMap]);

  // Create product with optimistic cache insertion (0 extra reads)
  const addProduct = useCallback(async (data, opts = {}) => {
    const newId = await createProductInDb(data, { vendorId, ...opts });
    const newProduct = {
      id: newId,
      productId: newId,
      ...data,
      vendorId,
      status: opts.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newId;
  }, [vendorId]);

  // Update product with optimistic cache modification (0 extra reads)
  const editProduct = useCallback(async (productId, data) => {
    await updateProductInDb(productId, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data, updatedAt: new Date() } : p))
    );
  }, []);

  // Delete product with optimistic cache removal (0 extra reads)
  const removeProduct = useCallback(async (productId) => {
    await deleteProductInDb(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Update status (publish, draft, archive) with optimistic cache update
  const changeProductStatus = useCallback(async (productId, action) => {
    if (action === 'published') await publishProductInDb(productId);
    else if (action === 'draft') await draftProductInDb(productId);
    else if (action === 'archived') await archiveProductInDb(productId);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: action, updatedAt: new Date() } : p))
    );
  }, []);

  const value = useMemo(() => ({
    products,
    productsMap,
    loading,
    error,
    hasMore: false,
    reload: () => fetchProducts({}),
    fetchProducts,
    getProductById,
    addProduct,
    editProduct,
    removeProduct,
    createProduct: addProduct,
    updateProduct: editProduct,
    deleteProduct: removeProduct,
    changeProductStatus
  }), [
    products,
    productsMap,
    loading,
    error,
    fetchProducts,
    getProductById,
    addProduct,
    editProduct,
    removeProduct,
    changeProductStatus
  ]);


  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};
