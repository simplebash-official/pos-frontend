import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { DocumentDesign, DocumentDesignStatus } from '@/features/billing/api/documentsApi';
import type {
  CalcQuotationReply,
  CalcQuotationRequest,
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

// `design` says which PDF to get: the stored one as first printed, or the one printed with the
// design in force now. `templateName` prints this one quotation in another design (a design id
// from `GET /settings/document-templates`); leave it out to use the shop's chosen design.
export const getQuotationDocument = (
  id: string,
  design: DocumentDesign,
  templateName?: string
): Promise<Blob> =>
  apiClient.get<Blob>(`/quotations/${id}/document`, {
    responseType: 'blob',
    params: { design, template: templateName },
  });

export const getQuotationDocumentDesign = async (id: string): Promise<DocumentDesignStatus> => {
  const response = await apiClient.get<ApiResponse<DocumentDesignStatus>>(
    `/quotations/${id}/document/design`
  );
  return response.data;
};

/** Each line's discount and total, the order totals, and what still stops the quotation. Stores nothing. */
export const calcQuotation = async (
  request: CalcQuotationRequest,
  signal: AbortSignal
): Promise<CalcQuotationReply> => {
  const response = await apiClient.post<ApiResponse<CalcQuotationReply>>(
    '/calc/quotation',
    request,
    { signal }
  );
  return response.data;
};
