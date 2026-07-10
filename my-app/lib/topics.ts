// lib/topics.ts
//
// Canonical topic list, shared by onboarding (PreferencesPage.tsx) and
// Settings (Personalization.tsx) — previously each had its own divergent
// mock list. TOPIC_CATEGORY_MAP bridges this richer topic vocabulary to the
// broad Article categories in lib/categories.ts, since article
// personalization only has the broad categories to filter on.
import type { Topic } from '@/app';

export const TOPICS: Topic[] = [
  { id: "quantum-tech", label: "Quantum Tech", icon: "⚛", category: "Primary Domain", size: "large" },
  { id: "space", label: "Space", icon: "🚀", size: "medium" },
  { id: "acoustics", label: "Acoustics", icon: "🎚", size: "medium" },
  { id: "architecture", label: "Architecture", icon: "🏛", category: "Design", size: "wide" },
  { id: "genetics", label: "Genetics", icon: "🧬", size: "medium" },
  { id: "ai-ethics", label: "A.I. Ethics", icon: "🤖", size: "medium" },
  { id: "global-markets", label: "Global Markets", sublabel: "Economics & Future Trends", icon: "🏦", size: "wide" },
  { id: "philosophy", label: "Philosophy", icon: "📖", size: "medium" },
  { id: "medicine", label: "Medicine", icon: "🩺", size: "medium" },
  { id: "climate", label: "Climate", icon: "🌍", size: "medium" },
  { id: "cybersecurity", label: "Cybersecurity", icon: "🔐", size: "medium" },
  { id: "neuroscience", label: "Neuroscience", icon: "🧠", size: "medium" },
  { id: "geopolitics", label: "Geopolitics", icon: "🗺", size: "medium" },
  { id: "deep-tech", label: "Deep Tech", sublabel: "Frontier Research", icon: "💡", size: "wide" },
];

export const TOPIC_CATEGORY_MAP: Record<string, string> = {
  'quantum-tech': 'TECHNOLOGY',
  'space': 'SCIENCE',
  'acoustics': 'TECHNOLOGY',
  'architecture': 'DESIGN',
  'genetics': 'SCIENCE',
  'ai-ethics': 'TECHNOLOGY',
  'global-markets': 'BUSINESS',
  'philosophy': 'CULTURE',
  'medicine': 'HEALTH',
  'climate': 'NATURE',
  'cybersecurity': 'TECHNOLOGY',
  'neuroscience': 'PSYCHOLOGY',
  'geopolitics': 'POLITICS',
  'deep-tech': 'TECHNOLOGY',
};

export function topicsToCategories(topicIds: string[]): Set<string> {
  const set = new Set<string>();
  for (const id of topicIds) {
    const category = TOPIC_CATEGORY_MAP[id];
    if (category) set.add(category);
  }
  return set;
}
