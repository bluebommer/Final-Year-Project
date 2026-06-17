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
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const CacheStorage = dynamic(() => import('../Components/Management Components/Cachestorage'));
const SourceManager = dynamic(() => import('../Components/Management Components/Sourcemanager'));

// Management components
// import CacheStorage from '../Components/ManagementComponents/Cachestorage';
// import SourceManager from '../Components/ManagementComponents/Sourcemanager';

export default function SettingsPage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
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
      </div>
    </div>
  );
}