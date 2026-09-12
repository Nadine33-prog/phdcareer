// ═══ 职位预警 · 类型定义 ═══

export type RiskLevel = "高" | "中" | "低";

export interface RiskRule {
  id: number;
  type: string;
  level: RiskLevel;
  scoreWeight: number;
  patterns: string[];
  description: string;
  interviewQuestions: string[];
}

export interface DetectedRisk {
  type: string;
  level: RiskLevel;
  desc: string;
}

export interface WarningResult {
  score: number;
  level: "高风险" | "中风险" | "低风险";
  riskCount: number;
  risks: DetectedRisk[];
  interviewQuestions: string[];
  peerComparison: string;
}

export type WarningStage = "input" | "scanning" | "result";
