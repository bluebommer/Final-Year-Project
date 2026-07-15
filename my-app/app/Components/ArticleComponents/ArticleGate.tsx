// Components/ArticleComponents/ArticleGate.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import type { Article } from '@/app/types/article';
import { getArticle as getSavedArticle } from '@/lib/offlineDB';

const ArticleReader = dynamic(
  () => import('@/app/Components/ArticleComponents/ArticleReader')
);

interface ArticleGateProps {
  id: string;
  article: Article | null;
}

type Status = 'checking' | 'found' | 'missing';

// The server already tried /api/article/[id] (and its own /api/articles
// fallback) before this ever renders. If that failed — offline, or the
// per-process article cache in lib/articleCache.ts reset (server
// restart/cold start) and the article has since rotated out of the live
// feeds it was originally fetched from — the user's own saved copy in
// IndexedDB is still authoritative for anything they bookmarked. Only once
// that also misses is this genuinely a 404.
export default function ArticleGate({ id, article }: ArticleGateProps) {
  const [resolved, setResolved] = useState<Article | null>(article);
  const [status, setStatus] = useState<Status>(article ? 'found' : 'checking');

  useEffect(() => {
    if (article) return;
    let cancelled = false;
    getSavedArticle(id).then((saved) => {
      if (cancelled) return;
      if (saved) {
        setResolved(saved);
        setStatus('found');
      } else {
        setStatus('missing');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [article, id]);

  if (status === 'missing') notFound();

  if (status === 'checking') {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary, #94a3b8)',
          fontSize: 14,
        }}
      >
        Loading article…
      </div>
    );
  }

  return <ArticleReader article={resolved as Article} />;
}
