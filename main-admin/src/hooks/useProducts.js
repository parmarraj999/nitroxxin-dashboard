import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { archiveProduct, createProduct, deleteProduct, draftProduct, getProduct, listProducts, publishProduct, updateProduct } from '../services/productService';
import { toDate } from '../services/firebaseUtils';
import { useAuthVendor } from './useAuthVendor';

export const useProducts = (options = {}) => {
  const { loading: authLoading } = useAuthVendor();
  const optionsKey = JSON.stringify(options);
  const queryOptions = useMemo(() => options, [optionsKey]);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const isFetchingRef = useRef(false);
  const cursorRef = useRef(null);

  const load = useCallback(async (next = false) => {
    if (authLoading || isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    if (next) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    const activeCursor = next ? cursorRef.current : null;
    try {
      // In main-admin, query all products across all vendors unless queryOptions specifies a vendorId
      const targetVendorId = queryOptions.vendorId || null;
      const page = await listProducts({ 
        ...queryOptions, 
        vendorId: targetVendorId, 
        cursor: activeCursor 
      });

      setProducts((current) => {
        const combined = next ? [...current, ...page.data] : page.data;
        const seen = new Set();
        const deduped = combined.filter((item) => {
          if (!item.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        // Sort descending by date (handling both Firestore Timestamp and ISO strings)
        return deduped.sort((a, b) => {
          const timeB = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
          const timeA = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
          return timeB - timeA;
        });
      });
      cursorRef.current = page.cursor;
      setHasMore(page.hasMore);
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      setError(err);
    } finally {
      isFetchingRef.current = false;
      if (next) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, queryOptions]);

  useEffect(() => {
    if (authLoading) return;
    cursorRef.current = null; // reset cursor on fresh load
    load(false);
  }, [authLoading, load]);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    reload: () => { cursorRef.current = null; load(false); },
    loadMore: () => load(true),
    createProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    draftProduct,
    archiveProduct
  };
};

export const useProduct = (productId) => {
  const { loading: authLoading } = useAuthVendor();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId || authLoading) return;
    let active = true;
    setLoading(true);
    getProduct(productId)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, productId]);

  return { product, loading, error };
};
