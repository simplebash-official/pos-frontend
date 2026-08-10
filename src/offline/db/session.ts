import type { AuthUser } from '@/features/auth/types';
import { OFFLINE_SESSION_GRACE_MS } from '../constants';
import { db } from './schema';
import { SESSION_RECORD_ID } from './tables';

/**
 * Caching of the authenticated identity so a cold start with no network can
 * restore the session instead of bouncing the cashier to the login screen
 * during a power cut.
 */

export async function cacheSession(user: AuthUser): Promise<void> {
  await db.session.put({
    id: SESSION_RECORD_ID,
    user,
    verifiedAt: new Date().toISOString(),
  });
}

export async function clearCachedSession(): Promise<void> {
  await db.session.delete(SESSION_RECORD_ID);
}

/**
 * The cached identity, but only while it is still inside the offline grace
 * period. A terminal that never reconnects must not stay authenticated
 * forever, so a stale record resolves to `null` and forces a real login.
 */
export async function readCachedSession(): Promise<AuthUser | null> {
  const record = await db.session.get(SESSION_RECORD_ID);
  if (!record) {
    return null;
  }

  const age = Date.now() - new Date(record.verifiedAt).getTime();
  if (age > OFFLINE_SESSION_GRACE_MS) {
    await clearCachedSession();
    return null;
  }

  return record.user;
}
