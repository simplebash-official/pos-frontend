import { SYNC_LEADER_LOCK } from '../constants';
import { logInfo } from './auditLog';

/**
 * Elects one tab to own the sync loops.
 *
 * Without this, three open tabs each run their own pull and flush loop against
 * the same IndexedDB and the same backend — triple the requests, and a race on
 * every operation that idempotency keys would then have to paper over. Reads
 * are unaffected: every tab still sees live data, because Dexie's `liveQuery`
 * notifies across tabs regardless of who is leading.
 *
 * Web Locks releases the lock automatically when the holding tab is closed or
 * crashes, so a waiting tab is promoted with no heartbeat or lease logic. The
 * API requires a secure context, which this app is served in.
 */
export class LeaderElection {
  private abortController: AbortController | null = null;
  private releaseLock: (() => void) | null = null;
  private leading = false;

  get isLeader(): boolean {
    return this.leading;
  }

  /**
   * Requests leadership. Resolves immediately; `onElected` fires whenever this
   * tab acquires the lock, which may be at once or when the current leader
   * goes away.
   */
  start(onElected: () => void, onDeposed: () => void): void {
    if (this.abortController !== null) {
      return;
    }
    this.abortController = new AbortController();

    // Web Locks needs a secure context. A LAN-served build over plain http
    // has no lock API at all, and letting that throw would take down the
    // whole provider tree via the error boundary. One tab leading
    // unconditionally is the right degradation: sync still works, it just
    // has no cross-tab arbitration.
    if (typeof navigator === 'undefined' || navigator.locks === undefined) {
      this.leading = true;
      logInfo(null, 'Web Locks unavailable — this tab is leading unconditionally', null);
      onElected();
      return;
    }

    void navigator.locks
      .request(
        SYNC_LEADER_LOCK,
        { mode: 'exclusive', signal: this.abortController.signal },
        async () => {
          this.leading = true;
          logInfo(null, 'This tab is now the sync leader', null);
          onElected();

          // Hold the lock for as long as this tab lives. Resolving this promise
          // is what hands leadership to the next waiting tab.
          await new Promise<void>((resolve) => {
            this.releaseLock = resolve;
          });

          this.leading = false;
          onDeposed();
        }
      )
      .catch(() => {
        // The only rejection path is the abort signal during stop().
        this.leading = false;
      });
  }

  stop(): void {
    this.releaseLock?.();
    this.releaseLock = null;
    this.abortController?.abort();
    this.abortController = null;
    this.leading = false;
  }
}

export const leaderElection = new LeaderElection();
