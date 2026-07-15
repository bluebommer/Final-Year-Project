// public/sw.js
//
// Hand-rolled service worker for ReadLite's offline reading support.
// This is an unbundled classic script served as-is from /public, so it
// cannot `import` from lib/ — the IndexedDB helpers below are a deliberate,
// minimal duplication of lib/offlineDB.ts. Keep DB_NAME / DB_VERSION /
// store names in sync with that file if they ever change.
//
// Registered only in production (see ServiceWorkerRegistrar.tsx) — next dev's
// HMR interaction with service workers is unreliable, so `next build && next
// start` is the only environment this should be tested against.

const CACHE_VERSION = "v2";
const STATIC_CACHE = `readlite-static-${CACHE_VERSION}`;
const API_LIST_CACHE = `readlite-api-list-${CACHE_VERSION}`;
const API_ARTICLE_CACHE = `readlite-api-article-${CACHE_VERSION}`;
const IMAGE_CACHE = `readlite-images-${CACHE_VERSION}`;
const NAV_CACHE = `readlite-nav-${CACHE_VERSION}`;
const CURRENT_CACHES = [STATIC_CACHE, API_LIST_CACHE, API_ARTICLE_CACHE, IMAGE_CACHE, NAV_CACHE];

// ---- IndexedDB (duplicated read-only subset of lib/offlineDB.ts) ----

const DB_NAME = "readlite-db";
const DB_VERSION = 2;
const STORE_SAVED = "savedArticles";
const STORE_SETTINGS = "settings";
const STORE_SYNC_QUEUE = "syncQueue";
const STORE_HISTORY = "readHistory";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SAVED)) {
        db.createObjectStore(STORE_SAVED, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCacheStrategyFromDB() {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readonly");
      const req = tx.objectStore(STORE_SETTINGS).get("cacheStrategy");
      req.onsuccess = () => resolve((req.result && req.result.value) || "stale-while-revalidate");
      req.onerror = () => resolve("stale-while-revalidate");
    });
  } catch {
    return "stale-while-revalidate";
  }
}

// ---- Lifecycle ----

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([
        "/offline.html",
        "/manifest.webmanifest",
        "/icons/icon-192.svg",
        "/icons/icon-512.svg",
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !CURRENT_CACHES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// ---- Fetch strategies ----

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  const network = cached ? undefined : await networkPromise;
  if (!cached) networkPromise.catch(() => {}); // avoid unhandled rejection when cached already resolved
  return (
    cached ||
    network ||
    new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  );
}

async function staleWhileRevalidateOpaque(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const imgReq = new Request(request.url, { mode: "no-cors" });
  const networkPromise = fetch(imgReq)
    .then((response) => {
      cache.put(imgReq, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    networkPromise.catch(() => {});
    return cached;
  }
  const network = await networkPromise;
  return network || Response.error();
}

async function handleArticlesList(request) {
  const strategy = await getCacheStrategyFromDB();

  if (strategy === "cache-first") {
    return cacheFirst(request, API_LIST_CACHE);
  }

  if (strategy === "network-first") {
    const cache = await caches.open(API_LIST_CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      return (
        cached ||
        new Response(JSON.stringify({ articles: [] }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  }

  // default: stale-while-revalidate
  return staleWhileRevalidate(request, API_LIST_CACHE);
}

async function handleNavigate(request) {
  const navCache = await caches.open(NAV_CACHE);
  try {
    const response = await fetch(request);
    // Cache every successful navigation document (not just article pages) so
    // any page the user has actually visited — /home included — has a
    // last-known-good version to fall back to when offline, instead of
    // dropping straight to the generic offline.html shell.
    if (response && response.ok) {
      navCache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await navCache.match(request);
    if (cached) return cached;
    const staticCache = await caches.open(STATIC_CACHE);
    const offlinePage = await staticCache.match("/offline.html");
    return offlinePage || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // never intercept mutating requests (auth/save POSTs)

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || request.destination === "font") {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }

    if (url.pathname === "/api/articles") {
      event.respondWith(handleArticlesList(request));
      return;
    }

    if (url.pathname.startsWith("/api/article/")) {
      event.respondWith(staleWhileRevalidate(request, API_ARTICLE_CACHE));
      return;
    }
  } else if (request.destination === "image") {
    event.respondWith(staleWhileRevalidateOpaque(request, IMAGE_CACHE));
    return;
  }

  // everything else: let the browser handle it natively (no interception)
});

// ---- Message contract (page -> SW) ----

async function cacheImage(url) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const req = new Request(url, { mode: "no-cors" });
    const response = await fetch(req);
    await cache.put(req, response);
  } catch {
    // best-effort — image caching failures are non-fatal to the save flow
  }
}

async function cacheArticleResponse(id) {
  const encodedId = encodeURIComponent(id);
  try {
    const navCache = await caches.open(NAV_CACHE);
    const navReq = new Request(`/article/${encodedId}`);
    const navResponse = await fetch(navReq);
    if (navResponse && navResponse.ok) await navCache.put(navReq, navResponse.clone());
  } catch {
    // ignore — retried via the page's sync queue
  }
  try {
    const apiCache = await caches.open(API_ARTICLE_CACHE);
    const apiReq = new Request(`/api/article/${encodedId}`);
    const apiResponse = await fetch(apiReq);
    if (apiResponse && apiResponse.ok) await apiCache.put(apiReq, apiResponse.clone());
  } catch {
    // ignore — retried via the page's sync queue
  }
}

async function evictArticle(id) {
  const encodedId = encodeURIComponent(id);
  const navCache = await caches.open(NAV_CACHE);
  await navCache.delete(new Request(`/article/${encodedId}`));
  const apiCache = await caches.open(API_ARTICLE_CACHE);
  await apiCache.delete(new Request(`/api/article/${encodedId}`));
}

self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  if (msg.type === "CACHE_IMAGE" && msg.url) {
    event.waitUntil(cacheImage(msg.url));
  } else if (msg.type === "CACHE_ARTICLE_RESPONSE" && msg.id) {
    event.waitUntil(cacheArticleResponse(msg.id));
  } else if (msg.type === "EVICT_ARTICLE" && msg.id) {
    event.waitUntil(evictArticle(msg.id));
  }
});
