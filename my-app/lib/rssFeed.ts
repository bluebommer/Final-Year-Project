// lib/rssFeed.ts
//
// Turns any public RSS/Atom feed URL into standardised Article[] via the
// free api.rss2json.com proxy (no API key required). Reused by the Medium
// fetcher in app/api/articles/route.ts and by per-user custom feeds applied
// in app/home/page.tsx — do not hand-roll XML parsing elsewhere.
import type { Article } from '@/app/types/article';
import { hashString, estimateReadTime, getCategory, getAuthorColor, stripHtml } from './articleHelpers';

interface Rss2JsonItem {
  title?: string;
  link?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  pubDate?: string;
}

export async function fetchRssFeedArticles(rssUrl: string, sourceName: string): Promise<Article[]> {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  const res = await fetch(proxyUrl, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

  return (data.items as Rss2JsonItem[])
    .filter((item) => item.title)
    .map((item) => {
      const author = item.author || sourceName;
      const description = stripHtml(item.description || '').slice(0, 200);
      return {
        id: `article-${hashString(item.title + (item.link || ''))}`,
        title: item.title as string,
        description,
        category: getCategory(item.title as string, description),
        readTime: estimateReadTime(item.description || item.title || ''),
        isStaffPick: false,
        isNewRelease: false,
        imageType: 'landscape',
        imageUrl: item.thumbnail || undefined,
        author,
        authorInitial: author[0]?.toUpperCase() || 'F',
        authorColor: getAuthorColor(author),
        publishedAt: item.pubDate || new Date().toISOString(),
        source: sourceName,
        url: item.link || '#',
        content: item.description || '',
      };
    });
}
