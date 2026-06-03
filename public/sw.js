const CACHE_NAME = 'shareek-pwa-cache-v1';
const DATA_CACHE_NAME = 'shareek-data-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/shareek_logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't fail install if some assets are missing
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests (e.g. Mutations via POST)
  if (event.request.method !== 'GET') {
    return;
  }

  // Next.js specific files (chunks, css, etc.) - Cache-first, fallback to network
  if (url.pathname.startsWith('/_next/static/') || url.pathname.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // API or RSC payloads (Next.js data fetching) or Supabase data - Network-first
  if (
    url.pathname.startsWith('/api/') || 
    url.searchParams.has('_rsc') || 
    url.origin.includes('supabase.co')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful respond, cache it!
          if (response.status === 200 || response.status === 204) {
            const clone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, serve from cache if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // HTML documents (Navigational) - Network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to '/' if not in cache
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Anything else - Network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
