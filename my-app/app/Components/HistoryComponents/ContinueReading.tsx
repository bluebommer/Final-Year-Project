// Components/HistoryComponents/ContinueReading.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentReads, type HistoryEntry } from '@/lib/offlineDB';
import styles from './styles/ContinueReading.module.css';

export default function ContinueReading() {
  const [recent, setRecent] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    function load() {
      getRecentReads(5).then(setRecent);
    }
    load();
    window.addEventListener('readlite:db-changed', load);
    return () => window.removeEventListener('readlite:db-changed', load);
  }, []);

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>HISTORY</span>
        <h2 className={styles.title}>Continue Reading</h2>
      </div>
      <div className={styles.track}>
        {recent.map((article) => (
          <div key={article.id} className={styles.card}>
            <span className={styles.category}>{article.category}</span>
            <h3 className={styles.cardTitle}>{article.title}</h3>
            <div className={styles.meta}>
              <div className={styles.authorAvatar} style={{ background: article.authorColor }}>
                {article.authorInitial}
              </div>
              <span className={styles.authorName}>{article.author}</span>
              <span className={styles.readTime}>{article.readTime}</span>
            </div>
            <Link href={`/article/${encodeURIComponent(article.id)}`} className={styles.resumeBtn}>
              Continue →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
