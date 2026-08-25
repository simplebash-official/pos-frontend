import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { EmployeeEarningRecord } from '../types';

/**
 * Itemized commission history for one employee, computed server-side by
 * `reports::service::employee_earnings` — never persisted client-side. Not
 * a synced resource: an aggregate has no row identity to mirror through the
 * sync engine (see `frontend/CLAUDE.md`'s Dashboard stats endpoints note).
 */
export const fetchEmployeeEarnings = async (
  employeeKey: string
): Promise<EmployeeEarningRecord[]> => {
  const response = await apiClient.get<ApiResponse<{ records: EmployeeEarningRecord[] }>>(
    `/reports/employee-commissions/${employeeKey}/items`,
    { params: { preset: 'all_time' } }
  );
  return response.data.records;
};
