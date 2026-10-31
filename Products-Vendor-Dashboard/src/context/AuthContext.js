import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
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
      // 1. Try cached custom vendor ID first
      let cachedVendorId = null;
      try {
        cachedVendorId = localStorage.getItem('nitroxx_vendor_id');
      } catch (e) {}

      if (cachedVendorId) {
        const docRef = doc(db, 'vendors', cachedVendorId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const activeId = data.vendorId || data.customVendorId || snapshot.id;
          try {
            localStorage.setItem('nitroxx_vendor_id', activeId);
          } catch (e) {}
          return { id: snapshot.id, ...data };
        }
      }

      // 2. Query vendors collection by ownerId == targetUser.uid
      try {
        const qOwner = query(collection(db, 'vendors'), where('ownerId', '==', targetUser.uid), limit(1));
        const qOwnerSnap = await getDocs(qOwner);
        if (!qOwnerSnap.empty) {
          const docSnap = qOwnerSnap.docs[0];
          const data = docSnap.data();
          const activeId = data.vendorId || data.customVendorId || docSnap.id;
          try {
            localStorage.setItem('nitroxx_vendor_id', activeId);
          } catch (e) {}
          return { id: docSnap.id, ...data };
        }
      } catch (qErr) {
        console.warn('[AuthContext] Error querying by ownerId:', qErr);
      }

      // 3. Query vendors collection by uid == targetUser.uid
      try {
        const qUid = query(collection(db, 'vendors'), where('uid', '==', targetUser.uid), limit(1));
        const qUidSnap = await getDocs(qUid);
        if (!qUidSnap.empty) {
          const docSnap = qUidSnap.docs[0];
          const data = docSnap.data();
          const activeId = data.vendorId || data.customVendorId || docSnap.id;
          try {
            localStorage.setItem('nitroxx_vendor_id', activeId);
          } catch (e) {}
          return { id: docSnap.id, ...data };
        }
      } catch (qErr) {
        console.warn('[AuthContext] Error querying by uid:', qErr);
      }

      // 4. Legacy fallback: doc keyed by targetUser.uid
      const legacyRef = doc(db, 'vendors', targetUser.uid);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists()) {
        const data = legacySnap.data();
        const activeId = data.vendorId || data.customVendorId || targetUser.uid;
        try {
          localStorage.setItem('nitroxx_vendor_id', activeId);
        } catch (e) {}
        return { id: legacySnap.id, ...data };
      }

      return null;
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
          localStorage.removeItem('nitroxx_vendor_id');
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
        localStorage.removeItem('nitroxx_vendor_id');
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
    return profile?.vendorId || profile?.customVendorId || user.uid;
  }, [user, profile]);

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
