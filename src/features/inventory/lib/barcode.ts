import { normalizeDigits } from '@/shared/lib/search';
import type { Product } from '../types';

/** A scanned/typed barcode is "real" once it's 8–14 digits — same range the backend accepts. */
export const looksLikeBarcode = (term: string): boolean => {
  const digits = normalizeDigits(term);
  return digits.length >= 8 && digits.length <= 14;
};

/**
 * What the product form accepts as a barcode to save: exactly 8–14 digits, no
 * spaces or letters. Matches the backend's `validate_manual_barcode`. An empty
 * string is *not* valid here — the caller decides whether "left blank" means
 * "unchanged" (edit) or "no barcode" (create).
 */
export const isValidManualBarcode = (value: string): boolean => /^\d{8,14}$/.test(value.trim());

/**
 * Resolves a scanned/typed barcode to the single product that carries it.
 *
 * Tries an exact match against the already-loaded catalog first (digit-only
 * compare, so `"890 123"` matches a stored `"890123"`), then falls back to the
 * backend's exact-lookup endpoint for a product that isn't in the local list.
 * Returns `null` when nothing matches — the caller decides what "not found"
 * means (shake the scan bar, show an empty picker, etc.).
 */
export const resolveProductByBarcode = async (
  term: string,
  localProducts: readonly Product[],
  fetchByBarcode: (barcode: string) => Promise<Product>
): Promise<Product | null> => {
  const digits = normalizeDigits(term);
  if (!digits) return null;

  const local = localProducts.find((p) => p.barcode && normalizeDigits(p.barcode) === digits);
  if (local) return local;

  try {
    return await fetchByBarcode(digits);
  } catch {
    // 404 (no product with that barcode) or any transient failure — treat as
    // "no exact match" and let the caller fall through to fuzzy search.
    return null;
  }
};
