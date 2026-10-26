import type { PaymentMethod } from '@/constants/payment';
import type { ReceiptSettlementInput } from '@/features/purchases/types';

export type LineSourceType = 'retail' | 'repair' | 'print';

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  productName?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: LineSourceType;
  sourceTicketNumber?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  returnedQuantity?: number;
  /** Present only for a serial-tracked product line; one entry per unit sold. */
  serialNumbers?: string[];
}

/**
 * What state a returned unit is actually in — independent of whether the
 * Credit Note itself has been resolved. Drives the stock movement (or lack
 * of one) written on Issue: `resalable`/`openBoxDiscount` restock the item,
 * `damaged` requires a `CreditNoteItemDisposition`, `pendingInspection`
 * writes no stock movement at all until someone re-processes it.
 */
export type CreditNoteItemCondition =
  'resalable' | 'damaged' | 'open_box_discount' | 'pending_inspection';

/** Only meaningful (and required) when `condition === 'damaged'`. */
export type CreditNoteItemDisposition = 'return_to_supplier' | 'write_off_scrap' | 'repair_pending';

/** A leg of a refund paid out via a specific method — see `refundBreakdown` below. */
export interface RefundBreakdownLeg {
  method: 'cash' | 'card' | 'online';
  amountCents: number;
}

export interface CreditNoteItem {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  refundAmountCents: number;
  reason: string;
  condition: CreditNoteItemCondition;
  /** Required when `condition === 'damaged'`, absent otherwise. */
  disposition?: CreditNoteItemDisposition;
  /** Present when the returned line was a serial-tracked unit. */
  serialNumber?: string;
  /** Computed server-side from the matched serial's warranty expiry. */
  withinWarranty?: boolean;
}

/**
 * `resolved` — the normal single-atomic-write outcome (a refund/store-credit
 * decision was made at creation time). `awaitingResolution` — created with
 * at least one `pending_inspection` line and no payout decision yet, with no
 * edit-in-place workflow to move it forward — the only way out is `voided`.
 * `voided` — reversed via the admin-gated void action.
 */
export type CreditNoteStatus = 'resolved' | 'awaiting_resolution' | 'voided';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  /** Absent for a no-receipt credit note. */
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId?: string;
  cashierName?: string;
  items: CreditNoteItem[];
  /** Replacement items taken as part of an exchange — empty for a plain return. */
  exchangeItems: CreditNoteExchangeItem[];
  returnSubtotalCents: number;
  exchangeSubtotalCents: number;
  /** `returnSubtotalCents - exchangeSubtotalCents`; positive = owed to customer. */
  netRefundCents: number;
  /** The portion of `netRefundCents` actually paid out, capped at what was collected on the invoice. */
  refundCashCents: number;
  /** The remainder of `netRefundCents` applied to reduce the invoice's outstanding balance instead of paid in cash. */
  balanceReductionCents: number;
  /** How `refundCashCents` was split across payment methods — one leg for a single-method invoice. */
  refundBreakdown: RefundBreakdownLeg[];
  noReceipt: boolean;
  isManagerOverride: boolean;
  overrideReason?: string;
  /** Set whenever `exchangeItems` is non-empty — links the return and the replacement sale for reporting. */
  exchangeReference?: string;
  status: CreditNoteStatus;
  notes?: string;
  createdAt: string;
}

/** A replacement line taken as part of an exchange — a normal sale line, not a returned one. */
export interface CreditNoteExchangeItem {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: 'retail' | 'repair' | 'print';
  sourceTicketNumber?: string;
}

export interface SplitPaymentDetail {
  id: string;
  method: PaymentMethod;
  amountCents: number;
  cardLast4?: string;
  reference?: string;
}

/**
 * `pending` (issued, awaiting payment) → `partially_paid` (some but not all
 * received) → `paid` (fully received). `voided` reverses an invoice's
 * stock/payment effects after the fact (admin-only, mandatory reason) — this
 * codebase has no separate zero-impact "cancelled" state, since stock always
 * deducts at sale time regardless of payment status (see invoiceStatus.ts).
 * `closed` is a manual terminal state set once a paid invoice has no more
 * expected activity. `overdue` is never stored — it's `isOverdue` below.
 */
