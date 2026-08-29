import { describe, it, expect } from 'vitest';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { buildSearchIndex, tokenizeQuery, searchIndex } from '@/shared/lib/search';
import type { Product } from '@/features/inventory/types';

const p = (over: Partial<Product>): Product => ({
  id: 'p1',
  key: 'prod_1',
  name: 'MagSafe Clear Case iPhone 15',
  sku: 'SMA-PHO-0001',
  barcode: '880123456704',
  category: 'Smartphones & Accessories',
  categoryKey: 'cat_1',
  subcategory: 'Cases',
  subcategoryKey: 'sub_1',
  costPriceCents: 1000,
  sellingPriceCents: 1750,
  stockQuantity: 9,
  minStockThreshold: 2,
  isSerialized: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
});

const search = (products: Product[], query: string): Product[] =>
  searchIndex(buildSearchIndex(products, PRODUCT_SEARCH_FIELDS), tokenizeQuery(query), null);

describe('catalog barcode search', () => {
  const products = [
    p({}),
    p({ id: 'p2', key: 'prod_2', name: 'USB-C Cable', sku: 'CAB-1', barcode: '4006381333931' }),
  ];

  it('finds a product by its exact barcode', () => {
    const results = search(products, '880123456704');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p1');
  });

  it('finds a product when the barcode is typed with spaces or hyphens', () => {
    expect(search(products, '880 1234 56704')[0]?.id).toBe('p1');
    expect(search(products, '880-123-456-704')[0]?.id).toBe('p1');
  });

  it('does not match an unrelated barcode', () => {
    expect(search(products, '999999999999')).toHaveLength(0);
  });
});
