'use client';
import dynamic from 'next/dynamic';


import { useRef, useState } from 'react';
import styles from './styles/Trendingnow.module.css';
const SectionHeader = dynamic(() => import('./Sectionheader'));

const TRENDING = [
  { id: 1, rank: 1, category: 'TECHNOLOGY', title: 'The Silicon Mind: Ethics of Synthetic Cognition', readTime: '8 MIN', heat: 98, accent: '#22d3ee' },
  { id: 2, rank: 2, category: 'SCIENCE',    title: 'Quantum Entanglement Breaks Distance Record', readTime: '5 MIN', heat: 94, accent: '#a78bfa' },
  { id: 3, rank: 3, category: 'DESIGN',     title: 'The Language of Invisible Interfaces', readTime: '6 MIN', heat: 91, accent: '#f97316' },
  { id: 4, rank: 4, category: 'FUTURE',     title: 'Mars One: The Realities of Interplanetary Colonization', readTime: '22 MIN', heat: 88, accent: '#fb7185' },
  { id: 5, rank: 5, category: 'NATURE',     title: 'The Quiet Revolution of Bio-Regenerative Design', readTime: '12 MIN', heat: 85, accent: '#34d399' },
  { id: 6, rank: 6, category: 'PSYCHOLOGY', title: 'The Subtle Art of Perceptual Fluidity', readTime: '15 MIN', heat: 81, accent: '#fbbf24' },
];

export default function TrendingNow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

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
          {TRENDING.map((item) => (
            <article
              key={item.id}
              className={`${styles.card} ${activeId === item.id ? styles.cardActive : ''}`}
              onClick={() => setActiveId(item.id === activeId ? null : item.id)}
            >
              {/* Rank number */}
              <span className={styles.rank}>
                {String(item.rank).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className={styles.cardBody}>
                <span className={styles.category} style={{ color: item.accent }}>{item.category}</span>
                <h3 className={styles.title}>{item.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.readTime}>{item.readTime} READ</span>
                  <div className={styles.heatBar}>
                    <div className={styles.heatFill} style={{ width: `${item.heat}%`, background: item.accent }} />
                  </div>
                  <span className={styles.heatLabel} style={{ color: item.accent }}>{item.heat}°</span>
                </div>
              </div>

              {/* Hover accent line */}
              <div className={styles.accentLine} style={{ background: item.accent }} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}