import { fromCents, toCents } from '@/shared/lib/money';

/** What a cost box holds for a saved cost: empty only when none is recorded. */
export const costBoxValue = (cents: number | undefined): number | string =>
  cents === undefined ? '' : fromCents(cents);

/** The cost typed in a box, in cents; `undefined` while the box is empty. */
export const typedCostCents = (value: number | string): number | undefined =>
  value === '' ? undefined : toCents(Number(value));
