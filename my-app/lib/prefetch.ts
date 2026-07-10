// lib/prefetch.ts
//
// "Intelligent" here means: don't prefetch/preload blindly — respect the
// user's data plan. The Network Information API (navigator.connection) is
// Chrome/Edge/Android-only; browsers without it (Safari, Firefox) simply
// always return false, i.e. prefetching stays on for them.
export function isDataSaverActive(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
  return false;
}
