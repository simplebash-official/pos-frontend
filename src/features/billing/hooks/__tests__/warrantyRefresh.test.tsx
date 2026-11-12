/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useUpdateRepairJob } from '@/features/repairs/hooks/useRepairs';
import { useCreateCreditNote } from '../useCreditNotes';
import { useCompleteSale, useVoidInvoice } from '../useInvoices';

vi.mock('../../api/invoicesApi', () => ({
  completeSale: vi.fn().mockResolvedValue({ invoice: {}, warnings: [] }),
  voidInvoice: vi.fn().mockResolvedValue({}),
  closeInvoice: vi.fn(),
  fetchAllInvoices: vi.fn(),
  fetchPaginatedInvoices: vi.fn(),
}));
vi.mock('../../api/creditNotesApi', () => ({
  createCreditNote: vi.fn().mockResolvedValue({}),
  fetchCreditNotes: vi.fn(),
  resolveCreditNote: vi.fn(),
  voidCreditNote: vi.fn(),
}));
vi.mock('@/features/repairs/api/repairsApi', () => ({
  createRepairJobRaw: vi.fn(),
  deleteRepairsRaw: vi.fn(),
  fetchRepairs: vi.fn(),
  updateRepairJobRaw: vi.fn().mockResolvedValue({}),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('what changes warranties refreshes the warranty screens', () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: QueryClient;
  let hooks: {
    sale: ReturnType<typeof useCompleteSale>;
    voidInvoice: ReturnType<typeof useVoidInvoice>;
    creditNote: ReturnType<typeof useCreateCreditNote>;
    repair: ReturnType<typeof useUpdateRepairJob>;
  };

  const Probe = () => {
    hooks = {
      sale: useCompleteSale(),
      voidInvoice: useVoidInvoice(),
      creditNote: useCreateCreditNote(),
      repair: useUpdateRepairJob(),
    };
    return null;
  };

  const invalidatedWarranties = (spy: { mock: { calls: unknown[][] } }) =>
    spy.mock.calls.some(
      ([filters]) =>
        JSON.stringify((filters as { queryKey?: unknown }).queryKey) ===
        JSON.stringify(queryKeys.warranties.all)
    );

  beforeEach(async () => {
    client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>
      );
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it.each([
    ['a sale', () => hooks.sale.mutateAsync({} as never)],
    ['voiding an invoice', () => hooks.voidInvoice.mutateAsync({ invoiceKey: 'i', reason: 'r' })],
    ['a return', () => hooks.creditNote.mutateAsync({ input: {} as never })],
    ['updating a repair job', () => hooks.repair.mutateAsync({ repairKey: 'r', input: {} })],
  ])('%s', async (_name, run) => {
    const spy = vi.spyOn(client, 'invalidateQueries');
    await act(async () => {
      await run();
    });
    expect(invalidatedWarranties(spy)).toBe(true);
  });
});
