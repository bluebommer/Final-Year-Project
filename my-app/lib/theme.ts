// lib/theme.ts
//
// Light/dark theme persistence + application. Dark is the default (matches
// this app's original, only design) — a stored preference of exactly
// "light" is the sole way to opt into light mode.
export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'readLite_theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export const THEME_CHANGED_EVENT = 'readlite:theme-changed';

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
}
