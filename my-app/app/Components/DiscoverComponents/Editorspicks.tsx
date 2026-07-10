'use client';
import dynamic from 'next/dynamic';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './styles/Editorspicks.module.css';
import type { Article } from '@/app/types/article';
import { saveArticle, removeArticle, isArticleSaved } from '@/lib/offlineDB';
import { useHoverPrefetch } from '@/lib/useHoverPrefetch';
const SectionHeader = dynamic(() => import('./Sectionheader'));

interface EditorsPicksProps {
  articles: Article[];
  onSeeAll: () => void;
}

function formatReadTime(readTime: string): string {
  return readTime.toUpperCase();
}

// Extracted so useHoverPrefetch (a hook) can be called once per card
// instead of inside the parent's .map() callback.
function SecondaryPickCard({ pick, isSaved, onToggleSave }: {
  pick: Article;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const href = `/article/${encodeURIComponent(pick.id)}`;
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(href);

  return (
    <article className={styles.secondaryCard} style={{ '--accent': pick.authorColor } as React.CSSProperties}>
      <div className={styles.secondaryTop}>
        <span className={styles.category} style={{ color: pick.authorColor }}>{pick.category}</span>
        <button
          className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`}
          onClick={onToggleSave}
          aria-label="Save article"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>
      <Link href={href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <h3 className={styles.secondaryTitle}>{pick.title}</h3>
        <p className={styles.secondaryDesc}>{pick.description}</p>
      </Link>
      <div className={styles.cardFooter}>
        <div className={styles.author}>
          <span className={styles.authorDot} style={{ background: pick.authorColor }}>{pick.authorInitial}</span>
          <span className={styles.authorName}>{pick.author}</span>
        </div>
        <span className={styles.readTime}>{formatReadTime(pick.readTime)}</span>
      </div>
    </article>
  );
}

export default function EditorsPicks({ articles, onSeeAll }: EditorsPicksProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Real staff picks when available; pad with the most recent articles otherwise.
  const picks = useMemo(() => {
    const staffPicks = articles.filter((a) => a.isStaffPick);
    const rest = articles.filter((a) => !a.isStaffPick);
    return [...staffPicks, ...rest].slice(0, 3);
  }, [articles]);

  useEffect(() => {
    Promise.all(picks.map((p) => isArticleSaved(p.id))).then((results) => {
      setSaved(new Set(picks.filter((_, i) => results[i]).map((p) => p.id)));
    });
  }, [picks]);

  async function toggleSave(article: Article) {
    if (saved.has(article.id)) {
      await removeArticle(article.id);
      setSaved((prev) => { const next = new Set(prev); next.delete(article.id); return next; });
    } else {
      await saveArticle(article);
      setSaved((prev) => new Set(prev).add(article.id));
    }
  }

  // Hook must be called unconditionally (before the early return below), so
  // fall back to an inert href when there are no picks yet.
  const featuredHref = picks.length > 0 ? `/article/${encodeURIComponent(picks[0].id)}` : '';
  const { onMouseEnter: onFeaturedEnter, onMouseLeave: onFeaturedLeave } = useHoverPrefetch(featuredHref);

  if (picks.length === 0) return null;

  const [featured, ...rest] = picks;

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="HANDPICKED" title="Editors' Picks" action="See all picks" onAction={onSeeAll} />
        <div className={styles.layout}>

          {/* Featured pick */}
          <article className={styles.featuredCard} style={{ '--accent': featured.authorColor } as React.CSSProperties}>
            <div className={styles.featuredTop}>
              <div className={styles.editorBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                EDITOR'S CHOICE
              </div>
              <button
                className={`${styles.saveBtn} ${saved.has(featured.id) ? styles.saveBtnActive : ''}`}
                onClick={() => toggleSave(featured)}
                aria-label="Save article"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved.has(featured.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </button>
            </div>

            <Link href={featuredHref} onMouseEnter={onFeaturedEnter} onMouseLeave={onFeaturedLeave}>
              <span className={styles.category} style={{ color: featured.authorColor }}>{featured.category}</span>
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              <p className={styles.featuredDesc}>{featured.description}</p>
            </Link>

            <div className={styles.cardFooter}>
              <div className={styles.author}>
                <span className={styles.authorDot} style={{ background: featured.authorColor }}>{featured.authorInitial}</span>
                <span className={styles.authorName}>{featured.author}</span>
              </div>
              <span className={styles.readTime}>{formatReadTime(featured.readTime)}</span>
            </div>

            <div className={styles.featuredAccentLine} style={{ background: featured.authorColor }} />
          </article>

          {/* Secondary picks */}
          <div className={styles.secondaryCol}>
            {rest.map((pick) => (
              <SecondaryPickCard
                key={pick.id}
                pick={pick}
                isSaved={saved.has(pick.id)}
                onToggleSave={() => toggleSave(pick)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}