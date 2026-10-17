/// <reference lib="webworker" />
import { cacheNames } from 'workbox-core';
import {
  addPlugins,
  addRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  getCacheKeyForURL,
  precache,
  type PrecacheEntry,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

import { UPDATE_PROGRESS_CHANNEL, type UpdateProgress } from './app/pwa/updateProgress';

// Same behaviour as the generated worker this replaces (precached app shell,
// SPA navigation fallback, update applied only when the page asks), plus
// download progress so the header can show a new version arriving.
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>;
};

const manifest = self.__WB_MANIFEST;
const channel = new BroadcastChannel(UPDATE_PROGRESS_CHANNEL);

let done = 0;
let total = 0;

const report = () => {
  if (total > 0) channel.postMessage({ done, total } satisfies UpdateProgress);
};

// Counts every file Workbox finishes downloading during install.
addPlugins([
  {
    fetchDidSucceed: async ({ response }) => {
      done += 1;
      report();
      return response;
    },
  },
]);

precache(manifest);
addRoute();
cleanupOutdatedCaches();

// Runs alongside Workbox's own install handler. Files already in the cache
// (unchanged since the last version) are skipped by Workbox, so they are left
// out of the total as well.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheNames.precache);
      const cached = new Set((await cache.keys()).map((request) => request.url));
      const needed = new Set<string>();
      for (const entry of manifest) {
        const key = getCacheKeyForURL(typeof entry === 'string' ? entry : entry.url);
        if (key && !cached.has(new URL(key, self.location.href).href)) needed.add(key);
      }
      total = needed.size;
      report();
    })()
  );
});

// Never navigate API calls to the shell — a cached 200 would make an
// unreachable backend look online.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] })
);

// What `updateServiceWorker()` from vite-plugin-pwa posts to apply an update.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});
