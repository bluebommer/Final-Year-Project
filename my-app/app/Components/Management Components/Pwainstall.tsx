'use client';

import { useState } from 'react';
import styles from './styles/Pwainstall.module.css';

export default function PWAInstall() {
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  if (dismissed) return null;

  function handleInstall() {
    setInstalling(true);
    // In production: deferredPrompt.prompt() fires here
    setTimeout(() => {
      setInstalling(false);
      setInstalled(true);
      setTimeout(() => setDismissed(true), 2000);
    }, 1200);
  }

  return (
    <div className={`${styles.banner} ${installed ? styles.bannerSuccess : ''}`}>
      {/* Icon */}
      <div className={styles.iconWrap}>
        {installed ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        )}
      </div>

      {/* Text */}
      <div className={styles.text}>
        <span className={styles.title}>
          {installed ? 'ReadLite installed!' : 'Install ReadLite on your device'}
        </span>
        <span className={styles.subtitle}>
          {installed
            ? 'Find it on your home screen or app launcher.'
            : 'Read offline, get faster loads, and a native app experience.'}
        </span>
      </div>

      {/* Actions */}
      {!installed && (
        <button
          className={styles.installBtn}
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? (
            <><span className={styles.spinner} />Installing…</>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Install
            </>
          )}
        </button>
      )}

      {/* Dismiss */}
      {!installed && (
        <button
          className={styles.dismissBtn}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}