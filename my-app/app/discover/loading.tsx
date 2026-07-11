import AppShell from '../Components/HomeComponents/AppShell';
import SkeletonArticleGrid from '../Components/SkeletonComponents/SkeletonArticleGrid';
import styles from '../Components/DiscoverComponents/styles/Discover.module.css';

export default function DiscoverLoading() {
  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
        <div className={styles.sectionInner}>
          <SkeletonArticleGrid />
        </div>
      </main>
    </AppShell>
  );
}
