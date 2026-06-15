// Components/HomeComponents/SkeletonFeaturedCard.tsx
'use client';

import styles from './styles/SkeletonFeaturedCard.module.css';

export default function SkeletonFeaturedCard() {
  return (
    <div className={styles.featuredCard}>
      <div className={styles.cardImage}>
        <div className={styles.shimmer} />
      </div>
      <div className={styles.cardContent}>
        <div className={`${styles.line} ${styles.lineSmall}`} />
        <div className={`${styles.line} ${styles.lineMedium}`} />
        <div className={styles.cardMeta}>
          <div className={`${styles.line} ${styles.lineTiny}`} />
          <div className={`${styles.line} ${styles.lineTiny}`} />
        </div>
      </div>
    </div>
  );
}