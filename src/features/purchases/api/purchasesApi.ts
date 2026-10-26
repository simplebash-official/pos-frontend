import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type {
  CalcReceiptReply,
  CalcReceiptRequest,
  CalcSettlementReply,
  CalcSettlementRequest,
  CreateReceiptInput,
  CreateSupplierCreditInput,
  EnrichedStockPurchase,
  PurchaseReceipt,
  SupplierCredit,
} from '../types';

export interface PurchaseListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

interface Paged {
  pagination: { totalPages: number };
}

interface PurchaseListResponseData extends Paged {
  purchases: EnrichedStockPurchase[];
}

interface ReceiptListResponseData extends Paged {
  items: PurchaseReceipt[];
}

interface CreditListResponseData extends Paged {
  items: SupplierCredit[];
}

/** Reads every page of a list endpoint (the backend caps a page at 500), so a long relationship is never cut short. */
const fetchEveryPage = async <Row, Data extends Paged>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  rowsOf: (data: Data) => Row[]
): Promise<Row[]> => {
  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<Data>>(path, {
      params: { ...params, page, limit: 500 },
    });
    return response.data;
  };
  const firstPage = await fetchPage(1);
  const rows = [...rowsOf(firstPage)];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    rows.push(...rowsOf(await fetchPage(page)));
  }
  return rows;
};

/** Every purchase line for the given supplier/product. */
export const fetchPurchases = async (
  params: PurchaseListParams
): Promise<EnrichedStockPurchase[]> => {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchPurchases requires at least one of supplierKey/productKey');
  }
  return fetchEveryPage<EnrichedStockPurchase, PurchaseListResponseData>(
    '/purchases',
    params,
    (data) => data.purchases
  );
};

export const fetchPurchasesBySupplier = async (
  supplierKey: string
): Promise<EnrichedStockPurchase[]> => {
  return fetchPurchases({ supplierKey });
};

export const fetchPurchasesByProduct = async (
  productKey: string
): Promise<EnrichedStockPurchase[]> => {
  return fetchPurchases({ productKey });
};

/** Every receipt of one supplier, newest first. */
export const fetchReceiptsBySupplier = async (supplierKey: string): Promise<PurchaseReceipt[]> => {
  return fetchEveryPage<PurchaseReceipt, ReceiptListResponseData>(
    '/purchase-receipts',
    { supplierKey },
    (data) => data.items
  );
};

/** The supplier's receipts that still have something to pay, oldest first. */
export const fetchOpenReceipts = async (supplierKey: string): Promise<PurchaseReceipt[]> => {
  return fetchEveryPage<PurchaseReceipt, ReceiptListResponseData>(
    '/purchase-receipts',
    { supplierKey, open: true },
    (data) => data.items
  );
};

/** Records a receipt: every line comes into stock, and the payment (if any) is made, in one save. */
export const createReceipt = async (input: CreateReceiptInput): Promise<PurchaseReceipt> => {
  const response = await apiClient.post<ApiResponse<PurchaseReceipt>>('/purchase-receipts', input);
  return response.data;
};

export const fetchCreditsBySupplier = async (supplierKey: string): Promise<SupplierCredit[]> => {
  return fetchEveryPage<SupplierCredit, CreditListResponseData>(
    '/supplier-credits',
    { supplierKey },
    (data) => data.items
  );
};

export const createSupplierCredit = async (
  input: CreateSupplierCreditInput
): Promise<SupplierCredit> => {
  const response = await apiClient.post<ApiResponse<SupplierCredit>>('/supplier-credits', input);
  return response.data;
};

export const voidSupplierCredit = async (key: string): Promise<SupplierCredit> => {
  const response = await apiClient.post<ApiResponse<SupplierCredit>>(
    `/supplier-credits/${key}/void`,
    {}
  );
  return response.data;
};

/** Every figure for the Receive Stock form as typed so far. Stores nothing. */
export const calcReceipt = async (
  request: CalcReceiptRequest,
  signal: AbortSignal
): Promise<CalcReceiptReply> => {
  const response = await apiClient.post<ApiResponse<CalcReceiptReply>>('/calc/receipt', request, {
    signal,
  });
  return response.data;
};

/** What a supplier owes, how a payment spreads over their bills, and what is wrong with a split. Stores nothing. */
export const calcSettlement = async (
  request: CalcSettlementRequest,
  signal: AbortSignal
): Promise<CalcSettlementReply> => {
  const response = await apiClient.post<ApiResponse<CalcSettlementReply>>(
    '/calc/settlement',
    request,
    { signal }
  );
  return response.data;
};
