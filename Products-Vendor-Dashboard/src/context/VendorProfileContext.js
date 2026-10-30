import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getVendorProfile, saveVendorProfile as saveVendorProfileInDb } from '../services/vendorService';
import { emptyVendorProfile } from '../schemas/firestoreSchema';
import { useAuth } from './AuthContext';

export const VendorProfileContext = createContext(null);

export const VendorProfileProvider = ({ children }) => {
  const { user, profile: authProfile, updateProfileCache } = useAuth();
  const [profile, setProfile] = useState(authProfile || emptyVendorProfile);
  const [loading, setLoading] = useState(!authProfile && Boolean(user));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync with authProfile if available to avoid unnecessary Firestore read
  useEffect(() => {
    if (authProfile) {
      setProfile((prev) => ({ ...emptyVendorProfile, ...prev, ...authProfile }));
      setLoading(false);
    }
  }, [authProfile]);

  // Only fetch if profile was not provided by AuthContext
  useEffect(() => {
    if (!user || authProfile) return;

    let active = true;
    setLoading(true);
    (async () => {
      try {
        console.log('[VendorProfileContext] Reading vendor profile from Firestore:', user.uid);
        const data = await getVendorProfile(user.uid);
        if (data && active) {
          const merged = { ...emptyVendorProfile, ...data };
          setProfile(merged);
          updateProfileCache(merged);
        }
      } catch (e) {
        console.error('[VendorProfileContext] Failed to load profile:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, authProfile, updateProfileCache]);

  const updateTopLevel = useCallback((key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateNested = useCallback((section, key, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value }
    }));
  }, []);

  // Save profile and update cache in AuthContext too
  const saveProfile = useCallback(async (customProfileData) => {
    if (!user) return;
    const targetData = customProfileData || profile;
    setSaving(true);
    setSaveError('');
    try {
      console.log('[VendorProfileContext] Writing profile update to Firestore:', user.uid);
      await saveVendorProfileInDb(targetData, user.uid);
      setProfile(targetData);
      updateProfileCache(targetData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch (e) {
      console.error('[VendorProfileContext] Failed to save profile:', e);
      setSaveError('Failed to save profile. Please try again.');
      throw e;
    } finally {
      setSaving(false);
    }
  }, [user, profile, updateProfileCache]);

  const handleSave = useCallback(async () => {
    return saveProfile(profile);
  }, [saveProfile, profile]);

  const value = useMemo(() => ({
    profile,
    loading,
    saving,
    saved,
    saveError,
    updateTopLevel,
    updateNested,
    setTop: updateTopLevel,
    setNested: updateNested,
    setProfile,
    saveProfile,
    handleSave
  }), [profile, loading, saving, saved, saveError, updateTopLevel, updateNested, saveProfile, handleSave]);


  return (
    <VendorProfileContext.Provider value={value}>
      {children}
    </VendorProfileContext.Provider>
  );
};

export const useVendorProfile = () => {
  const context = useContext(VendorProfileContext);
  if (!context) {
    throw new Error('useVendorProfile must be used within a VendorProfileProvider');
  }
  return context;
};
