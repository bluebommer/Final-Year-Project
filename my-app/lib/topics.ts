// lib/topics.ts
//
// Onboarding/Settings "topics" ARE the real article categories (lib/categories.ts)
// — one topic per category, nothing invented that our sources can't actually
// back. Previously this was a separate, richer-sounding vocabulary
// (quantum-tech, acoustics, deep-tech, ...) that didn't map cleanly to what
// articles are actually tagged with; that mismatch is why "select your
// interests" never reliably biased anyone's feed. Now topic id === category,
// so personalization needs no translation layer at all.
import type { Topic } from '@/app';
import { CATEGORY_META, CATEGORY_KEYS } from './categories';

const LABELS: Record<string, string> = {
  TECHNOLOGY: 'Technology',
  POLITICS: 'Politics',
  SCIENCE: 'Science',
  BUSINESS: 'Business',
  ENTERTAINMENT: 'Entertainment',
  HEALTH: 'Health',
  WORLD: 'World News',
  SPORTS: 'Sports',
  DESIGN: 'Design',
  NATURE: 'Nature & Climate',
  PSYCHOLOGY: 'Psychology',
  CULTURE: 'Culture',
};

const SIZES: Record<string, Topic['size']> = {
  TECHNOLOGY: 'large',
  BUSINESS: 'wide',
  WORLD: 'wide',
};

export const TOPICS: Topic[] = CATEGORY_KEYS.map((key) => ({
  id: key,
  label: LABELS[key] ?? key,
  icon: CATEGORY_META[key].icon,
  size: SIZES[key] ?? 'medium',
}));

export function topicsToCategories(topicIds: string[]): Set<string> {
  const valid = new Set(CATEGORY_KEYS);
  return new Set(topicIds.filter((id) => valid.has(id)));
}
