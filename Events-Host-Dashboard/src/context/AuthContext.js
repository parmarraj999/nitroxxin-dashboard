import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import {
  ensureHostProfileFromApplication,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  resubmitHostApplication,
  signUpWithEmail,
  subscribeToHostApplication,
  subscribeToUser,
} from '../services/firebaseService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hostApplication, setHostApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setProfile(null);
      setHostApplication(null);
      setAuthError('');
      if (!user) {
        setLoading(false);
        setProfileLoading(false);
        setApplicationLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Listen to profile in event_host / users
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

  // Real-time listener for host application status (Pending | Approved | Rejected)
  useEffect(() => {
    if (!firebaseUser?.uid) {
      setHostApplication(null);
      setApplicationLoading(false);
      return undefined;
    }

    setApplicationLoading(true);
    const unsubscribeApp = subscribeToHostApplication(
      firebaseUser.uid,
      (appData) => {
        setHostApplication(appData);
        setApplicationLoading(false);

        // If approved by admin, ensure event_host profile is initialized so dashboard never breaks
        if (appData && (appData.status === 'Approved' || appData.isActive)) {
          ensureHostProfileFromApplication(firebaseUser.uid, appData).catch(console.error);
        }
      },
      (error) => {
        console.warn('Host application listener warning:', error);
        setApplicationLoading(false);
      }
    );

    return unsubscribeApp;
  }, [firebaseUser?.uid]);

  const hostStatus = useMemo(() => {
    if (hostApplication?.status) {
      return hostApplication.status; // 'Pending' | 'Approved' | 'Rejected'
    }
    // Backward compatibility for existing verified hosts without host_applications record
    if (profile?.role === 'Host' && profile?.isActive !== false) {
      return 'Approved';
    }
    return null;
  }, [hostApplication, profile]);

  const resubmitApplication = useCallback(async (updatedFields) => {
    if (!firebaseUser?.uid) throw new Error('You must be logged in to resubmit.');
    await resubmitHostApplication(firebaseUser.uid, updatedFields);
  }, [firebaseUser?.uid]);

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      hostApplication,
      hostStatus,
      isHostApproved: hostStatus === 'Approved',
      isHostPending: hostStatus === 'Pending',
      isHostRejected: hostStatus === 'Rejected',
      role: profile?.role || (hostStatus === 'Approved' ? 'Host' : 'Host'),
      loading: loading || profileLoading || applicationLoading,
      authError,
      isAuthenticated: Boolean(firebaseUser),
      isVerified: Boolean(firebaseUser?.emailVerified || profile?.isVerified),
      signUp: signUpWithEmail,
      login: loginWithEmail,
      loginWithGoogle,
      resetPassword,
      logout,
      resubmitApplication,
      clearAuthError: () => setAuthError(''),
    }),
    [firebaseUser, profile, hostApplication, hostStatus, loading, profileLoading, applicationLoading, authError, resubmitApplication]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
