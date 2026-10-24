import { useEffect, useState, useMemo, useContext } from 'react';
import EventsContext from '../context/EventsContext';
import { subscribeToEvents } from '../services/firebaseService';

export const useEvents = (filters = {}) => {
  const eventsCtx = useContext(EventsContext);
  const { hostId, status, search, city, category, ticketType } = filters;

  // Use EventsContext cache if querying the authenticated host's events
  const canUseContext = Boolean(
    eventsCtx &&
    eventsCtx.hostId &&
    hostId &&
    hostId === eventsCtx.hostId
  );

  const [fallbackEvents, setFallbackEvents] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  const [fallbackError, setFallbackError] = useState('');

  useEffect(() => {
    // If served from DataContext, avoid duplicate Firestore onSnapshot reads completely
    if (canUseContext) return undefined;

    setFallbackLoading(true);
    const unsubscribe = subscribeToEvents(
      { hostId, status, search, city, category, ticketType },
      (items) => {
        setFallbackEvents(items);
        setFallbackLoading(false);
      },
      (err) => {
        setFallbackError(err.message);
        setFallbackLoading(false);
      }
    );
    return unsubscribe;
  }, [canUseContext, hostId, status, search, city, category, ticketType]);

  // Memoized in-memory filtering from EventsContext cache (0 reads)
  const filteredContextEvents = useMemo(() => {
    if (!canUseContext || !eventsCtx?.events) return [];

    let result = eventsCtx.events;

    if (status && status !== 'all') {
      result = result.filter((e) => e.status === status);
    }
    if (city) {
      result = result.filter((e) => (e.city || '').toLowerCase() === city.toLowerCase());
    }
    if (category) {
      result = result.filter((e) => (e.category || '').toLowerCase() === category.toLowerCase());
    }
    if (ticketType) {
      result = result.filter((e) => e.ticketType === ticketType);
    }
    if (search) {
      const normalized = search.toLowerCase().trim();
      result = result.filter((e) =>
        [e.title, e.category, e.city, e.venue]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      );
    }

    return result;
  }, [canUseContext, eventsCtx?.events, status, city, category, ticketType, search]);

  if (canUseContext) {
    return {
      events: filteredContextEvents,
      loading: eventsCtx.eventsLoading,
      error: eventsCtx.eventsError || '',
    };
  }

  return {
    events: fallbackEvents,
    loading: fallbackLoading,
    error: fallbackError,
  };
};

