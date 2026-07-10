// lib/useSyncStatus.ts
//
// Shared real network/sync state for chrome that isn't the dedicated
// OfflineIndicator banner (Navbar's status pill, Sidebar's profile status).
// Pulls from the same offlineDB sync queue so all three stay consistent.
'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPendingSyncCount, replayPendingSyncActions } from './offlineDB';

export function useSyncStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(() => {
    getPendingSyncCount().then(setPending);
  }, []);

  useEffect(() => {
    refreshPending();

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('readlite:db-changed', refreshPending);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('readlite:db-changed', refreshPending);
    };
  }, [refreshPending]);

  const sync = useCallback(async () => {
    setSyncing(true);
    await replayPendingSyncActions();
    await refreshPending();
    setSyncing(false);
  }, [refreshPending]);

  return { online, pending, syncing, sync };
}
