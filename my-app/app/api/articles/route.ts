// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';

// Mock function – replace with real API calls
async function fetchNewsAPI(): Promise<Article[]> {
  // In production: fetch from https://newsapi.org/v2/top-headlines?country=us&apiKey=...
  return [
    {
      id: 'news1',
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
      source: 'NewsAPI',
      url: '#',
    },
    // Add more mock articles...
  ];
}

async function fetchDevTo(): Promise<Article[]> {
  // In production: fetch from https://dev.to/api/articles
  return [];
}

async function fetchMedium(): Promise<Article[]> {
  // In production: fetch from RSS feed
  return [];
}

export async function GET() {
  try {
    // Fetch from all sources in parallel
    const [newsArticles, devArticles, mediumArticles] = await Promise.all([
      fetchNewsAPI(),
      fetchDevTo(),
      fetchMedium(),
    ]);

    const allArticles = [...newsArticles, ...devArticles, ...mediumArticles];

    // Sort by published date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ articles: allArticles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}