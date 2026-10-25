// How much a product earns, worked out from integer cents so the figures never drift: the lot's
// cost is the landed total (price plus its share of extra charges), never a per-unit cost rounded
// first. Free of React so it can be tested on its own.

/** The steps a suggested selling price can be rounded up to, in cents (Rs 1, 10, 50, 100). */
export const PRICE_STEPS_CENTS = [100, 1000, 5000, 10000] as const;
export type PriceStepCents = (typeof PRICE_STEPS_CENTS)[number];

export interface LineMargin {
  /** Selling price less the cost of one unit, to the nearest cent. */
  profitEachCents: number;
  /** What the whole lot earns if every unit sells at the selling price. Negative is a loss. */
  lotProfitCents: number;
  /** Profit as a share of the selling price, to one decimal place; `null` with no selling price. */
  marginPercent: number | null;
  belowCost: boolean;
}

/** `null` until there is a quantity, a cost and a selling price to compare. */
export const lineMargin = (
  landedTotalCents: number,
  quantity: number,
  sellingPriceCents: number
): LineMargin | null => {
  if (quantity < 1 || landedTotalCents <= 0 || sellingPriceCents <= 0) return null;
  const revenue = sellingPriceCents * quantity;
  const lotProfitCents = revenue - landedTotalCents;
  return {
    profitEachCents: Math.round(lotProfitCents / quantity),
    lotProfitCents,
    marginPercent: Math.round((lotProfitCents * 1000) / revenue) / 10,
    belowCost: lotProfitCents < 0,
  };
};

const ceilDiv = (numerator: bigint, denominator: bigint): bigint =>
  (numerator + denominator - BigInt(1)) / denominator;

/**
 * The lowest selling price each that earns at least `marginTenths` (per mille: 255 is 25.5%) on the
 * lot, rounded up to a whole `stepCents`. `null` when the margin is not between 0 and 100 or there
 * is no cost yet.
 */
export const suggestedPriceCents = (
  landedTotalCents: number,
  quantity: number,
  marginTenths: number,
  stepCents: PriceStepCents
): number | null => {
  if (quantity < 1 || landedTotalCents <= 0) return null;
  if (!Number.isInteger(marginTenths) || marginTenths < 0 || marginTenths >= 1000) return null;
  const thousand = BigInt(1000);
  const lowest = ceilDiv(
    BigInt(landedTotalCents) * thousand,
    BigInt(quantity) * (thousand - BigInt(marginTenths))
  );
  const step = BigInt(stepCents);
  return Number(ceilDiv(lowest, step) * step);
};
