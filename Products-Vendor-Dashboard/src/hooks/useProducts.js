import { useEffect, useState, useMemo } from 'react';
import { useProductsContext } from '../context/ProductsContext';

/**
 * useProducts hook delegates to ProductsContext,
 * providing memory caching across page navigations and optimistic
 * CRUD updates that eliminate collection re-reads.
 */
export const useProducts = (options = {}) => {
  const context = useProductsContext();
  const optionsKey = JSON.stringify(options);
  const isFiltered = useMemo(() => Boolean(options.category || options.status || options.cursor), [optionsKey]);

  useEffect(() => {
    if (isFiltered) {
      context.fetchProducts(options, false);
    }
  }, [isFiltered, options, context]);

  return {
    products: context.products,
    loading: context.loading,
    error: context.error,
    hasMore: context.hasMore,
    reload: context.reload,
    createProduct: context.addProduct,
    deleteProduct: context.removeProduct,
    publishProduct: (id) => context.changeProductStatus(id, 'published'),
    draftProduct: (id) => context.changeProductStatus(id, 'draft'),
    archiveProduct: (id) => context.changeProductStatus(id, 'archived')
  };
};

/**
 * useProduct hook retrieves a single product from ProductsContext cache first,
 * completely bypassing a Firestore getDoc read if the product was already loaded in memory.
 */
export const useProduct = (productId) => {
  const context = useProductsContext();
  const [product, setProduct] = useState(context.productsMap[productId] || null);
  const [loading, setLoading] = useState(!context.productsMap[productId] && Boolean(productId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    // Cache hit check
    if (context.productsMap[productId]) {
      setProduct(context.productsMap[productId]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    context.getProductById(productId)
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
  }, [productId, context]);

  return { product, loading, error };
};
