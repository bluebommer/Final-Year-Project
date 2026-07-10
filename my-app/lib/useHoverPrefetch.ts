// lib/useHoverPrefetch.ts
//
// Article pages (app/article/[id]/page.tsx) are a fully dynamic Server
// Component (no generateStaticParams, no loading.tsx) — Next.js's automatic
// viewport-based <Link> prefetching does not warm their actual data fetch
// for routes like this, only a static shell if one exists. An explicit
// router.prefetch() call does force Next to run and cache that route's real
// render, which is what makes hover-to-click feel instant. Gated behind a
// short delay (ignores accidental mouse passes) and data-saver mode.
'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isDataSaverActive } from './prefetch';

const HOVER_DELAY_MS = 150;

export function useHoverPrefetch(href: string) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onMouseEnter() {
    if (isDataSaverActive()) return;
    timerRef.current = setTimeout(() => {
      router.prefetch(href);
    }, HOVER_DELAY_MS);
  }

  function onMouseLeave() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return { onMouseEnter, onMouseLeave };
}
