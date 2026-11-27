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
import cartReducer, { addItem, setCustomer, type CartItem } from '@/store/slices/cartSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import * as customersApi from '@/features/customers/api/customersApi';
import * as printJobsApi from '@/features/print-jobs/api/printJobsApi';
import * as repairsApi from '@/features/repairs/api/repairsApi';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { useAttachJobCustomer, useBillTo } from '../../hooks/useBillTo';
import { BillToCard } from '../BillToCard';
import { OtherCustomerJobs } from '../OtherCustomerJobs';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/features/repairs/api/repairsApi', () => ({
  fetchRepairJob: vi.fn(),
  fetchCustomerRepairs: vi.fn(),
}));
vi.mock('@/features/print-jobs/api/printJobsApi', () => ({
  fetchPrintJob: vi.fn(),
  fetchCustomerPrintJobs: vi.fn(),
}));
vi.mock('@/features/customers/api/customersApi', () => ({ fetchCustomerById: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const repair = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  ticketNumber: id.toUpperCase().replace('_', '-'),
  customerKey: 'cus_kamal',
  customerName: 'Kamal Silva',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A15',
  issueDescription: 'Screen',
  status: 'ready',
  kind: { kind: 'standard' },
  items: [{ key: 'rit_1' }],
  priceCents: 850_000,
  costCents: 0,
  createdAt: '2026-11-20T05:00:00Z',
  ...over,
});

const LINE: CartItem = {
  id: 'line-1',
  productId: 'rep_1',
  name: 'REP-1: Galaxy A15 repair',
  unitPriceCents: 850_000,
  quantity: 1,
  discount: null,
  sourceType: 'repair',
  sourceTicketNumber: 'REP-1',
};

const openPicker = vi.fn();

const Screen = () => {
  const billTo = useBillTo();
  useAttachJobCustomer(billTo);
  return (
    <>
      {billTo.status !== 'none' && <BillToCard billTo={billTo} onOpenCustomerPicker={openPicker} />}
      <OtherCustomerJobs />
    </>
  );
};

describe('the till’s bill-to card and other jobs', () => {
  let container: HTMLDivElement;
  let root: Root;
  const makeStore = () =>
    configureStore({ reducer: { cart: cartReducer, settings: settingsReducer } });
  let store: ReturnType<typeof makeStore>;

  const settle = () =>
    act(async () => {
      for (let i = 0; i < 6; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
    });
  const render = async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={client}>
            <MantineProvider>
              <LayoutTierProvider>
                <Screen />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };
  const text = () => container.textContent ?? '';
  const radios = () => [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const button = (label: string) =>
    [...container.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === label || b.textContent?.includes(label)
    ) as HTMLButtonElement;
  const click = async (element: HTMLElement) => {
    await act(async () => element.click());
    await settle();
  };

  beforeEach(() => {
    vi.resetAllMocks();
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as never;
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as never;
    vi.mocked(repairsApi.fetchRepairJob).mockResolvedValue(repair('rep_1') as never);
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([]);
    vi.mocked(printJobsApi.fetchCustomerPrintJobs).mockResolvedValue([]);
    vi.mocked(customersApi.fetchCustomerById).mockImplementation(
      async (key) =>
        ({
          key,
          name: 'Kamal Silva',
          primaryPhone: '0771234567',
          outstandingBalanceCents: 0,
        }) as never
    );
    store = makeStore();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows the job’s customer chosen, without holding the sale', async () => {
    store.dispatch(addItem(LINE));
    await render();
    expect(text()).toContain('Bill to');
    expect(text()).toContain('From job REP-1');
    expect(text()).toContain('Same as the job');
    expect(radios()).toHaveLength(1);
    expect(radios()[0].checked).toBe(true);
    expect(text()).not.toContain('Choose who to bill');
    expect(text()).not.toContain('Warranty stays with');
  });

  it('asks when the bill names someone else, and records either answer', async () => {
    store.dispatch(setCustomer({ id: 'cus_nimal', name: 'Nimal Perera' }));
    store.dispatch(addItem(LINE));
    await render();
    expect(text()).toContain('Choose who to bill. Job of another customer: Kamal Silva (REP-1)');
    expect(radios().map((r) => r.checked)).toEqual([false, false]);

    await click(radios()[1]);
    expect(store.getState().cart.customerId).toBe('cus_nimal');
    expect(store.getState().cart.billToConfirmation).toEqual({
      billCustomerKey: 'cus_nimal',
      jobCustomerKeys: ['cus_kamal'],
    });
    expect(text()).toContain('Warranty stays with Kamal Silva (REP-1).');
    expect(radios()[1].checked).toBe(true);

    await click(radios()[0]);
    expect(store.getState().cart.customerId).toBe('cus_kamal');
    expect(text()).not.toContain('Warranty stays with');
  });

  it('opens the customer picker for a different customer', async () => {
    store.dispatch(addItem(LINE));
    await render();
    await click(button('A different customer…'));
    expect(openPicker).toHaveBeenCalled();
  });

  it('adds the ready jobs with one button and the others one by one', async () => {
    store.dispatch(addItem(LINE));
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([
      repair('rep_1'),
      repair('rep_2'),
      repair('rep_3', { status: 'in_repair' }),
      repair('rep_4', { status: 'received', items: [], priceCents: 0 }),
      repair('rep_5', { status: 'delivered' }),
      repair('rep_6', { billedInvoiceNumber: 'INV-1' }),
    ] as never);
    await render();
    expect(text()).toContain('3 more open jobs for Kamal Silva');

    await click(button('Show the jobs'));
    expect(button('Add REP-4').disabled).toBe(true);
    expect(text()).not.toContain('REP-5');
    expect(text()).not.toContain('REP-6');

    await click(button('Add ready (1)'));
    expect(store.getState().cart.items.map((item) => item.productId)).toEqual(['rep_2', 'rep_1']);
    expect(text()).toContain('2 more open jobs for Kamal Silva');

    await click(button('Add REP-3'));
    expect(store.getState().cart.items.map((item) => item.productId)).toContain('rep_3');
  });

  it('offers nothing when there are no other jobs', async () => {
    store.dispatch(addItem(LINE));
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([repair('rep_1')] as never);
    await render();
    expect(container.querySelector('[data-testid="other-customer-jobs"]')).toBeNull();
  });
});
