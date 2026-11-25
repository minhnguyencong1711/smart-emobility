import { useEffect } from 'react';

import { useInterval } from '@/hooks';
import { useAuthStore, useMobilityStore } from '@/stores';

export function BackendSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const backendMode = useMobilityStore((s) => s.backendMode);
  const hydrateFromBackend = useMobilityStore((s) => s.hydrateFromBackend);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend, isAuthenticated]);

  useInterval(
    () => {
      void hydrateFromBackend();
    },
    backendMode === 'online' ? 5000 : null,
  );

  return null;
}
