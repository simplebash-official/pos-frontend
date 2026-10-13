import dayjs from 'dayjs';
import { t } from '@/shared/i18n/t';
import { calculateLineItem, calculateOrderDiscount } from '@/shared/lib/posCalculations';
import type { CartItem } from '@/store/slices/cartSlice';
import type { Product } from '@/features/inventory/types';
import type { CreateQuotationInput } from '../types';

import { formatMoney } from '@/shared/lib/money';

// The form's working state and every rule about it, kept out of the components so it can be
// tested without rendering. The backend recomputes all totals and re-checks every rule; this is
// only so the shop sees a live total and a plain message *before* sending.

export type LineDiscountType = 'percentage' | 'fixed';
export type LineDiscountScope = 'per_unit' | 'total';

export interface QuotationLineDraft {
  /** Local key for React lists; never sent. */
  uid: string;
  /** Set when the line came from the catalog: the backend then prices it from the catalog. */
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  /** 'percentage' or 'fixed'. */
  discountType?: LineDiscountType;
  /** 'per_unit' (each) or 'total' (bulk whole line). Relevant when discountType is 'fixed' and quantity > 1. */
  discountScope?: LineDiscountScope;
  /** Percentage (0-100) when discountType === 'percentage', or cents when discountType === 'fixed'. */
  discountValue?: number;
  /** Total discount in cents on this line. */
  discountCents: number;
}

/**
 * Calculates a line item's discount in integer cents based on the chosen mode and scope.
 */
export const calculateLineDiscountCents = (
  unitPriceCents: number,
  quantity: number,
  discountType?: LineDiscountType,
  discountScope?: LineDiscountScope,
  discountValue?: number
): number => {
  const gross = Math.max(0, Math.round(unitPriceCents) * Math.max(0, Math.floor(quantity)));
  if (gross === 0 || !discountType || typeof discountValue !== 'number' || discountValue <= 0) {
    return 0;
  }
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Math.min(gross, Math.round((gross * pct) / 100));
  }
  if (discountScope === 'per_unit' && quantity > 1) {
    const perUnitCents = Math.round(discountValue);
    const total = perUnitCents * quantity;
    return Math.min(gross, Math.max(0, total));
  }
  return Math.min(gross, Math.max(0, Math.round(discountValue)));
};

/**
 * Human-readable badge text describing a line item's discount.
 */
export const formatLineDiscountBadge = (line: QuotationLineDraft): string | null => {
  if (line.discountCents <= 0) return null;
  if (
    line.discountType === 'percentage' &&
    typeof line.discountValue === 'number' &&
    line.discountValue > 0
  ) {
    return `${line.discountValue}% (-${formatMoney(line.discountCents)})`;
  }
  if (
    line.discountType === 'fixed' &&
    line.discountScope === 'per_unit' &&
    line.quantity > 1 &&
    typeof line.discountValue === 'number'
  ) {
    return `-${formatMoney(line.discountValue)}/ea (-${formatMoney(line.discountCents)})`;
  }
  return `-${formatMoney(line.discountCents)}`;
};

export interface QuotationDraft {
  customerKey: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  lines: QuotationLineDraft[];
  discountType: 'percentage' | 'fixed';
  /** A percentage (0-100), or cents when `discountType` is `fixed`. */
  discountValue: number;
  /** `YYYY-MM-DD`. */
  validUntil: string;
  notes: string;
  terms: string;
}

/** How long a new quotation holds its prices unless the user picks another day. */
export const DEFAULT_VALIDITY_DAYS = 30;

const DATE_FORMAT = 'YYYY-MM-DD';

let lineCounter = 0;
export const newLineUid = (): string => {
  lineCounter += 1;
  return `quotation-line-${lineCounter}`;
};

export const todayString = (now: Date = new Date()): string => dayjs(now).format(DATE_FORMAT);

export const defaultValidUntil = (now: Date = new Date()): string =>
  dayjs(now).add(DEFAULT_VALIDITY_DAYS, 'day').format(DATE_FORMAT);

export const emptyLine = (): QuotationLineDraft => ({
  uid: newLineUid(),
  name: '',
  unitPriceCents: 0,
  quantity: 1,
  discountCents: 0,
});

export const lineFromProduct = (product: Product): QuotationLineDraft => ({
  uid: newLineUid(),
  productKey: product.key,
  name: product.name,
  sku: product.sku,
  unitPriceCents: product.sellingPriceCents,
  quantity: 1,
  discountCents: 0,
});

