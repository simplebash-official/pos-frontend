import { describe, it, expect, vi, afterEach } from 'vitest';
import type { PaginatedResponse } from '@/shared/types/common';
import { fetchAllPages } from '@/shared/lib/fetchAllPages';
import * as productsApi from '../../api/productsApi';
import type { Product } from '../../types';
import { fetchAllProducts } from '../useProducts';

const makeProduct = (id: number): Product => ({
  id: `p${id}`,
  key: `prod_${id}`,
  name: `Product ${id}`,
  sku: `SKU-${id}`,
  barcode: `89012345${String(id).padStart(5, '0')}`,
  category: 'Cat',
  categoryKey: 'cat_1',
  subcategory: 'Sub',
  subcategoryKey: 'sub_1',
  costPriceCents: 100,
  sellingPriceCents: 200,
  stockQuantity: 5,
  minStockThreshold: 1,
  isSerialized: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

/**
 * The backend clamps `limit` to 200 regardless of what the client asks for and
 * reports `totalPages` against that clamped size. This fake reproduces that.
 */
const cappedBackend =
  (total: number, cap = 200) =>
  ({ page }: { page: number; limit: number }): Promise<PaginatedResponse<Product>> => {
    const start = (page - 1) * cap;
    const items = Array.from({ length: Math.max(0, Math.min(cap, total - start)) }, (_, i) =>
      makeProduct(start + i + 1)
    );
    return Promise.resolve({
      items,
      total,
      page,
      pageSize: cap,
      totalPages: Math.ceil(total / cap),
    });
  };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('paging the whole product catalog', () => {
  it('collects every page even though the backend caps the page size below the request', async () => {
    // Regression: the old guard bailed after page 1 (200 items) because 200 was
    // fewer than the requested 500, silently dropping ~600 of 802 products.
    const all = await fetchAllPages((page) => cappedBackend(802)({ page, limit: 500 }));

    expect(all).toHaveLength(802);
    // A product that only exists on page 3 is present and barcode-findable.
    expect(all.some((p) => p.id === 'p450')).toBe(true);
    expect(all.find((p) => p.barcode === makeProduct(450).barcode)?.id).toBe('p450');
  });

  it('stops after one request when the catalog fits on a page', async () => {
    const calls: number[] = [];
    const all = await fetchAllPages((page) => {
      calls.push(page);
      return cappedBackend(12)({ page, limit: 200 });
    });
    expect(all).toHaveLength(12);
    expect(calls).toEqual([1]);
  });

  it('fetchAllProducts asks for a page size no larger than the backend cap', async () => {
    const spy = vi
      .spyOn(productsApi, 'fetchProducts')
      .mockImplementation((params) => cappedBackend(5)({ page: params?.page ?? 1, limit: 200 }));

    await fetchAllProducts();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ limit: 200 }));
  });
});
