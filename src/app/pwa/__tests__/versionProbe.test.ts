import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchServerVersion } from '../versionProbe';

describe('fetchServerVersion', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches /version.json with no-store cache and returns parsed build identity', async () => {
    const mockVersion = {
      version: '0.35.0',
      buildTime: '2026-10-27T12:00:00.000Z',
      commit: '28687e1456a7b8c',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVersion,
    } as unknown as Response);

    const result = await fetchServerVersion();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/version.json',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
      })
    );
    expect(result).toEqual(mockVersion);
  });

  it('returns null when fetch returns a non-200 status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const result = await fetchServerVersion();
    expect(result).toBeNull();
  });

  it('returns null when fetch rejects (network error or aborted)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchServerVersion();
    expect(result).toBeNull();
  });

  it('returns null when payload fields are invalid or missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 123 }),
    } as unknown as Response);

    const result = await fetchServerVersion();
    expect(result).toBeNull();
  });
});
