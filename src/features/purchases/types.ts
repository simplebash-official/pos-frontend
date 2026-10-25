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
  /** What the line cost before extra charges: the supplier's price for these units. */
  lineTotalCents: number;
  /** This line's share of the receipt's extra charges (discounts negative). */
  chargesShareCents: number;
  /** What the units really cost: the line total plus its share of extra charges. */
  landedTotalCents: number;
  /** The landed total per unit, rounded to the nearest cent for display. */
  landedUnitCostCents: number;
  /** Price the received units were set to sell at. */
  sellingPriceCents: number;
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

/** What kind of extra charge it is. A discount takes money off; the rest add to the cost. */
export type ChargeKind = 'shipping' | 'customs' | 'handling' | 'insurance' | 'other' | 'discount';

/** Who asks for the money of an extra charge. */
export type BilledBy = 'supplier' | 'third_party';

/** How an extra charge is spread over the products on the receipt. */
export type ChargeAllocation = 'value' | 'quantity';

/** An extra charge on a receipt. */
export interface ReceiptCharge {
  id: string;
  key: string;
  receiptKey: string;
  supplierKey: string;
  kind: ChargeKind;
  /** Always positive; a discount is a `discount` kind. */
  amountCents: number;
  billedBy: BilledBy;
  allocation?: ChargeAllocation;
  /** The payee a third-party charge was paid to, when one was named. */
  payeeKey?: string;
  /** What an "other" charge is. */
  description?: string;
  paymentKind?: PaymentKind;
  paymentKey?: string;
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
  /** What the lines cost, before any extra charge. */
  goodsCents: number;
  /** Extra charges the supplier put on the bill, discounts taken off. Adds to what is owed. */
  extraChargesCents: number;
  /** Extra charges paid to someone other than the supplier. Not owed to the supplier. */
  paidToOthersCents: number;
  /** What the supplier's bill comes to: the goods plus the charges it carries. */
  totalCents: number;
  charges: ReceiptCharge[];
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
}

/** How the extra charges paid to someone else are paid, as the receipt is recorded. */
export interface ChargesPaymentInput {
  source: PaymentSource;
  /** Cash only (drawer, owner's pocket). */
  terminalId?: string;
  sessionKey?: string;
  /** Bank, card and online only: `YYYY-MM-DD`. */
  paidOn?: string;
}

/** An extra charge on a receipt being recorded. */
export interface ReceiptChargeInput {
  kind: ChargeKind;
  amountCents: number;
  billedBy: BilledBy;
  /** Required with two or more products, refused with one. */
  allocation?: ChargeAllocation;
  /** The saved payee a charge paid to someone else goes to. Optional. */
  payeeKey?: string;
  /** What an "other" charge is, in a few words. Optional, and only for the "other" kind. */
  description?: string;
}

/** One manager or owner approval for all the cash this request takes out of the drawer. */
export interface ReceiptApprovalInput {
  managerPin: string;
  overrideReason?: string;
}

export interface ReceiptLineInput {
  productKey: string;
  quantity: number;
  /** What the whole line costs: the supplier's lot price, or quantity x price each. */
  lineTotalCents: number;
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
  charges: ReceiptChargeInput[];
  /** Present only when a charge is paid to someone else. */
  chargesPayment?: ChargesPaymentInput;
  approval?: ReceiptApprovalInput;
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

// ---------------------------------------------------------------------------
// Live calculation of the Receive Stock form (`POST /calc/receipt`)
// ---------------------------------------------------------------------------

/** One product line as typed. `null` is a box still empty; 0 is an amount not typed yet. */
export interface CalcReceiptLineRequest {
  productKey: string | null;
  serialized: boolean;
  quantity: number | null;
  costMode: 'unit' | 'lot';
  costCents: number;
  pricingMode: 'price' | 'margin';
  sellingPriceCents: number;
  marginTenths: number | null;
  stepCents: number | null;
  serialNumbers: string[];
}

export interface CalcReceiptChargeRequest {
  kind: ChargeKind | null;
  amountCents: number;
  billedBy: BilledBy | null;
  allocation: ChargeAllocation | null;
  description: string;
}

export interface CalcReceiptRequest {
  supplierKey: string | null;
  referenceNo: string;
  date: string;
  lines: CalcReceiptLineRequest[];
  charges: CalcReceiptChargeRequest[];
  chargesPayment: { source: PaymentSource | null; paidOn: string };
  payment: {
    mode: 'credit' | 'full' | 'part';
    source: PaymentSource | null;
    partCents: number;
    paidOn: string;
    categoryKey: string | null;
  };
}

export interface CalcMargin {
  profitEachCents: number;
  lotProfitCents: number;
  /** Tenths of a percent: 167 is 16.7%. */
  marginTenths: number;
  belowCost: boolean;
}

export interface CalcReceiptLineReply {
  goodsCents: number;
  /** Goods plus this line's share of the extra charges that are filled in. */
  landedCents: number;
  unitCostCents: number;
  /** The cost as a price each; `null` when the lot does not divide evenly. */
  costAsUnitCents: number | null;
  costAsLotCents: number;
  /** The price that will be saved; 0 while it cannot be worked out yet. */
  sellingPriceCents: number;
  priceWithoutRoundingCents: number | null;
  priceRoundedUp: boolean;
  margin: CalcMargin | null;
  /** The margin to start from when switching price to margin; `null` when it does not fit. */
  marginTenthsIfSwitched: number | null;
}

export interface CalcReceiptSummary {
  goodsCents: number;
  extraBilledCents: number;
  totalCents: number;
  paidToOthersCents: number;
  payingNowCents: number;
  leftOwedCents: number;
  cashOutTodayCents: number;
}

export type BlockerCode =
  | 'supplier_missing'
  | 'date_invalid'
  | 'reference_too_long'
  | 'no_lines'
  | 'product_missing'
  | 'product_duplicate'
  | 'quantity_missing'
  | 'cost_lot_missing'
  | 'cost_unit_missing'
  | 'margin_missing'
  | 'step_missing'
  | 'margin_unreachable'
  | 'price_missing'
  | 'serials_missing'
  | 'serials_duplicate'
  | 'charge_kind_missing'
  | 'charge_amount_missing'
  | 'charge_billed_by_missing'
  | 'charge_discount_not_on_supplier_bill'
  | 'charge_description_too_long'
  | 'charge_allocation_missing'
  | 'charges_source_missing'
  | 'charges_day_invalid'
  | 'discounts_exceed_line'
  | 'discounts_exceed_bill'
  | 'payment_source_missing'
  | 'payment_category_missing'
  | 'part_amount_missing'
  | 'part_is_whole_bill'
  | 'payment_day_invalid';

/** One thing that stops Save. `line` / `charge` are zero-based positions. */
export interface CalcBlocker {
  code: BlockerCode;
  line: number | null;
  charge: number | null;
}

export interface CalcReceiptReply {
  lines: CalcReceiptLineReply[];
  summary: CalcReceiptSummary;
  /** True while an extra charge is half filled in, so it is not counted yet. */
  chargesIncomplete: boolean;
  /** True when cash leaves the drawer, which is what a manager's approval is for. */
  involvesCash: boolean;
  blockers: CalcBlocker[];
}
