// Components/SettingsComponents/SettingsSidebar.tsx
'use client';

import styles from './styles/SettingsSidebar.module.css';

export default function SettingsSidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sideNav}>
        <ul className={styles.sideNavList}>
          <li className={styles.sideNavItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>HOME</span>
          </li>
          <li className={styles.sideNavItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            <span>LIBRARY</span>
          </li>
          <li className={styles.sideNavItemActive}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93l-1.41 1.41M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M12 20v2M12 2v2" />
            </svg>
            <span>SETTINGS</span>
          </li>
        </ul>
      </nav>

      <div className={styles.userProfileBottom}>
        <div className={styles.userIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userLabel}>USER PROFILE</span>
          <div className={styles.syncStatus}>
            <span className={styles.syncDot} />
            <span>Sync Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}