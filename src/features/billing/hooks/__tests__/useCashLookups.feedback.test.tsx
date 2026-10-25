/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { attachMutationFeedback } from '@/api/mutationFeedback';
import { useCreateCashCategory, useCreatePayee } from '../useCashLookups';

const show = vi.fn();
vi.mock('@mantine/notifications', () => ({ notifications: { show: (arg: unknown) => show(arg) } }));

const createPayee = vi.fn();
const createCashCategory = vi.fn();
vi.mock('../../api/cashLookupsApi', () => ({
  createPayee: (input: unknown) => createPayee(input),
  createCashCategory: (input: unknown) => createCashCategory(input),
}));

type Mutations = {
  payee: ReturnType<typeof useCreatePayee>;
  category: ReturnType<typeof useCreateCashCategory>;
};

describe('create hooks tell the person how the save went', () => {
  let container: HTMLDivElement;
  let root: Root;
  let mutations: Mutations;

  const Probe = () => {
    mutations = { payee: useCreatePayee(), category: useCreateCashCategory() };
    return null;
  };

  beforeEach(() => {
    show.mockReset();
    createPayee.mockReset();
    createCashCategory.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const client = new QueryClient({ mutationCache: attachMutationFeedback(new MutationCache()) });
    act(() => {
      root.render(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>
      );
    });
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('adding a landlord or company: green on success, red with the reason on failure', async () => {
    createPayee.mockResolvedValueOnce({ key: 'pye_vendor_1', name: 'Water Board' });
    await act(async () => {
      await mutations.payee.mutateAsync({ payeeType: 'vendor', name: 'Water Board' });
    });
    expect(show).toHaveBeenLastCalledWith({
      title: 'Landlord or company added',
      message: 'Water Board',
      color: 'teal',
    });

    createPayee.mockRejectedValueOnce(new Error('That name is already used.'));
    await act(async () => {
      await mutations.payee
        .mutateAsync({ payeeType: 'vendor', name: 'Water Board' })
        .catch(() => undefined);
    });
    expect(show).toHaveBeenLastCalledWith({
      title: 'Could not add the landlord or company',
      message: 'That name is already used.',
      color: 'red',
    });
  });

  it('adding a category: green on success, red with the reason on failure', async () => {
    createCashCategory.mockResolvedValueOnce({ key: 'cat_1', name: 'Courier' });
    await act(async () => {
      await mutations.category.mutateAsync({ movementType: 'petty_expense', name: 'Courier' });
    });
    expect(show).toHaveBeenLastCalledWith({
      title: 'Category added',
      message: 'Courier',
      color: 'teal',
    });

    createCashCategory.mockRejectedValueOnce(new Error('That category already exists.'));
    await act(async () => {
      await mutations.category
        .mutateAsync({ movementType: 'petty_expense', name: 'Courier' })
        .catch(() => undefined);
    });
    expect(show).toHaveBeenLastCalledWith({
      title: 'Could not add the category',
      message: 'That category already exists.',
      color: 'red',
    });
  });
});