export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid' | 'voided' | 'closed';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  cashierId?: string;
  cashierName?: string;
  subtotalCents: number;
  discountCents: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPaymentDetail[];
  isCredit?: boolean;
  amountReceivedCents?: number;
  changeDueCents?: number;
  dueDate?: string;
  cardLast4?: string;
  cardRef?: string;
  onlineRef?: string;
  onlineNote?: string;
  status: InvoiceStatus;
  /** Server-computed, never stored — `status` is Pending/PartiallyPaid and `dueDate` has passed. */
  isOverdue: boolean;
  /** Number of (non-voided) credit notes issued against this invoice. */
  creditNoteCount: number;
  /** Convenience flag — `creditNoteCount > 0`. */
  hasCreditNotes: boolean;
  /** Total refunded across all credit notes against this invoice, in cents. */
  refundedCents: number;
  voidedAt?: string;
  voidedBy?: string;
  voidedReason?: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  sessionKey?: string;
  items: InvoiceItem[];
  notes?: string;
  shopProfileVersion?: number;
  warrantyTermsSnapshot?: string;
  documentSelection?: 'receipt' | 'invoice' | 'both' | 'none';
}

export type SessionStatus = 'open' | 'closing' | 'closed' | 'reopened';

export type CashMovementType =
  | 'petty_expense'
  | 'rent_and_bills'
  | 'staff_payment'
  | 'supplier_payment'
  | 'owner_withdrawal'
  | 'add_cash'
  | 'cash_drop'
  | 'no_sale';

/** Which way a movement moves the drawer's cash; stored on every row by the server. */
export type CashDirection = 'out' | 'in' | 'neutral';

export type CashReportGroup =
  | 'operating_expense'
  | 'purchases'
  | 'payroll'
  | 'owner_equity'
  | 'transfer'
  | 'liabilities'
  | 'other_income';

export type CashCategoryReviewStatus = 'approved' | 'needs_review';

