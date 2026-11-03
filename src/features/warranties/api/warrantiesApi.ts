import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  ManagerApproval,
  WarrantyCoverage,
  WarrantyDetail,
  WarrantyListResult,
  WarrantyLookupResult,
} from '../types';

/** Finds warranties from whatever was scanned or typed; the server decides what the text is. */
export const lookupWarranties = async (q: string): Promise<WarrantyLookupResult> => {
  const response = await apiClient.get<ApiResponse<WarrantyLookupResult>>('/warranties/lookup', {
    params: { q },
  });
  return response.data;
};

export interface WarrantyListFilter {
  customerKey?: string;
  invoiceKey?: string;
}

/** The warranties of one customer or one invoice, newest first (one page of 200). */
export const fetchWarranties = async (filter: WarrantyListFilter): Promise<WarrantyListResult> => {
  const response = await apiClient.get<ApiResponse<WarrantyListResult>>('/warranties', {
    params: { ...filter, limit: 200 },
  });
  return response.data;
};

export const fetchWarranty = async (key: string): Promise<WarrantyDetail> => {
  const response = await apiClient.get<ApiResponse<WarrantyDetail>>(`/warranties/${key}`);
  return response.data;
};

export const voidWarranty = async (
  key: string,
  approval: ManagerApproval
): Promise<WarrantyDetail> => {
  const response = await apiClient.post<ApiResponse<WarrantyDetail>>(`/warranties/${key}/void`, {
    approval,
  });
  return response.data;
};

export const extendWarranty = async (
  key: string,
  coverage: WarrantyCoverage,
  approval: ManagerApproval
): Promise<WarrantyDetail> => {
  const response = await apiClient.post<ApiResponse<WarrantyDetail>>(`/warranties/${key}/extend`, {
    coverage,
    approval,
  });
  return response.data;
};
