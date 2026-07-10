'use client';

import { useEffect, useState } from 'react';
import styles from './styles/Settingshero.module.css';
import { getStoredTheme, THEME_CHANGED_EVENT, type Theme } from '@/lib/theme';

const COPY: Record<Theme, { title: string; subtitle: string }> = {
  dark: {
    title: 'Deep Obsidian',
    subtitle: 'Customize your reading environment with precision. Tailor the optical clarity, tonal depth, and personalized content delivery.',
  },
  light: {
    title: 'Crystal Light',
    subtitle: 'Airy, high-contrast clarity for reading in bright environments — same precision, lighter touch.',
  },
};

export default function SettingsHero() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getStoredTheme());
    const onThemeChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_CHANGED_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, onThemeChange);
  }, []);

  return (
    <div className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>CONFIGURATION</span>
        <h1 className={styles.title}>{COPY[theme].title}</h1>
        <p className={styles.subtitle}>{COPY[theme].subtitle}</p>
      </div>
    </div>
  );
}
