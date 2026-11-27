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
import type { RepairJob } from '../../types';
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
vi.mock('../RepairEditForm', () => ({
  REPAIR_FORM_ID: 'repair-form',
  RepairEditForm: ({
    editor,
    job,
  }: {
    editor: {
      handleSubmit: (values: unknown, bill: null) => Promise<void>;
      form: {
        values: Record<string, unknown>;
        setValues: (values: Record<string, unknown>) => void;
      };
    };
    job: RepairJob | null;
  }) => (
    <>
      <button
        type="button"
        data-testid="save-form"
        onClick={() => void editor.handleSubmit(editor.form.values, null)}
      >
        {job ? 'save edit' : 'save new'}
      </button>
      <button
        type="button"
        data-testid="fill-form"
        onClick={() =>
          editor.form.setValues({
            customerKey: 'cus_nimal',
            customerName: 'Nimal Perera',
            customerPhone: '0771234567',
            deviceModel: 'Redmi 13',
            issueDescription: 'Battery',
          })
        }
      >
        fill
      </button>
      <output data-testid="typed">{JSON.stringify(editor.form.values)}</output>
    </>
  ),
}));
// The receipt preview has its own tests; this one says which job it was opened for.
vi.mock('@/features/job-receipts/components/JobReceiptModal', () => ({
  JobReceiptModal: ({
    target,
  }: {
    target: { customerKey: string; jobs: { id: string; ticketNumber: string }[] } | null;
  }) =>
    target === null ? null : (
      <output data-testid="receipt">
        {target.jobs.map((job) => `${job.id}:${job.ticketNumber}`).join(',')}
      </output>
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
    await vi.waitFor(() => expect(button('save new')).toBeDefined());
    await act(async () => button('save new')?.click());

    await vi.waitFor(() => expect(receipt()).toBe('rep_9:REP-000009'));
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
    await vi.waitFor(() => expect(button('Edit')).toBeDefined());
    await act(async () => button('Edit')?.click());
    await vi.waitFor(() => expect(button('save edit')).toBeDefined());
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

    await vi.waitFor(() => expect(button('Job slip')).toBeDefined());
    await act(async () => button('Job slip')?.click());

    expect(receipt()).toContain('rep_1:');
  });

  it('offers no receipt to someone who cannot take in repairs', async () => {
    createJob.mockResolvedValue(NEW_JOB);
    await render(['warranties:view']);
    await vi.waitFor(() => expect(document.body.textContent).toContain('REP-000001'));

    await act(async () => button('New Repair Ticket')?.click());
    await vi.waitFor(() => expect(button('save new')).toBeDefined());
    await act(async () => button('save new')?.click());
    await vi.waitFor(() => expect(createJob).toHaveBeenCalledTimes(1));
    expect(receipt()).toBeUndefined();
  });

  it('saves job after job for one customer, then prints them on one slip', async () => {
    createJob
      .mockResolvedValueOnce(NEW_JOB)
      .mockResolvedValueOnce({ ...NEW_JOB, id: 'rep_10', ticketNumber: 'REP-000010' });
    await render();
    await act(async () => button('New Repair Ticket')?.click());
    await vi.waitFor(() => expect(button('Save & add another')).toBeDefined());
    const fill = () =>
      act(async () => (document.querySelector('[data-testid="fill-form"]') as HTMLElement).click());
    const typed = () =>
      JSON.parse(document.querySelector('[data-testid="typed"]')?.textContent as string) as Record<
        string,
        string
      >;

    await fill();
    await act(async () => button('Save & add another')?.click());
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain('Saved this visit: REP-000009')
    );
    // The form stays open, empty but for the customer, and no slip interrupts.
    expect(typed().customerKey).toBe('cus_nimal');
    expect(typed().deviceModel).toBe('');
    expect(receipt()).toBeUndefined();
    expect(button('Done')).toBeDefined();

    await fill();
    await act(async () => button('Save & add another')?.click());
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain('Saved this visit: REP-000009, REP-000010')
    );

    await act(async () => button('Done')?.click());
    await vi.waitFor(() => expect(receipt()).toBe('rep_9:REP-000009,rep_10:REP-000010'));
    expect(createJob).toHaveBeenCalledTimes(2);
  });
});
