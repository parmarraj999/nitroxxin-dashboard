import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { toDate } from '../services/firebaseUtils';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const listenersRef = useRef({});

  const subscribeToModule = React.useCallback((moduleKey, collectionName, constraints = []) => {
    // Stringify constraints to make a unique cache key per module & filter set
    const constraintsString = JSON.stringify(constraints);
    const cacheKey = `${moduleKey}-${constraintsString}`;

    if (listenersRef.current[cacheKey]) {
      return;
    }

    // Set initial state for the query
    setCache((prev) => {
      if (prev[cacheKey]) return prev;
      return {
        ...prev,
        [cacheKey]: { data: [], loading: true, error: null }
      };
    });

    try {
      const q = query(
        collection(db, collectionName),
        ...constraints.map(([field, operator, val]) => where(field, operator, val))
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          // Sort descending by date (same logic as EnterpriseModule)
          rows.sort((a, b) => {
            const aDate = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
            const bDate = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
            return bDate - aDate;
          });

          setCache((prev) => ({
            ...prev,
            [cacheKey]: { data: rows, loading: false, error: null }
          }));
        },
        (error) => {
          console.error(`[DataContext] Error in collection "${collectionName}":`, error);
          setCache((prev) => ({
            ...prev,
            [cacheKey]: { data: prev[cacheKey]?.data || [], loading: false, error: error.message }
          }));
        }
      );

      listenersRef.current[cacheKey] = unsubscribe;
    } catch (err) {
      console.error(`[DataContext] Error setting query for "${collectionName}":`, err);
      setCache((prev) => ({
        ...prev,
        [cacheKey]: { data: [], loading: false, error: err.message }
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all active listeners on unmount
      Object.values(listenersRef.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      listenersRef.current = {};
    };
  }, []);

  const value = React.useMemo(() => ({
    cache,
    subscribeToModule,
  }), [cache, subscribeToModule]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
