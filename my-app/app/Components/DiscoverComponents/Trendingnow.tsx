'use client';
import dynamic from 'next/dynamic';

import Link from 'next/link';
import { useRef, useState } from 'react';
import styles from './styles/Trendingnow.module.css';
import type { Article } from '@/app/types/article';
import { useHoverPrefetch } from '@/lib/useHoverPrefetch';
const SectionHeader = dynamic(() => import('./Sectionheader'));

interface TrendingNowProps {
  articles: Article[];
}

interface TrendingItem extends Article {
  rank: number;
  heat: number;
}

function formatReadTime(readTime: string): string {
  const match = readTime.match(/\d+/);
  return match ? `${match[0]} MIN` : readTime.toUpperCase();
}

// Extracted so useHoverPrefetch (a hook) can be called once per card
// instead of inside the parent's .map() callback.
function TrendingCard({ item, active, onHover, onUnhover }: {
  item: TrendingItem;
  active: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const href = `/article/${encodeURIComponent(item.id)}`;
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(href);

  return (
    <Link
      href={href}
      className={`${styles.card} ${active ? styles.cardActive : ''}`}
      onMouseEnter={() => { onHover(); onMouseEnter(); }}
      onMouseLeave={() => { onUnhover(); onMouseLeave(); }}
    >
      {/* Rank number */}
      <span className={styles.rank}>
        {String(item.rank).padStart(2, '0')}
      </span>

      {/* Content */}
      <div className={styles.cardBody}>
        <span className={styles.category} style={{ color: item.authorColor }}>{item.category}</span>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <span className={styles.readTime}>{formatReadTime(item.readTime)} READ</span>
          <div className={styles.heatBar}>
            <div className={styles.heatFill} style={{ width: `${item.heat}%`, background: item.authorColor }} />
          </div>
          <span className={styles.heatLabel} style={{ color: item.authorColor }}>{item.heat}°</span>
        </div>
      </div>

      {/* Hover accent line */}
      <div className={styles.accentLine} style={{ background: item.authorColor }} />
    </Link>
  );
}

export default function TrendingNow({ articles }: TrendingNowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // No real engagement metrics exist yet — rank by staff-pick/recency (already
  // the API's sort order) and derive a decaying "heat" score from rank.
  const trending = articles.slice(0, 6).map((article, i) => ({
    ...article,
    rank: i + 1,
    heat: Math.max(60, 98 - i * 4),
  }));

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.headerRow}>
          <SectionHeader label="RIGHT NOW" title="Trending" />
          <div className={styles.scrollBtns}>
            <button className={styles.scrollBtn} onClick={() => scroll('left')} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className={styles.scrollBtn} onClick={() => scroll('right')} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.track} ref={scrollRef}>
          {trending.map((item) => (
            <TrendingCard
              key={item.id}
              item={item}
              active={activeId === item.id}
              onHover={() => setActiveId(item.id)}
              onUnhover={() => setActiveId(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}