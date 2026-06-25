import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOrder, listOrders, updateOrderStatus } from '../services/orderService';
import { useAuthVendor } from './useAuthVendor';

export const useOrders = (options = {}) => {
  const { loading: authLoading, vendorId } = useAuthVendor();
  const optionsKey = JSON.stringify(options);
  const queryOptions = useMemo(() => options, [optionsKey]);
  const [orders, setOrders] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (next = false) => {
    if (authLoading) return;
    setLoading(true);
    setError(null);
    try {
      const page = await listOrders({ ...queryOptions, vendorId, cursor: next ? cursor : null });
      setOrders((current) => next ? [...current, ...page.data] : page.data);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, cursor, queryOptions, vendorId]);

  useEffect(() => {
    if (authLoading) return;
    load(false);
  }, [authLoading, load]);

  return { orders, loading, error, hasMore, reload: () => load(false), loadMore: () => load(true), updateOrderStatus };
};

export const useOrder = (orderId) => {
  const { loading: authLoading } = useAuthVendor();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || authLoading) return;
    let active = true;
    setLoading(true);
    getOrder(orderId)
      .then((data) => {
        if (active) setOrder(data);
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
  }, [authLoading, orderId]);

  return { order, loading, error };
};
