
const CACHE_NAME = 'practizone-v5-android-master';
const RUNTIME_CACHE = 'practizone-runtime-v5';

// Core assets to pre-cache immediately for offline shell
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap'
];

// API Routes to explicitly IGNORE in SW
// This allows the fetch to fail to the browser's network stack, 
// triggering the catch() block in libs/api.ts for the Virtual Backend.
const API_ROUTES = [
    '/auth',
    '/appointments',
    '/patients',
    '/ai',
    '/settings',
    '/webhooks',
    '/integrations'
];

// 1. Install Phase
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// 2. Activate Phase (Cleanup)
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL is an API call
const isApiCall = (url) => {
    return API_ROUTES.some(route => url.includes(route));
};

// 3. Fetch Strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // STRATEGY A: API Calls -> Network Only (Pass through)
  // We want these to fail if offline so libs/api.ts handles the fallback
  if (isApiCall(url.pathname)) {
      return; 
  }

  // STRATEGY B: Navigation (HTML) -> Network First, Fallback to Cache
  // Ensures user gets latest version if online, but App Shell if offline
  if (event.request.mode === 'navigate') {
      event.respondWith(
          fetch(event.request)
            .catch(() => {
                return caches.match('/index.html');
            })
      );
      return;
  }

  // STRATEGY C: Static Assets (JS, CSS, Images, Fonts) -> Cache First, Stale-While-Revalidate
  // Serve fast from cache, update in background
  if (
      url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2)$/) ||
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      event.request.destination === 'image' ||
      event.request.destination === 'font' ||
      url.hostname.includes('cdn.tailwindcss.com') || 
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('esm.sh')
  ) {
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Return cached response immediately if found
            if (cachedResponse) {
                // Background update (Stale-While-Revalidate)
                fetch(event.request).then(response => {
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(event.request, response.clone());
                    });
                }).catch(err => {}); // Eat errors for background sync
                
                return cachedResponse;
            }

            // If not in cache, fetch from network
            return caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    // Cache the new resource
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
      );
      return;
  }

  // STRATEGY D: Default -> Network Only
});
