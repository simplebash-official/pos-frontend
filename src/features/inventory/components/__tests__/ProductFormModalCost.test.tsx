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
import { ProductFormModal } from '../ProductFormModal';
import type { Product } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../../hooks/useCategories', () => ({
  useValidCategories: () => ({
    data: [{ key: 'cat_1', name: 'Phones', subcategories: [{ key: 'sub_1', name: 'Screens' }] }],
  }),
}));
vi.mock('@/features/suppliers/hooks/useSuppliers', () => ({
  useAllSuppliers: () => ({ data: [] }),
}));
vi.mock('@/shared/components/calculator', () => ({
  useGlobalCalculator: () => ({ openCalculator: () => undefined }),
}));

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
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const product = {
  id: 'p1',
  key: 'prod_1',
  name: 'Galaxy Screen',
  sku: 'PHO-SCR-0001',
  categoryKey: 'cat_1',
  category: 'Phones',
  subcategoryKey: 'sub_1',
  subcategory: 'Screens',
  priceTiers: [
    {
      sellingPriceCents: 200000,
      quantity: 4,
      minUnitCostCents: 123400,
      maxUnitCostCents: 123400,
      oldestReceivedAt: '2026-01-01T00:00:00Z',
    },
  ],
  stockQuantity: 4,
  minStockThreshold: 1,
  isSerialized: false,
} as Product;

describe('ProductFormModal cost', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onSubmit = vi.fn<(values: unknown) => Promise<void>>();

  beforeEach(() => {
    onSubmit.mockReset();
    onSubmit.mockResolvedValue(undefined);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const edit = async (role: string, productToEdit: Product) => {
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
              <ProductFormModal
                opened
                onClose={() => undefined}
                onSubmit={onSubmit}
                productToEdit={productToEdit}
              />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
    const form = document.body.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  // Prices and costs belong to each delivery (stock batch), changed in the
  // product drawer — editing the product itself never touches them.
  it.each(['manager', 'admin'])('edits a product without any price for a %s', async (role) => {
    await edit(role, product);
    expect(document.body.textContent).not.toContain('Cost Price');
    expect(document.body.textContent).not.toContain('Selling Price');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const sent = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect('costPriceCents' in sent).toBe(false);
    expect('sellingPriceCents' in sent).toBe(false);
  });
});
