import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tsconfigPaths(),
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
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
    }),
  ],
  server: {
    watch: {
      ignored: [
        '**/graphify-out/**',
        '**/.obsidian/**',
        '**/.agents/**',
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
