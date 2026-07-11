import dynamic from 'next/dynamic';
import type { Article } from '../types/article';
import styles from '../Components/DiscoverComponents/styles/Discover.module.css';
import AppShell from '../Components/HomeComponents/AppShell';
const DiscoverContent = dynamic(() => import('../Components/DiscoverComponents/DiscoverContent'));

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return [];
  }
}

export default async function DiscoverPage() {
  const articles = await getArticles();

  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
        <DiscoverContent articles={articles} />
      </main>
    </AppShell>
  );
}
