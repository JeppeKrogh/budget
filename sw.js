const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URLS = [
  "/",
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
];

// Install event to cache the required resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const responses = await Promise.all(
          OFFLINE_URLS.map((url) => fetch(url)),
        );
        const validResponses = responses.filter((response) => response.ok);

        // Cache only valid responses
        await cache.addAll(validResponses.map((response) => response.url));
        console.log("All valid files cached successfully");
      } catch (error) {
        console.error("Failed to cache some files:", error);
      }
    }),
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
      .catch(() => caches.match("/budget")),
  );
});
