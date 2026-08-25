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
 *
 * Deliberately `snapshot.state !== 'offline'` rather than
 * `connectivityMonitor.isOnline()` (which is `false` for `'checking'` too):
 * `subscribe()` replays synchronously, and this bridge is wired up before
 * `connectivityMonitor.start()`'s first probe has resolved, so the very
 * first call would otherwise pause every plain `useQuery` in the app the
 * instant it mounts — before a single request has even been attempted —
 * and some of those queries never got un-paused again once the real
 * verdict came in. `ConnectivityMonitor` itself is pessimistic-first
 * ("bad news immediate, good news needs a settle window"); for *this*
 * purpose that should flip: treat "not yet proven offline" as online and
 * let a real failed request (via `apiClient`'s interceptor) be what
 * eventually pauses queries, never the *absence* of a verdict yet.
 */
onlineManager.setEventListener((setOnline) =>
  connectivityMonitor.subscribe((snapshot) => setOnline(snapshot.state !== 'offline'))
);
