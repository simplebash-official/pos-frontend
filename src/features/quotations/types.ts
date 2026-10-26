// Quotations: priced offers an Admin or Manager prints for a customer. A quotation is not a
// sale — it never touches stock, payments or invoices. Amounts are integer cents, like the rest
// of the app, and every total shown here comes back from the backend (it recomputes them).

/** What the backend stores. "Expired" is not stored; it is `isExpired` on an active quotation. */
export type QuotationStatus = 'active' | 'cancelled';

/** The views the list can filter to. */
export type QuotationListStatus = 'active' | 'expired' | 'cancelled';

export interface QuotationItem {
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
}

export interface Quotation {
  id: string;
  key: string;
  /** e.g. `QUO-0001`. */
  quotationNumber: string;
  status: QuotationStatus;
  /** Still `active`, but its valid-until date has passed. */
  isExpired: boolean;
  customerKey?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: QuotationItem[];
  subtotalCents: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountCents: number;
  totalCents: number;
  /** `YYYY-MM-DD`. */
  validUntil: string;
  notes?: string;
  terms?: string;
  preparedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListResult {
  quotations: Quotation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuotationListParams {
  search?: string;
  status?: QuotationListStatus;
  page: number;
  limit: number;
}

/**
 * A requested line. With `productKey` the backend takes name and SKU from the
 * catalog and the price from `sellingPriceCents`, one of the product's current
 * prices.
 */
export interface CreateQuotationItemInput {
  productKey?: string;
  sellingPriceCents?: number;
  name?: string;
  unitPriceCents?: number;
  quantity: number;
  discountCents: number;
}

export interface CreateQuotationInput {
  customer: {
    customerKey?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
  };
  items: CreateQuotationItemInput[];
  pricingAdjustments?: { discountType: 'percentage' | 'fixed'; discountValue: number };
  /** `YYYY-MM-DD`, today or later. */
  validUntil: string;
  notes?: string;
  terms?: string;
  preparedBy?: string;
}

// ---------------------------------------------------------------------------
// Live calculation of the quotation form (`POST /calc/quotation`)
// ---------------------------------------------------------------------------

export interface CalcQuotationLineRequest {
  /** The form line's id, echoed in its answer. */
  key: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  /** As typed: a percentage (0-100), or fixed cents off each unit or the whole line. `null` for none. */
  discount: {
    type: 'percentage' | 'fixed';
    scope: 'per_unit' | 'total';
    value: number;
  } | null;
}

export interface CalcQuotationRequest {
  customerKey: string | null;
  customerName: string;
  lines: CalcQuotationLineRequest[];
  orderDiscount: { type: 'percentage' | 'fixed'; value: number } | null;
  /** `YYYY-MM-DD`. */
  validUntil: string;
}

export type QuotationBlockerCode =
  | 'customer_missing'
  | 'no_lines'
  | 'name_missing'
  | 'quantity_invalid'
  | 'order_discount_negative'
  | 'order_discount_over100'
  | 'valid_until_invalid'
  | 'valid_until_in_past';

export interface CalcQuotationReply {
  lines: { key: string; grossCents: number; discountCents: number; totalCents: number }[];
  /** Price times quantity over all lines, before any discount. */
  grossSubtotalCents: number;
  /** All the line discounts together. */
  lineDiscountsCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  /** What stops the quotation being created, in the order to say it; empty means it can go ahead. */
  blockers: { code: QuotationBlockerCode; line: number | null }[];
}
