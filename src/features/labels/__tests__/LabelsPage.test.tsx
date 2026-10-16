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
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import settingsReducer, { setLabelPrintSettings } from '@/store/slices/settingsSlice';
import type { Product } from '@/features/inventory/types';
import { LabelsPage } from '../components/LabelsPage';
import { LabelPrintOfferHost } from '../components/LabelPrintOfferHost';
import { offerLabelPrint } from '../lib/labelPrintOffer';
import type { LabelCoverage, LabelJob, LabelJobList, LabelTemplate } from '../types';

installDrawerTestEnv();

const priceTag: LabelTemplate = {
  key: 'starter_price_tag_50x30',
  name: 'Price tag 50 x 30 mm',
  widthMm: 50,
  heightMm: 30,
  builtIn: true,
  elements: [{ id: 'q', type: 'qr', xMm: 1, yMm: 1, widthMm: 10, heightMm: 10 }],
};

const product = (over: Partial<Product>): Product =>
  ({
    id: 'p1',
    key: 'prod_cable',
    name: 'USB-C Cable',
    sku: 'CAB-0001',
    barcode: '2000000000015',
    category: 'Cables',
    categoryKey: 'c',
    subcategory: 'USB',
    subcategoryKey: 's',
    priceTiers: [
      { sellingPriceCents: 150000, quantity: 9, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 9,
    minStockThreshold: 1,
    isSerialized: false,
    ...over,
  }) as Product;
const cable = product({});
const charger = product({
  id: 'p2',
  key: 'prod_charger',
  name: 'Fast Charger',
  priceTiers: [{ sellingPriceCents: 90000, quantity: 6, oldestReceivedAt: '2026-10-01T00:00:00Z' }],
  stockQuantity: 6,
});

const coverage: LabelCoverage = {
  items: [
    {
      product: cable,
      status: 'never',
      lastLabelledAt: null,
      lastLabelledCopies: null,
      receivedSinceLabel: 0,
    },
    {
      product: charger,
      status: 'needed',
      lastLabelledAt: '2026-10-10T08:00:00Z',
      lastLabelledCopies: 2,
      receivedSinceLabel: 4,
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  counts: { never: 1, needed: 1, labelled: 5 },
};

const job: LabelJob = {
  key: 'lpj_1',
  templateKey: priceTag.key,
  templateName: priceTag.name,
  widthMm: 50,
  heightMm: 30,
  action: 'print',
  method: 'direct',
  printerName: 'Zebra ZD220',
  dpi: 203,
  outcome: 'failed',
  error: 'Printer is offline',
  printedByUserId: 'u1',
  printedByName: 'Nimal',
  items: [
    {
      productKey: 'prod_charger',
      productName: 'Fast Charger',
      sku: 'CHG-1',
      serialNumber: null,
      priceCents: 90000,
      copies: 3,
    },
  ],
  totalLabels: 3,
  createdAt: '2026-10-14T09:30:00Z',
  updatedAt: '2026-10-14T09:30:00Z',
};
const jobs: LabelJobList = {
  items: [job],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const mockCoverage = vi.fn();
const mockJobs = vi.fn();

vi.mock('../hooks/useLabelTemplates', () => ({
  useLabelTemplates: () => ({ data: [priceTag], isLoading: false, isError: false }),
  useDeleteLabelTemplate: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock('../api/labelsApi', () => ({
  fetchLabelCoverage: (...args: unknown[]) => mockCoverage(...args),
  fetchLabelJobs: (...args: unknown[]) => mockJobs(...args),
  renderLabels: () => Promise.resolve(new Blob(['%PDF'])),
  createLabelJob: vi.fn(),
  reportLabelJob: vi.fn(),
  previewLabel: vi.fn(),
}));
vi.mock('@/features/inventory/api/productsApi', () => ({
  fetchProducts: () => Promise.resolve({ items: [] }),
}));
vi.mock('@/features/inventory/hooks/useProductSerials', () => ({
  useProductSerials: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useGenerateProductBarcode: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@/shared/print/printService', () => ({ printLabelPdf: vi.fn() }));
vi.mock('@/shared/print/pdfFileName', () => ({
  pdfFileName: () => 'labels',
  downloadPdfBlob: vi.fn(),
}));
vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: () => 'preview',
}));

describe('LabelsPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockCoverage.mockResolvedValue(coverage);
    mockJobs.mockResolvedValue(jobs);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const render = async (node: React.ReactNode, permissions = ['inventory:write']) => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u', name: 'T', username: 't', role: 'manager', permissions } }),
        settings: settingsReducer,
      },
    });
    store.dispatch(
      setLabelPrintSettings({ method: 'system', templateKey: priceTag.key, dpi: 203 })
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>{node}</LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };

  const settle = async () => {
    for (let i = 0; i < 4; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().startsWith(label)
    ) as HTMLButtonElement | undefined;
  const tab = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) =>
      t.textContent?.includes(label)
    )!;
  const click = async (element: HTMLElement) => {
    await act(async () => {
      element.click();
    });
    await settle();
  };
  const copies = () =>
    Array.from(
      document.body.querySelectorAll<HTMLInputElement>('input[aria-label="Labels to print"]')
    ).map((input) => input.value);

  it('counts the items that need labels on its tab and opens on an empty print', async () => {
    await render(<LabelsPage />);
    expect(tab('Needs labels').textContent).toContain('2');
    expect(text()).toContain('Last print');
    expect(text()).toContain('Nothing to print yet. Add an item above.');
  });

  it('prints the chosen items that need labels, with labels for their new stock', async () => {
    await render(<LabelsPage />);
    await click(tab('Needs labels'));
    expect(mockCoverage).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: 'never',
      search: undefined,
    });
    await vi.waitFor(() => expect(text()).toContain('4 new since the last label'));
    expect(text()).toContain('Never labelled');

    for (const name of ['USB-C Cable', 'Fast Charger']) {
      const checkbox = document.body.querySelector<HTMLInputElement>(
        `input[aria-label="${name}"]`
      )!;
      await click(checkbox);
    }
    expect(text()).toContain('2 chosen');
    await click(button('Print labels')!);

    // Back on the print tab: all of the never-labelled cable, only the charger's new units.
    expect(tab('Print').getAttribute('aria-selected')).toBe('true');
    expect(copies()).toEqual(['9', '4']);
  });

  it('shows each print with how it went, and prints one again with today’s details', async () => {
    await render(<LabelsPage />);
    await click(tab('History'));
    await vi.waitFor(() => expect(text()).toContain('Fast Charger'));
    expect(text()).toContain('Nimal');
    expect(text()).toContain('Zebra ZD220 · 203 dpi');
    expect(text()).toContain('Did not print');

    await click(document.body.querySelector<HTMLElement>('[aria-label^="Open this print"]')!);
    await vi.waitFor(() => expect(text()).toContain('Printer is offline'));

    mockCoverage.mockResolvedValue({ ...coverage, items: [coverage.items[1]] });
    const again = Array.from(document.body.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Print again')
    );
    await click(again[again.length - 1] as HTMLButtonElement);
    expect(mockCoverage).toHaveBeenLastCalledWith({
      page: 1,
      limit: 1,
      productKeys: ['prod_charger'],
    });
    await vi.waitFor(() => expect(tab('Print').getAttribute('aria-selected')).toBe('true'));
    expect(copies()).toEqual(['3']);
  });
});

describe('LabelPrintOfferHost', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoverage.mockResolvedValue({ ...coverage, items: [coverage.items[1]] });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const mount = async (permissions: string[]) => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u', name: 'T', username: 't', role: 'manager', permissions } }),
        settings: settingsReducer,
      },
    });
    store.dispatch(
      setLabelPrintSettings({ method: 'system', templateKey: priceTag.key, dpi: 203 })
    );
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <LayoutTierProvider>
                <LabelPrintOfferHost />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
  };
  const settle = async () => {
    for (let i = 0; i < 4; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  };
  const text = () => document.body.textContent ?? '';

  it('asks to print labels for stock that just came in, then opens the print window', async () => {
    await mount(['inventory:write']);
    await act(async () => {
      offerLabelPrint({
        productKey: 'prod_charger',
        copies: 5,
        priceCents: 90000,
        serialNumbers: null,
      });
    });
    await settle();
    expect(mockCoverage).toHaveBeenCalledWith({ page: 1, limit: 1, productKeys: ['prod_charger'] });
    await vi.waitFor(() => expect(text()).toContain('Print labels for the new stock?'));
    expect(text()).toContain('5 labels for Fast Charger');

    const print = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Print labels'
    )!;
    await act(async () => {
      print.click();
    });
    await settle();
    await vi.waitFor(() =>
      expect(
        document.body.querySelector<HTMLInputElement>('input[aria-label="Labels to print"]')?.value
      ).toBe('5')
    );
    expect(text()).toContain('Print Labels');
  });

  it('offers nothing to someone who may not print labels', async () => {
    await mount([]);
    await act(async () => {
      offerLabelPrint({
        productKey: 'prod_charger',
        copies: 5,
        priceCents: 90000,
        serialNumbers: null,
      });
    });
    await settle();
    expect(mockCoverage).not.toHaveBeenCalled();
    expect(text()).not.toContain('Print labels for the new stock?');
  });
});
