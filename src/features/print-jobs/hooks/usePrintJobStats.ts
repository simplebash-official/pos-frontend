import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchPrintJobStats, type PrintJobStats } from '../api/statsApi';

/** KPI cards for the Print Jobs screen. */
export const usePrintJobStats = (): ModuleStatsResult<PrintJobStats> =>
  useModuleStats('printJobs', queryKeys.printJobs.stats(), fetchPrintJobStats);
