import { PRODUCT_NAME } from './branding';

/**
 * Validated and typed environment configuration.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  /**
   * `VITE_MULTI_TENANT=true` builds the web client for a multi-tenant cloud:
   * the login asks for a shop code. Ignored inside the desktop app. A getter so
   * it is read at use time (tests stub it).
   */
  get multiTenant(): boolean {
    return import.meta.env.VITE_MULTI_TENANT === 'true';
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appName: import.meta.env.VITE_APP_NAME || PRODUCT_NAME,
  // Build identity, baked in by `vite.config.ts`. `commit` is '' outside CI.
  appVersion: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  commit: __GIT_SHA__,
};
