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
import type { PrintJob } from '../../types';
import * as printJobsApi from '../../api/printJobsApi';
import { PrintJobList } from '../PrintJobList';

installDrawerTestEnv();

vi.mock('../../api/printJobsApi', () => ({
  fetchPrintJobs: vi.fn(),
  fetchAllPrintJobs: vi.fn(),
  createPrintJobRaw: vi.fn(),
  updatePrintJobRaw: vi.fn(),
  deletePrintJobsRaw: vi.fn(),
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('../../hooks/usePrintJobStats', () => ({
  usePrintJobStats: () => ({
    data: { todayJobs: 0, todayRevenueCents: 0, openJobs: 0, avgJobValueCents: 0 },
    isLoading: false,
    isStale: false,
    staleAsOf: null,
  }),
}));
// The form has its own tests; this one hands back the values a saved form would send.
vi.mock('../PrintJobEditForm', () => ({
  PRINT_JOB_FORM_ID: 'print-job-form',
  PrintJobEditForm: ({
    editor,
  }: {
    editor: { handleSubmit: (values: unknown) => Promise<void>; form: { values: unknown } };
  }) => (
    <button
      type="button"
      data-testid="save-form"
      onClick={() => void editor.handleSubmit(editor.form.values)}
    >
      {editor.form.values !== undefined &&
      (editor.form.values as { customerKey: string }).customerKey !== ''
        ? 'save edit'
        : 'save new'}
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

const fetchJobs = vi.mocked(printJobsApi.fetchPrintJobs);
const createJob = vi.mocked(printJobsApi.createPrintJobRaw);
const updateJob = vi.mocked(printJobsApi.updatePrintJobRaw);

const JOB: PrintJob = {
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  jobType: 'mug',
  quantity: 20,
  status: 'received',
  estimatedCostCents: 800_000,
  createdAt: '2026-11-03T05:00:00Z',
};
const NEW_JOB: PrintJob = { ...JOB, id: 'prn_9', ticketNumber: 'PRN-000009' };

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
            <MemoryRouter initialEntries={['/print-jobs']}>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const receiptButtons = () => [
  ...document.querySelectorAll<HTMLButtonElement>('button[aria-label="Job slip"]'),
];
const receipt = () => document.querySelector('[data-testid="receipt"]')?.textContent;
const button = (text: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);

describe('the receipt on the print job list', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fetchJobs.mockReset();
    fetchJobs.mockResolvedValue([JOB]);
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

  const render = async (permissions: string[] = ['print_jobs:write']) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <PrintJobList />
        </Harness>
      );
    });
  };

  it('opens the receipt of a ticket that was just created', async () => {
    createJob.mockResolvedValue(NEW_JOB);
    await render();
    expect(receipt()).toBeUndefined();

    await act(async () => button('New Print Order')?.click());
    await vi.waitFor(() => expect(button('save new')).toBeDefined());
    await act(async () => button('save new')?.click());

    await vi.waitFor(() => expect(receipt()).toBe('print:prn_9:PRN-000009'));
  });

  it('does not open a receipt after an edit', async () => {
    updateJob.mockResolvedValue(JOB);
    await render();
    await vi.waitFor(() => expect(document.body.textContent).toContain('PRN-000001'));

    await act(async () =>
      [...document.querySelectorAll('tr')]
        .find((r) => r.textContent?.includes('PRN-000001'))
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
    await vi.waitFor(() => expect(document.body.textContent).toContain('PRN-000001'));
    await act(async () =>
      [...document.querySelectorAll('tr')]
        .find((r) => r.textContent?.includes('PRN-000001'))
        ?.click()
    );

    await vi.waitFor(() => expect(button('Job slip')).toBeDefined());
    await act(async () => button('Job slip')?.click());

    expect(receipt()).toContain('print:');
  });

  it('prints the receipt again from a row without opening the edit window', async () => {
    await render();
    await vi.waitFor(() => expect(receiptButtons()).toHaveLength(1));

    await act(async () => receiptButtons()[0].click());

    expect(receipt()).toBe('print:prn_1:PRN-000001');
    expect(button('save edit')).toBeUndefined();
  });

  it('offers no receipt to someone who cannot take in print jobs', async () => {
    createJob.mockResolvedValue(NEW_JOB);
    await render(['warranties:view']);
    await vi.waitFor(() => expect(document.body.textContent).toContain('PRN-000001'));
    expect(receiptButtons()).toHaveLength(0);

    await act(async () => button('New Print Order')?.click());
    await vi.waitFor(() => expect(button('save new')).toBeDefined());
    await act(async () => button('save new')?.click());
    await vi.waitFor(() => expect(createJob).toHaveBeenCalledTimes(1));
    expect(receipt()).toBeUndefined();
  });
});
