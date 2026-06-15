// Components/HomeComponents/SkeletonSmallCard.tsx
'use client';

import styles from './styles/SkeletonSmallCard.module.css';

export default function SkeletonSmallCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.line} ${styles.lineSmall}`} />
      <div className={`${styles.line} ${styles.lineMedium}`} />
      <div className={`${styles.line} ${styles.lineLong}`} />
      <div className={styles.footer}>
        <div className={styles.dotSkeleton} />
        <div className={`${styles.line} ${styles.lineTiny}`} />
      </div>
    </div>
  );
}