// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';

// Helper to estimate read time (words per minute ~ 200)
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Helper to get category based on keywords or default
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
  return 'TECHNOLOGY'; // default
}

// Author color based on name hash
function getAuthorColor(name: string): string {
  const colors = ['#22d3ee', '#a78bfa', '#f97316', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#e879f9'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// --- NewsAPI ---
async function fetchNewsAPI(): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${apiKey}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status !== 'ok') return [];

    return data.articles.map((item: any, idx: number) => ({
      id: `news-${idx}`,
      title: item.title || 'Untitled',
      description: item.description || item.content?.slice(0, 150) || '',
      category: getCategory(item.title, item.description),
      readTime: item.content ? estimateReadTime(item.content) : '5 min read',
      isStaffPick: false,
      isNewRelease: idx < 2,
      imageType: 'landscape',
      author: item.author || 'NewsAPI',
      authorInitial: (item.author?.[0] || 'N').toUpperCase(),
      authorColor: getAuthorColor(item.author || 'NewsAPI'),
      publishedAt: item.publishedAt || new Date().toISOString(),
      source: 'NewsAPI',
      url: item.url,
    }));
  } catch (err) {
    console.error('NewsAPI failed:', err);
    return [];
  }
}

// --- Dev.to API ---
async function fetchDevTo(): Promise<Article[]> {
  const apiKey = process.env.DEV_TO_API_KEY;
  const url = 'https://dev.to/api/articles?per_page=20';
  const headers: HeadersInit = {};
  if (apiKey) headers['api-key'] = apiKey;

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any, idx: number) => ({
      id: `devto-${idx}`,
      title: item.title,
      description: item.description,
      category: getCategory(item.title, item.description),
      readTime: `${item.reading_time_minutes} min read`,
      isStaffPick: item.positive_reactions_count > 50,
      isNewRelease: false,
      imageType: 'abstract3d',
      author: item.user?.name || 'Dev.to',
      authorInitial: (item.user?.name?.[0] || 'D').toUpperCase(),
      authorColor: getAuthorColor(item.user?.name || 'Dev.to'),
      publishedAt: item.published_at || new Date().toISOString(),
      source: 'Dev.to',
      url: item.url,
    }));
  } catch (err) {
    console.error('Dev.to failed:', err);
    return [];
  }
}

// --- Medium RSS via rss2json (free public service) ---
// Since Medium has no official API, we use rss2json.com
async function fetchMedium(): Promise<Article[]> {
  const mediumUser = process.env.MEDIUM_USERNAME || '@medium'; // optional custom user
  const rssUrl = `https://medium.com/feed/${mediumUser}`;
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(proxyUrl, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status !== 'ok') return [];

    return data.items.map((item: any, idx: number) => ({
      id: `medium-${idx}`,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
      category: getCategory(item.title, item.description),
      readTime: estimateReadTime(item.description || item.title),
      isStaffPick: false,
      isNewRelease: false,
      imageType: 'landscape',
      author: item.author || 'Medium',
      authorInitial: (item.author?.[0] || 'M').toUpperCase(),
      authorColor: getAuthorColor(item.author || 'Medium'),
      publishedAt: item.pubDate || new Date().toISOString(),
      source: 'Medium',
      url: item.link,
    }));
  } catch (err) {
    console.error('Medium RSS failed:', err);
    return [];
  }
}

// Fallback mock data
function getMockArticles(): Article[] {
  return [
    {
      id: 'mock1',
      title: 'The Silicon Mind: Ethics of Synthetic Cognition',
      description: 'Exploring the blurred lines between programmed response and genuine consciousness in the next generation of AI.',
      category: 'TECHNOLOGY',
      readTime: '8 min read',
      isStaffPick: true,
      isNewRelease: true,
      imageType: 'abstract3d',
      author: 'Dr. Mira Chen',
      authorInitial: 'M',
      authorColor: '#22d3ee',
      publishedAt: new Date().toISOString(),
      source: 'Demo',
      url: '#',
    },
    {
      id: 'mock2',
      title: 'The Quiet Revolution of Bio-Regenerative Design',
      description: 'How architects are using living mycelium and algae to create buildings that breathe and clean the air.',
      category: 'NATURE',
      readTime: '12 min read',
      isStaffPick: false,
      isNewRelease: false,
      imageType: 'landscape',
      author: 'Elena Voss',
      authorInitial: 'E',
      authorColor: '#34d399',
      publishedAt: new Date().toISOString(),
      source: 'Demo',
      url: '#',
    },
    // Add more mock articles as needed
  ];
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch from all sources in parallel, but tolerate failures
    const results = await Promise.allSettled([
      fetchNewsAPI(),
      fetchDevTo(),
      fetchMedium(),
    ]);

    let allArticles: Article[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles = allArticles.concat(result.value);
      }
    });

    // If no articles from any source, use mock
    if (allArticles.length === 0) {
      allArticles = getMockArticles();
    }

    // Remove duplicates by title (simple)
    const seen = new Set();
    allArticles = allArticles.filter(article => {
      if (seen.has(article.title)) return false;
      seen.add(article.title);
      return true;
    });

    // Sort by published date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ articles: allArticles });
  } catch (error) {
    console.error('Error in articles API:', error);
    // Fallback to mock
    return NextResponse.json({ articles: getMockArticles() });
  }
}