import { describe, it, expect, afterEach } from 'vitest';

import { isTauri } from '../runtime';

const g = globalThis as unknown as { window?: Record<string, unknown> };

describe('isTauri', () => {
  afterEach(() => {
    if (g.window) delete g.window.__TAURI_INTERNALS__;
  });

  it('is false in a plain (no-window / browser) environment', () => {
    expect(isTauri()).toBe(false);
  });

  it('is true once Tauri has injected its internals bridge', () => {
    const hadWindow = g.window !== undefined;
    if (!hadWindow) g.window = {};
    g.window!.__TAURI_INTERNALS__ = {};
    try {
      expect(isTauri()).toBe(true);
    } finally {
      if (!hadWindow) delete g.window;
    }
  });
});
