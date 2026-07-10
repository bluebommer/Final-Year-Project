// lib/articleHelpers.ts
//
// Shared helpers for turning raw source-API/RSS payloads into the app's
// standardised Article shape. Used by app/api/articles/route.ts's fetchers
// and by lib/rssFeed.ts (custom per-user RSS feeds).

// ── Stable hash from string ──────────────────────────
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ── Estimated reading time ────────────────────────────
export function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── Category ──────────────────────────────────────────
//
// This is a last-resort keyword guess for sources with no real editorial
// category of their own (Medium RSS, and as a fallback for anything else).
// Sources that DO carry real section/topic metadata (Guardian's sectionId,
// NYT's queried section, GNews's queried topic) should use that directly
// instead of calling this — see GUARDIAN_SECTION_MAP / NYT_SECTION_CATEGORY /
// GNEWS_TOPIC_CATEGORY in app/api/articles/route.ts. Order matters: more
// specific/distinctive patterns are checked before broad ones, and the
// default fallback is WORLD (general news), not TECHNOLOGY — defaulting
// unmatched articles to TECHNOLOGY was the main cause of unrelated articles
// (e.g. politics) being miscategorized as tech.
export function getCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/politic|election|senate|congress|parliament|president|prime minister|policy|lawmaker|legislat|geopolit|diplomat/)) return 'POLITICS';
  if (text.match(/health|medicine|medical|disease|vaccine|hospital|surgery|therapy|wellness|diagnos/)) return 'HEALTH';
  if (text.match(/film|movie|celebrity|entertainment|television|tv show|album|box office|hollywood|streaming series/)) return 'ENTERTAINMENT';
  if (text.match(/football|soccer|basketball|tennis|olympic|championship|athlete|world cup/)) return 'SPORTS';
  if (text.match(/science|physics|chemistry|biology|quantum|genetics?|dna|astronomy|space|cosmos|telescope/)) return 'SCIENCE';
  if (text.match(/\bai\b|artificial intelligence|machine learning|neural network|algorithm|software|programming|cybersecurity|computing|robot/)) return 'TECHNOLOGY';
  if (text.match(/business|market|economy|finance|startup|invest|venture capital|stock|earnings|ipo/)) return 'BUSINESS';
  if (text.match(/design|typography|aesthetic|user interface|user experience|\bui\b|\bux\b/)) return 'DESIGN';
  if (text.match(/climate|environment|wildlife|conservation|sustainab|ecosystem/)) return 'NATURE';
  if (text.match(/psycholog|neuroscience|cognition|emotion|behavior|mental health/)) return 'PSYCHOLOGY';
  if (text.match(/culture|society|history|literature|book\b|art\b|music|philosophy/)) return 'CULTURE';
  return 'WORLD';
}

// ── Author color ──────────────────────────────────────
export function getAuthorColor(name: string): string {
  const colors = ['#22d3ee', '#a78bfa', '#f97316', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#e879f9'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// ── Strip HTML tags ───────────────────────────────────
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
