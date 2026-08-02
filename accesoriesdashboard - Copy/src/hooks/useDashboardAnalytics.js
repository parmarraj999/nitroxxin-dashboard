import { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../services/analyticsService';
import { useAuthVendor } from './useAuthVendor';

export const useDashboardAnalytics = () => {
  const { loading: authLoading, vendorId } = useAuthVendor();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    getDashboardAnalytics(vendorId)
      .then((data) => {
        if (active) setAnalytics(data);
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
  }, [authLoading, vendorId]);

  return { analytics, loading, error };
};
