/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import cartReducer, { setCustomer } from '@/store/slices/cartSlice';
import type { PrintJob } from '@/features/print-jobs';
import * as printJobsApi from '@/features/print-jobs/api/printJobsApi';
import type { RepairJob } from '@/features/repairs';
import * as repairsApi from '@/features/repairs/api/repairsApi';
import { useBillJobLink } from '../useBillJobLink';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/features/repairs/api/repairsApi', () => ({ fetchRepairJob: vi.fn() }));
vi.mock('@/features/print-jobs/api/printJobsApi', () => ({ fetchPrintJob: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const fetchRepairJob = vi.mocked(repairsApi.fetchRepairJob);
const fetchPrintJob = vi.mocked(printJobsApi.fetchPrintJob);
const show = vi.mocked(notifications.show);

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  issueDescription: 'Cracked screen',
  status: 'ready',
  kind: { kind: 'standard' },
  items: [
    {
      key: 'rit_1',
      description: 'Replace screen',
      laborCents: 250_000,
      partCents: 0,
      partCostCents: 0,
      warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
    },
  ],
  priceCents: 250_000,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};

const PRINT_JOB: PrintJob = {
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  jobType: 'mug',
  quantity: 50,
  status: 'ready',
  kind: { kind: 'standard' },
  items: [
    {
      key: 'pit_1',
      description: 'Mug printing',
      quantity: 50,
      source: { type: 'service' },
      unitPriceCents: 95_000,
      costCents: 0,
      warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
    },
  ],
  frames: [],
  priceCents: 4_750_000,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};

const Probe = () => {
  useBillJobLink();
  return <output data-testid="search">{useLocation().search}</output>;
};

describe('useBillJobLink', () => {
  let container: HTMLDivElement;
  let root: Root;
  let store: ReturnType<typeof makeStore>;
  const makeStore = () => configureStore({ reducer: { cart: cartReducer } });

  beforeEach(() => {
    fetchRepairJob.mockReset();
    fetchPrintJob.mockReset();
    show.mockReset();
    store = makeStore();
    container = document.createElement('div');
    root = createRoot(container);
  });
  afterEach(() => act(() => root.unmount()));

  const render = async (url: string, strict = false) => {
    const tree = (
      <Provider store={store}>
        <MemoryRouter initialEntries={[url]}>
          <Probe />
        </MemoryRouter>
      </Provider>
    );
    await act(async () => {
      root.render(strict ? <StrictMode>{tree}</StrictMode> : tree);
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  };
  const search = () => container.querySelector('[data-testid="search"]')?.textContent;
  const lines = () => store.getState().cart.items;

  it('puts the repair on the bill, tells the cashier and takes the link out of the address', async () => {
    fetchRepairJob.mockResolvedValue(JOB);

    await render('/billing?billRepair=rep_1');

    expect(fetchRepairJob).toHaveBeenCalledWith('rep_1');
    expect(lines()).toHaveLength(1);
    expect(lines()[0]).toMatchObject({
      productId: 'rep_1',
      sourceType: 'repair',
      sourceTicketNumber: 'REP-000001',
      unitPriceCents: 250_000,
      quantity: 1,
    });
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Repair added to the bill', color: 'teal' })
    );
    expect(search()).toBe('');
  });

  it('adds one line even when the screen draws twice', async () => {
    fetchRepairJob.mockResolvedValue(JOB);

    await render('/billing?billRepair=rep_1', true);

    expect(lines()).toHaveLength(1);
    expect(show).toHaveBeenCalledTimes(1);
    expect(search()).toBe('');
  });

  it('says why a repair cannot be billed, adds nothing and clears the link', async () => {
    fetchRepairJob.mockResolvedValue({ ...JOB, status: 'delivered' });

    await render('/billing?billRepair=rep_1');

    expect(lines()).toHaveLength(0);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Already handed back',
        message: 'REP-000001: this repair was already handed back.',
        color: 'red',
      })
    );
    expect(search()).toBe('');
  });

  it('shows the error when the repair cannot be loaded, adds nothing and clears the link', async () => {
    fetchRepairJob.mockRejectedValue(new Error('Repair not found'));

    await render('/billing?billRepair=rep_1');

    expect(lines()).toHaveLength(0);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not add the repair',
        message: 'Repair not found',
        color: 'red',
      })
    );
    expect(search()).toBe('');
  });

  it('leaves the customer on the bill to the bill-to card', async () => {
    store.dispatch(setCustomer({ id: 'cust_9', name: 'Kamal' }));
    fetchRepairJob.mockResolvedValue(JOB);

    await render('/billing?billRepair=rep_1');

    expect(lines()).toHaveLength(1);
    expect(store.getState().cart.customerId).toBe('cust_9');
  });

  it('puts a print job on the bill at its own price and takes the link out', async () => {
    fetchPrintJob.mockResolvedValue(PRINT_JOB);

    await render('/billing?billPrint=prn_1', true);

    expect(fetchPrintJob).toHaveBeenCalledWith('prn_1');
    expect(fetchRepairJob).not.toHaveBeenCalled();
    expect(lines()).toHaveLength(1);
    expect(lines()[0]).toMatchObject({
      productId: 'prn_1',
      sourceType: 'print',
      sourceTicketNumber: 'PRN-000001',
      unitPriceCents: 4_750_000,
      quantity: 1,
    });
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Print job added to the bill', color: 'teal' })
    );
    expect(search()).toBe('');
  });

  it('says why a print job cannot be billed and adds nothing', async () => {
    fetchPrintJob.mockResolvedValue({ ...PRINT_JOB, billedInvoiceNumber: 'INV-2026-000009' });

    await render('/billing?billPrint=prn_1');

    expect(lines()).toHaveLength(0);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Already billed',
        message: 'PRN-000001: this print job was already billed on INV-2026-000009.',
        color: 'red',
      })
    );
    expect(search()).toBe('');
  });

  it('shows the error when the print job cannot be loaded and clears the link', async () => {
    fetchPrintJob.mockRejectedValue(new Error('Print job not found'));

    await render('/billing?billPrint=prn_9');

    expect(lines()).toHaveLength(0);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not add the print job',
        message: 'Print job not found',
        color: 'red',
      })
    );
    expect(search()).toBe('');
  });

  it('does nothing without the link', async () => {
    await render('/billing');
    expect(fetchRepairJob).not.toHaveBeenCalled();
    expect(fetchPrintJob).not.toHaveBeenCalled();
    expect(lines()).toHaveLength(0);
    expect(show).not.toHaveBeenCalled();
  });
});
