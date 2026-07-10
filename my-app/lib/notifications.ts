// lib/notifications.ts
//
// No backend notification system exists — this is an honest, self-contained
// substitute: compare the already-cached /api/articles pool against a
// "last seen" timestamp to say "N new articles since your last visit".
const LAST_SEEN_KEY = 'readLite_lastSeenArticleTime';

export function getLastSeenTime(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(LAST_SEEN_KEY);
  return stored ? Number(stored) : 0;
}

export function markAllSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
}
