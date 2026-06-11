// app/article/[id]/page.tsx
import ArticleReader from '../../Components/ArticleComponents/ArticleReader';

// This page will eventually fetch data based on id, but for UI/UX we use static demo content.
export default function ArticlePage() {
  return <ArticleReader />;
}