// app/home/page.tsx
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Article } from '../types/article';
import AppShell from '../Components/HomeComponents/AppShell';
import HomeContent from '../Components/HomeComponents/HomeContent';
import styles from '../Components/HomeComponents/styles/Home.module.css';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { sourceNameToId } from '@/lib/sources';
import { topicsToCategories } from '@/lib/topics';
import { fetchRssFeedArticles } from '@/lib/rssFeed';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

interface UserPrefs {
  preferredTopics: string[];
  enabledSources?: string[];
  customFeeds: { id: string; name: string; url: string }[];
}

// Any failure here (bad NEXT_PUBLIC_BASE_URL, network error, non-OK
// response) must resolve to [], never throw — matches getUserPrefs()'s rule
// below: a broken read must never break /home itself.
async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error('Failed to fetch articles: non-OK response', res.status);
      return [];
    }
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return [];
  }
}

// Any failure here (bad/expired cookie, DB error) must resolve to `null`,
// never throw — a broken preferences read must never break /home itself.
async function getUserPrefs(): Promise<UserPrefs | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = typeof payload.sub === 'string' ? payload.sub : null;
    if (!userId) return null;

    await connectToDatabase();
    const user = await User.findById(userId).select('preferredTopics enabledSources customFeeds').lean();
    if (!user) return null;

    return {
      preferredTopics: user.preferredTopics ?? [],
      enabledSources: user.enabledSources,
      customFeeds: user.customFeeds ?? [],
    };
  } catch (err) {
    // Next.js signals "this route can't be statically rendered" by throwing
    // from cookies() — that's not a real failure, it must propagate so Next
    // correctly falls back to per-request dynamic rendering (required here,
    // since personalization must vary per signed-in user, never be cached
    // as one static page for everyone).
    if (err && typeof err === 'object' && 'digest' in err && err.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Failed to load user preferences:', err);
    return null;
  }
}

// No preferences set (prefs === null, or an authenticated-but-untouched
// account) leaves this byte-identical to the unpersonalized list — safe
// default for legacy/new accounts.
function personalizeArticles(articles: Article[], prefs: UserPrefs | null, customFeedArticles: Article[]): Article[] {
  let personalized = articles;

  if (prefs?.enabledSources && prefs.enabledSources.length > 0) {
    const enabled = new Set(prefs.enabledSources);
    personalized = personalized.filter((a) => {
      const id = sourceNameToId(a.source);
      return id ? enabled.has(id) : true; // unrecognized/custom source: never dropped here
    });
  }

  personalized = personalized.concat(customFeedArticles);

  if (prefs?.preferredTopics?.length) {
    const categories = topicsToCategories(prefs.preferredTopics);
    if (categories.size > 0) {
      // Stable partition — preserves the existing recency order within each group.
      const preferred = personalized.filter((a) => categories.has(a.category));
      const rest = personalized.filter((a) => !categories.has(a.category));
      personalized = [...preferred, ...rest];
    }
  }

  return personalized;
}

export default async function HomePage() {
  const [articles, prefs] = await Promise.all([getArticles(), getUserPrefs()]);

  let customFeedArticles: Article[] = [];
  if (prefs?.customFeeds?.length) {
    const settled = await Promise.allSettled(prefs.customFeeds.map((f) => fetchRssFeedArticles(f.url, f.name)));
    for (const result of settled) {
      if (result.status === 'fulfilled') customFeedArticles = customFeedArticles.concat(result.value);
    }
  }

  const personalized = personalizeArticles(articles, prefs, customFeedArticles);

  return (
    <AppShell>
      <main id="main-content" className={styles.mainContent}>
        <HomeContent articles={personalized} />
      </main>
    </AppShell>
  );
}
