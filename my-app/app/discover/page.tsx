import dynamic from 'next/dynamic';

import styles from '../Components/DiscoverComponents/styles/Discover.module.css';
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));
const RisingWriters = dynamic(() => import('../Components/DiscoverComponents/Risingwriters'));
const EditorsPicks = dynamic(() => import('../Components/DiscoverComponents/Editorspicks'));
const CategoryGrid = dynamic(() => import('../Components/DiscoverComponents/Categorygrid'));
const Collections = dynamic(() => import('../Components/DiscoverComponents/Collections'));
const TrendingNow = dynamic(() => import('../Components/DiscoverComponents/Trendingnow'));
const SearchHero = dynamic(() => import('../Components/DiscoverComponents/Searchhero'));

export default function DiscoverPage() {
  return (
    <div className={styles.pageRoot}>
      <Navbar />
      <div className={styles.pageBody}>
        <Sidebar />
        <main className={styles.mainContent}>
          <SearchHero/>
          <TrendingNow />
          <Collections />
          <CategoryGrid />
          <EditorsPicks />
          <RisingWriters/>
        </main>
      </div>
    </div>
  );
}