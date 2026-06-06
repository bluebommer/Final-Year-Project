export interface Article {
  id: string;
  category: string;
  title: string;
  description?: string;
  readTime: string;
  isStaffPick?: boolean;
  isNewRelease?: boolean;
  authorAvatar?: string;
  authorColor?: string;
  imageBg?: string;
  imageType?: 'abstract3d' | 'landscape' | 'card';
}