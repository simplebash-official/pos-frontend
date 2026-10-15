import type { PriceTier } from '../types';

/** One colour per selling price in stock, cheapest first, shared by the stock bar and the delivery rows. */
const TIER_COLORS = ['blue.6', 'cyan.6', 'teal.6', 'indigo.6', 'grape.6'] as const;

/** A delivery with nothing left no longer belongs to a price in stock. */
export const SOLD_OUT_COLOR = 'gray.5';

export const tierColor = (tiers: PriceTier[], sellingPriceCents: number): string => {
  const index = tiers.findIndex((tier) => tier.sellingPriceCents === sellingPriceCents);
  return index < 0 ? SOLD_OUT_COLOR : TIER_COLORS[index % TIER_COLORS.length];
};
