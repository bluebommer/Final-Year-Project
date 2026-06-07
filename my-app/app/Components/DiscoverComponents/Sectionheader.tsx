import styles from './styles/Sectionheader.module.css';

interface Props {
  label: string;
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function SectionHeader({ label, title, action, onAction }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.label}>{label}</span>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {action && (
        <button className={styles.action} onClick={onAction}>
          {action}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}