import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type { EmployeeCommissionsReportResponse } from '../types';

/** Server-computed employee commission/performance report — never derived client-side. */
export const fetchEmployeeCommissions = async (): Promise<EmployeeCommissionsReportResponse> => {
  const response = await apiClient.get<ApiResponse<EmployeeCommissionsReportResponse>>(
    '/reports/employee-commissions',
    { params: { preset: 'today' } }
  );
  return response.data;
};
