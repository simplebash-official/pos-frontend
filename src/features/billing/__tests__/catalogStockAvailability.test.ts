import { describe, it, expect } from 'vitest';
import cartReducer, {
  addItem,
  completeSaleSuccess,
  startNewSale,
  selectReservedQuantityByProductId,
} from '@/store/slices/cartSlice';
import type { Invoice } from '@/features/billing/types';
import type { Product } from '@/features/inventory/types';

// The reserved-stock selectors only read `completedSale`'s presence, so a stub invoice is enough.
const completedInvoice = { invoiceNumber: 'INV-000006' } as Invoice;

const tripod: Product = {
  id: 'p_tripod',
  key: 'prod_key_tripod',
  name: 'Flexible Mini Tripod Gorilla Pod',
  sku: 'GAM-ACT-0003',
  barcode: '8901234567890',
  category: 'Gaming & Gadgets',
  categoryKey: 'cat_gaming',
  subcategory: 'Action',
  subcategoryKey: 'sub_action',
  sellingPriceCents: 999,
  costPriceCents: 500,
  stockQuantity: 50,
  minStockThreshold: 5,
  isSerialized: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const cartLine = {
  id: 'line-1',
  productId: tripod.id,
  productKey: tripod.key,
  name: tripod.name,
  unitPriceCents: tripod.sellingPriceCents,
  quantity: 3,
  discountCents: 0,
  sourceType: 'retail' as const,
};

// What CatalogPanel renders on a product card, and what its add guard checks.
const remainingStock = (product: Product, reserved: Map<string, number>) =>
  product.stockQuantity - (reserved.get(product.id) ?? 0);

const getInitialState = () => cartReducer(undefined, { type: '@@INIT' });

describe('billing catalog stock availability', () => {
  it('subtracts the open sale from stock so the badge shows what is still addable', () => {
    const state = cartReducer(getInitialState(), addItem(cartLine));
    const reserved = selectReservedQuantityByProductId({ cart: state });

    expect(remainingStock(tripod, reserved)).toBe(47); // 50 - 3 in the cart
  });

  it('shows the plain server figure once the sale is completed', () => {
    let state = cartReducer(getInitialState(), addItem(cartLine));
    state = cartReducer(
      state,
      completeSaleSuccess({ invoice: completedInvoice, changeDueCents: 0 })
    );

    // The sale deducted 3 server-side, so the refetched product now reads 47.
    const soldTripod: Product = { ...tripod, stockQuantity: 47 };
    const reserved = selectReservedQuantityByProductId({ cart: state });

    expect(remainingStock(soldTripod, reserved)).toBe(47); // not 44 — the 3 units are already gone
  });

  it('lets the last remaining units be added again right after a sale', () => {
    let state = cartReducer(getInitialState(), addItem({ ...cartLine, quantity: 3 }));
    state = cartReducer(
      state,
      completeSaleSuccess({ invoice: completedInvoice, changeDueCents: 0 })
    );

    // Stock was 5, the sale took 3, so 2 are genuinely still on the shelf.
    const nearlySoldOut: Product = { ...tripod, stockQuantity: 2 };
    const reserved = selectReservedQuantityByProductId({ cart: state });

    expect(remainingStock(nearlySoldOut, reserved)).toBe(2);
    expect(remainingStock(nearlySoldOut, reserved) > 0).toBe(true); // no false "Out of Stock"
  });

  it('reserves stock again for the next sale', () => {
    let state = cartReducer(getInitialState(), addItem(cartLine));
    state = cartReducer(
      state,
      completeSaleSuccess({ invoice: completedInvoice, changeDueCents: 0 })
    );
    state = cartReducer(state, startNewSale());
    state = cartReducer(state, addItem({ ...cartLine, quantity: 1 }));

    const soldTripod: Product = { ...tripod, stockQuantity: 47 };
    const reserved = selectReservedQuantityByProductId({ cart: state });

    expect(remainingStock(soldTripod, reserved)).toBe(46);
  });
});
