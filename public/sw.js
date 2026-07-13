const CACHE = 'focusflow-v2';
const SHELL = [
  '/Focus-Flow/',
  '/Focus-Flow/index.html',
  '/Focus-Flow/manifest.webmanifest',
  '/Focus-Flow/icon-192.png',
  '/Focus-Flow/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;

      return fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.url.includes('/Focus-Flow/')) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/Focus-Flow/index.html'));
    })
  );
});
