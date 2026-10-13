import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { updateOrderStatus } from '../services/orderService';
import { toDate } from '../services/firebaseUtils';
import { useAuthVendor } from './useAuthVendor';

export const useOrders = (options = {}) => {
  const { loading: authLoading } = useAuthVendor();
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
    const constraints = [];
    // In main-admin, query all orders across all vendors unless specifically requested in options
    if (queryOptions.vendorId && queryOptions.vendorId !== 'all') {
      constraints.push(where('vendorId', '==', queryOptions.vendorId));
    }
    if (queryOptions.status && queryOptions.status !== 'all') {
      constraints.push(where('status', '==', queryOptions.status));
    }
    constraints.push(limit(queryOptions.pageSize || 100));

    return onSnapshot(
      query(collection(db, COLLECTIONS.orders), ...constraints),
      (snapshot) => {
        const list = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
        // Sort descending by date (handling both Firestore Timestamps and strings)
        list.sort((a, b) => {
          const tB = toDate(b.createdAt || b.updatedAt)?.getTime() || 0;
          const tA = toDate(a.createdAt || a.updatedAt)?.getTime() || 0;
          return tB - tA;
        });
        setOrders(list);
        setHasMore(snapshot.docs.length === (queryOptions.pageSize || 100));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(err);
        setLoading(false);
      }
    );
  }, [authLoading, queryOptions]);

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
