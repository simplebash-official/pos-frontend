import axios from 'axios';
import { env } from '@/config/env';
import { HEADER_SERVER_TIME, HEALTH_PROBE_TIMEOUT_MS } from '../constants';

/**
 * A deliberately minimal liveness check.
 *
 * It uses its own axios instance rather than `apiClient` so that it carries no
 * auth header, is unaffected by the request interceptor, and — importantly —
 * cannot recursively feed its own failures back into the connectivity signal
 * that `apiClient` publishes.
 */
const probeClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: HEALTH_PROBE_TIMEOUT_MS,
  headers: { 'Cache-Control': 'no-store' },
});

export interface ProbeResult {
  reachable: boolean;
  /** Round-trip time in ms, or `null` when the probe failed. */
  latencyMs: number | null;
  /** The server's clock, when it sent one. */
  serverTime: string | null;
}

export async function probeHealth(signal: AbortSignal): Promise<ProbeResult> {
  const startedAt = Date.now();
  try {
    // The cache-buster defeats any intermediate proxy that would otherwise
    // answer from cache and make a dead backend look alive.
    const response = await probeClient.get('/health', {
      params: { t: startedAt },
      signal,
    });
    const serverTime = response.headers[HEADER_SERVER_TIME];
    return {
      reachable: true,
      latencyMs: Date.now() - startedAt,
      serverTime: typeof serverTime === 'string' ? serverTime : null,
    };
  } catch {
    return { reachable: false, latencyMs: null, serverTime: null };
  }
}
