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
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ItemStockCard } from '../ItemStockCard';
import type { Product, StockBatch } from '../../types';

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

const batch = (overrides: Partial<StockBatch>): StockBatch =>
  ({
    key: 'stb_1',
    productKey: 'prod_a',
    receivedQuantity: 20,
    remainingQuantity: 20,
    sellingPriceCents: 4_000,
    unitCostCents: 3_000,
    receivedAt: '2026-10-15T00:00:00Z',
    source: 'adjustment',
    ...overrides,
  }) as StockBatch;

const batches: StockBatch[] = [
  batch({}),
  batch({
    key: 'stb_2',
    receivedQuantity: 30,
    remainingQuantity: 0,
    sellingPriceCents: 4_800,
    unitCostCents: 2_500,
    receivedAt: '2026-10-13T00:00:00Z',
    source: 'opening',
  }),
];

vi.mock('../../hooks/useProducts', () => ({
  useProductBatches: () => ({ data: batches, isLoading: false }),
  useUpdateStockBatch: () => ({ mutate: () => undefined, isPending: false }),
  useAdjustStock: () => ({ mutate: () => undefined, isPending: false }),
}));

const product = {
  id: 'p1',
  key: 'prod_a',
  name: 'Item A',
  stockQuantity: 20,
  minStockThreshold: 25,
} as Product;

describe('ItemStockCard', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (role: string) => {
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
              <ItemStockCard product={product} onProductChange={() => undefined} />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
  };

  it('shows the stock total, the low-stock line and each delivery with what is left', async () => {
    await open('staff');
    const text = container.textContent ?? '';
    expect(text).toContain('20');
    expect(text).toContain('Min Threshold: 25 units');
    expect(text).toContain('20 left of 20');
    expect(text).toContain('0 left of 30');
    expect(text).toContain('Added by hand');
    expect(text).toContain('Starting stock');
    expect(text).toContain('Rs. 40.00');
    expect(text).toContain('Rs. 48.00');
  });

  it('shows what each delivery cost to an admin only', async () => {
    await open('staff');
    expect(container.textContent).not.toContain('Cost Rs. 30.00');
    act(() => root.unmount());
    root = createRoot(container);
    await open('admin');
    expect(container.textContent).toContain('Cost Rs. 30.00');
    expect(container.textContent).toContain('Cost Rs. 25.00');
  });

  it('offers to take stock out only of a delivery that still has units', async () => {
    await open('staff');
    expect(container.querySelectorAll('button[aria-label="Take stock out"]')).toHaveLength(1);
    expect(container.querySelectorAll('button[aria-label="Change price"]')).toHaveLength(2);
  });
});
