// Components/LibraryComponents/LibraryPage.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '../../Components/HomeComponents/AppShell';
import styles from './styles/Library.module.css';
import { listSavedArticles, removeArticle as removeArticleFromDB, clearAllArticles, postToServiceWorker, type SavedArticle } from '@/lib/offlineDB';

export default function LibraryPage() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  const reload = useCallback(() => {
    listSavedArticles().then(setSavedArticles);
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener('readlite:db-changed', reload);
    return () => window.removeEventListener('readlite:db-changed', reload);
  }, [reload]);

  const removeArticle = async (id: string) => {
    await removeArticleFromDB(id);
    await postToServiceWorker('EVICT_ARTICLE', { id });
  };

  const clearAll = async () => {
    await clearAllArticles();
  };

  const totalSaved = savedArticles.length;
  const offlineCount = totalSaved; // every saved record embeds full content — always offline-readable

  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.eyebrow}>YOUR SPACE</span>
              <h1 className={styles.title}>Library</h1>
              <p className={styles.subtitle}>
                {totalSaved} saved {totalSaved === 1 ? 'article' : 'articles'} ·{' '}
                {offlineCount} available offline
              </p>
            </div>
            <button className={styles.clearAllBtn} onClick={clearAll}>
              Clear all
            </button>
          </div>

          {/* Saved articles grid */}
          {totalSaved === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📚</div>
              <p className={styles.emptyTitle}>Your library is empty</p>
              <p className={styles.emptyDesc}>
                Save articles while reading — they'll appear here and be available offline.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {savedArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/article/${encodeURIComponent(article.id)}`}
                  className={styles.cardLink}
                >
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.category}>{article.category}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeArticle(article.id);
                        }}
                        aria-label="Remove from library"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className={styles.cardTitle}>{article.title}</h3>
                    <div className={styles.cardMeta}>
                      <div
                        className={styles.authorAvatar}
                        style={{ background: article.authorColor }}
                      >
                        {article.authorInitial}
                      </div>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{article.author}</span>
                        <span className={styles.savedDate}>
                          Saved on {new Date(article.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.readTime}>{article.readTime}</span>
                      <span className={styles.offlineBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
                          <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
                          <path d="M12 2v4" />
                          <path d="M2 2l20 20" />
                        </svg>
                        Offline available
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </main>
    </AppShell>
  );
}
