import { useEffect, useState, useMemo, useContext } from 'react';
import RegistrationsContext from '../context/RegistrationsContext';
import EventsContext from '../context/EventsContext';
import { subscribeToRegistrations } from '../services/firebaseService';

export const useRegistrations = (filters = {}) => {
  const regCtx = useContext(RegistrationsContext);
  const eventsCtx = useContext(EventsContext);
  const { hostId, eventId, userId } = filters;

  // We can serve from context if:
  // 1. hostId matches context hostId
  // 2. eventId belongs to one of the host's events already tracked in context
  const canUseContext = Boolean(
    regCtx &&
    regCtx.hostId &&
    (
      (hostId && hostId === regCtx.hostId) ||
      (eventId && eventsCtx?.events?.some((e) => e.id === eventId || e.eventId === eventId))
    )
  );

  const [fallbackRegistrations, setFallbackRegistrations] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  const [fallbackError, setFallbackError] = useState('');

  useEffect(() => {
    // If served from DataContext, avoid duplicate Firestore onSnapshot reads completely
    if (canUseContext) return undefined;

    setFallbackLoading(true);
    const unsubscribe = subscribeToRegistrations(
      { hostId, eventId, userId },
      (items) => {
        setFallbackRegistrations(items);
        setFallbackLoading(false);
      },
      (err) => {
        setFallbackError(err.message);
        setFallbackLoading(false);
      }
    );
    return unsubscribe;
  }, [canUseContext, hostId, eventId, userId]);

  // Memoized in-memory filtering from RegistrationsContext cache (0 reads)
  const filteredContextRegistrations = useMemo(() => {
    if (!canUseContext || !regCtx?.registrations) return [];

    let result = regCtx.registrations;
    if (eventId) {
      result = result.filter((r) => r.eventId === eventId);
    }
    if (userId) {
      result = result.filter((r) => r.userId === userId);
    }
    return result;
  }, [canUseContext, regCtx?.registrations, eventId, userId]);

  if (canUseContext) {
    return {
      registrations: filteredContextRegistrations,
      loading: regCtx.registrationsLoading,
      error: regCtx.registrationsError || '',
    };
  }

  return {
    registrations: fallbackRegistrations,
    loading: fallbackLoading,
    error: fallbackError,
  };
};

