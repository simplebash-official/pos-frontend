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
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import settingsReducer, { setLabelPrintSettings } from '@/store/slices/settingsSlice';
import type { Product } from '@/features/inventory/types';
import { LabelPrintModal } from '../components/LabelPrintModal';
import type { LabelPrintSettings, LabelTemplate } from '../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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
const mockPrint = vi.fn();
const mockDownload = vi.fn();

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
vi.mock('../api/labelsApi', () => ({
  renderLabels: (...args: unknown[]) => mockRender(...args),
}));
vi.mock('@/shared/print/printService', () => ({
  printLabelPdf: (...args: unknown[]) => mockPrint(...args),
}));
vi.mock('@/shared/print/pdfFileName', () => ({
  pdfFileName: () => 'labels-20261016-090000',
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
      { sellingPriceCents: 150000, quantity: 5, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 10,
    minStockThreshold: 1,
    isSerialized: false,
    ...over,
  }) as Product;

const systemSettings: LabelPrintSettings = {
  method: 'system',
  templateKey: priceTag.key,
  dpi: 203,
};

describe('LabelPrintModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockRender.mockResolvedValue(new Blob(['%PDF-1.7']));
    mockPrint.mockResolvedValue(undefined);
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
    products: Product[],
    options: { settings?: LabelPrintSettings | null; permissions?: string[] } = {}
  ) => {
    const { settings = systemSettings, permissions = [] } = options;
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u', name: 'T', username: 't', role: 'staff', permissions } }),
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
                <LabelPrintModal opened onClose={onClose} products={products} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    // Let the preview query settle.
    await act(async () => {
      await Promise.resolve();
    });
    return store;
  };

  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;
  const setValue = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('asks how labels should print the first time, and offers no print until then', async () => {
    await open([product()], { settings: null });
    expect(text()).toContain('How labels print on this computer');
    expect(button('Save and continue')?.disabled).toBe(true);
    expect(button('Print')?.disabled).toBe(true);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('shows the chosen design and a preview of one of each label', async () => {
    await open([product()]);
    expect(text()).toContain('Price tag 50 x 30 mm');
    expect(text()).toContain('USB-C Cable');
    expect(text()).toContain('1 label');
    expect(text()).not.toContain('1 labels');
    expect(mockRender).toHaveBeenCalledWith({
      templateKey: priceTag.key,
      items: [{ kind: 'product', productKey: 'prod_cable', copies: 1, priceCents: 150000 }],
    });
    expect(text()).toContain('preview ready');
  });

  it('prints every copy through the saved settings and then closes', async () => {
    await open([
      product(),
      product({
        id: 'p2',
        key: 'prod_case',
        name: 'Phone Case',
        priceTiers: [
          { sellingPriceCents: 90000, quantity: 3, oldestReceivedAt: '2026-10-01T00:00:00Z' },
        ],
      }),
    ]);
    const [first] = Array.from(
      document.body.querySelectorAll<HTMLInputElement>('input[aria-label="Labels to print"]')
    );
    await setValue(first, '3');
    expect(text()).toContain('4 labels');

    await act(async () => {
      button('Print')!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRender).toHaveBeenLastCalledWith({
      templateKey: priceTag.key,
      items: [
        { kind: 'product', productKey: 'prod_cable', copies: 3, priceCents: 150000 },
        { kind: 'product', productKey: 'prod_case', copies: 1, priceCents: 90000 },
      ],
    });
    expect(mockPrint).toHaveBeenCalledWith(
      expect.any(Blob),
      systemSettings,
      'labels-20261016-090000'
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('downloads the PDF without closing the window', async () => {
    await open([product()]);
    await act(async () => {
      button('Download PDF')!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockDownload).toHaveBeenCalledWith(expect.any(Blob), 'labels-20261016-090000');
    expect(mockPrint).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps the window open and prints nothing when the print fails', async () => {
    mockPrint.mockRejectedValueOnce(new Error('Printer is offline'));
    await open([product()]);
    await act(async () => {
      button('Print')!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('lets the person pick which price goes on the label when there are several', async () => {
    await open([product()]);
    expect(text()).toContain('Price on the label');
    expect(text()).toContain('Rs. 1,500.00');
  });

  it('does not ask for a price when the design has none', async () => {
    await open([product()], { settings: { ...systemSettings, templateKey: barcodeOnly.key } });
    expect(text()).not.toContain('Price on the label');
    expect(mockRender).toHaveBeenCalledWith({
      templateKey: barcodeOnly.key,
      items: [{ kind: 'product', productKey: 'prod_cable', copies: 1, priceCents: 150000 }],
    });
  });

  it('blocks an out-of-stock item when the design prints a price', async () => {
    await open([product({ priceTiers: [], stockQuantity: 0 })]);
    expect(text()).toContain('Out of stock, so there is no price to print.');
    expect(button('Print')?.disabled).toBe(true);
    expect(mockRender).not.toHaveBeenCalled();
  });

  describe('items without a barcode', () => {
    const noBarcode = () => product({ barcode: null });

    it('lets someone who can edit stock create the barcodes, then prints', async () => {
      mockGenerate.mockResolvedValue(product({ barcode: '2000000000022' }));
      await open([noBarcode()], { permissions: ['inventory:write'] });
      expect(text()).toContain('1 item has no barcode yet');
      expect(button('Print')?.disabled).toBe(true);

      await act(async () => {
        button('Create barcodes')!.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockGenerate).toHaveBeenCalledWith('p1');
      expect(text()).not.toContain('no barcode yet');
      expect(button('Print')?.disabled).toBe(false);
    });

    it('tells everyone else to ask a manager', async () => {
      await open([noBarcode()]);
      expect(text()).toContain('Ask a manager to create their barcodes.');
      expect(button('Create barcodes')).toBeUndefined();
    });

    it('stops and says so when a barcode cannot be created', async () => {
      mockGenerate.mockRejectedValue({ message: 'Server unavailable', statusCode: 500 });
      await open([noBarcode()], { permissions: ['inventory:write'] });
      await act(async () => {
        button('Create barcodes')!.click();
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(text()).toContain('no barcode yet');
      expect(button('Print')?.disabled).toBe(true);
    });
  });

  describe('items tracked by serial number', () => {
    const phone = () =>
      product({ id: 'p3', key: 'prod_phone', name: 'Phone', isSerialized: true, barcode: null });

    it('needs units chosen, then prints one serial label group per unit', async () => {
      await open([phone()]);
      expect(text()).toContain('Choose at least one unit.');
      expect(button('Print')?.disabled).toBe(true);
      // No barcode is needed for a serial product, so nothing offers to create one.
      expect(text()).not.toContain('have no barcode yet');

      await act(async () => {
        button('Select all')!.click();
      });
      expect(text()).toContain('2 / 2 chosen');
      expect(text()).toContain('2 labels');
      expect(mockRender).toHaveBeenCalledWith({
        templateKey: priceTag.key,
        items: [
          { kind: 'serial', serialNumber: '356938000000011', copies: 1 },
          { kind: 'serial', serialNumber: '356938000000012', copies: 1 },
        ],
      });
    });

    it('clears the chosen units', async () => {
      await open([phone()]);
      await act(async () => {
        button('Select all')!.click();
      });
      await act(async () => {
        button('Clear')!.click();
      });
      expect(text()).toContain('0 / 2 chosen');
    });
  });
});
