// Shop code handling for the multi-tenant web login. The desktop app and
// single-shop deployments never ask for one.

import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants/storage';
import { isTauri } from '@/shared/lib/platform';
import { getErrorMessage } from '@/shared/lib/error';
import type { ApiError } from '@/shared/types/common';

/** True when the login must collect a shop code: multi-tenant web build, not the desktop shell. */
export const isShopCodeRequired = (): boolean => env.multiTenant && !isTauri();

/** Lowercase and trim; the server matches shop codes case-insensitively as slugs. */
export const normalizeShopCode = (value: string): string => value.trim().toLowerCase();

/** A slug like `test-shop`: 2-63 chars of a-z, 0-9 and single hyphens between them. */
export const isValidShopCode = (value: string): boolean => {
  const code = normalizeShopCode(value);
  return code.length >= 2 && code.length <= 63 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code);
};

type ShopCodeStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** The shop code last used in this browser, or ''. Storage may be unavailable. */
export const getRememberedShopCode = (storage?: ShopCodeStorage): string => {
  try {
    return (storage ?? localStorage).getItem(STORAGE_KEYS.SHOP_CODE) ?? '';
  } catch {
    return '';
  }
};

/** The `?shop=` value of a link from the SimpleBash app ("Open POS"), or '' if absent or not a valid code. */
export const getShopCodeFromLink = (search: string): string => {
  const code = new URLSearchParams(search).get('shop');
  return code !== null && isValidShopCode(code) ? normalizeShopCode(code) : '';
};

/** Where the login's shop code starts: a code from the link wins over the one remembered in this browser. */
export const getInitialShopCode = (search: string, storage?: ShopCodeStorage): string => {
  const fromLink = getShopCodeFromLink(search);
  return fromLink !== '' ? fromLink : getRememberedShopCode(storage);
};

export const rememberShopCode = (value: string, storage?: ShopCodeStorage): void => {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEYS.SHOP_CODE, normalizeShopCode(value));
  } catch {
    // Private mode / blocked storage: the field just is not prefilled next time.
  }
};

/** Friendly text for a failed login, including the multi-tenant cases. */
export const loginErrorMessage = (err: unknown, fallback: string): string => {
  const api = (err ?? {}) as Partial<ApiError>;
  if (
    isShopCodeRequired() &&
    api.statusCode === 400 &&
    /shop code/i.test(String(api.message ?? ''))
  ) {
    return 'Please enter your shop code.';
  }
  if (isShopCodeRequired() && api.statusCode === 401) {
    return 'Invalid shop code, email or password. Please try again.';
  }
  return getErrorMessage(err, fallback);
};
