import type { ProductListParams } from '@/features/inventory/api/productsApi';

/**
 * Sort methods offered on the billing catalog. The ids are what the backend
 * stores per login (`preferences.billingCatalogSort`) and validates against
 * `CATALOG_SORT_IDS` in `backend/src/domain/users.rs` — keep the two in sync.
 * The server does the ordering via the products list's `sortBy`/`sortOrder`.
 */
export const CATALOG_SORTS = [
  { id: 'name_asc', label: 'Name A-Z', sortBy: 'name', sortOrder: 'asc' },
  { id: 'name_desc', label: 'Name Z-A', sortBy: 'name', sortOrder: 'desc' },
  { id: 'price_asc', label: 'Price: low to high', sortBy: 'sellingPriceCents', sortOrder: 'asc' },
  { id: 'price_desc', label: 'Price: high to low', sortBy: 'sellingPriceCents', sortOrder: 'desc' },
  { id: 'newest', label: 'Newest added', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'recent', label: 'Recently updated', sortBy: 'updatedAt', sortOrder: 'desc' },
  { id: 'stock_desc', label: 'Most in stock', sortBy: 'stockQuantity', sortOrder: 'desc' },
  { id: 'stock_asc', label: 'Lowest stock', sortBy: 'stockQuantity', sortOrder: 'asc' },
  { id: 'sku_asc', label: 'SKU', sortBy: 'sku', sortOrder: 'asc' },
] as const;

export type CatalogSortId = (typeof CATALOG_SORTS)[number]['id'];

/** What the list shows until a login picks something else; also the server's default order. */
export const DEFAULT_CATALOG_SORT: CatalogSortId = 'name_asc';

export const isCatalogSort = (value: unknown): value is CatalogSortId =>
  typeof value === 'string' && CATALOG_SORTS.some((s) => s.id === value);

/** `sortBy`/`sortOrder` for a preset; empty for the default so it shares the plain products cache. */
export const catalogSortParams = (
  id: CatalogSortId
): Pick<ProductListParams, 'sortBy' | 'sortOrder'> => {
  if (id === DEFAULT_CATALOG_SORT) return {};
  const preset = CATALOG_SORTS.find((s) => s.id === id);
  return preset ? { sortBy: preset.sortBy, sortOrder: preset.sortOrder } : {};
};
