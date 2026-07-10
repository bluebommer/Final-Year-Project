// Components/HomeComponents/HomeContent.tsx
'use client';

import { useMemo, useState } from 'react';
import styles from './styles/Home.module.css';
import type { Article } from '@/app/types/article';
import { CATEGORY_KEYS } from '@/lib/categories';
import HeroBanner from './Herobanner';
import CategoryTabs from './Categorytabs';
import ArticleGrid from './ArticleGrid';

interface HomeContentProps {
  articles: Article[];
}

export default function HomeContent({ articles }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState('FOR YOU');

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
      <HeroBanner slides={slides} />
      <CategoryTabs categories={presentCategories} activeTab={activeTab} onTabChange={setActiveTab} />
      <ArticleGrid articles={filteredArticles} />
    </>
  );
}