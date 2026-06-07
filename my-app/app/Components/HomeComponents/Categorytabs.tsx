'use client';
import { useState } from 'react';
import styles from './styles/CategoryTabs.module.css';

const TABS = ['FOR YOU', 'DESIGN', 'ARCHITECTURE', 'SCIENCE', 'BUSINESS', 'CULTURE'];

export default function CategoryTabs() {
  const [active, setActive] = useState('FOR YOU');

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={active === tab ? styles.tabActive : styles.tab}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}