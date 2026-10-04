import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { logger } from '@/shared/logging';
import { syncNow } from '@/features/sync-status/api/syncStatusApi';
import { cloudLinkOpenBrowser, cloudLinkPoll, type LinkHints } from '../api/accountApi';
import { toCloudError } from '../lib/accountView';
import { useCloudLinkStart, useCloudState, useCloudUnlink } from './useCloudState';

const EXPIRED_CODES = ['LINK_EXPIRED', 'LINK_NOT_FOUND'];

/**
 * "Sign in with the browser" for this computer: asks the cloud for a link,
 * opens the web app's approval page, then polls until the owner approves it
 * there. All the credentials stay in the browser; this app only ever receives
 * the device's own tokens, through the shell.
 */
export const useBrowserSignIn = (options: { onLinked?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { state } = useCloudState();
  const linkStart = useCloudLinkStart();
  const unlink = useCloudUnlink();
  const [error, setError] = useState<string | null>(null);
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
            logger.info('app', 'account.linked', { via: 'browser' }, 'Device linked');
            void syncNow().catch(() => {});
            onLinked.current?.();
          })
          .catch((err) => {
            // A code that ran out can never be approved: stop waiting, let them retry.
            if (EXPIRED_CODES.includes(toCloudError(err).code)) {
              setError('expired');
              unlink.mutate();
            }
          });
      },
      Math.max(2, pending.interval) * 1000
    );
    return () => window.clearInterval(timer);
    // `unlink` is a fresh object every render; only the pending link matters here.
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
    pending,
    starting: linkStart.isPending,
    /** `expired` | `browser` | `network` | `start` | null — mapped to words by the UI. */
    error,
    start,
    reopen: () => open(lastHints.current),
    cancel: () => {
      setError(null);
      unlink.mutate();
    },
    cancelling: unlink.isPending,
  };
};
