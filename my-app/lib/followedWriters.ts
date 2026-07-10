// lib/followedWriters.ts
//
// No real profile/follower system exists — this persists the follow list
// locally so it survives reloads instead of resetting on every mount.
const STORAGE_KEY = 'readLite_followedWriters';

export function getFollowedWriters(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function setFollowedWriters(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}
