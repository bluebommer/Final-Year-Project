// app/types/article.ts
export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  isStaffPick?: boolean;
  isNewRelease?: boolean;
  imageType?: string; // optional, still used for abstract visuals
  imageUrl?: string;  // new: real image URL from source
  author: string;
  authorInitial: string;
  authorColor: string;
  publishedAt: string;
  source: string;
  url: string;        // link to original article
}