// lib/offlineDB.ts
//
// Vanilla IndexedDB wrapper for offline-saved articles, the user's chosen
// cache strategy, and a queue of service-worker "priming" commands that
// couldn't be delivered yet (no active SW controller). All mutations end by
// dispatching a `readlite:db-changed` window event — that's the entire
// cross-component reactivity mechanism, since components like LibraryPage,
// Cachestorage, and OfflineIndicator are mounted independently with no
// shared provider tree.
//
// NOTE: public/sw.js cannot import this module (it's an unbundled classic
// script), so it re-implements the minimal reads it needs (cacheStrategy,
// savedArticles lookup) directly against raw indexedDB. Keep DB_NAME /
// DB_VERSION / store names in sync with that file if they ever change.
import type { Article } from "@/app/types/article";

export const DB_NAME = "readlite-db";
export const DB_VERSION = 2;

const STORE_SAVED = "savedArticles";
const STORE_SETTINGS = "settings";
const STORE_SYNC_QUEUE = "syncQueue";
const STORE_HISTORY = "readHistory";

// Cache Storage bucket names used by public/sw.js — kept in sync manually
// (the SW is an unbundled classic script and can't import this constant).
// "Clear All Cache" deletes only the article-scoped buckets, leaving the
// static/app-shell cache (and the articles-list cache) untouched.
const SW_CACHE_VERSION = "v2";
export const CLEARABLE_CACHE_NAMES = [
  `readlite-api-article-${SW_CACHE_VERSION}`,
  `readlite-images-${SW_CACHE_VERSION}`,
  `readlite-nav-${SW_CACHE_VERSION}`,
];

export type CacheStrategy = "cache-first" | "network-first" | "stale-while-revalidate";

export interface SavedArticle extends Article {
  savedAt: string;
  approxBytes: number;
}

export type SyncActionType = "CACHE_IMAGE" | "CACHE_ARTICLE_RESPONSE" | "EVICT_ARTICLE";

export interface SyncAction {
  id: number;
  type: SyncActionType;
  payload: Record<string, string>;
  createdAt: string;
  attempts: number;
}

export interface StorageSummary {
  articleCount: number;
  approxBytes: number;
  quotaBytes: number | null;
  usageBytes: number | null;
}

function openDB(): Promise<IDBDatabase> {
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

async function runTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function notifyChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("readlite:db-changed"));
  }
}

function approxSize(article: Article): number {
  return new Blob([JSON.stringify(article)]).size;
}

// ---- Saved articles ----

export async function saveArticle(article: Article): Promise<void> {
  const record: SavedArticle = {
    ...article,
    savedAt: new Date().toISOString(),
    approxBytes: approxSize(article),
  };
  await runTx<IDBValidKey>(STORE_SAVED, "readwrite", (store) => store.put(record));
  notifyChanged();
}

// Saves the article AND primes the service worker to cache its page/API
// response for offline reading. Every "bookmark" entry point (card grids,
// the open article view) must go through this — saving to IndexedDB alone
// leaves the article's own page uncached, so it 404s once offline unless the
// user separately opened it while online.
export async function saveArticleForOffline(article: Article): Promise<void> {
  await saveArticle(article);
  if (article.imageUrl) {
    await postToServiceWorker("CACHE_IMAGE", { url: article.imageUrl });
  }
  await postToServiceWorker("CACHE_ARTICLE_RESPONSE", { id: article.id });
}

export async function removeArticle(id: string): Promise<void> {
  await runTx<undefined>(STORE_SAVED, "readwrite", (store) => store.delete(id));
  notifyChanged();
}

export async function getArticle(id: string): Promise<SavedArticle | undefined> {
  return runTx<SavedArticle | undefined>(STORE_SAVED, "readonly", (store) => store.get(id));
}

export async function listSavedArticles(): Promise<SavedArticle[]> {
  const all = await runTx<SavedArticle[]>(STORE_SAVED, "readonly", (store) => store.getAll());
  return all.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export async function isArticleSaved(id: string): Promise<boolean> {
  const record = await getArticle(id);
  return !!record;
}

export async function clearAllArticles(): Promise<void> {
  await runTx<undefined>(STORE_SAVED, "readwrite", (store) => store.clear());
  notifyChanged();
}

export async function getStorageSummary(): Promise<StorageSummary> {
  const articles = await listSavedArticles();
  const approxBytes = articles.reduce((sum, a) => sum + a.approxBytes, 0);

  let quotaBytes: number | null = null;
  let usageBytes: number | null = null;
  if (typeof navigator !== "undefined" && "storage" in navigator && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      quotaBytes = estimate.quota ?? null;
      usageBytes = estimate.usage ?? null;
    } catch {
      // navigator.storage.estimate() unsupported/unavailable in this context — skip
    }
  }

  return { articleCount: articles.length, approxBytes, quotaBytes, usageBytes };
}

