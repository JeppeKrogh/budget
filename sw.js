const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URLS = [
  "/budget",
  "/budget/index.html",
  "/budget/192x192.png",
  "/budget/512x512.png",
  "/budget/manifest.json",
  "/budget/tailwind.config.js",
  "/budget/assets/css/material-tailwind.css",
  "/budget/assets/js/budget.js",
  "/budget/assets/js/ripple.js",
  "/budget/assets/js/tw.js",
  "/budget/offline.html", // Add an offline fallback page, if possible
];

// Install event to cache the required resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((error) => {
        console.error("Failed to cache resources during install", error);
      });
    })
  );
  console.log("Service Worker Installed");
});

// Activate event to update the cache if needed
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log("Service Worker Activated");
});

// Fetch event to serve cached resources when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // If there's no cached response, try to fetch from the network
      return fetch(event.request)
        .catch(() => {
          // If the network fails (e.g., offline), show fallback page or resource
          return caches.match("/budget/offline.html");
        });
    })
  );
});