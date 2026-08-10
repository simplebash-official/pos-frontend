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

function showOrUpdate(
  id: string,
  visible: boolean,
  payload: Parameters<typeof notifications.show>[0]
): void {
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
}

export function notifyWentOffline(): void {
  showOrUpdate(NOTIFICATION_ID_CONNECTIVITY, connectivityToastVisible, {
    title: 'Working offline',
    message: 'Changes are saved on this device and will sync when the connection returns.',
    color: 'orange',
    autoClose: 5000,
    withCloseButton: true,
    loading: false,
  });
  connectivityToastVisible = true;
}

export function notifyBackOnline(pendingCount: number): void {
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
}

export function notifySyncComplete(pushedCount: number): void {
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
}

export function notifySyncProblems(failedCount: number): void {
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
}

/** Clears the persistent offline toast, e.g. when the engine stops. */
export function clearConnectivityNotification(): void {
  if (connectivityToastVisible) {
    notifications.hide(NOTIFICATION_ID_CONNECTIVITY);
    connectivityToastVisible = false;
  }
}
