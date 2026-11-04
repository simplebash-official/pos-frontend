import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { RepairService, SaveRepairServiceInput } from '../types';

/** The shop's ready-made repair services by name; hidden ones only for the settings screen. */
export const fetchRepairServices = async (includeHidden: boolean): Promise<RepairService[]> => {
  const response = await apiClient.get<ApiResponse<RepairService[]>>('/repair-services', {
    params: includeHidden ? { includeHidden: true } : undefined,
  });
  return response.data;
};

export const createRepairService = async (
  input: SaveRepairServiceInput
): Promise<RepairService> => {
  const response = await apiClient.post<ApiResponse<RepairService>>('/repair-services', input);
  return response.data;
};

export const updateRepairService = async (
  key: string,
  input: SaveRepairServiceInput
): Promise<RepairService> => {
  const response = await apiClient.put<ApiResponse<RepairService>>(
    `/repair-services/${key}`,
    input
  );
  return response.data;
};
