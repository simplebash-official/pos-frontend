// The roundings offered when a selling price is worked out from a margin, in cents; 1 means no
// rounding. A choice list for the screen only: the server does the rounding.

export const PRICE_STEPS_CENTS = [1, 100, 1000, 5000, 10000] as const;
export type PriceStepCents = (typeof PRICE_STEPS_CENTS)[number];
