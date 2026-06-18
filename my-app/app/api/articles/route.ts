// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';
import { getCachedArticles, setCachedArticles } from '@/lib/articleCache';

// ── Helper: stable hash from string ──────────────────────────
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ── Helper: estimated reading time ────────────────────────────
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── Helper: category ──────────────────────────────────────────
function getCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/ai|machine learning|neural|algorithm|tech|software|code|programming|cyber|data|compute/)) return 'TECHNOLOGY';
  if (text.match(/design|ui|ux|interface|typography|aesthetic|visual|art|minimal/)) return 'DESIGN';
  if (text.match(/science|physics|chemistry|biology|quantum|gene|dna|space|cosmos/)) return 'SCIENCE';
  if (text.match(/psychology|mind|brain|neuroscience|cognition|emotion|behavior|mental/)) return 'PSYCHOLOGY';
  if (text.match(/business|market|economy|finance|startup|invest|venture|stock/)) return 'BUSINESS';
  if (text.match(/culture|society|people|history|art|film|music|literature/)) return 'CULTURE';
  if (text.match(/future|trend|innovation|foresight|next|frontier/)) return 'FUTURE';
  if (text.match(/nature|climate|environment|green|sustainable|eco|wildlife/)) return 'NATURE';
  return 'TECHNOLOGY';
}

// ── Helper: author color ──────────────────────────────────────
function getAuthorColor(name: string): string {
  const colors = ['#22d3ee', '#a78bfa', '#f97316', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#e879f9'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// ── Helper: strip HTML tags ───────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// ── The Guardian API ──────────────────────────────────────────
async function fetchGuardian(): Promise<Article[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) {
    console.warn('GUARDIAN_API_KEY not set');
    return [];
  }
  const url = `https://content.guardianapis.com/search?api-key=${apiKey}&show-fields=bodyText,thumbnail,byline,trailText&page-size=30&order-by=newest`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (data.response?.status !== 'ok') return [];

    return data.response.results
      .filter((item: any) => item.webTitle && item.webUrl)
      .map((item: any) => {
        const bodyText = item.fields?.bodyText || '';
        const trailText = stripHtml(item.fields?.trailText || '');
        const byline = item.fields?.byline || 'The Guardian';
        return {
          id: `article-${hashString(item.id)}`,
          title: item.webTitle,
          description: trailText.slice(0, 200) || '',
          category: getCategory(item.webTitle, trailText),
          readTime: bodyText ? estimateReadTime(bodyText) : '5 min read',
          isStaffPick: false,
          isNewRelease: false,
          imageType: 'landscape',
          imageUrl: item.fields?.thumbnail || null,
          author: byline,
          authorInitial: byline[0].toUpperCase(),
          authorColor: getAuthorColor(byline),
          publishedAt: item.webPublicationDate,
          source: 'The Guardian',
          url: item.webUrl,
          // ✅ Full article — no scraping needed
          content: bodyText
            ? bodyText.split('\n').filter(Boolean).map((p: string) => `<p>${p}</p>`).join('')
            : `<p>${trailText}</p>`,
        };
      });
  } catch (err) {
    console.error('Guardian failed:', err);
    return [];
  }
}

// ── Hacker News (Algolia API) ─────────────────────────────────
async function fetchHackerNews(): Promise<Article[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=30&numericFilters=num_comments>5',
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }
    );
    const data = await res.json();
    if (!data.hits) return [];

    return data.hits
      .filter((item: any) => item.title && item.url)
      .map((item: any) => {
        const storyText = item.story_text
          ? stripHtml(item.story_text)
          : '';
        const author = item.author || 'Hacker News';
        return {
          id: `article-${hashString(item.objectID)}`,
          title: item.title,
          description: storyText.slice(0, 200) || `${item.points || 0} points · ${item.num_comments || 0} comments`,
          category: getCategory(item.title, storyText),
          readTime: storyText ? estimateReadTime(storyText) : '5 min read',
          isStaffPick: (item.points || 0) > 200,
          isNewRelease: false,
          imageType: 'abstract3d',
          imageUrl: null,
          author,
          authorInitial: author[0].toUpperCase(),
          authorColor: getAuthorColor(author),
          publishedAt: item.created_at || new Date().toISOString(),
          source: 'Hacker News',
          url: item.url,
          // HN story_text is the discussion, not the linked article
          // so we provide description + link and let scraper handle the rest
          content: storyText
            ? `<p>${storyText}</p>`
            : '',
        };
      });
  } catch (err) {
    console.error('Hacker News failed:', err);
    return [];
  }
}

