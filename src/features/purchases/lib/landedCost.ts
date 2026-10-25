// The money maths of a receipt's extra charges, free of React: how a charge is spread over the
// products and how a product's landed cost is split into stock batches. Integer cents only, and
// exact: shares add up to the charge to the cent and batches add up to the landed total to the cent.
// This is the twin of the server's `modules/purchases/charges.rs` and is tested against the same
// vectors, so what the form shows is what the server saves.

import type { BilledBy, ChargeAllocation, ChargeKind } from '../types';

/** The amount of a charge with its sign: a discount takes money off, everything else adds. */
export const signedChargeCents = (kind: ChargeKind, amountCents: number): number =>
  kind === 'discount' ? -amountCents : amountCents;

/**
 * Spreads `amountCents` (signed) over lines in proportion to `weights`, to the cent: each line gets
 * its whole-cent share first, then the cents left over go one each to the lines with the largest
 * fractional remainders (ties to the earlier line). BigInt keeps the products exact.
 */
export const allocateCharge = (amountCents: number, weights: readonly number[]): number[] => {
  const zero = BigInt(0);
  const totalWeight = weights.reduce((sum, weight) => sum + BigInt(weight), zero);
  if (totalWeight <= zero) throw new Error('The weights must add up to something');
  const magnitude = BigInt(Math.abs(amountCents));

  const scaled = weights.map((weight) => magnitude * BigInt(weight));
  const shares = scaled.map((value) => value / totalWeight);
  const order = scaled
    .map((value, index) => ({ remainder: value % totalWeight, index }))
    .sort((a, b) =>
      a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1
    );
  const leftover = Number(magnitude - shares.reduce((sum, share) => sum + share, zero));

  const result = shares.map(Number);
  for (const { index } of order.slice(0, leftover)) result[index] += 1;
  return amountCents < 0 ? result.map((share) => (share === 0 ? 0 : -share)) : result;
};

/** What each line carries when a charge is spread: what it costs, or how many units it has. */
export const allocationWeights = (
  allocation: ChargeAllocation,
  lines: ReadonlyArray<{ quantity: number; goodsCents: number }>
): number[] => lines.map((line) => (allocation === 'value' ? line.goodsCents : line.quantity));

/** One stock batch of a line: how many units and what each costs. */
export interface BatchCost {
  quantity: number;
  unitCostCents: number;
}

/**
 * Splits a line's landed total over its units so the batches add up to it exactly: one batch when
 * it divides evenly, otherwise `remainder` units cost a cent more than the rest (the cheaper batch
 * first). `quantity` must be at least 1.
 */
export const splitCost = (totalCents: number, quantity: number): BatchCost[] => {
  const each = Math.floor(totalCents / quantity);
  const remainder = totalCents - each * quantity;
  if (remainder === 0) return [{ quantity, unitCostCents: each }];
  return [
    { quantity: quantity - remainder, unitCostCents: each },
    { quantity: remainder, unitCostCents: each + 1 },
  ];
};

/** The landed total per unit to the nearest cent, for display. Stock itself is costed by `splitCost`. */
export const roundedUnitCents = (totalCents: number, quantity: number): number =>
  quantity <= 0 ? 0 : Math.floor((totalCents + Math.floor(quantity / 2)) / quantity);

/** One charge reduced to what spreading it needs. */
export interface ChargeFigure {
  kind: ChargeKind;
  amountCents: number;
  billedBy: BilledBy;
  /** `null` for a receipt with one product: there is nothing to spread over. */
  allocation: ChargeAllocation | null;
}

/** Each line's share of all the charges (discounts negative), in line order. */
export const spreadCharges = (
  lines: ReadonlyArray<{ quantity: number; goodsCents: number }>,
  charges: readonly ChargeFigure[]
): number[] => {
  const shares = lines.map(() => 0);
  for (const charge of charges) {
    const amount = signedChargeCents(charge.kind, charge.amountCents);
    if (lines.length === 1 || charge.allocation === null) {
      shares[0] += amount;
      continue;
    }
    allocateCharge(amount, allocationWeights(charge.allocation, lines)).forEach((part, index) => {
      shares[index] += part;
    });
  }
  return shares;
};

/** What a receipt's charges come to, split by who is paid. */
export interface ChargeTotals {
  /** On the supplier's bill, discounts taken off. Changes what is owed to the supplier. */
  supplierBilledCents: number;
  /** Paid to someone else. Never owed to the supplier. */
  paidToOthersCents: number;
}

export const chargeTotals = (
  charges: ReadonlyArray<Pick<ChargeFigure, 'kind' | 'amountCents' | 'billedBy'>>
): ChargeTotals => {
  const totals: ChargeTotals = { supplierBilledCents: 0, paidToOthersCents: 0 };
  for (const charge of charges) {
    const amount = signedChargeCents(charge.kind, charge.amountCents);
    if (charge.billedBy === 'supplier') totals.supplierBilledCents += amount;
    else totals.paidToOthersCents += amount;
  }
  return totals;
};
