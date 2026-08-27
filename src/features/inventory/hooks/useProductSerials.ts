import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProductSerials } from '../api/productsApi';
import type { ProductSerialStatus } from '../types';

/**
 * Live server read of a product's serial units — a point-in-time read
 * against the source of truth (e.g. the checkout serial picker, where a
 * stale result could let someone pick a unit another terminal already sold).
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
