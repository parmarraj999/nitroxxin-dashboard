import { useEffect, useState, useContext } from 'react';
import NotificationsContext from '../context/NotificationsContext';
import { subscribeToNotifications } from '../services/firebaseService';

export const useNotifications = (userId) => {
  const notifCtx = useContext(NotificationsContext);
  const canUseContext = Boolean(
    notifCtx &&
    notifCtx.hostId &&
    userId &&
    userId === notifCtx.hostId
  );

  const [fallbackNotifications, setFallbackNotifications] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(Boolean(userId));
  const [fallbackError, setFallbackError] = useState('');

  useEffect(() => {
    if (canUseContext) return undefined;

    if (!userId) {
      setFallbackNotifications([]);
      setFallbackLoading(false);
      return undefined;
    }
    setFallbackLoading(true);
    const unsubscribe = subscribeToNotifications(
      userId,
      (items) => {
        setFallbackNotifications(items);
        setFallbackLoading(false);
      },
      (err) => {
        setFallbackError(err.message);
        setFallbackLoading(false);
      }
    );
    return unsubscribe;
  }, [canUseContext, userId]);

  if (canUseContext) {
    return {
      notifications: notifCtx.notifications,
      loading: notifCtx.notificationsLoading,
      error: notifCtx.notificationsError || '',
    };
  }

  return {
    notifications: fallbackNotifications,
    loading: fallbackLoading,
    error: fallbackError,
  };
};

