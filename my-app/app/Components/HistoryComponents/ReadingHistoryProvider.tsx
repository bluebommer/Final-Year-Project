// Components/HistoryComponents/ReadingHistoryProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReadingHistoryContextType {
  readArticles: string[];
  markAsRead: (articleId: string) => void;
  isRead: (articleId: string) => boolean;
  getRecentReads: (limit?: number) => string[];
}

const ReadingHistoryContext = createContext<ReadingHistoryContextType | undefined>(undefined);

export function ReadingHistoryProvider({ children }: { children: React.ReactNode }) {
  const [readArticles, setReadArticles] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('readLite_readHistory');
    if (stored) {
      try {
        setReadArticles(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('readLite_readHistory', JSON.stringify(readArticles));
  }, [readArticles]);

  const markAsRead = (articleId: string) => {
    setReadArticles(prev => {
      // Remove if already present to reorder (most recent first)
      const filtered = prev.filter(id => id !== articleId);
      return [articleId, ...filtered];
    });
  };

  const isRead = (articleId: string) => readArticles.includes(articleId);

  const getRecentReads = (limit = 5) => readArticles.slice(0, limit);

  return (
    <ReadingHistoryContext.Provider value={{ readArticles, markAsRead, isRead, getRecentReads }}>
      {children}
    </ReadingHistoryContext.Provider>
  );
}

export function useReadingHistory() {
  const context = useContext(ReadingHistoryContext);
  if (!context) throw new Error('useReadingHistory must be used within ReadingHistoryProvider');
  return context;
}