import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { subscribeToNotifications } from '../services/firebaseService';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const hostId = user?.uid;

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(Boolean(hostId));
  const [notificationsError, setNotificationsError] = useState('');

  // ---------------------------------------------------------------------------
  // SINGLE CENTRAL NOTIFICATIONS SUBSCRIPTION FOR HOST
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hostId) {
      setNotifications([]);
      setNotificationsLoading(false);
      return undefined;
    }

    setNotificationsLoading(true);
    const unsubscribe = subscribeToNotifications(
      hostId,
      (items) => {
        setNotifications(items);
        setNotificationsLoading(false);
      },
      (err) => {
        console.warn('Notifications subscription error:', err);
        setNotificationsError(err.message);
        setNotificationsLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [hostId]);

  const value = useMemo(
    () => ({
      hostId,
      notifications,
      notificationsLoading,
      notificationsError,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
    [hostId, notifications, notificationsLoading, notificationsError]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider.');
  }
  return context;
};

export default NotificationsContext;
