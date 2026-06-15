// Components/HomeComponents/SkeletonSideCard.tsx
'use client';

import styles from './styles/SkeletonSideCard.module.css';

export default function SkeletonSideCard() {
  return (
    <div className={styles.sideCard}>
      <div className={styles.cardImage}>
        <div className={styles.shimmer} />
      </div>
      <div className={styles.cardContent}>
        <div className={`${styles.line} ${styles.lineSmall}`} />
        <div className={`${styles.line} ${styles.lineMedium}`} />
        <div className={styles.cardFooter}>
          <div className={`${styles.line} ${styles.lineTiny}`} />
          <div className={styles.bookmarkSkeleton} />
        </div>
      </div>
    </div>
  );
}