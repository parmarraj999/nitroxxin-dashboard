import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import EventsContext from './EventsContext';
import { subscribeToHostBookings, subscribeToHostPayments } from '../services/firebaseService';

const BookingsContext = createContext(null);

const CACHE_KEY_BOOKINGS = 'nitroxx_cached_bookings';
const CACHE_KEY_PAYMENTS = 'nitroxx_cached_payments';

export const BookingsProvider = ({ children }) => {
  const { user } = useAuth();
  const hostId = user?.uid;
  const eventsCtx = useContext(EventsContext);

  // Derive stable eventIds
  const eventIds = useMemo(() => {
    if (!Array.isArray(eventsCtx?.events)) return [];
    return eventsCtx.events.map((e) => e.id || e.eventId).filter(Boolean);
  }, [eventsCtx?.events]);

  const eventIdsKey = useMemo(() => eventIds.join(','), [eventIds]);

  // 1. Synchronously load from localStorage for 0ms instantaneous load
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY_BOOKINGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [payments, setPayments] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY_PAYMENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [loadingBookings, setLoadingBookings] = useState(() => !bookings.length && Boolean(hostId));
  const [loadingPayments, setLoadingPayments] = useState(() => !payments.length && Boolean(hostId));
  const [error, setError] = useState('');

  // 1. Single central real-time subscription for host bookings
  useEffect(() => {
    if (!hostId) {
      setBookings([]);
      setLoadingBookings(false);
      try {
        localStorage.removeItem(CACHE_KEY_BOOKINGS);
      } catch {}
      return undefined;
    }

    setLoadingBookings(true);
    const unsub = subscribeToHostBookings(
      { hostId, eventIds },
      (items) => {
        setBookings(items);
        setLoadingBookings(false);
        try {
          localStorage.setItem(CACHE_KEY_BOOKINGS, JSON.stringify(items));
        } catch (e) {
          console.warn('Could not cache bookings locally:', e);
        }
      },
      (err) => {
        console.warn('Bookings subscription error:', err);
        setError(err.message || 'Error loading bookings');
        setLoadingBookings(false);
      }
    );

    return () => unsub && unsub();
  }, [hostId, eventIdsKey]);

  // 2. Single central real-time subscription for host payments
  useEffect(() => {
    if (!hostId) {
      setPayments([]);
      setLoadingPayments(false);
      try {
        localStorage.removeItem(CACHE_KEY_PAYMENTS);
      } catch {}
      return undefined;
    }

    setLoadingPayments(true);
    const unsub = subscribeToHostPayments(
      { hostId, eventIds },
      (items) => {
        setPayments(items);
        setLoadingPayments(false);
        try {
          localStorage.setItem(CACHE_KEY_PAYMENTS, JSON.stringify(items));
        } catch (e) {
          console.warn('Could not cache payments locally:', e);
        }
      },
      (err) => {
        console.warn('Payments subscription error:', err);
        setLoadingPayments(false);
      }
    );

    return () => unsub && unsub();
  }, [hostId, eventIdsKey]);

  const value = useMemo(
    () => ({
      hostId,
      bookings,
      payments,
      loading: loadingBookings || loadingPayments,
      loadingBookings,
      loadingPayments,
      error,
    }),
    [hostId, bookings, payments, loadingBookings, loadingPayments, error]
  );

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookingsContext = () => {
  const context = useContext(BookingsContext);
  return context;
};

export default BookingsContext;

