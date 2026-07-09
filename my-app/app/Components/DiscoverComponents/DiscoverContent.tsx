'use client';

import { useMemo, useState } from 'react';
import type { Article } from '@/app/types/article';
import ArticleGrid from '../HomeComponents/ArticleGrid';
import SearchHero from './Searchhero';
import TrendingNow from './Trendingnow';
import Collections from './Collections';
import CategoryGrid from './Categorygrid';
import EditorsPicks from './Editorspicks';
import RisingWriters from './Risingwriters';
import styles from './styles/Discover.module.css';

interface DiscoverContentProps {
  articles: Article[];
}

export default function DiscoverContent({ articles }: DiscoverContentProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const categoryResults = useMemo(() => {
    if (!activeCategory) return [];
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  function selectCategory(category: string) {
    setActiveCategory((prev) => (prev === category ? null : category));
  }

  const showingResults = query.trim().length > 0 || activeCategory !== null;

  return (
    <>
      <SearchHero onSearch={setQuery} />

      {showingResults ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                {query.trim() ? `Results for "${query.trim()}"` : activeCategory}
              </h2>
              <button
                className={styles.clearResultsBtn}
                onClick={() => {
                  setQuery('');
                  setActiveCategory(null);
                }}
              >
                ← Back to Discover
              </button>
            </div>
            <ArticleGrid articles={query.trim() ? searchResults : categoryResults} />
          </div>
        </section>
      ) : (
        <>
          <TrendingNow articles={articles} />
          <Collections articles={articles} onSelectCategory={selectCategory} />
          <CategoryGrid articles={articles} onSelectCategory={selectCategory} />
          <EditorsPicks articles={articles} />
          <RisingWriters articles={articles} />
        </>
      )}
    </>
  );
}
