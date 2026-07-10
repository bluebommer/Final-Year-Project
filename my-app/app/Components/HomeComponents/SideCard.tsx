// Components/HomeComponents/SideCard.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Article } from '@/app/types/article';
import styles from './styles/SideCard.module.css';
import { useHoverPrefetch } from '@/lib/useHoverPrefetch';
import { saveArticle, removeArticle, isArticleSaved } from '@/lib/offlineDB';

interface Props {
  article: Article;
}

export default function SideCard({ article }: Props) {
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
<Link href={href} className={styles.sideCardLink} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>

      <article className={styles.sideCard}>
        <div className={styles.cardImage}>
          {hasImage ? (
            <img src={article.imageUrl} alt={article.title} className={styles.sideImage} loading="lazy" decoding="async" />
          ) : (
            <div className={styles.landscapeVisual} />
          )}
        </div>
        <div className={styles.cardContent}>
          <span className={styles.category}>{article.category}</span>
          <h3 className={styles.cardTitle}>{article.title}</h3>
          {article.description && (
            <p className={styles.description}>{article.description}</p>
          )}
          <div className={styles.cardFooter}>
            <span className={styles.author}>BY {article.author.toUpperCase()}</span>
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