// ---- Reading history ----

export interface HistoryEntry extends Article {
  readAt: string;
}

const MAX_HISTORY_ENTRIES = 200;

export async function markArticleRead(article: Article): Promise<void> {
  const entry: HistoryEntry = { ...article, readAt: new Date().toISOString() };
  await runTx<IDBValidKey>(STORE_HISTORY, "readwrite", (store) => store.put(entry));

  // Cap history size — trim oldest entries beyond the limit.
  const all = await runTx<HistoryEntry[]>(STORE_HISTORY, "readonly", (store) => store.getAll());
  if (all.length > MAX_HISTORY_ENTRIES) {
    const toRemove = all
      .sort((a, b) => new Date(a.readAt).getTime() - new Date(b.readAt).getTime())
      .slice(0, all.length - MAX_HISTORY_ENTRIES);
    for (const stale of toRemove) {
      await runTx<undefined>(STORE_HISTORY, "readwrite", (store) => store.delete(stale.id));
    }
  }
  notifyChanged();
}

export async function getReadHistory(): Promise<HistoryEntry[]> {
  const all = await runTx<HistoryEntry[]>(STORE_HISTORY, "readonly", (store) => store.getAll());
  return all.sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
}

export async function getRecentReads(limit = 5): Promise<HistoryEntry[]> {
  const all = await getReadHistory();
  return all.slice(0, limit);
}

export async function isArticleRead(id: string): Promise<boolean> {
  const record = await runTx<HistoryEntry | undefined>(STORE_HISTORY, "readonly", (store) => store.get(id));
  return !!record;
}

export async function clearReadHistory(): Promise<void> {
  await runTx<undefined>(STORE_HISTORY, "readwrite", (store) => store.clear());
  notifyChanged();
}

// Consecutive calendar days (local time) with at least one read, counting
// backward from today. If nothing's been read yet today, still counts from
// yesterday — a still-current streak shouldn't read as broken until the day
// actually lapses.
export async function getReadingStreakDays(): Promise<number> {
  const history = await getReadHistory();
  if (history.length === 0) return 0;

  const readDates = new Set(history.map((h) => new Date(h.readAt).toDateString()));
  const cursor = new Date();
  if (!readDates.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (readDates.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ---- Settings (cache strategy) ----

export async function getCacheStrategy(): Promise<CacheStrategy> {
  const record = await runTx<{ key: string; value: CacheStrategy } | undefined>(
    STORE_SETTINGS,
    "readonly",
    (store) => store.get("cacheStrategy")
  );
  return record?.value ?? "stale-while-revalidate";
}

export async function setCacheStrategy(value: CacheStrategy): Promise<void> {
  await runTx<IDBValidKey>(STORE_SETTINGS, "readwrite", (store) =>
    store.put({ key: "cacheStrategy", value })
  );
  notifyChanged();
}

// ---- Sync queue (SW "priming" commands awaiting delivery) ----

export async function enqueueSyncAction(
  type: SyncActionType,
  payload: Record<string, string>
): Promise<void> {
  const action = {
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  await runTx<IDBValidKey>(STORE_SYNC_QUEUE, "readwrite", (store) => store.add(action));
  notifyChanged();
}

export async function listPendingSyncActions(): Promise<SyncAction[]> {
  return runTx<SyncAction[]>(STORE_SYNC_QUEUE, "readonly", (store) => store.getAll());
}

export async function removeSyncAction(id: number): Promise<void> {
  await runTx<undefined>(STORE_SYNC_QUEUE, "readwrite", (store) => store.delete(id));
  notifyChanged();
}

export async function getPendingSyncCount(): Promise<number> {
  return runTx<number>(STORE_SYNC_QUEUE, "readonly", (store) => store.count());
}

// ---- SW messenger (page -> SW, with queue fallback) ----
//
// Service worker "priming" commands (cache this image / cache this article's
// full response / evict this article) are fire-and-forget postMessages. If
// there's no active controller yet (e.g. right after first install, or a
// hard refresh mid-offline), the command is queued and replayed once a
// controller becomes available — see replayPendingSyncActions.

function getSWController(): ServiceWorker | null {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.controller;
}

export async function postToServiceWorker(
  type: SyncActionType,
  payload: Record<string, string>
): Promise<void> {
  const controller = getSWController();
  if (controller) {
    controller.postMessage({ type, ...payload });
  } else {
    await enqueueSyncAction(type, payload);
  }
}

export async function replayPendingSyncActions(): Promise<void> {
  const controller = getSWController();
  if (!controller) return;
  const pending = await listPendingSyncActions();
  for (const action of pending) {
    controller.postMessage({ type: action.type, ...action.payload });
    await removeSyncAction(action.id);
  }
}
