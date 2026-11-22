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
import { receiptTarget } from '../lib/receiptTarget';
import * as documentTemplatesApi from '@/features/settings/api/documentTemplatesApi';

vi.mock('../api/jobReceiptsApi', () => ({
  getJobReceipt: vi.fn(),
}));
vi.mock('@/features/settings/api/documentTemplatesApi', () => ({
  getDocumentTemplatesApi: vi.fn(),
}));
// The real viewer draws with pdf.js, which jsdom cannot run; this one says what it was given.
vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: ({ blob, loading }: { blob: Blob | null; loading: boolean }) => (
    <div data-testid="viewer">{loading ? 'loading' : blob === null ? 'empty' : 'shown'}</div>
  ),
}));

const REPAIR = receiptTarget('repair', {
  id: 'rep_1',
  ticketNumber: 'REP-000123',
  customerName: 'Nimal Perera',
});
const PRINT = receiptTarget('print', {
  id: 'prn_1',
  ticketNumber: 'PRN-000045',
  customerName: 'Kasun Silva',
});

const receipt = vi.mocked(jobReceiptsApi.getJobReceipt);
const designs = vi.mocked(documentTemplatesApi.getDocumentTemplatesApi);

const Harness = ({ receiptPaper, children }: { receiptPaper: string; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u1', name: 'T', username: 't', role: 'staff' } }),
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
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (
    job: Parameters<typeof JobReceiptModal>[0]['job'],
    receiptPaper = '58mm'
  ) => {
    await act(async () => {
      root.render(
        <Harness receiptPaper={receiptPaper}>
          <JobReceiptModal job={job} onClose={vi.fn()} />
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
      expect(receipt).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'repair', id: 'rep_1' }),
        'thermal-58',
        undefined
      )
    );
    await vi.waitFor(() => expect(viewerText()).toBe('shown'));
    expect(document.body.textContent).toContain('Job slip REP-000123');
    expect(document.body.textContent).toContain('Nimal Perera');

    expect(button('Receipt roll')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('A5 sheet')?.getAttribute('aria-pressed')).toBe('false');
    await act(async () => button('A5 sheet')?.click());
    expect(button('A5 sheet')?.getAttribute('aria-pressed')).toBe('true');
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'repair', id: 'rep_1' }),
        'a5',
        undefined
      )
    );
  });

  it('uses the 80 mm roll when this computer prints on 80 mm', async () => {
    await render(PRINT, '80mm');
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'print', id: 'prn_1' }),
        'thermal-80',
        undefined
      )
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
    await vi.waitFor(() =>
      expect(receipt).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'print', id: 'prn_1' }),
        'a5',
        undefined
      )
    );
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

  it('asks the server again every time it opens, because the job or the terms may have changed', async () => {
    await render(REPAIR);
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledTimes(1));
    await render(null);
    await render(REPAIR);
    await vi.waitFor(() => expect(receipt).toHaveBeenCalledTimes(2));
  });
});
