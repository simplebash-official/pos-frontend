import type { BuildIdentity } from './updatePolicy';

/**
 * Fetches `/version.json` from the server with `cache: 'no-store'` using an optional AbortSignal.
 *
 * Emitted by `dist/version.json` on production builds and served via Vite dev server middleware.
 * Returns null if the request fails, is aborted, or returns a non-200 or invalid payload.
 */
export const fetchServerVersion = async (signal?: AbortSignal): Promise<BuildIdentity | null> => {
  try {
    const response = await fetch('/version.json', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) return null;
    const body = (await response.json()) as unknown;
    if (typeof body !== 'object' || body === null) return null;
    const record = body as Record<string, unknown>;
    if (
      typeof record.version !== 'string' ||
      typeof record.buildTime !== 'string' ||
      typeof record.commit !== 'string'
    ) {
      return null;
    }
    return {
      version: record.version,
      buildTime: record.buildTime,
      commit: record.commit,
    };
  } catch {
    return null;
  }
};
