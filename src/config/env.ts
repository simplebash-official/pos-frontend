import { PRODUCT_NAME } from './branding';

/**
 * Validated and typed environment configuration.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appName: import.meta.env.VITE_APP_NAME || PRODUCT_NAME,
  // Build identity, baked in by `vite.config.ts`. `commit` is '' outside CI.
  appVersion: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  commit: __GIT_SHA__,
};
