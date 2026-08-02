import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import { DEFAULT_VENDOR_ID } from '../services/firebaseUtils';

export const useAuthVendor = () => {
  const getVendorIdFromUser = (user) => {
    if (!user || user.isAnonymous) return DEFAULT_VENDOR_ID;
    return user.uid;
  };

  const [state, setState] = useState({
    user: auth.currentUser,
    vendorId: getVendorIdFromUser(auth.currentUser),
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user,
        vendorId: getVendorIdFromUser(user),
        loading: false
      });
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
