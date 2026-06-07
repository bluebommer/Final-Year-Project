'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './styles/Searchhero.module.css';

const PLACEHOLDERS = [
  'Search for articles on AI ethics…',
  'Explore quantum computing…',
  'Find essays on climate science…',
  'Discover design philosophy…',
  'Read about space colonization…',
];

const TRENDING_TAGS = [
  'Artificial Intelligence', 'Neuroscience', 'Climate Tech',
  'Biomimicry', 'Quantum Physics', 'Digital Philosophy',
  'Space Exploration', 'Liquid Design', 'Consciousness',
];

export default function SearchHero() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder text
  useEffect(() => {
    if (focused || query) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, query]);

  function handleTagClick(tag: string) {
    setQuery(tag);
    inputRef.current?.focus();
  }

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <div className={styles.searchHero}>
      {/* Background gradient */}
      <div className={styles.heroBg} />

      {/* Content */}
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>DISCOVER</span>
        <h1 className={styles.heroTitle}>
          What are you curious<br />about today?
        </h1>
        <p className={styles.heroSubtitle}>
          Explore thousands of articles across science, design, culture and beyond.
        </p>

        {/* Search bar */}
        <div className={`${styles.searchBar} ${focused ? styles.searchBarFocused : ''}`}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <div className={styles.inputWrapper}>
            {/* Animated placeholder */}
            {!query && !focused && (
              <span className={`${styles.placeholder} ${placeholderVisible ? styles.placeholderIn : styles.placeholderOut}`}>
                {PLACEHOLDERS[placeholderIndex]}
              </span>
            )}
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Search articles"
            />
          </div>

          {query && (
            <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          <button className={styles.searchBtn}>
            Search
          </button>
        </div>

        {/* Trending tags */}
        <div className={styles.tagsRow}>
          <span className={styles.tagsLabel}>Trending:</span>
          <div className={styles.tags}>
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                className={`${styles.tag} ${query === tag ? styles.tagActive : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}