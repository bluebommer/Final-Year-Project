// app/types/article.ts
export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  isStaffPick?: boolean;
  isNewRelease?: boolean;
  imageType?: string;
  imageUrl?: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  publishedAt: string;
  source: string;
  url: string;
  content?: string; // full article content (optional, for detail page)
}