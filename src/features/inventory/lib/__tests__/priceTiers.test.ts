import { describe, it, expect } from 'vitest';
import {
  adminCostRange,
  availableTiers,
  formatCentsRange,
  profitRange,
  sellingPriceRange,
  tiersWithRoom,
} from '../priceTiers';
import type { PriceTier, Product } from '../../types';

const tier = (price: number, quantity: number, cost?: [number, number]): PriceTier => ({
  sellingPriceCents: price,
  quantity,
  minUnitCostCents: cost?.[0],
  maxUnitCostCents: cost?.[1],
  oldestReceivedAt: '2026-10-01T00:00:00Z',
});

const product = (priceTiers: PriceTier[]): Product => ({
  id: 'p1',
  key: 'prod_a',
  name: 'Item A',
  sku: 'SKU-A',
  category: 'Cat',
  categoryKey: 'cat_1',
  subcategory: 'Sub',
  subcategoryKey: 'sub_1',
  priceTiers,
  stockQuantity: priceTiers.reduce((sum, t) => sum + t.quantity, 0),
  minStockThreshold: 1,
  isSerialized: false,
});

describe('price tiers', () => {
  // Item A: 5 left of the Rs.1000/Rs.1200 delivery, 12 of the Rs.1100/Rs.1500 one.
  const itemA = product([
    tier(120_000, 5, [100_000, 100_000]),
    tier(150_000, 12, [110_000, 110_000]),
  ]);

  it('shows one price, a range, or nothing when out of stock', () => {
    expect(sellingPriceRange(itemA)).toEqual({ min: 120_000, max: 150_000 });
    expect(formatCentsRange({ min: 120_000, max: 150_000 })).toBe('Rs. 1,200.00 – Rs. 1,500.00');
    expect(formatCentsRange({ min: 120_000, max: 120_000 })).toBe('Rs. 1,200.00');
    expect(sellingPriceRange(product([]))).toBeNull();
  });

  it('spans every delivery cost for an Admin and refuses to guess one', () => {
    expect(adminCostRange(itemA)).toEqual({ min: 100_000, max: 110_000 });
    expect(adminCostRange(product([]))).toBeNull();
    expect(() => adminCostRange(product([tier(120_000, 1)]))).toThrow(/Admin-only/);
  });

  it('spans the profit of every delivery for an Admin', () => {
    expect(profitRange(itemA)).toEqual({ min: 20_000, max: 40_000 });
    expect(profitRange(product([]))).toBeNull();
  });

  it('subtracts what the sale already holds at each price', () => {
    const left = tiersWithRoom(itemA.priceTiers, new Map([[120_000, 5]]));
    expect(left.map((t) => [t.sellingPriceCents, t.left])).toEqual([
      [120_000, 0],
      [150_000, 12],
    ]);
  });

  it('availableTiers lists only the prices the sale can still take from', () => {
    const both = availableTiers(itemA.priceTiers, new Map());
    expect(both.map((t) => t.sellingPriceCents)).toEqual([120_000, 150_000]);

    const oneLeft = availableTiers(itemA.priceTiers, new Map([[120_000, 5]]));
    expect(oneLeft.map((t) => t.sellingPriceCents)).toEqual([150_000]);

    expect(availableTiers([], new Map())).toEqual([]);
  });
});
