import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MutationCache, MutationObserver, QueryClient } from '@tanstack/react-query';
import { attachMutationFeedback, feedbackMeta } from '../mutationFeedback';

const show = vi.fn();
vi.mock('@mantine/notifications', () => ({ notifications: { show: (arg: unknown) => show(arg) } }));

const run = async (options: ConstructorParameters<typeof MutationObserver>[1]) => {
  const client = new QueryClient({ mutationCache: attachMutationFeedback(new MutationCache()) });
  await new MutationObserver(client, options).mutate(undefined).catch(() => undefined);
};

const feedback = feedbackMeta<{ name: string }>({
  successTitle: 'Thing added',
  successMessage: (thing) => thing.name,
  failureTitle: 'Could not add the thing',
});

describe('attachMutationFeedback', () => {
  beforeEach(() => show.mockReset());

  it('shows a green notification with the saved name when the save works', async () => {
    await run({ mutationFn: async () => ({ name: 'Water Board' }), meta: feedback });
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith({
      title: 'Thing added',
      message: 'Water Board',
      color: 'teal',
    });
  });

  it('shows a red notification with the reason when the save fails', async () => {
    await run({
      mutationFn: async () => {
        throw new Error('That name is already used.');
      },
      meta: feedback,
    });
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith({
      title: 'Could not add the thing',
      message: 'That name is already used.',
      color: 'red',
    });
  });

  it('leaves a mutation that declared no feedback alone', async () => {
    await run({ mutationFn: async () => ({ name: 'x' }) });
    await run({
      mutationFn: async () => {
        throw new Error('boom');
      },
    });
    expect(show).not.toHaveBeenCalled();
  });
});
