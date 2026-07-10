// Components/HomeComponents/SideBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './styles/Sidebar.module.css';
import PWAInstall from '../Management Components/Pwainstall';
import { useSyncStatus } from '@/lib/useSyncStatus';
import { getReadingStreakDays } from '@/lib/offlineDB';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { online, pending, syncing } = useSyncStatus();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    function load() {
      getReadingStreakDays().then(setStreak);
    }
    load();
    window.addEventListener('readlite:db-changed', load);
    return () => window.removeEventListener('readlite:db-changed', load);
  }, []);

  // If the viewport grows into desktop range while the drawer is open
  // (e.g. rotating a tablet), close it so it doesn't get stuck open.
  useEffect(() => {
    if (!onClose) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const handle = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    handle(mq);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const statusLabel = syncing ? 'Syncing…' : !online ? 'Offline' : pending > 0 ? `${pending} pending` : 'Synced';

  const navItems = [
    { name: 'HOME', href: '/home', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { name: 'LIBRARY', href: '/library', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    )},
    { name: 'DISCOVER', href: '/discover', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    )},
    { name: 'HISTORY', href: '/history', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12 7 12 12 15.5 14"/>
      </svg>
    )},
    { name: 'SETTINGS', href: '/setting', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M12 20v2M12 2v2"/>
      </svg>
    )},
  ];

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <path d="M12 18h.01"/>
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>READER</span>
            <span className={styles.profileStatus}>{statusLabel}</span>
          </div>
        </div>
        <nav className={styles.sideNav}>
          <ul className={styles.sideNavList}>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? styles.sideNavItemActive : styles.sideNavItem}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <PWAInstall />
        <div className={styles.streakCard}>
          <span className={styles.streakLabel}>READING STREAK</span>
          <span className={styles.streakValue}>{streak === 0 ? 'Start today' : `${streak} Day${streak === 1 ? '' : 's'}`}</span>
          <div className={styles.streakBar}>
            <div className={styles.streakFill} style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} />
          </div>
        </div>
      </aside>
    </>
  );
}