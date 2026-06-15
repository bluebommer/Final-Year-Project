// Components/SettingsComponents/Performanceengine.tsx
'use client';

import { useState } from 'react';
import styles from './styles/PerformanceEngine.module.css';

interface Toggle {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

type PrefetchBehavior = 'wifi-only' | 'always' | 'never';

const TOGGLES: Toggle[] = [
  {
    id: 'hifi',
    label: 'Ultra High Fidelity Images',
    description: 'Download RAW formats for crystal-clear visuals.',
    defaultOn: true,
  },
  {
    id: 'gpu',
    label: 'Hardware Acceleration',
    description: 'Utilize GPU for fluid page transitions.',
    defaultOn: false,
  },
  {
    id: 'prefetch',
    label: 'Adaptive Content Prefetch',
    description: 'Anticipate your next read for zero latency.',
    defaultOn: true,
  },
];

const PREFETCH_OPTIONS: { value: PrefetchBehavior; label: string; description: string }[] = [
  { value: 'wifi-only', label: 'WiFi only', description: 'Prefetch only when on unmetered connections' },
  { value: 'always', label: 'Always', description: 'Prefetch on any network (may use mobile data)' },
  { value: 'never', label: 'Never', description: 'Disable all prefetching' },
];

export default function PerformanceEngine() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.id, t.defaultOn]))
  );
  const [prefetchBehavior, setPrefetchBehavior] = useState<PrefetchBehavior>('wifi-only');

  function toggle(id: string) {
    setStates((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <span className={styles.panelSub}>RENDER PIPELINE & ASSET QUALITY</span>
        </div>
      </div>

      {/* Toggle rows */}
      <div className={styles.toggleList}>
        {TOGGLES.map((t) => (
          <div key={t.id} className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={`${styles.toggleLabel} ${!states[t.id] ? styles.toggleLabelOff : ''}`}>
                {t.label}
              </span>
              <span className={styles.toggleDesc}>{t.description}</span>
            </div>
            <button
              className={`${styles.switch} ${states[t.id] ? styles.switchOn : styles.switchOff}`}
              onClick={() => toggle(t.id)}
              role="switch"
              aria-checked={states[t.id]}
              aria-label={t.label}
            >
              <span className={`${styles.thumb} ${states[t.id] ? styles.thumbOn : styles.thumbOff}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Prefetch Behaviour Section */}
      <div className={styles.prefetchSection}>
        <div className={styles.prefetchHeader}>
          <span className={styles.prefetchLabel}>Prefetch Behaviour</span>
          <span className={styles.prefetchHint}>Data saving & performance</span>
        </div>
        <div className={styles.prefetchOptions}>
          {PREFETCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.prefetchBtn} ${prefetchBehavior === option.value ? styles.prefetchBtnActive : ''}`}
              onClick={() => setPrefetchBehavior(option.value)}
              aria-pressed={prefetchBehavior === option.value}
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