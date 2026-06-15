'use client';
import dynamic from 'next/dynamic';
// app/reading-history-demo/page.tsx




const ContinueReading = dynamic(() => import('../Components/HistoryComponents/ContinueReading'));
import styles from '../Components/HomeComponents/styles/Home.module.css';
import { ReadingHistoryProvider, useReadingHistory } from '../Components/HistoryComponents/ReadingHistoryProvider';
const Sidebar = dynamic(() => import('../Components/HomeComponents/SideBar'));
const Navbar = dynamic(() => import('../Components/HomeComponents/Navbar'));
const ReadArticleCard = dynamic(() => import('../Components/HistoryComponents/ReadArticleCard'));

const DEMO_ARTICLES = [
  { id: '1', title: 'The Silicon Mind: Ethics of Synthetic Cognition', category: 'TECHNOLOGY', readTime: '8 min read', author: 'Dr. Mira Chen', authorInitial: 'M', authorColor: '#22d3ee' },
  { id: '2', title: 'Quantum Entanglement Breaks Distance Record', category: 'SCIENCE', readTime: '5 min read', author: 'Elena Voss', authorInitial: 'E', authorColor: '#a78bfa' },
  { id: '3', title: 'The Language of Invisible Interfaces', category: 'DESIGN', readTime: '6 min read', author: 'Kai Tanaka', authorInitial: 'K', authorColor: '#f97316' },
  { id: '4', title: 'Mars One: The Realities of Interplanetary Colonization', category: 'FUTURE', readTime: '22 min read', author: 'Omar Al-Rashid', authorInitial: 'O', authorColor: '#fb7185' },
  { id: '5', title: 'The Subtle Art of Perceptual Fluidity', category: 'PSYCHOLOGY', readTime: '15 min read', author: 'Saoirse Brennan', authorInitial: 'S', authorColor: '#fbbf24' },
];

function DemoContent() {
  const { isRead, markAsRead } = useReadingHistory();

  return (
    <>
      <ContinueReading />
      <div style={{ padding: '0 48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#f8fafc' }}>All Articles (click to mark as read)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {DEMO_ARTICLES.map(article => (
            <ReadArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              category={article.category}
              readTime={article.readTime}
              author={article.author}
              authorInitial={article.authorInitial}
              authorColor={article.authorColor}
              isRead={isRead(article.id)}
              onRead={markAsRead}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function ReadingHistoryDemo() {
  return (
    <ReadingHistoryProvider>
      <div className={styles.pageRoot}>
        <Navbar />
        <div className={styles.pageBody}>
          <Sidebar />
          <main className={styles.mainContent}>
            <DemoContent />
          </main>
        </div>
      </div>
    </ReadingHistoryProvider>
  );
}