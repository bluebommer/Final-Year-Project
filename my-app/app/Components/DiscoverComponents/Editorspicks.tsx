'use client';
import dynamic from 'next/dynamic';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './styles/Editorspicks.module.css';
import type { Article } from '@/app/types/article';
import { saveArticle, removeArticle, isArticleSaved } from '@/lib/offlineDB';
const SectionHeader = dynamic(() => import('./Sectionheader'));

interface EditorsPicksProps {
  articles: Article[];
}

function formatReadTime(readTime: string): string {
  return readTime.toUpperCase();
}

export default function EditorsPicks({ articles }: EditorsPicksProps) {
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

  if (picks.length === 0) return null;

  const [featured, ...rest] = picks;

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="HANDPICKED" title="Editors' Picks" action="See all picks" />
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

            <Link href={`/article/${encodeURIComponent(featured.id)}`}>
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
              <article key={pick.id} className={styles.secondaryCard} style={{ '--accent': pick.authorColor } as React.CSSProperties}>
                <div className={styles.secondaryTop}>
                  <span className={styles.category} style={{ color: pick.authorColor }}>{pick.category}</span>
                  <button
                    className={`${styles.saveBtn} ${saved.has(pick.id) ? styles.saveBtnActive : ''}`}
                    onClick={() => toggleSave(pick)}
                    aria-label="Save article"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.has(pick.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                    </svg>
                  </button>
                </div>
                <Link href={`/article/${encodeURIComponent(pick.id)}`}>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}