/** A category a drawer cash movement is filed under, for one movement type. */
export interface CashCategory {
  id: string;
  key: string;
  movementType: CashMovementType;
  name: string;
  nameSi?: string;
  reportGroup: CashReportGroup;
  isSystem: boolean;
  reviewStatus: CashCategoryReviewStatus;
  pinned: boolean;
  sortOrder: number;
  active: boolean;
  requiresReceipt: boolean;
  requiresApprovalOverCents?: number;
  usageCount: number;
  createdByNameSnapshot?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Fields of a category a manager can change; leave one out to leave it as it is. */
export interface UpdateCashCategoryInput {
  name?: string;
  /** An empty string clears the Sinhala name. */
  nameSi?: string;
  reportGroup?: CashReportGroup;
  pinned?: boolean;
  sortOrder?: number;
  active?: boolean;
  requiresReceipt?: boolean;
  /** Zero clears the limit. */
  requiresApprovalOverCents?: number;
  /** Marks a cashier-made category as looked at. */
  approve?: boolean;
}

/** The shop's drawer rules. */
export interface CashSettings {
  /** Seconds the person who recorded a movement can undo it without a manager. */
  undoWindowSeconds: number;
  /** A payout above this needs a manager PIN whatever its category; absent means no shop-wide limit. */
  approvalThresholdCents?: number;
  /** Amount shortcuts under the amount field, smallest first. */
  quickAmountsCents: number[];
  /** What each drawer should hold after excess is dropped; absent means no target. */
  floatTargetCents?: number;
  version: number;
  updatedAt: string;
}

/** The whole set is sent every time; an absent optional value clears it. */
export interface UpdateCashSettingsInput {
  undoWindowSeconds: number;
  approvalThresholdCents?: number;
  quickAmountsCents: number[];
  floatTargetCents?: number;
}

export interface CreateCashCategoryInput {
  movementType: CashMovementType;
  name: string;
  nameSi?: string;
  reportGroup?: CashReportGroup;
}

export type PayeeType = 'supplier' | 'staff' | 'vendor' | 'other';

/** One row of the shared payee directory (suppliers, staff, vendors and saved names). */
export interface Payee {
  key: string;
  payeeType: PayeeType;
  name: string;
  phone?: string;
  usageCount: number;
  /** False once hidden from the pickers; the payee stays so past payments still show its name. */
  active: boolean;
}

export interface CreatePayeeInput {
  payeeType: Extract<PayeeType, 'vendor' | 'other'>;
  name: string;
  phone?: string;
}

/** Only what changed is sent. A blank phone clears it. */
export interface UpdatePayeeInput {
  name?: string;
  phone?: string;
  active?: boolean;
}

export interface RegisterSession {
  id: string;
  key: string;
  sessionNumber: string;
  terminalId: string;
  cashierId: string;
  cashierNameSnapshot: string;
  status: SessionStatus;
  openedAt: string;
  openingFloatCents: number;
  openingDenominations?: Record<string, number>;
  openingNote?: string;
  expectedOpeningFloatCents?: number;
  openingDiscrepancyCents: number;
  openingDiscrepancyReason?: string;
  openingApprovedById?: string;
  openingApprovedByName?: string;
  closedAt?: string;
  closingCashierId?: string;
  closingCashierNameSnapshot?: string;
  /** What the drawer should hold, worked out by the server on every read. */
  expectedCashCents: number;
  countedCashCents?: number;
  cashVarianceCents?: number;
  closingDenominations?: Record<string, number>;
  closingNote?: string;
  closingFloatCents?: number;
  cashDropToSafeCents?: number;
  varianceReason?: string;
  varianceApprovedById?: string;
  varianceApprovedByName?: string;
  reopenedAt?: string;
  reopenedById?: string;
  reopenedByName?: string;
  reopenedReason?: string;
  totalCashSalesCents: number;
  totalCardSalesCents: number;
  totalOnlineSalesCents: number;
  totalCreditSalesCents: number;
  totalCashRefundsCents: number;
  totalPayInCents: number;
  totalPayOutCents: number;
  totalOwnerWithdrawalsCents: number;
  totalCashDropsCents: number;
  hasLateMovements: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CashMovement {
  id: string;
  key: string;
  movementNumber: string;
  movementType: CashMovementType;
  direction: CashDirection;
  amountCents: number;
  sessionKey?: string;
  terminalId: string;
  categoryKey: string;
  /** Live name of the category, so a rename shows on old movements. */
  categoryName: string;
  customLabel?: string;
  payeeKey?: string;
  payeeName?: string;
  periodStart?: string;
  periodEnd?: string;
  referenceNo?: string;
  note?: string;
  recordedByUserId: string;
  recordedByNameSnapshot: string;
  approvedByUserId?: string;
  approvedByNameSnapshot?: string;
  /** Why a manager allowed a payout over the cash in the drawer, or why the movement was reversed. */
  approvalReason?: string;
  /** Set on a reversal: the movement it cancels. */
  reversesKey?: string;
  /** Set when this movement has been reversed. */
  reversedByKey?: string;
  /** Until when the person who recorded it can undo it without a manager. */
  undoUntil?: string;
  recordedLate: boolean;
  originalVarianceSessionKey?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DrawerState {
  terminalId: string;
  currentBalanceCents: number;
  lastSessionKey?: string;
  lastClosingFloatCents: number;
  updatedAt: string;
}

export interface ZReportPaymentMethodSummary {
  method: string;
  count: number;
  totalCents: number;
}

export interface ZReportCashReconciliation {
  openingFloatCents: number;
  cashSalesCents: number;
  payInCents: number;
  payOutCents: number;
  cashRefundsCents: number;
  ownerWithdrawalsCents: number;
  cashDropsCents: number;
  expectedCashCents: number;
  countedCashCents: number;
  varianceCents: number;
  closingFloatCents: number;
  safeDepositCents: number;
}

/** A shift's movements of one kind and category, totalled by the server (a reversed one and its reversal cancel out). */
export interface ZReportMovementGroup {
  movementType: CashMovementType;
  direction: CashDirection;
  categoryName: string;
  count: number;
  totalCents: number;
}

export interface ZReportResponse {
  session: RegisterSession;
  grossSalesCents: number;
  returnsCents: number;
  netSalesCents: number;
  discountCents: number;
  totalInvoicesCount: number;
  paymentMethods: ZReportPaymentMethodSummary[];
  cashMovements: CashMovement[];
  movementSummary: ZReportMovementGroup[];
  cashReconciliation: ZReportCashReconciliation;
  generatedAt: string;
}

export interface OpenSessionInput {
  terminalId: string;
  openingFloatCents: number;
  openingDenominations?: Record<string, number>;
  openingNote?: string;
  discrepancyReason?: string;
  managerPin?: string;
}

export interface SubmitBlindCountInput {
  countedCashCents: number;
  closingDenominations?: Record<string, number>;
}

export interface CloseSessionInput {
  countedCashCents: number;
  closingDenominations?: Record<string, number>;
  closingFloatCents: number;
  cashDropToSafeCents?: number;
  closingNote?: string;
  varianceReason?: string;
  managerPin?: string;
}

export interface ReopenSessionInput {
  reason: string;
}

export interface CreateCashMovementInput {
  movementType: CashMovementType;
  /** 0 for `no_sale`, above 0 for every other type. */
  amountCents: number;
  sessionKey?: string;
  terminalId: string;
  categoryKey: string;
  customLabel?: string;
  payeeKey?: string;
  payeeName?: string;
  periodStart?: string;
  periodEnd?: string;
  referenceNo?: string;
  note?: string;
  managerPin?: string;
  /** Why a payout bigger than the cash in the drawer is allowed; sent with a manager PIN. */
  overrideReason?: string;
  /** Set to record a rent or bill payment for a month that is already paid. */
  confirmDuplicate?: boolean;
  /** Supplier payments only: the supplier's bills this payment pays, and how much of it each. */
  settlements?: ReceiptSettlementInput[];
}

export interface ReverseCashMovementInput {
  /** Required once the undo window has passed. */
  reason?: string;
}

export interface ConvertVarianceInput {
  reason: string;
  recipient: string;
  managerPin: string;
}

export interface VerifyPinInput {
  pin: string;
  requiredRole?: string;
}

export interface VerifyPinResponse {
  valid: boolean;
  userId?: string;
  userName?: string;
  role?: string;
}

export interface SetPinInput {
  pin: string;
  targetUserId?: string;
}

export interface SessionListQuery {
  search?: string;
  terminalId?: string;
  cashierId?: string;
  status?: string;
  datePreset?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CashMovementListQuery {
  sessionKey?: string;
  terminalId?: string;
  movementType?: string;
  categoryKey?: string;
  payeeKey?: string;
  recordedLate?: boolean;
  datePreset?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** One cost already recorded against a bill's month. */
export interface PeriodPayment {
  /** Where it came from is in `paidFrom`; `number` is the voucher or expense number. */
  number: string;
  date: string;
  amountCents: number;
  paidFrom: 'drawer' | 'bank' | 'card' | 'online' | 'unpaid';
}

export interface PeriodStatus {
  period: string;
  paidCents: number;
  expectedCents?: number;
  alreadyPaid: boolean;
  payments: PeriodPayment[];
}

// ---------------------------------------------------------------------------
// Live calculation of the cart and payment (`POST /calc/checkout`)
// ---------------------------------------------------------------------------

/** A discount as typed: a percentage (0-100) or, for `fixed`, cents. */
export interface CalcDiscount {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface CalcCartLineRequest {
  /** The cart line's id, echoed in its answer so a reply can be matched to its line. */
  key: string;
  unitPriceCents: number;
  quantity: number;
  /** What was typed as this line's discount; `null` for none. */
  discount: CalcDiscount | null;
  sourceType: LineSourceType;
}

export interface CalcCheckoutRequest {
  items: CalcCartLineRequest[];
  /** `value` is a percentage (0-100) or, for `fixed`, cents. `null` for no discount. */
  orderDiscount: CalcDiscount | null;
  payment: {
    method: PaymentMethod;
    tenderedCents: number;
    splitLegsCents: number[];
    customerBalanceCents: number;
    isCredit: boolean;
    creditDepositCents: number;
  };
}

export interface CalcLineReply {
  /** The `key` of the request line this answers. */
  key: string;
  grossCents: number;
  discountCents: number;
  totalCents: number;
}

export interface CalcCheckoutPaymentReply {
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
  /** The `amountReceivedCents` to send with the sale. */
  amountReceivedCents: number;
  /** The most a credit sale can take up front; at least one cent stays on account. */
  maxCreditDepositCents: number;
}

export interface CalcCheckoutReply {
  /** One per request line, in order. */
  items: CalcLineReply[];
  itemCount: number;
  totalUnitCount: number;
  subtotalCents: number;
  orderDiscountCents: number;
  totalCents: number;
  sourceBreakdown: { retailCents: number; repairsCents: number; printCents: number };
  payment: CalcCheckoutPaymentReply;
  /** Cash amounts to offer as quick buttons, smallest first. */
  quickTenderCents: number[];
}

// ---------------------------------------------------------------------------
// Live calculation of a return (`POST /calc/credit-note`)
// ---------------------------------------------------------------------------

export interface CalcCreditNoteRequest {
  /** The invoice the return is against; `null` for a return with no receipt. */
  invoiceKey: string | null;
  returned: { lineIndex: number; quantity: number }[];
  /** Set (with `invoiceKey: null`) for a return with no receipt; 0 for what is not typed yet. */
  noReceipt: { unitPriceCents: number; quantity: number } | null;
  exchanged: { unitPriceCents: number; quantity: number }[];
}

export interface CalcCreditNoteReply {
  /** One per requested returned line, in order. */
  lines: { lineIndex: number; unitCents: number; refundCents: number }[];
  returnSubtotalCents: number;
  exchangeSubtotalCents: number;
  /** Positive: the customer is owed this; negative: the customer owes it. */
  netRefundCents: number;
  /** The part of the net that goes back as cash (capped at what was paid on the invoice). */
  refundCashCents: number;
  /** The part that only reduces what the customer owes. */
  balanceReductionCents: number;
  /** Where the cash goes by default. */
  refundLegs: { method: string; amountCents: number }[];
  isRefundDue: boolean;
  isCustomerOwing: boolean;
  isEvenExchange: boolean;
  /** Whole days since the sale; `null` for a return with no receipt. */
  daysSinceSale: number | null;
  returnWindowDays: number;
  pastReturnWindow: boolean;
}

// ---------------------------------------------------------------------------
// Live calculations for cash (`POST /calc/cash-movement|cash-count|shift-count`)
// ---------------------------------------------------------------------------

export interface CalcCashMovementRequest {
  movementType: CashMovementType;
  amountCents: number;
  categoryKey: string | null;
  sessionKey: string | null;
  terminalId: string;
  payeeKey: string | null;
  payeeName: string;
  /** `YYYY-MM`. */
  period: string | null;
  settlementAmountsCents: number[];
  pinEntered: boolean;
  pinVerified: boolean;
  overrideReasonEntered: boolean;
  confirmDuplicate: boolean;
}

export type CashMovementBlocker =
  | 'amount_missing'
  | 'category_missing'
  | 'open_reason_missing'
  | 'rent_payee_missing'
  | 'period_missing'
  | 'staff_missing'
  | 'supplier_missing'
  | 'over_allocated'
  | 'who_took_cash_missing'
  | 'pin_missing'
  | 'pin_not_verified'
  | 'override_reason_missing'
  | 'period_already_paid';

export interface CalcCashMovementReply {
  takesCashOut: boolean;
  cashInDrawerCents: number;
  cashAfterCents: number;
  drawerDeltaCents: number;
  overDrawer: boolean;
  pinRequired: boolean;
  periodAlreadyPaid: boolean;
  blockers: CashMovementBlocker[];
}

export interface CalcCashCountRequest {
  /** How many of each note or coin, keyed by its rupee value. */
  counts: Record<string, number>;
}

export interface CashCountLine {
  id: string;
  valueCents: number;
  count: number;
  subtotalCents: number;
}

export interface CalcCashCountReply {
  lines: CashCountLine[];
  totalCents: number;
}

export interface CalcShiftCountRequest {
  /** Closing: the open shift. */
  sessionKey: string | null;
  /** Opening: the terminal being counted. */
  terminalId: string | null;
  countedCents: number;
  closingFloatCents: number | null;
}

export interface CalcShiftCountReply {
  /** The count that was asked about. */
  countedCents: number;
  expectedCents: number;
  varianceCents: number;
  reasonRequired: boolean;
  pinRequired: boolean;
  /** How far off a closing count can be before it needs a manager PIN. */
  varianceToleranceCents: number;
  /** Closing: the float that stays in the drawer (the one chosen, else the opening float). */
  closingFloatCents: number | null;
  /** Closing: the opening float, or the whole count when that is less. */
  keepOpeningFloatCents: number | null;
  safeDepositCents: number | null;
}

export interface CalcInvoiceBalanceRequest {
  invoiceKey: string;
}

export interface CalcInvoiceBalanceReply {
  /** Everything paid against the invoice (checkout deposit and later payments). */
  paidCents: number;
  /** What is still owed; nothing for a sale paid at the till. */
  balanceDueCents: number;
}

export interface CalcShiftTotalsRequest {
  sessionKeys: string[];
}

export interface CalcShiftTotalsReply {
  shiftCount: number;
  /** Open, closing or reopened: still counting sales. */
  runningCount: number;
  cashSalesCents: number;
  /** Net cash difference of the closed shifts: over is positive, short is negative. */
  netVarianceCents: number;
}
