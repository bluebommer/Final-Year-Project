# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**ReadLite** ("Read anywhere. Instantly.") is a news-aggregation reading app built as a Next.js App Router project. It pulls articles from multiple external sources, offers auth (local + Google), and is a PWA (installable, offline-first, with a hand-rolled service worker doing cache-first / network-first / stale-while-revalidate strategies depending on request type) targeting Lighthouse performance/accessibility scores above 90. See "Offline architecture" below for how the pieces fit together.

The actual application lives in **`my-app/`** — always `cd my-app` before running any command below. The repo root only contains a stray `package.json`/`package-lock.json` (single `cheerio` dependency) that is not part of the app build.

## Commands

Run from `my-app/`:

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

There is no test framework configured in this project currently.

## Environment variables

Required in `my-app/.env.local` (gitignored, never commit real values):

- `MONGODB_URI` — MongoDB connection string (mongoose)
- `JWT_SECRET` — signs the `auth_token` cookie (HS256 via `jose`)
- `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth (Google Identity Services script + `google-auth-library` token verification)
- `GUARDIAN_API_KEY` — The Guardian content API
- `DEV_TO_API_KEY` — optional, raises Dev.to rate limits
- `MEDIUM_USERNAME` — Medium RSS handle (fetched via rss2json proxy)
- `NYT_API_KEY` — optional, New York Times Top Stories API; source is skipped without it
- `GNEWS_API_KEY` — optional, GNews.io; source is skipped without it
- `SENDGRID_API_KEY` — SendGrid, used for email verification codes and password reset (see `lib/mailer.ts`)
- `EMAIL_FROM` — required; must be a Single Sender verified in SendGrid (an email address you own, verified via confirmation link — no custom domain needed) or an authenticated domain if one's added later
- `NEXT_PUBLIC_BASE_URL` — base URL used by server components/route handlers to call this app's own API routes (defaults to `http://localhost:3000`)

## Architecture

### Onboarding vs. real routes

`app/page.tsx` (`/`) is a client-side, `useState`-driven mini flow (`welcome → preferences → auth`, typed in `app/index.ts` as `Page`) — it is not routed via the file system, just conditional rendering with `next/dynamic` imports. This is the first-run signup/onboarding experience.

Once a user is in the app, the real surfaces are file-system routes, each following the same shell pattern (`Navbar` + `SideBar` + `main`, components pulled in via `next/dynamic`):
- `app/home/page.tsx` — server component, fetches `/api/articles` with `cache: 'no-store'`
- `app/discover/page.tsx`, `app/library/page.tsx`, `app/history/page.tsx`, `app/setting/page.tsx`
- `app/article/[id]/page.tsx` — server component; fetches `/api/article/[id]`, falls back to fetching `/api/articles` and finding the article client-side if that fails; builds `generateMetadata` (OpenGraph) from the article.

`app/layout.tsx` is the single root layout: Manrope font, all global stylesheets (`globals.css`, `welcome.css`, `preferences.css`, `auth.css`), a global `OfflineIndicator`, and `ServiceWorkerRegistrar` (registers `public/sw.js`, production builds only). The Google Identity `accounts.google.com/gsi/client` script is loaded only from `Authpage.tsx` (`next/script`, `afterInteractive`) rather than the root layout, so every other route skips it.

### Components layout

`app/Components/` is organized by feature area, each with a co-located `styles/` folder of CSS Modules: `HomeComponents`, `DiscoverComponents`, `HistoryComponents`, `LibraryComponents`, `SettingsComponents`, `ArticleComponents`, `SkeletonComponents` (loading placeholders), `StatusComponents` (e.g. `OfflineIndicator`), `RootComponents` (welcome/preferences/auth pages + global stylesheets), and **`Management Components`** (note the literal space in the directory name — `Cachestorage`, `Sourcemanager`, `Readingcontrols`, `Onboarding`, `Pwainstall`; always quote/escape this path).

### Auth

JWT-based auth stored in an `httpOnly` cookie named `auth_token` (7-day expiry, `jose` `SignJWT`/HS256). Routes under `app/api/auth/`:
- `register` → creates an `EmailVerification` doc (pending user + 6-digit code, 15 min expiry, TTL-indexed) and emails the code via `lib/mailer.ts`; does **not** create the `User` yet.
- `verify-email` → checks the code, then creates the real `User` (bcrypt-hashed password already stored on the pending record) and issues the JWT cookie.
- `resend-code` → regenerates the code on the existing `EmailVerification` record.
- `login` → bcrypt compare, account lockout after 5 failed attempts (`User.incrementLoginAttempts`/`isLocked`, 15 min lock).
- `google` → verifies the Google ID token server-side (`google-auth-library`), upserts a `User` by `googleId`, and links an existing local account by email if `authProvider === "local"`.
- `logout` → clears the cookie.

