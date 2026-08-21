import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchInventoryStats, type InventoryStats } from '../api/statsApi';

/** KPI cards for the Inventory & Stock screen. */
export const useInventoryStats = (): ModuleStatsResult<InventoryStats> =>
  useModuleStats('inventory', queryKeys.inventory.stats(), fetchInventoryStats);
