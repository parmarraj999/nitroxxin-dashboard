import { useMemo } from 'react';
import { calculateAnalytics } from '../services/firebaseService';

export const useAnalytics = (events, registrations) =>
  useMemo(() => calculateAnalytics(events, registrations), [events, registrations]);
