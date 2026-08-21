import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchSupplierStats, type SupplierStats } from '../api/statsApi';

/** KPI cards for the Suppliers screen. */
export const useSupplierStats = (): ModuleStatsResult<SupplierStats> =>
  useModuleStats('suppliers', queryKeys.suppliers.stats(), fetchSupplierStats);
