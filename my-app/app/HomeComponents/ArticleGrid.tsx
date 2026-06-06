import dynamic from 'next/dynamic';
import styles from './styles/ArticleGrid.module.css';
import FeaturedCard from './FeaturedCard';

import SideCard from './SideCard';
import { Article } from '../types/article';
const SmallCard = dynamic(() => import('./SmallCard'));

const featuredArticle: Article = {
  id: '1',
  category: 'NEW RELEASE',
  title: 'Post-Digital Aesthetics: The Rise of Liquid Minimalism',
  readTime: '12 MIN READ',
  isStaffPick: true,
  imageType: 'abstract3d',
};

const sideArticle: Article = {
  id: '2',
  category: 'NATURE',
  title: 'The Quiet Revolution of Bio-Regenerative Design',
  description: 'How architects are using living mycelium and algae to create buildings that breathe and clea...',
  readTime: '',
  imageType: 'landscape',
};

const smallArticles: Article[] = [
  {
    id: '3',
    category: 'PRODUCTIVITY',
    title: 'Deep Work in the Age of Constant Interruption',
    description: 'Practical strategies for reclaiming your focus and...',
    readTime: '5 MIN READ',
    authorColor: '#3B82F6',
  },
  {
    id: '4',
    category: 'PSYCHOLOGY',
    title: 'The Subtle Art of Perceptual Fluidity',
    description: 'Understanding how our brains construct reality through the...',
    readTime: '15 MIN READ',
    authorColor: '#EF4444',
  },
  {
    id: '5',
    category: 'FUTURE',
    title: 'Mars One: The Realities of Interplanetary Colonization',
    description: 'A technical deep dive into the life support systems required f...',
    readTime: '22 MIN READ',
    authorColor: '#8B5CF6',
  },
];

export default function ArticleGrid() {
  return (
    <div className={styles.grid}>
      {/* Top row: Featured (large) + Side card */}
      <div className={styles.topRow}>
        <FeaturedCard article={featuredArticle} />
        <SideCard article={sideArticle} />
      </div>

      {/* Bottom row: 3 small cards */}
      <div className={styles.bottomRow}>
        {smallArticles.map((article) => (
          <SmallCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}