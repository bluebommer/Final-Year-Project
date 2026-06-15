// Components/HistoryComponents/ContinueReading.tsx
'use client';

import { useReadingHistory } from './ReadingHistoryProvider';
import styles from './styles/ContinueReading.module.css';

// Demo article data for continuation (normally you'd fetch from your real articles)
const DEMO_ARTICLES: Record<string, { title: string; category: string; readTime: string; author: string; authorInitial: string; authorColor: string }> = {
  '1': { title: 'The Silicon Mind: Ethics of Synthetic Cognition', category: 'TECHNOLOGY', readTime: '8 min read', author: 'Dr. Mira Chen', authorInitial: 'M', authorColor: '#22d3ee' },
  '2': { title: 'Quantum Entanglement Breaks Distance Record', category: 'SCIENCE', readTime: '5 min read', author: 'Elena Voss', authorInitial: 'E', authorColor: '#a78bfa' },
  '3': { title: 'The Language of Invisible Interfaces', category: 'DESIGN', readTime: '6 min read', author: 'Kai Tanaka', authorInitial: 'K', authorColor: '#f97316' },
  '4': { title: 'Mars One: The Realities of Interplanetary Colonization', category: 'FUTURE', readTime: '22 min read', author: 'Omar Al-Rashid', authorInitial: 'O', authorColor: '#fb7185' },
  '5': { title: 'The Subtle Art of Perceptual Fluidity', category: 'PSYCHOLOGY', readTime: '15 min read', author: 'Saoirse Brennan', authorInitial: 'S', authorColor: '#fbbf24' },
};

export default function ContinueReading() {
  const { getRecentReads } = useReadingHistory();
  const recentIds = getRecentReads(5);

  if (recentIds.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>HISTORY</span>
        <h2 className={styles.title}>Continue Reading</h2>
      </div>
      <div className={styles.track}>
        {recentIds.map((id) => {
          const article = DEMO_ARTICLES[id];
          if (!article) return null;
          return (
            <div key={id} className={styles.card}>
              <span className={styles.category}>{article.category}</span>
              <h3 className={styles.cardTitle}>{article.title}</h3>
              <div className={styles.meta}>
                <div className={styles.authorAvatar} style={{ background: article.authorColor }}>
                  {article.authorInitial}
                </div>
                <span className={styles.authorName}>{article.author}</span>
                <span className={styles.readTime}>{article.readTime}</span>
              </div>
              <button className={styles.resumeBtn}>Continue →</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}