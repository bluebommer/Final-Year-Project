import AppShell from '../Components/HomeComponents/AppShell';
import SkeletonArticleGrid from '../Components/SkeletonComponents/SkeletonArticleGrid';
import styles from '../Components/HomeComponents/styles/Home.module.css';

export default function HomeLoading() {
  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
        <SkeletonArticleGrid />
      </main>
    </AppShell>
  );
}
