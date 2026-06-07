'use client';

import { useState } from 'react';
import styles from './styles/Aestheticmode.module.css';

type Theme = 'crystal' | 'obsidian';

export default function AestheticMode() {
  const [theme, setTheme] = useState<Theme>('obsidian');

  return (
    <div className={styles.section}>
      <div className={styles.left}>
        <h2 className={styles.title}>Aesthetic Mode</h2>
        <p className={styles.description}>
          Shift between Crystal Light's airy clarity and the deep,
          immersive contrast of Deep Obsidian.
        </p>

        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${theme === 'crystal' ? styles.toggleBtnActive : ''}`}
            onClick={() => setTheme('crystal')}
          >
            CRYSTAL LIGHT
          </button>
          <button
            className={`${styles.toggleBtn} ${styles.toggleBtnCyan} ${theme === 'obsidian' ? styles.toggleBtnActiveCyan : ''}`}
            onClick={() => setTheme('obsidian')}
          >
            DEEP OBSIDIAN
          </button>
        </div>
      </div>

      {/* Preview card */}
      <div className={`${styles.previewWrapper} ${theme === 'crystal' ? styles.previewLight : styles.previewDark}`}>
        <div className={styles.previewCard}>
          {/* Sun icon (light mode) */}
          <div className={`${styles.previewIcon} ${theme === 'crystal' ? styles.iconActive : styles.iconInactive}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </div>

          {/* Switch thumb */}
          <div className={styles.previewSwitch}>
            <div className={`${styles.previewThumb} ${theme === 'obsidian' ? styles.thumbRight : styles.thumbLeft}`} />
          </div>

          {/* Moon icon (dark mode) */}
          <div className={`${styles.previewIcon} ${theme === 'obsidian' ? styles.iconActive : styles.iconInactive}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}