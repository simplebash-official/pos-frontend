import { apiClient } from '@/api/client';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { ImportBatchRecord, ProcessImportPayload } from '../types';

export interface ImportBatchListParams {
  target?: string;
  page?: number;
  limit?: number;
}

interface ImportBatchPageData {
  items: ImportBatchRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const processImportBatch = async (
  payload: ProcessImportPayload
): Promise<ImportBatchRecord> => {
  const response = await apiClient.post<ApiResponse<ImportBatchRecord>>('/imports', payload);
  return response.data;
};

export const fetchImportBatches = async (
  params: ImportBatchListParams = {}
): Promise<PaginatedResponse<ImportBatchRecord>> => {
  const response = await apiClient.get<ApiResponse<ImportBatchPageData>>('/imports', {
    params: {
      target: params.target,
      page: params.page,
      limit: params.limit,
    },
  });
  const { items, pagination } = response.data;
  return {
    items,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.limit,
    totalPages: pagination.totalPages,
  };
};

export const fetchImportBatchByKey = async (key: string): Promise<ImportBatchRecord> => {
  const response = await apiClient.get<ApiResponse<ImportBatchRecord>>(`/imports/${key}`);
  return response.data;
};
