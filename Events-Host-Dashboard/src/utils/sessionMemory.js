/**
 * Nitroxx Events - Memory Login & Session Persistence System
 * 
 * Provides instantaneous, synchronous session restoration from localStorage memory
 * so that when users reload or reopen the website, they never have to log in again.
 */

const SESSION_KEY = 'nitroxx_session_memory';
const SAVED_EMAIL_KEY = 'nitroxx_saved_email';
const REMEMBER_ME_KEY = 'nitroxx_remember_login';

/**
 * Save user session snapshot to local device memory
 */
export const saveSessionMemory = (data) => {
  if (!data) return;
  try {
    const existing = loadSessionMemory() || {};
    const updated = {
      ...existing,
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Memory login system: could not save session to storage', err);
  }
};

/**
 * Load user session snapshot from local device memory synchronously
 */
export const loadSessionMemory = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.uid) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Memory login system: could not parse session from storage', err);
    return null;
  }
};

/**
 * Clear user session from device memory on sign out
 */
export const clearSessionMemory = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('Memory login system: could not clear session', err);
  }
};

/**
 * Get previously remembered email address
 */
export const getSavedEmail = () => {
  try {
    return localStorage.getItem(SAVED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
};

/**
 * Save email address for convenience
 */
export const setSavedEmail = (email) => {
  try {
    if (email) {
      localStorage.setItem(SAVED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  } catch (err) {
    console.warn('Memory login system: could not save email', err);
  }
};

/**
 * Check if "Remember Me" is enabled
 */
export const isRememberMeEnabled = () => {
  try {
    const val = localStorage.getItem(REMEMBER_ME_KEY);
    return val !== 'false'; // Default to true
  } catch {
    return true;
  }
};

/**
 * Toggle "Remember Me" preference
 */
export const setRememberMe = (enabled) => {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.warn('Memory login system: could not set remember me preference', err);
  }
};
