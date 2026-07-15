'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function DiscoverContent({ articles }: DiscoverContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  // Seeded from the URL so a category selection survives navigating to an
  // article and back — plain useState alone resets to null on remount,
  // since the browser's back button re-mounts this page from scratch.
  const [activeCategory, setActiveCategoryState] = useState<string | null>(() => searchParams.get('category'));
  const [resultsOverride, setResultsOverride] = useState<{ label: string; items: Article[] } | null>(null);

  function setActiveCategory(category: string | null) {
    setActiveCategoryState(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set('category', category);
    else params.delete('category');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    // Match on word starts (\b), not raw substrings — a plain `.includes('ai')`
    // also matches inside unrelated words like "certain", "explain", "said",
    // which flooded results for short/acronym queries.
    const words = q.split(/\s+/).filter(Boolean).map((w) => new RegExp(`\\b${escapeRegExp(w)}`, 'i'));
    return articles.filter((a) => {
      const haystack = `${a.title} ${a.description} ${a.category}`;
      return words.every((re) => re.test(haystack));
    });
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
    setActiveCategory(activeCategory === category ? null : category);
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
          <CategoryGrid articles={articles} activeCategory={activeCategory} onSelectCategory={selectCategory} />
          <EditorsPicks articles={articles} onSeeAll={showEditorsPicks} />
          <RisingWriters articles={articles} />
        </>
      )}
    </>
  );
}
