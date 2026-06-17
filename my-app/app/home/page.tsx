// app/home/page.tsx
import { Article } from '../types/article';
import Navbar from '../Components/HomeComponents/Navbar';
import Sidebar from '../Components/HomeComponents/SideBar';
import HomeContent from '../Components/HomeComponents/HomeContent';
import styles from '../Components/HomeComponents/styles/Home.module.css';

async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('Failed to fetch articles');
    return [];
  }
  const data = await res.json();
  return data.articles || [];
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
          <HomeContent articles={articles} />
        </main>
      </div>
    </div>
  );
}