# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**ReadLite** ("Read anywhere. Instantly.") is a news-aggregation reading app built as a Next.js App Router project. It pulls articles from multiple external sources, offers auth (local + Google), and is being built toward a full PWA (installable, offline-first, with cache-first / network-first / stale-while-revalidate strategies and Lighthouse performance/accessibility targets above 90). The offline/service-worker/manifest work is not implemented yet — see "Current state / known gaps" below.

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

`app/layout.tsx` is the single root layout: Manrope font, all global stylesheets (`globals.css`, `welcome.css`, `preferences.css`, `auth.css`), the Google Identity `accounts.google.com/gsi/client` script (`beforeInteractive`), and a global `OfflineIndicator`.

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

`app/api/articles/route.ts` (`GET`, `export const dynamic = 'force-dynamic'`) fans out in parallel (`Promise.allSettled`) to four sources, each normalizing into the shared `Article` shape (`app/types/article.ts`): The Guardian content API, Dev.to API, Hacker News via Algolia search, and Medium RSS (proxied through `rss2json.com` since there's no direct JSON feed). Results are deduped by `id` and sorted by `publishedAt`; if every source fails or returns nothing, `getMockArticles()` provides a single demo article. Category is inferred from title/description via keyword regexes (`getCategory`); author avatar color is a deterministic hash of the author name.

Results are cached via `lib/articleCache.ts` — a **module-level in-memory variable** with a 1-hour TTL, not a shared/persistent cache. This means it's per-process: it will not stay in sync across multiple serverless instances and resets on every redeploy/restart.

`app/api/article/[id]/route.ts` looks up a single article from that same cache (re-fetching `/api/articles` on a cache miss), and if the stored `content` looks truncated (empty, contains a Guardian-style `[+N chars]` marker, or is short/placeholder-like per `isBadDescription`), scrapes the full article body from its source URL using `lib/scrapeArticle.ts` (Cheerio, tries a list of common article-body selectors, falls back to concatenating all `<p>` tags). Dev.to articles are skipped for scraping since the API already returns full `body_html`. If scraping fails, it falls back to a small HTML snippet linking out to the original source.

### Current state / known gaps

Per `app/goals` (project roadmap notes) and the stated FYP objectives, the app is meant to become a full PWA: service worker registration, a Web App Manifest for installability, and layered cache strategies (cache-first for static assets/fonts, cache-first or stale-while-revalidate for article data) so the Library can show real "offline available" status and `OfflineIndicator` can reflect real network/sync state. None of that is implemented yet — `public/` only has the default `create-next-app` SVGs, there's no manifest or service worker file, and `OfflineIndicator` is not yet wired to real cache state. Treat this as the primary direction for new work unless told otherwise.
