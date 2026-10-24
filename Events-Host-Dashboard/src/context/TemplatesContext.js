import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { subscribeToTicketTemplates } from '../services/firebaseService';

const TemplatesContext = createContext(null);

const CACHE_KEYS = {
  TEMPLATES: 'nitroxx_cached_templates',
  TEMPLATES_EXPIRY: 'nitroxx_cached_templates_exp',
};

const TEMPLATES_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour TTL for static ticket templates

export const TemplatesProvider = ({ children }) => {
  // Synchronously load cached templates from localStorage
  const [ticketTemplates, setTicketTemplates] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.TEMPLATES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState('');

  // ---------------------------------------------------------------------------
  // CACHED TICKET TEMPLATES SUBSCRIPTION (Only runs when cache is empty or expired)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isExpired = true;
    try {
      const exp = localStorage.getItem(CACHE_KEYS.TEMPLATES_EXPIRY);
      if (exp && Date.now() < Number(exp) && ticketTemplates.length > 0) {
        isExpired = false;
      }
    } catch {}

    // If cache is valid and not empty, skip the Firestore read entirely!
    if (!isExpired && ticketTemplates.length > 0) {
      return undefined;
    }

    setTemplatesLoading(true);
    const unsubscribe = subscribeToTicketTemplates(
      (templates) => {
        setTicketTemplates(templates);
        setTemplatesLoading(false);
        try {
          localStorage.setItem(CACHE_KEYS.TEMPLATES, JSON.stringify(templates));
          localStorage.setItem(
            CACHE_KEYS.TEMPLATES_EXPIRY,
            String(Date.now() + TEMPLATES_TTL_MS)
          );
        } catch (e) {
          console.warn('Could not cache ticket templates locally:', e);
        }
      },
      (err) => {
        console.warn('Templates subscription error:', err);
        setTemplatesError(err.message);
        setTemplatesLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [ticketTemplates.length]);

  const refreshTemplates = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEYS.TEMPLATES);
      localStorage.removeItem(CACHE_KEYS.TEMPLATES_EXPIRY);
    } catch {}
    setTemplatesLoading(true);
  }, []);

  const value = useMemo(
    () => ({
      ticketTemplates,
      templatesLoading,
      templatesError,
      refreshTemplates,
    }),
    [ticketTemplates, templatesLoading, templatesError, refreshTemplates]
  );

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};

export const useTemplatesContext = () => {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error('useTemplatesContext must be used within a TemplatesProvider.');
  }
  return context;
};

export default TemplatesContext;
