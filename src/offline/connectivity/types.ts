export type ConnectivityState =
  /** The backend answered recently. */
  | 'online'
  /** Reachable but slow or erroring — sync continues, the UI warns. */
  | 'degraded'
  /** The backend is unreachable. Writes queue locally. */
  | 'offline'
  /** Startup, before the first verdict. */
  | 'checking';

export interface ConnectivitySnapshot {
  state: ConnectivityState;
  /** `navigator.onLine` — the link layer only. False is conclusive; true is not. */
  linkUp: boolean;
  /** Epoch ms of the last proof the backend answered. `null` means never. */
  lastReachableAt: number | null;
  lastProbeAt: number | null;
  consecutiveFailures: number;
  /** Server clock minus device clock, ms. `null` until a server time is seen. */
  clockSkewMs: number | null;
}

export type ConnectivityListener = (snapshot: ConnectivitySnapshot) => void;
