import type { CategoryMatch, RadarScores, AssessmentResult } from "@/types/assessment";
export declare function computeMatch(answersB: Record<string, number>, answersC: Record<string, number>): CategoryMatch[];
export declare function computeRadar(answersC: Record<string, number>): RadarScores;
export declare function checkConflicts(answersE: Record<string, string | number>, matches: CategoryMatch[]): CategoryMatch[];
export declare function generateValuesQuestions(top5Ids: string[]): string[];
export declare function getTop1Label(matches: CategoryMatch[]): string;
export declare function evaluateAssessment(answersB: Record<string, number>, answersC: Record<string, number>, answersD: string[], answersE: Record<string, string | number>): AssessmentResult;
//# sourceMappingURL=matching.d.ts.map