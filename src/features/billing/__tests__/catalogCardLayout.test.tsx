/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/shared/lib/money';
import {
  sellingPriceRange,
  adminCostRange,
  availableTiers,
} from '@/features/inventory/lib/priceTiers';
import type { Product } from '@/features/inventory/types';
import { CARD_HEIGHT } from '../components/CatalogPanel';

describe('Catalog card layout & price formatting', () => {
  const multiPriceProduct: Product = {
    id: 'p_headphones',
    key: 'prod_key_headphones',
    name: 'Bluetooth Neckband Headphones',
    sku: 'SMA-AUD-0001',
    barcode: '8901234567890',
    category: 'Smartphones & Accessories',
    categoryKey: 'cat_smartphones',
    subcategory: 'Audio',
    subcategoryKey: 'sub_audio',
    priceTiers: [
      {
        sellingPriceCents: 2499,
        quantity: 10,
        minUnitCostCents: 900,
        maxUnitCostCents: 900,
        oldestReceivedAt: '2026-01-01T00:00:00Z',
      },
      {
        sellingPriceCents: 605000,
        quantity: 5,
        minUnitCostCents: 362000,
        maxUnitCostCents: 362000,
        oldestReceivedAt: '2026-01-02T00:00:00Z',
      },
    ],
    stockQuantity: 15,
    minStockThreshold: 3,
    isSerialized: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const singlePriceProduct: Product = {
    id: 'p_cable',
    key: 'prod_key_cable',
    name: 'CAT6 RJ45 Patch Cable 5m',
    sku: 'COM-NET-0003',
    barcode: '8901234567891',
    category: 'Computer & Laptop Parts',
    categoryKey: 'cat_comp',
    subcategory: 'Networking',
    subcategoryKey: 'sub_net',
    priceTiers: [
      {
        sellingPriceCents: 1500,
        quantity: 111,
        minUnitCostCents: 1000,
        maxUnitCostCents: 1000,
        oldestReceivedAt: '2026-01-01T00:00:00Z',
      },
    ],
    stockQuantity: 111,
    minStockThreshold: 10,
    isSerialized: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('determines the multi-tier price range accurately for wide character prices', () => {
    const range = sellingPriceRange(multiPriceProduct);
    expect(range).not.toBeNull();
    expect(range?.min).toBe(2499);
    expect(range?.max).toBe(605000);

    expect(formatMoney(range!.min)).toBe('Rs. 24.99');
    expect(formatMoney(range!.max)).toBe('Rs. 6,050.00');
  });

  it('determines the multi-tier cost range accurately for admin view', () => {
    const costRange = adminCostRange(multiPriceProduct);
    expect(costRange).not.toBeNull();
    expect(costRange?.min).toBe(900);
    expect(costRange?.max).toBe(362000);

    expect(formatMoney(costRange!.min)).toBe('Rs. 9.00');
    expect(formatMoney(costRange!.max)).toBe('Rs. 3,620.00');
  });

  it('identifies price choices and available tiers correctly', () => {
    const reservedMap = new Map<number, number>();
    const multiTiers = availableTiers(multiPriceProduct.priceTiers, reservedMap);
    expect(multiTiers.length).toBe(2);
    expect(multiTiers.length > 1).toBe(true); // hasPriceChoice === true

    const singleTiers = availableTiers(singlePriceProduct.priceTiers, reservedMap);
    expect(singleTiers.length).toBe(1);
    expect(singleTiers.length > 1).toBe(false); // hasPriceChoice === false
  });

  it('enforces CARD_HEIGHT = 168 to accommodate multi-price items with wide character prices', () => {
    expect(CARD_HEIGHT).toBe(168);
  });
});
