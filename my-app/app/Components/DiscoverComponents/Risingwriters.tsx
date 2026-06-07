'use client';
import dynamic from 'next/dynamic';


import { useState } from 'react';
import styles from './styles/Risingwriters.module.css';
const SectionHeader = dynamic(() => import('./Sectionheader'));

const WRITERS = [
  { id: 1, name: 'Dr. Mira Chen',    role: 'AI & Consciousness',  initial: 'M', color: '#22d3ee', articles: 42, followers: '12.4k', trending: true  },
  { id: 2, name: 'Kai Tanaka',       role: 'Design & Systems',    initial: 'K', color: '#f97316', articles: 28, followers: '8.1k',  trending: true  },
  { id: 3, name: 'Elena Voss',       role: 'Physics & Cosmology', initial: 'E', color: '#a78bfa', articles: 35, followers: '9.7k',  trending: false },
  { id: 4, name: 'James Okafor',     role: 'Climate & Futures',   initial: 'J', color: '#34d399', articles: 19, followers: '5.3k',  trending: true  },
  { id: 5, name: 'Saoirse Brennan', role: 'Psychology & Mind',   initial: 'S', color: '#fbbf24', articles: 31, followers: '7.8k',  trending: false },
  { id: 6, name: 'Omar Al-Rashid',  role: 'Architecture & Space',initial: 'O', color: '#fb7185', articles: 24, followers: '6.2k',  trending: false },
];

export default function RisingWriters() {
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  function toggleFollow(id: number) {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="VOICES" title="Rising Writers" action="View all writers" />
        <div className={styles.grid}>
          {WRITERS.map((writer) => (
            <div key={writer.id} className={styles.card}>
              {writer.trending && (
                <span className={styles.trendingBadge}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  TRENDING
                </span>
              )}

              <div className={styles.cardTop}>
                <div className={styles.avatar} style={{ background: writer.color }}>
                  {writer.initial}
                </div>
                <div className={styles.writerInfo}>
                  <span className={styles.writerName}>{writer.name}</span>
                  <span className={styles.writerRole}>{writer.role}</span>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{writer.articles}</span>
                  <span className={styles.statLabel}>Articles</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statValue}>{writer.followers}</span>
                  <span className={styles.statLabel}>Followers</span>
                </div>
              </div>

              <button
                className={`${styles.followBtn} ${followed.has(writer.id) ? styles.followBtnActive : ''}`}
                style={{ '--writer-color': writer.color } as React.CSSProperties}
                onClick={() => toggleFollow(writer.id)}
              >
                {followed.has(writer.id) ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Follow
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}