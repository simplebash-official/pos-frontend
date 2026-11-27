/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import cartReducer from '@/store/slices/cartSlice';
import * as printJobsApi from '@/features/print-jobs/api/printJobsApi';
import * as repairsApi from '@/features/repairs/api/repairsApi';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CatalogPanel } from '../CatalogPanel';

installDrawerTestEnv();

vi.mock('@/features/repairs/api/repairsApi', () => ({ fetchRepairs: vi.fn() }));
vi.mock('@/features/print-jobs/api/printJobsApi', () => ({ fetchPrintJobs: vi.fn() }));
vi.mock('@/features/inventory/api/productsApi', () => ({
  fetchProductByBarcode: vi.fn(),
  fetchSerialByNumber: vi.fn(() => Promise.reject(new Error('no such serial'))),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => {
  // A product whose SKU looks like a ticket number.
  const data = [
    {
      id: 'prod_1',
      key: 'prod_1',
      name: 'Spare screen',
      sku: 'REP-77',
      category: 'Parts',
      categoryKey: 'cat_parts',
      stockQuantity: 3,
      priceTiers: [{ sellingPriceCents: 1000, quantity: 3 }],
      isSerialized: false,
    },
  ];
  return {
    useAllProducts: () => ({ data, isLoading: false }),
    // The serial picker is mounted closed beside the catalog.
    useProductBatches: () => ({ data: [], isLoading: false }),
  };
});
vi.mock('@/features/inventory/hooks/useCategories', () => {
  // One array for every render, as the query cache gives.
  const data: never[] = [];
  return {
    useCategories: () => ({ data, isLoading: false }),
    useCategoryLookup: () => ({ getCategory: () => undefined }),
    useCategoryIcons: () => null,
  };
});
vi.mock('@/shared/hooks/usePermissions', () => ({
  useHasPermission: () => false,
  useIsAdmin: () => false,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const fetchRepairs = vi.mocked(repairsApi.fetchRepairs);
const fetchPrintJobs = vi.mocked(printJobsApi.fetchPrintJobs);
const show = vi.mocked(notifications.show);

const job = (ticketNumber: string, over: Record<string, unknown> = {}) => ({
  id: ticketNumber.toLowerCase(),
  ticketNumber,
  customerName: 'Kamal Silva',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A15',
  issueDescription: 'Screen',
  jobType: 'mug',
  quantity: 1,
  status: 'ready',
  kind: { kind: 'standard' },
  items: [{ key: 'item_1', description: 'Work', quantity: 1 }],
  priceCents: 850_000,
  costCents: 0,
  ...over,
});

const REPAIRS = [
  job('REP-000004'),
  job('REP-000005'),
  job('REP-000006', { billedInvoiceNumber: 'INV-9' }),
];
const PRINT_JOBS = [job('PRN-000002'), job('PRN-000003', { status: 'cancelled' })];

describe('scanning a job ticket at the till', () => {
  let container: HTMLDivElement;
  let root: Root;
  const makeStore = () =>
    configureStore({ reducer: { cart: cartReducer, auth: () => ({ user: null }) } });
  let store: ReturnType<typeof makeStore>;

  const settle = () =>
    act(async () => {
      for (let i = 0; i < 6; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
    });
  const input = () => container.querySelector<HTMLInputElement>('input[data-barcode-scanner]')!;
  /** Types and presses Enter at once, as a scanner does. */
  const scan = async (code: string) => {
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setValue.call(input(), code);
      input().dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      input().form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };
  const billed = () => store.getState().cart.items.map((item) => item.sku);
  const titles = () => show.mock.calls.map(([notice]) => notice.title);

  beforeEach(async () => {
    vi.clearAllMocks();
    // The unfiltered list is one page; these jobs are older than it, so only a search finds them.
    fetchRepairs.mockImplementation(
      async (params) =>
        REPAIRS.filter((r) => r.ticketNumber.toLowerCase() === params?.search) as never
    );
    fetchPrintJobs.mockImplementation(
      async (params) =>
        PRINT_JOBS.filter((p) => p.ticketNumber.toLowerCase() === params?.search) as never
    );
    store = makeStore();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={client}>
            <MantineProvider>
              <LayoutTierProvider>
                <CatalogPanel mode="goods" onModeChange={() => undefined} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('bills a repair on the first scan, before any job list has loaded', async () => {
    await scan('REP-000004');
    await settle();
    expect(billed()).toEqual(['REP-000004']);
    expect(container.textContent).not.toContain('No product found');
    expect(input().value).toBe('');
  });

  it('bills a print job on the first scan', async () => {
    await scan('PRN-000002');
    await settle();
    expect(billed()).toEqual(['PRN-000002']);
    expect(container.textContent).not.toContain('No product found');
  });

  it('takes the next scan while the first job is still loading', async () => {
    const answers: Array<() => void> = [];
    fetchRepairs.mockImplementation(
      (params) =>
        new Promise((resolve) => {
          answers.push(() =>
            resolve(REPAIRS.filter((r) => r.ticketNumber.toLowerCase() === params?.search) as never)
          );
        })
    );
    await scan('REP-000004');
    expect(input().value).toBe('');
    await scan('REP-000005');
    await act(async () => answers.forEach((answer) => answer()));
    await settle();
    expect(billed().sort()).toEqual(['REP-000004', 'REP-000005']);
  });

  it('says why when the repair cannot be loaded', async () => {
    fetchRepairs.mockRejectedValue({ message: 'Network Error', statusCode: 0 });
    await scan('REP-000004');
    await settle();
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not add the repair',
        message: 'REP-000004: Network Error',
      })
    );
    expect(billed()).toEqual([]);
    expect(container.textContent).not.toContain('No product found');
  });

  it('says why when the print job cannot be loaded', async () => {
    fetchPrintJobs.mockRejectedValue({ message: 'Network Error', statusCode: 0 });
    await scan('PRN-000002');
    await settle();
    expect(titles()).toEqual(['Could not add the print job']);
  });

  it('keeps the reason a job cannot be billed', async () => {
    await scan('REP-000006');
    await settle();
    await scan('PRN-000003');
    await settle();
    expect(titles()).toEqual(['Already billed', 'Print job cancelled']);
    expect(billed()).toEqual([]);
    expect(input().value).toBe('');
  });

  it('reports a ticket number that names no job', async () => {
    await scan('REP-000099');
    await settle();
    expect(container.textContent).toContain('No product found for "REP-000099".');
    expect(input().value).toBe('REP-000099');
    expect(billed()).toEqual([]);
  });

  it('sells a product whose SKU looks like a ticket without asking for jobs', async () => {
    await scan('REP-77');
    await settle();
    expect(billed()).toEqual(['REP-77']);
    expect(fetchRepairs).not.toHaveBeenCalled();
  });

  it('does not ask for jobs while a product name starting with "rep" is typed', async () => {
    await scan('replacement cable');
    await settle();
    expect(fetchRepairs).not.toHaveBeenCalled();
  });
});
