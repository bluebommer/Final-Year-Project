'use client';
import dynamic from 'next/dynamic';


import { useMemo } from 'react';
import styles from './styles/Categorygrid.module.css';
import type { Article } from '@/app/types/article';
import { CATEGORY_META } from '@/lib/categories';
const SectionHeader = dynamic(() => import('./Sectionheader'));

interface CategoryGridProps {
  articles: Article[];
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export default function CategoryGrid({ articles, activeCategory, onSelectCategory }: CategoryGridProps) {
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
              className={`${styles.card} ${activeCategory === cat.id ? styles.cardActive : ''}`}
              style={{
                '--cat-color': cat.color,
                '--cat-bg': cat.bg,
              } as React.CSSProperties}
              onClick={() => onSelectCategory(cat.id)}
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