import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { updateOrderStatus } from '../services/orderService';
import { useAuthVendor } from './useAuthVendor';

export const useOrders = (options = {}) => {
  const { loading: authLoading, vendorId } = useAuthVendor();
  const optionsKey = JSON.stringify(options);
  const queryOptions = useMemo(() => options, [optionsKey]);
  const [orders, setOrders] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subscribe = useCallback(() => {
    if (authLoading) return;
    setLoading(true);
    setError(null);
    const constraints = [where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'), limit(queryOptions.pageSize || 50)];
    if (queryOptions.status) constraints.splice(1, 0, where('status', '==', queryOptions.status));
    return onSnapshot(
      query(collection(db, COLLECTIONS.orders), ...constraints),
      (snapshot) => {
        setOrders(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        setHasMore(snapshot.docs.length === (queryOptions.pageSize || 50));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, [authLoading, queryOptions, vendorId]);

  useEffect(() => {
    if (authLoading) return;
    const unsubscribe = subscribe();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authLoading, subscribe]);

  return { orders, loading, error, hasMore, reload: subscribe, loadMore: subscribe, updateOrderStatus };
};

export const useOrder = (orderId) => {
  const { loading: authLoading } = useAuthVendor();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || authLoading) return;
    setLoading(true);
    return onSnapshot(
      doc(db, COLLECTIONS.orders, orderId),
      (snapshot) => {
        setOrder(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, [authLoading, orderId]);

  return { order, loading, error };
};
