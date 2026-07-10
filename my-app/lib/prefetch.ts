// lib/prefetch.ts
//
// "Intelligent" here means: don't prefetch/preload blindly — respect the
// user's data plan. The Network Information API (navigator.connection) is
// Chrome/Edge/Android-only; browsers without it (Safari, Firefox) simply
// always return false, i.e. prefetching stays on for them.
const PREFETCH_BEHAVIOR_KEY = 'readLite_prefetchBehavior';

export type PrefetchBehavior = 'wifi-only' | 'always' | 'never';

export function getPrefetchBehavior(): PrefetchBehavior {
  if (typeof window === 'undefined') return 'wifi-only';
  const stored = localStorage.getItem(PREFETCH_BEHAVIOR_KEY);
  return stored === 'always' || stored === 'never' ? stored : 'wifi-only';
}

export function setPrefetchBehavior(value: PrefetchBehavior): void {
  localStorage.setItem(PREFETCH_BEHAVIOR_KEY, value);
}

export function isDataSaverActive(): boolean {
  const behavior = getPrefetchBehavior();
  if (behavior === 'never') return true;
  if (behavior === 'always') return false;

  // "wifi-only" (default): fall back to the real connection-quality heuristic.
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
  return false;
}
