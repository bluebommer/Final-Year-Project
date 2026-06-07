import dynamic from 'next/dynamic';
import styles from '../Components/SettingsComponents/styles/Settings.module.css';

import Personalization from '../../components/Settings/Personalization/Personalization';
import SettingsFooter from '../../components/Settings/SettingsFooter/SettingsFooter';
const PerformanceEngine = dynamic(() => import('../Components/SettingsComponents/Performanceengine'));
const AestheticMode = dynamic(() => import('../Components/SettingsComponents/Aestheticmode'));
const SettingsHero = dynamic(() => import('../Components/SettingsComponents/Settingshero'));
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));

export default function SettingsPage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
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