// Components/HomeComponents/SkeletonArticleGrid.tsx
'use client';

import styles from './styles/SkeletonArticleGrid.module.css';
import SkeletonFeaturedCard from './SkeletonFeaturedCard';
import SkeletonSideCard from './SkeletonSideCard';
import SkeletonSmallCard from './SkeletonSmallCard';

export default function SkeletonArticleGrid() {
  return (
    <div className={styles.grid}>
      <div className={styles.topRow}>
        <SkeletonFeaturedCard />
        <SkeletonSideCard />
      </div>
      <div className={styles.bottomRow}>
        <SkeletonSmallCard />
        <SkeletonSmallCard />
        <SkeletonSmallCard />
      </div>
    </div>
  );
}