// ═══ 博士非学术职业评估 · 类型定义 ═══

export interface Question {
  id: string;
  module: "A" | "B" | "C" | "D" | "E";
  text: string;
  scaleType: "likert5" | "single_choice" | "rank_select";
  options?: string[];
  dimension?: string;
}

export interface Answers {
  A: Record<string, string>;
  B: Record<string, number>;
  C: Record<string, number>;
  D: string[];
  E: Record<string, string | number>;
}

export interface CategoryMatch {
  categoryId: number;
  categoryName: string;
  matchPercent: number;
  interestScore: number;
  skillScore: number;
  conflicts: string[];
}

export interface RadarScores {
  research: number;
  communication: number;
  organization: number;
  technical: number;
  service: number;
}

export interface AssessmentResult {
  matches: CategoryMatch[];
  radar: RadarScores;
  top1Label: string;
  valuesQuestions: string[];
  createdAt: string;
}

export const DEFAULT_ANSWERS: Answers = {
  A: {}, B: {}, C: {}, D: [], E: {},
};

export const CATEGORY_NAMES: Record<number, string> = {
  1: "学术支撑", 2: "党政管理", 3: "社会智库", 4: "科技企业",
  5: "文化出版", 6: "医疗健康", 7: "军警文职", 8: "其他",
};
