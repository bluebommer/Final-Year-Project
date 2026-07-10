'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ContinueReading = dynamic(() => import('../Components/HistoryComponents/ContinueReading'));
import styles from '../Components/HomeComponents/styles/Home.module.css';
import { getReadHistory, clearReadHistory, type HistoryEntry } from '@/lib/offlineDB';
import { formatRelativeTime } from '@/lib/relativeTime';
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));
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
      <div style={{ padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            All Read Articles
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => clearReadHistory()}
              style={{
                background: 'none',
                border: '1px solid rgba(var(--overlay-rgb), 0.15)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Clear history
            </button>
          )}
        </div>
        {loaded && history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Nothing read yet — articles you open will show up here.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
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
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
          <HistoryContent />
        </main>
      </div>
    </div>
  );
}
