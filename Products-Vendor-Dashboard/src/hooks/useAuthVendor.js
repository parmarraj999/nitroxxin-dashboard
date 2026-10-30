import { useAuth } from '../context/AuthContext';

/**
 * useAuthVendor hook now delegates to the centralized AuthContext,
 * eliminating duplicate onAuthStateChanged listeners and repetitive
 * getDoc('vendors', uid) reads on every page and component render.
 */
export const useAuthVendor = () => {
  return useAuth();
};
