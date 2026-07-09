// lib/sources.ts
//
// Registry of built-in aggregation sources. `name` must exactly match the
// literal `source:` string each fetcher in app/api/articles/route.ts emits —
// it's the join key used both by the personalization filter in
// app/home/page.tsx and by SourceManager.tsx.
export type SourceId = 'guardian' | 'devto' | 'hackernews' | 'medium' | 'nyt' | 'gnews' | 'reddit';

export interface BuiltinSource {
  id: SourceId;
  name: string;
  type: 'api' | 'rss';
  icon: string;
  color: string;
}

export const BUILTIN_SOURCES: BuiltinSource[] = [
  { id: 'guardian', name: 'The Guardian', type: 'api', icon: 'G', color: '#22d3ee' },
  { id: 'devto', name: 'Dev.to', type: 'api', icon: 'D', color: '#a78bfa' },
  { id: 'hackernews', name: 'Hacker News', type: 'api', icon: 'Y', color: '#fbbf24' },
  { id: 'medium', name: 'Medium', type: 'rss', icon: 'M', color: '#f97316' },
  { id: 'nyt', name: 'The New York Times', type: 'api', icon: 'T', color: '#34d399' },
  { id: 'gnews', name: 'GNews', type: 'api', icon: 'N', color: '#fb7185' },
  { id: 'reddit', name: 'Reddit', type: 'api', icon: 'R', color: '#60a5fa' },
];

export const BUILTIN_SOURCE_IDS: SourceId[] = BUILTIN_SOURCES.map((s) => s.id);

const NAME_TO_ID = new Map<string, SourceId>(BUILTIN_SOURCES.map((s) => [s.name, s.id]));

export function sourceNameToId(sourceName: string): SourceId | null {
  return NAME_TO_ID.get(sourceName) ?? null;
}

export function isValidSourceId(id: string): id is SourceId {
  return (BUILTIN_SOURCE_IDS as string[]).includes(id);
}
