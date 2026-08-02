import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { archiveProduct, createProduct, deleteProduct, draftProduct, getProduct, listProducts, publishProduct, updateProduct } from '../services/productService';
import { useAuthVendor } from './useAuthVendor';

export const useProducts = (options = {}) => {
  const { loading: authLoading, vendorId } = useAuthVendor();
  const optionsKey = JSON.stringify(options);
  const queryOptions = useMemo(() => options, [optionsKey]);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Use a ref for cursor so updating it never triggers the load useEffect to re-run
  const cursorRef = useRef(null);

  const load = useCallback(async (next = false) => {
    if (authLoading) {
      console.log('[useProducts] Skipping load, auth is loading');
      return;
    }
    setLoading(true);
    setError(null);
    const activeCursor = next ? cursorRef.current : null;
    console.log('[useProducts] Loading products for vendor:', vendorId, 'options:', queryOptions);
    try {
      const page = await listProducts({ ...queryOptions, vendorId, cursor: activeCursor });
      console.log('[useProducts] Loaded products count:', page.data.length, 'data:', page.data);
      setProducts((current) => next ? [...current, ...page.data] : page.data);
      cursorRef.current = page.cursor;
      setHasMore(page.hasMore);
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, queryOptions, vendorId]); // cursor removed from deps — read via ref

  useEffect(() => {
    if (authLoading) return;
    cursorRef.current = null; // reset cursor on fresh load
    load(false);
  }, [authLoading, load]);

  return {
    products,
    loading,
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
