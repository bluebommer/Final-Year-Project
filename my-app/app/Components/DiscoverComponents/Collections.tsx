'use client';
import dynamic from 'next/dynamic';


import { useMemo, useState } from 'react';
import styles from './styles/Collections.module.css';
import type { Article } from '@/app/types/article';
const SectionHeader = dynamic(() => import('./Sectionheader'));

// Decorative presets cycled per real category — not fabricated content, just styling.
const PRESETS = [
  { gradient: 'linear-gradient(135deg, #0a1628 0%, #0d2240 40%, #001a4d 70%, #00112e 100%)', glow: 'rgba(0, 222, 236, 0.25)', icon: '🧠' },
  { gradient: 'linear-gradient(135deg, #1a0a28 0%, #2d1040 40%, #3d0050 70%, #1a0028 100%)', glow: 'rgba(160, 80, 255, 0.25)', icon: '✦' },
  { gradient: 'linear-gradient(135deg, #081a10 0%, #0d2e18 40%, #083a1a 70%, #041208 100%)', glow: 'rgba(52, 211, 153, 0.25)', icon: '◈' },
  { gradient: 'linear-gradient(135deg, #14080a 0%, #280d14 40%, #3d0020 70%, #1a0010 100%)', glow: 'rgba(251, 113, 133, 0.25)', icon: '⬡' },
];

interface CollectionsProps {
  articles: Article[];
  onSelectCategory: (category: string) => void;
}

export default function Collections({ articles, onSelectCategory }: CollectionsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const collections = useMemo(() => {
    const counts = new Map<string, { count: number; sources: Set<string> }>();
    for (const a of articles) {
      const entry = counts.get(a.category) ?? { count: 0, sources: new Set<string>() };
      entry.count += 1;
      entry.sources.add(a.source);
      counts.set(a.category, entry);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([category, data], i) => ({
        id: category,
        title: category.charAt(0) + category.slice(1).toLowerCase(),
        description: `The latest in ${category.toLowerCase()}, from ${[...data.sources].slice(0, 2).join(' & ')}.`,
        count: data.count,
        tags: [...data.sources].slice(0, 3),
        ...PRESETS[i % PRESETS.length],
      }));
  }, [articles]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="CURATED" title="Collections" action="Browse all" />
        <div className={styles.grid}>
          {collections.map((col) => (
            <article
              key={col.id}
              className={`${styles.card} ${hovered === col.id ? styles.cardHovered : ''}`}
              onMouseEnter={() => setHovered(col.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectCategory(col.id)}
              role="button"
              tabIndex={0}
            >
              {/* Gradient background */}
              <div className={styles.cardBg} style={{ background: col.gradient }} />

              {/* Glow pulse */}
              <div className={styles.cardGlow} style={{ background: col.glow }} />

              {/* Content */}
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon}>{col.icon}</span>
                  <span className={styles.cardCount}>{col.count} articles</span>
                </div>
                <div className={styles.cardBottom}>
                  <h3 className={styles.cardTitle}>{col.title}</h3>
                  <p className={styles.cardDesc}>{col.description}</p>
                  <div className={styles.cardTags}>
                    {col.tags.map((tag) => (
                      <span key={tag} className={styles.cardTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover CTA */}
              <div className={styles.cardCta}>
                <span>Explore collection</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}