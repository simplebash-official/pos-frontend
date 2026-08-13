import { PULL_INTERVAL_MS } from '../constants';
import { connectivityMonitor } from '../connectivity/ConnectivityMonitor';
import type { ConnectivitySnapshot } from '../connectivity/types';
import { pruneByRetention } from '../db/maintenance';
import { getAllSyncMeta, patchSyncMeta } from '../db/syncMeta';
import { pruneConfirmedLedgerEntries } from './stockLedger';
import type { SyncMetaRecord } from '../db/tables';
import { countByStatus, countUnsettled, countUnsettledForResource } from '../outbox/outbox';
import { reclaimInflightOperations } from '../outbox/outbox';
import { flushOutbox, type FlushSummary } from '../outbox/flush';
import { describeError } from '../errors';
import { getResourcesInDependencyOrder } from '../registry/registry';
import { logError, logInfo, logWarn } from './auditLog';
import { leaderElection } from './leader';
import { pullResource } from './pull';
import { resolvePullTargets } from './pullTargets';

/**
 * Orchestrates the two sync loops.
 *
 * Pulls refresh the local mirror; the outbox flush pushes local writes. Both
 * run only in the leader tab, and only while the backend is reachable. Every
 * other tab still sees live data because Dexie notifies across tabs.
 */

export interface SyncEngineState {
  connectivity: ConnectivitySnapshot;
  isLeader: boolean;
  isPulling: boolean;
  isPushing: boolean;
  modules: SyncMetaRecord[];
  totals: { pending: number; dead: number; conflicts: number };
  /** Queued operations per resource, so a module card can show its own count. */
  pendingByResource: Record<string, number>;
}

export type SyncEngineListener = (state: SyncEngineState) => void;
export type FlushCompleteListener = (summary: FlushSummary) => void;

export class SyncEngine {
  private listeners = new Set<SyncEngineListener>();
  private flushListeners = new Set<FlushCompleteListener>();
  private pullTimer: ReturnType<typeof setInterval> | null = null;
  private abortController: AbortController | null = null;
  private unsubscribeConnectivity: (() => void) | null = null;
  private started = false;
  private isPulling = false;
  private isPushing = false;
  /** Set when a flush is requested while one is already running. */
  private flushQueued = false;
  private wasOnline = false;
  /** Monotonic, so a callback from a superseded run can be ignored. */
  private generation = 0;

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.abortController = new AbortController();
    const generation = ++this.generation;

    connectivityMonitor.start();
    this.unsubscribeConnectivity = connectivityMonitor.subscribe(this.handleConnectivityChange);

    leaderElection.start(
      () => {
        // Leadership callbacks resolve on a later microtask, so one from a
        // previous start() can land after a restart and stop the loops that
        // the new run just started. React StrictMode makes that ordering
        // routine, not theoretical.
        if (generation !== this.generation) {
          return;
        }
        this.startLoops();
        void this.publish();
      },
      () => {
        if (generation !== this.generation) {
          return;
        }
        this.stopLoops();
        void this.publish();
      }
    );

