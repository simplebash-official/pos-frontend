/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import type { SupplierInput } from '../../types';
import { useCreateSupplier } from '../useSuppliers';

const createSupplierApi = vi.fn();
vi.mock('../../api/suppliersApi', () => ({
  createSupplier: (input: SupplierInput) => createSupplierApi(input),
  deleteSupplier: vi.fn(),
  deleteSuppliers: vi.fn(),
  fetchSuppliers: vi.fn(),
  updateSupplier: vi.fn(),
}));

const INPUT: SupplierInput = {
  name: 'Kandy Traders',
  contactPerson: 'Nimal',
  primaryPhone: '0771234567',
  address: '1 Temple Road, Kandy',
  suppliedCategories: ['Phone Parts'],
};

describe('useCreateSupplier', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    createSupplierApi.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('refreshes the supplier lists and the cash window payee lists before it resolves', async () => {
    createSupplierApi.mockResolvedValue({ key: 'sup_new', name: 'Kandy Traders' });
    const queryClient = new QueryClient();
    const invalidated: unknown[] = [];
    // Slow refetch: resolves only after a tick, so an unawaited invalidation would show here.
    let finished = false;
    vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(async (filters) => {
      invalidated.push(filters?.queryKey);
      await new Promise((resolve) => setTimeout(resolve, 0));
      finished = true;
    });

    let result: Awaited<ReturnType<ReturnType<typeof useCreateSupplier>['mutateAsync']>> | null =
      null;
    let finishedWhenResolved: boolean | null = null;
    const Probe = () => {
      const create = useCreateSupplier();
      useEffect(() => {
        void create.mutateAsync(INPUT).then((created) => {
          result = created;
          finishedWhenResolved = finished;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return null;
    };
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <Probe />
        </QueryClientProvider>
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(createSupplierApi).toHaveBeenCalledWith(INPUT);
    expect(invalidated).toEqual([queryKeys.suppliers.all, queryKeys.billing.cash.all]);
    expect(result).toEqual({ key: 'sup_new', name: 'Kandy Traders' });
    expect(finishedWhenResolved).toBe(true);
  });
});
