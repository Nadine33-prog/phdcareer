// ═══ 职业分类 · 类型定义 ═══

export interface Position {
  title: string;
  salary: string;
  desc: string;
}

export interface CareerInterview {
  name: string;
  quote: string;
  path: string;
}

export interface OpeningBrief {
  title: string;
  org: string;
  location: string;
}

export type CategoryTone = "sand" | "blush" | "sage";

export interface Category {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  positions: Position[];
  employers: string[];
  interviews: CareerInterview[];
  openings: OpeningBrief[];
  coverImage?: string;
  heroImage?: string;
  imageAlt?: string;
  tone?: CategoryTone;
  gallery?: string[];
}
