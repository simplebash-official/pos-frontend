import { STORAGE_KEYS } from '@/constants';
import { randomUuid } from './localId';

/**
 * A stable per-install identity for this browser profile.
 *
 * Sent as `X-Device-Id` on every request so the backend can attribute writes,
 * and used locally to stamp outbox operations. It lives in localStorage rather
 * than IndexedDB because `ApiClient` needs it synchronously in a request
 * interceptor, exactly like the auth token.
 *
 * Clearing site data mints a new device id. That is correct: a wiped profile
 * has no queued operations to attribute.
 */

let cached: string | null = null;

export const getDeviceId = (): string => {
  if (cached !== null) {
    return cached;
  }

  const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (stored) {
    cached = stored;
    return stored;
  }

  const minted = randomUuid();
  localStorage.setItem(STORAGE_KEYS.DEVICE_ID, minted);
  cached = minted;
  return minted;
};
