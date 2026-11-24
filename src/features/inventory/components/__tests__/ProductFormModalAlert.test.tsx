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
  useCategories: () => ({ data: [] }),
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

const baseProduct = {
  id: 'p1',
  key: 'prod_1',
  name: 'Galaxy Screen',
  sku: 'PHO-SCR-0001',
  categoryKey: 'cat_1',
  category: 'Phones',
  subcategoryKey: 'sub_1',
  subcategory: 'Screens',
  priceTiers: [],
  stockQuantity: 4,
  isSerialized: false,
  warranty: { coverage: { kind: 'none' } },
} as unknown as Product;

const withAlert = (minStockThreshold: number | null): Product => ({
  ...baseProduct,
  minStockThreshold,
});

describe('ProductFormModal low-stock alert', () => {
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

  const open = async (productToEdit: Product) => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'admin', permissions: [] },
        }),
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
  };

  const alertInput = () =>
    document.body.querySelector('input[placeholder="No alert"]') as HTMLInputElement;

  const type = async (value: string) => {
    const input = alertInput();
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      setValue?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  const save = async () => {
    const form = document.body.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  const sent = () => onSubmit.mock.calls[0][0] as Record<string, unknown>;

  it('marks the field optional and explains that empty means no alert', async () => {
    await open(withAlert(3));
    const text = document.body.textContent ?? '';
    expect(text).toContain('Low-Stock Alert Threshold (optional)');
    expect(text).toContain('Leave empty for no alert');
    expect(alertInput().required).toBe(false);
  });

  it('shows an empty field and saves null for an item with no alert', async () => {
    await open(withAlert(null));
    expect(alertInput().value).toBe('');
    await save();
    expect(document.body.textContent).not.toContain('Enter a valid threshold');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(sent().minStockThreshold).toBeNull();
  });

  it('keeps the level an item already has', async () => {
    await open(withAlert(3));
    expect(alertInput().value).toBe('3');
    await save();
    expect(sent().minStockThreshold).toBe(3);
  });

  it('saves a level of 0 as 0, not as no alert', async () => {
    await open(withAlert(0));
    await save();
    expect(sent().minStockThreshold).toBe(0);
  });

  it('removes the alert when the field is emptied', async () => {
    await open(withAlert(3));
    await type('');
    await save();
    expect(sent().minStockThreshold).toBeNull();
  });

  it('sets an alert on an item that had none', async () => {
    await open(withAlert(null));
    await type('7');
    await save();
    expect(sent().minStockThreshold).toBe(7);
  });
});
