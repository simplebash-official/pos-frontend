import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProductSerials } from '../api/productsApi';
import type { ProductSerialStatus } from '@/offline/db/tables';

/**
 * Live server read of a product's serial units — used wherever freshness
 * matters more than offline availability (e.g. the checkout serial picker,
 * where a stale local mirror could let someone pick a unit another
 * terminal already sold). Not a `useSyncedQuery` on purpose: this is a
 * point-in-time read against the source of truth, not something the offline
 * mirror should stand in for.
 */
export const useProductSerials = (
  productKey: string | undefined,
  status?: ProductSerialStatus,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.inventory.serials(productKey ?? '', status),
    queryFn: () => fetchProductSerials(productKey as string, status),
    enabled: Boolean(productKey) && (options?.enabled ?? true),
  });
};
