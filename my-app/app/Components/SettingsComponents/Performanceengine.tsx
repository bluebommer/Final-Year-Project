// Components/SettingsComponents/Performanceengine.tsx
'use client';

import { useState } from 'react';
import styles from './styles/PerformanceEngine.module.css';
import { getPrefetchBehavior, setPrefetchBehavior, type PrefetchBehavior } from '@/lib/prefetch';

const PREFETCH_OPTIONS: { value: PrefetchBehavior; label: string; description: string }[] = [
  { value: 'wifi-only', label: 'WiFi only', description: 'Prefetch only when the browser reports a fast, unmetered connection' },
  { value: 'always', label: 'Always', description: 'Prefetch on any network (may use mobile data)' },
  { value: 'never', label: 'Never', description: 'Disable all prefetching' },
];

export default function PerformanceEngine() {
  const [behavior, setBehavior] = useState<PrefetchBehavior>(() => getPrefetchBehavior());

  function selectBehavior(value: PrefetchBehavior) {
    setBehavior(value);
    setPrefetchBehavior(value);
  }

  return (
    <div className={styles.panel}>
      {/* Panel header */}
      <div className={styles.panelHeader}>
        <div className={styles.iconWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h3 className={styles.panelTitle}>Performance Engine</h3>
          <span className={styles.panelSub}>PREFETCH & DATA USAGE</span>
        </div>
      </div>

      {/* Prefetch Behaviour Section */}
      <div className={styles.prefetchSection}>
        <div className={styles.prefetchHeader}>
          <span className={styles.prefetchLabel}>Prefetch Behaviour</span>
          <span className={styles.prefetchHint}>Controls hover-prefetch on article cards and the Hero banner</span>
        </div>
        <div className={styles.prefetchOptions}>
          {PREFETCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.prefetchBtn} ${behavior === option.value ? styles.prefetchBtnActive : ''}`}
              onClick={() => selectBehavior(option.value)}
              aria-pressed={behavior === option.value}
            >
              <span className={styles.prefetchBtnLabel}>{option.label}</span>
              <span className={styles.prefetchBtnDesc}>{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
