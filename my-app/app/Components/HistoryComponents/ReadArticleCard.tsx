// Components/HistoryComponents/ReadArticleCard.tsx
'use client';

import Link from 'next/link';
import styles from './styles/ReadArticleCard.module.css';

interface ReadArticleCardProps {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  readAgo: string;
}

export default function ReadArticleCard({
  id,
  title,
  category,
  readTime,
  author,
  authorInitial,
  authorColor,
  readAgo,
}: ReadArticleCardProps) {
  return (
    <Link href={`/article/${encodeURIComponent(id)}`} className={`${styles.card} ${styles.cardRead}`}>
      <span className={styles.category}>{category}</span>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.meta}>
        <div className={styles.authorAvatar} style={{ background: authorColor }}>
          {authorInitial}
        </div>
        <span className={styles.authorName}>{author}</span>
        <span className={styles.readTime}>{readTime}</span>
      </div>
      <div className={styles.readBadge}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Read {readAgo}
      </div>
    </Link>
  );
}
