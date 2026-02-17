// IMPORTANT:
// In Vite dev/preview, caching /src and /node_modules/.vite can serve stale modules,
// causing React hook runtime errors like "Cannot read properties of null (reading 'useState')".
// This SW therefore:
// - caches only a small app-shell list
// - avoids caching Vite dev modules/scripts
// - uses network-first for navigations

const CACHE_NAME = 'boch-lend-v4';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/lovable-uploads/15f313b6-814c-4267-a0b9-9f8375b0be63.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

function shouldBypassCache(request) {
  // Only cache GET requests
  if (request.method !== 'GET') return true;

  const url = new URL(request.url);

  // Never cache cross-origin requests
  if (url.origin !== self.location.origin) return true;

  // Never cache Vite dev modules (these change frequently and caching causes stale bundles)
  if (url.pathname.startsWith('/src/')) return true;
  if (url.pathname.startsWith('/node_modules/')) return true;

  // Vite HMR/timestamped URLs
  if (url.searchParams.has('t') || url.searchParams.has('v')) return true;

  // Explicitly bypass caching for scripts/styles while in dev-like serving paths
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'worker') {
    return true;
  }

  return false;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Update cache for navigations/app-shell
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Navigations: prefer network, fallback to cache (helps avoid stale app shell)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Bypass caching for Vite dev scripts/modules to prevent stale React copies
  if (shouldBypassCache(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for small static assets and app shell
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return response;
      });
    })
  );
});