// ── Dev.to API ──────────────────────────────────────────────────
async function fetchDevTo(): Promise<Article[]> {
  const apiKey = process.env.DEV_TO_API_KEY;
  const url = 'https://dev.to/api/articles?per_page=30&top=1';
  const headers: HeadersInit = {};
  if (apiKey) headers['api-key'] = apiKey;

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((item: any) => item.title)
      .map((item: any) => {
        const author = item.user?.name || 'Dev.to';
        return {
          id: `article-${hashString(item.title + (item.url || ''))}`,
          title: item.title,
          description: item.description || '',
          category: getCategory(item.title, item.description || ''),
          readTime: `${item.reading_time_minutes || 5} min read`,
          isStaffPick: (item.positive_reactions_count || 0) > 50,
          isNewRelease: false,
          imageType: 'abstract3d',
          imageUrl: item.cover_image || null,
          author,
          authorInitial: author[0].toUpperCase(),
          authorColor: getAuthorColor(author),
          publishedAt: item.published_at || new Date().toISOString(),
          source: 'Dev.to',
          url: item.url || '#',
          // ✅ Full article body — no scraping needed
          content: item.body_html || item.body_markdown || item.description || '',
        };
      });
  } catch (err) {
    console.error('Dev.to failed:', err);
    return [];
  }
}

// ── Medium RSS ──────────────────────────────────────────────────
async function fetchMedium(): Promise<Article[]> {
  const mediumUser = process.env.MEDIUM_USERNAME;
  if (!mediumUser) return [];

  const rssUrl = `https://medium.com/feed/${mediumUser}`;
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(proxyUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (data.status !== 'ok') return [];

    return data.items
      .filter((item: any) => item.title)
      .map((item: any) => {
        const author = item.author || 'Medium';
        const description = stripHtml(item.description || '').slice(0, 200);
        return {
          id: `article-${hashString(item.title + (item.link || ''))}`,
          title: item.title,
          description,
          category: getCategory(item.title, description),
          readTime: estimateReadTime(item.description || item.title),
          isStaffPick: false,
          isNewRelease: false,
          imageType: 'landscape',
          imageUrl: item.thumbnail || null,
          author,
          authorInitial: author[0].toUpperCase(),
          authorColor: getAuthorColor(author),
          publishedAt: item.pubDate || new Date().toISOString(),
          source: 'Medium',
          url: item.link || '#',
          content: item.description || '',
        };
      });
  } catch (err) {
    console.error('Medium RSS failed:', err);
    return [];
  }
}

// ── Fallback mock data ────────────────────────────────────────
function getMockArticles(): Article[] {
  return [
    {
      id: 'article-mock1',
      title: 'The Silicon Mind: Ethics of Synthetic Cognition',
      description: 'Exploring the blurred lines between programmed response and genuine consciousness in the next generation of AI.',
      category: 'TECHNOLOGY',
      readTime: '8 min read',
      isStaffPick: true,
      isNewRelease: true,
      imageType: 'abstract3d',
      imageUrl: null,
      author: 'Dr. Mira Chen',
      authorInitial: 'M',
      authorColor: '#22d3ee',
      publishedAt: new Date().toISOString(),
      source: 'Demo',
      url: '#',
      content: '<p>This is demo content. Add your API keys to <code>.env.local</code> to see real articles.</p>',
    },
  ];
}

// ── Dedupe + sort ─────────────────────────────────────────────
function processArticles(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const deduped = articles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return deduped;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return from cache if fresh
    const cached = getCachedArticles();
    if (cached) {
      return NextResponse.json({ articles: cached });
    }

    // Fetch all sources in parallel
    const results = await Promise.allSettled([
      fetchGuardian(),
      fetchDevTo(),
      fetchHackerNews(),
      fetchMedium(),
    ]);

    let allArticles: Article[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles = allArticles.concat(result.value);
      }
    });

    if (allArticles.length === 0) {
      allArticles = getMockArticles();
    }

    const processed = processArticles(allArticles);
    setCachedArticles(processed);

    return NextResponse.json({ articles: processed });
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return NextResponse.json({ articles: getMockArticles() });
  }
}