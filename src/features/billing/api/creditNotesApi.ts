import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type {
  CreditNote,
  CreditNoteExchangeItem,
  CreditNoteItem,
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
  CreditNoteStatus,
  RefundBreakdownLeg,
} from '../types';

// Request/response shapes for `/billing/credit-notes` — mirrors the
// backend's `domain::billing::CreateCreditNoteRequest`/`CreditNote`. A
// Credit Note is created as one atomic write (no Draft/Issued editable
// staging — see invoiceStatus.ts's doc comment for the same "no zero-impact
// pre-effect state" reasoning applied here): the server resolves refund
// caps, refund allocation, and stock movements all within this one call.

export interface CreateCreditNoteItemInput {
  productKey?: string;
  name?: string;
  quantity: number;
  reason: string;
  condition: CreditNoteItemCondition;
  disposition?: CreditNoteItemDisposition;
  serialNumber?: string;
  unitPriceCents?: number;
  sourceTicketKey?: string;
}

export interface CreateCreditNoteExchangeItemInput {
  productKey?: string;
  sourceTicketKey?: string;
  quantity: number;
  discountCents: number;
  sourceType: 'retail' | 'repair' | 'print';
  name?: string;
  unitPriceCents?: number;
}

export interface CreateCreditNoteRefundBreakdownInput {
  method: 'cash' | 'card' | 'online';
  amountCents: number;
}

export interface CreateCreditNoteInput {
  /** Absent for a no-receipt credit note. */
  invoiceKey?: string;
  returnedItems: CreateCreditNoteItemInput[];
  exchangeItems?: CreateCreditNoteExchangeItemInput[];
  paymentMethod?: string;
  notes?: string;
  noReceipt?: boolean;
  /** Required to bypass the return window, or to create a no-receipt credit note. */
  overrideReason?: string;
  refundBreakdown?: CreateCreditNoteRefundBreakdownInput[];
}

interface BackendCreditNoteItem {
  productKey?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  reason: string;
  condition: CreditNoteItemCondition;
  disposition?: CreditNoteItemDisposition;
  serialNumber?: string;
  withinWarranty?: boolean;
}

interface BackendCreditNoteExchangeItem {
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: string;
  sourceTicketNumber?: string;
}

export interface BackendCreditNote {
  id: string;
  key: string;
  creditNoteNumber: string;
  invoiceKey?: string;
  invoiceNumber?: string;
  customerKey?: string;
  customerNameSnapshot?: string;
  customerPhoneSnapshot?: string;
  cashierId?: string;
  cashierNameSnapshot?: string;
  returnedItems: BackendCreditNoteItem[];
  /** Omitted from the response entirely when empty (`skip_serializing_if`) — never assume it's an array. */
  exchangeItems?: BackendCreditNoteExchangeItem[];
  returnSubtotalCents: number;
  exchangeSubtotalCents: number;
  netRefundCents: number;
  refundCashCents: number;
  balanceReductionCents: number;
  /** Omitted from the response entirely when empty (`skip_serializing_if`) — never assume it's an array. */
  refundBreakdown?: RefundBreakdownLeg[];
  noReceipt: boolean;
  isManagerOverride: boolean;
  overrideReason?: string;
  exchangeReference?: string;
  status: CreditNoteStatus;
  notes?: string;
  createdAt: string;
}

interface CreditNoteListResponseData {
  creditNotes: BackendCreditNote[];
  total: number;
}

export const toCreditNoteItem = (item: BackendCreditNoteItem, index: number): CreditNoteItem => ({
  id: item.productKey || `line-${index}`,
  productId: item.productKey || '',
  productKey: item.productKey,
  name: item.name,
  sku: item.sku,
  quantity: item.quantity,
  unitPriceCents: item.unitPriceCents,
  discountCents: 0,
  refundAmountCents: item.totalCents,
  reason: item.reason,
  condition: item.condition,
  disposition: item.disposition,
  serialNumber: item.serialNumber,
  withinWarranty: item.withinWarranty,
});

export const toCreditNoteExchangeItem = (
  item: BackendCreditNoteExchangeItem,
  index: number
): CreditNoteExchangeItem => ({
  id: item.productKey || `exchange-${index}`,
  productId: item.productKey || '',
  productKey: item.productKey,
  name: item.name,
  sku: item.sku,
  unitPriceCents: item.unitPriceCents,
  quantity: item.quantity,
  discountCents: item.discountCents,
  totalCents: item.totalCents,
  sourceType: item.sourceType as CreditNoteExchangeItem['sourceType'],
  sourceTicketNumber: item.sourceTicketNumber,
});

export const toCreditNote = (cn: BackendCreditNote): CreditNote => ({
  id: cn.key,
  creditNoteNumber: cn.creditNoteNumber,
  invoiceId: cn.invoiceKey,
  invoiceNumber: cn.invoiceNumber,
  customerId: cn.customerKey,
  customerName: cn.customerNameSnapshot,
  customerPhone: cn.customerPhoneSnapshot,
  cashierId: cn.cashierId,
  cashierName: cn.cashierNameSnapshot,
  items: cn.returnedItems.map(toCreditNoteItem),
  exchangeItems: (cn.exchangeItems ?? []).map(toCreditNoteExchangeItem),
  returnSubtotalCents: cn.returnSubtotalCents,
  exchangeSubtotalCents: cn.exchangeSubtotalCents,
  netRefundCents: cn.netRefundCents,
  refundCashCents: cn.refundCashCents,
  balanceReductionCents: cn.balanceReductionCents,
  refundBreakdown: cn.refundBreakdown ?? [],
  noReceipt: cn.noReceipt,
  isManagerOverride: cn.isManagerOverride,
  overrideReason: cn.overrideReason,
  exchangeReference: cn.exchangeReference,
  status: cn.status,
  notes: cn.notes,
  createdAt: cn.createdAt,
});

export interface FetchCreditNotesParams {
  invoiceKey?: string;
  search?: string;
}

export const createCreditNote = async (input: CreateCreditNoteInput): Promise<CreditNote> => {
  const response = await apiClient.post<ApiResponse<BackendCreditNote>>(
    '/billing/credit-notes',
    input
  );
  return toCreditNote(response.data);
};

export const fetchCreditNotes = async (params?: FetchCreditNotesParams): Promise<CreditNote[]> => {
  const response = await apiClient.get<
    ApiResponse<CreditNoteListResponseData | BackendCreditNote[]>
  >('/billing/credit-notes', {
    params: { invoiceKey: params?.invoiceKey, search: params?.search },
  });
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.creditNotes || [];
  return list.map(toCreditNote);
};

export const fetchCreditNoteById = async (idOrKey: string): Promise<CreditNote> => {
  const response = await apiClient.get<ApiResponse<BackendCreditNote>>(
    `/billing/credit-notes/${idOrKey}`
  );
  return toCreditNote(response.data);
};

// Admin-gated on the backend. Reverses the credit note's payments, customer
// balance effect and any resalable-restock stock movement, and blocks a
// `close_invoice` guard from clearing on the original invoice until this
// runs — mirrors `voidInvoice` in `invoicesApi.ts`.
export const voidCreditNote = async (idOrKey: string, reason: string): Promise<CreditNote> => {
  const response = await apiClient.post<ApiResponse<BackendCreditNote>>(
    `/billing/credit-notes/${idOrKey}/void`,
    { reason }
  );
  return toCreditNote(response.data);
};
