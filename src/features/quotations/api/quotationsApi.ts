import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CreateQuotationInput,
  Quotation,
  QuotationListParams,
  QuotationListResult,
} from '../types';

export const fetchQuotations = async (
  params: QuotationListParams
): Promise<QuotationListResult> => {
  const response = await apiClient.get<ApiResponse<QuotationListResult>>('/quotations', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
    },
  });
  return response.data;
};

export const createQuotationRaw = async (input: CreateQuotationInput): Promise<Quotation> => {
  const response = await apiClient.post<ApiResponse<Quotation>>('/quotations', input);
  return response.data;
};

export const cancelQuotationRaw = async (id: string): Promise<Quotation> => {
  const response = await apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/cancel`);
  return response.data;
};

// `templateName` prints this one quotation in another design (an id from
// `GET /settings/document-templates`). Leave it out to use the shop's chosen design.
export const getQuotationDocument = (id: string, templateName?: string): Promise<Blob> =>
  apiClient.get<Blob>(`/quotations/${id}/document`, {
    responseType: 'blob',
    params: { template: templateName },
  });
