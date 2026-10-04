// Deciding what the first-run wizard does for a computer that is already linked
// to a cloud shop. The sync agent downloads the shop by itself; the wizard only
// watches, then asks the local backend whether that download left it set up.

import type { SyncStatus } from '@/features/sync-status/types';

/** How long to wait for the shop to arrive before offering the manual setup. */
export const JOIN_TIMEOUT_MS = 60_000;

/** The first full sync cycle after linking has finished cleanly. */
export const isFirstSyncDone = (sync: SyncStatus): boolean =>
  sync.linked && sync.state === 'idle' && sync.lastSyncAt !== null && !sync.bootstrapRequired;

export type JoinOutcome =
  /** Still downloading (or not sure yet): keep the spinner. */
  | 'waiting'
  /** The shop came from the cloud and setup is complete: go to sign-in. */
  | 'joined'
  /**
   * The shop and its admin came from the cloud, but the cloud shop has not chosen
   * demo vs clean data yet (a brand-new web account): ask for that choice and the
   * existing admin's password.
   */
  | 'cloud-admin'
  /** Nothing to download (new or empty cloud shop) or it cannot be reached: ask for an admin. */
  | 'form';

export interface JoinInput {
  /** The local backend says setup is complete. */
  setupCompleted: boolean;
  /** The local backend has no users at all (a blank install). False once the cloud admin arrived. */
  isFirstRun: boolean;
  sync: SyncStatus;
  /** Setup status was re-read after the first sync finished (so `setupCompleted` is current). */
  setupCheckedAfterSync: boolean;
  timedOut: boolean;
}

export const joinOutcome = ({
  setupCompleted,
  isFirstRun,
  sync,
  setupCheckedAfterSync,
  timedOut,
}: JoinInput): JoinOutcome => {
  if (setupCompleted) return 'joined';
  if (timedOut || sync.bootstrapRequired) return 'form';
  if (sync.state === 'offline' || sync.state === 'error' || sync.state === 'paused') return 'form';
  if (isFirstSyncDone(sync) && setupCheckedAfterSync) {
    // Users exist but setup is open: the cloud admin arrived. No users: nothing came down.
    return isFirstRun ? 'form' : 'cloud-admin';
  }
  return 'waiting';
};
