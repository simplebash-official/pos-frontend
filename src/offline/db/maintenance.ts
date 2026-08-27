import { STORAGE_QUOTA_WARN_RATIO } from '../constants';

/** Generic local-storage housekeeping, independent of any sync engine. */

export interface StorageEstimate {
  usageBytes: number | null;
  quotaBytes: number | null;
  /** Fraction of quota used, or `null` when the browser won't say. */
  ratio: number | null;
  isNearLimit: boolean;
}

/**
 * IndexedDB eviction is silent and looks exactly like data loss, so this is
 * worth surfacing before it happens.
 */
export const estimateStorage = async (): Promise<StorageEstimate> => {
  if (!navigator.storage?.estimate) {
    return { usageBytes: null, quotaBytes: null, ratio: null, isNearLimit: false };
  }

  const estimate = await navigator.storage.estimate();
  const usageBytes = estimate.usage ?? null;
  const quotaBytes = estimate.quota ?? null;
  const ratio = usageBytes !== null && quotaBytes ? usageBytes / quotaBytes : null;

  return {
    usageBytes,
    quotaBytes,
    ratio,
    isNearLimit: ratio !== null && ratio >= STORAGE_QUOTA_WARN_RATIO,
  };
};

/** Asks the browser not to evict this origin under storage pressure. */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage?.persist) {
    return false;
  }
  if (await navigator.storage.persisted()) {
    return true;
  }
  return navigator.storage.persist();
};
