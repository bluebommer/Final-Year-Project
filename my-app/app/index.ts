export interface Topic {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  category?: string;
  size?: "large" | "medium" | "small" | "wide";
  hasImage?: boolean;
  imageSrc?: string;
}

export type Page = "welcome" | "preferences" | "auth";

export interface UserProfile {
  name: string;
  gender: string;
  email: string;
  topics: string[];
}