import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { logger } from '@/shared/logging';
import { syncNow } from '@/features/sync-status/api/syncStatusApi';
import { cloudLinkOpenBrowser, cloudLinkPoll, type LinkHints } from '../api/accountApi';
import { toCloudError } from '../lib/accountView';
import { clearShopScopedStorage } from '../lib/switchShop';
import { useCloudLinkCancel, useCloudLinkStart, useCloudState } from './useCloudState';

const EXPIRED_CODES = ['LINK_EXPIRED', 'LINK_NOT_FOUND'];

/**
 * "Sign in with the browser" for this computer: asks the cloud for a link,
 * opens the web app's approval page, then polls until the owner approves it
 * there. All the credentials stay in the browser; this app only ever receives
 * the device's own tokens, through the shell.
 *
 * It also works while a shop is already linked (switching shop or account). Cancelling then only
 * drops the waiting request: the linked shop is never unlinked by it.
 */
export const useBrowserSignIn = (options: { onLinked?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { state } = useCloudState();
  const linkStart = useCloudLinkStart();
  const cancelLink = useCloudLinkCancel();
  const [error, setError] = useState<string | null>(null);
  /** The approval was for another shop: the app is restarting onto that shop's own data. */
  const [switching, setSwitching] = useState(false);
  const lastHints = useRef<LinkHints | undefined>(undefined);
  const onLinked = useRef(options.onLinked);
  useEffect(() => {
    onLinked.current = options.onLinked;
  });

  const pending = state.pendingLink;

  // Poll while waiting for the owner to approve this computer in the browser.
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(
      () => {
        void cloudLinkPoll()
          .then((result) => {
            if (result.status !== 'linked') return;
            queryClient.setQueryData(queryKeys.cloud.state(), result.state);
            if (result.switched) {
              // The shell restarts the app in a moment. Drop the old shop's browser data now so
              // nothing of it shows under the new one; no sync (the old database is still open).
              clearShopScopedStorage();
              logger.info('app', 'account.switched_shop', {}, 'Switching to another shop');
              setSwitching(true);
              return;
            }
            logger.info('app', 'account.linked', { via: 'browser' }, 'Device linked');
            void syncNow().catch(() => {});
            onLinked.current?.();
          })
          .catch((err) => {
            // A code that ran out can never be approved: stop waiting, let them retry.
            if (EXPIRED_CODES.includes(toCloudError(err).code)) {
              setError('expired');
              cancelLink.mutate();
            }
          });
      },
      Math.max(2, pending.interval) * 1000
    );
    return () => window.clearInterval(timer);
    // `cancelLink` is a fresh object every render; only the pending link matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, queryClient]);

  const open = useCallback(async (hints?: LinkHints) => {
    lastHints.current = hints;
    try {
      await cloudLinkOpenBrowser(hints);
    } catch (err) {
      logger.warn('app', 'account.browser_open_failed', { code: toCloudError(err).code });
      setError('browser');
    }
  }, []);

  const start = useCallback(
    async (hints?: LinkHints) => {
      setError(null);
      try {
        await linkStart.mutateAsync();
      } catch (err) {
        setError(toCloudError(err).code === 'NETWORK_ERROR' ? 'network' : 'start');
        return;
      }
      await open(hints);
    },
    [linkStart, open]
  );

  return {
    pending: switching ? null : pending,
    switching,
    starting: linkStart.isPending,
    /** `expired` | `browser` | `network` | `start` | null — mapped to words by the UI. */
    error,
    start,
    reopen: () => open(lastHints.current),
    cancel: () => {
      setError(null);
      cancelLink.mutate();
    },
    cancelling: cancelLink.isPending,
  };
};
