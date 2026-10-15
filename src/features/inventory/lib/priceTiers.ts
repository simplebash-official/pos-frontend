import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { PriceTier, Product } from '../types';

/** The lowest and highest amount in a set, for "Rs 1,200 – Rs 1,500" style labels. */
export interface CentsRange {
  min: number;
  max: number;
}

/** "Rs 1,200" when both ends match, otherwise "Rs 1,200 – Rs 1,500". */
export const formatCentsRange = (range: CentsRange): string =>
  range.min === range.max
    ? formatMoney(range.min)
    : `${formatMoney(range.min)} – ${formatMoney(range.max)}`;

/**
 * The prices a product is in stock at, cheapest to dearest. `null` when
 * nothing is in stock — a product carries no price of its own.
 */
export const sellingPriceRange = (product: Product): CentsRange | null => {
  const tiers = product.priceTiers;
  if (tiers.length === 0) return null;
  return {
    min: tiers[0].sellingPriceCents,
    max: tiers[tiers.length - 1].sellingPriceCents,
  };
};

/**
 * What the shop paid across the product's in-stock deliveries, for screens
 * only an Admin can open. The server leaves the cost out for everyone else,
 * so a missing cost here means the screen was reached by someone it was not
 * meant for — fail loudly rather than show a made-up number. `null` when
 * nothing is in stock.
 */
export const adminCostRange = (product: Product): CentsRange | null => {
  if (product.priceTiers.length === 0) return null;
  const mins: number[] = [];
  const maxes: number[] = [];
  for (const tier of product.priceTiers) {
    if (tier.minUnitCostCents === undefined || tier.maxUnitCostCents === undefined) {
      throw new Error(`The cost of product ${product.key} was not sent; this view is Admin-only.`);
    }
    mins.push(tier.minUnitCostCents);
    maxes.push(tier.maxUnitCostCents);
  }
  return { min: Math.min(...mins), max: Math.max(...maxes) };
};

/** A price tier with how many of its units the current sale has not taken yet. */
export interface TierWithRoom extends PriceTier {
  left: number;
}

/**
 * Each tier's units still free for this sale, given how many the cart already
 * holds per selling price (`reservedByPrice`). Tiers keep their order.
 */
export const tiersWithRoom = (
  tiers: PriceTier[],
  reservedByPrice: ReadonlyMap<number, number>
): TierWithRoom[] =>
  tiers.map((tier) => ({
    ...tier,
    left: tier.quantity - (reservedByPrice.get(tier.sellingPriceCents) ?? 0),
  }));

/**
 * The tiers this sale can still take from. More than one means the cashier
 * has to pick a price, so the catalog flags the card and opens the picker.
 */
export const availableTiers = (
  tiers: PriceTier[],
  reservedByPrice: ReadonlyMap<number, number>
): TierWithRoom[] => tiersWithRoom(tiers, reservedByPrice).filter((tier) => tier.left > 0);

/** The product's price(s) as shown in lists; it has none while out of stock. */
export const priceText = (product: Product): string => {
  const range = sellingPriceRange(product);
  return range === null ? t('No price yet') : formatCentsRange(range);
};

/** The product's cost(s) for an Admin-only list; none while out of stock. */
export const adminCostText = (product: Product): string => {
  const range = adminCostRange(product);
  return range === null ? t('No stock') : formatCentsRange(range);
};

/**
 * Profit per unit across the product's in-stock deliveries — each price less
 * the costs of the deliveries selling at it. Admin-only, like the cost; `null`
 * when nothing is in stock.
 */
export const profitRange = (product: Product): CentsRange | null => {
  if (adminCostRange(product) === null) return null;
  const lows = product.priceTiers.map(
    (tier) => tier.sellingPriceCents - (tier.maxUnitCostCents as number)
  );
  const highs = product.priceTiers.map(
    (tier) => tier.sellingPriceCents - (tier.minUnitCostCents as number)
  );
  return { min: Math.min(...lows), max: Math.max(...highs) };
};
