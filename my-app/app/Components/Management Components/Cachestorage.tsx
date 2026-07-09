// Components/ManagementComponents/Cachestorage.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './styles/Cachestorage.module.css';
import {
  listSavedArticles,
  removeArticle as removeArticleFromDB,
  clearAllArticles,
  getStorageSummary,
  getCacheStrategy,
  setCacheStrategy as persistCacheStrategy,
  postToServiceWorker,
  CLEARABLE_CACHE_NAMES,
  type SavedArticle,
  type CacheStrategy,
  type StorageSummary,
} from '@/lib/offlineDB';

interface ArticleCache {
  id: string;
  title: string;
  size: string;
  savedAt: string;
  category: string;
}

const STRATEGY_LABELS: Record<CacheStrategy, { label: string; description: string }> = {
  'cache-first': { label: 'Cache First', description: 'Fastest offline, serves cached then updates' },
  'network-first': { label: 'Network First', description: 'Always fresh, falls back to cache' },
  'stale-while-revalidate': { label: 'Stale While Revalidate', description: 'Serves cached, updates in background' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function toArticleCache(saved: SavedArticle): ArticleCache {
  return {
    id: saved.id,
    title: saved.title,
    size: formatBytes(saved.approxBytes),
    savedAt: formatRelative(saved.savedAt),
    category: saved.category,
  };
}

async function clearBrowserCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;
  await Promise.all(CLEARABLE_CACHE_NAMES.map((name) => caches.delete(name)));
}

export default function CacheStorage() {
  const [articles, setArticles] = useState<ArticleCache[]>([]);
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [strategy, setStrategy] = useState<CacheStrategy>('stale-while-revalidate');

  const reload = useCallback(() => {
    listSavedArticles().then((saved) => setArticles(saved.map(toArticleCache)));
    getStorageSummary().then(setSummary);
  }, []);

  useEffect(() => {
    reload();
    getCacheStrategy().then(setStrategy);
    window.addEventListener('readlite:db-changed', reload);
    return () => window.removeEventListener('readlite:db-changed', reload);
  }, [reload]);

  async function handleClearAll() {
    setClearing(true);
    try {
      await clearAllArticles();
      await clearBrowserCaches();
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
    } finally {
      setClearing(false);
    }
  }

  async function handleRemoveArticle(id: string) {
    await removeArticleFromDB(id);
    await postToServiceWorker('EVICT_ARTICLE', { id });
  }

  async function handleStrategyChange(key: CacheStrategy) {
    setStrategy(key);
    await persistCacheStrategy(key);
  }

  const usedBytes = summary?.usageBytes ?? summary?.approxBytes ?? 0;
  const totalBytes = summary?.quotaBytes ?? null;
  const usedPercent = totalBytes ? Math.min(100, (usedBytes / totalBytes) * 100) : 0;
  const displayUsed = formatBytes(usedBytes);
  const displayTotal = totalBytes ? formatBytes(totalBytes) : null;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconWrap}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <div>
          <h3 className={styles.cardTitle}>Cache & Storage</h3>
          <span className={styles.cardSub}>OFFLINE STORAGE MANAGEMENT</span>
        </div>
      </div>

      {/* Cache Strategy Selector */}
      <div className={styles.strategySection}>
        <div className={styles.strategyHeader}>
          <span className={styles.strategyLabel}>Cache Strategy</span>
          <span className={styles.strategyHint}>How content is retrieved</span>
        </div>
        <div className={styles.strategyOptions}>
          {(Object.entries(STRATEGY_LABELS) as [CacheStrategy, { label: string; description: string }][]).map(([key, value]) => (
            <button
              key={key}
              className={`${styles.strategyBtn} ${strategy === key ? styles.strategyBtnActive : ''}`}
              onClick={() => handleStrategyChange(key)}
              aria-pressed={strategy === key}
            >
              <span className={styles.strategyBtnLabel}>{value.label}</span>
              <span className={styles.strategyBtnDesc}>{value.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Storage bar */}
      <div className={styles.storageBlock}>
        <div className={styles.storageLabels}>
          <span className={styles.storageUsed}>{displayUsed} used</span>
          <span className={styles.storageTotal}>{displayTotal ? `of ${displayTotal}` : 'quota unavailable'}</span>
        </div>
        <div className={styles.storageBar}>
          <div
            className={`${styles.storageFill} ${usedPercent > 80 ? styles.storageFillWarn : ''}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <div className={styles.storageFooter}>
          <span className={styles.storageArticleCount}>
            {articles.length} article{articles.length !== 1 ? 's' : ''} cached offline
          </span>
          {displayTotal && (
            <span className={styles.storageFree}>{formatBytes(Math.max(0, (totalBytes ?? 0) - usedBytes))} free</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.clearBtn} ${clearing ? styles.clearBtnLoading : ''} ${cleared ? styles.clearBtnDone : ''}`}
          onClick={handleClearAll}
          disabled={clearing || articles.length === 0}
        >
          {clearing ? (
            <><span className={styles.spinner} /> Clearing...</>
          ) : cleared ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Cache Cleared</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> Clear All Cache</>
          )}
        </button>
        <button className={styles.manageBtn} onClick={() => setExpanded((p) => !p)}>
          {expanded ? 'Hide' : 'Manage'} per-article storage
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Per-article list */}
      {expanded && (
        <div className={styles.articleList}>
          {articles.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#475569' }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>No articles cached</span>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className={styles.articleRow}>
                <div className={styles.articleInfo}>
                  <span className={styles.articleCategory}>{article.category}</span>
                  <span className={styles.articleTitle}>{article.title}</span>
                  <span className={styles.articleMeta}>{article.size} · saved {article.savedAt}</span>
                </div>
                <button className={styles.articleRemove} onClick={() => handleRemoveArticle(article.id)} aria-label="Remove from offline storage">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}