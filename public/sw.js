// Version changes with each deployment - forces cache refresh
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `ironmind-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ironmind-dynamic-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install - new version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate - cleaning old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - NETWORK FIRST for app files, cache for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and external requests - always go to network
  if (url.pathname.startsWith('/api') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('anthropic')) {
    return;
  }

  // For HTML and JS files - NETWORK FIRST (always get latest)
  if (request.headers.get('accept')?.includes('text/html') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.jsx') ||
      url.pathname.endsWith('.ts') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Got network response - cache it and return
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed - try cache as fallback
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // For other assets (images, fonts, css) - cache first for speed
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache - fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache the new response
        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Force refresh all caches
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    });
  }
});
