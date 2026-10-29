/* tslint:disable */
/* eslint-disable */
export interface BatchCost {
  quantity: number;
  unit_cost_cents: number;
}

export interface Blocker {
  code: BlockerCode;
  line: number | undefined;
  charge: number | undefined;
}

export interface CalcCartLine {
  key: string;
  unitPriceCents: number;
  quantity: number;
  discount: CalcDiscount | undefined;
  sourceType: CalcSource;
}

export interface CalcCashCountReply {
  lines: CashCountLine[];
  totalCents: number;
}

export interface CalcCashCountRequest {
  counts: Record<string, number>;
}

export interface CalcCharge {
  kind: ChargeKind | undefined;
  amountCents: number;
  billedBy: BilledBy | undefined;
  allocation: Allocation | undefined;
  description: string;
}

export interface CalcChargesPayment {
  source: PaymentSource | undefined;
  paidOn: string;
}

export interface CalcCheckoutPayment {
  method: CalcPaymentMethod;
  tenderedCents: number;
  splitLegsCents: number[];
  customerBalanceCents: number;
  isCredit: boolean;
  creditDepositCents: number;
}

export interface CalcCheckoutReply {
  items: CalcLineReply[];
  itemCount: number;
  totalUnitCount: number;
  subtotalCents: number;
  orderDiscountCents: number;
  totalCents: number;
  sourceBreakdown: CalcSourceBreakdown;
  payment: CalcPaymentReply;
  quickTenderCents: number[];
}

export interface CalcCheckoutRequest {
  items: CalcCartLine[];
  orderDiscount: CalcDiscount | undefined;
  payment: CalcCheckoutPayment;
}

export interface CalcDiscount {
  type: CalcDiscountType;
  value: number;
}

export interface CalcEarningsReply {
  priceEntered: boolean;
  profitCents: number;
  commissionCents: number;
  capped: boolean;
  shopKeepsCents: number;
}

export interface CalcEarningsRequest {
  priceCents: number | undefined;
  materialCostCents: number;
  splitType: SplitKind | undefined;
  splitValue: number;
}

export interface CalcLine {
  productKey: string | undefined;
  serialized: boolean;
  quantity: number | undefined;
  costMode: CostMode;
  costCents: number;
  pricingMode: PricingMode;
  sellingPriceCents: number;
  marginTenths: number | undefined;
  stepCents: number | undefined;
  serialNumbers: string[];
}

export interface CalcLineReply {
  key: string;
  grossCents: number;
  discountCents: number;
  totalCents: number;
}

export interface CalcMargin {
  profitEachCents: number;
  lotProfitCents: number;
  marginTenths: number;
  belowCost: boolean;
}

export interface CalcPayment {
  mode: PaymentMode;
  source: PaymentSource | undefined;
  partCents: number;
  paidOn: string;
  categoryKey: string | undefined;
}

export interface CalcPaymentReply {
  effectiveTenderedCents: number;
  changeDueCents: number;
  shortByCents: number;
  isCashShort: boolean;
  isCardShort: boolean;
  isFullyPaid: boolean;
  splitAllocatedCents: number;
  splitRemainingCents: number;
  isSplitValid: boolean;
  newCustomerBalanceCents: number;
  creditPaidNowCents: number;
  creditRemainderCents: number;
  amountReceivedCents: number;
  maxCreditDepositCents: number;
}

export interface CalcQuotationLine {
  key: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  discount: CalcQuotationLineDiscount | undefined;
}

export interface CalcQuotationLineDiscount {
  type: QuotationDiscountType;
  scope: QuotationDiscountScope;
  value: number;
}

export interface CalcQuotationLineReply {
  key: string;
  grossCents: number;
  discountCents: number;
  totalCents: number;
}

export interface CalcQuotationOrderDiscount {
  type: QuotationDiscountType;
  value: number;
}

export interface CalcQuotationReply {
  lines: CalcQuotationLineReply[];
  grossSubtotalCents: number;
  lineDiscountsCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  blockers: QuotationBlocker[];
}

export interface CalcQuotationRequest {
  customerKey: string | undefined;
  customerName: string;
  lines: CalcQuotationLine[];
  orderDiscount: CalcQuotationOrderDiscount | undefined;
  validUntil: string;
}

export interface CalcReceiptLineReply {
  goodsCents: number;
  landedCents: number;
  unitCostCents: number;
  costAsUnitCents: number | undefined;
  costAsLotCents: number;
  sellingPriceCents: number;
  priceWithoutRoundingCents: number | undefined;
  priceRoundedUp: boolean;
  margin: CalcMargin | undefined;
  marginTenthsIfSwitched: number | undefined;
}

