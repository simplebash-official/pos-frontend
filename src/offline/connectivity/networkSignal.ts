/**
 * A dependency-free pub/sub bridging `ApiClient` and `ConnectivityMonitor`.
 *
 * The axios response interceptor knows, before any health probe could, that the
 * backend is unreachable — it just watched a real request fail with
 * `statusCode: 0`. It equally knows the backend is alive when a request
 * succeeds. This module carries those observations to the monitor without
 * making `src/api/client.ts` depend on the engine (which would be circular:
 * the engine's resources are built on top of the api layer).
 */

export type NetworkObservation = 'reachable' | 'unreachable';

type Listener = (observation: NetworkObservation, serverTime: string | null) => void;

const listeners = new Set<Listener>();

export function observeNetwork(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function reportNetworkObservation(
  observation: NetworkObservation,
  serverTime: string | null
): void {
  listeners.forEach((listener) => listener(observation, serverTime));
}
