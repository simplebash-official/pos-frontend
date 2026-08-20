import { queryKeys } from '@/api/queryKeys';
import { useModuleStats, type ModuleStatsResult } from '@/shared/hooks/useModuleStats';
import { fetchBillingStats, type BillingStats } from '../api/statsApi';

/** KPI cards for the Sales & Invoices History screen. */
export const useBillingStats = (): ModuleStatsResult<BillingStats> =>
  useModuleStats('billing', queryKeys.billing.stats(), fetchBillingStats);
