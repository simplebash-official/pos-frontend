/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { MotionGlobalConfig } from 'framer-motion';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import settingsReducer, { setLabelPrintSettings } from '@/store/slices/settingsSlice';
import type { Product } from '@/features/inventory/types';
import { LabelPrintModal } from '../components/LabelPrintModal';
import { newRow, type LabelRow } from '../lib/printJob';
import type { LabelPrintSettings, LabelTemplate } from '../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// Rows leave with a short exit animation; finish it at once so a removed row is gone straight away.
MotionGlobalConfig.skipAnimations = true;
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}

const priceTag: LabelTemplate = {
  key: 'starter_price_tag_50x30',
  name: 'Price tag 50 x 30 mm',
  widthMm: 50,
  heightMm: 30,
  builtIn: true,
  elements: [
    {
      id: 'bc',
      type: 'barcode',
      xMm: 1,
      yMm: 1,
      widthMm: 46,
      heightMm: 12,
      showValue: true,
      fontSizePt: 6,
    },
    {
      id: 'price',
      type: 'text',
      source: 'price',
      customText: null,
      xMm: 1,
      yMm: 20,
      widthMm: 30,
      heightMm: 5,
      fontSizePt: 8,
      bold: false,
      align: 'left',
    },
  ],
};
const barcodeOnly: LabelTemplate = {
  ...priceTag,
  key: 'ltpl_barcode_only',
  name: 'Barcode only',
  builtIn: false,
  elements: [priceTag.elements[0]],
};

const mockTemplates = [priceTag, barcodeOnly];
const mockSerials: Record<string, { serialNumber: string }[]> = {
  prod_phone: [{ serialNumber: '356938000000011' }, { serialNumber: '356938000000012' }],
};
const mockGenerate = vi.fn();
const mockRender = vi.fn();
const mockCreateJob = vi.fn();
const mockReport = vi.fn();
const mockPreview = vi.fn();
const mockPrint = vi.fn();
const mockDownload = vi.fn();
const mockSearch = vi.fn();

vi.mock('../hooks/useLabelTemplates', () => ({
  useLabelTemplates: () => ({ data: mockTemplates, isLoading: false, isError: false }),
}));
vi.mock('@/features/inventory/hooks/useProductSerials', () => ({
  useProductSerials: (key: string) => ({
    data: mockSerials[key] ?? [],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useGenerateProductBarcode: () => ({ mutateAsync: (...args: unknown[]) => mockGenerate(...args) }),
}));
vi.mock('@/features/inventory/api/productsApi', () => ({
  fetchProducts: (...args: unknown[]) => mockSearch(...args),
}));
vi.mock('../api/labelsApi', () => ({
  renderLabels: (...args: unknown[]) => mockRender(...args),
  createLabelJob: (...args: unknown[]) => mockCreateJob(...args),
  reportLabelJob: (...args: unknown[]) => mockReport(...args),
  previewLabel: (...args: unknown[]) => mockPreview(...args),
}));
vi.mock('@/shared/print/printService', () => ({
  printLabelPdf: (...args: unknown[]) => mockPrint(...args),
}));
vi.mock('@/shared/print/pdfFileName', () => ({
  pdfFileName: (kind: string) => `${kind}-20261016-090000`,
  downloadPdfBlob: (...args: unknown[]) => mockDownload(...args),
}));
vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: ({ blob }: { blob: Blob | null }) => (blob ? 'preview ready' : 'preview empty'),
}));

