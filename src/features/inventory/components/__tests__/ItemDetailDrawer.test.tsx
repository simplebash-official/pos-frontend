/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ItemDetailDrawer } from '../ItemDetailDrawer';
import type { Product, StockBatch, StockMovement } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no animation frames to speak of; finish animations at once so panels swap straight away.
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

const NO_BATCHES: StockBatch[] = [];
const MOVEMENTS = [
  {
    id: 'm1',
    key: 'm1',
    productId: 'p1',
    quantityDelta: 30,
    type: 'opening_balance',
    createdAt: '2026-10-13T00:00:00Z',
  },
] as StockMovement[];
const NO_ROWS: never[] = [];
const SUPPLIERS = [{ key: 'sup_1', name: 'Colombo Parts', contactPerson: 'Ranjith' }];
const idleMutation = { mutate: () => undefined, isPending: false };

vi.mock('../../hooks/useProducts', () => ({
  useProductBatches: () => ({ data: NO_BATCHES, isLoading: false }),
  useUpdateStockBatch: () => idleMutation,
  useAdjustStock: () => idleMutation,
  useProductMovements: () => ({ data: MOVEMENTS, isLoading: false }),
}));
vi.mock('../../hooks/useCategories', () => ({
  useCategoryIcons: () => null,
  useCategoryLookup: () => ({ getCategory: () => undefined }),
}));
vi.mock('@/features/suppliers/hooks/useSuppliers', () => ({
  useAllSuppliers: () => ({ data: SUPPLIERS }),
}));
vi.mock('@/features/supplier-products/hooks/useSupplierProducts', () => ({
  useSuppliersForProduct: () => ({ data: NO_ROWS, isLoading: false }),
  useLinkProduct: () => idleMutation,
  useUnlinkProduct: () => idleMutation,
}));
vi.mock('@/features/purchases/hooks/usePurchases', () => ({
  usePurchasesByProduct: () => ({ data: NO_ROWS, isLoading: false }),
  useCreatePurchase: () => idleMutation,
}));

const makeProduct = (stockQuantity: number): Product =>
  ({
    id: 'p1',
    key: 'prod_a',
    name: 'Item A',
    sku: 'SKU-A',
    categoryKey: 'cat_1',
    category: 'Cat',
    subcategoryKey: 'sub_1',
    subcategory: 'Sub',
    barcode: '880123456717',
    barcodeSource: 'manual',
    priceTiers: [
      {
        sellingPriceCents: 4_800,
        quantity: stockQuantity,
        minUnitCostCents: 2_500,
        maxUnitCostCents: 2_500,
        oldestReceivedAt: '2026-10-13T00:00:00Z',
      },
    ],
    stockQuantity,
    minStockThreshold: 8,
    isSerialized: false,
    updatedAt: '2026-10-13T00:00:00Z',
  }) as Product;

describe('ItemDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onEdit = vi.fn();
  const onPrintLabel = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onEdit.mockReset();
    onPrintLabel.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (
    role: string,
    product: Product | null = makeProduct(30),
    printLabel: ((product: Product) => void) | null = onPrintLabel
  ) => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u1', name: 'T', username: 't', role, permissions: [] } }),
      },
    });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LayoutTierProvider>
              <ItemDetailDrawer
                product={product}
                onClose={onClose}
                onProductChange={() => undefined}
                onEdit={onEdit}
                onPrintLabel={printLabel}
              />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
  };

  const text = () => document.body.textContent ?? '';
  /** The tab panel changes after a short exit animation, so wait for what it should show. */
  const until = (check: () => void) =>
    act(async () => {
      await vi.waitFor(check, { timeout: 2000 });
    });
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;

  it('shows nothing while no item is chosen', async () => {
    await open('admin', null);
    expect(text()).not.toContain('Item A');
  });

  it('gives an admin cost, profit, the supplier tabs and the supplier delivery action', async () => {
    await open('admin');
    expect(text()).toContain('Item A');
    expect(text()).toContain('Cost');
    expect(text()).toContain('Profit per unit');
    expect(text()).toContain('Suppliers');
    expect(text()).toContain('Intake');
    expect(button('Receive from supplier')).toBeDefined();
  });

  it('keeps cost, supplier tabs and the supplier delivery action from staff', async () => {
    await open('staff');
    expect(text()).toContain('Selling');
    expect(text()).not.toContain('Profit per unit');
    expect(text()).not.toContain('Intake');
    expect(button('Receive from supplier')).toBeUndefined();
    expect(text()).toContain('Opening balance');
  });

  it.each([
    [0, 'Out of stock'],
    [5, 'Low stock'],
    [8, 'Low stock'],
    [9, 'In Stock'],
  ])('shows stock %i as "%s"', async (stock, label) => {
    await open('admin', makeProduct(stock));
    expect(text()).toContain(label);
  });

  it('opens the intake form from "Receive from supplier", disabled until it is filled in', async () => {
    await open('admin');
    expect(text()).not.toContain('Quantity Received');
    await act(async () => button('Receive from supplier')!.click());
    await until(() => expect(text()).toContain('Quantity Received'));
    expect(text()).toContain('Selling Price each');
    expect(button('Record Intake')!.disabled).toBe(true);
    // The toggle button is hidden while the form is open and returns when it closes.
    expect(button('Receive stock')).toBeUndefined();
    // The stock card's own add-stock form also has a (hidden) Cancel; the intake form's is last.
    const cancels = Array.from(document.body.querySelectorAll('button')).filter(
      (b) => b.textContent === 'Cancel'
    );
    await act(async () => cancels[cancels.length - 1].click());
    expect(button('Receive stock')).toBeDefined();
  });

  it('opens the link-supplier form on the Suppliers tab', async () => {
    await open('admin');
    const tab = Array.from(document.body.querySelectorAll('[role="tab"]')).find((el) =>
      el.textContent?.includes('Suppliers')
    ) as HTMLElement;
    await act(async () => tab.click());
    await until(() => expect(text()).toContain('No suppliers linked yet.'));
    await act(async () => button('Link a supplier')!.click());
    expect(button('Link Supplier')!.disabled).toBe(true);
  });

  it('calls back for Edit Item and Close', async () => {
    const product = makeProduct(30);
    await open('admin', product);
    await act(async () => button('Edit Item')!.click());
    expect(onEdit).toHaveBeenCalledWith(product);
    await act(async () => button('Close')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('asks to print a label for the item when the person may print labels', async () => {
    const product = makeProduct(30);
    await open('manager', product);
    await act(async () => button('Print Label')!.click());
    expect(onPrintLabel).toHaveBeenCalledWith(product);
  });

  it('offers no label printing to someone who may not print labels', async () => {
    await open('staff', makeProduct(30), null);
    expect(button('Print Label')).toBeUndefined();
  });
});
