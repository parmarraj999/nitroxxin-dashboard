import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import { DEFAULT_VENDOR_ID } from '../services/firebaseUtils';

export const useAuthVendor = () => {
  const [state, setState] = useState({ user: auth.currentUser, vendorId: auth.currentUser?.uid || DEFAULT_VENDOR_ID, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, vendorId: user?.uid || DEFAULT_VENDOR_ID, loading: false });
    });
    return unsubscribe;
  }, []);

  const ensureSession = useCallback(async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  }, []);

  return { ...state, ensureSession };
};
