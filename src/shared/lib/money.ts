import { CURRENCY, TAX_RATE } from '@/constants';

/**
 * Converts a floating point currency value (e.g. 15.50) into integer cents/paisa (1550).
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts integer cents/paisa (1550) back to floating point currency value (15.50).
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formats integer cents/paisa into localized currency string.
 * Example: 1550 -> "Rs. 15.50"
 */
export function formatMoney(cents: number, includeSymbol = true): string {
  const amount = fromCents(cents);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: CURRENCY.decimals,
    maximumFractionDigits: CURRENCY.decimals,
  });

  return includeSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
}

/**
 * Parses user input string (e.g. "15.50" or "Rs. 15.50") safely into integer cents.
 */
export function parseMoneyToCents(input: string): number {
  if (!input) return 0;
  const cleanStr = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed)) return 0;
  return toCents(parsed);
}

/**
 * Calculates tax in integer cents based on tax rate.
 */
export function calculateTaxCents(subtotalCents: number, rate = TAX_RATE): number {
  return Math.round(subtotalCents * rate);
}

/**
 * Calculates final total in cents.
 */
export function calculateTotalCents(
  subtotalCents: number,
  taxCents: number,
  discountCents = 0
): number {
  return Math.max(0, subtotalCents + taxCents - discountCents);
}
