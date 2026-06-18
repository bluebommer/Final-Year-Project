// lib/scrapeArticle.ts
import * as cheerio from 'cheerio';

export async function scrapeFullContent(url: string): Promise<string | null> {
  if (!url || url === '#') return null;
  console.log('🔍 Scraping:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(5000),
    });
    console.log('📡 Response status:', res.status, url);
    if (!res.ok) return null;
    const html = await res.text();
    console.log('📄 HTML length:', html.length);
    const $ = cheerio.load(html);

    $('script, style, nav, header, footer, aside, .ad, .ads, .advertisement, .sidebar, .comments, .related').remove();

    const selectors = [
      'article',
      '[role="main"]',
      '.article-body',
      '.article-content',
      '.story-body',
      '.post-content',
      '.entry-content',
      'main',
    ];

    for (const selector of selectors) {
      const el = $(selector);
      const text = el.text().trim();
      console.log(`  Selector "${selector}": found=${el.length}, textLen=${text.length}`);
      if (el.length && text.length > 200) {
        console.log('✅ Scraped with selector:', selector);
        return el.html() || null;
      }
    }

    const paragraphs = $('p').map((_, el) => $.html(el)).get().join('');
    console.log('📝 Paragraphs fallback length:', paragraphs.length);
    return paragraphs.length > 200 ? paragraphs : null;
  } catch (err) {
    console.error('❌ Scrape error:', err);
    return null;
  }
}