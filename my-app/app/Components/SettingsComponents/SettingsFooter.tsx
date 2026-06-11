// Components/SettingsComponents/SettingsFooter.tsx
'use client';

import styles from './styles/SettingsFooter.module.css';

export default function SettingsFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.version}>
        <span className={styles.dot} />
        <span className={styles.versionText}>
          VERSION 2.4.0 — OBSIDIAN ENGINE ACTIVE
        </span>
      </div>
      <div className={styles.links}>
        <a href="#" className={styles.link}>
          PRIVACY PROTOCOL
        </a>
        <a href="#" className={styles.link}>
          LEGAL FRAMEWORK
        </a>
      </div>
    </footer>
  );
}