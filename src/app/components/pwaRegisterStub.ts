/**
 * Build-time replacement for `virtual:pwa-register/react`, aliased in by
 * `vite.config.ts` when `TAURI=true`.
 *
 * The Tauri desktop bundle disables `vite-plugin-pwa` entirely — service
 * workers are unreliable under Tauri's custom app protocol, and the app is
 * already "installed", so there is no shell to precache and no deploy to
 * prompt about (updates ship through the Tauri updater instead). This stub
 * mirrors the exact shape `AppUpdatePrompt.tsx` consumes so that component
 * needs no `#ifdef`-style branching.
 */
type SetState<T> = (value: T) => void;

interface RegisterSWResult {
  needRefresh: [boolean, SetState<boolean>];
  offlineReady: [boolean, SetState<boolean>];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

const noop: SetState<boolean> = () => {};

export function useRegisterSW(): RegisterSWResult {
  return {
    needRefresh: [false, noop],
    offlineReady: [false, noop],
    updateServiceWorker: async () => {},
  };
}