    void this.publish();
  }

  stop(): void {
    this.started = false;
    // Invalidates any in-flight leadership callback and lets a later start()
    // begin cleanly.
    this.generation += 1;
    this.stopLoops();
    leaderElection.stop();
    this.unsubscribeConnectivity?.();
    this.unsubscribeConnectivity = null;
    connectivityMonitor.stop();
    this.abortController?.abort();
    this.abortController = null;

    // These are latches on a module-level singleton. Leaving `isPushing` set
    // because a flush was in flight at logout would make every future flush
    // take the "already running" branch and return — nothing would ever sync
    // again until a reload.
    this.isPulling = false;
    this.isPushing = false;
    this.flushQueued = false;
    this.wasOnline = false;
  }

  subscribe(listener: SyncEngineListener): () => void {
    this.listeners.add(listener);
    void this.publish();
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Notified after every flush pass, so the UI can toast the outcome. */
  onFlushComplete(listener: FlushCompleteListener): () => void {
    this.flushListeners.add(listener);
    return () => {
      this.flushListeners.delete(listener);
    };
  }

  /** Called after a local write so queued work leaves promptly. */
  requestFlush(): void {
    void this.runFlush();
  }

  /**
   * The "Sync now" button: probe, wait for the verdict, then pull and push.
   *
   * Awaiting the probe matters — firing it and reading the old verdict a line
   * later makes the button a no-op for the first few seconds after a
   * connection returns, which is exactly when someone reaches for it.
   */
  async syncNow(): Promise<void> {
    await connectivityMonitor.checkNow();
    await this.runPull();
    await this.runFlush();
  }

  /** True when this tab is the one that actually performs sync work. */
  get canSync(): boolean {
    return leaderElection.isLeader;
  }

  // -------------------------------------------------------------------------

  private handleConnectivityChange = (snapshot: ConnectivitySnapshot): void => {
    const isOnline = snapshot.state === 'online' || snapshot.state === 'degraded';

    // The transition is what matters: a restored connection is the moment to
    // drain the queue and catch the mirror up.
    if (isOnline && !this.wasOnline && leaderElection.isLeader) {
      logInfo(null, 'Connection restored — syncing', null);
      void this.syncNow();
    }
    this.wasOnline = isOnline;
    void this.publish();
  };

  private startLoops(): void {
    if (this.pullTimer !== null) {
      return;
    }
    this.pullTimer = setInterval(() => {
      if (!connectivityMonitor.isOnline()) {
        return;
      }
      // A hidden tab has nobody to show fresh data to, so skip the pull — but
      // still flush. The leader may well be a background tab while the user
      // works in another one, and queued writes must not wait on which tab
      // happens to be focused.
      if (!document.hidden) {
        void this.runPull();
      }
      void this.runFlush();
    }, PULL_INTERVAL_MS);

    // An operation left `inflight` by a tab that closed mid-push is claimed
    // by nothing and retried by nothing. Reclaim before the first flush.
    void reclaimInflightOperations().then((reclaimed) => {
      if (reclaimed > 0) {
        logWarn(null, `Requeued ${reclaimed} interrupted change(s)`, null);
      }
    });

    // Housekeeping the mirrors need but nothing else triggers. Without it the
    // stock ledger and the movement history grow without bound on a terminal
    // that is never reinstalled.
    void this.runMaintenance();

    void this.syncNow();
  }

  /**
   * Prunes what the retention policies allow, once per leadership term.
   *
   * Best-effort: a failure here costs disk space, never correctness, so it
   * must not take the sync loops down with it.
   */
  private async runMaintenance(): Promise<void> {
    try {
      const [prunedRows, prunedLedger] = await Promise.all([
        pruneByRetention(),
        pruneConfirmedLedgerEntries(),
      ]);
      if (prunedRows > 0 || prunedLedger > 0) {
        logInfo(
          null,
          `Pruned ${prunedRows} expired row(s) and ${prunedLedger} settled stock entr(ies)`,
          null
        );
      }
    } catch (error) {
      logWarn(null, `Maintenance pass failed: ${describeError(error)}`, null);
    }
  }

  private stopLoops(): void {
    if (this.pullTimer !== null) {
      clearInterval(this.pullTimer);
      this.pullTimer = null;
    }
  }

  private async runPull(): Promise<void> {
    if (this.isPulling || !leaderElection.isLeader || !connectivityMonitor.isOnline()) {
      return;
    }
    const signal = this.abortController?.signal;
    if (!signal) {
      return;
    }

    this.isPulling = true;
    await this.publish();

    try {
      const targets = await resolvePullTargets(signal);
      if (targets.size === 0) {
        logInfo(null, 'All modules up to date — skipping pull', null);
        return;
      }

      // Dependency order matters here too: categories must land before the
      // products that name them, or the UI shows unresolved category labels.
      for (const resource of getResourcesInDependencyOrder()) {
        if (signal.aborted || !connectivityMonitor.isOnline()) {
          break;
        }
        if (!targets.has(resource.id)) {
          continue;
        }

        try {
          await pullResource(resource, signal);
        } catch (error) {
          logError(resource.id, `Pull failed: ${describeError(error)}`, null);
        }
        // Publish per resource so the UI can show a download in progress.
        // Publishing only around the whole loop means `pullState: 'syncing'`
        // is written and cleared without anyone ever observing it.
        await this.publish();
      }
    } finally {
      this.isPulling = false;
      await this.publish();
    }
  }

  private async runFlush(): Promise<void> {
    if (!leaderElection.isLeader || !connectivityMonitor.isOnline()) {
      return;
    }
    if (this.isPushing) {
      // Coalesce concurrent requests into one follow-up pass rather than
      // running overlapping flushes over the same queue.
      this.flushQueued = true;
      return;
    }
    const signal = this.abortController?.signal;
    if (!signal) {
      return;
    }

    this.isPushing = true;
    await this.publish();

    try {
      const summary = await flushOutbox(signal);
      this.flushListeners.forEach((listener) => listener(summary));

      // A compound write changed rows the response didn't describe; re-pull
      // those resources so the mirror matches the server. Routed through
      // `runPull` rather than calling `pullResource` directly, so it cannot
      // run concurrently with a scheduled pull over the same table — one of
      // the two would be clearing it mid-write.
      if (summary.followUps.length > 0 && connectivityMonitor.isOnline()) {
        const targets = new Set(summary.followUps.map((followUp) => followUp.resource));
        for (const resource of getResourcesInDependencyOrder()) {
          if (targets.has(resource.id)) {
            await patchSyncMeta(resource.id, { lastPulledAt: null });
          }
        }
        this.isPushing = false;
        await this.runPull();
        this.isPushing = true;
      }
    } catch (error) {
      logError(null, `Flush failed: ${describeError(error)}`, null);
    } finally {
      this.isPushing = false;
      await this.publish();

      if (this.flushQueued) {
        this.flushQueued = false;
        void this.runFlush();
      }
    }
  }

  private async publish(): Promise<void> {
    if (this.listeners.size === 0) {
      return;
    }

    const modules = await getAllSyncMeta();
    const pendingByResource: Record<string, number> = {};

    // Push state is derived from the queue rather than stored, so it can never
    // drift from the actual outbox contents.
    for (const meta of modules) {
      const unsettled = await countUnsettledForResource(meta.resource as never);
      pendingByResource[meta.resource] = unsettled;
      const failed = await countByStatus('failed', meta.resource as never);
      const nextPushState =
        this.isPushing && unsettled > 0
          ? 'pushing'
          : failed > 0
            ? 'error'
            : unsettled > 0
              ? 'pending'
              : 'idle';
      if (nextPushState !== meta.pushState) {
        meta.pushState = nextPushState;
        await patchSyncMeta(meta.resource as never, { pushState: nextPushState });
      }
    }

    const state: SyncEngineState = {
      connectivity: connectivityMonitor.getSnapshot(),
      isLeader: leaderElection.isLeader,
      isPulling: this.isPulling,
      isPushing: this.isPushing,
      modules,
      pendingByResource,
      totals: {
        pending: await countUnsettled(),
        dead: await countByStatus('dead'),
        conflicts: await countByStatus('conflict'),
      },
    };

    this.listeners.forEach((listener) => listener(state));
  }
}

export const syncEngine = new SyncEngine();
