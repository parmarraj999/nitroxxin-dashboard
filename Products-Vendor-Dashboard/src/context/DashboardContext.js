import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { getDashboardAnalytics } from '../services/analyticsService';
import { useAuth } from './AuthContext';

export const DashboardContext = createContext(null);

// Cache TTL: 5 minutes in milliseconds
const CACHE_TTL_MS = 5 * 60 * 1000;

export const DashboardProvider = ({ children }) => {
  const { vendorId, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchedRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchAnalytics = useCallback(async (force = false) => {
    if (authLoading || !vendorId) return;

    const now = Date.now();
    const isCacheValid = analytics && (now - lastFetchedRef.current < CACHE_TTL_MS);

    // Return cached analytics if still valid and not forcing a refresh
    if (!force && isCacheValid) {
      setLoading(false);
      return analytics;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('[DashboardContext] Fetching fresh analytics from Firestore for vendor:', vendorId);
      const data = await getDashboardAnalytics(vendorId);
      setAnalytics(data);
      lastFetchedRef.current = Date.now();
      return data;
    } catch (err) {
      console.error('[DashboardContext] Error fetching dashboard analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [authLoading, vendorId, analytics]);

  useEffect(() => {
    if (!authLoading && vendorId) {
      fetchAnalytics(false);
    }
  }, [authLoading, vendorId, fetchAnalytics]);

  // Invalidate cache when products or orders change so the next dashboard visit fetches fresh data
  const invalidateAnalytics = useCallback(() => {
    lastFetchedRef.current = 0;
  }, []);

  // Optimistic update for quick UI reactivity without full re-queries
  const updateAnalyticsOptimistic = useCallback((updater) => {
    setAnalytics((prev) => (prev ? updater(prev) : prev));
  }, []);

  const value = useMemo(() => ({
    analytics,
    loading,
    error,
    refreshAnalytics: () => fetchAnalytics(true),
    invalidateAnalytics,
    updateAnalyticsOptimistic
  }), [analytics, loading, error, fetchAnalytics, invalidateAnalytics, updateAnalyticsOptimistic]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
