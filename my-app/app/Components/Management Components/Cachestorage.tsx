// Components/ManagementComponents/Cachestorage.tsx
'use client';

import { useState } from 'react';
import styles from './styles/Cachestorage.module.css';

interface ArticleCache {
  id: string;
  title: string;
  size: string;
  savedAt: string;
  category: string;
}

type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

const MOCK_ARTICLES: ArticleCache[] = [
  { id: '1', title: 'The Silicon Mind: Ethics of Synthetic Cognition', size: '4.2 MB', savedAt: '2 days ago', category: 'TECHNOLOGY' },
  { id: '2', title: 'The Quiet Revolution of Bio-Regenerative Design', size: '3.8 MB', savedAt: '4 days ago', category: 'NATURE' },
  { id: '3', title: 'Mars One: The Realities of Interplanetary Colonization', size: '6.1 MB', savedAt: '1 week ago', category: 'FUTURE' },
  { id: '4', title: 'The Subtle Art of Perceptual Fluidity', size: '2.9 MB', savedAt: '1 week ago', category: 'PSYCHOLOGY' },
  { id: '5', title: 'Deep Work in the Age of Constant Interruption', size: '7.0 MB', savedAt: '2 weeks ago', category: 'PRODUCTIVITY' },
];

const TOTAL_MB = 100;
const USED_MB = 24;

const STRATEGY_LABELS: Record<CacheStrategy, { label: string; description: string }> = {
  'cache-first': { label: 'Cache First', description: 'Fastest offline, serves cached then updates' },
  'network-first': { label: 'Network First', description: 'Always fresh, falls back to cache' },
  'stale-while-revalidate': { label: 'Stale While Revalidate', description: 'Serves cached, updates in background' },
};

export default function CacheStorage() {
  const [articles, setArticles] = useState<ArticleCache[]>(MOCK_ARTICLES);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [strategy, setStrategy] = useState<CacheStrategy>('stale-while-revalidate');

  function handleClearAll() {
    setClearing(true);
    setTimeout(() => {
      setArticles([]);
      setClearing(false);
      setCleared(true);
    }, 1200);
  }

  function handleRemoveArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  const usedPercent = cleared ? 0 : (USED_MB / TOTAL_MB) * 100;
  const displayUsed = cleared ? '0 MB' : `${USED_MB} MB`;

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
              onClick={() => setStrategy(key)}
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
          <span className={styles.storageTotal}>of {TOTAL_MB} MB</span>
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
          <span className={styles.storageFree}>{TOTAL_MB - (cleared ? 0 : USED_MB)} MB free</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.clearBtn} ${clearing ? styles.clearBtnLoading : ''} ${cleared ? styles.clearBtnDone : ''}`}
          onClick={handleClearAll}
          disabled={clearing || cleared || articles.length === 0}
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