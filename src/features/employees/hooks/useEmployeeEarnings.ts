import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchEmployeeEarnings } from '../api/employeeEarningsApi';

export const useEmployeeEarnings = (employeeKey: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.employees.earnings(employeeKey ?? ''),
    queryFn: () => fetchEmployeeEarnings(employeeKey as string),
    enabled: Boolean(employeeKey),
  });
};
