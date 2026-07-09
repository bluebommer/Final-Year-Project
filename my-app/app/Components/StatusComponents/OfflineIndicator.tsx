// Components/StatusComponents/OfflineIndicator.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles/OfflineIndicator.module.css';
import { getPendingSyncCount, replayPendingSyncActions } from '@/lib/offlineDB';

type ConnectionStatus = 'online' | 'offline' | 'syncing';

// Background Sync API is Chrome/Edge-only — this periodic retry (plus the
// `online` event handler below) is the cross-browser substitute for
// replaying queued service-worker commands.
const RETRY_INTERVAL_MS = 45000;

export default function OfflineIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [pending, setPending] = useState(0);
  const pendingRef = useRef(0);

  const refreshPending = useCallback(async () => {
    const count = await getPendingSyncCount();
    pendingRef.current = count;
    setPending(count);
  }, []);

  const sync = useCallback(async () => {
    setStatus('syncing');
    await replayPendingSyncActions();
    await refreshPending();
    setStatus(navigator.onLine ? 'online' : 'offline');
  }, [refreshPending]);

  useEffect(() => {
    setStatus(navigator.onLine ? 'online' : 'offline');
    refreshPending();

    const handleOnline = () => { sync(); };
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('readlite:db-changed', refreshPending);

    const interval = setInterval(() => {
      if (navigator.onLine && pendingRef.current > 0) sync();
    }, RETRY_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('readlite:db-changed', refreshPending);
      clearInterval(interval);
    };
  }, [refreshPending, sync]);

  if (status === 'online' && pending === 0) {
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
    </div>
  );
}
