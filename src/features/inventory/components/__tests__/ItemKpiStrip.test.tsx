/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ItemKpiStrip } from '../ItemKpiStrip';
import type { PriceTier, Product } from '../../types';

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

const tier = (price: number, cost: number): PriceTier => ({
  sellingPriceCents: price,
  quantity: 10,
  minUnitCostCents: cost,
  maxUnitCostCents: cost,
  oldestReceivedAt: '2026-10-01T00:00:00Z',
});

const product = (tiers: PriceTier[], stock = 20): Product =>
  ({
    id: 'p1',
    key: 'prod_a',
    name: 'Item A',
    priceTiers: tiers,
    stockQuantity: stock,
    minStockThreshold: 8,
  }) as Product;

describe('ItemKpiStrip', () => {
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

  const show = async (role: string, item: Product) => {
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
              <ItemKpiStrip product={item} />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
    return container.textContent ?? '';
  };

  it('spells a price range out as lowest and highest', async () => {
    const text = await show('admin', product([tier(4_000, 3_000), tier(4_800, 2_500)]));
    // Selling 40 to 48, cost 25 to 30, profit 10 to 23: each range shows both ends, labelled.
    expect(text.match(/Lowest/g)).toHaveLength(3);
    expect(text.match(/Highest/g)).toHaveLength(3);
    for (const figure of ['Rs. 40.00', 'Rs. 48.00', 'Rs. 25.00', 'Rs. 30.00']) {
      expect(text).toContain(figure);
    }
    expect(text).toContain('20 units');
  });

  it('shows a single price once, per unit', async () => {
    const text = await show('admin', product([tier(4_800, 2_500)]));
    expect(text).toContain('Rs. 48.00');
    expect(text).toContain('per unit');
    expect(text).not.toContain('Lowest');
    expect(text).not.toContain('Highest');
  });

  it('keeps cost and profit from staff', async () => {
    const text = await show('staff', product([tier(4_800, 2_500)]));
    expect(text).toContain('Selling');
    expect(text).not.toContain('Cost');
    expect(text).not.toContain('Profit per unit');
  });

  it('says so when nothing is in stock', async () => {
    const text = await show('admin', product([], 0));
    expect(text).toContain('0 units');
    expect(text).toContain('No stock');
  });
});
