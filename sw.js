// Network-first service worker. GitHub Pages lets browsers cache files for
// 10 minutes, which hides a fresh push on a phone. This asks the server for
// the latest version of every file on each load, and falls back to the last
// copy it saw when there's no connection. Keep it small and stable: a broken
// service worker is hard to get rid of.

const CACHE = 'usg-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      let res;
      try { res = await fetch(req, { cache: 'no-cache' }); } catch (e) { res = await fetch(req); }
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    } catch (err) {
      const hit = await caches.match(req);
      if (hit) return hit;
      throw err;
    }
  })());
});
