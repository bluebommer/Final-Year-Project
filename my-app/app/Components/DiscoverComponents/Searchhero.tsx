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

// Mirrors the real category taxonomy from lib/articleHelpers.ts (getCategory)
// so a tag click always matches actual articles instead of a decorative
// phrase that happens not to appear in any title/description.
const TRENDING_TAGS = [
  'Technology', 'Science', 'Business', 'Politics',
  'Health', 'Culture', 'Sports', 'World',
];

interface SearchHeroProps {
  query: string;
  onSearch: (query: string) => void;
}

export default function SearchHero({ query, onSearch }: SearchHeroProps) {
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
    onSearch(tag);
    inputRef.current?.focus();
  }

  function handleClear() {
    onSearch('');
    inputRef.current?.focus();
  }

  function handleChange(value: string) {
    onSearch(value);
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
              onChange={(e) => handleChange(e.target.value)}
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

          <button className={styles.searchBtn} onClick={() => onSearch(query)}>
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