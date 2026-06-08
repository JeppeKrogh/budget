const CACHE_NAME = "offline-cache-v11";
const OFFLINE_URLS = [
    "/budget/",
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

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((names) =>
                Promise.all(
                    names.map(
                        (name) => name !== CACHE_NAME && caches.delete(name)
                    )
                )
            ),
            self.clients.claim(),
        ])
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.ok && response.type === "basic") {
                    const clone = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    if (event.request.mode === "navigate") {
                        return caches.match("/budget/index.html");
                    }
                })
            )
    );
});
