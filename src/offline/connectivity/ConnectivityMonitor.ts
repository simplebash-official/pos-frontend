import { STORAGE_KEYS } from '@/constants';
import { env } from '@/config/env';
import {
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

  /** Forces an immediate probe — used by the "Sync now" button and on reconnect. */
  checkNow(): void {
    this.clearTimers();
    void this.runProbe();
  }

  // -------------------------------------------------------------------------
  // Signal handlers
  // -------------------------------------------------------------------------

  private handleLinkUp = (): void => {
    this.update({ linkUp: true });
    this.checkNow();
  };

  private handleLinkDown = (): void => {
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
      this.recordSuccess(serverTime);
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
    this.update({ lastProbeAt: Date.now() });

    if (result.reachable) {
      this.recordSuccess(result.serverTime);
    } else {
      this.recordFailure();
    }

    this.scheduleNextProbe();
  }

  private recordSuccess(serverTime: string | null): void {
    const clockSkewMs =
      serverTime === null ? this.snapshot.clockSkewMs : new Date(serverTime).getTime() - Date.now();

    this.update({
      lastReachableAt: Date.now(),
      consecutiveFailures: 0,
      clockSkewMs,
    });
    this.backoffIndex = 0;
    this.transitionTo('online');
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
      return;
    }
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      if (this.snapshot.consecutiveFailures === 0) {
        this.update({ state: next });
      }
    }, ONLINE_SETTLE_MS);
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

  private update(patch: Partial<ConnectivitySnapshot>): void {
    const next = { ...this.snapshot, ...patch };
    const changed = (Object.keys(patch) as (keyof ConnectivitySnapshot)[]).some(
      (key) => this.snapshot[key] !== next[key]
    );
    if (!changed) {
      return;
    }
    this.snapshot = next;
    this.listeners.forEach((listener) => listener(next));
  }

  /** Dev-only override so offline behaviour is testable without DevTools throttling. */
  private isSimulatedOffline(): boolean {
    return env.isDev && localStorage.getItem(STORAGE_KEYS.OFFLINE_SIMULATION) === 'offline';
  }
}

export const connectivityMonitor = new ConnectivityMonitor();
