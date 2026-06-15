'use client';

import { useState } from 'react';
import styles from './styles/Readingcontrols.module.css';

interface ReadingPrefs {
  fontSize: number;
  lineHeight: number;
  theme: 'obsidian' | 'crystal';
  fontFamily: 'sans' | 'serif' | 'mono';
}

const FONT_FAMILIES = [
  { id: 'sans',  label: 'Sans',  sample: 'Aa' },
  { id: 'serif', label: 'Serif', sample: 'Aa' },
  { id: 'mono',  label: 'Mono',  sample: 'Aa' },
] as const;

export default function ReadingControls() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<ReadingPrefs>({
    fontSize: 16,
    lineHeight: 1.7,
    theme: 'obsidian',
    fontFamily: 'sans',
  });

  function setFontSize(delta: number) {
    setPrefs((p) => ({ ...p, fontSize: Math.min(24, Math.max(12, p.fontSize + delta)) }));
  }

  function setLineHeight(delta: number) {
    setPrefs((p) => ({
      ...p,
      lineHeight: Math.min(2.4, Math.max(1.2, parseFloat((p.lineHeight + delta).toFixed(1)))),
    }));
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Reading controls"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3"/>
          <path d="M9 20h6"/>
          <path d="M12 4v16"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Reading preferences">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Reading Controls</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Font size */}
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Font Size</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setFontSize(-1)}
                disabled={prefs.fontSize <= 12}
                aria-label="Decrease font size"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span className={styles.stepValue}>{prefs.fontSize}px</span>
              <button
                className={styles.stepBtn}
                onClick={() => setFontSize(1)}
                disabled={prefs.fontSize >= 24}
                aria-label="Increase font size"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Font size visual bar */}
          <div className={styles.sizeBar}>
            <div
              className={styles.sizeFill}
              style={{ width: `${((prefs.fontSize - 12) / 12) * 100}%` }}
            />
          </div>

          {/* Line height */}
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Line Height</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setLineHeight(-0.1)}
                disabled={prefs.lineHeight <= 1.2}
                aria-label="Decrease line height"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span className={styles.stepValue}>{prefs.lineHeight.toFixed(1)}</span>
              <button
                className={styles.stepBtn}
                onClick={() => setLineHeight(0.1)}
                disabled={prefs.lineHeight >= 2.4}
                aria-label="Increase line height"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Font family */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Typeface</span>
            <div className={styles.fontButtons}>
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.id}
                  className={`${styles.fontBtn} ${prefs.fontFamily === f.id ? styles.fontBtnActive : ''}`}
                  style={{
                    fontFamily: f.id === 'serif' ? 'Georgia, serif' : f.id === 'mono' ? 'monospace' : 'inherit',
                  }}
                  onClick={() => setPrefs((p) => ({ ...p, fontFamily: f.id }))}
                >
                  <span className={styles.fontSample}>{f.sample}</span>
                  <span className={styles.fontLabel}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Theme</span>
            <div className={styles.themeButtons}>
              <button
                className={`${styles.themeBtn} ${styles.themeBtnLight} ${prefs.theme === 'crystal' ? styles.themeBtnActive : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, theme: 'crystal' }))}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                Light
              </button>
              <button
                className={`${styles.themeBtn} ${styles.themeBtnDark} ${prefs.theme === 'obsidian' ? styles.themeBtnActive : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, theme: 'obsidian' }))}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Dark
              </button>
            </div>
          </div>

          {/* Preview */}
          <div
            className={styles.preview}
            style={{
              fontSize: `${prefs.fontSize}px`,
              lineHeight: prefs.lineHeight,
              fontFamily: prefs.fontFamily === 'serif' ? 'Georgia, serif' : prefs.fontFamily === 'mono' ? 'monospace' : 'inherit',
            }}
          >
            The quick brown fox jumps over the lazy dog. Reading is thinking.
          </div>
        </div>
      )}
    </>
  );
}