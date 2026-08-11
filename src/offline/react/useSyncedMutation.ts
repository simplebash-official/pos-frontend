import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/types/common';
import { syncEngine } from '../engine/SyncEngine';
import { submitOperation } from '../outbox/submit';
import { getSyncResource } from '../registry/registry';
import type { SyncResourceId } from '../types';

/**
 * A write that succeeds locally and syncs later.
 *
 * Keeps TanStack's `useMutation` wrapper so every existing call site — with
 * its `onSuccess` callbacks, `mutate`/`mutateAsync` split and pending flags —
 * keeps working unchanged. Only what `mutationFn` does changes: instead of an
 * HTTP request that fails when offline, it applies the change to the local
 * mirror and queues it.
 */
export const useSyncedMutation = <TPayload, TResult>(
  resource: SyncResourceId,
  operation: string
): UseMutationResult<TResult, ApiError, TPayload> => {
  const queryClient = useQueryClient();

  return useMutation<TResult, ApiError, TPayload>({
    mutationFn: (payload) => submitOperation<TResult>(resource, operation, payload),
    onSuccess: () => {
      // Screens read from Dexie and update through liveQuery, so this exists
      // only to keep any not-yet-migrated TanStack call site consistent.
      getSyncResource(resource).invalidates.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
      // Don't wait for the next poll — push straight away when there's a link.
      syncEngine.requestFlush();
    },
  });
};
