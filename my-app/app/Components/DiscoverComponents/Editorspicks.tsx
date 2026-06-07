'use client';
import dynamic from 'next/dynamic';


import { useState } from 'react';
import styles from './styles/Editorspicks.module.css';
const SectionHeader = dynamic(() => import('./Sectionheader'));


const PICKS = [
  {
    id: 1,
    category: 'TECHNOLOGY',
    title: 'The Silicon Mind: Ethics of Synthetic Cognition',
    description: 'Exploring the blurred lines between programmed response and genuine consciousness in the next generation of AI.',
    author: 'Dr. Mira Chen',
    authorInitial: 'M',
    authorColor: '#22d3ee',
    readTime: '8 MIN READ',
    note: '"A landmark piece on machine consciousness."',
    accent: '#22d3ee',
    featured: true,
  },
  {
    id: 2,
    category: 'DESIGN',
    title: 'The Language of Invisible Interfaces',
    description: 'When design disappears entirely, what remains? A deep look at zero-UI and ambient computing.',
    author: 'Kai Tanaka',
    authorInitial: 'K',
    authorColor: '#f97316',
    readTime: '6 MIN READ',
    note: '"Beautifully challenges design orthodoxy."',
    accent: '#f97316',
    featured: false,
  },
  {
    id: 3,
    category: 'SCIENCE',
    title: 'Quantum Entanglement Breaks Distance Record',
    description: 'Physicists have achieved entanglement over 1,200km — reshaping what we thought was physically possible.',
    author: 'Elena Voss',
    authorInitial: 'E',
    authorColor: '#a78bfa',
    readTime: '5 MIN READ',
    note: '"Essential reading for the science-curious."',
    accent: '#a78bfa',
    featured: false,
  },
];

export default function EditorsPicks() {
  const [saved, setSaved] = useState<Set<number>>(new Set());

  function toggleSave(id: number) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const [featured, ...rest] = PICKS;

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeader label="HANDPICKED" title="Editors' Picks" action="See all picks" />
        <div className={styles.layout}>

          {/* Featured pick */}
          <article className={styles.featuredCard} style={{ '--accent': featured.accent } as React.CSSProperties}>
            <div className={styles.featuredTop}>
              <div className={styles.editorBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                EDITOR'S CHOICE
              </div>
              <button
                className={`${styles.saveBtn} ${saved.has(featured.id) ? styles.saveBtnActive : ''}`}
                onClick={() => toggleSave(featured.id)}
                aria-label="Save article"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved.has(featured.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </button>
            </div>

            <span className={styles.category} style={{ color: featured.accent }}>{featured.category}</span>
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            <p className={styles.featuredDesc}>{featured.description}</p>
            <p className={styles.editorNote}>{featured.note}</p>

            <div className={styles.cardFooter}>
              <div className={styles.author}>
                <span className={styles.authorDot} style={{ background: featured.authorColor }}>{featured.authorInitial}</span>
                <span className={styles.authorName}>{featured.author}</span>
              </div>
              <span className={styles.readTime}>{featured.readTime}</span>
            </div>

            <div className={styles.featuredAccentLine} style={{ background: featured.accent }} />
          </article>

          {/* Secondary picks */}
          <div className={styles.secondaryCol}>
            {rest.map((pick) => (
              <article key={pick.id} className={styles.secondaryCard} style={{ '--accent': pick.accent } as React.CSSProperties}>
                <div className={styles.secondaryTop}>
                  <span className={styles.category} style={{ color: pick.accent }}>{pick.category}</span>
                  <button
                    className={`${styles.saveBtn} ${saved.has(pick.id) ? styles.saveBtnActive : ''}`}
                    onClick={() => toggleSave(pick.id)}
                    aria-label="Save article"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.has(pick.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                    </svg>
                  </button>
                </div>
                <h3 className={styles.secondaryTitle}>{pick.title}</h3>
                <p className={styles.secondaryDesc}>{pick.description}</p>
                <p className={styles.editorNote}>{pick.note}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.author}>
                    <span className={styles.authorDot} style={{ background: pick.authorColor }}>{pick.authorInitial}</span>
                    <span className={styles.authorName}>{pick.author}</span>
                  </div>
                  <span className={styles.readTime}>{pick.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}