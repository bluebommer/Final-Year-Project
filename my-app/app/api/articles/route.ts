// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';
import { getCachedArticles, setCachedArticles } from '@/lib/articleCache';
import { hashString, estimateReadTime, getCategory, getAuthorColor, stripHtml } from '@/lib/articleHelpers';
import { fetchRssFeedArticles } from '@/lib/rssFeed';

// The Guardian tags every article with a real editorial sectionId — use that
// directly instead of guessing from title/description keywords. Any section
// not listed here falls back to the keyword guess.
const GUARDIAN_SECTION_MAP: Record<string, string> = {
  politics: 'POLITICS',
  world: 'WORLD', 'us-news': 'WORLD', 'uk-news': 'WORLD', 'australia-news': 'WORLD', 'global-development': 'WORLD',
  technology: 'TECHNOLOGY',
  science: 'SCIENCE',
  business: 'BUSINESS', money: 'BUSINESS',
  film: 'ENTERTAINMENT', music: 'ENTERTAINMENT', stage: 'ENTERTAINMENT', games: 'ENTERTAINMENT', 'tv-and-radio': 'ENTERTAINMENT',
  culture: 'CULTURE', books: 'CULTURE', artanddesign: 'CULTURE', media: 'CULTURE', fashion: 'CULTURE', food: 'CULTURE', travel: 'CULTURE',
  environment: 'NATURE',
  society: 'WORLD', lifeandstyle: 'WORLD', education: 'WORLD', law: 'WORLD',
  sport: 'SPORTS', football: 'SPORTS',
};

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
          category: GUARDIAN_SECTION_MAP[item.sectionId] || getCategory(item.webTitle, trailText),
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
          // Dev.to is an almost entirely developer/tech-focused platform —
          // more reliable than guessing from title keywords.
          category: 'TECHNOLOGY',
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

  // Medium's per-user feed always lives at /feed/@handle — without the "@"
  // the URL 404s and rss2json rejects it outright, silently zeroing out
  // this entire source regardless of whether MEDIUM_USERNAME was set.
  const handle = mediumUser.trim().startsWith('@') ? mediumUser.trim() : `@${mediumUser.trim()}`;

  try {
    return await fetchRssFeedArticles(`https://medium.com/feed/${handle}`, 'Medium');
  } catch (err) {
    console.error('Medium RSS failed:', err);
    return [];
  }
}

// ── New York Times (Top Stories API) ──────────────────────────
// The section we query IS the article's real category — no guessing needed.
const NYT_SECTION_CATEGORY: Record<string, string> = {
  technology: 'TECHNOLOGY',
  science: 'SCIENCE',
  politics: 'POLITICS',
  business: 'BUSINESS',
  arts: 'ENTERTAINMENT',
  health: 'HEALTH',
  world: 'WORLD',
};
const NYT_SECTIONS = Object.keys(NYT_SECTION_CATEGORY);

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
        category: NYT_SECTION_CATEGORY[section],
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
// Query per-topic (GNews's own classification) instead of one generic
// top-headlines call — the topic queried becomes the real category.
const GNEWS_TOPIC_CATEGORY: Record<string, string> = {
  technology: 'TECHNOLOGY',
  science: 'SCIENCE',
  business: 'BUSINESS',
  entertainment: 'ENTERTAINMENT',
  health: 'HEALTH',
  nation: 'POLITICS',
  world: 'WORLD',
};
const GNEWS_TOPICS = Object.keys(GNEWS_TOPIC_CATEGORY);

async function fetchGNewsTopic(topic: string, apiKey: string): Promise<Article[]> {
  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?lang=en&topic=${topic}&max=10&apikey=${apiKey}`,
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
        category: GNEWS_TOPIC_CATEGORY[topic],
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
}

async function fetchGNews(): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY not set');
    return [];
  }
  const results = await Promise.allSettled(GNEWS_TOPICS.map((topic) => fetchGNewsTopic(topic, apiKey)));
  let articles: Article[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      articles = articles.concat(r.value);
    } else {
      console.error(`GNews /${GNEWS_TOPICS[i]} failed:`, r.reason);
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
      fetchMedium(),
      fetchNYT(),
      fetchGNews(),
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
