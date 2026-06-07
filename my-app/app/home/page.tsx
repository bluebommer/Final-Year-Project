import dynamic from 'next/dynamic';

import styles from '../Components/HomeComponents/styles/Home.module.css';
const ArticleGrid = dynamic(() => import('../Components/HomeComponents/ArticleGrid'));
const CategoryTabs = dynamic(() => import('../Components/HomeComponents/Categorytabs'));
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const HeroBanner = dynamic(() => import('../Components/HomeComponents/Herobanner'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));


export default function HomePage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar
         />
        <main className={styles.mainContent}>
          <HeroBanner />
          <CategoryTabs />
          <ArticleGrid/>
        </main>
      </div>
    </div>
  );
}