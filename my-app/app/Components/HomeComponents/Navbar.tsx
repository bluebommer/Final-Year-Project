import styles from './styles/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <span className={styles.logo}>READLITE</span>
        <ul className={styles.navLinks}>
          <li className={styles.navItemActive}>Home</li>
          <li className={styles.navItem}>Library</li>
          <li className={styles.navItem}>Discover</li>
        </ul>
      </div>
      <div className={styles.navRight}>
        <span className={styles.syncStatus}>
          <span className={styles.syncDot} />
          SYNCING
        </span>
        <button className={styles.iconBtn} aria-label="Sync">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
        <button className={styles.iconBtn} aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>
        <button className={styles.iconBtn} aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}