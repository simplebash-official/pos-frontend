import { describe, it, expect } from 'vitest';

import { useRegisterSW } from '../pwaRegisterStub';

/**
 * The Tauri build aliases `virtual:pwa-register/react` to this stub. If its
 * shape drifts from what `PwaUpdateContext` destructures, the desktop bundle
 * breaks at runtime with no type error (the alias is resolved by Vite, not
 * TS). Lock the contract here.
 */
describe('pwaRegisterStub useRegisterSW', () => {
  it('returns the vite-plugin-pwa result shape with a no-op updater', async () => {
    const result = useRegisterSW({ onRegisteredSW: () => {} });

    expect(result.needRefresh[0]).toBe(false);
    expect(result.offlineReady[0]).toBe(false);
    expect(typeof result.needRefresh[1]).toBe('function');
    expect(typeof result.offlineReady[1]).toBe('function');
    await expect(result.updateServiceWorker(true)).resolves.toBeUndefined();
  });

  it('accepts being called with no arguments', () => {
    expect(() => useRegisterSW()).not.toThrow();
  });
});
