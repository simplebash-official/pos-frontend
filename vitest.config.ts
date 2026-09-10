import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Separate from `vite.config.ts` on purpose: the app config registers the PWA
 * plugin, which has no business running for a test process, and pulling in
 * `@vitejs/plugin-react` would make every offline-engine test pay for a JSX
 * transform it never uses.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Mirror the build-time constants `vite.config.ts` injects, so any module
  // that reads `src/config/env.ts` loads under the test runner too.
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
    __BUILD_TIME__: JSON.stringify('1970-01-01T00:00:00.000Z'),
    __GIT_SHA__: JSON.stringify(''),
  },
  test: {
    environment: 'node',
    // `fake-indexeddb/auto` installs a real IndexedDB implementation on
    // `globalThis`, so Dexie runs unmodified — these tests exercise the actual
    // engine against an actual database rather than a mocked one.
    setupFiles: ['./src/offline/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/graphify-out/**'],
  },
});
