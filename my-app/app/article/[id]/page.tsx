// app/article/[id]/page.tsx
import type { Metadata } from 'next';
import type { Article } from '@/app/types/article';
import ArticleGate from '@/app/Components/ArticleComponents/ArticleGate';

async function getArticle(id: string): Promise<Article | null> {
  if (!id) return null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    // ✅ Use /api/article/[id] — this is where scraping happens
    const res = await fetch(
      `${baseUrl}/api/article/${encodeURIComponent(id)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed: ${res.status}`);
    }
    const data = await res.json();
    return data.article || null;
  } catch (error) {
    // ✅ Fallback — fetch all articles and find locally if /api/article/[id] fails
    console.error('Article route failed, falling back:', error);
    try {
      const res = await fetch(`${baseUrl}/api/articles`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const data = await res.json();
      const articles = (data.articles as Article[]) ?? [];
      return articles.find(a => a.id === decodeURIComponent(id)) ?? null;
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  return <ArticleGate id={decodeURIComponent(id)} article={article} />;
}