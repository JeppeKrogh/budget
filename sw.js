const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URLS = [
    "/budget/", // Base path for GitHub Pages
    "/budget/favicon.ico",
    "/budget/index.html",
    "/budget/192x192.png",
    "/budget/512x512.png",
    "/budget/manifest.json",
    "/budget/assets/css/material-tailwind.css",
    "/budget/assets/js/budget.js",
    "/budget/assets/js/ripple.js",
    "/budget/assets/js/tw.js",
];

// Install event to cache the required resources
self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_URLS).catch((error) => {
                console.error("Failed to cache resources during install:", error);
                throw error; // Rethrow the error to stop the service worker from installing
            });
        })
    );
});

// Activate event to remove outdated caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker activating...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event to serve cached resources or fallback
self.addEventListener("fetch", (event) => {
    console.log("Fetch event for:", event.request.url);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log("Cache hit for:", event.request.url);
                return cachedResponse;
            }

            console.log("Cache miss; attempting fetch from network.");
            return fetch(event.request).catch(() => {
                console.warn("Fetch failed; returning offline fallback.");
                if (event.request.mode === "navigate") {
                    // If it's a navigation request, return the cached index.html for offline fallback
                    return caches.match("/budget/index.html");
                }
            });
        })
    );
});
