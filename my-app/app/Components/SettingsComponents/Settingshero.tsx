import styles from './styles/SettingsHero.module.css';

export default function SettingsHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>CONFIGURATION</span>
        <h1 className={styles.title}>Deep Obsidian</h1>
        <p className={styles.subtitle}>
          Customize your reading environment with precision. Tailor the optical clarity,
          tonal depth, and personalized content delivery.
        </p>
      </div>
    </div>
  );
}