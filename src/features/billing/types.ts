import type { PaymentMethod } from '@/constants/payment';

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
  | 'pay_in'
  | 'pay_out_expense'
  | 'pay_out_supplier'
  | 'owner_withdrawal'
  | 'cash_drop'
  | 'drawer_open_no_sale';

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
  expectedCashCents?: number;
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
  amountCents: number;
  sessionKey?: string;
  terminalId: string;
  reason: string;
  recipientOrSource?: string;
  supplierKey?: string;
  recordedByUserId: string;
  recordedByNameSnapshot: string;
  approvedByUserId?: string;
  approvedByNameSnapshot?: string;
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

export interface ZReportResponse {
  session: RegisterSession;
  grossSalesCents: number;
  returnsCents: number;
  netSalesCents: number;
  discountCents: number;
  totalInvoicesCount: number;
  paymentMethods: ZReportPaymentMethodSummary[];
  cashMovements: CashMovement[];
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
  amountCents: number;
  sessionKey?: string;
  terminalId: string;
  reason: string;
  recipientOrSource?: string;
  supplierKey?: string;
  managerPin?: string;
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
  recordedLate?: boolean;
  datePreset?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
