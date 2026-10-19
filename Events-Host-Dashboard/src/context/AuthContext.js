import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';
import {
  ensureHostProfileFromApplication,
  getHostApplication,
  loginWithEmail,
  loginWithGoogle,
  logout as firebaseLogout,
  resetPassword,
  resubmitHostApplication,
  signUpWithEmail,
  subscribeToHostApplication,
  subscribeToUser,
} from '../services/firebaseService';
import {
  saveSessionMemory,
  loadSessionMemory,
  clearSessionMemory,
  setSavedEmail,
  setRememberMe,
  isRememberMeEnabled,
} from '../utils/sessionMemory';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Immediately and synchronously restore session from device memory
  const initialMemory = useMemo(() => loadSessionMemory(), []);

  const [firebaseUser, setFirebaseUser] = useState(() => {
    if (initialMemory?.uid) {
      return {
        uid: initialMemory.uid,
        email: initialMemory.email || '',
        displayName: initialMemory.displayName || initialMemory.profile?.fullName || '',
        photoURL: initialMemory.photoURL || initialMemory.profile?.photoURL || '',
        emailVerified: Boolean(initialMemory.emailVerified),
      };
    }
    return null;
  });

  const [profile, setProfile] = useState(() => initialMemory?.profile || null);
  const [hostApplication, setHostApplication] = useState(() => initialMemory?.hostApplication || null);

  // If memory has a session, initial loading is false immediately
  const [loading, setLoading] = useState(() => !initialMemory?.uid);
  const [profileLoading, setProfileLoading] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // 2. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        setAuthError('');
        setLoading(false);

        // Update memory with current Firebase user data
        saveSessionMemory({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified || false,
        });
      } else {
        // If Firebase confirms no user is logged in
        setFirebaseUser(null);
        setProfile(null);
        setHostApplication(null);
        clearSessionMemory();
        setLoading(false);
        setProfileLoading(false);
        setApplicationLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  // 3. Listen to profile in event_host / users
  useEffect(() => {
    if (!firebaseUser?.uid) return undefined;
    setProfileLoading(true);
    const unsubscribeProfile = subscribeToUser(
      firebaseUser.uid,
      (snapshot) => {
        const profileData = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        setProfile(profileData);
        setLoading(false);
        setProfileLoading(false);

        if (profileData) {
          saveSessionMemory({
            uid: firebaseUser.uid,
            email: firebaseUser.email || profileData.email || '',
            displayName: firebaseUser.displayName || profileData.fullName || '',
            photoURL: firebaseUser.photoURL || profileData.photoURL || '',
            emailVerified: firebaseUser.emailVerified || profileData.isVerified || false,
            profile: profileData,
            role: profileData.role || 'Host',
          });
        }
      },
      (error) => {
        console.warn('Profile listener notice:', error);
        setLoading(false);
        setProfileLoading(false);
      }
    );
    return unsubscribeProfile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  // 4. Real-time listener for host application status (Pending | Approved | Rejected)
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

        if (appData) {
          saveSessionMemory({
            uid: firebaseUser.uid,
            email: firebaseUser.email || appData.email || '',
            displayName: firebaseUser.displayName || appData.fullName || '',
            photoURL: firebaseUser.photoURL || '',
            hostApplication: appData,
            hostStatus: appData.status || 'Pending',
          });
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  // Calculated host approval status
  const hostStatus = useMemo(() => {
    if (hostApplication?.status) {
      return hostApplication.status; // 'Pending' | 'Approved' | 'Rejected'
    }
    // Backward compatibility for existing verified hosts without host_applications record
    if (profile?.role === 'Host' && profile?.isActive !== false) {
      return 'Approved';
    }
    if (initialMemory?.hostStatus) {
      return initialMemory.hostStatus;
    }
    return null;
  }, [hostApplication, profile, initialMemory]);

  // Login handler with memory persistence
  const handleLogin = useCallback(async (email, password, remember = true) => {
    setAuthError('');
    setRememberMe(remember);
    if (remember) {
      setSavedEmail(email);
    }
    const user = await loginWithEmail(email, password);
    setFirebaseUser(user);
    setLoading(false);

    let appData = null;
    try {
      appData = await getHostApplication(user.uid);
      if (appData) setHostApplication(appData);
    } catch (e) {
      console.warn('Memory login note:', e);
    }

    const calculatedStatus = appData?.status || 'Approved';
    saveSessionMemory({
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified || false,
      hostApplication: appData,
      hostStatus: calculatedStatus,
      rememberMe: remember,
    });

    return user;
  }, []);

  // Signup handler with memory persistence
  const handleSignUp = useCallback(async (signupData) => {
    setAuthError('');
    setRememberMe(true);
    setSavedEmail(signupData.email);
    const user = await signUpWithEmail(signupData);
    setFirebaseUser(user);
    setLoading(false);

    const initialApp = {
      applicationId: `APP-${user.uid.slice(0, 8).toUpperCase()}`,
      uid: user.uid,
      fullName: signupData.fullName || '',
      email: signupData.email || '',
      organizationName: signupData.organizationName || '',
      city: signupData.city || '',
      state: signupData.state || '',
      status: 'Pending',
      isActive: false,
    };
    setHostApplication(initialApp);

    saveSessionMemory({
      uid: user.uid,
      email: user.email || signupData.email,
      displayName: signupData.fullName || user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: false,
      hostApplication: initialApp,
      hostStatus: 'Pending',
      rememberMe: true,
    });

    return user;
  }, []);

  // Google login with memory persistence
  const handleGoogleLogin = useCallback(async (role = 'Host', remember = true) => {
    setAuthError('');
    setRememberMe(remember);
    const user = await loginWithGoogle(role);
    setFirebaseUser(user);
    setLoading(false);

    let appData = null;
    try {
      appData = await getHostApplication(user.uid);
      if (appData) setHostApplication(appData);
    } catch (e) {
      console.warn('Google memory login note:', e);
    }

    const calculatedStatus = appData?.status || 'Approved';
    saveSessionMemory({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified || false,
      hostApplication: appData,
      hostStatus: calculatedStatus,
      rememberMe: remember,
    });

    return user;
  }, []);

  // Resubmit application handler
  const resubmitApplication = useCallback(async (updatedFields) => {
    if (!firebaseUser?.uid) throw new Error('You must be logged in to resubmit.');
    await resubmitHostApplication(firebaseUser.uid, updatedFields);
    setHostApplication((prev) => {
      const updated = { ...prev, ...updatedFields, status: 'Pending' };
      saveSessionMemory({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        profile,
        hostApplication: updated,
        hostStatus: 'Pending',
      });
      return updated;
    });
  }, [firebaseUser, profile]);

  // Logout handler (clears device memory)
  const handleLogout = useCallback(async () => {
    clearSessionMemory();
    setFirebaseUser(null);
    setProfile(null);
    setHostApplication(null);
    await firebaseLogout();
  }, []);

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
      // If we have an active user in memory, do not block the page with fullPage loading
      loading: firebaseUser ? false : (loading || profileLoading || applicationLoading),
      authError,
      isAuthenticated: Boolean(firebaseUser?.uid),
      isVerified: Boolean(firebaseUser?.emailVerified || profile?.isVerified),
      signUp: handleSignUp,
      login: handleLogin,
      loginWithGoogle: handleGoogleLogin,
      resetPassword,
      logout: handleLogout,
      resubmitApplication,
      clearAuthError: () => setAuthError(''),
      rememberMeEnabled: isRememberMeEnabled(),
    }),
    [
      firebaseUser,
      profile,
      hostApplication,
      hostStatus,
      loading,
      profileLoading,
      applicationLoading,
      authError,
      handleSignUp,
      handleLogin,
      handleGoogleLogin,
      handleLogout,
      resubmitApplication,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
