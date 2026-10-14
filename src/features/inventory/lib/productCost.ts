import type { Product } from '../types';

/**
 * What the shop paid for a product, for screens only an Admin can open. The
 * server leaves the cost out for everyone else, so a missing cost here means
 * the screen was reached by someone it was not meant for — fail loudly rather
 * than show a made-up number.
 */
export const adminProductCostCents = (product: Product): number => {
  if (product.costPriceCents === undefined) {
    throw new Error(`The cost of product ${product.key} was not sent; this view is Admin-only.`);
  }
  return product.costPriceCents;
};