export const emptyDraft = (now: Date = new Date()): QuotationDraft => ({
  customerKey: null,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  lines: [],
  discountType: 'percentage',
  discountValue: 0,
  validUntil: defaultValidUntil(now),
  notes: '',
  terms: '',
});

export interface CartQuotationSeed {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
}

/**
 * Turns the current billing cart into a starting quotation. A catalog line keeps its product key
 * (so the backend prices it from the catalog) only when the cashier did not change its price in
 * the cart; a repair/print line, or a line with an edited price, is sent as a plain named line so
 * the quotation shows exactly what the cart showed.
 */
export const draftFromCart = (cart: CartQuotationSeed, now: Date = new Date()): QuotationDraft => ({
  ...emptyDraft(now),
  customerKey: cart.customerId,
  customerName: cart.customerName ?? '',
  customerPhone: cart.customerPhone ?? '',
  customerAddress: cart.customerAddress ?? '',
  lines: cart.items.map((item) => {
    const keepsCatalogPrice =
      item.productKey !== undefined &&
      (item.sourceType === undefined || item.sourceType === 'retail') &&
      (item.originalUnitPriceCents === undefined ||
        item.originalUnitPriceCents === item.unitPriceCents);
    const hasDiscount = item.discountCents > 0;
    return {
      uid: newLineUid(),
      productKey: keepsCatalogPrice ? item.productKey : undefined,
      name: item.name,
      sku: item.sku,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      discountType: hasDiscount ? 'fixed' : undefined,
      discountScope: hasDiscount ? 'total' : undefined,
      discountValue: hasDiscount ? item.discountCents : undefined,
      discountCents: item.discountCents,
    };
  }),
  discountType: cart.discountType ?? 'percentage',
  discountValue: cart.discountType ? cart.discountValue : 0,
});

export interface DraftTotals {
  lineTotals: number[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

export const draftTotals = (draft: QuotationDraft): DraftTotals => {
  const lineTotals = draft.lines.map(
    (line) =>
      calculateLineItem({
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
        discountCents: line.discountCents,
      }).totalCents
  );
  const subtotalCents = lineTotals.reduce((sum, cents) => sum + cents, 0);
  const discountCents = calculateOrderDiscount(
    subtotalCents,
    draft.discountType,
    draft.discountValue
  );
  return {
    lineTotals,
    subtotalCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents - discountCents),
  };
};

/** The first thing wrong with the draft, in plain words for the shop, or `null` when it is fine. */
export const validateDraft = (draft: QuotationDraft, now: Date = new Date()): string | null => {
  if (draft.customerKey === null && draft.customerName.trim() === '') {
    return t('Please choose a customer, or type the name.');
  }
  if (draft.lines.length === 0) {
    return t('Add at least one item.');
  }
  for (const line of draft.lines) {
    if (line.name.trim() === '') {
      return t('Every item needs a name.');
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return t('Quantity must be 1 or more.');
    }
    if (line.unitPriceCents < 0) {
      return t('A price cannot be negative.');
    }
    if (line.discountCents < 0 || line.discountCents > line.unitPriceCents * line.quantity) {
      return t('A discount cannot be more than the price of the item.');
    }
  }
  if (draft.discountValue < 0) {
    return t('A discount cannot be negative.');
  }
  if (draft.discountType === 'percentage' && draft.discountValue > 100) {
    return t('A discount cannot be more than 100%.');
  }
  if (!dayjs(draft.validUntil, DATE_FORMAT, true).isValid()) {
    return t('Choose the last day this offer is valid.');
  }
  if (draft.validUntil < todayString(now)) {
    return t('The valid-until date cannot be in the past.');
  }
  return null;
};

const orUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/** The request body. Totals are deliberately absent: the backend works them out itself. */
export const buildCreateInput = (
  draft: QuotationDraft,
  preparedBy: string | undefined
): CreateQuotationInput => ({
  customer:
    draft.customerKey === null
      ? {
          customerName: orUndefined(draft.customerName),
          customerPhone: orUndefined(draft.customerPhone),
          customerAddress: orUndefined(draft.customerAddress),
        }
      : { customerKey: draft.customerKey },
  items: draft.lines.map((line) =>
    line.productKey !== undefined
      ? { productKey: line.productKey, quantity: line.quantity, discountCents: line.discountCents }
      : {
          name: line.name.trim(),
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
          discountCents: line.discountCents,
        }
  ),
  pricingAdjustments:
    draft.discountValue > 0
      ? { discountType: draft.discountType, discountValue: draft.discountValue }
      : undefined,
  validUntil: draft.validUntil,
  notes: orUndefined(draft.notes),
  terms: orUndefined(draft.terms),
  preparedBy,
});
