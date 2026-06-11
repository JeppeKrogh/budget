const CACHE_NAME = "offline-cache-v65";
const OFFLINE_URLS = [
    "/ProRata-Fordeleren/",
    "/ProRata-Fordeleren/favicon.png",
    "/ProRata-Fordeleren/happyman.svg",
    "/ProRata-Fordeleren/index.html",
    "/ProRata-Fordeleren/icon-192x192.png",
    "/ProRata-Fordeleren/icon-512x512.png",
    "/ProRata-Fordeleren/manifest.json",
    "/ProRata-Fordeleren/assets/css/material-tailwind.css",
    "/ProRata-Fordeleren/assets/js/budget.js",
    "/ProRata-Fordeleren/assets/js/ripple.js",
    "/ProRata-Fordeleren/assets/js/tw.js",
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
                        return caches.match("/ProRata-Fordeleren/index.html");
                    }
                })
            )
    );
});
