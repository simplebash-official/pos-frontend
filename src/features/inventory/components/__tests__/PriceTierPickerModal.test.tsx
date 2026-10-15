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
import { PriceTierPickerModal } from '../PriceTierPickerModal';
import type { Product } from '../../types';

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

// Item A: 5 left of the Rs.1000/Rs.1200 delivery (received first), 12 of the
// Rs.1100/Rs.1500 one.
const itemA: Product = {
  id: 'p1',
  key: 'prod_a',
  name: 'Item A',
  sku: 'SKU-A',
  categoryKey: 'cat_1',
  category: 'Cat',
  subcategoryKey: 'sub_1',
  subcategory: 'Sub',
  priceTiers: [
    {
      sellingPriceCents: 120_000,
      quantity: 5,
      minUnitCostCents: 100_000,
      maxUnitCostCents: 100_000,
      oldestReceivedAt: '2026-10-01T00:00:00Z',
    },
    {
      sellingPriceCents: 150_000,
      quantity: 12,
      minUnitCostCents: 110_000,
      maxUnitCostCents: 110_000,
      oldestReceivedAt: '2026-10-02T00:00:00Z',
    },
  ],
  stockQuantity: 17,
  minStockThreshold: 1,
  isSerialized: false,
};

describe('PriceTierPickerModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (role: string, reserved: Map<number, number>) => {
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
              <PriceTierPickerModal
                opened
                onClose={() => undefined}
                product={itemA}
                reservedByPrice={reserved}
                onSelect={onSelect}
              />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
  };

  const addButton = () =>
    Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Add to Sale'
    ) as HTMLButtonElement;

  it('shows both prices with what is left and adds the oldest stock by default', async () => {
    await open('staff', new Map());
    const text = document.body.textContent ?? '';
    expect(text).toContain('Rs. 1,200.00');
    expect(text).toContain('5 left');
    expect(text).toContain('Rs. 1,500.00');
    expect(text).toContain('12 left');
    expect(text).not.toContain('Cost');

    await act(async () => addButton().click());
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ sellingPriceCents: 120_000, left: 5 });
    expect(onSelect.mock.calls[0][1]).toBe(1);
  });

  it('skips a price whose units are all in the sale already', async () => {
    await open('staff', new Map([[120_000, 5]]));
    expect(document.body.textContent).toContain('All of these are already in this sale');
    await act(async () => addButton().click());
    expect(onSelect.mock.calls[0][0]).toMatchObject({ sellingPriceCents: 150_000, left: 12 });
    expect(onSelect.mock.calls[0][1]).toBe(1);
  });

  it('shows each price’s cost to an admin', async () => {
    await open('admin', new Map());
    expect(document.body.textContent).toContain('Cost Rs. 1,000.00');
  });
  const button = (label: string) =>
    document.body.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
  const quantityField = () =>
    document.body.querySelector('input[aria-label="Quantity"]') as HTMLInputElement;
  const priceCard = (price: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(price)
    ) as HTMLButtonElement;

  it('adds the chosen number of units and shows the total', async () => {
    await open('staff', new Map());
    expect(document.body.textContent).toContain('Up to 5 at this price');
    await act(async () => button('Increase quantity').click());
    await act(async () => button('Increase quantity').click());
    expect(quantityField().value).toBe('3');
    expect(document.body.textContent).toContain('Rs. 3,600.00');

    await act(async () => addButton().click());
    expect(onSelect.mock.calls[0][0]).toMatchObject({ sellingPriceCents: 120_000 });
    expect(onSelect.mock.calls[0][1]).toBe(3);
  });

  it('stops the quantity at what is left at that price', async () => {
    await open('staff', new Map([[120_000, 2]]));
    // 3 left at Rs. 1,200 after 2 are already in the sale.
    for (let i = 0; i < 6; i++) await act(async () => button('Increase quantity').click());
    expect(quantityField().value).toBe('3');
    expect(button('Increase quantity').disabled).toBe(true);
  });

  it('lowers the quantity when a price with fewer units left is picked', async () => {
    await open('staff', new Map());
    await act(async () => priceCard('Rs. 1,500.00').click());
    for (let i = 0; i < 9; i++) await act(async () => button('Increase quantity').click());
    expect(quantityField().value).toBe('10');
    await act(async () => priceCard('Rs. 1,200.00').click());
    expect(quantityField().value).toBe('5');
  });

  it('cannot add while the quantity is empty', async () => {
    await open('staff', new Map());
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(quantityField(), '');
      quantityField().dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(addButton().disabled).toBe(true);
  });

  it('adds with Enter', async () => {
    await open('staff', new Map());
    await act(async () => button('Increase quantity').click());
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][1]).toBe(2);
  });
});
