import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { updateOrderStatus as updateOrderStatusInDb } from '../services/orderService';
import { useAuth } from './AuthContext';

export const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const { vendorId, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fast O(1) dictionary by order ID
  const ordersMap = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (o.id) map[o.id] = o;
    });
    return map;
  }, [orders]);

  // Single shared subscription to orders collection for this vendor
  useEffect(() => {
    if (authLoading || !vendorId) return;

    setLoading(true);
    setError(null);

    console.log('[OrdersContext] Establishing single shared orders subscription for vendor:', vendorId);
    const ordersQuery = query(
      collection(db, COLLECTIONS.orders),
      where('vendorId', '==', vendorId)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Client-side sort descending by createdAt to avoid composite index requirement
        items.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });

        setOrders(items);
        setLoading(false);
      },
      (err) => {
        console.error('[OrdersContext] Orders subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, vendorId]);

  // Read single order: checks cached orders first to save Firestore reads
  const getOrderById = useCallback(async (orderId) => {
    if (!orderId) return null;

    if (ordersMap[orderId]) {
      console.log('[OrdersContext] Cache hit for order:', orderId, '(0 database reads)');
      return ordersMap[orderId];
    }

    console.log('[OrdersContext] Cache miss. Reading order from Firestore:', orderId);
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.orders, orderId));
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === orderData.id);
          return exists ? prev.map((o) => (o.id === orderData.id ? orderData : o)) : [orderData, ...prev];
        });
        return orderData;
      }
      return null;
    } catch (err) {
      console.error('[OrdersContext] Error fetching order by ID:', err);
      throw err;
    }
  }, [ordersMap]);

  // Update order status with optimistic cache update (0 extra reads)
  const changeOrderStatus = useCallback(async (orderId, status, note = '') => {
    await updateOrderStatusInDb(orderId, status, note);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updatedAt: new Date(),
              timeline: {
                ...(o.timeline || {}),
                [status]: { note, at: new Date() }
              }
            }
          : o
      )
    );
  }, []);

  const value = useMemo(() => ({
    orders,
    ordersMap,
    loading,
    error,
    getOrderById,
    changeOrderStatus
  }), [orders, ordersMap, loading, error, getOrderById, changeOrderStatus]);

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrdersContext = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }
  return context;
};
