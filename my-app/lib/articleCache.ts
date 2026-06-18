// lib/articleCache.ts
import type { Article } from '@/app/types/article';

// We'll export functions to get and set the cache
let cachedArticles: Article[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCachedArticles(): Article[] | null {
  const now = Date.now();
  if (cachedArticles && (now - lastFetchTime) < CACHE_TTL) {
    return cachedArticles;
  }
  return null;
}

export function setCachedArticles(articles: Article[]): void {
  cachedArticles = articles;
  lastFetchTime = Date.now();
}