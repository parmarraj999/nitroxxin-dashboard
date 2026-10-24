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
  subscribeToEvent,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  getEvent as apiGetEvent,
  incrementEventView as apiIncrementEventView,
} from '../services/firebaseService';

const EventsContext = createContext(null);

const CACHE_KEY_EVENTS = 'nitroxx_cached_events';

/**
 * Extracts only lightweight listing summary fields necessary for tables and cards.
 * Strips heavy data (gallery, itinerary, package descriptions, bank details, guidelines)
 * so listing queries and localStorage load in 0ms with minimal memory footprint.
 */
export const toEventListingSummary = (doc) => {
  if (!doc) return null;
  return {
    id: doc.id,
    eventId: doc.eventId || doc.id,
    hostId: doc.hostId,
    title: doc.title || 'Untitled Event',
    subtitle: doc.subtitle || '',
    description: doc.description ? doc.description.slice(0, 300) : '',
    category: doc.category || 'General',
    city: doc.city || '',
    venue: doc.venue || '',
    startDate: doc.startDate || null,
    endDate: doc.endDate || null,
    startTime: doc.startTime || '',
    endTime: doc.endTime || '',
    status: doc.status || 'Draft',
    capacity: Number(doc.capacity || 0),
    registeredCount: Number(doc.registeredCount || 0),
    views: Number(doc.views || 0),
    revenue: Number(doc.revenue || 0),
    gross: Number(doc.gross || doc.revenue || 0),
    ticketPrice: Number(doc.ticketPrice || doc.price || 0),
    price: Number(doc.price || doc.ticketPrice || 0),
    ticketType: doc.ticketType || 'Free',
    bannerImage: doc.bannerImage || '',
    thumbnailImage: doc.thumbnailImage || '',
    logoType: doc.logoType || '',
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
};

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

  // Cache for complete full event documents
  const fullEventDetailsCache = useRef(new Map());

  // ---------------------------------------------------------------------------
  // 1. LIGHTWEIGHT REAL-TIME SUBSCRIPTION FOR HOST'S EVENT LISTINGS
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
        // Only keep necessary listing fields for fast rendering & compact storage
        const summaries = items.map(toEventListingSummary);
        setEvents(summaries);
        setEventsLoading(false);
        try {
          localStorage.setItem(CACHE_KEY_EVENTS, JSON.stringify(summaries));
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
  // 2. FULL LIVE EVENT SUBSCRIPTION (WHEN HOST OPENS ANY EVENT DETAIL PAGE)
  // ---------------------------------------------------------------------------
  /**
   * Fetches and streams full event live data in real-time.
   * Includes gallery, itinerary, packages, bank details, guidelines, etc.
   */
  const subscribeToLiveEvent = useCallback((eventId, callback, onError) => {
    if (!eventId) return () => {};

    // 1. Immediately provide cached full event if already present
    const cachedFull = fullEventDetailsCache.current.get(eventId);
    if (cachedFull && callback) {
      callback(cachedFull);
    }

    // 2. Open live Firestore document subscription for complete event data
    return subscribeToEvent(
      eventId,
      (fullDoc) => {
        if (!fullDoc) {
          if (callback) callback(null);
          return;
        }

        fullEventDetailsCache.current.set(eventId, fullDoc);

        // Sync live counters back to event summary list
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId || e.eventId === eventId
              ? { ...e, ...toEventListingSummary(fullDoc) }
              : e
          )
        );

        if (callback) callback(fullDoc);
      },
      onError
    );
  }, []);

  /**
   * Fetches full event document once (used for EventForm and editing).
   */
  const getFullEvent = useCallback(
    async (eventId, forceRefresh = false) => {
      if (!eventId) return null;

      if (!forceRefresh && fullEventDetailsCache.current.has(eventId)) {
        return fullEventDetailsCache.current.get(eventId);
      }

      try {
        const fullDoc = await apiGetEvent(eventId);
        if (fullDoc) {
          fullEventDetailsCache.current.set(eventId, fullDoc);
        }
        return fullDoc;
      } catch (err) {
        console.warn('getFullEvent error:', err);
        return null;
      }
    },
    []
  );

  /**
   * Fast in-memory summary resolver for listing headers and instant navigation.
   */
  const getEventSummary = useCallback(
    (eventId) => {
      if (!eventId) return null;
      return events.find((e) => e.id === eventId || e.eventId === eventId) || null;
    },
    [events]
  );

  /**
   * Universal resolver: returns full cached event if available, otherwise summary or fetches full doc.
   */
  const getEventById = useCallback(
    async (eventId, forceRefresh = false) => {
      if (!eventId) return null;

      if (!forceRefresh) {
        if (fullEventDetailsCache.current.has(eventId)) {
          return fullEventDetailsCache.current.get(eventId);
        }
        const foundSummary = events.find((e) => e.id === eventId || e.eventId === eventId);
        if (foundSummary) return foundSummary;
      }

      return getFullEvent(eventId, forceRefresh);
    },
    [events, getFullEvent]
  );

  // ---------------------------------------------------------------------------
  // 3. WRITE HELPERS (DIFF CHECKING & OPTIMISTIC UPDATES TO SAVE WRITES)
  // ---------------------------------------------------------------------------
  const updateEvent = useCallback(
    async (eventId, payload) => {
      if (!eventId || !payload) return;

      const current = fullEventDetailsCache.current.get(eventId) ||
        events.find((e) => e.id === eventId || e.eventId === eventId);

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
      const updatedFull = { ...(current || {}), ...payload, id: eventId };
      fullEventDetailsCache.current.set(eventId, updatedFull);
      const updatedSummary = toEventListingSummary(updatedFull);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedSummary : e)));

      const fieldsToWrite = hasChanges ? diff : payload;
      await apiUpdateEvent(eventId, fieldsToWrite);
    },
    [events]
  );

  const createEvent = useCallback(async (payload) => {
    const newId = await apiCreateEvent(payload);
    const newFullEvent = { ...payload, id: newId, eventId: newId };
    fullEventDetailsCache.current.set(newId, newFullEvent);
    const newSummary = toEventListingSummary(newFullEvent);
    setEvents((prev) => [newSummary, ...prev]);
    return newId;
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId && e.eventId !== eventId));
    fullEventDetailsCache.current.delete(eventId);
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
      getEventSummary,
      getFullEvent,
      subscribeToLiveEvent,
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
      getEventSummary,
      getFullEvent,
      subscribeToLiveEvent,
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
