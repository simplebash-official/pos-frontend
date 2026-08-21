import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchCustomerStats, type CustomerStats } from '../api/statsApi';

/** KPI cards for the Customers screen. */
export const useCustomerStats = (): ModuleStatsResult<CustomerStats> =>
  useModuleStats('customers', queryKeys.customers.stats(), fetchCustomerStats);
