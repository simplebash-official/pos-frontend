/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import cartReducer, { addItem, setCustomer, type CartItem } from '@/store/slices/cartSlice';
import * as customersApi from '@/features/customers/api/customersApi';
import * as printJobsApi from '@/features/print-jobs/api/printJobsApi';
import * as repairsApi from '@/features/repairs/api/repairsApi';
import { useAttachJobCustomer, useBillTo, type BillTo } from '../useBillTo';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/features/repairs/api/repairsApi', () => ({ fetchRepairJob: vi.fn() }));
vi.mock('@/features/print-jobs/api/printJobsApi', () => ({ fetchPrintJob: vi.fn() }));
vi.mock('@/features/customers/api/customersApi', () => ({ fetchCustomerById: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const fetchRepairJob = vi.mocked(repairsApi.fetchRepairJob);
const fetchPrintJob = vi.mocked(printJobsApi.fetchPrintJob);
const fetchCustomerById = vi.mocked(customersApi.fetchCustomerById);

const line = (id: string, sourceType: 'repair' | 'print'): CartItem => ({
  id: `line-${id}`,
  productId: id,
  name: id,
  unitPriceCents: 1000,
  quantity: 1,
  discount: null,
  sourceType,
  sourceTicketNumber: id.toUpperCase(),
});

const ticket = (id: string, customerKey: string, customerName: string) =>
  ({
    id,
    ticketNumber: id.toUpperCase(),
    customerKey,
    customerName,
    customerPhone: '0771234567',
  }) as never;

const customer = (key: string, name: string) =>
  ({
    key,
    name,
    primaryPhone: '0771234567',
    address: 'Kandy',
    outstandingBalanceCents: 500,
  }) as never;

describe('useBillTo', () => {
  let root: Root;
  let latest: BillTo;
  const makeStore = () => configureStore({ reducer: { cart: cartReducer } });
  let store: ReturnType<typeof makeStore>;

  const Probe = () => {
    latest = useBillTo();
    useAttachJobCustomer(latest);
    return null;
  };
  const settle = () =>
    act(async () => {
      for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
    });
  const render = async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={client}>
            <Probe />
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };
  const cart = () => store.getState().cart;

  beforeEach(() => {
    vi.resetAllMocks();
    fetchRepairJob.mockImplementation(async (id) =>
      id === 'rep_1' ? ticket(id, 'cus_kamal', 'Kamal') : ticket(id, 'cus_saman', 'Saman')
    );
    fetchPrintJob.mockImplementation(async (id) => ticket(id, 'cus_kamal', 'Kamal'));
    fetchCustomerById.mockImplementation(async (key) =>
      customer(key, key === 'cus_kamal' ? 'Kamal' : 'Saman')
    );
    store = makeStore();
    root = createRoot(document.createElement('div'));
  });
  afterEach(() => act(() => root.unmount()));

  it('asks nothing while no job is on the bill', async () => {
    await render();
    expect(latest.status).toBe('none');
    expect(latest.blocked).toBe(false);
    expect(fetchCustomerById).not.toHaveBeenCalled();
  });

  it('bills the first job’s customer by itself, with their record', async () => {
    store.dispatch(addItem(line('rep_1', 'repair')));
    store.dispatch(addItem(line('rep_2', 'repair')));
    await render();
    expect(cart()).toMatchObject({
      customerId: 'cus_kamal',
      customerAddress: 'Kandy',
      customerBalanceCents: 500,
    });
    expect(latest.stateOf('cus_kamal')).toBe('same');
    expect(latest.unanswered.map((owner) => owner.key)).toEqual(['cus_saman']);
    expect(latest.blocked).toBe(true);
    expect(latest.ownerOfLine('line-rep_2')?.name).toBe('Saman');
  });

  it('asks when a job joins a bill that names someone else', async () => {
    store.dispatch(setCustomer({ id: 'cus_nimal', name: 'Nimal' }));
    store.dispatch(addItem(line('prn_1', 'print')));
    await render();
    expect(cart().customerId).toBe('cus_nimal');
    expect(latest.blocked).toBe(true);

    await act(async () => latest.keepPayer());
    await settle();
    expect(latest.stateOf('cus_kamal')).toBe('confirmed');
    expect(latest.blocked).toBe(false);
  });

  it('can bill the job’s own customer instead', async () => {
    store.dispatch(setCustomer({ id: 'cus_nimal', name: 'Nimal' }));
    store.dispatch(addItem(line('rep_1', 'repair')));
    await render();

    await act(async () => latest.billOwner('cus_kamal'));
    await settle();
    expect(cart().customerId).toBe('cus_kamal');
    expect(latest.blocked).toBe(false);
  });

  it('does not take the job’s customer once a walk-in was chosen', async () => {
    store.dispatch(addItem(line('rep_1', 'repair')));
    await render();
    await act(async () => {
      store.dispatch(setCustomer({ id: null, name: null }));
    });
    await settle();
    // Detached with no answer yet: the job's customer comes back.
    expect(cart().customerId).toBe('cus_kamal');

    await act(async () => {
      store.dispatch(setCustomer({ id: null, name: null }));
      latest.keepPayer();
    });
    await settle();
    expect(cart().customerId).toBeNull();
  });

  it('holds payment and offers a retry when a job cannot be read', async () => {
    fetchRepairJob.mockRejectedValueOnce(new Error('offline'));
    store.dispatch(addItem(line('rep_1', 'repair')));
    await render();
    expect(latest.status).toBe('error');
    expect(latest.blocked).toBe(true);

    await act(async () => latest.retry());
    await settle();
    expect(latest.status).toBe('ready');
    expect(cart().customerId).toBe('cus_kamal');
  });
});
