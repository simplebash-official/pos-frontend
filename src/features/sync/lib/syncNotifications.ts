import { notifications } from '@mantine/notifications';
import { NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR } from '@/offline/constants';

/**
 * Connectivity and sync toasts.
 *
 * This is the only place in the app that uses a stable notification `id` with
 * `notifications.update()`. Everywhere else fires one toast per event, which
 * would be wrong here: sync state changes repeatedly during a single reconnect
 * and would otherwise stack a tower of toasts over the till.
 *
 * Colour convention, extending the app's existing set:
 *   orange = offline. Expected, not broken — the app keeps working.
 *   red    = a human must act (a change was rejected).
 */

/** Mantine has no "is this toast showing" query, so track it ourselves. */
let connectivityToastVisible = false;

const showOrUpdate = (
  id: string,
  visible: boolean,
  payload: Parameters<typeof notifications.show>[0]
): void => {
  const wrappedPayload = {
    ...payload,
    onClose: (data: Parameters<typeof notifications.show>[0]) => {
      connectivityToastVisible = false;
      payload.onClose?.(data);
    },
  };

  if (visible) {
    notifications.update({ id, ...wrappedPayload });
    return;
  }
  notifications.show({ id, ...wrappedPayload });
};

export const notifyWentOffline = (): void => {
  showOrUpdate(NOTIFICATION_ID_CONNECTIVITY, connectivityToastVisible, {
    title: 'Working offline',
    message: 'Changes are saved on this device and will sync when the connection returns.',
    color: 'orange',
    autoClose: 5000,
    withCloseButton: true,
    loading: false,
  });
  connectivityToastVisible = true;
};

export const notifyBackOnline = (pendingCount: number): void => {
  showOrUpdate(NOTIFICATION_ID_CONNECTIVITY, connectivityToastVisible, {
    title: 'Back online',
    message:
      pendingCount > 0
        ? `Syncing ${pendingCount} pending change${pendingCount === 1 ? '' : 's'}…`
        : 'Everything is up to date.',
    color: pendingCount > 0 ? 'blue' : 'green',
    loading: pendingCount > 0,
    autoClose: pendingCount > 0 ? false : 3000,
    withCloseButton: true,
  });
  connectivityToastVisible = true;

  if (pendingCount === 0) {
    connectivityToastVisible = false;
  }
};

export const notifySyncComplete = (pushedCount: number): void => {
  if (pushedCount === 0) {
    return;
  }
  showOrUpdate(NOTIFICATION_ID_CONNECTIVITY, connectivityToastVisible, {
    title: 'Sync complete',
    message: `${pushedCount} change${pushedCount === 1 ? '' : 's'} saved to the server.`,
    color: 'green',
    loading: false,
    autoClose: 4000,
    withCloseButton: true,
  });
  connectivityToastVisible = false;
};

/**
 * Fired when a pushed operation's server response carried non-fatal warnings
 * (currently just a sale's `complete_sale` partially-failed side effect —
 * see `invoices.resource.ts`'s `create` push). This is the only way a
 * warning reaches the user once checkout can complete offline: the old
 * inline "Sale completed with warnings" toast assumed the push happened
 * synchronously inside the same request that showed the confirmation card,
 * which is no longer true when the push runs later during a flush.
 *
 * A per-entity id, not the shared connectivity id — several distinct sales
 * can each carry independent warnings within the same flush batch, and
 * showing only the last would silently drop the others.
 */
export const notifySaleWarnings = (entityKey: string, warnings: readonly string[]): void => {
  notifications.show({
    id: `sale-warning-${entityKey}`,
    title: 'Sale completed with warnings',
    message: warnings.join(' '),
    color: 'yellow',
    autoClose: 8000,
    withCloseButton: true,
  });
};

export const notifySyncProblems = (failedCount: number): void => {
  // Its own id: a rejected change outlives the connectivity state that
  // produced it, so it must not be overwritten by the next "back online".
  notifications.show({
    id: NOTIFICATION_ID_SYNC_ERROR,
    title: 'Some changes could not be saved',
    message: `${failedCount} change${failedCount === 1 ? ' needs' : 's need'} your attention. Open the sync panel to review them.`,
    color: 'red',
    autoClose: false,
    withCloseButton: true,
  });
};

/** Clears the persistent offline toast, e.g. when the engine stops. */
export const clearConnectivityNotification = (): void => {
  if (connectivityToastVisible) {
    notifications.hide(NOTIFICATION_ID_CONNECTIVITY);
    connectivityToastVisible = false;
  }
};
