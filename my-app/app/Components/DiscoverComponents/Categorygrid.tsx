'use client';
import dynamic from 'next/dynamic';


import { useMemo, useState } from 'react';
import styles from './styles/Categorygrid.module.css';
import type { Article } from '@/app/types/article';
const SectionHeader = dynamic(() => import('./Sectionheader'));

// The 8 categories getCategory() in app/api/articles/route.ts actually assigns.
const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  TECHNOLOGY: { icon: '⬡', color: '#22d3ee', bg: 'rgba(0,222,236,0.07)' },
  SCIENCE:    { icon: '◎', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
  DESIGN:     { icon: '✦', color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
  PSYCHOLOGY: { icon: '◉', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)' },
  CULTURE:    { icon: '❋', color: '#fb7185', bg: 'rgba(251,113,133,0.07)' },
  FUTURE:     { icon: '⟁', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)' },
  NATURE:     { icon: '⬟', color: '#6ee7b7', bg: 'rgba(110,231,183,0.07)' },
  BUSINESS:   { icon: '◆', color: '#e879f9', bg: 'rgba(232,121,249,0.07)' },
};

interface CategoryGridProps {
  articles: Article[];
  onSelectCategory: (category: string) => void;
}

export default function CategoryGrid({ articles, onSelectCategory }: CategoryGridProps) {
  const [active, setActive] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    return Object.keys(CATEGORY_META)
      .map((name) => ({ id: name, name: name.charAt(0) + name.slice(1).toLowerCase(), count: counts.get(name) ?? 0, ...CATEGORY_META[name] }))
      .filter((c) => c.count > 0);
  }, [articles]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="EXPLORE" title="Browse by Category" />
        <div className={styles.grid}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.card} ${active === cat.id ? styles.cardActive : ''}`}
              style={{
                '--cat-color': cat.color,
                '--cat-bg': cat.bg,
              } as React.CSSProperties}
              onClick={() => {
                setActive(cat.id === active ? null : cat.id);
                onSelectCategory(cat.id);
              }}
            >
              <span className={styles.icon}>{cat.icon}</span>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.count}>{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}