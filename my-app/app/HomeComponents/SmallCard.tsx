import { Article } from '../types/article';
import styles from './styles/ Smallcard.module.css';


interface Props {
  article: Article;
}

export default function SmallCard({ article }: Props) {
  return (
    <article className={styles.smallCard}>
      <span className={styles.category}>{article.category}</span>
      <h3 className={styles.cardTitle}>{article.title}</h3>
      {article.description && (
        <p className={styles.description}>{article.description}</p>
      )}
      <div className={styles.cardFooter}>
        <span
          className={styles.authorDot}
          style={{ background: article.authorColor }}
        />
        <span className={styles.readTime}>{article.readTime}</span>
      </div>
    </article>
  );
}