const product = (over: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    key: 'prod_cable',
    name: 'USB-C Cable',
    sku: 'CAB-USB-0001',
    barcode: '2000000000015',
    category: 'Cables',
    categoryKey: 'c',
    subcategory: 'USB',
    subcategoryKey: 's',
    priceTiers: [
      { sellingPriceCents: 175000, quantity: 5, oldestReceivedAt: '2026-10-10T00:00:00Z' },
      { sellingPriceCents: 150000, quantity: 7, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 12,
    minStockThreshold: 1,
    isSerialized: false,
    ...over,
  }) as Product;

const caseProduct = () =>
  product({
    id: 'p2',
    key: 'prod_case',
    name: 'Phone Case',
    priceTiers: [
      { sellingPriceCents: 90000, quantity: 3, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 3,
  });

const systemSettings: LabelPrintSettings = {
  method: 'system',
  templateKey: priceTag.key,
  dpi: 203,
};

const rowsOf = (...products: Product[]): LabelRow[] => products.map((p) => newRow(p, 1));

describe('LabelPrintModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockRender.mockResolvedValue(new Blob(['%PDF-1.7']));
    mockCreateJob.mockResolvedValue({ jobKey: 'lpj_1', pdf: new Blob(['%PDF-1.7']) });
    mockReport.mockResolvedValue(undefined);
    mockPreview.mockResolvedValue(new Blob(['%PDF-1.7']));
    mockPrint.mockResolvedValue(undefined);
    mockSearch.mockResolvedValue({ items: [] });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const open = async (
    rows: LabelRow[],
    options: { settings?: LabelPrintSettings | null; permissions?: string[] } = {}
  ) => {
    const { settings = systemSettings, permissions = ['inventory:write'] } = options;
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u', name: 'T', username: 't', role: 'manager', permissions } }),
        settings: settingsReducer,
      },
    });
    if (settings !== null) store.dispatch(setLabelPrintSettings(settings));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>
                <LabelPrintModal opened onClose={onClose} rows={rows} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
    return store;
  };

  const settle = async () => {
    for (let i = 0; i < 3; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label
    ) as HTMLButtonElement | undefined;
  const printButton = () =>
    document.body.querySelector<HTMLButtonElement>('[data-log-id="labels.print"]')!;
  const click = async (element: HTMLElement) => {
    await act(async () => {
      element.click();
    });
    await settle();
  };
  const setValue = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const copiesInputs = () =>
    Array.from(
      document.body.querySelectorAll<HTMLInputElement>('input[aria-label="Labels to print"]')
    );

  it('asks how labels should print the first time, and offers no print until then', async () => {
    await open(rowsOf(product()), { settings: null });
    expect(text()).toContain('How labels print on this computer');
    expect(button('Save and continue')?.disabled).toBe(true);
    expect(printButton().disabled).toBe(true);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('shows the chosen design and a preview of one of each label (not recorded)', async () => {
    await open(rowsOf(product()));
    expect(text()).toContain('Price tag 50 x 30 mm');
    expect(text()).toContain('USB-C Cable');
    expect(text()).toContain('1 label');
    expect(text()).not.toContain('1 labels');
    expect(mockRender).toHaveBeenCalledWith({
      templateKey: priceTag.key,
      items: [{ kind: 'product', productKey: 'prod_cable', copies: 1, priceCents: 150000 }],
    });
    expect(mockCreateJob).not.toHaveBeenCalled();
    expect(text()).toContain('preview ready');
  });

  it('records the print, sends it to the printer, reports it sent and closes', async () => {
    await open(rowsOf(product(), caseProduct()));
    await setValue(copiesInputs()[0], '3');
    expect(text()).toContain('4 labels');

    await click(printButton());

    expect(mockCreateJob).toHaveBeenCalledWith({
      templateKey: priceTag.key,
      items: [
        { kind: 'product', productKey: 'prod_cable', copies: 3, priceCents: 150000 },
        { kind: 'product', productKey: 'prod_case', copies: 1, priceCents: 90000 },
      ],
      action: 'print',
      method: 'system',
      printerName: null,
      dpi: 203,
    });
    expect(mockPrint).toHaveBeenCalledWith(
      expect.any(Blob),
      systemSettings,
      'labels-20261016-090000'
    );
    expect(mockReport).toHaveBeenCalledWith('lpj_1', 'sent', null);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('names the printer of a direct print', async () => {
    const direct: LabelPrintSettings = {
      method: 'direct',
      printerName: 'Zebra ZD220',
      templateKey: priceTag.key,
      dpi: 300,
    };
    await open(rowsOf(product()), { settings: direct });
    await click(printButton());
    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'print',
        method: 'direct',
        printerName: 'Zebra ZD220',
        dpi: 300,
      })
    );
  });

  it('records a download without a printer and keeps the window open', async () => {
    await open(rowsOf(product()));
    await click(button('Download PDF')!);
    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'download', method: null, printerName: null, dpi: null })
    );
    expect(mockDownload).toHaveBeenCalledWith(expect.any(Blob), 'labels-20261016-090000');
    expect(mockPrint).not.toHaveBeenCalled();
    expect(mockReport).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('reports a failed print with its reason and keeps the window open', async () => {
    mockPrint.mockRejectedValueOnce(new Error('Printer is offline'));
    await open(rowsOf(product()));
    await click(printButton());
    expect(mockReport).toHaveBeenCalledWith('lpj_1', 'failed', 'Printer is offline');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('prints with Enter on a computer', async () => {
    await open(rowsOf(product()));
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    await settle();
    expect(mockCreateJob).toHaveBeenCalledWith(expect.objectContaining({ action: 'print' }));
  });

  it('prints a test label with a sample, without recording it', async () => {
    await open(rowsOf(product()));
    await click(button('Print a test label')!);
    expect(mockPreview).toHaveBeenCalledWith(
      {
        name: priceTag.name,
        widthMm: priceTag.widthMm,
        heightMm: priceTag.heightMm,
        elements: priceTag.elements,
      },
      expect.objectContaining({ code: expect.any(String) })
    );
    expect(mockPrint).toHaveBeenCalledWith(
      expect.any(Blob),
      systemSettings,
      'label-test-20261016-090000'
    );
    expect(mockCreateJob).not.toHaveBeenCalled();
  });

  it('sets every item to match its stock, to one each, or to a number', async () => {
    await open(rowsOf(product(), caseProduct()));
    await click(button('Match stock')!);
    // The cable prints at its default price, which has 7 in stock; the case has 3.
    expect(copiesInputs().map((input) => input.value)).toEqual(['7', '3']);
    expect(text()).toContain('10 labels');

    await setValue(
      document.body.querySelector<HTMLInputElement>('input[aria-label="Labels for every item"]')!,
      '4'
    );
    await click(button('Set all')!);
    expect(copiesInputs().map((input) => input.value)).toEqual(['4', '4']);

    await click(button('1 each')!);
    expect(copiesInputs().map((input) => input.value)).toEqual(['1', '1']);
  });

  it('removes an item from the print', async () => {
    await open(rowsOf(product(), caseProduct()));
    const [removeCable] = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>(
        'button[aria-label="Remove from this print"]'
      )
    );
    await click(removeCable);
    expect(text()).not.toContain('USB-C Cable');
    expect(text()).toContain('Phone Case');
  });

  it('says what to do when nothing is left to print', async () => {
    await open([]);
    expect(text()).toContain('Nothing to print yet. Add an item above.');
    expect(printButton().disabled).toBe(true);
  });

  it('adds an item found by searching', async () => {
    mockSearch.mockResolvedValue({ items: [product(), caseProduct()] });
    await open(rowsOf(product()));
    const search = document.body.querySelector<HTMLInputElement>(
      'input[aria-label="Add an item to this print"]'
    )!;
    await act(async () => {
      search.focus();
      search.click();
    });
    // Only this search box's own list (the price pickers have options too).
    const searchOptions = () =>
      Array.from(
        document
          .getElementById(search.getAttribute('aria-controls')!)
          ?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
      );
    await setValue(search, 'case');
    await vi.waitFor(
      () => {
        expect(mockSearch).toHaveBeenCalledWith({ search: 'case', limit: 10 });
        // Items already in the print are not offered again.
        expect(searchOptions().map((o) => o.textContent)).toEqual(['Phone Case · CAB-USB-0001']);
      },
      { timeout: 2000 }
    );
    await click(searchOptions()[0]);
    expect(copiesInputs()).toHaveLength(2);
    expect(text()).toContain('Phone Case');
  });

  it('lets the person pick which price goes on the label when there are several', async () => {
    await open(rowsOf(product()));
    expect(text()).toContain('Price on the label');
    expect(text()).toContain('Rs. 1,500.00');
  });

  it('does not ask for a price when the design has none', async () => {
    await open(rowsOf(product()), {
      settings: { ...systemSettings, templateKey: barcodeOnly.key },
    });
    expect(text()).not.toContain('Price on the label');
    expect(mockRender).toHaveBeenCalledWith({
      templateKey: barcodeOnly.key,
      items: [{ kind: 'product', productKey: 'prod_cable', copies: 1, priceCents: 150000 }],
    });
  });

  it('blocks an out-of-stock item and suggests a design without a price', async () => {
    const store = await open(rowsOf(product({ priceTiers: [], stockQuantity: 0 })));
    expect(text()).toContain('Out of stock, so there is no price to print.');
    expect(printButton().disabled).toBe(true);
    expect(mockRender).not.toHaveBeenCalled();
    expect(text()).toContain('This design has no price:');
    expect(text()).toContain('Barcode only');

    await click(button('Use this design')!);
    expect(store.getState().settings.labelPrint).toEqual({
      ...systemSettings,
      templateKey: barcodeOnly.key,
    });
    expect(printButton().disabled).toBe(false);
  });

  describe('items without a barcode', () => {
    const noBarcode = () => product({ barcode: null });

    it('lets someone who can edit stock create the barcodes, then prints', async () => {
      mockGenerate.mockResolvedValue(product({ barcode: '2000000000022' }));
      await open(rowsOf(noBarcode()));
      expect(text()).toContain('1 item has no barcode yet');
      expect(printButton().disabled).toBe(true);

      await click(button('Create barcodes')!);

      expect(mockGenerate).toHaveBeenCalledWith('p1');
      expect(text()).not.toContain('no barcode yet');
      expect(printButton().disabled).toBe(false);
    });

    it('tells everyone else to ask a manager', async () => {
      await open(rowsOf(noBarcode()), { permissions: [] });
      expect(text()).toContain('Ask a manager to create their barcodes.');
      expect(button('Create barcodes')).toBeUndefined();
    });

    it('stops and says so when a barcode cannot be created', async () => {
      mockGenerate.mockRejectedValue({ message: 'Server unavailable', statusCode: 500 });
      await open(rowsOf(noBarcode()));
      await click(button('Create barcodes')!);
      expect(text()).toContain('no barcode yet');
      expect(printButton().disabled).toBe(true);
    });
  });

  describe('items tracked by serial number', () => {
    const phone = () =>
      product({ id: 'p3', key: 'prod_phone', name: 'Phone', isSerialized: true, barcode: null });

    it('chooses every unit in stock, then prints one serial label group per unit', async () => {
      await open(rowsOf(phone()));
      expect(text()).toContain('2 / 2 chosen');
      expect(text()).toContain('2 labels');
      // No barcode is needed for a serial product, so nothing offers to create one.
      expect(text()).not.toContain('have no barcode yet');
      // The preview is drawn once the selection has settled.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
      });
      expect(mockRender).toHaveBeenCalledWith({
        templateKey: priceTag.key,
        items: [
          { kind: 'serial', serialNumber: '356938000000011', copies: 1 },
          { kind: 'serial', serialNumber: '356938000000012', copies: 1 },
        ],
      });
    });

    it('needs at least one unit once they are cleared', async () => {
      await open(rowsOf(phone()));
      await click(button('Clear')!);
      expect(text()).toContain('0 / 2 chosen');
      expect(text()).toContain('Choose at least one unit.');
      expect(printButton().disabled).toBe(true);
    });

    it('drops units chosen earlier that have been sold since', async () => {
      await open([{ ...newRow(phone(), 1), serialNumbers: ['356938000000012', 'SOLD-1'] }]);
      expect(text()).toContain('1 / 2 chosen');
    });
  });
});
