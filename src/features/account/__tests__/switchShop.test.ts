import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storage';
import { clearShopScopedStorage } from '../lib/switchShop';
import { shopInitial, shopLabel } from '../lib/shopLabel';

describe('clearShopScopedStorage', () => {
  beforeEach(() => localStorage.clear());

  it('forgets everything the open shop left behind', () => {
    for (const key of [
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.HELD_CARTS,
      STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.SEARCH_HISTORY,
      STORAGE_KEYS.PRINT_SELECTION_PAY_NOW,
      STORAGE_KEYS.PRINT_SELECTION_CREDIT,
      `${STORAGE_KEYS.CATALOG_SORT_PREFIX}:user_1`,
      `${STORAGE_KEYS.CATALOG_SORT_PREFIX}:user_2`,
    ]) {
      localStorage.setItem(key, 'x');
    }
    clearShopScopedStorage();
    expect(localStorage.length).toBe(0);
  });

  it('keeps device-level choices', () => {
    localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, 'dark');
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, 'dev_1');
    localStorage.setItem(STORAGE_KEYS.BENCHMARK_RESULT, '{}');
    clearShopScopedStorage();
    expect(localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME)).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.DEVICE_ID)).toBe('dev_1');
    expect(localStorage.getItem(STORAGE_KEYS.BENCHMARK_RESULT)).toBe('{}');
  });

  it('keeps language and printer settings but drops the shop profile', () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        shopProfile: { tradingName: 'Old Shop', bankName: 'Bank' },
        shopProfileVersions: { 1: {} },
        printSettings: { printer: 'P1' },
        appLanguage: 'si',
      })
    );
    clearShopScopedStorage();
    const kept = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null');
    expect(kept).toEqual({ appLanguage: 'si', printSettings: { printer: 'P1' } });
    expect(JSON.stringify(kept)).not.toContain('Old Shop');
  });

  it('removes unreadable settings instead of keeping a previous shop in them', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, '{not json');
    clearShopScopedStorage();
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeNull();
  });
});

describe('shopLabel', () => {
  it('prefers the name, then the code, and is null when neither is known', () => {
    expect(shopLabel({ shopName: 'Gee Mobile', shopCode: 'gee-mobile' })).toBe('Gee Mobile');
    expect(shopLabel({ shopName: null, shopCode: 'gee-mobile' })).toBe('gee-mobile');
    expect(shopLabel({ shopName: null, shopCode: null })).toBeNull();
  });
});

describe('shopInitial', () => {
  it('is the first letter of the name, else of the code, upper-cased', () => {
    expect(shopInitial({ shopName: 'gee mobile', shopCode: 'x' })).toBe('G');
    expect(shopInitial({ shopName: null, shopCode: 'mayura-shop' })).toBe('M');
  });

  it('keeps a whole character for non-Latin names and is null when nothing is known', () => {
    expect(shopInitial({ shopName: '😀 Shop', shopCode: null })).toBe('😀');
    expect(shopInitial({ shopName: '  ', shopCode: null })).toBeNull();
    expect(shopInitial({ shopName: null, shopCode: null })).toBeNull();
  });
});
