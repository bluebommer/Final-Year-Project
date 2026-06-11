// app/settings/page.tsx
'use client';

import dynamic from 'next/dynamic';
import styles from '../Components/SettingsComponents/styles/Settings.module.css';

// Existing components
import SettingsHero from '../Components/SettingsComponents/Settingshero';
import AestheticMode from '../Components/SettingsComponents/Aestheticmode';
import PerformanceEngine from '../Components/SettingsComponents/Performanceengine';
import Navbar from '../Components/HomeComponents/Navbar';

// New / modified components
import SettingsSidebar from '../Components/SettingsComponents/SettingsSidebar';
import Personalization from '../Components/SettingsComponents/Personalization';
import SettingsFooter from '../Components/SettingsComponents/SettingsFooter';

export default function SettingsPage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <SettingsSidebar />
        <main className={styles.mainContent}>
          <SettingsHero />
          <AestheticMode />
          <div className={styles.twoCol}>
            <PerformanceEngine />
            <Personalization />
          </div>
          <SettingsFooter />
        </main>
      </div>
    </div>
  );
}