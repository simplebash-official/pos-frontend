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
import type { Product, UpdateProductInput } from '../../types';

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
  sellingPriceCents: 200000,
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

  it('does not offer the cost, or send one back, when a manager edits a product', async () => {
    await edit('manager', product);
    expect(document.body.textContent).not.toContain('Cost Price');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const sent = onSubmit.mock.calls[0][0] as UpdateProductInput;
    expect('costPriceCents' in sent).toBe(false);
    expect(sent.sellingPriceCents).toBe(200000);
  });

  it('shows the cost and sends it when an admin edits a product', async () => {
    await edit('admin', { ...product, costPriceCents: 123400 });
    expect(document.body.textContent).toContain('Cost Price');
    const sent = onSubmit.mock.calls[0][0] as UpdateProductInput;
    expect(sent.costPriceCents).toBe(123400);
  });
});
