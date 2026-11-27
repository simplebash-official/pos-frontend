import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { CreatePrintFrameSizeInput, PrintFrameSize } from '../types';

/** The shop's frame sizes; hidden ones only for the settings screen. */
export const fetchPrintFrameSizes = async (includeHidden: boolean): Promise<PrintFrameSize[]> => {
  const response = await apiClient.get<ApiResponse<PrintFrameSize[]>>('/print-frame-sizes', {
    params: includeHidden ? { includeHidden: true } : undefined,
  });
  return response.data;
};

export const createPrintFrameSize = async (
  input: CreatePrintFrameSizeInput
): Promise<PrintFrameSize> => {
  const response = await apiClient.post<ApiResponse<PrintFrameSize>>('/print-frame-sizes', input);
  return response.data;
};

/** Hides a saved size, or offers it again: all that can change about one. */
export const setPrintFrameSizeActive = async (
  key: string,
  active: boolean
): Promise<PrintFrameSize> => {
  const response = await apiClient.put<ApiResponse<PrintFrameSize>>(`/print-frame-sizes/${key}`, {
    active,
  });
  return response.data;
};
