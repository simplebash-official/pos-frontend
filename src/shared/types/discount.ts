/** A discount as typed: a percentage (0-100) or, for `fixed`, cents. */
export interface CalcDiscount {
  type: 'percentage' | 'fixed';
  value: number;
}
