import { CURRENCY } from '@/constants';

/**
 * Converts a floating point currency value (e.g. 15.50) into integer cents/paisa (1550).
 */
export const toCents = (amount: number): number => {
  if (!Number.isFinite(amount)) return 0;
  const rounded = Math.round(amount * 100);
  return rounded === 0 ? 0 : rounded;
};

/**
 * Converts integer cents/paisa (1550) back to floating point currency value (15.50).
 */
export const fromCents = (cents: number): number => {
  if (!Number.isFinite(cents)) return 0;
  const result = cents / 100;
  return result === 0 ? 0 : result;
};

/**
 * Formats integer cents/paisa into localized currency string.
 * Example: 1550 -> "Rs. 15.50"
 */
export const formatMoney = (cents: number, includeSymbol = true): string => {
  const safeCents = !Number.isFinite(cents) || cents === 0 ? 0 : cents;
  const amount = fromCents(safeCents);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: CURRENCY.decimals,
    maximumFractionDigits: CURRENCY.decimals,
  });

  return includeSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
};

/**
 * Formats a range in cents into a localized currency string.
 * Example: { min: 120000, max: 150000 } -> "Rs. 1,200.00 – Rs. 1,500.00"
 * Example: { min: 120000, max: 120000 } -> "Rs. 1,200.00"
 */
export const formatCentsRange = (range: { min: number; max: number }): string => {
  if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) {
    return '';
  }
  return range.min === range.max
    ? formatMoney(range.min)
    : `${formatMoney(range.min)} – ${formatMoney(range.max)}`;
};

/**
 * Parses user input string (e.g. "15.50" or "Rs. 15.50") safely into integer cents.
 */
export const parseMoneyToCents = (input: string): number => {
  if (typeof input !== 'string' || !input) return 0;
  const isNegative = input.includes('-');
  const digitsAndDots = input.replace(/[^0-9.]/g, '');
  if (!digitsAndDots) return 0;

  const parts = digitsAndDots.split('.');
  let normalized: string;
  if (parts.length <= 1) {
    const intPart = parts[0];
    normalized = typeof intPart === 'string' && intPart.length > 0 ? intPart : '0';
  } else {
    const decimal = parts.pop();
    const safeDecimal = typeof decimal === 'string' && decimal.length > 0 ? decimal : '0';
    const integerPart = parts.join('');
    const safeInteger = integerPart.length > 0 ? integerPart : '0';
    normalized = `${safeInteger}.${safeDecimal}`;
  }

  const parsed = parseFloat(normalized);
  if (isNaN(parsed) || !Number.isFinite(parsed)) return 0;
  const cents = toCents(parsed);
  if (cents === 0) return 0;
  return isNegative ? -Math.abs(cents) : cents;
};
