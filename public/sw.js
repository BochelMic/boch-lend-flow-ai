// IMPORTANT:
// In Vite dev/preview, caching /src and /node_modules/.vite can serve stale modules,
// causing React hook runtime errors like "Cannot read properties of null (reading 'useState')".
// This SW therefore:
// - caches only a small app-shell list
// - avoids caching Vite dev modules/scripts
// - uses network-first for navigations
// - NEVER caches API or Supabase requests

const CACHE_NAME = 'boch-lend-v10';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo-bochel.png',
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

  // Exclude Supabase and other API endpoints from caching
  if (url.hostname.includes('supabase.co') || url.hostname.includes('vercel.app')) return true;

  // Never cache cross-origin requests
  if (url.origin !== self.location.origin) return true;

  // Never cache POST, PUT, DELETE, etc.
  if (request.method !== 'GET') return true;

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

async function networkFirst(request, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);

    // Only cache successful GET responses
    if (response && response.status === 200 && request.method === 'GET') {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      } catch (cacheErr) {
        console.warn('🛡️ Guardian: Falha ao guardar no cache:', cacheErr);
      }
    }
    return response;
  } catch (err) {
    clearTimeout(id);
    const cached = await caches.match(request);
    if (cached) {
      console.log('🛡️ Guardian: Usando cache devido a falha ou lentidão na rede:', request.url);
      return cached;
    }
    // For navigation requests, if everything fails, we still want to throw 
    // but with a clearer message
    console.error('🛡️ Guardian: Falha total na rede e sem cache para:', request.url);
    throw err;
  }
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // STRICT BYPASS: Never intercept non-GET or Supabase requests
  if (shouldBypassCache(request)) {
    return; 
  }

  // Navigations: prefer network, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for small static assets and app shell
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache valid GET responses
        if (response && response.status === 200 && response.type === 'basic' && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(e => console.warn('Cache put failed:', e));
          });
        }
        return response;
      }).catch(err => {
        console.error('Fetch failed for:', request.url, err);
        throw err;
      });
    })
  );
});

// --- Push Notifications ---
self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Nova Notificação - Bochel';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: '/logo-bochel.png',
    badge: '/logo-bochel.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
