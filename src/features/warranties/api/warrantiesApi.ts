import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  ManagerApproval,
  WarrantyCoverage,
  WarrantyDetail,
  WarrantyListResult,
  WarrantyLookupResult,
  WarrantyStats,
} from '../types';

/** Finds warranties from whatever was scanned or typed; the server decides what the text is. */
export const lookupWarranties = async (q: string): Promise<WarrantyLookupResult> => {
  const response = await apiClient.get<ApiResponse<WarrantyLookupResult>>('/warranties/lookup', {
    params: { q },
  });
  return response.data;
};

/** Exactly one of these is sent. */
export interface WarrantyListFilter {
  customerKey?: string;
  invoiceKey?: string;
  /** The warranties of one repair job's items. */
  repairKey?: string;
  /** Those in force and ending within the week, ending soonest first. */
  state?: 'expiring_soon';
}

/**
 * The warranties of one customer, invoice or repair job (newest first), or those ending this
 * week (soonest first); one page of 200.
 */
export const fetchWarranties = async (filter: WarrantyListFilter): Promise<WarrantyListResult> => {
  const response = await apiClient.get<ApiResponse<WarrantyListResult>>('/warranties', {
    params: { ...filter, limit: 200 },
  });
  return response.data;
};

/** One page of every warranty the shop has issued, newest first. */
export const fetchWarrantyPage = async (
  page: number,
  limit: number
): Promise<WarrantyListResult> => {
  const response = await apiClient.get<ApiResponse<WarrantyListResult>>('/warranties', {
    params: { page, limit },
  });
  return response.data;
};

/** The warranty desk's headline numbers. */
export const fetchWarrantyStats = async (): Promise<WarrantyStats> => {
  const response = await apiClient.get<ApiResponse<WarrantyStats>>('/warranties/stats');
  return response.data;
};

export const fetchWarranty = async (key: string): Promise<WarrantyDetail> => {
  const response = await apiClient.get<ApiResponse<WarrantyDetail>>(`/warranties/${key}`);
  return response.data;
};

/** The paper a warranty card is printed on. */
export type WarrantyCardPaper = 'a5' | 'thermal-58' | 'thermal-80';

/**
 * The warranty's card as a PDF, with the design in force now (or `templateName` for this print).
 * The server always prints the warranty as it stands today.
 */
export const getWarrantyCard = (
  key: string,
  paper: WarrantyCardPaper,
  templateName?: string
): Promise<Blob> =>
  apiClient.get<Blob>(`/warranties/${key}/documents/warranty-card`, {
    responseType: 'blob',
    params: { paper, template: templateName },
  });

export const voidWarranty = async (
  key: string,
  approval?: ManagerApproval
): Promise<WarrantyDetail> => {
  const response = await apiClient.post<ApiResponse<WarrantyDetail>>(`/warranties/${key}/void`, {
    approval,
  });
  return response.data;
};

export const extendWarranty = async (
  key: string,
  coverage: WarrantyCoverage,
  approval?: ManagerApproval
): Promise<WarrantyDetail> => {
  const response = await apiClient.post<ApiResponse<WarrantyDetail>>(`/warranties/${key}/extend`, {
    coverage,
    approval,
  });
  return response.data;
};
