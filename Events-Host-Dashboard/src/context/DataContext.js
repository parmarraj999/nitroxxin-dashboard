import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { EventsProvider, useEventsContext } from './EventsContext';
import { RegistrationsProvider, useRegistrationsContext } from './RegistrationsContext';
import { TemplatesProvider, useTemplatesContext } from './TemplatesContext';
import { NotificationsProvider, useNotificationsContext } from './NotificationsContext';
import { BookingsProvider, useBookingsContext } from './BookingsContext';
import { calculateAnalytics } from '../services/firebaseService';

const DataContext = createContext(null);

// Bridge that aggregates modular domain contexts into a unified DataContext
const DataConsumerBridge = ({ children }) => {
  const eventsCtx = useEventsContext();
  const registrationsCtx = useRegistrationsContext();
  const templatesCtx = useTemplatesContext();
  const notificationsCtx = useNotificationsContext();
  const bookingsCtx = useBookingsContext();

  // In-memory analytics calculation (0 Firestore reads)
  const analytics = useMemo(() => {
    return calculateAnalytics(eventsCtx.events, registrationsCtx.registrations);
  }, [eventsCtx.events, registrationsCtx.registrations]);

  const refreshData = useCallback(() => {
    eventsCtx.refreshEvents();
    registrationsCtx.refreshRegistrations();
    templatesCtx.refreshTemplates();
  }, [eventsCtx, registrationsCtx, templatesCtx]);

  const value = useMemo(
    () => ({
      hostId: eventsCtx.hostId,

      // Collections
      events: eventsCtx.events,
      registrations: registrationsCtx.registrations,
      ticketTemplates: templatesCtx.ticketTemplates,
      notifications: notificationsCtx.notifications,
      bookings: bookingsCtx?.bookings || [],
      payments: bookingsCtx?.payments || [],
      analytics,

      // Loading states
      loading: eventsCtx.eventsLoading || registrationsCtx.registrationsLoading || bookingsCtx?.loading,
      eventsLoading: eventsCtx.eventsLoading,
      registrationsLoading: registrationsCtx.registrationsLoading,
      templatesLoading: templatesCtx.templatesLoading,
      bookingsLoading: bookingsCtx?.loadingBookings,
      paymentsLoading: bookingsCtx?.loadingPayments,
      error: eventsCtx.eventsError || registrationsCtx.registrationsError || bookingsCtx?.error || '',

      // Read helpers (0 Firestore reads from memory)
      getEventById: eventsCtx.getEventById,
      getEventSummary: eventsCtx.getEventSummary,
      getFullEvent: eventsCtx.getFullEvent,
      subscribeToLiveEvent: eventsCtx.subscribeToLiveEvent,
      getEventRegistrations: registrationsCtx.getEventRegistrations,
      subscribeToEventBookingsCached: registrationsCtx.subscribeToEventBookingsCached,

      // Write helpers (Diff-checked & throttled writes)
      updateEvent: eventsCtx.updateEvent,
      createEvent: eventsCtx.createEvent,
      deleteEvent: eventsCtx.deleteEvent,
      incrementEventView: eventsCtx.incrementEventView,

      // Utilities
      refreshData,
    }),
    [
      eventsCtx,
      registrationsCtx,
      templatesCtx,
      notificationsCtx,
      bookingsCtx,
      analytics,
      refreshData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

/**
 * Composed DataProvider wrapping all modular domain providers cleanly
 */
export const DataProvider = ({ children }) => {
  return (
    <EventsProvider>
      <RegistrationsProvider>
        <TemplatesProvider>
          <NotificationsProvider>
            <BookingsProvider>
              <DataConsumerBridge>{children}</DataConsumerBridge>
            </BookingsProvider>
          </NotificationsProvider>
        </TemplatesProvider>
      </RegistrationsProvider>
    </EventsProvider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider.');
  }
  return context;
};

export default DataContext;
