import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from './useEvents';
import { subscribeToHostBookings, subscribeToHostPayments } from '../services/firebaseService';

/**
 * useBookingsAndPayments
 * Real-time subscription hook to fetch all event bookings and payment records for a host,
 * queried by hostId and the host's event IDs.
 */
export const useBookingsAndPayments = (options = {}) => {
  const { user, profile } = useAuth();
  const hostId = options.hostId || user?.uid || profile?.uid || profile?.id;

  // Retrieve events owned by this host so we can also query bookings by eventId
  const { events } = useEvents({ hostId });
  const eventIds = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.map((e) => e.id || e.eventId).filter(Boolean);
  }, [events]);

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(Boolean(hostId));
  const [loadingPayments, setLoadingPayments] = useState(Boolean(hostId));
  const [error, setError] = useState('');

  // 1. Subscribe to Bookings by hostId
  useEffect(() => {
    if (!hostId) {
      setBookings([]);
      setLoadingBookings(false);
      return () => {};
    }

    setLoadingBookings(true);
    const unsub = subscribeToHostBookings(
      { hostId, eventIds },
      (items) => {
        setBookings(items);
        setLoadingBookings(false);
      },
      (err) => {
        console.warn('useBookingsAndPayments bookings error:', err);
        setError(err.message || 'Error loading bookings');
        setLoadingBookings(false);
      }
    );

    return () => unsub && unsub();
  }, [hostId, eventIds]);

  // 2. Subscribe to Payments by hostId
  useEffect(() => {
    if (!hostId) {
      setPayments([]);
      setLoadingPayments(false);
      return () => {};
    }

    setLoadingPayments(true);
    const unsub = subscribeToHostPayments(
      { hostId, eventIds },
      (items) => {
        setPayments(items);
        setLoadingPayments(false);
      },
      (err) => {
        console.warn('useBookingsAndPayments payments error:', err);
        setLoadingPayments(false);
      }
    );

    return () => unsub && unsub();
  }, [hostId, eventIds]);

  return {
    bookings,
    payments,
    loading: loadingBookings || loadingPayments,
    loadingBookings,
    loadingPayments,
    error,
    hostId,
  };
};

export default useBookingsAndPayments;
