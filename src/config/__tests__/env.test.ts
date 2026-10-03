import { afterEach, describe, expect, it, vi } from 'vitest';

// `env` reads import.meta.env once at import time, so each case stubs the
// build-time values and imports a fresh copy of the module.
const loadEnv = async () => {
  vi.resetModules();
  return import('../env');
};

describe('env.apiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults a desktop (tauri-mode) build to the local backend, with no .env file', async () => {
    vi.stubEnv('MODE', 'tauri');
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { env, DESKTOP_API_BASE_URL } = await loadEnv();
    expect(env.apiBaseUrl).toBe(DESKTOP_API_BASE_URL);
    expect(DESKTOP_API_BASE_URL).toBe('http://127.0.0.1:8080/api');
  });

  it('defaults a web build to the same-origin /api', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { env } = await loadEnv();
    expect(env.apiBaseUrl).toBe('/api');
  });

  it('always honours an explicit VITE_API_BASE_URL', async () => {
    vi.stubEnv('MODE', 'tauri');
    vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1:9999/api');
    const { env } = await loadEnv();
    expect(env.apiBaseUrl).toBe('http://127.0.0.1:9999/api');
  });
});
