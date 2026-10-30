import { useDashboard } from '../context/DashboardContext';

/**
 * useDashboardAnalytics delegates to DashboardContext,
 * providing TTL-based in-memory caching for analytics data.
 * This prevents reading up to 1,600 documents across orders, products,
 * inventory, and reviews every time the vendor navigates to the dashboard.
 */
export const useDashboardAnalytics = () => {
  return useDashboard();
};
