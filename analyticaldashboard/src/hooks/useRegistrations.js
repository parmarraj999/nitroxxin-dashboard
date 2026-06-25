import { useEffect, useState } from 'react';
import { subscribeToRegistrations } from '../services/firebaseService';

export const useRegistrations = (filters = {}) => {
  const { hostId, eventId, userId } = filters;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToRegistrations(
      { hostId, eventId, userId },
      (items) => {
        setRegistrations(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [hostId, eventId, userId]);

  return { registrations, loading, error };
};
