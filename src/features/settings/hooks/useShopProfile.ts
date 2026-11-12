import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useAppDispatch } from '@/store/hooks';
import { setShopProfile } from '@/store/slices/settingsSlice';
import { getShopProfileApi } from '../api/settingsApi';

/**
 * Live shop profile backed by TanStack Query so window focus, SSE live refresh, and mutations
 * keep every session and billing screen aligned across devices. Syncs the loaded profile into
 * Redux via `setShopProfile` so legacy selectors remain consistent, and exposes `null` before
 * the initial server response arrives instead of synthesizing default settings.
 */
export const useShopProfile = (options: { enabled?: boolean } = {}) => {
  const dispatch = useAppDispatch();
  const query = useQuery({
    queryKey: queryKeys.settings.shopProfile(),
    queryFn: getShopProfileApi,
    refetchOnWindowFocus: true,
    enabled: options.enabled ?? true,
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setShopProfile(query.data));
    }
  }, [query.data, dispatch]);

  return {
    ...query,
    shopProfile: query.data ?? null,
  };
};
