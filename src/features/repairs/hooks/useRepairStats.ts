import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchRepairStats, type RepairStats } from '../api/statsApi';

/** KPI cards for the Repair Jobs screen. */
export const useRepairStats = (): ModuleStatsResult<RepairStats> =>
  useModuleStats('repairs', queryKeys.repairs.stats(), fetchRepairStats);
