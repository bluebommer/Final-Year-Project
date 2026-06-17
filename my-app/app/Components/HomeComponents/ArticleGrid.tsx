// Components/HomeComponents/ArticleGrid.tsx
'use client';

import Link from 'next/link';
import styles from './styles/ArticleGrid.module.css';
import FeaturedCard from './FeaturedCard';
import SideCard from './SideCard';
import SmallCard from './SmallCard';
import type { Article } from '@/app/types/article';

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No articles found.</p>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const sideArticle = articles[1] || null;
  const remainingArticles = articles.slice(2);

  return (
    <div className={styles.grid}>
      <div className={styles.topRow}>
        <FeaturedCard article={featuredArticle} />
        {sideArticle && <SideCard article={sideArticle} />}
      </div>
      <div className={styles.feedGrid}>
        {remainingArticles.map((article) => (
          <SmallCard key={article.id} article={article} />
        ))}
      </div>
      <div className={styles.discoverMore}>
        <Link href="/discover" className={styles.discoverLink}>
          Discover more articles →
        </Link>
      </div>
    </div>
  );
}