import { STORAGE_KEYS } from '@/constants';
import { env } from '@/config/env';
import {
  DEGRADED_LATENCY_MS,
  HEALTH_PROBE_BACKOFF_MS,
  HEALTH_PROBE_INTERVAL_ONLINE_MS,
  OFFLINE_FAILURE_THRESHOLD,
  ONLINE_SETTLE_MS,
} from '../constants';
import { probeHealth } from './healthProbe';
import { observeNetwork } from './networkSignal';
import type { ConnectivityListener, ConnectivitySnapshot, ConnectivityState } from './types';

/**
 * Decides whether the backend is reachable.
 *
 * `navigator.onLine` alone is not an answer — it reports the link layer, so a
 * terminal connected to a router with no upstream reports `true`. Three
 * signals are combined instead:
 *
 *  1. `navigator.onLine === false` — conclusive proof of offline, acted on
 *     immediately. There is no false positive in that direction.
 *  2. Real API traffic, via `networkSignal`. A completed request is the best
 *     possible evidence of reachability and costs nothing; a `statusCode: 0`
 *     failure is a strong vote for offline.
 *  3. A `GET /health` probe — the tiebreaker when there is no traffic.
 *
 * Hysteresis is deliberately asymmetric: bad news is published immediately so
 * the cashier learns they are offline before finishing a sale, while good news
 * is held for a settle window so a flapping link doesn't spam the UI.
 */
export class ConnectivityMonitor {
  private snapshot: ConnectivitySnapshot;
  private listeners = new Set<ConnectivityListener>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  /** State waiting out the settle window, if any. */
  private pendingState: ConnectivityState | null = null;
  private abortController: AbortController | null = null;
  private unobserveNetwork: (() => void) | null = null;
  private backoffIndex = 0;
  private started = false;

  constructor() {
    this.snapshot = {
      state: 'checking',
      linkUp: navigator.onLine,
      lastReachableAt: null,
      lastProbeAt: null,
      consecutiveFailures: 0,
      clockSkewMs: null,
    };
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    window.addEventListener('online', this.handleLinkUp);
    window.addEventListener('offline', this.handleLinkDown);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.unobserveNetwork = observeNetwork(this.handleNetworkObservation);

    void this.runProbe();
  }

  stop(): void {
    this.started = false;
    window.removeEventListener('online', this.handleLinkUp);
    window.removeEventListener('offline', this.handleLinkDown);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.unobserveNetwork?.();
    this.unobserveNetwork = null;
    this.clearTimers();
    this.abortController?.abort();
    this.abortController = null;

    // Drop back to 'checking' so a later start() re-verifies rather than
    // handing a stale verdict to whoever subscribes first — `subscribe`
    // replays the current snapshot immediately.
    this.snapshot = {
      ...this.snapshot,
      state: 'checking',
      consecutiveFailures: 0,
    };
    this.backoffIndex = 0;
  }

  subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): ConnectivitySnapshot {
    return this.snapshot;
  }

  isOnline(): boolean {
    return this.snapshot.state === 'online' || this.snapshot.state === 'degraded';
  }

  /**
   * Forces an immediate probe and resolves once its verdict is in.
   *
   * Awaitable on purpose: "Sync now" reads `isOnline()` straight afterwards,
   * and a fire-and-forget probe would leave it reading the stale verdict —
   * making the button a no-op for the first few seconds after a connection
   * comes back, which is exactly when someone presses it.
   */
  async checkNow(): Promise<void> {
    this.clearTimers();
    await this.runProbe();
    // A restored connection is only published after the settle window. The
    // caller asked explicitly, so don't make them wait it out.
    this.commitPendingSettle();
  }

  // -------------------------------------------------------------------------
  // Signal handlers
  // -------------------------------------------------------------------------

  private handleLinkUp = (): void => {
    this.update({ linkUp: true });
    this.checkNow();
  };

  private handleLinkDown = (): void => {
    // Cancel any probe already in flight — it would land after this and could
    // report success, flipping the state straight back to online.
    this.abortController?.abort();
    // The link is definitively down. No probe can succeed, so don't wait for one.
    this.update({ linkUp: false, consecutiveFailures: OFFLINE_FAILURE_THRESHOLD });
    this.transitionTo('offline');
    this.scheduleNextProbe();
  };

  private handleVisibilityChange = (): void => {
    if (!document.hidden) {
      // The user just came back; their first question is "am I online?".
      this.checkNow();
    }
  };

  private handleNetworkObservation = (
    observation: 'reachable' | 'unreachable',
    serverTime: string | null
  ): void => {
    if (observation === 'reachable') {
      // Real API traffic proves reachability but says nothing useful about
      // latency (payload sizes vary wildly), so it never downgrades to
      // `degraded` — only the fixed-cost health probe does.
      this.recordSuccess(serverTime, null);
      return;
    }
    this.recordFailure();
  };

  // -------------------------------------------------------------------------
  // Probing
  // -------------------------------------------------------------------------

  private async runProbe(): Promise<void> {
    if (!this.started) {
      return;
    }

    if (this.isSimulatedOffline()) {
      this.update({ consecutiveFailures: OFFLINE_FAILURE_THRESHOLD, lastProbeAt: Date.now() });
      this.transitionTo('offline');
      this.scheduleNextProbe();
      return;
    }

    if (!navigator.onLine) {
      this.update({ linkUp: false, lastProbeAt: Date.now() });
      this.transitionTo('offline');
      this.scheduleNextProbe();
      return;
    }

    this.abortController?.abort();
    this.abortController = new AbortController();

    const result = await probeHealth(this.abortController.signal);

    // The probe is awaited, so `stop()` may have run while it was in flight.
    // Writing state now would notify listeners after teardown and can arm a
    // settle timer that nothing will ever clear.
    if (!this.started) {
      return;
    }

    this.update({ lastProbeAt: Date.now() });

    if (result.reachable) {
      this.recordSuccess(result.serverTime, result.latencyMs);
    } else {
      this.recordFailure();
    }

    this.scheduleNextProbe();
  }

  private recordSuccess(serverTime: string | null, latencyMs: number | null): void {
    const clockSkewMs =
      serverTime === null ? this.snapshot.clockSkewMs : new Date(serverTime).getTime() - Date.now();

    this.update({
      lastReachableAt: Date.now(),
      consecutiveFailures: 0,
      clockSkewMs,
    });
    this.backoffIndex = 0;
    // Reachable but slow is its own state: sync works, just badly. Real API
    // traffic reports no latency, so those observations leave the current
    // verdict alone rather than pretending the connection is fast.
    if (latencyMs === null) {
      if (this.snapshot.state !== 'degraded') {
        this.transitionTo('online');
      }
    } else {
      const isSlow = latencyMs >= DEGRADED_LATENCY_MS;
      this.transitionTo(isSlow ? 'degraded' : 'online');
    }
  }

  private recordFailure(): void {
    const consecutiveFailures = this.snapshot.consecutiveFailures + 1;
    this.update({ consecutiveFailures });

    // One failed request can be a server hiccup rather than an outage. Require
    // corroboration before declaring the app offline.
    if (consecutiveFailures >= OFFLINE_FAILURE_THRESHOLD) {
      this.transitionTo('offline');
    }
  }

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  private transitionTo(next: ConnectivityState): void {
    if (this.snapshot.state === next) {
      return;
    }

    if (next === 'offline') {
      // Publish immediately — never delay bad news.
      this.clearSettleTimer();
      this.update({ state: 'offline' });
      return;
    }

    // Hold a restored connection briefly so a flapping link doesn't announce
    // itself repeatedly. A pending settle timer means we're already waiting.
    if (this.settleTimer !== null) {
      this.pendingState = next;
      return;
    }
    this.pendingState = next;
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      const pending = this.pendingState;
      this.pendingState = null;
      if (pending !== null && this.snapshot.consecutiveFailures === 0) {
        this.update({ state: pending });
      }
    }, ONLINE_SETTLE_MS);
  }

  /** Publishes a settling "back online" verdict immediately. */
  private commitPendingSettle(): void {
    if (this.pendingState === null) {
      return;
    }
    const pending = this.pendingState;
    this.pendingState = null;
    this.clearSettleTimer();
    if (this.snapshot.consecutiveFailures === 0) {
      this.update({ state: pending });
    }
  }

  private scheduleNextProbe(): void {
    if (!this.started) {
      return;
    }
    this.clearProbeTimer();

    let delay: number;
    if (this.isOnline()) {
      delay = HEALTH_PROBE_INTERVAL_ONLINE_MS;
      this.backoffIndex = 0;
    } else {
      delay = HEALTH_PROBE_BACKOFF_MS[this.backoffIndex];
      this.backoffIndex = Math.min(this.backoffIndex + 1, HEALTH_PROBE_BACKOFF_MS.length - 1);
    }

    this.timer = setTimeout(() => {
      void this.runProbe();
    }, delay);
  }

  private clearProbeTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private clearSettleTimer(): void {
    if (this.settleTimer !== null) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearProbeTimer();
    this.clearSettleTimer();
  }

  /**
   * Fields that only record *when* something happened, not *what* the verdict
   * is. They change on every single probe, so notifying on them would wake
   * every subscriber every 30 seconds — and each wake-up costs a full engine
   * state publish, a batch of IndexedDB counts, a Redux dispatch and a
   * re-render of the whole sync UI, all to report nothing new.
   */
  private static readonly TELEMETRY_KEYS: ReadonlySet<keyof ConnectivitySnapshot> = new Set([
    'lastProbeAt',
    'lastReachableAt',
    'clockSkewMs',
  ]);

  private update(patch: Partial<ConnectivitySnapshot>): void {
    const next = { ...this.snapshot, ...patch };
    const changed = (Object.keys(patch) as (keyof ConnectivitySnapshot)[]).some(
      (key) => !ConnectivityMonitor.TELEMETRY_KEYS.has(key) && this.snapshot[key] !== next[key]
    );
    // The snapshot is always advanced so readers see fresh timestamps; only
    // the notification is withheld.
    this.snapshot = next;
    if (!changed) {
      return;
    }
    this.listeners.forEach((listener) => listener(next));
  }

  /** Dev-only override so offline behaviour is testable without DevTools throttling. */
  private isSimulatedOffline(): boolean {
    return env.isDev && localStorage.getItem(STORAGE_KEYS.OFFLINE_SIMULATION) === 'offline';
  }
}

export const connectivityMonitor = new ConnectivityMonitor();
