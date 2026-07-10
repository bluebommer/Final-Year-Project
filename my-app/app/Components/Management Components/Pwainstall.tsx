'use client';

import { useEffect, useState } from 'react';
import styles from './styles/Pwainstall.module.css';

const INSTALLED_FLAG = 'readLite_pwaInstalled';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Module-level (not React state) — the event can fire before this component
// ever mounts, and Pwainstall is a leaf component with no shared provider
// tree to stash it in otherwise.
let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export default function PWAInstall() {
  const [dismissed, setDismissed] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(INSTALLED_FLAG) === '1') {
      setInstalled(true);
      return;
    }
    // Only show the banner once a real install prompt is actually available.
    if (deferredPrompt) setDismissed(false);
    const handlePrompt = () => setDismissed(false);
    const handleInstalled = () => {
      localStorage.setItem(INSTALLED_FLAG, '1');
      setInstalled(true);
      deferredPrompt = null;
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (dismissed && !installed) return null;
  if (installed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') {
        setInstalled(true);
        localStorage.setItem(INSTALLED_FLAG, '1');
      } else {
        setDismissed(true);
      }
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className={styles.banner}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <span className={styles.title}>Install ReadLite</span>
        <button
          className={styles.dismissBtn}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <p className={styles.subtitle}>Read offline, get faster loads, and a native app experience.</p>

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
    </div>
  );
}
