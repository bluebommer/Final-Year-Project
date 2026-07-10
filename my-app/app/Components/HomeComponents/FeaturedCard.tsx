// Components/HomeComponents/FeaturedCard.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Article } from '@/app/types/article';
import styles from './styles/FeaturedCard.module.css';
import { useHoverPrefetch } from '@/lib/useHoverPrefetch';
import { saveArticle, removeArticle, isArticleSaved } from '@/lib/offlineDB';

interface Props {
  article: Article;
}

export default function FeaturedCard({ article }: Props) {
  // If imageUrl exists, use it; otherwise fallback to blob visual
  const hasImage = article.imageUrl && article.imageUrl.length > 0;
  const href = `/article/${encodeURIComponent(article.id)}`;
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(href);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    isArticleSaved(article.id).then(setSaved);
  }, [article.id]);

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      await removeArticle(article.id);
      setSaved(false);
    } else {
      await saveArticle(article);
      setSaved(true);
    }
  }

  return (
   // wherever you render article cards
<Link href={href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <article className={styles.featuredCard}>
        <div className={styles.cardImage}>
          {hasImage ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className={styles.featuredImage}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <div className={styles.blobVisual} />
              <div className={styles.blobGlow} />
            </>
          )}
        </div>
        <div className={styles.cardContent}>
          {article.isNewRelease && (
            <span className={styles.newRelease}>NEW RELEASE</span>
          )}
          <h2 className={styles.cardTitle}>{article.title}</h2>
          <div className={styles.cardMeta}>
            <span className={styles.readTime}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {article.readTime}
            </span>
            {article.isStaffPick && (
              <span className={styles.staffPick}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                STAFF PICK
              </span>
            )}
            <button className={styles.bookmarkBtn} onClick={toggleSave} aria-label={saved ? 'Remove bookmark' : 'Bookmark'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}