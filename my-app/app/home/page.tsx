import dynamic from 'next/dynamic';
const Navbar = dynamic(() => import('../HomeComponents/Navbar'));
import styles from '../HomeComponents/styles/Home.module.css';
const Sidebar = dynamic(() => import('../HomeComponents/SideBar'));
const ArticleGrid = dynamic(() => import('../HomeComponents/ArticleGrid'));
const CategoryTabs = dynamic(() => import('../HomeComponents/Categorytabs'));
const HeroBanner = dynamic(() => import('../HomeComponents/Herobanner'));


export default function HomePage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
          <HeroBanner />
          <CategoryTabs />
          <ArticleGrid/>
        </main>
      </div>
    </div>
  );
}