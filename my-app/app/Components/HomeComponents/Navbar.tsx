// Components/HomeComponents/Navbar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles/Navbar.module.css';
import { useSyncStatus } from '@/lib/useSyncStatus';
import { getLastSeenTime, markAllSeen } from '@/lib/notifications';
import type { Article } from '@/app/types/article';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { online, pending, syncing, sync } = useSyncStatus();
  const [newArticles, setNewArticles] = useState<Article[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [seen, setSeen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastSeen = getLastSeenTime();
    if (!lastSeen) {
      // First-ever visit — nothing to compare against yet, just set the baseline.
      markAllSeen();
      return;
    }
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        const articles = (data.articles as Article[]) ?? [];
        const fresh = articles.filter((a) => new Date(a.publishedAt).getTime() > lastSeen);
        setNewArticles(fresh);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleNotifications() {
    setShowNotifications((v) => !v);
    if (!seen) {
      markAllSeen();
      setSeen(true);
    }
  }

  const statusLabel = syncing ? 'SYNCING' : !online ? 'OFFLINE' : pending > 0 ? `${pending} PENDING` : 'SYNCED';
  const badgeCount = seen ? 0 : newArticles.length;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link href="/home" className={styles.logo}>
          READLITE
        </Link>
      </div>
      <div className={styles.navRight}>
        <span className={styles.syncStatus}>
          <span className={styles.syncDot} style={!online ? { background: '#f87171', boxShadow: '0 0 6px #f87171' } : undefined} />
          <span className={styles.syncLabel}>{statusLabel}</span>
        </span>
        <button className={styles.iconBtn} onClick={sync} disabled={syncing} aria-label="Sync now">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
        <div className={styles.notifWrapper} ref={panelRef}>
          <button className={styles.iconBtn} onClick={toggleNotifications} aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {badgeCount > 0 && <span className={styles.notifBadge}>{badgeCount > 9 ? '9+' : badgeCount}</span>}
          </button>
          {showNotifications && (
            <div className={styles.notifPanel}>
              <div className={styles.notifHeader}>New since your last visit</div>
              {newArticles.length === 0 ? (
                <p className={styles.notifEmpty}>You&apos;re all caught up.</p>
              ) : (
                newArticles.slice(0, 6).map((a) => (
                  <Link
                    key={a.id}
                    href={`/article/${encodeURIComponent(a.id)}`}
                    className={styles.notifItem}
                    onClick={() => setShowNotifications(false)}
                  >
                    <span className={styles.notifItemCategory}>{a.category}</span>
                    <span className={styles.notifItemTitle}>{a.title}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        <button className={styles.iconBtn} onClick={() => router.push('/discover')} aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
