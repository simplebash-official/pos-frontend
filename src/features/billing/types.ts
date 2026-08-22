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

export type {
  CreditNote,
  CreditNoteItem,
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
  CreditNoteStatus,
  CreditNoteExchangeItem,
  RefundBreakdownLeg,
} from '@/offline/db/tables';

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
  items: InvoiceItem[];
  notes?: string;
  shopProfileVersion?: number;
  warrantyTermsSnapshot?: string;
  documentSelection?: 'receipt' | 'invoice' | 'both' | 'none';
}
