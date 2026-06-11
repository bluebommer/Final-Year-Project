// Components/StatusComponents/OfflineIndicator.tsx
'use client';

import { useState } from 'react';
import styles from './styles/OfflineIndicator.module.css';

type ConnectionStatus = 'online' | 'offline' | 'syncing';
type PendingCount = number;

export default function OfflineIndicator() {
  // Simulated state — replace with real network listener later
const [status, setStatus] = useState<ConnectionStatus>('offline');
const [pending, setPending] = useState<PendingCount>(3);
  // Demo toggle (remove in production)
  const toggleStatus = () => {
    if (status === 'online') setStatus('offline');
    else if (status === 'offline') setStatus('syncing');
    else setStatus('online');
  };

  const simulatePending = () => {
    if (pending === 0) setPending(3);
    else setPending(0);
  };

  if (status === 'online' && pending === 0) {
    // Optionally show nothing, or a small green dot
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Main status banner */}
      <div className={`${styles.banner} ${styles[status]}`}>
        <div className={styles.icon}>
          {status === 'offline' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {status === 'syncing' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          )}
        </div>
        <span className={styles.message}>
          {status === 'offline' && 'You are offline. Some content may be unavailable.'}
          {status === 'syncing' && 'Syncing your changes...'}
        </span>
        {status === 'offline' && (
          <button className={styles.dismiss} aria-label="Dismiss">✕</button>
        )}
      </div>

      {/* Pending items badge (appears when offline and there are pending actions) */}
      {pending > 0 && status === 'offline' && (
        <div className={styles.pendingBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{pending} item{pending !== 1 ? 's' : ''} waiting for connection</span>
        </div>
      )}

      {/* DEMO CONTROLS (remove in production) */}
      <div className={styles.demoControls}>
        <button onClick={toggleStatus} className={styles.demoBtn}>
          Toggle status (online/offline/syncing)
        </button>
        <button onClick={simulatePending} className={styles.demoBtn}>
          {pending === 0 ? 'Simulate pending items' : 'Clear pending'}
        </button>
      </div>
    </div>
  );
}