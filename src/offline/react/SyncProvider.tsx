import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { syncLabelsRegistered, syncStateChanged } from '@/store/slices/syncSlice';
import {
  clearConnectivityNotification,
  notifyBackOnline,
  notifySyncComplete,
  notifySyncProblems,
  notifyWentOffline,
} from '@/features/sync/lib/syncNotifications';
import { syncEngine } from '../engine/SyncEngine';
import { getResourcesInDependencyOrder } from '../registry/registry';
import { registerSyncResources } from '../resources';

/**
 * Starts the sync engine and bridges its state into Redux.
 *
 * Mounted beside `AuthInitializer` in `AppProviders` — it must sit inside the
 * Redux provider (it dispatches) and outside the router (sync runs regardless
 * of which screen is open).
 *
 * Sync is gated on being signed in. Every synced endpoint is authenticated, so
 * running the loops on the login screen just produces a wave of 401s that look
 * like sync errors. Note that logging out does NOT clear the local database —
 * a cashier's queued offline work must survive an expired session.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    registerSyncResources();

    const labels: Record<string, string> = {};
    getResourcesInDependencyOrder().forEach((resource) => {
      labels[resource.id] = resource.label;
    });
    dispatch(syncLabelsRegistered(labels));

    let wasOffline = false;

    const unsubscribe = syncEngine.subscribe((state) => {
      dispatch(syncStateChanged(state));

      // Toast on the transition only. Publishing on every state change would
      // fire during each probe while the outage lasts.
      const isOffline = state.connectivity.state === 'offline';
      if (isOffline && !wasOffline) {
        notifyWentOffline();
      } else if (!isOffline && wasOffline && state.connectivity.state !== 'checking') {
        notifyBackOnline(state.totals.pending);
      }
      wasOffline = isOffline;
    });

    const unsubscribeFlush = syncEngine.onFlushComplete((summary) => {
      if (summary.conflicted > 0) {
        notifySyncProblems(summary.conflicted);
      }
      if (summary.pushed > 0 && !summary.stoppedOffline) {
        notifySyncComplete(summary.pushed);
      }
    });

    syncEngine.start();

    return () => {
      unsubscribe();
      unsubscribeFlush();
      syncEngine.stop();
      clearConnectivityNotification();
    };
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}
