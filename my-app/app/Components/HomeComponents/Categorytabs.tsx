// Components/HomeComponents/Categorytabs.tsx
'use client';

import styles from './styles/CategoryTabs.module.css';

const TABS = ['FOR YOU', 'DESIGN', 'ARCHITECTURE', 'SCIENCE', 'BUSINESS', 'CULTURE'];

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}