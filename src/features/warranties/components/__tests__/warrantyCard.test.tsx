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
import type { Warranty } from '../../types';
import { WarrantyCardModal } from '../WarrantyCardModal';
import * as warrantiesApi from '../../api/warrantiesApi';
import * as documentTemplatesApi from '@/features/settings/api/documentTemplatesApi';

vi.mock('../../api/warrantiesApi', () => ({
  getWarrantyCard: vi.fn(),
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

const WARRANTY: Warranty = {
  id: '65f1a1a1a1a1a1a1a1a1a1a1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  lineIndex: 0,
  productKey: 'prod_1',
  itemName: 'Galaxy A55',
  serialNumber: '356789012345678',
  quantity: 1,
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  unitPriceCents: 9_000_000,
  startsOn: '2026-11-03',
  endsOn: '2027-11-02',
  status: 'active',
  claimCount: 0,
  state: 'active',
  daysRemaining: 365,
  version: 1,
  createdAt: '2026-11-03T05:00:00Z',
  updatedAt: '2026-11-03T05:00:00Z',
};

const card = vi.mocked(warrantiesApi.getWarrantyCard);
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

describe('warranty card preview', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    card.mockReset();
    card.mockResolvedValue(new Blob(['%PDF-1.7'], { type: 'application/pdf' }));
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

  const render = async (warranty: Warranty, receiptPaper = '58mm') => {
    await act(async () => {
      root.render(
        <Harness receiptPaper={receiptPaper}>
          <WarrantyCardModal warranty={warranty} onClose={vi.fn()} />
        </Harness>
      );
    });
  };

  const button = (label: string) =>
    [...document.querySelectorAll('label, button')].find(
      (element) => element.textContent?.trim() === label
    ) as HTMLElement | undefined;

  it('prints on A5 first, then on this computer’s receipt roll', async () => {
    await render(WARRANTY);
    await vi.waitFor(() => expect(card).toHaveBeenCalledWith('wty_1', 'a5', undefined));
    await vi.waitFor(() =>
      expect(document.querySelector('[data-testid="viewer"]')?.textContent).toBe('shown')
    );
    expect(document.body.textContent).toContain('Warranty card — WTY-000001');
    expect(document.body.textContent).toContain('Galaxy A55 · 356789012345678');

    const roll = button('Receipt roll');
    expect(roll).toBeDefined();
    await act(async () => roll?.click());
    await vi.waitFor(() => expect(card).toHaveBeenCalledWith('wty_1', 'thermal-58', undefined));
  });

  it('asks again after the warranty changed', async () => {
    await render(WARRANTY, '80mm');
    await vi.waitFor(() => expect(card).toHaveBeenCalledTimes(1));
    await render({ ...WARRANTY, version: 2 }, '80mm');
    await vi.waitFor(() => expect(card).toHaveBeenCalledTimes(2));
  });
});