export interface CalcReceiptReply {
  lines: CalcReceiptLineReply[];
  summary: CalcReceiptSummary;
  chargesIncomplete: boolean;
  involvesCash: boolean;
  blockers: Blocker[];
}

export interface CalcReceiptRequest {
  supplierKey: string | undefined;
  referenceNo: string;
  date: string;
  lines: CalcLine[];
  charges: CalcCharge[];
  chargesPayment: CalcChargesPayment;
  payment: CalcPayment;
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

export interface CalcSharesReply {
  totalCents: number;
  parts: ShareLine[];
}

export interface CalcSharesRequest {
  parts: SharePart[];
}

export interface CalcSourceBreakdown {
  retailCents: number;
  repairsCents: number;
  printCents: number;
}

export interface CartLine {
  unit_price_cents: number;
  quantity: number;
  discount: LineDiscount;
  source: LineSource;
}

export interface CartTotals {
  lines: LineTotals[];
  subtotal_cents: number;
  order_discount_cents: number;
  total_cents: number;
  unit_count: number;
  retail_cents: number;
  repairs_cents: number;
  print_cents: number;
}

export interface CashCountLine {
  id: string;
  valueCents: number;
  count: number;
  subtotalCents: number;
}

export interface ChargeFigure {
  kind: ChargeKind;
  amount_cents: number;
  billed_by: BilledBy;
}

export interface ChargeTotals {
  supplier_billed_cents: number;
  paid_to_others_cents: number;
}

export interface LineMargin {
  profit_each_cents: number;
  lot_profit_cents: number;
  margin_tenths: number;
  below_cost: boolean;
}

export interface LineTotals {
  gross_cents: number;
  discount_cents: number;
  total_cents: number;
}

export interface PaymentState {
  effective_tendered_cents: number;
  change_due_cents: number;
  short_by_cents: number;
  is_cash_short: boolean;
  is_card_short: boolean;
  is_fully_paid: boolean;
  split_allocated_cents: number;
  split_remaining_cents: number;
  is_split_valid: boolean;
  new_customer_balance_cents: number;
  credit_paid_now_cents: number;
  credit_remainder_cents: number;
  amount_received_cents: number;
}

export interface QuotationBlocker {
  code: QuotationBlockerCode;
  line: number | undefined;
}

export interface ShareLine {
  key: string;
  basisPoints: number;
  percent: number;
}

export interface SharePart {
  key: string;
  cents: number;
  wholeCents: number | undefined;
}

export type Allocation = 'value' | 'quantity';

export type BilledBy = 'supplier' | 'third_party';

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

export type CalcDiscountType = 'percentage' | 'fixed';

export type CalcPaymentMethod = 'cash' | 'card' | 'online' | 'split';

export type CalcSource = 'retail' | 'repair' | 'print';

export type ChargeKind = 'shipping' | 'customs' | 'handling' | 'insurance' | 'other' | 'discount';

export type CostMode = 'unit' | 'lot';

export type LineDiscount =
  { type: 'none' } | { type: 'fixed'; value: number } | { type: 'percentage'; value: number };

export type LineSource = 'retail' | 'repair' | 'print';

export type PaymentMode = 'credit' | 'full' | 'part';

export type PaymentSource = 'drawer' | 'bank' | 'card' | 'online' | 'owner_pocket';

export type PricingMode = 'price' | 'margin';

export type QuotationBlockerCode =
  | 'customer_missing'
  | 'no_lines'
  | 'name_missing'
  | 'quantity_invalid'
  | 'order_discount_negative'
  | 'order_discount_over100'
  | 'valid_until_invalid'
  | 'valid_until_in_past';

export type QuotationDiscountScope = 'per_unit' | 'total';

export type QuotationDiscountType = 'percentage' | 'fixed';

export type SplitKind = 'percentage' | 'fixed';

export type TenderMethod = 'cash' | 'card' | 'online' | 'split';

export function calc_cash_count(request: CalcCashCountRequest): CalcCashCountReply;

export function calc_checkout(request: CalcCheckoutRequest): CalcCheckoutReply;

export function calc_earnings(request: CalcEarningsRequest): CalcEarningsReply;

export function calc_quotation(request: CalcQuotationRequest): CalcQuotationReply;

export function calc_receipt(request: CalcReceiptRequest): CalcReceiptReply;

export function calc_shares(request: CalcSharesRequest): CalcSharesReply;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly calc_cash_count: (a: any) => [number, number, number];
  readonly calc_checkout: (a: any) => [number, number, number];
  readonly calc_earnings: (a: any) => [number, number, number];
  readonly calc_quotation: (a: any) => [number, number, number];
  readonly calc_receipt: (a: any) => [number, number, number];
  readonly calc_shares: (a: any) => [number, number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>
): Promise<InitOutput>;
