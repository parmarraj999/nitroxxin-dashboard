import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToRegistrations,
  subscribeToEventBookings,
} from '../services/firebaseService';

const RegistrationsContext = createContext(null);

const CACHE_KEY_REGISTRATIONS = 'nitroxx_cached_registrations';

export const RegistrationsProvider = ({ children }) => {
  const { user } = useAuth();
  const hostId = user?.uid;

  // 1. Synchronously load initial registrations from localStorage for 0ms load
  const [registrations, setRegistrations] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY_REGISTRATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [registrationsLoading, setRegistrationsLoading] = useState(() => !registrations.length);
  const [registrationsError, setRegistrationsError] = useState('');

  // In-memory cache for event bookings
  const bookingsCache = useRef(new Map());

  // ---------------------------------------------------------------------------
  // SINGLE CENTRAL REAL-TIME SUBSCRIPTION FOR HOST'S REGISTRATIONS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hostId) {
      setRegistrations([]);
      setRegistrationsLoading(false);
      try {
        localStorage.removeItem(CACHE_KEY_REGISTRATIONS);
      } catch {}
      return undefined;
    }

    setRegistrationsLoading(true);
    const unsubscribe = subscribeToRegistrations(
      { hostId },
      (items) => {
        setRegistrations(items);
        setRegistrationsLoading(false);
        try {
          localStorage.setItem(CACHE_KEY_REGISTRATIONS, JSON.stringify(items));
        } catch (e) {
          console.warn('Could not cache registrations locally:', e);
        }
      },
      (err) => {
        console.warn('Registrations subscription error:', err);
        setRegistrationsError(err.message);
        setRegistrationsLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [hostId]);

  // ---------------------------------------------------------------------------
  // CACHED READ HELPERS (0 FIRESTORE READS)
  // ---------------------------------------------------------------------------
  const getEventRegistrations = useCallback(
    (eventId) => {
      if (!eventId) return [];
      return registrations.filter((r) => r.eventId === eventId);
    },
    [registrations]
  );

  const subscribeToEventBookingsCached = useCallback((eventId, callback) => {
    if (!eventId) return () => {};

    const cached = bookingsCache.current.get(eventId);
    if (cached?.list && callback) {
      callback(cached.list);
    }

    return subscribeToEventBookings(eventId, (items) => {
      bookingsCache.current.set(eventId, { list: items, timestamp: Date.now() });
      if (callback) callback(items);
    });
  }, []);

  const refreshRegistrations = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY_REGISTRATIONS);
    } catch {}
    setRegistrationsLoading(true);
  }, []);

  const value = useMemo(
    () => ({
      hostId,
      registrations,
      registrationsLoading,
      registrationsError,
      getEventRegistrations,
      subscribeToEventBookingsCached,
      refreshRegistrations,
    }),
    [
      hostId,
      registrations,
      registrationsLoading,
      registrationsError,
      getEventRegistrations,
      subscribeToEventBookingsCached,
      refreshRegistrations,
    ]
  );

  return (
    <RegistrationsContext.Provider value={value}>
      {children}
    </RegistrationsContext.Provider>
  );
};

export const useRegistrationsContext = () => {
  const context = useContext(RegistrationsContext);
  if (!context) {
    throw new Error('useRegistrationsContext must be used within a RegistrationsProvider.');
  }
  return context;
};

export default RegistrationsContext;
