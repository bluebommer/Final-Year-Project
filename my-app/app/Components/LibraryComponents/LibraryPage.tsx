// Components/LibraryComponents/LibraryPage.tsx
'use client';

import { useState } from 'react';
import Navbar from '../../Components/HomeComponents/Navbar';
import Sidebar from '../../Components/HomeComponents/SideBar';
import styles from './styles/Library.module.css';

// Demo saved articles data
const DEMO_SAVED_ARTICLES = [
  {
    id: '1',
    title: 'The Silicon Mind: Ethics of Synthetic Cognition',
    author: 'Dr. Mira Chen',
    authorInitial: 'M',
    authorColor: '#22d3ee',
    category: 'TECHNOLOGY',
    readTime: '8 min read',
    savedAt: '2026-06-10',
    offlineAvailable: true,
  },
  {
    id: '2',
    title: 'Quantum Entanglement Breaks Distance Record',
    author: 'Elena Voss',
    authorInitial: 'E',
    authorColor: '#a78bfa',
    category: 'SCIENCE',
    readTime: '5 min read',
    savedAt: '2026-06-09',
    offlineAvailable: true,
  },
  {
    id: '3',
    title: 'The Language of Invisible Interfaces',
    author: 'Kai Tanaka',
    authorInitial: 'K',
    authorColor: '#f97316',
    category: 'DESIGN',
    readTime: '6 min read',
    savedAt: '2026-06-08',
    offlineAvailable: false, // not cached offline
  },
  {
    id: '4',
    title: 'Mars One: The Realities of Interplanetary Colonization',
    author: 'Omar Al-Rashid',
    authorInitial: 'O',
    authorColor: '#fb7185',
    category: 'FUTURE',
    readTime: '22 min read',
    savedAt: '2026-06-07',
    offlineAvailable: true,
  },
  {
    id: '5',
    title: 'The Subtle Art of Perceptual Fluidity',
    author: 'Saoirse Brennan',
    authorInitial: 'S',
    authorColor: '#fbbf24',
    category: 'PSYCHOLOGY',
    readTime: '15 min read',
    savedAt: '2026-06-06',
    offlineAvailable: false,
  },
  {
    id: '6',
    title: 'Deep Work in the Age of Constant Interruption',
    author: 'James Okafor',
    authorInitial: 'J',
    authorColor: '#34d399',
    category: 'PRODUCTIVITY',
    readTime: '5 min read',
    savedAt: '2026-06-05',
    offlineAvailable: true,
  },
];

export default function LibraryPage() {
  const [savedArticles, setSavedArticles] = useState(DEMO_SAVED_ARTICLES);

  const removeArticle = (id: string) => {
    setSavedArticles(prev => prev.filter(article => article.id !== id));
  };

  const totalSaved = savedArticles.length;
  const offlineCount = savedArticles.filter(a => a.offlineAvailable).length;

  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
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
            <button className={styles.clearAllBtn} onClick={() => setSavedArticles([])}>
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
                <article key={article.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.category}>{article.category}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeArticle(article.id)}
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
                    {article.offlineAvailable ? (
                      <span className={styles.offlineBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
                          <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
                          <path d="M12 2v4" />
                          <path d="M2 2l20 20" />
                        </svg>
                        Offline available
                      </span>
                    ) : (
                      <span className={styles.onlineOnlyBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Online only
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}