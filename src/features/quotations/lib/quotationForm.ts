import dayjs from 'dayjs';
import type { CartItem } from '@/store/slices/cartSlice';
import type { PriceTier, Product } from '@/features/inventory/types';
import type { CalcQuotationReply, CalcQuotationRequest, CreateQuotationInput } from '../types';

import { formatMoney } from '@/shared/lib/money';

// The quotation form's working state, kept out of the components so it can be tested without
// rendering. It holds only what was typed (a line's discount as typed, never worked out); every
// figure and rule comes from the server (`/calc/quotation`), and the create request sends the
// discount amounts that answer worked out.

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
}

/**
 * Human-readable badge text describing a line item's discount.
 */
export const formatLineDiscountBadge = (
  line: QuotationLineDraft,
  /** What the server worked this line's discount out to. */
  discountCents: number
): string | null => {
  if (discountCents <= 0) return null;
  if (
    line.discountType === 'percentage' &&
    typeof line.discountValue === 'number' &&
    line.discountValue > 0
  ) {
    return `${line.discountValue}% (-${formatMoney(discountCents)})`;
  }
  if (
    line.discountType === 'fixed' &&
    line.discountScope === 'per_unit' &&
    line.quantity > 1 &&
    typeof line.discountValue === 'number'
  ) {
    return `-${formatMoney(line.discountValue)}/ea (-${formatMoney(discountCents)})`;
  }
  return `-${formatMoney(discountCents)}`;
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
});

/** A catalog line quoted at one of the product's current prices (`tier`). */
export const lineFromProduct = (product: Product, tier: PriceTier): QuotationLineDraft => ({
  uid: newLineUid(),
  productKey: product.key,
  name: product.name,
  sku: product.sku,
  unitPriceCents: tier.sellingPriceCents,
  quantity: 1,
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
  /** What each cart line's discount comes to in cents, as the server worked it out, in line order. */
  lineDiscountsCents: number[];
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
  lines: cart.items.map((item, index) => {
    const keepsCatalogPrice =
      item.productKey !== undefined &&
      (item.sourceType === undefined || item.sourceType === 'retail') &&
      (item.originalUnitPriceCents === undefined ||
        item.originalUnitPriceCents === item.unitPriceCents);
    const discountCents = cart.lineDiscountsCents[index];
    const hasDiscount = discountCents > 0;
    return {
      uid: newLineUid(),
      productKey: keepsCatalogPrice ? item.productKey : undefined,
      name: item.name,
      sku: item.sku,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      discountType: hasDiscount ? 'fixed' : undefined,
      discountScope: hasDiscount ? 'total' : undefined,
      discountValue: hasDiscount ? discountCents : undefined,
    };
  }),
  discountType: cart.discountType ?? 'percentage',
  discountValue: cart.discountType ? cart.discountValue : 0,
});

const orUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/** The form as the server's calculator wants it: what was typed, nothing worked out. */
export const toCalcQuotationRequest = (draft: QuotationDraft): CalcQuotationRequest => ({
  customerKey: draft.customerKey,
  customerName: draft.customerName,
  lines: draft.lines.map((line) => ({
    key: line.uid,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    quantity: line.quantity,
    discount:
      line.discountType !== undefined && line.discountValue !== undefined
        ? {
            type: line.discountType,
            scope: line.discountScope === undefined ? 'total' : line.discountScope,
            value: line.discountValue,
          }
        : null,
  })),
  orderDiscount:
    draft.discountValue > 0 ? { type: draft.discountType, value: draft.discountValue } : null,
  validUntil: draft.validUntil,
});

/**
 * The request body. Order totals are deliberately absent: the backend works them out itself. Each
 * line's discount amount is the one the server's answer for this exact form worked out.
 */
export const buildCreateInput = (
  draft: QuotationDraft,
  answer: CalcQuotationReply,
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
  items: draft.lines.map((line, index) =>
    line.productKey !== undefined
      ? {
          productKey: line.productKey,
          sellingPriceCents: line.unitPriceCents,
          quantity: line.quantity,
          discountCents: answer.lines[index].discountCents,
        }
      : {
          name: line.name.trim(),
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
          discountCents: answer.lines[index].discountCents,
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
