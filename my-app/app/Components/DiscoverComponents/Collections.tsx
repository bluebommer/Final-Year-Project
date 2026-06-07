'use client';
import dynamic from 'next/dynamic';


import { useState } from 'react';
import styles from './styles/Collections.module.css';
const SectionHeader = dynamic(() => import('./Sectionheader'));


const COLLECTIONS = [
  {
    id: 1,
    title: 'The Future of Mind',
    description: 'Consciousness, AI, and the nature of intelligence.',
    count: 24,
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d2240 40%, #001a4d 70%, #00112e 100%)',
    glow: 'rgba(0, 222, 236, 0.25)',
    tags: ['AI', 'Neuroscience', 'Philosophy'],
    icon: '🧠',
  },
  {
    id: 2,
    title: 'Designed Worlds',
    description: 'How aesthetics shape the systems we inhabit.',
    count: 18,
    gradient: 'linear-gradient(135deg, #1a0a28 0%, #2d1040 40%, #3d0050 70%, #1a0028 100%)',
    glow: 'rgba(160, 80, 255, 0.25)',
    tags: ['Design', 'Architecture', 'Culture'],
    icon: '✦',
  },
  {
    id: 3,
    title: 'Climate Futures',
    description: 'The science and solutions behind a changing planet.',
    count: 31,
    gradient: 'linear-gradient(135deg, #081a10 0%, #0d2e18 40%, #083a1a 70%, #041208 100%)',
    glow: 'rgba(52, 211, 153, 0.25)',
    tags: ['Science', 'Nature', 'Tech'],
    icon: '◈',
  },
  {
    id: 4,
    title: 'Beyond Earth',
    description: 'Humanity\'s ambition to reach the stars.',
    count: 15,
    gradient: 'linear-gradient(135deg, #14080a 0%, #280d14 40%, #3d0020 70%, #1a0010 100%)',
    glow: 'rgba(251, 113, 133, 0.25)',
    tags: ['Space', 'Future', 'Science'],
    icon: '⬡',
  },
];

export default function Collections() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="CURATED" title="Collections" action="Browse all" />
        <div className={styles.grid}>
          {COLLECTIONS.map((col) => (
            <article
              key={col.id}
              className={`${styles.card} ${hovered === col.id ? styles.cardHovered : ''}`}
              onMouseEnter={() => setHovered(col.id)}
              onMouseLeave={() => setHovered(null)}
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