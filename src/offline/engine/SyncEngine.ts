import { PULL_INTERVAL_MS } from '../constants';
import { connectivityMonitor } from '../connectivity/ConnectivityMonitor';
import type { ConnectivitySnapshot } from '../connectivity/types';
import { getAllSyncMeta, patchSyncMeta } from '../db/syncMeta';
import type { SyncMetaRecord } from '../db/tables';
import { countByStatus, countUnsettled, countUnsettledForResource } from '../outbox/outbox';
import { flushOutbox, type FlushSummary } from '../outbox/flush';
import { describeError } from '../errors';
import { getResourcesInDependencyOrder } from '../registry/registry';
import { logError, logInfo } from './auditLog';
import { leaderElection } from './leader';
import { pullResource } from './pull';

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

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.abortController = new AbortController();

    connectivityMonitor.start();
    this.unsubscribeConnectivity = connectivityMonitor.subscribe(this.handleConnectivityChange);

    leaderElection.start(
      () => {
        this.startLoops();
        void this.publish();
      },
      () => {
        this.stopLoops();
        void this.publish();
      }
    );

    void this.publish();
  }

  stop(): void {
    this.started = false;
    this.stopLoops();
    leaderElection.stop();
    this.unsubscribeConnectivity?.();
    this.unsubscribeConnectivity = null;
    connectivityMonitor.stop();
    this.abortController?.abort();
    this.abortController = null;
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

  /** The "Sync now" button: probe, pull everything, then push. */
  async syncNow(): Promise<void> {
    connectivityMonitor.checkNow();
    await this.runPull();
    await this.runFlush();
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
      // A hidden tab has nobody to show fresh data to; skip the round trip.
      if (document.hidden || !connectivityMonitor.isOnline()) {
        return;
      }
      void this.runPull();
      void this.runFlush();
    }, PULL_INTERVAL_MS);

    void this.syncNow();
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
      // Dependency order matters here too: categories must land before the
      // products that name them, or the UI shows unresolved category labels.
      for (const resource of getResourcesInDependencyOrder()) {
        if (signal.aborted || !connectivityMonitor.isOnline()) {
          break;
        }
        try {
          await pullResource(resource, signal);
        } catch (error) {
          logError(resource.id, `Pull failed: ${describeError(error)}`, null);
        }
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
      // those resources so the mirror matches the server.
      if (summary.followUps.length > 0 && connectivityMonitor.isOnline()) {
        const targets = new Set(summary.followUps.map((followUp) => followUp.resource));
        for (const resource of getResourcesInDependencyOrder()) {
          if (targets.has(resource.id)) {
            await pullResource(resource, signal).catch(() => undefined);
          }
        }
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

    // Push state is derived from the queue rather than stored, so it can never
    // drift from the actual outbox contents.
    for (const meta of modules) {
      const unsettled = await countUnsettledForResource(meta.resource as never);
      const nextPushState =
        meta.pushState === 'blocked'
          ? 'blocked'
          : this.isPushing && unsettled > 0
            ? 'pushing'
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
