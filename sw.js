const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URLS = ["/", "/index.html", "/style.css", "/script.js"];

// Install event to cache the required resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    }),
  );
  console.log("Service Worker Installed and Cached Offline Resources");
});

// Activate event to update the cache if needed
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  console.log("Service Worker Activated");
});

// Fetch event to serve cached resources when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
      .catch(() => caches.match("/index.html")),
  );
});
