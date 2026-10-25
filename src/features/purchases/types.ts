import type { SyncedEntityFields } from '@/shared/types/common';

/** Partial supplier snapshot the backend embeds on each purchase and receipt — not a full Supplier. */
export interface PurchaseSupplierSummary {
  id: string;
  key: string;
  name: string;
  contactPerson: string;
  primaryPhone: string;
}

/** Partial product snapshot the backend embeds on each purchase line — not a full Product. */
export interface PurchaseProductSummary {
  id: string;
  key: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
}

/** One product received, as a line of a receipt. */
export interface EnrichedStockPurchase extends SyncedEntityFields {
  id: string;
  key: string;
  supplierKey: string;
  productKey: string;
  quantity: number;
  unitCostCents: number;
  /** Price the received units were set to sell at. */
  sellingPriceCents: number;
  totalCostCents: number;
  date: string;
  /** The receipt (supplier invoice) this line belongs to. */
  receiptKey: string;
  supplier: PurchaseSupplierSummary;
  product: PurchaseProductSummary;
}

/** Where a receipt stands, worked out by the server from what is still due. */
export type ReceiptStatus = 'unpaid' | 'partly_paid' | 'paid';

export type PaymentKind = 'cash_movement' | 'expense_payment';

/** One payment, or part of one, counted against a receipt. */
export interface ReceiptSettlement {
  id: string;
  key: string;
  receiptKey: string;
  supplierKey: string;
  amountCents: number;
  paymentKind: PaymentKind;
  paymentKey: string;
  /** True once the payment was reversed; it no longer counts as paid. */
  reversed: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/** One supplier invoice: stock received on one visit or delivery, and what has been paid against it. */
export interface PurchaseReceipt {
  id: string;
  key: string;
  /** Running number shown to people, e.g. PUR-000012. */
  receiptNumber: string;
  supplierKey: string;
  /** The supplier's own invoice number. */
  referenceNo?: string;
  date: string;
  notes?: string;
  supplier?: PurchaseSupplierSummary;
  lines: EnrichedStockPurchase[];
  totalCents: number;
  creditedCents: number;
  paidCents: number;
  dueCents: number;
  status: ReceiptStatus;
  settlements: ReceiptSettlement[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

/** Where the money for a payment made as the stock arrives comes from. */
export type PaymentSource = 'drawer' | 'bank' | 'card' | 'online' | 'owner_pocket';

/** Payment made as a receipt is recorded: the whole amount, or part of it. */
export interface ReceiptPaymentInput {
  source: PaymentSource;
  amountCents: number;
  /** The supplier-payment category the payment is filed under. */
  categoryKey: string;
  /** Cash only (drawer, owner's pocket). */
  terminalId?: string;
  /** The open shift the cash is booked on; absent only between shifts. */
  sessionKey?: string;
  /** Bank, card and online only: `YYYY-MM-DD`. */
  paidOn?: string;
  managerPin?: string;
  overrideReason?: string;
}

export interface ReceiptLineInput {
  productKey: string;
  quantity: number;
  unitCostCents: number;
  sellingPriceCents: number;
  /** One per unit, for a serialized product. */
  serialNumbers?: string[];
}

export interface CreateReceiptInput {
  supplierKey: string;
  referenceNo?: string;
  date: string;
  notes?: string;
  lines: ReceiptLineInput[];
  /** Absent means the whole receipt is on credit. */
  payment?: ReceiptPaymentInput;
  /** Set after a duplicate-invoice warning to record the receipt anyway. */
  confirmDuplicate: boolean;
}

/** Part of a payment counted against one receipt when paying a supplier later. */
export interface ReceiptSettlementInput {
  receiptKey: string;
  amountCents: number;
}

export type CreditReason = 'short_delivery' | 'damaged' | 'price_difference' | 'other';

/** What a supplier takes off the bill for short or damaged goods or a price difference. */
export interface SupplierCredit {
  id: string;
  key: string;
  supplierKey: string;
  receiptKey?: string;
  amountCents: number;
  reason: CreditReason;
  note?: string;
  /** Set on a voiding entry: the credit it cancels. */
  reversesKey?: string;
  /** Set when this credit has been voided. */
  voidedByKey?: string;
  recordedByNameSnapshot: string;
  createdAt: string;
}

export interface CreateSupplierCreditInput {
  supplierKey: string;
  receiptKey?: string;
  amountCents: number;
  reason: CreditReason;
  note?: string;
}
