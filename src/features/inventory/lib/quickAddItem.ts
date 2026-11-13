import { t } from '@/shared/i18n/t';
import { toCents } from '@/shared/lib/money';
import { normalizeDigits } from '@/shared/lib/search';
import type { ProductWarranty } from '@/features/warranties';
import { profileProblem, toProfileInput } from '@/features/warranties';
import type { CreateProductInput } from '../types';
import { isValidManualBarcode, looksLikeBarcode } from './barcode';

/** The built-in category the backend seeds for every shop (see `ensure_uncategorized`). */
export const UNCATEGORIZED_CATEGORY_KEY = 'cat_uncategorized';
/** The one subcategory of [`UNCATEGORIZED_CATEGORY_KEY`]. */
export const UNCATEGORIZED_SUBCATEGORY_KEY = 'subcat_uncategorized_general';

/** A quick-added item raises no low-stock alert; an admin sets a threshold from Inventory. */
export const QUICK_ADD_MIN_STOCK_THRESHOLD = 0;

export type QuickAddCategory =
  { kind: 'existing'; key: string } | { kind: 'new'; name: string; icon: string; color: string };

export type QuickAddSubcategory = { kind: 'existing'; key: string } | { kind: 'new'; name: string };

/** `enter`: the cashier types or scans one. `generate`: the shop numbers it. */
export type BarcodeMode = 'enter' | 'generate';

export interface QuickAddDraft {
  name: string;
  barcodeMode: BarcodeMode;
  barcode: string;
  category: QuickAddCategory | null;
  subcategory: QuickAddSubcategory | null;
  quantity: number | '';
  costPrice: number | '';
  sellingPrice: number | '';
  warranty: ProductWarranty;
}

export type QuickAddErrors = Partial<
  Record<
    | 'name'
    | 'barcode'
    | 'category'
    | 'subcategory'
    | 'quantity'
    | 'costPrice'
    | 'sellingPrice'
    | 'warranty',
    string
  >
>;

/** What the scan bar held when the cashier chose to add a new item. */
export interface QuickAddSeed {
  name: string;
  barcodeMode: BarcodeMode;
  barcode: string;
}

/**
 * A scanned or typed term that looks like a barcode becomes the item's barcode; anything else
 * is the name the cashier was looking for. An empty term (the "+ New item" button) seeds neither
 * and lets the shop number the barcode.
 */
export const seedFromTerm = (term: string): QuickAddSeed => {
  const trimmed = term.trim();
  if (trimmed === '') return { name: '', barcodeMode: 'generate', barcode: '' };
  if (looksLikeBarcode(trimmed)) {
    return { name: '', barcodeMode: 'enter', barcode: normalizeDigits(trimmed) };
  }
  return { name: trimmed, barcodeMode: 'generate', barcode: '' };
};

/** Unit profit and margin of the opening stock; `null` until both prices are positive. */
export const marginOf = (
  costPrice: number | '',
  sellingPrice: number | ''
): { profit: number; marginPct: number } | null => {
  if (costPrice === '' || sellingPrice === '' || costPrice <= 0 || sellingPrice <= 0) return null;
  const profit = sellingPrice - costPrice;
  return { profit, marginPct: (profit / sellingPrice) * 100 };
};

export const validateDraft = (draft: QuickAddDraft): QuickAddErrors => {
  const errors: QuickAddErrors = {};

  if (draft.name.trim() === '') errors.name = t('Enter the item name');

  if (draft.barcodeMode === 'enter' && !isValidManualBarcode(draft.barcode)) {
    errors.barcode = t('A barcode should be 8 to 14 numbers, with no letters or spaces');
  }

  if (draft.category === null) {
    errors.category = t('Choose a category');
  } else if (draft.category.kind === 'new' && draft.category.name.trim() === '') {
    errors.category = t('Enter the new category name');
  }

  if (draft.subcategory === null) {
    errors.subcategory = t('Choose a subcategory');
  } else if (draft.subcategory.kind === 'new' && draft.subcategory.name.trim() === '') {
    errors.subcategory = t('Enter the new subcategory name');
  }

  if (draft.quantity === '' || !Number.isInteger(draft.quantity) || draft.quantity < 1) {
    errors.quantity = t('Enter how many you have, at least 1');
  }
  if (draft.costPrice === '' || draft.costPrice < 0) errors.costPrice = t('Enter the cost price');
  if (draft.sellingPrice === '' || draft.sellingPrice <= 0) {
    errors.sellingPrice = t('Selling price must be greater than 0');
  }

  const warrantyProblem = profileProblem(draft.warranty);
  if (warrantyProblem !== null) errors.warranty = warrantyProblem;

  return errors;
};

/**
 * The create-product request for a validated draft. `categoryKey` and `subcategoryKey` are the
 * real keys, resolved after any new category or subcategory was created.
 */
export const buildCreateInput = (
  draft: QuickAddDraft,
  categoryKey: string,
  subcategoryKey: string
): CreateProductInput => {
  if (draft.quantity === '' || draft.costPrice === '' || draft.sellingPrice === '') {
    throw new Error('buildCreateInput needs a validated draft');
  }
  const input: CreateProductInput = {
    name: draft.name.trim(),
    categoryKey,
    subcategoryKey,
    openingStock: {
      quantity: draft.quantity,
      unitCostCents: toCents(draft.costPrice),
      sellingPriceCents: toCents(draft.sellingPrice),
    },
    minStockThreshold: QUICK_ADD_MIN_STOCK_THRESHOLD,
    isSerialized: false,
    warranty: toProfileInput(draft.warranty),
  };
  if (draft.barcodeMode === 'generate') {
    input.autoGenerateBarcode = true;
  } else {
    input.autoGenerateBarcode = false;
    input.barcode = draft.barcode.trim();
  }
  return input;
};
