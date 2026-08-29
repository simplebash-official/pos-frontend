import { describe, it, expect, vi } from 'vitest';
import { isValidManualBarcode, looksLikeBarcode, resolveProductByBarcode } from '../barcode';
import type { Product } from '../../types';

const product = (over: Partial<Product>): Product => ({
  id: 'p1',
  key: 'prod_1',
  name: 'Thing',
  sku: 'SKU-1',
  barcode: '8901234567890',
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
  ...over,
});

describe('looksLikeBarcode', () => {
  it('accepts 8–14 digit strings, ignoring separators', () => {
    expect(looksLikeBarcode('89012345')).toBe(true);
    expect(looksLikeBarcode('890 1234 56789')).toBe(true);
    expect(looksLikeBarcode('8901234567890')).toBe(true);
  });

  it('rejects things that are not a barcode', () => {
    expect(looksLikeBarcode('1234')).toBe(false);
    expect(looksLikeBarcode('123456789012345')).toBe(false);
    expect(looksLikeBarcode('SKU-1')).toBe(false);
    expect(looksLikeBarcode('iphone screen')).toBe(false);
  });
});

describe('isValidManualBarcode', () => {
  it('accepts exactly 8–14 digits', () => {
    expect(isValidManualBarcode('12345678')).toBe(true);
    expect(isValidManualBarcode('  4901234567894  ')).toBe(true);
    expect(isValidManualBarcode('12345678901234')).toBe(true);
  });

  it('rejects wrong length, letters, or separators', () => {
    expect(isValidManualBarcode('1234567')).toBe(false);
    expect(isValidManualBarcode('123456789012345')).toBe(false);
    expect(isValidManualBarcode('4901 2345 6789')).toBe(false);
    expect(isValidManualBarcode('ABC12345')).toBe(false);
    expect(isValidManualBarcode('')).toBe(false);
  });
});

describe('resolveProductByBarcode', () => {
  const local = [product({ id: 'p1', key: 'prod_1', barcode: '8901234567890' })];

  it('matches a local product, tolerating spaces/hyphens in the query', async () => {
    const fetchByBarcode = vi.fn();
    const found = await resolveProductByBarcode('890 123-456 7890', local, fetchByBarcode);
    expect(found?.id).toBe('p1');
    expect(fetchByBarcode).not.toHaveBeenCalled();
  });

  it('falls back to the server for a product not in the loaded list', async () => {
    const remote = product({ id: 'p99', key: 'prod_99', barcode: '4006381333931' });
    const fetchByBarcode = vi.fn().mockResolvedValue(remote);
    const found = await resolveProductByBarcode('4006381333931', local, fetchByBarcode);
    expect(found?.id).toBe('p99');
    expect(fetchByBarcode).toHaveBeenCalledWith('4006381333931');
  });

  it('returns null when the server has no match (404)', async () => {
    const fetchByBarcode = vi.fn().mockRejectedValue({ statusCode: 404 });
    const found = await resolveProductByBarcode('9999999999999', local, fetchByBarcode);
    expect(found).toBeNull();
  });
});
