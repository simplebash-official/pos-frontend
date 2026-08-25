import { CURRENCY } from '@/constants';

/**
 * Converts a floating point currency value (e.g. 15.50) into integer cents/paisa (1550).
 */
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Converts integer cents/paisa (1550) back to floating point currency value (15.50).
 */
export const fromCents = (cents: number): number => {
  return cents / 100;
};

/**
 * Formats integer cents/paisa into localized currency string.
 * Example: 1550 -> "Rs. 15.50"
 */
export const formatMoney = (cents: number, includeSymbol = true): string => {
  const amount = fromCents(cents);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: CURRENCY.decimals,
    maximumFractionDigits: CURRENCY.decimals,
  });

  return includeSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
};

/**
 * Parses user input string (e.g. "15.50" or "Rs. 15.50") safely into integer cents.
 */
export const parseMoneyToCents = (input: string): number => {
  if (!input) return 0;
  const isNegative = input.includes('-');
  const digitsAndDots = input.replace(/[^0-9.]/g, '');
  if (!digitsAndDots) return 0;

  const parts = digitsAndDots.split('.');
  let normalized: string;
  if (parts.length <= 1) {
    normalized = parts[0] || '0';
  } else {
    const decimal = parts.pop() ?? '0';
    const integerPart = parts.join('');
    normalized = `${integerPart || '0'}.${decimal}`;
  }

  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return 0;
  const cents = toCents(parsed);
  return isNegative ? -Math.abs(cents) : cents;
};
