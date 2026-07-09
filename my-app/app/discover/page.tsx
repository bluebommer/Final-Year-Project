import dynamic from 'next/dynamic';
import type { Article } from '../types/article';
import styles from '../Components/DiscoverComponents/styles/Discover.module.css';
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));
const DiscoverContent = dynamic(() => import('../Components/DiscoverComponents/DiscoverContent'));

async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

export default async function DiscoverPage() {
  const articles = await getArticles();

  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
          <DiscoverContent articles={articles} />
        </main>
      </div>
    </div>
  );
}
