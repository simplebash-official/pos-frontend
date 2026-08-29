import { describe, it, expect } from 'vitest';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { buildSearchIndex, tokenizeQuery, searchIndex } from '@/shared/lib/search';
import { Product } from '@/features/inventory/types';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    key: 'prod_key_1',
    name: 'USB-C Fast Charging Cable',
    sku: 'CAB-001',
    barcode: '8901234567890',
    category: 'Cables',
    categoryKey: 'cat_cables',
    subcategory: 'USB',
    subcategoryKey: 'sub_usb',
    sellingPriceCents: 1200,
    costPriceCents: 600,
    stockQuantity: 15,
    minStockThreshold: 5,
    isSerialized: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    key: 'prod_key_2',
    name: 'Wireless Bluetooth Mouse',
    sku: 'MOU-002',
    barcode: '8901234567891',
    category: 'Accessories',
    categoryKey: 'cat_acc',
    subcategory: 'Mice',
    subcategoryKey: 'sub_mice',
    sellingPriceCents: 3500,
    costPriceCents: 2000,
    stockQuantity: 8,
    minStockThreshold: 2,
    isSerialized: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p3',
    key: 'prod_key_3',
    name: 'Mechanical Gaming Keyboard',
    sku: 'KEY-003',
    barcode: '8901234567892',
    category: 'Accessories',
    categoryKey: 'cat_acc',
    subcategory: 'Keyboards',
    subcategoryKey: 'sub_keyboards',
    sellingPriceCents: 8500,
    costPriceCents: 5000,
    stockQuantity: 3,
    minStockThreshold: 2,
    isSerialized: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p4',
    key: 'prod_key_4',
    name: 'HDMI 2.1 Ultra High Speed Cable',
    sku: 'CAB-004',
    barcode: '8901234567893',
    category: 'Cables',
    categoryKey: 'cat_cables',
    subcategory: 'HDMI',
    subcategoryKey: 'sub_hdmi',
    sellingPriceCents: 1800,
    costPriceCents: 900,
    stockQuantity: 0, // Out of stock
    minStockThreshold: 3,
    isSerialized: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const searchProducts = (products: Product[], query: string): Product[] => {
  const index = buildSearchIndex(products, PRODUCT_SEARCH_FIELDS);
  return searchIndex(index, tokenizeQuery(query), null);
};

describe('Catalog Search & Reset Mechanics', () => {
  it('filters catalog products when user enters a search query', () => {
    const results = searchProducts(sampleProducts, 'cable');
    expect(results).toHaveLength(2);
    expect(results.map((p) => p.sku)).toEqual(['CAB-001', 'CAB-004']);
  });

  it('finds item by SKU', () => {
    const results = searchProducts(sampleProducts, 'MOU-002');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Wireless Bluetooth Mouse');
  });

  it('finds item by barcode', () => {
    const results = searchProducts(sampleProducts, '8901234567892');
    expect(results).toHaveLength(1);
    expect(results[0].sku).toBe('KEY-003');
  });

  it('restores all products when search query is cleared back to empty string', () => {
    // 1. User searches for "mouse"
    let query = 'mouse';
    let results = searchProducts(sampleProducts, query);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p2');

    // 2. User adds item to cart -> search is cleared to ""
    query = '';
    results = searchProducts(sampleProducts, query);
    expect(results).toHaveLength(4);
    expect(results.map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('correctly combines category filter with search and restores full category when search clears', () => {
    const cablesCategory = sampleProducts.filter((p) => p.categoryKey === 'cat_cables');
    expect(cablesCategory).toHaveLength(2);

    // Search within Cables
    const searchedInCables = searchProducts(cablesCategory, 'HDMI');
    expect(searchedInCables).toHaveLength(1);
    expect(searchedInCables[0].sku).toBe('CAB-004');

    // Clear search within Cables -> all cables restored
    const resetCables = searchProducts(cablesCategory, '');
    expect(resetCables).toHaveLength(2);
    expect(resetCables.map((p) => p.sku)).toEqual(['CAB-001', 'CAB-004']);
  });

  it('accurately computes remaining stock when items are added to cart and search is cleared', () => {
    const cartItems = [{ productId: 'p1', quantity: 2, sourceType: 'retail' as const }];
    const cartQuantityMap = new Map<string, number>();
    for (const item of cartItems) {
      cartQuantityMap.set(
        item.productId,
        (cartQuantityMap.get(item.productId) ?? 0) + item.quantity
      );
    }

    const computeVisibleProducts = (
      products: Product[],
      selectedCategory: string,
      showInStockOnly: boolean
    ) => {
      return products.filter((p) => {
        const remainingStock = p.stockQuantity - (cartQuantityMap.get(p.id) ?? 0);
        if (showInStockOnly && remainingStock <= 0) return false;
        return selectedCategory === 'all' || p.categoryKey === selectedCategory;
      });
    };

    const visible = computeVisibleProducts(sampleProducts, 'all', false);
    const p1Remaining =
      visible.find((p) => p.id === 'p1')!.stockQuantity - cartQuantityMap.get('p1')!;
    expect(p1Remaining).toBe(13); // 15 - 2

    // Filter by search, add, then clear search
    const filtered = searchProducts(visible, 'Charging');
    expect(filtered).toHaveLength(1);

    const cleared = searchProducts(visible, '');
    expect(cleared).toHaveLength(4);
  });
});
