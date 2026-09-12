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
export declare const DEFAULT_ANSWERS: Answers;
export declare const CATEGORY_NAMES: Record<number, string>;
//# sourceMappingURL=assessment.d.ts.map