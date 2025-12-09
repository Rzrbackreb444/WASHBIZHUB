const CACHE_NAME = 'washbizhub-v1';
const STATIC_CACHE = 'washbizhub-static-v1';
const DYNAMIC_CACHE = 'washbizhub-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.png',
  '/washbizhub-logo.png',
  '/manifest.json'
];

const CACHEABLE_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.woff2', '.woff'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  
  if (url.pathname.startsWith('/api/')) return;
  
  if (url.hostname.includes('stripe.com') || 
      url.hostname.includes('google') ||
      url.hostname.includes('analytics')) return;

  const isCacheable = CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext)) ||
                      url.pathname === '/' ||
                      url.pathname.includes('/assets/');

  if (isCacheable) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
