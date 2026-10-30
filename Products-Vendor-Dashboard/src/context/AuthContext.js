import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.config';
import { DEFAULT_VENDOR_ID } from '../services/firebaseUtils';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const hasSavedAuth = typeof window !== 'undefined' && localStorage.getItem('nitroxx_auth_user') === 'true';
  const [user, setUser] = useState(() => auth.currentUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(auth.currentUser && !auth.currentUser.isAnonymous) || hasSavedAuth);

  // Cache profile fetching to avoid duplicate getDoc calls
  const fetchProfile = useCallback(async (targetUser) => {
    if (!targetUser) return null;
    try {
      const docRef = doc(db, 'vendors', targetUser.uid);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (e) {
      console.error('[AuthContext] Error fetching vendor profile:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('nitroxx_auth_user', 'true');
        } catch (e) {}
        const userProfile = await fetchProfile(currentUser);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        try {
          localStorage.removeItem('nitroxx_auth_user');
        } catch (e) {}
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        await setPersistence(auth, browserLocalPersistence);
      }
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = credential.user;
      setUser(currentUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('nitroxx_auth_user', 'true');
      } catch (e) {}
      const userProfile = await fetchProfile(currentUser);
      setProfile(userProfile);
      setLoading(false);
      return currentUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, [fetchProfile]);

  const signUp = useCallback(async (email, password) => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        await setPersistence(auth, browserLocalPersistence);
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = credential.user;
      setUser(currentUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('nitroxx_auth_user', 'true');
      } catch (e) {}
      setLoading(false);
      return currentUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      try {
        localStorage.removeItem('nitroxx_auth_user');
      } catch (e) {}
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);


  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const updatedProfile = await fetchProfile(currentUser);
      setProfile(updatedProfile);
      return updatedProfile;
    }
    return null;
  }, [fetchProfile]);

  // Optimistic profile update to avoid database read after write
  const updateProfileCache = useCallback((updatedData) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  }, []);

  const vendorId = useMemo(() => {
    if (!user || user.isAnonymous) return DEFAULT_VENDOR_ID;
    return user.uid;
  }, [user]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isAuthenticated,
    vendorId,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfileCache
  }), [user, profile, loading, isAuthenticated, vendorId, signIn, signUp, signOut, refreshProfile, updateProfileCache]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
