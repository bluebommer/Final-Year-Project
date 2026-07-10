// Components/RootComponents/LegalLayout.tsx
import Link from 'next/link';
import styles from './styles/Legal.module.css';

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href="/" className={styles.back}>← Back</Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated: {updated}</p>
        <div className={styles.body}>{children}</div>
      </div>
    </main>
  );
}
