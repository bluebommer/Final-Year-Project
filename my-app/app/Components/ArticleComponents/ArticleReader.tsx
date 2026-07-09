// Components/ArticleComponents/ArticleReader.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './styles/ArticleReader.module.css';
import type { Article } from '@/app/types/article';
import { saveArticle, isArticleSaved, postToServiceWorker } from '@/lib/offlineDB';

interface ArticleReaderProps {
  article: Article;
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(160);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    isArticleSaved(article.id).then(setSaved);
  }, [article.id]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const scrollTop = window.scrollY;
      const scrollHeight = articleRef.current.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await saveArticle(article);
      setSaved(true);
      if (article.imageUrl) {
        await postToServiceWorker('CACHE_IMAGE', { url: article.imageUrl });
      }
      await postToServiceWorker('CACHE_ARTICLE_RESPONSE', { id: article.id });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    // TODO: implement share
    alert('Share article (demo)');
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleFontDecrease = () => {
    setFontSize(Math.max(80, fontSize - 10));
  };
  const handleFontIncrease = () => {
    setFontSize(Math.min(150, fontSize + 10));
  };
  const handleLineHeightDecrease = () => {
    setLineHeight(Math.max(120, lineHeight - 10));
  };
  const handleLineHeightIncrease = () => {
    setLineHeight(Math.min(200, lineHeight + 10));
  };

  return (
    <div className={`${styles.container} ${theme === 'light' ? styles.lightTheme : styles.darkTheme}`}>
      {/* Reading Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            <span className={styles.category}>{article.category}</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.authorSection}>
            <div
              className={styles.authorAvatar}
              style={{ background: article.authorColor }}
            >
              {article.authorInitial}
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{article.author}</span>
              <span className={styles.publishDate}>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionButtons}>
          <button className={styles.actionBtn} onClick={handleSave} disabled={saving} aria-label="Save for offline reading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span>{saving ? 'Saving…' : saved ? 'Saved offline' : 'Save'}</span>
          </button>
          <button className={styles.actionBtn} onClick={handleBookmark} aria-label="Bookmark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
          </button>
          <button className={styles.actionBtn} onClick={handleShare} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>
        </div>

        {/* Font Controls */}
        <div className={styles.displayControls}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Aa</span>
            <button onClick={handleFontDecrease} className={styles.controlBtn}>A-</button>
            <span className={styles.controlValue}>{fontSize}%</span>
            <button onClick={handleFontIncrease} className={styles.controlBtn}>A+</button>
          </div>
          <div className={styles.divider} />
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Line Ht.</span>
            <button onClick={handleLineHeightDecrease} className={styles.controlBtn}>−</button>
            <span className={styles.controlValue}>{lineHeight}%</span>
            <button onClick={handleLineHeightIncrease} className={styles.controlBtn}>+</button>
          </div>
          <div className={styles.divider} />
          <button
            className={styles.themeToggle}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Article Body */}
    <article
        ref={articleRef}
        className={styles.articleBody}
        style={{ fontSize: `${fontSize}%`, lineHeight: `${lineHeight}%` }}
        dangerouslySetInnerHTML={{
  __html: article.content || `<p>${article.description}</p>`,
}}
      />

      {/* Footer */}
      <footer className={styles.articleFooter}>
        <div className={styles.footerNote}>
          <span className={styles.footerDot} />
          <span>End of article</span>
          <span className={styles.footerDot} />
        </div>
      </footer>
    </div>
  );
}