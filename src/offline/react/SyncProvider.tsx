import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { syncLabelsRegistered, syncStateChanged } from '@/store/slices/syncSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import {
  clearConnectivityNotification,
  notifyBackOnline,
  notifySaleWarnings,
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
/**
 * Toast bookkeeping that must outlive a remount.
 *
 * The engine is a module-level singleton and the effect below re-runs on
 * every auth flip and (in StrictMode) twice on mount, so anything tracked in
 * effect-local state would re-announce an outage the user already saw.
 */
let offlineAnnounced = false;
let lastConflictCount = 0;

export const SyncProvider = ({ children }: { children: ReactNode }) => {
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

    // Tracked outside the effect body so a StrictMode remount, or an auth
    // flip while offline, does not reset it and replay the offline toast for
    // an outage the user was already told about.
    let wasOffline = offlineAnnounced;
    let hadPendingWork = false;

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
      offlineAnnounced = isOffline;
      hadPendingWork = hadPendingWork || state.totals.pending > 0;
    });

    const unsubscribeFlush = syncEngine.onFlushComplete((summary) => {
      // `conflicted` is recomputed every pass, so an unresolved conflict would
      // re-toast forever. Only announce a rise in the total.
      if (summary.conflicted > lastConflictCount) {
        notifySyncProblems(summary.conflicted);
        dispatch(
          addNotification({
            category: 'system',
            actionIconType: 'alert',
            priority: 'urgent',
            title: 'Some changes could not be saved',
            message: `${summary.conflicted} change${summary.conflicted === 1 ? '' : 's'} need${summary.conflicted === 1 ? 's' : ''} your attention. Open the sync panel to review them.`,
          })
        );
      }
      lastConflictCount = summary.conflicted;

      // "Saved to the server" is only news if the change had been waiting.
      // Online, every ordinary edit flushes within a second of being made,
      // and toasting each one buries the user in confirmations.
      if (summary.pushed > 0 && !summary.stoppedOffline && hadPendingWork) {
        notifySyncComplete(summary.pushed);
      }
      hadPendingWork = false;

      // A sale (or any operation) whose server response carried non-fatal
      // warnings — see `invoices.resource.ts`'s `create` push and
      // `notifySaleWarnings`'s doc comment for why this can't be shown
      // inline at checkout anymore.
      for (const { entityKey, warnings } of summary.saleWarnings) {
        if (entityKey) {
          notifySaleWarnings(entityKey, warnings);
        }
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
};
