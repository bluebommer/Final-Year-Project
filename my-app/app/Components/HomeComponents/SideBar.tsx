import styles from './styles/Sidebar.module.css';
import PWAInstall from '../Management Components/Pwainstall';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Profile */}
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>PREMIUM READER</span>
          <span className={styles.profileStatus}>SYNC ACTIVE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.sideNav}>
        <ul className={styles.sideNavList}>
          <li className={styles.sideNavItemActive}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            HOME
          </li>
          <li className={styles.sideNavItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
            LIBRARY
          </li>
          <li className={styles.sideNavItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            DISCOVER
          </li>
          <li className={styles.sideNavItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93l-1.41 1.41M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M12 20v2M12 2v2"/>
            </svg>
            SETTINGS
          </li>
        </ul>
      </nav>

      {/* PWA Install Banner */}
      <PWAInstall />

      {/* Reading Streak */}
      <div className={styles.streakCard}>
        <span className={styles.streakLabel}>READING STREAK</span>
        <span className={styles.streakValue}>12 Days</span>
        <div className={styles.streakBar}>
          <div className={styles.streakFill} />
        </div>
      </div>
    </aside>
  );
}