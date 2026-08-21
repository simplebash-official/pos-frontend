import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type { ReturnRecord, ReturnPayoutMethod, ReturnItem } from '@/offline/db/tables';

export type { ReturnRecord, ReturnPayoutMethod, ReturnItem };

export interface ProcessReturnItemInput {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  refundAmountCents: number;
  restockInventory: boolean;
  reason: string;
}

export interface ProcessReturnInput {
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId?: string;
  cashierName?: string;
  items: ProcessReturnItemInput[];
  totalRefundCents: number;
  payoutMethod: ReturnPayoutMethod;
  notes?: string;
}

interface BackendReturnItem {
  id?: string;
  productId?: string;
  productKey?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
  discountCents?: number;
  refundAmountCents?: number;
  totalCents?: number;
  restockAction?: string;
  restockInventory?: boolean;
  reason: string;
}

export interface BackendReturnRecord {
  id: string;
  key?: string;
  originalInvoiceId?: string;
  invoiceKey?: string;
  originalInvoiceNumber?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerKey?: string;
  customerName?: string;
  customerNameSnapshot?: string;
  customerPhone?: string;
  customerPhoneSnapshot?: string;
  cashierId?: string;
  cashierName?: string;
  cashierNameSnapshot?: string;
  items?: BackendReturnItem[];
  returnedItems?: BackendReturnItem[];
  totalRefundCents?: number;
  netRefundCents?: number;
  returnSubtotalCents?: number;
  payoutMethod?: ReturnPayoutMethod;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

interface ReturnListResponseData {
  returns: BackendReturnRecord[];
  total: number;
}

export const toReturnRecord = (record: BackendReturnRecord): ReturnRecord => {
  const rawItems = record.returnedItems || record.items || [];
  return {
    id: record.key || record.id,
    originalInvoiceId: record.invoiceKey || record.originalInvoiceId || '',
    originalInvoiceNumber: record.invoiceNumber || record.originalInvoiceNumber || '',
    customerId: record.customerKey || record.customerId,
    customerName: record.customerNameSnapshot || record.customerName,
    customerPhone: record.customerPhoneSnapshot || record.customerPhone,
    cashierId: record.cashierId,
    cashierName: record.cashierNameSnapshot || record.cashierName,
    items: rawItems.map((item: BackendReturnItem, idx: number) => ({
      id: item.id || `item-${idx}`,
      productId: item.productKey || item.productId || '',
      productKey: item.productKey,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      discountCents: item.discountCents || 0,
      refundAmountCents:
        item.totalCents ?? item.refundAmountCents ?? item.unitPriceCents * item.quantity,
      restockInventory:
        item.restockAction === 'restock_to_inventory' || item.restockInventory !== false,
      reason: item.reason,
    })),
    totalRefundCents:
      record.netRefundCents ?? record.totalRefundCents ?? record.returnSubtotalCents ?? 0,
    payoutMethod: (record.paymentMethod as ReturnPayoutMethod) || record.payoutMethod || 'cash',
    notes: record.notes,
    createdAt: record.createdAt || new Date().toISOString(),
  };
};

export interface FetchReturnsParams {
  invoiceKey?: string;
  search?: string;
}

export const processReturn = async (
  input: ProcessReturnInput,
  options?: MutationRequestOptions
): Promise<ReturnRecord> => {
  const payload = {
    invoiceKey: input.originalInvoiceId,
    returnedItems: input.items.map((item) => ({
      productKey: item.productKey || item.productId,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      reason: item.reason,
      restockAction: item.restockInventory ? 'restock_to_inventory' : 'damaged_discard',
      restockInventory: item.restockInventory,
    })),
    paymentMethod: input.payoutMethod,
    refundAmountCents: input.totalRefundCents,
    notes: input.notes,
  };

  const response = await apiClient.post<ApiResponse<BackendReturnRecord>>(
    '/billing/returns',
    payload,
    options
  );
  return toReturnRecord(response.data);
};

export const fetchReturns = async (params?: FetchReturnsParams): Promise<ReturnRecord[]> => {
  const response = await apiClient.get<ApiResponse<ReturnListResponseData | BackendReturnRecord[]>>(
    '/billing/returns',
    {
      params: {
        invoiceKey: params?.invoiceKey,
        search: params?.search,
      },
    }
  );
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.returns || [];
  return list.map(toReturnRecord);
};

export const fetchReturnsForInvoice = async (invoiceIdOrKey: string): Promise<ReturnRecord[]> => {
  const response = await apiClient.get<ApiResponse<ReturnListResponseData | BackendReturnRecord[]>>(
    `/billing/invoices/${invoiceIdOrKey}/returns`
  );
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.returns || [];
  return list.map(toReturnRecord);
};

export const fetchReturnById = async (idOrKey: string): Promise<ReturnRecord> => {
  const response = await apiClient.get<ApiResponse<BackendReturnRecord>>(
    `/billing/returns/${idOrKey}`
  );
  return toReturnRecord(response.data);
};
