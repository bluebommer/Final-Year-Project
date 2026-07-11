'use client';
import dynamic from 'next/dynamic';


import styles from '../Components/SettingsComponents/styles/Settings.module.css';

// Existing components
import SettingsHero from '../Components/SettingsComponents/Settingshero';
import AestheticMode from '../Components/SettingsComponents/Aestheticmode';
import PerformanceEngine from '../Components/SettingsComponents/Performanceengine';
import AppShell from '../Components/HomeComponents/AppShell';

// New / modified components
import Personalization from '../Components/SettingsComponents/Personalization';
import SettingsFooter from '../Components/SettingsComponents/SettingsFooter';
const CacheStorage = dynamic(() => import('../Components/Management Components/Cachestorage'));
const SourceManager = dynamic(() => import('../Components/Management Components/Sourcemanager'));

export default function SettingsPage() {
  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
        <SettingsHero />
        <AestheticMode />

        {/* Performance + Personalization */}
        <div className={styles.twoCol}>
          <PerformanceEngine />
          <Personalization />
        </div>

        {/* Cache & Source Management */}
        <div className={styles.twoColCards}>
          <CacheStorage />
          <SourceManager />
        </div>

        <SettingsFooter />
      </main>
    </AppShell>
  );
}
