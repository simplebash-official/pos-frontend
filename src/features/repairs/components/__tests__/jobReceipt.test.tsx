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
import { MemoryRouter } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import type { RepairJob, RepairJobInput } from '../../types';
import * as repairsApi from '../../api/repairsApi';
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
// The form has its own tests; this one hands back the values a saved form would send.
vi.mock('../RepairFormModal', () => ({
  RepairFormModal: ({
    onSubmit,
    onClose,
    jobToEdit,
  }: {
    onSubmit: (values: RepairJobInput) => Promise<void>;
    onClose: () => void;
    jobToEdit?: RepairJob | null;
  }) => (
    <button
      type="button"
      data-testid="save-form"
      onClick={() =>
        void onSubmit({ deviceModel: 'Galaxy A55' } as RepairJobInput).then(() => onClose())
      }
    >
      {jobToEdit ? 'save edit' : 'save new'}
    </button>
  ),
}));
// The receipt preview has its own tests; this one says which job it was opened for.
vi.mock('@/features/job-receipts/components/JobReceiptModal', () => ({
  JobReceiptModal: ({ job }: { job: { ticketNumber: string; kind: string; id: string } | null }) =>
    job === null ? null : (
      <output data-testid="receipt">{`${job.kind}:${job.id}:${job.ticketNumber}`}</output>
    ),
}));

const fetchRepairs = vi.mocked(repairsApi.fetchRepairs);
const createJob = vi.mocked(repairsApi.createRepairJobRaw);
const updateJob = vi.mocked(repairsApi.updateRepairJobRaw);

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  issueDescription: 'Cracked screen',
  status: 'received',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 0,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};
const NEW_JOB: RepairJob = { ...JOB, id: 'rep_9', ticketNumber: 'REP-000009' };

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'staff', permissions },
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
            <MemoryRouter initialEntries={['/repairs']}>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const receiptButtons = () => [
  ...document.querySelectorAll<HTMLButtonElement>('button[aria-label="Print receipt"]'),
];
const receipt = () => document.querySelector('[data-testid="receipt"]')?.textContent;
const button = (text: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);

describe('the receipt on the repair list', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fetchRepairs.mockReset();
    fetchRepairs.mockResolvedValue([JOB]);
    createJob.mockReset();
    updateJob.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[] = ['repairs:write']) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <RepairJobList />
        </Harness>
      );
    });
  };

  it('opens the receipt of a ticket that was just created', async () => {
    createJob.mockResolvedValue(NEW_JOB);
    await render();
    expect(receipt()).toBeUndefined();

    await act(async () => button('New Repair Ticket')?.click());
    await act(async () => button('save new')?.click());

    await vi.waitFor(() => expect(receipt()).toBe('repair:rep_9:REP-000009'));
  });

  it('does not open a receipt after an edit', async () => {
    updateJob.mockResolvedValue(JOB);
    await render();
    await vi.waitFor(() => expect(document.body.textContent).toContain('REP-000001'));

    await act(async () =>
      [...document.querySelectorAll('tr')]
        .find((r) => r.textContent?.includes('REP-000001'))
        ?.click()
    );
    // The row opens the side panel; its Edit button opens the form.
    expect(button('save edit')).toBeUndefined();
    await act(async () => button('Edit')?.click());
    await act(async () => button('save edit')?.click());

    await vi.waitFor(() => expect(updateJob).toHaveBeenCalledTimes(1));
    expect(receipt()).toBeUndefined();
  });

  it('prints the receipt from the side panel a row opens', async () => {
    await render();
    await vi.waitFor(() => expect(document.body.textContent).toContain('REP-000001'));
    await act(async () =>
      [...document.querySelectorAll('tr')]
        .find((r) => r.textContent?.includes('REP-000001'))
        ?.click()
    );

    await act(async () => button('Print receipt')?.click());

    expect(receipt()).toContain('repair:');
  });

  it('prints the receipt again from a row without opening the edit window', async () => {
    await render();
    await vi.waitFor(() => expect(receiptButtons()).toHaveLength(1));

    await act(async () => receiptButtons()[0].click());

    expect(receipt()).toBe('repair:rep_1:REP-000001');
    expect(button('save edit')).toBeUndefined();
  });

  it('offers no receipt to someone who cannot take in repairs', async () => {
    createJob.mockResolvedValue(NEW_JOB);
    await render(['warranties:view']);
    await vi.waitFor(() => expect(document.body.textContent).toContain('REP-000001'));
    expect(receiptButtons()).toHaveLength(0);

    await act(async () => button('New Repair Ticket')?.click());
    await act(async () => button('save new')?.click());
    await vi.waitFor(() => expect(createJob).toHaveBeenCalledTimes(1));
    expect(receipt()).toBeUndefined();
  });
});
