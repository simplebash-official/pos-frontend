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

interface BackendReturnRecord {
  id: string;
  key?: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId?: string;
  cashierName?: string;
  items: BackendReturnItem[];
  totalRefundCents: number;
  payoutMethod: ReturnPayoutMethod;
  notes?: string;
  createdAt: string;
}

interface ReturnListResponseData {
  returns: BackendReturnRecord[];
  total: number;
}

const toReturnRecord = (record: BackendReturnRecord): ReturnRecord => ({
  id: record.key || record.id,
  originalInvoiceId: record.originalInvoiceId,
  originalInvoiceNumber: record.originalInvoiceNumber,
  customerId: record.customerId,
  customerName: record.customerName,
  customerPhone: record.customerPhone,
  cashierId: record.cashierId,
  cashierName: record.cashierName,
  items: record.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productKey: item.productKey,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    discountCents: item.discountCents,
    refundAmountCents: item.refundAmountCents,
    restockInventory: item.restockInventory,
    reason: item.reason,
  })),
  totalRefundCents: record.totalRefundCents,
  payoutMethod: record.payoutMethod,
  notes: record.notes,
  createdAt: record.createdAt,
});

export interface FetchReturnsParams {
  invoiceKey?: string;
  search?: string;
}

export const processReturn = async (
  input: ProcessReturnInput,
  options?: MutationRequestOptions
): Promise<ReturnRecord> => {
  const response = await apiClient.post<ApiResponse<BackendReturnRecord>>(
    '/billing/returns',
    input,
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
