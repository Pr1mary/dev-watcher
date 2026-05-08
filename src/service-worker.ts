/// <reference lib="webworker" />

const CACHE_NAME = "v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/",
        "/manifest.json"
      ]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});