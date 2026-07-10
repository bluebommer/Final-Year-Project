// Components/HomeComponents/Categorytabs.tsx
'use client';

import styles from './styles/CategoryTabs.module.css';

interface CategoryTabsProps {
  categories: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function CategoryTabs({ categories, activeTab, onTabChange }: CategoryTabsProps) {
  const tabs = ['FOR YOU', ...categories];
  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
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
