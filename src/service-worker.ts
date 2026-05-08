// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from "$service-worker";

const worker = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `flametower-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

worker.addEventListener("install", event => {
  
  async function addFilesToCaches() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS)
  }
  
  event.waitUntil(addFilesToCaches());
});

worker.addEventListener("activate", event => {
  // Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE_NAME) await caches.delete(key);
		}

    worker.clients.claim();
	}

  event.waitUntil(deleteOldCaches());
});

worker.addEventListener("fetch", event => {

  // only accept get request for fetch
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE_NAME);

    // serve data from caches if the url are on the build/files list
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);

      if (response) return response;
    }

    // try to fetch data from network
    // if failed, fall back to use the caches
    try{
      const response = await fetch(event.request);

      // handle if response result is not type of a response like when going offline
      if (!(response instanceof Response)) {
        throw new Error("invalid response from fetch");
      }

      if (response.status === 200 && !response.headers.get("cache-control")?.includes("no-store")) {
        cache.put(event.request, response.clone());
      }

      return response;
    }catch(err){
      const response = await caches.match(event.request);

      if (response) return response;
      
      // throw error if no cache
      throw err;
    }

  }

  event.respondWith(respond());
});
