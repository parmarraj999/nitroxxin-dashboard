import { useCallback, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.config';
import { DEFAULT_VENDOR_ID } from '../services/firebaseUtils';

export const useAuthVendor = () => {
  const [state, setState] = useState({
    user: auth.currentUser,
    profile: null,
    loading: true,
    isAuthenticated: false
  });

  const fetchProfile = async (user) => {
    try {
      const docRef = doc(db, 'vendors', user.uid);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (e) {
      console.error('Error fetching vendor profile:', e);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await fetchProfile(user);
        setState({
          user,
          profile,
          loading: false,
          isAuthenticated: !user.isAnonymous
        });
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false
        });
      }
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      const profile = await fetchProfile(user);
      setState((prev) => ({ ...prev, profile }));
      return profile;
    }
    return null;
  }, []);

  const vendorId = (!state.user || state.user.isAnonymous) ? DEFAULT_VENDOR_ID : state.user.uid;

  return { ...state, vendorId, signIn, signUp, signOut, refreshProfile };
};

