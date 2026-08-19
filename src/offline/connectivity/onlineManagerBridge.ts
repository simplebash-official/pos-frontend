import { onlineManager } from '@tanstack/react-query';
import { connectivityMonitor } from './ConnectivityMonitor';

/**
 * Points TanStack Query's online/offline detection at `connectivityMonitor`
 * instead of its default raw `navigator.onLine` listener, so a query's
 * pause/resume and `refetchOnReconnect` behaviour track the same verdict the
 * header badge and sync engine already use rather than a second, less
 * reliable signal (see `ConnectivityMonitor`'s doc comment on why
 * `navigator.onLine` alone is insufficient).
 *
 * `setEventListener()` replaces the default listener wholesale, so this must
 * run exactly once — done here via a side-effect import evaluated at module
 * load, which ES modules guarantee happens only once per session.
 */
onlineManager.setEventListener((setOnline) =>
  connectivityMonitor.subscribe(() => setOnline(connectivityMonitor.isOnline()))
);
