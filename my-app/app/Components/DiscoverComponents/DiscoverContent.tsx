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
  const [resultsOverride, setResultsOverride] = useState<{ label: string; items: Article[] } | null>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const categoryResults = useMemo(() => {
    if (!activeCategory) return [];
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  function search(q: string) {
    setQuery(q);
    if (q.trim()) {
      setActiveCategory(null);
      setResultsOverride(null);
    }
  }

  function selectCategory(category: string) {
    setQuery('');
    setResultsOverride(null);
    setActiveCategory((prev) => (prev === category ? null : category));
  }

  function clearResults() {
    setQuery('');
    setActiveCategory(null);
    setResultsOverride(null);
  }

  function showAllArticles() {
    setQuery('');
    setActiveCategory(null);
    setResultsOverride({ label: 'All Articles', items: articles });
  }

  function showEditorsPicks() {
    const staffPicks = articles.filter((a) => a.isStaffPick);
    setQuery('');
    setActiveCategory(null);
    setResultsOverride({ label: "Editors' Picks", items: staffPicks.length > 0 ? staffPicks : articles });
  }

  const showingResults = query.trim().length > 0 || activeCategory !== null || resultsOverride !== null;
  const resultsItems = query.trim() ? searchResults : resultsOverride ? resultsOverride.items : categoryResults;
  const resultsTitle = query.trim() ? `Results for "${query.trim()}"` : resultsOverride ? resultsOverride.label : activeCategory;

  return (
    <>
      <SearchHero query={query} onSearch={search} />

      {showingResults ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>{resultsTitle}</h2>
              <button className={styles.clearResultsBtn} onClick={clearResults}>
                ← Back to Discover
              </button>
            </div>
            <ArticleGrid articles={resultsItems} showDiscoverMore={false} />
          </div>
        </section>
      ) : (
        <>
          <TrendingNow articles={articles} />
          <Collections articles={articles} onSelectCategory={selectCategory} onBrowseAll={showAllArticles} />
          <CategoryGrid articles={articles} onSelectCategory={selectCategory} />
          <EditorsPicks articles={articles} onSeeAll={showEditorsPicks} />
          <RisingWriters articles={articles} />
        </>
      )}
    </>
  );
}
