import { useEffect, useState } from 'react';
import { subscribeToEvents } from '../services/firebaseService';

export const useEvents = (filters = {}) => {
  const { hostId, status, search, city, category, ticketType } = filters;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEvents(
      { hostId, status, search, city, category, ticketType },
      (items) => {
        setEvents(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [hostId, status, search, city, category, ticketType]);

  return { events, loading, error };
};
