const CACHE_NAME = 'glow-salon-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Tell the active service worker to take control of the page immediately.
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Skip caching API routes completely so data is always fresh
  if (url.pathname.startsWith('/api/')) return;
  
  // Skip caching cross-origin requests like Google Fonts or Firebase APIs unless explicitly handled
  if (url.origin !== self.location.origin) return;

  // Stale-While-Revalidate caching strategy for everything else
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Fallback behavior if network fails (offline)
        return cachedResponse;
      });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
