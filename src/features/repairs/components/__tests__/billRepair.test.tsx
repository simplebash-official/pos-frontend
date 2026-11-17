/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import type { RepairJob, RepairJobInput } from '../../types';
import * as repairsApi from '../../api/repairsApi';
import { RepairFormModal } from '../RepairFormModal';
import { RepairJobList } from '../RepairJobList';

installDrawerTestEnv();

vi.mock('../../api/repairsApi', () => ({
  fetchRepairs: vi.fn(),
  fetchAllRepairs: vi.fn(),
  createRepairJobRaw: vi.fn(),
  updateRepairJobRaw: vi.fn(),
  deleteRepairsRaw: vi.fn(),
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('../../hooks/useRepairStats', () => ({
  useRepairStats: () => ({
    data: { todayJobs: 0, todayRevenueCents: 0, openJobs: 0, avgJobValueCents: 0 },
    isLoading: false,
    isStale: false,
    staleAsOf: null,
  }),
}));
vi.mock('@/features/warranties/api/warrantiesApi', () => ({
  lookupWarranties: vi.fn(),
  fetchWarranties: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 200 }),
  fetchWarranty: vi.fn(),
  voidWarranty: vi.fn(),
  extendWarranty: vi.fn(),
}));
vi.mock('../../api/repairServicesApi', () => ({
  fetchRepairServices: vi.fn().mockResolvedValue([]),
  createRepairService: vi.fn(),
  updateRepairService: vi.fn(),
}));
vi.mock('@/features/employees/hooks/useEmployees', () => ({
  useAllEmployees: () => ({ data: [] }),
  useCreateOwnerProfile: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const fetchRepairs = vi.mocked(repairsApi.fetchRepairs);
const show = vi.mocked(notifications.show);

const NO_WARRANTY = { coverage: { kind: 'none' }, warrantyType: 'shop' } as const;

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
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
      warranty: NO_WARRANTY,
    },
  ],
  priceCents: 250_000,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};

const REWORK: RepairJob = {
  ...JOB,
  id: 'rep_2',
  ticketNumber: 'REP-000002',
  kind: {
    kind: 'warranty_rework',
    claimKey: 'wcl_1',
    claimNumber: 'WCL-000001',
    originalRepairKey: 'rep_0',
    originalTicketNumber: 'REP-000000',
  },
};
const DELIVERED: RepairJob = {
  ...JOB,
  id: 'rep_3',
  ticketNumber: 'REP-000003',
  status: 'delivered',
};
const NO_WORK: RepairJob = {
  ...JOB,
  id: 'rep_4',
  ticketNumber: 'REP-000004',
  items: [],
  priceCents: 0,
};
const CANCELLED: RepairJob = {
  ...JOB,
  id: 'rep_5',
  ticketNumber: 'REP-000005',
  status: 'cancelled',
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const Harness = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: {
            id: 'u1',
            name: 'T',
            username: 't',
            role: 'manager',
            permissions: ['repairs:write', 'warranties:view', 'warranty_claims:record'],
          },
        }),
      },
    })
  );
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter initialEntries={['/repairs']}>
              {children}
              <LocationProbe />
            </MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const buttons = () => [...document.querySelectorAll('button')];
const button = (text: string) => buttons().find((b) => b.textContent?.trim() === text);
const location = () => document.querySelector('[data-testid="location"]')?.textContent;
const billButtons = () => [
  ...document.querySelectorAll<HTMLButtonElement>('button[aria-label="Bill this repair"]'),
];

describe('billing a repair from the repair screen', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fetchRepairs.mockReset();
    show.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: ReactNode) => {
    await act(async () => {
      root.render(<Harness>{node}</Harness>);
    });
  };

  describe('the edit window', () => {
    it('saves first, then opens the billing counter with that repair', async () => {
      const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
      const onClose = vi.fn();
      await render(
        <RepairFormModal opened onClose={onClose} onSubmit={onSubmit} jobToEdit={JOB} />
      );

      await act(async () => button('Update & bill')?.click());

      await vi.waitFor(() => expect(location()).toBe('/billing?billRepair=rep_1'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].items).toHaveLength(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stays on the repair screen and says so when the save fails', async () => {
      const onSubmit = vi
        .fn<(values: RepairJobInput) => Promise<void>>()
        .mockRejectedValue(new Error('Version conflict'));
      await render(
        <RepairFormModal opened onClose={vi.fn()} onSubmit={onSubmit} jobToEdit={JOB} />
      );

      await act(async () => button('Update & bill')?.click());

      await vi.waitFor(() => expect(show).toHaveBeenCalledTimes(1));
      expect(show).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Could not save the repair', color: 'red' })
      );
      expect(location()).toBe('/repairs');
    });

    it('is offered only for a saved job that can be billed', async () => {
      const open = async (job: RepairJob | null) => {
        await render(
          <RepairFormModal opened onClose={vi.fn()} onSubmit={vi.fn()} jobToEdit={job} />
        );
        const offered = button('Update & bill') !== undefined;
        act(() => root.unmount());
        root = createRoot(container);
        return offered;
      };
      expect(await open(JOB)).toBe(true);
      expect(await open(null)).toBe(false);
      expect(await open(REWORK)).toBe(false);
      expect(await open(DELIVERED)).toBe(false);
      expect(await open(CANCELLED)).toBe(false);
      expect(await open(NO_WORK)).toBe(false);
    });
  });

  describe('the repair list', () => {
    it('bills a repair from its row without opening the edit window', async () => {
      fetchRepairs.mockResolvedValue([JOB]);
      await render(<RepairJobList />);
      await vi.waitFor(() => expect(billButtons()).toHaveLength(1));

      await act(async () => billButtons()[0].click());

      expect(location()).toBe('/billing?billRepair=rep_1');
      expect(document.body.textContent).not.toContain('Edit Ticket');
    });

    it('shows the action only on repairs that can be billed', async () => {
      fetchRepairs.mockResolvedValue([JOB, REWORK, DELIVERED, NO_WORK, CANCELLED]);
      await render(<RepairJobList />);
      await vi.waitFor(() => expect(document.body.textContent).toContain('REP-000005'));
      expect(billButtons()).toHaveLength(1);
    });
  });
});
