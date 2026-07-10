// lib/categories.ts
//
// The category taxonomy getCategory() (lib/articleHelpers.ts) and the
// Guardian/NYT/GNews section mappings (app/api/articles/route.ts) actually
// assign. Shared by CategoryGrid.tsx (Discover) and CategoryTabs.tsx (Home)
// so both only ever show categories that can really occur, with consistent
// icons/colors.
export interface CategoryMeta {
  icon: string;
  color: string;
  bg: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  TECHNOLOGY: { icon: '⬡', color: '#22d3ee', bg: 'rgba(0,222,236,0.07)' },
  POLITICS: { icon: '◆', color: '#e879f9', bg: 'rgba(232,121,249,0.07)' },
  SCIENCE: { icon: '◎', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
  BUSINESS: { icon: '◈', color: '#34d399', bg: 'rgba(52,211,153,0.07)' },
  ENTERTAINMENT: { icon: '✺', color: '#fb7185', bg: 'rgba(251,113,133,0.07)' },
  HEALTH: { icon: '✚', color: '#f87171', bg: 'rgba(248,113,113,0.07)' },
  WORLD: { icon: '⟁', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)' },
  SPORTS: { icon: '◐', color: '#fdba74', bg: 'rgba(253,186,116,0.07)' },
  DESIGN: { icon: '✦', color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
  NATURE: { icon: '⬟', color: '#6ee7b7', bg: 'rgba(110,231,183,0.07)' },
  PSYCHOLOGY: { icon: '◉', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)' },
  CULTURE: { icon: '❋', color: '#cbd5e1', bg: 'rgba(203,213,225,0.07)' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_META);
