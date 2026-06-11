// import { Article } from '../types/article';
import { Article } from '@/app/types/article';
import styles from './styles/Smallcard.module.css';


interface Props {
  article: Article;
}

export default function SmallCard({ article }: Props) {
  return (
    <article className={styles.card}>
      <span className={styles.category}>{article.category}</span>
      <h3 className={styles.title}>{article.title}</h3>
      {article.description && (
        <p className={styles.description}>{article.description}</p>
      )}
      <div className={styles.footer}>
        <span
          className={styles.dot}
          style={{ backgroundColor: article.authorColor }}
        />
        <span className={styles.readTime}>{article.readTime}</span>
      </div>
    </article>
  );
}