'use client';
import dynamic from 'next/dynamic';


import { useState } from 'react';
import styles from './styles/Categorygrid.module.css';
const SectionHeader = dynamic(() => import('./Sectionheader'));


const CATEGORIES = [
  { id: 1,  name: 'Technology',   count: 842, icon: '⬡', color: '#22d3ee', bg: 'rgba(0,222,236,0.07)' },
  { id: 2,  name: 'Science',      count: 631, icon: '◎', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
  { id: 3,  name: 'Design',       count: 419, icon: '✦', color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
  { id: 4,  name: 'Architecture', count: 287, icon: '◈', color: '#34d399', bg: 'rgba(52,211,153,0.07)' },
  { id: 5,  name: 'Psychology',   count: 503, icon: '◉', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)' },
  { id: 6,  name: 'Culture',      count: 376, icon: '❋', color: '#fb7185', bg: 'rgba(251,113,133,0.07)' },
  { id: 7,  name: 'Future',       count: 195, icon: '⟁', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)' },
  { id: 8,  name: 'Nature',       count: 448, icon: '⬟', color: '#6ee7b7', bg: 'rgba(110,231,183,0.07)' },
  { id: 9,  name: 'Business',     count: 562, icon: '◆', color: '#e879f9', bg: 'rgba(232,121,249,0.07)' },
  { id: 10, name: 'Philosophy',   count: 234, icon: '◯', color: '#cbd5e1', bg: 'rgba(203,213,225,0.07)' },
];

export default function CategoryGrid() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="EXPLORE" title="Browse by Category" />
        <div className={styles.grid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.card} ${active === cat.id ? styles.cardActive : ''}`}
              style={{
                '--cat-color': cat.color,
                '--cat-bg': cat.bg,
              } as React.CSSProperties}
              onClick={() => setActive(cat.id === active ? null : cat.id)}
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