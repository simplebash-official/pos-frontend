import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { STORAGE_KEYS } from '@/constants/storage';
import { updateMyPreferencesApi } from '@/features/auth/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser, setUserPreferences } from '@/store/slices/authSlice';
import { DEFAULT_CATALOG_SORT, isCatalogSort, type CatalogSortId } from '../lib/catalogSort';

const storageKey = (userId: string) => `${STORAGE_KEYS.CATALOG_SORT_PREFIX}:${userId}`;

const readLocal = (userId: string | undefined): CatalogSortId | null => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return isCatalogSort(raw) ? raw : null;
  } catch {
    return null;
  }
};

const writeLocal = (userId: string, sort: CatalogSortId) => {
  try {
    localStorage.setItem(storageKey(userId), sort);
  } catch {
    // Storage can be blocked or full; the server copy is the source of truth anyway.
  }
};

/**
 * The billing catalog's sort for the logged-in account, remembered until that
 * account changes it. Every login keeps its own: the choice is saved on the
 * user's record server-side (so it follows them across devices) and mirrored to
 * localStorage per user id so the right order is used when `/auth/me` could not
 * be reached.
 */
export function useCatalogSort(): [CatalogSortId, (next: CatalogSortId) => void] {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const userId = user?.id;
  const serverSort = user?.preferences?.billingCatalogSort;

  const sort: CatalogSortId = isCatalogSort(serverSort)
    ? serverSort
    : (readLocal(userId) ?? DEFAULT_CATALOG_SORT);

  const setSort = useCallback(
    (next: CatalogSortId) => {
      if (!userId) return;
      writeLocal(userId, next);
      dispatch(setUserPreferences({ billingCatalogSort: next }));
      updateMyPreferencesApi({ billingCatalogSort: next }).catch(() => {
        // The choice still applies on this device; it just was not saved to the account.
        notifications.show({
          title: 'Sort not saved',
          message: 'Could not save your sort choice to your account. It will apply on this device.',
          color: 'yellow',
        });
      });
    },
    [dispatch, userId]
  );

  return [sort, setSort];
}
