// lib/scrapeArticle.ts
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function scrapeFullContent(url: string): Promise<string | null> {
  if (!url || url === '#') return null;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Readability (the engine behind Firefox Reader View) normalizes real-world
    // page markup — including non-<p>-based layouts like live blogs — into
    // clean, properly-paragraphed HTML. It's a much better fit than a fixed
    // selector list for arbitrary publisher sites.
    const content = extractWithReadability(html, url) ?? extractWithSelectors(html);
    return content ? normalizeParagraphs(content) : null;
  } catch (err) {
    console.error('Scrape error:', err);
    return null;
  }
}

function extractWithReadability(html: string, url: string): string | null {
  try {
    const dom = new JSDOM(html, { url });
    const parsed = new Readability(dom.window.document).parse();
    if (parsed?.content && parsed.content.trim().length > 200) return parsed.content;
  } catch (err) {
    console.error('Readability parse failed, falling back to selectors:', err);
  }
  return null;
}

function extractWithSelectors(html: string): string | null {
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
    if (el.length && text.length > 200) return el.html() || null;
  }

  const paragraphs = $('p').map((_, el) => $.html(el)).get().join('');
  return paragraphs.length > 200 ? paragraphs : null;
}

// Live blogs (Guardian minute-by-minute, etc.) often lose all internal
// structure — either during scraping, or because the source API itself
// (e.g. Guardian's `bodyText` field) hands back the whole blog as one
// unbroken line — and collapse into one enormous <p>. Re-split any
// paragraph past this length back into readable chunks at sentence
// boundaries so it doesn't render as one unbroken wall of text.
const OVERLONG_PARAGRAPH_CHARS = 600;
const TARGET_PARAGRAPH_CHARS = 380;

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+(?:[.!?]+(?=\s+[A-Z0-9"'“‘(]|\s*$)|$)/g);
  return (matches ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function groupSentencesIntoParagraphs(sentences: string[], targetLen: number): string[] {
  const paragraphs: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > targetLen) {
      paragraphs.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

// Applied to every article's final content regardless of where it came from
// (scraped, or passed straight through from a source API) — re-splits
// collapsed paragraphs and adds lazy-loading to embedded images.
export function normalizeParagraphs(html: string): string {
  // isDocument=false: parse as a fragment so cheerio doesn't wrap the
  // output in implied <html>/<body> tags — this is embedded via
  // dangerouslySetInnerHTML inside an existing <article>, not a full page.
  const $ = cheerio.load(html, null, false);

  $('img').attr('loading', 'lazy').attr('decoding', 'async');

  $('p').each((_, el) => {
    const node = $(el);
    // Only touch text-only paragraphs — one with an <img>/<a>/etc. inside
    // is more likely a normal paragraph with inline markup than a
    // collapsed live-blog blob, and splitting on plain text would silently
    // drop that markup.
    if (node.children().length > 0) return;
    const text = node.text().trim();
    if (text.length <= OVERLONG_PARAGRAPH_CHARS) return;

    const sentences = splitIntoSentences(text);
    const rebuilt = groupSentencesIntoParagraphs(sentences, TARGET_PARAGRAPH_CHARS)
      .map((p) => `<p>${p}</p>`)
      .join('');
    node.replaceWith(rebuilt);
  });

  return $.root().html() || html;
}
