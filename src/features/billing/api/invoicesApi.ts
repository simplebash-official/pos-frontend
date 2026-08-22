import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type { Invoice, InvoiceItem, InvoiceStatus, SplitPaymentDetail } from '../types';

// Request shape for `POST /billing/sales` — mirrors the backend's
// `domain::billing::CreateSaleRequest`. `cashierId` is deliberately absent:
// the completing cashier is always derived server-side from the bearer
// token, never client-supplied (see that struct's doc comment).
// Only ad-hoc lines (no `productKey`/`sourceTicketKey`) need `name`/`sku`/
// `unitPriceCents`/`totalCents`/`sourceTicketNumber`/`assignedEmployeeName` —
// when a key is present the server resolves those from the product/ticket
// record and ignores anything sent for them.
export interface CompleteSaleItemInput {
  productKey?: string;
  sourceTicketKey?: string;
  quantity: number;
  discountCents: number;
  sourceType: 'retail' | 'repair' | 'print';
  name?: string;
  sku?: string;
  unitPriceCents?: number;
  totalCents?: number;
  sourceTicketNumber?: string;
  assignedEmployeeName?: string;
  /** Which specific in-stock units are being sold, for a serial-tracked product. */
  serialNumbers?: string[];
}

export interface CompleteSaleSplitPaymentInput {
  method: string;
  amountCents: number;
  cardLast4?: string;
  reference?: string;
}

