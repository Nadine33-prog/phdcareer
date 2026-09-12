// ═══ 职业数据洞察 · 类型定义 ═══

export interface Destination {
  id: string;
  school: string;
  major: string;
  org: string;
  type: string;
  year: string;
  location: string;
  categoryId?: number | null;
  source?: string;
  sourceUrl?: string | null;
  isSynthetic?: boolean;
}

export interface SalaryRecord {
  id?: number;
  org: string;
  position: string;
  family: string;
  salary: number;
  year: number;
  n: number;
  source: string;
  sourceUrl?: string | null;
}

export interface InterviewRecord {
  id?: number;
  name: string;
  from: string;
  to: string;
  date: string;
  quote: string;
}

export type InsightsTab = "destination" | "salary" | "interviews";

export const trendData = [
  { year: "2019", 学术: 62, 体制内: 18, 产业: 12, 其他: 8 },
  { year: "2020", 学术: 58, 体制内: 19, 产业: 15, 其他: 8 },
  { year: "2021", 学术: 53, 体制内: 20, 产业: 19, 其他: 8 },
  { year: "2022", 学术: 48, 体制内: 21, 产业: 23, 其他: 8 },
  { year: "2023", 学术: 43, 体制内: 22, 产业: 26, 其他: 9 },
  { year: "2024", 学术: 40, 体制内: 22, 产业: 28, 其他: 10 },
  { year: "2025", 学术: 38, 体制内: 23, 产业: 29, 其他: 10 },
];
