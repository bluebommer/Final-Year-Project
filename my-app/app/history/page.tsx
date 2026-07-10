'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ContinueReading = dynamic(() => import('../Components/HistoryComponents/ContinueReading'));
import styles from '../Components/HomeComponents/styles/Home.module.css';
import contentStyles from '../Components/HistoryComponents/styles/HistoryContent.module.css';
import { getReadHistory, clearReadHistory, type HistoryEntry } from '@/lib/offlineDB';
import { formatRelativeTime } from '@/lib/relativeTime';
import AppShell from '../Components/HomeComponents/AppShell';
const ReadArticleCard = dynamic(() => import('../Components/HistoryComponents/ReadArticleCard'));

function HistoryContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function load() {
      getReadHistory().then((entries) => {
        setHistory(entries);
        setLoaded(true);
      });
    }
    load();
    window.addEventListener('readlite:db-changed', load);
    return () => window.removeEventListener('readlite:db-changed', load);
  }, []);

  return (
    <>
      <ContinueReading />
      <div className={contentStyles.wrapper}>
        <div className={contentStyles.headerRow}>
          <h2 className={contentStyles.headerTitle}>All Read Articles</h2>
          {history.length > 0 && (
            <button className={contentStyles.clearBtn} onClick={() => clearReadHistory()}>
              Clear history
            </button>
          )}
        </div>
        {loaded && history.length === 0 ? (
          <p className={contentStyles.emptyText}>
            Nothing read yet — articles you open will show up here.
          </p>
        ) : (
          <div className={contentStyles.grid}>
            {history.map((article) => (
              <ReadArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                category={article.category}
                readTime={article.readTime}
                author={article.author}
                authorInitial={article.authorInitial}
                authorColor={article.authorColor}
                readAgo={formatRelativeTime(article.readAt)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function HistoryPage() {
  return (
    <AppShell>
      <main className={styles.mainContent}>
        <HistoryContent />
      </main>
    </AppShell>
  );
}
