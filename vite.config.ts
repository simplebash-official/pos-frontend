import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Build identity, baked in at compile time and read back through
// `src/config/env.ts`. `package.json` `version` is the single source of truth;
// `VITE_GIT_SHA` is set by CI (see `.github/workflows/deploy.yml`).
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
) as { version: string };
const appVersion = pkg.version;
const buildTime = new Date().toISOString();
const gitSha = process.env.VITE_GIT_SHA ?? '';

// Emits `dist/version.json` so the running deployment can be identified from
// the outside (ops, the Settings → Updates panel's "you are running" line).
// Detection of a *new* version is the service worker's job, not this file's.
const emitVersionJson = (): Plugin => ({
  name: 'jana2u-emit-version-json',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ version: appVersion, buildTime, commit: gitSha }, null, 2),
    });
  },
});

// The desktop (Tauri) build sets TAURI=true. Under Tauri's custom app
// protocol a service worker is unreliable and pointless (the app is already
// installed; updates go through the Tauri updater), so the PWA plugin is
// dropped and `virtual:pwa-register/react` is aliased to a no-op stub.
const isTauri = process.env.TAURI === 'true';

const plugins: PluginOption[] = [react(), emitVersionJson()];

if (!isTauri) {
  plugins.push(
    /**
     * Precaches the app shell so the POS still loads with no network.
     *
     * Without this the offline database is unreachable — a power cut that also
     * drops the Wi-Fi would leave the cashier looking at the browser's offline
     * page, and none of the sync work would matter.
     */
    VitePWA({
      // Never 'autoUpdate': swapping the service worker under a cashier
      // mid-sale would reload the page and lose the cart.
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Never serve the shell in place of an API response — a cached 200
        // would make an unreachable backend look online and defeat the
        // connectivity detection entirely.
        navigateFallbackDenylist: [/^\/api\//],
        // Deliberately empty: Dexie is the data cache. An HTTP cache on top of
        // it would be a third source of truth for the same records.
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
        // The Tabler icon shards are large.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'JANA2U POS',
        short_name: 'JANA2U',
        description: 'Point of sale for Jana2U Service Center',
        display: 'standalone',
        orientation: 'any',
        start_url: '/billing',
        scope: '/',
        background_color: '#F5F5F7',
        theme_color: '#F5F5F7',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      devOptions: {
        // Off in dev: a service worker caching the dev server's modules makes
        // hot reload behave unpredictably. Test offline against `npm run preview`.
        enabled: false,
      },
    })
  );
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: isTauri
      ? {
          'virtual:pwa-register/react': fileURLToPath(
            new URL('./src/app/components/pwaRegisterStub.ts', import.meta.url)
          ),
        }
      : undefined,
  },
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __GIT_SHA__: JSON.stringify(gitSha),
  },
  plugins,
  build: {
    // This app ships as a Tauri desktop bundle served from the local disk —
    // there is no network transfer, so uncompressed chunk size barely matters.
    // The two chunks over the 500 kB default are both lazy: the pdf.js worker
    // (~1.2 MB, inlined because WKWebView can't load a Worker from tauri://,
    // loaded only when previewing/printing) and the Mantine core vendor bundle.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/')
            ) {
              return 'vendor-react';
            }
            // Charting stack (reports/dashboard only) — kept out of vendor-mantine
            // so `@mantine/charts` doesn't drag Recharts + D3 onto the initial path.
            if (
              id.includes('/recharts/') ||
              id.includes('/@mantine/charts/') ||
              id.includes('/d3-') ||
              id.includes('/victory-vendor/') ||
              id.includes('/internmap/') ||
              id.includes('/recharts-scale/') ||
              id.includes('/react-smooth/')
            ) {
              return 'vendor-charts';
            }
            if (id.includes('/@mantine/')) {
              return 'vendor-mantine';
            }
            if (id.includes('/@tanstack/')) {
              return 'vendor-tanstack';
            }
            if (id.includes('/@reduxjs/') || id.includes('/react-redux/')) {
              return 'vendor-redux';
            }
            if (id.includes('/dexie/')) {
              return 'vendor-dexie';
            }
          }
        },
      },
    },
  },
  server: {
    watch: {
      ignored: [
        '**/dist/**',
        '**/graphify-out/**',
        '**/.obsidian/**',
        '**/.agents/**',
        '**/.claude/**',
        '**/.github/**',
        '**/*.md',
        '**/backend-sync-requirements.html',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
