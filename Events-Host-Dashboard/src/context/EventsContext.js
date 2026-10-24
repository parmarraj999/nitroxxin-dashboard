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
  subscribeToEvents,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  getEvent as apiGetEvent,
  incrementEventView as apiIncrementEventView,
} from '../services/firebaseService';

const EventsContext = createContext(null);

const CACHE_KEY_EVENTS = 'nitroxx_cached_events';

export const EventsProvider = ({ children }) => {
  const { user } = useAuth();
  const hostId = user?.uid;

  // 1. Synchronously hydrate initial events from localStorage for 0ms instantaneous load
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [eventsLoading, setEventsLoading] = useState(() => !events.length);
  const [eventsError, setEventsError] = useState('');

  // In-memory per-event deep detail cache
  const eventDetailsCache = useRef(new Map());

  // ---------------------------------------------------------------------------
  // SINGLE CENTRAL REAL-TIME SUBSCRIPTION FOR HOST'S EVENTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hostId) {
      setEvents([]);
      setEventsLoading(false);
      try {
        localStorage.removeItem(CACHE_KEY_EVENTS);
      } catch {}
      return undefined;
    }

    setEventsLoading(true);
    const unsubscribe = subscribeToEvents(
      { hostId },
      (items) => {
        setEvents(items);
        setEventsLoading(false);
        try {
          localStorage.setItem(CACHE_KEY_EVENTS, JSON.stringify(items));
        } catch (e) {
          console.warn('Could not cache events locally:', e);
        }
      },
      (err) => {
        console.warn('Events subscription error:', err);
        setEventsError(err.message);
        setEventsLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [hostId]);

  // ---------------------------------------------------------------------------
  // CACHED READ HELPER (0 FIRESTORE READS)
  // ---------------------------------------------------------------------------
  const getEventById = useCallback(
    async (eventId, forceRefresh = false) => {
      if (!eventId) return null;

      // 1. Check in memory events array first (0 reads)
      if (!forceRefresh) {
        const found = events.find((e) => e.id === eventId || e.eventId === eventId);
        if (found) return found;

        if (eventDetailsCache.current.has(eventId)) {
          return eventDetailsCache.current.get(eventId);
        }
      }

      // 2. Fallback single doc read
      try {
        const fetched = await apiGetEvent(eventId);
        if (fetched) {
          eventDetailsCache.current.set(eventId, fetched);
        }
        return fetched;
      } catch (err) {
        console.warn('getEventById error:', err);
        return null;
      }
    },
    [events]
  );

  // ---------------------------------------------------------------------------
  // WRITE HELPERS (DIFF CHECKING & OPTIMISTIC UPDATES TO SAVE WRITES)
  // ---------------------------------------------------------------------------
  const updateEvent = useCallback(
    async (eventId, payload) => {
      if (!eventId || !payload) return;

      const current = events.find((e) => e.id === eventId || e.eventId === eventId);

      // Calculate diff to avoid writing unchanged fields to Firestore
      const diff = {};
      let hasChanges = false;

      for (const [key, value] of Object.entries(payload)) {
        if (key === 'updatedAt' || key === 'createdAt') continue;
        const currentVal = current ? current[key] : undefined;
        if (JSON.stringify(currentVal) !== JSON.stringify(value)) {
          diff[key] = value;
          hasChanges = true;
        }
      }

      // If document is identical, save the billable Firestore write!
      if (current && !hasChanges) {
        console.info(`[EventsContext] No fields changed for event ${eventId}. Firestore write avoided!`);
        return;
      }

      // Optimistic state update (0ms UI latency)
      const updatedEvent = { ...(current || {}), ...payload, id: eventId };
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)));
      eventDetailsCache.current.set(eventId, updatedEvent);

      const fieldsToWrite = hasChanges ? diff : payload;
      await apiUpdateEvent(eventId, fieldsToWrite);
    },
    [events]
  );

  const createEvent = useCallback(async (payload) => {
    const newId = await apiCreateEvent(payload);
    const newEvent = { ...payload, id: newId, eventId: newId };
    setEvents((prev) => [newEvent, ...prev]);
    eventDetailsCache.current.set(newId, newEvent);
    return newId;
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId && e.eventId !== eventId));
    eventDetailsCache.current.delete(eventId);
    await apiDeleteEvent(eventId);
  }, []);

  // Session-throttled view counter (max 1 write per session per event)
  const incrementEventView = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      const sessionKey = `nitroxx_viewed_ev_${eventId}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, '1');
      await apiIncrementEventView(eventId);
    } catch (e) {
      console.warn('incrementEventView error:', e);
    }
  }, []);

  const refreshEvents = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY_EVENTS);
    } catch {}
    setEventsLoading(true);
  }, []);

  const value = useMemo(
    () => ({
      hostId,
      events,
      eventsLoading,
      eventsError,
      getEventById,
      updateEvent,
      createEvent,
      deleteEvent,
      incrementEventView,
      refreshEvents,
    }),
    [
      hostId,
      events,
      eventsLoading,
      eventsError,
      getEventById,
      updateEvent,
      createEvent,
      deleteEvent,
      incrementEventView,
      refreshEvents,
    ]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsContext = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEventsContext must be used within an EventsProvider.');
  }
  return context;
};

export default EventsContext;
