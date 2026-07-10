// Components/HomeComponents/SmallCard.tsx
'use client';

import Link from 'next/link';
import { Article } from '@/app/types/article';
import styles from './styles/Smallcard.module.css';
import { useHoverPrefetch } from '@/lib/useHoverPrefetch';

interface Props {
  article: Article;
}

export default function SmallCard({ article }: Props) {
  const hasImage = article.imageUrl && article.imageUrl.length > 0;
  const href = `/article/${encodeURIComponent(article.id)}`;
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(href);

  return (
    <Link href={href} className={styles.cardLink} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <article className={styles.card}>
        <div className={styles.textContent}>
          <span className={styles.category}>{article.category}</span>
          <h3 className={styles.title}>{article.title}</h3>
          {article.description && (
            <p className={styles.description}>{article.description}</p>
          )}
          <div className={styles.footer}>
            <span
              className={styles.dot}
              style={{ backgroundColor: article.authorColor }}
            />
            <span className={styles.authorName}>{article.author}</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          {hasImage ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className={styles.thumbnail}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className={styles.placeholder}
              style={{ backgroundColor: `${article.authorColor}22` }}
            >
              <span>{article.authorInitial}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}