import styles from './styles/HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <div className={styles.heroBanner}>
      {/* Background image layer */}
      <div className={styles.heroBg} />

      {/* Overlay gradients */}
      <div className={styles.heroOverlay} />

      {/* Content */}
      <div className={styles.heroContent}>
        <span className={styles.heroBadge}>TECHNOLOGY • 8 MIN READ</span>
        <h1 className={styles.heroTitle}>
          The Silicon Mind:<br />
          Ethics of Synthetic<br />
          Cognition
        </h1>
        <p className={styles.heroDescription}>
          Exploring the blurred lines between programmed response and genuine consciousness in the next generation of AI.
        </p>
        <button className={styles.readNowBtn}>
          READ NOW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}