All auth routes call `checkRateLimit(key, {maxRequests, windowSeconds})` from `lib/rateLimit.ts` first, keyed by `x-forwarded-for` IP. Rate limit state is a MongoDB collection (`RateLimit`) with a TTL index on `resetAt` — not in-memory, so it's consistent across serverless instances.

Mongoose models live in `models/` (`User.ts`, `EmailVerification.ts`), not under `app/`. `lib/mongodb.ts` caches the connection on `globalThis.mongoose` to survive HMR/serverless cold starts.

### Article aggregation

`app/api/articles/route.ts` (`GET`, `export const dynamic = 'force-dynamic'`) fans out in parallel (`Promise.allSettled`) to five sources, each normalizing into the shared `Article` shape (`app/types/article.ts`): The Guardian content API, Dev.to API, Medium RSS (`lib/rssFeed.ts`), the New York Times Top Stories API (per-section), and GNews.io (per-topic). Each source fetch is bounded by `AbortSignal.timeout(5000)` and fails independently into `[]`, so one slow/unreachable source never blocks the others. Results are deduped by `id` and sorted by `publishedAt`; if every source fails or returns nothing, `getMockArticles()` provides a single demo article. Category is inferred from title/description via keyword regexes (`getCategory`) except where a source's own section/topic taxonomy maps directly to a category (Guardian `sectionId`, NYT section, GNews topic); author avatar color is a deterministic hash of the author name.

Results are cached via `lib/articleCache.ts` — a **module-level in-memory variable** with a 1-hour TTL, not a shared/persistent cache. This means it's per-process: it will not stay in sync across multiple serverless instances and resets on every redeploy/restart.

`app/api/article/[id]/route.ts` looks up a single article from that same cache (re-fetching `/api/articles` on a cache miss), and if the stored `content` looks truncated (empty, contains a Guardian-style `[+N chars]` marker, or is short/placeholder-like per `isBadDescription`), scrapes the full article body from its source URL using `lib/scrapeArticle.ts` (Cheerio, tries a list of common article-body selectors, falls back to concatenating all `<p>` tags). Dev.to articles are skipped for scraping since the API already returns full `body_html`. If scraping fails, it falls back to a small HTML snippet linking out to the original source.

### Offline architecture

The app is a working PWA: `app/manifest.ts` generates `/manifest.webmanifest` (installable, `start_url: "/home"`), and `public/sw.js` is a hand-rolled, unbundled classic-script service worker registered by `ServiceWorkerRegistrar.tsx` — **production builds only** (`next dev`'s HMR interaction with service workers is unreliable, so offline behavior must be tested against `next build && next start`, never `next dev`).

Two storage layers, kept manually in sync (the SW can't `import` from `lib/`, so it re-implements a minimal read-only subset):
- **IndexedDB** (`lib/offlineDB.ts`, DB name `readlite-db`) — saved articles (full content embedded, so they're readable offline independent of any HTTP cache), a settings store (user's chosen cache strategy), reading history, and a sync-action queue for SW commands sent before a controller was active. `DB_NAME`/`DB_VERSION`/store names must match the SW's own copy in `public/sw.js` exactly, or every DB read inside the SW fails silently (falls back to defaults) via a version mismatch.
- **Cache Storage** (`public/sw.js`) — five buckets (`readlite-static`, `readlite-api-list`, `readlite-api-article`, `readlite-images`, `readlite-nav`), all suffixed with a shared `CACHE_VERSION` that must be bumped in both `sw.js` and `lib/offlineDB.ts`'s `SW_CACHE_VERSION` together whenever the caching schema changes. Navigation documents (any page the user has visited, not just articles) are cached opportunistically on every successful navigation and replayed on fetch failure, so `/home` (and any other visited route) has a last-known-good offline fallback instead of dropping to the generic `/offline.html` shell.

Saving an article for offline reading has two parts that must both happen: `saveArticle()` (IndexedDB) and priming the SW cache (`postToServiceWorker('CACHE_ARTICLE_RESPONSE'/'CACHE_IMAGE', ...)`, which fetches and caches that article's rendered page + API response while still online). `saveArticleForOffline()` in `lib/offlineDB.ts` does both together — every "bookmark" entry point (card grids' bookmark button, `ArticleReader`'s Save button) must go through it, not `saveArticle()` alone, or that article's page will 404 offline even though it shows as saved.

`app/article/[id]/page.tsx` stays server-rendered for `generateMetadata`/OpenGraph, but hands off to a client `ArticleGate` component that falls back to the IndexedDB-saved copy of the article whenever the server-side lookup fails — covering both genuinely-offline reads and the case where `lib/articleCache.ts`'s per-process in-memory cache has reset (redeploy/cold start/restart) and the article has since rotated out of the live source feeds it was originally fetched from. `HomeContent` does the same at the list level: an empty server-provided article list falls back to `listSavedArticles()` from IndexedDB with a visible "you're offline" notice.
