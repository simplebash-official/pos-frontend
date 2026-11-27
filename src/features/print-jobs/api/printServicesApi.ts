import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { PrintService, SavePrintServiceInput } from '../types';

/** The shop's ready-made print services by name; hidden ones only for the settings screen. */
export const fetchPrintServices = async (includeHidden: boolean): Promise<PrintService[]> => {
  const response = await apiClient.get<ApiResponse<PrintService[]>>('/print-services', {
    params: includeHidden ? { includeHidden: true } : undefined,
  });
  return response.data;
};

export const createPrintService = async (input: SavePrintServiceInput): Promise<PrintService> => {
  const response = await apiClient.post<ApiResponse<PrintService>>('/print-services', input);
  return response.data;
};

export const updatePrintService = async (
  key: string,
  input: SavePrintServiceInput
): Promise<PrintService> => {
  const response = await apiClient.put<ApiResponse<PrintService>>(`/print-services/${key}`, input);
  return response.data;
};
