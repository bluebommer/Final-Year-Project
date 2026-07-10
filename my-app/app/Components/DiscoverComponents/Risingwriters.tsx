'use client';
import dynamic from 'next/dynamic';


import { useMemo, useState } from 'react';
import styles from './styles/Risingwriters.module.css';
import type { Article } from '@/app/types/article';
import { getFollowedWriters, setFollowedWriters } from '@/lib/followedWriters';
const SectionHeader = dynamic(() => import('./Sectionheader'));

interface RisingWritersProps {
  articles: Article[];
}

export default function RisingWriters({ articles }: RisingWritersProps) {
  const [followed, setFollowed] = useState<Set<string>>(() => getFollowedWriters());
  const [showAll, setShowAll] = useState(false);

  // No real profile/follower system exists yet — derive real per-author
  // article counts and source from the current fetched pool instead of a
  // separate authors collection.
  const allWriters = useMemo(() => {
    const byAuthor = new Map<string, { count: number; sample: Article }>();
    for (const a of articles) {
      const entry = byAuthor.get(a.author) ?? { count: 0, sample: a };
      entry.count += 1;
      byAuthor.set(a.author, entry);
    }
    return [...byAuthor.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, { count, sample }]) => ({
        id: name,
        name,
        role: `Writes for ${sample.source}`,
        initial: sample.authorInitial,
        color: sample.authorColor,
        articles: count,
        trending: count >= 2,
      }));
  }, [articles]);

  const writers = showAll ? allWriters : allWriters.slice(0, 6);

  function toggleFollow(id: string) {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setFollowedWriters(next);
      return next;
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader
          label="VOICES"
          title="Rising Writers"
          action={showAll ? 'Show fewer' : 'View all writers'}
          onAction={() => setShowAll((v) => !v)}
        />
        <div className={styles.grid}>
          {writers.map((writer) => (
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
                  <span className={styles.statLabel}>{writer.articles === 1 ? 'Article' : 'Articles'} in feed</span>
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