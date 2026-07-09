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
export function getCategory(title: string, description: string): string {
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
