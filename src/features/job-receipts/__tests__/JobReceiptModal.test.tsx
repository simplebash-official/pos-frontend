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
import { STORAGE_KEYS } from '@/constants/storage';
import { JobReceiptModal } from '../components/JobReceiptModal';
import * as jobReceiptsApi from '../api/jobReceiptsApi';
import { slipTarget } from '../lib/jobSlip';
import * as repairsApi from '@/features/repairs/api/repairsApi';
import * as printJobsApi from '@/features/print-jobs/api/printJobsApi';
import * as documentTemplatesApi from '@/features/settings/api/documentTemplatesApi';

vi.mock('../api/jobReceiptsApi', () => ({
  getJobReceipt: vi.fn(),
}));
vi.mock('@/features/settings/api/documentTemplatesApi', () => ({
  getDocumentTemplatesApi: vi.fn(),
}));
vi.mock('@/features/repairs/api/repairsApi', () => ({ fetchCustomerRepairs: vi.fn() }));
vi.mock('@/features/print-jobs/api/printJobsApi', () => ({ fetchCustomerPrintJobs: vi.fn() }));
// The real viewer draws with pdf.js, which jsdom cannot run; this one says what it was given.
vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: ({ blob, loading }: { blob: Blob | null; loading: boolean }) => (
    <div data-testid="viewer">{loading ? 'loading' : blob === null ? 'empty' : 'shown'}</div>
  ),
}));

const REPAIR = slipTarget({
  id: 'rep_1',
  ticketNumber: 'REP-000123',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
});
const PRINT = slipTarget({
  id: 'prn_1',
  ticketNumber: 'PRN-000045',
  customerKey: 'cus_kasun',
  customerName: 'Kasun Silva',
});

const openJob = (id: string, ticketNumber: string, over: Record<string, unknown> = {}) => ({
  id,
  ticketNumber,
  deviceModel: 'Galaxy A55',
  jobType: 'mug',
  quantity: 2,
  status: 'received',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
  ...over,
});

const receipt = vi.mocked(jobReceiptsApi.getJobReceipt);
const designs = vi.mocked(documentTemplatesApi.getDocumentTemplatesApi);

const Harness = ({ receiptPaper, children }: { receiptPaper: string; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: {
            id: 'u1',
            name: 'T',
            username: 't',
            role: 'staff',
            permissions: ['repairs:write', 'print_jobs:write'],
          },
        }),
        settings: () => ({ printSettings: { receiptPaper } }),
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
            <MemoryRouter>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('job receipt preview', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.JOB_RECEIPT_SHEET);
    receipt.mockReset();
    receipt.mockResolvedValue(new Blob(['%PDF-1.7'], { type: 'application/pdf' }));
    designs.mockReset();
    designs.mockResolvedValue({ kinds: [] } as never);
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([]);
    vi.mocked(printJobsApi.fetchCustomerPrintJobs).mockResolvedValue([]);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (
    target: Parameters<typeof JobReceiptModal>[0]['target'],
    receiptPaper = '58mm'
  ) => {
    await act(async () => {
      root.render(
        <Harness receiptPaper={receiptPaper}>
          <JobReceiptModal target={target} onClose={vi.fn()} />
        </Harness>
      );
    });
  };

  const button = (label: string) =>
    [...document.querySelectorAll('label, button')].find(
      (element) => element.textContent?.trim() === label
    ) as HTMLElement | undefined;

  const viewerText = () => document.querySelector('[data-testid="viewer"]')?.textContent;

  it('fetches nothing while closed', async () => {
    await render(null);
    expect(receipt).not.toHaveBeenCalled();
  });

  it('prints a repair on this computer’s receipt roll first, then on A5', async () => {
    await render(REPAIR);
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(['rep_1'], 'thermal-58', undefined)
    );
    await vi.waitFor(() => expect(viewerText()).toBe('shown'));
    expect(document.body.textContent).toContain('Job slip REP-000123');
    expect(document.body.textContent).toContain('Nimal Perera');

    expect(button('Receipt roll')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('A5 sheet')?.getAttribute('aria-pressed')).toBe('false');
    await act(async () => button('A5 sheet')?.click());
    expect(button('A5 sheet')?.getAttribute('aria-pressed')).toBe('true');
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledWith(['rep_1'], 'a5', undefined));
  });

  it('uses the 80 mm roll when this computer prints on 80 mm', async () => {
    await render(PRINT, '80mm');
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(['prn_1'], 'thermal-80', undefined)
    );
    expect(document.body.textContent).toContain('Job slip PRN-000045');
  });

  it('remembers the sheet this computer printed on last', async () => {
    await render(REPAIR, '80mm');
    await act(async () => button('A5 sheet')?.click());
    expect(localStorage.getItem(STORAGE_KEYS.JOB_RECEIPT_SHEET)).toBe('a5');

    act(() => root.unmount());
    root = createRoot(container);
    receipt.mockClear();
    await render(PRINT, '80mm');
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledWith(['prn_1'], 'a5', undefined));
  });

  it('turns Print off while there is no receipt to print', async () => {
    receipt.mockRejectedValue({ code: 'SOMETHING_ELSE' });
    await render(REPAIR);
    await vi.waitFor(() => expect(button('Print')?.hasAttribute('disabled')).toBe(true));
  });

  it('says printing is paused when the shop’s design is not available', async () => {
    receipt.mockRejectedValue({ code: 'TEMPLATE_UNAVAILABLE' });
    await render(REPAIR);
    await vi.waitFor(() => expect(document.querySelector('[data-testid="viewer"]')).toBeNull());
    expect(button('Print')?.hasAttribute('disabled')).toBe(true);
  });

  it('puts the customer’s other open jobs one tick away, on one slip', async () => {
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([
      openJob('rep_1', 'REP-000123'),
      openJob('rep_2', 'REP-000124', { status: 'delivered' }),
    ] as never);
    vi.mocked(printJobsApi.fetchCustomerPrintJobs).mockResolvedValue([
      openJob('prn_7', 'PRN-000007'),
    ] as never);
    await render(REPAIR);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Jobs on this slip'));
    expect(document.body.textContent).not.toContain('REP-000124');
    const chip = () =>
      [...document.querySelectorAll('label')].find((l) =>
        l.textContent?.includes('PRN-000007')
      ) as HTMLElement;

    await act(async () => chip().click());
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(['rep_1', 'prn_7'], 'thermal-58', undefined)
    );
    expect(document.body.textContent).toContain('Job slip · 2 jobs');
  });

  it('shows no ticks when the customer has nothing else open', async () => {
    vi.mocked(repairsApi.fetchCustomerRepairs).mockResolvedValue([
      openJob('rep_1', 'REP-000123'),
    ] as never);
    await render(REPAIR);
    await vi.waitFor(() => expect(viewerText()).toBe('shown'));
    expect(document.body.textContent).not.toContain('Jobs on this slip');
  });

  it('asks the server again every time it opens, because the job or the terms may have changed', async () => {
    await render(REPAIR);
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledTimes(1));
    await render(null);
    await render(REPAIR);
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledTimes(2));
  });
});
