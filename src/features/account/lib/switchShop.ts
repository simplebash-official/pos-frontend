import { STORAGE_KEYS } from '@/constants/storage';

/**
 * Browser storage that belongs to one shop. Each shop on this computer has its own database, so
 * these must not outlive a switch: the next shop would show the previous shop's name, customers,
 * held carts and login. Device-level choices (colour scheme, device id, language, printers) stay.
 */
const SHOP_SCOPED_KEYS: string[] = [
  STORAGE_KEYS.AUTH_TOKEN,
  STORAGE_KEYS.CUSTOMERS,
  STORAGE_KEYS.HELD_CARTS,
  STORAGE_KEYS.NOTIFICATIONS,
  STORAGE_KEYS.SEARCH_HISTORY,
  STORAGE_KEYS.PRINT_SELECTION_PAY_NOW,
  STORAGE_KEYS.PRINT_SELECTION_CREDIT,
];

/** Keys stored per login, as `${prefix}:${userId}`. */
const SHOP_SCOPED_PREFIXES: string[] = [STORAGE_KEYS.CATALOG_SORT_PREFIX];

/** Settings hold the shop profile (name, address, bank) next to device-level choices: keep only those. */
const keepDeviceSettings = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const { appLanguage, printSettings } = JSON.parse(raw) as Record<string, unknown>;
    return JSON.stringify({ appLanguage, printSettings });
  } catch {
    return null;
  }
};

/** Forget everything the open shop left in this browser. Safe to call when storage is blocked. */
export const clearShopScopedStorage = (): void => {
  try {
    const settings = keepDeviceSettings(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    for (const key of SHOP_SCOPED_KEYS) localStorage.removeItem(key);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && SHOP_SCOPED_PREFIXES.some((prefix) => key.startsWith(`${prefix}:`))) {
        localStorage.removeItem(key);
      }
    }
    if (settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, settings);
    else localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch {
    // Blocked storage: nothing was stored, so nothing can leak.
  }
};
