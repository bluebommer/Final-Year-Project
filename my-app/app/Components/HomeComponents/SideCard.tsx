import { Article } from '../types/article';
import styles from './styles/SideCard.module.css';


interface Props {
  article: Article;
}

export default function SideCard({ article }: Props) {
  return (
    <article className={styles.sideCard}>
      {/* Landscape image */}
      <div className={styles.cardImage}>
        <div className={styles.landscapeVisual} />
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <span className={styles.category}>{article.category}</span>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        {article.description && (
          <p className={styles.description}>{article.description}</p>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.author}>BY ELENA VOSS</span>
          <button className={styles.bookmarkBtn} aria-label="Bookmark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}