export interface CompleteSalePricingAdjustments {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface CompleteSalePaymentInput {
  paymentMethod: string;
  isCredit?: boolean;
  amountReceivedCents?: number;
  splitPayments?: CompleteSaleSplitPaymentInput[];
  cardLast4?: string;
  cardRef?: string;
  onlineRef?: string;
  onlineNote?: string;
  dueDate?: string;
}

export interface CompleteSaleInput {
  staff: { cashierName: string };
  customer?: {
    customerKey?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
  };
  items: CompleteSaleItemInput[];
  pricingAdjustments?: CompleteSalePricingAdjustments;
  payment: CompleteSalePaymentInput;
  notes?: string;
  // The frontend's current `ShopProfile` object, embedded verbatim by the
  // backend as a frozen snapshot on the invoice — see CLAUDE.md's D2 note.
  // Untyped here on purpose: this module doesn't need to know the shape,
  // only pass it through.
  shopProfileSnapshot: unknown;
  warrantyTermsSnapshot?: string;
  documentSelection?: string;
}

interface BackendInvoiceItem {
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType: string;
  sourceTicketKey?: string;
  sourceTicketNumber?: string;
  assignedEmployeeName?: string;
  serialNumbers?: string[];
}

interface BackendSplitPayment {
  method: string;
  amountCents: number;
  cardLast4?: string;
  reference?: string;
}

export interface BackendInvoice {
  id: string;
  key: string;
  invoiceNumber: string;
  customerKey?: string;
  customerNameSnapshot?: string;
  customerPhoneSnapshot?: string;
  customerAddressSnapshot?: string;
  cashierId: string;
  cashierNameSnapshot: string;
  items: BackendInvoiceItem[];
  subtotalCents: number;
  discountCents: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  totalCents: number;
  paymentMethod: string;
  splitPayments?: BackendSplitPayment[];
  isCredit: boolean;
  amountReceivedCents?: number;
  changeDueCents?: number;
  dueDate?: string;
  cardLast4?: string;
  cardRef?: string;
  onlineRef?: string;
  onlineNote?: string;
  status: InvoiceStatus;
  isOverdue: boolean;
  // The backend only ever sends `creditNoteCount` — there is no
  // `hasCreditNotes` field on the wire. It's a convenience flag computed
  // client-side in `toInvoice` (`creditNoteCount > 0`), never read directly
  // off this response type.
  creditNoteCount: number;
  refundedCents: number;
  voidedAt?: string;
  voidedBy?: string;
  voidedReason?: string;
  closedAt?: string;
  closedBy?: string;
  notes?: string;
  warrantyTermsSnapshot?: string;
  documentSelection?: string;
  createdAt: string;
}

export interface BackendPaymentRecord {
  id: string;
  key: string;
  invoiceKey: string;
  amountCents: number;
  paymentMethod: string;
  notes?: string;
  recordedByUserId: string;
  recordedByNameSnapshot: string;
  recordedAt: string;
}

interface CompleteSaleResponseData {
  invoice: BackendInvoice;
  payments: BackendPaymentRecord[];
  warnings: string[];
}

interface InvoiceListResponseData {
  invoices: BackendInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const toInvoiceItem = (item: BackendInvoiceItem, index: number): InvoiceItem => ({
  id: item.sourceTicketKey || item.productKey || `line-${index}`,
  productId: item.sourceTicketKey || item.productKey || '',
  name: item.name,
  sku: item.sku,
  unitPriceCents: item.unitPriceCents,
  quantity: item.quantity,
  discountCents: item.discountCents,
  totalCents: item.totalCents,
  sourceType: item.sourceType as InvoiceItem['sourceType'],
  sourceTicketNumber: item.sourceTicketNumber,
  assignedEmployeeName: item.assignedEmployeeName,
  serialNumbers: item.serialNumbers,
});

export const toSplitPayment = (sp: BackendSplitPayment, index: number): SplitPaymentDetail => ({
  id: `split-${index}`,
  method: sp.method as SplitPaymentDetail['method'],
  amountCents: sp.amountCents,
  cardLast4: sp.cardLast4,
  reference: sp.reference,
});

export const toInvoice = (inv: BackendInvoice): Invoice => ({
  id: inv.key,
  invoiceNumber: inv.invoiceNumber,
  customerId: inv.customerKey,
  customerName: inv.customerNameSnapshot,
  customerPhone: inv.customerPhoneSnapshot,
  customerAddress: inv.customerAddressSnapshot,
  cashierId: inv.cashierId,
  cashierName: inv.cashierNameSnapshot,
  subtotalCents: inv.subtotalCents,
  discountCents: inv.discountCents,
  discountType: inv.discountType,
  discountValue: inv.discountValue,
  totalCents: inv.totalCents,
  paymentMethod: inv.paymentMethod as Invoice['paymentMethod'],
  splitPayments: inv.splitPayments?.map(toSplitPayment),
  isCredit: inv.isCredit,
  amountReceivedCents: inv.amountReceivedCents,
  changeDueCents: inv.changeDueCents,
  dueDate: inv.dueDate,
  cardLast4: inv.cardLast4,
  cardRef: inv.cardRef,
  onlineRef: inv.onlineRef,
  onlineNote: inv.onlineNote,
  status: inv.status,
  isOverdue: inv.isOverdue,
  creditNoteCount: inv.creditNoteCount,
  hasCreditNotes: inv.creditNoteCount > 0,
  refundedCents: inv.refundedCents,
  voidedAt: inv.voidedAt,
  voidedBy: inv.voidedBy,
  voidedReason: inv.voidedReason,
  closedAt: inv.closedAt,
  closedBy: inv.closedBy,
  createdAt: inv.createdAt,
  items: inv.items.map(toInvoiceItem),
  notes: inv.notes,
  warrantyTermsSnapshot: inv.warrantyTermsSnapshot,
  documentSelection: inv.documentSelection as Invoice['documentSelection'],
});

export interface CompleteSaleResult {
  invoice: Invoice;
  warnings: string[];
}

// The only caller is `invoices.resource.ts` — per the offline-sync rule that
// only `src/offline/resources/` may import a synced resource's `api/` module.
export const completeSale = async (
  input: CompleteSaleInput,
  options?: MutationRequestOptions
): Promise<CompleteSaleResult> => {
  const response = await apiClient.post<ApiResponse<CompleteSaleResponseData>>(
    '/billing/sales',
    input,
    options
  );
  return {
    invoice: toInvoice(response.data.invoice),
    warnings: response.data.warnings,
  };
};

export interface FetchInvoicesParams {
  /** Free-text match against invoice number / customer name / customer phone. */
  search?: string;
  /**
   * `InvoiceStatus` value, or the synthetic `"overdue"` value (Pending/
   * PartiallyPaid past `dueDate`, computed server-side — see
   * `InvoiceListQuery.status` in the backend).
   */
  status?: InvoiceStatus | 'overdue';
  /** Exact match: "cash" | "card" | "online" | "split". */
  paymentMethod?: string;
  /** Only `"today"` is meaningful; omit for all time. */
  datePreset?: 'today';
}

// `limit: 200` rather than paginating — mirrors `repairsApi.ts`/
// `printJobsApi.ts`'s reasoning: the mock this replaces always returned
// every invoice, and `InvoicesList.tsx` has no pagination UI today.
// These params are only passed by `useBackendFilteredList`
// (`InvoicesList.tsx`) — the sync engine's `pull.full`
// (`invoices.resource.ts`) always calls this with no params, so a filter
// never scopes what gets mirrored offline.
export const fetchInvoices = async (params?: FetchInvoicesParams): Promise<Invoice[]> => {
  const response = await apiClient.get<ApiResponse<InvoiceListResponseData>>('/billing/invoices', {
    params: {
      limit: 200,
      search: params?.search,
      status: params?.status,
      paymentMethod: params?.paymentMethod,
      datePreset: params?.datePreset,
    },
  });
  return response.data.invoices.map(toInvoice);
};

export const fetchInvoiceById = async (idOrKey: string): Promise<Invoice> => {
  const response = await apiClient.get<ApiResponse<BackendInvoice>>(`/billing/invoices/${idOrKey}`);
  return toInvoice(response.data);
};

// Admin-gated on the backend (`billing::routes::void_invoice`). Reverses an
// invoice's stock/payment effects after the fact — the only "call this off"
// action this codebase has, since a sale is one atomic write with no
// pre-payment draft state to cancel without impact (see invoiceStatus.ts).
// `reason` is mandatory server-side.
export const voidInvoice = async (
  idOrKey: string,
  reason: string,
  options?: MutationRequestOptions
): Promise<Invoice> => {
  const response = await apiClient.post<ApiResponse<BackendInvoice>>(
    `/billing/invoices/${idOrKey}/void`,
    { reason },
    options
  );
  return toInvoice(response.data);
};

// Admin-gated on the backend (`billing::routes::close_invoice`). Manual
// terminal action — only valid from Paid with zero open credit notes.
export const closeInvoice = async (
  idOrKey: string,
  options?: MutationRequestOptions
): Promise<Invoice> => {
  const response = await apiClient.post<ApiResponse<BackendInvoice>>(
    `/billing/invoices/${idOrKey}/close`,
    {},
    options
  );
  return toInvoice(response.data);
};
