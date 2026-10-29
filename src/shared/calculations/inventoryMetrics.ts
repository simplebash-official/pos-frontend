/** The lowest and highest amount in a set, for "Rs 1,200 – Rs 1,500" style labels. */
export interface CentsRange {
  min: number;
  max: number;
}

/** Minimal shape required for calculating room and reservations on a price tier. */
export interface PriceTierLike {
  sellingPriceCents: number;
  quantity: number;
  minUnitCostCents?: number | null;
  maxUnitCostCents?: number | null;
}

/** A price tier augmented with remaining units not reserved by the current cart. */
export type TierWithRoom<T extends PriceTierLike = PriceTierLike> = T & {
  left: number;
};

/**
 * Calculates how many units remain free in each tier for the current sale,
 * based on how many units the cart already holds at each selling price (`reservedByPrice`).
 * Preserves tier order.
 *
 * @param tiers List of inventory price tiers
 * @param reservedByPrice Map of sellingPriceCents -> reserved quantity in cart
 * @returns Array of tiers with remaining units under the `left` property
 */
export const getTiersWithRoom = <T extends PriceTierLike>(
  tiers: ReadonlyArray<T>,
  reservedByPrice: ReadonlyMap<number, number>
): TierWithRoom<T>[] =>
  tiers.map((tier) => {
    const reserved = reservedByPrice.get(tier.sellingPriceCents);
    const reservedQty = typeof reserved === 'number' && Number.isFinite(reserved) ? reserved : 0;
    return {
      ...tier,
      left: tier.quantity - reservedQty,
    };
  });

/**
 * Backward-compatible alias for getTiersWithRoom.
 */
export const tiersWithRoom = getTiersWithRoom;

/**
 * Sums the total quantity across price tiers.
 * Safely ignores negative or non-finite quantities.
 */
export const sumTierQuantities = (
  tiers: ReadonlyArray<Pick<PriceTierLike, 'quantity'>>
): number => {
  let total = 0;
  for (const tier of tiers) {
    if (typeof tier.quantity === 'number' && Number.isFinite(tier.quantity) && tier.quantity > 0) {
      total += tier.quantity;
    }
  }
  return total;
};

/**
 * Profit per unit range across in-stock deliveries — each price less the costs
 * of the deliveries selling at it.
 * Returns null if no price tiers exist.
 * Throws an error if any tier is missing minUnitCostCents or maxUnitCostCents (Admin-only data).
 *
 * @param priceTiers Price tiers with selling price and unit cost bounds
 * @returns CentsRange with min and max profit per unit in cents, or null if no tiers
 */
export const calculateProfitRange = (
  priceTiers: ReadonlyArray<PriceTierLike>
): CentsRange | null => {
  if (priceTiers.length === 0) return null;

  const lows: number[] = [];
  const highs: number[] = [];

  for (const tier of priceTiers) {
    if (
      tier.minUnitCostCents === undefined ||
      tier.minUnitCostCents === null ||
      !Number.isFinite(tier.minUnitCostCents) ||
      tier.maxUnitCostCents === undefined ||
      tier.maxUnitCostCents === null ||
      !Number.isFinite(tier.maxUnitCostCents)
    ) {
      throw new Error(
        'Price tier cost was not provided; profit range calculation requires minUnitCostCents and maxUnitCostCents.'
      );
    }
    lows.push(tier.sellingPriceCents - tier.maxUnitCostCents);
    highs.push(tier.sellingPriceCents - tier.minUnitCostCents);
  }

  return { min: Math.min(...lows), max: Math.max(...highs) };
};
