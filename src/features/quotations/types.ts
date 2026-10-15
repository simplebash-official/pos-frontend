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
