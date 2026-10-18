import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  signUpWithEmail,
  subscribeToUser,
} from '../services/firebaseService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setProfile(null);
      setAuthError('');
      if (!user) {
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid) return undefined;
    setProfileLoading(true);
    const unsubscribeProfile = subscribeToUser(
      firebaseUser.uid,
      (snapshot) => {
        setProfile(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
        setProfileLoading(false);
      },
      (error) => {
        setAuthError(error.message);
        setLoading(false);
        setProfileLoading(false);
      }
    );
    return unsubscribeProfile;
  }, [firebaseUser?.uid]);

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      role: profile?.role,
      loading: loading || profileLoading,
      authError,
      isAuthenticated: Boolean(firebaseUser),
      isVerified: Boolean(firebaseUser?.emailVerified || profile?.isVerified),
      signUp: signUpWithEmail,
      login: loginWithEmail,
      loginWithGoogle,
      resetPassword,
      logout,
      clearAuthError: () => setAuthError(''),
    }),
    [firebaseUser, profile, loading, profileLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
