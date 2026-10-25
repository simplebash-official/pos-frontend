import type { MutationCache } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/lib/error';

/**
 * The one place that tells the person a save worked or failed. A mutation hook opts in by
 * declaring `meta: feedbackMeta<Result>({...})`; every screen that uses the hook then gets the
 * same green or red notification, so a new "add" anywhere in the app never needs its own toast.
 * Mutations without it are left alone.
 */
export interface MutationFeedback<TResult> {
  /** Shown in green when the save worked. */
  successTitle: string;
  /** Second line of the green notification, e.g. the name that was saved. */
  successMessage: (result: TResult) => string;
  /** Shown in red, with the reason from the server underneath. */
  failureTitle: string;
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { feedback: MutationFeedback<never> };
  }
}

export const feedbackMeta = <TResult>(feedback: MutationFeedback<TResult>) => ({ feedback });

/** Starts showing the notifications for every mutation that declared feedback; call once per cache. */
export const attachMutationFeedback = (cache: MutationCache): MutationCache => {
  cache.subscribe((event) => {
    if (event.type !== 'updated') return;
    const feedback = event.mutation.meta?.feedback;
    if (feedback === undefined) return;
    if (event.action.type === 'success') {
      notifications.show({
        title: feedback.successTitle,
        // `never` in the shared type; the hook that declared it passes its own result type.
        message: feedback.successMessage(event.mutation.state.data as never),
        color: 'teal',
      });
    } else if (event.action.type === 'error') {
      notifications.show({
        title: feedback.failureTitle,
        message: getErrorMessage(event.action.error),
        color: 'red',
      });
    }
  });
  return cache;
};
