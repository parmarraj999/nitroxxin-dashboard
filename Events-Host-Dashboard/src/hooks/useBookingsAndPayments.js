import { useEffect, useState, useMemo, useContext } from 'react';
import BookingsContext from '../context/BookingsContext';
import { useAuth } from '../context/AuthContext';
import { useEvents } from './useEvents';
import { subscribeToHostBookings, subscribeToHostPayments } from '../services/firebaseService';

/**
 * useBookingsAndPayments
 * Real-time subscription hook to fetch all event bookings and payment records for a host,
 * served instantly from BookingsContext (0ms reads) with fallback for custom hostId queries.
 */
export const useBookingsAndPayments = (options = {}) => {
  const bookingsCtx = useContext(BookingsContext);
  const { user, profile } = useAuth();
  const hostId = options.hostId || user?.uid || profile?.uid || profile?.id;

  const canUseContext = Boolean(
    bookingsCtx &&
    bookingsCtx.hostId &&
    hostId &&
    hostId === bookingsCtx.hostId
  );

  // Retrieve events owned by this host so we can also query bookings by eventId in fallback
  const { events } = useEvents(canUseContext ? {} : { hostId });
  const eventIds = useMemo(() => {
    if (canUseContext || !Array.isArray(events)) return [];
    return events.map((e) => e.id || e.eventId).filter(Boolean);
  }, [canUseContext, events]);
  const eventIdsKey = useMemo(() => eventIds.join(','), [eventIds]);

  const [fallbackBookings, setFallbackBookings] = useState([]);
  const [fallbackPayments, setFallbackPayments] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(!canUseContext && Boolean(hostId));
  const [loadingPayments, setLoadingPayments] = useState(!canUseContext && Boolean(hostId));
  const [error, setError] = useState('');

  // 1. Fallback Subscribe to Bookings (only if outside BookingsContext)
  useEffect(() => {
    if (canUseContext) return undefined;
    if (!hostId) {
      setFallbackBookings([]);
      setLoadingBookings(false);
      return () => {};
    }

    setLoadingBookings(true);
    const unsub = subscribeToHostBookings(
      { hostId, eventIds },
      (items) => {
        setFallbackBookings(items);
        setLoadingBookings(false);
      },
      (err) => {
        console.warn('useBookingsAndPayments bookings error:', err);
        setError(err.message || 'Error loading bookings');
        setLoadingBookings(false);
      }
    );

    return () => unsub && unsub();
  }, [canUseContext, hostId, eventIdsKey]);

  // 2. Fallback Subscribe to Payments (only if outside BookingsContext)
  useEffect(() => {
    if (canUseContext) return undefined;
    if (!hostId) {
      setFallbackPayments([]);
      setLoadingPayments(false);
      return () => {};
    }

    setLoadingPayments(true);
    const unsub = subscribeToHostPayments(
      { hostId, eventIds },
      (items) => {
        setFallbackPayments(items);
        setLoadingPayments(false);
      },
      (err) => {
        console.warn('useBookingsAndPayments payments error:', err);
        setLoadingPayments(false);
      }
    );

    return () => unsub && unsub();
  }, [canUseContext, hostId, eventIdsKey]);

  if (canUseContext) {
    return {
      bookings: bookingsCtx.bookings,
      payments: bookingsCtx.payments,
      loading: bookingsCtx.loading,
      loadingBookings: bookingsCtx.loadingBookings,
      loadingPayments: bookingsCtx.loadingPayments,
      error: bookingsCtx.error || '',
      hostId,
    };
  }

  return {
    bookings: fallbackBookings,
    payments: fallbackPayments,
    loading: loadingBookings || loadingPayments,
    loadingBookings,
    loadingPayments,
    error,
    hostId,
  };
};

export default useBookingsAndPayments;
