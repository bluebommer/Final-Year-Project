// app/api/article/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Article } from '@/app/types/article';
import { getCachedArticles, setCachedArticles } from '@/lib/articleCache';
import { scrapeFullContent, normalizeParagraphs } from '@/lib/scrapeArticle';

// Without this, Next.js's Route Handler cache (and its on-disk fetch cache)
// can freeze a scraped article's content the first time it's fetched —
// surviving even a redeploy — since this handler otherwise looks "static"
// to Next (no cookies()/headers() use). Matches /api/articles' same opt-out.
export const dynamic = 'force-dynamic';

function isBadDescription(desc: string | undefined): boolean {
  if (!desc) return true;
  const lower = desc.toLowerCase().trim();
  return (
    lower === 'false' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'n/a' ||
    desc.length < 10
  );
}

function buildFallbackContent(article: Article): string {
  const descHtml = isBadDescription(article.description)
    ? ''
    : `<p>${article.description}</p>`;

  return `
    ${descHtml}
    <p>
      <a href="${article.url}" target="_blank" rel="noopener noreferrer">
        Read the full article on ${article.source} →
      </a>
    </p>
  `;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(id);

    // ── 1. Try cache first ────────────────────────────────────
    let articles = getCachedArticles();

    // ── 2. Cache miss — fetch from /api/articles via HTTP ────
    if (!articles) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      try {
        const res = await fetch(`${baseUrl}/api/articles`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json();
          articles = (data.articles as Article[]) ?? [];
          if (articles.length > 0) setCachedArticles(articles);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch articles for cache:', fetchErr);
      }
    }

    // ── 3. Still nothing — return 503 ────────────────────────
    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Articles unavailable' }, { status: 503 });
    }

    // ── 4. Find article ───────────────────────────────────────
    const article = articles.find((a: Article) => a.id === decodedId);
    if (!article) {
      console.error(`Article ${decodedId} not found in ${articles.length} articles`);
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // ── 5. Scrape full content if truncated ───────────────────
    // NOTE: Dev.to's bulk list endpoint (used in /api/articles) never
    // includes body_html/body_markdown — those only exist on Dev.to's
    // single-article endpoint, which we don't call. So Dev.to content is
    // just as truncated as everyone else's and must go through the same
    // scraping fallback below (previously this was skipped on the false
    // assumption that Dev.to's list response already had full content).
    const isTruncated =
      !article.content ||
      article.content.includes('[+') ||
      isBadDescription(article.content) ||
      article.content.length < 300;

    let fullContent = article.content ?? '';

    if (isTruncated && article.url && article.url !== '#') {
      try {
        const scraped = await scrapeFullContent(article.url);
        fullContent = scraped || buildFallbackContent(article);
      } catch (scrapeErr) {
        console.error('Scrape failed:', scrapeErr);
        fullContent = buildFallbackContent(article);
      }
    }

    // ── 6. Final safety check — never render garbage ─────────
    if (isBadDescription(fullContent)) {
      fullContent = buildFallbackContent(article);
    }

    // Some source APIs (e.g. Guardian's `bodyText` for live blogs) hand back
    // "full" content that's already long enough to skip scraping above, but
    // still collapsed into one giant paragraph — normalize regardless of
    // where the content came from, not just the scraped path.
    fullContent = normalizeParagraphs(fullContent);

    return NextResponse.json({ article: { ...article, content: fullContent } });

  } catch (error) {
    console.error('Error in /api/article/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}