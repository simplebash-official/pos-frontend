import { PRODUCT_NAME } from './branding';

/**
 * Validated and typed environment configuration.
 */
/**
 * Where the desktop app's API lives: the Tauri shell always starts the backend
 * on this loopback port (`src-tauri/src/orchestrator.rs` in pos-desktop).
 * A desktop build (`vite build --mode tauri`) defaults to it, so it never
 * depends on an untracked `.env.tauri` file being present on the build
 * machine — a relative `/api` would resolve against `tauri://localhost` and
 * every request would get the app's own HTML back.
 */
export const DESKTOP_API_BASE_URL = 'http://127.0.0.1:8080/api';

export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === 'tauri' ? DESKTOP_API_BASE_URL : '/api'),
  /**
   * `VITE_MULTI_TENANT=true` builds the web client for a multi-tenant cloud:
   * the login asks for a shop code. Ignored inside the desktop app. A getter so
   * it is read at use time (tests stub it).
   */
  get multiTenant(): boolean {
    return import.meta.env.VITE_MULTI_TENANT === 'true';
  },
  /**
   * Where a person without a shop goes to create one (the SimpleBash main app).
   * A getter so it is read at use time (tests stub it). Only shown on the
   * multi-tenant web login.
   */
  get accountsUrl(): string {
    return (import.meta.env.VITE_ACCOUNTS_URL || 'https://app.simplebash.com').replace(/\/+$/, '');
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appName: import.meta.env.VITE_APP_NAME || PRODUCT_NAME,
  // Build identity, baked in by `vite.config.ts`. `commit` is '' outside CI.
  appVersion: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  commit: __GIT_SHA__,
};
