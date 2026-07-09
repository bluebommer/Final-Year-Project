// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';
import { getCachedArticles, setCachedArticles } from '@/lib/articleCache';
import { hashString, estimateReadTime, getCategory, getAuthorColor, stripHtml } from '@/lib/articleHelpers';
import { fetchRssFeedArticles } from '@/lib/rssFeed';

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
      'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=30',
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }
    );
    const data = await res.json();
    if (!data.hits) return [];

    return data.hits
      // filtered client-side — Algolia's index no longer accepts num_comments
      // in numericFilters (this used to be a server-side query param)
      .filter((item: any) => item.title && item.url && (item.num_comments || 0) > 5)
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

  try {
    return await fetchRssFeedArticles(`https://medium.com/feed/${mediumUser}`, 'Medium');
  } catch (err) {
    console.error('Medium RSS failed:', err);
    return [];
  }
}

// ── New York Times (Top Stories API) ──────────────────────────
const NYT_SECTIONS = ['technology', 'science'];

async function fetchNytSection(section: string, apiKey: string): Promise<Article[]> {
  const res = await fetch(
    `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${apiKey}`,
    { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
  );
  const data = await res.json();
  if (!Array.isArray(data.results)) return [];

  return data.results
    .filter((item: any) => item.title && item.url)
    .map((item: any) => {
      const byline = (item.byline || 'The New York Times').replace(/^By\s+/i, '');
      const description = item.abstract || '';
      const image = item.multimedia?.[0]?.url;
      return {
        id: `article-${hashString(item.url)}`,
        title: item.title,
        description: description.slice(0, 200),
        category: getCategory(item.title, description),
        readTime: estimateReadTime(description),
        isStaffPick: false,
        isNewRelease: false,
        imageType: 'landscape',
        imageUrl: image || null,
        author: byline,
        authorInitial: byline[0]?.toUpperCase() || 'N',
        authorColor: getAuthorColor(byline),
        publishedAt: item.published_date || new Date().toISOString(),
        source: 'The New York Times',
        url: item.url,
        content: `<p>${description}</p>`,
      };
    });
}

async function fetchNYT(): Promise<Article[]> {
  const apiKey = process.env.NYT_API_KEY;
  if (!apiKey) {
    console.warn('NYT_API_KEY not set');
    return [];
  }
  const results = await Promise.allSettled(NYT_SECTIONS.map((section) => fetchNytSection(section, apiKey)));
  let articles: Article[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      articles = articles.concat(r.value);
    } else {
      console.error(`NYT /${NYT_SECTIONS[i]} failed:`, r.reason);
    }
  });
  return articles;
}

// ── GNews.io ───────────────────────────────────────────────────
async function fetchGNews(): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY not set');
    return [];
  }
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?lang=en&max=25&apikey=${apiKey}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    if (!Array.isArray(data.articles)) return [];

    return data.articles
      .filter((item: any) => item.title && item.url)
      .map((item: any) => {
        const author = item.source?.name || 'GNews';
        const description = item.description || '';
        return {
          id: `article-${hashString(item.url)}`,
          title: item.title,
          description: description.slice(0, 200),
          category: getCategory(item.title, description),
          readTime: estimateReadTime(item.content || description),
          isStaffPick: false,
          isNewRelease: false,
          imageType: 'landscape',
          imageUrl: item.image || null,
          author,
          authorInitial: author[0]?.toUpperCase() || 'G',
          authorColor: getAuthorColor(author),
          publishedAt: item.publishedAt || new Date().toISOString(),
          // Collapsed to a single "GNews" toggle since it aggregates many
          // outlets — the real outlet name is preserved in `author`.
          source: 'GNews',
          url: item.url,
          content: item.content ? `<p>${item.content}</p>` : `<p>${description}</p>`,
        };
      });
  } catch (err) {
    console.error('GNews failed:', err);
    return [];
  }
}

// ── Reddit (public JSON, no key) ──────────────────────────────
const REDDIT_SUBREDDITS = ['technology', 'worldnews'];

async function fetchRedditSubreddit(subreddit: string): Promise<Article[]> {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}.json?limit=25`, {
    headers: { 'User-Agent': 'ReadLiteNewsAggregator/1.0' }, // Reddit blocks/throttles default fetch UAs
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  const children = data?.data?.children;
  if (!Array.isArray(children)) return [];

  return children
    .map((c: any) => c.data)
    .filter((item: any) => item && item.title && !item.is_self) // skip text-only posts — keep the "external link" flavor
    .map((item: any) => {
      const author = item.author || 'Reddit';
      const description = `${item.score || 0} points · ${item.num_comments || 0} comments · r/${subreddit}`;
      const url = item.url_overridden_by_dest || `https://reddit.com${item.permalink}`;
      const thumbnail = typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http') ? item.thumbnail : null;
      return {
        id: `article-${hashString(item.id || item.name || url)}`,
        title: item.title,
        description,
        category: getCategory(item.title, description),
        readTime: '3 min read',
        isStaffPick: (item.score || 0) > 1000,
        isNewRelease: false,
        imageType: 'abstract3d',
        imageUrl: thumbnail,
        author,
        authorInitial: author[0]?.toUpperCase() || 'R',
        authorColor: getAuthorColor(author),
        publishedAt: item.created_utc ? new Date(item.created_utc * 1000).toISOString() : new Date().toISOString(),
        source: 'Reddit',
        url,
        content: `<p>${description}</p>`,
      };
    });
}

async function fetchReddit(): Promise<Article[]> {
  const results = await Promise.allSettled(REDDIT_SUBREDDITS.map(fetchRedditSubreddit));
  let articles: Article[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      articles = articles.concat(r.value);
    } else {
      console.error(`Reddit r/${REDDIT_SUBREDDITS[i]} failed:`, r.reason);
    }
  });
  return articles;
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
      imageUrl: undefined,
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
      fetchNYT(),
      fetchGNews(),
      fetchReddit(),
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
