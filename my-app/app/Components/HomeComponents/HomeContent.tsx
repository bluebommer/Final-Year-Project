// Components/HomeComponents/HomeContent.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './styles/Home.module.css';
import type { Article } from '@/app/types/article';
import { CATEGORY_KEYS } from '@/lib/categories';
import HeroBanner from './Herobanner';
import CategoryTabs from './Categorytabs';
import ArticleGrid from './ArticleGrid';
import { listSavedArticles } from '@/lib/offlineDB';

interface HomeContentProps {
  articles: Article[];
}

export default function HomeContent({ articles: serverArticles }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState('FOR YOU');
  const [offlineArticles, setOfflineArticles] = useState<Article[] | null>(null);

  // An empty server list means /api/articles' live sources (and its own
  // mock-article fallback) never reached this render at all — most likely
  // genuinely offline with no cached /home document for this exact request.
  // Fall back to whatever the user has saved locally instead of a blank feed.
  useEffect(() => {
    if (serverArticles.length > 0) return;
    listSavedArticles().then(setOfflineArticles);
  }, [serverArticles.length]);

  const usingOfflineFallback = serverArticles.length === 0 && !!offlineArticles?.length;
  const articles = usingOfflineFallback ? (offlineArticles as Article[]) : serverArticles;

  // Only show tabs for categories that actually have articles right now.
  const presentCategories = useMemo(() => {
    const present = new Set(articles.map((a) => a.category));
    return CATEGORY_KEYS.filter((c) => present.has(c));
  }, [articles]);

  // Filter articles by category
  const filteredArticles = activeTab === 'FOR YOU'
    ? articles
    : articles.filter(a => a.category === activeTab);

  // Build slides: prioritise staff picks, then take top 3 overall
  const staffPicks = articles.filter(a => a.isStaffPick);
  const slides = staffPicks.length >= 3
    ? staffPicks.slice(0, 3)
    : articles.slice(0, 3);

  return (
    <>
      {usingOfflineFallback && (
        <div className={styles.offlineNotice} role="status">
          <span>📡</span>
          <span><strong>You&apos;re offline.</strong> Showing your saved articles.</span>
        </div>
      )}
      <HeroBanner slides={slides} />
      <CategoryTabs categories={presentCategories} activeTab={activeTab} onTabChange={setActiveTab} />
      <ArticleGrid articles={filteredArticles} />
    </>
  );
}