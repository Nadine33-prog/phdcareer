import type { ThresholdForm, ThresholdResult, CompareStatus } from "@/types/threshold";
export declare function clamp(value: number, min?: number, max?: number): number;
/** 教育背景：博士(0.5) + 硕士(0.25) + 本科(0.15) + 博后(0.10) */
export declare function calcEduScore(form: ThresholdForm): number;
/** 论文产出：SCI 分区加权 + CSSCI + EI */
export declare function calcPaperScore(form: ThresholdForm): number;
/** 学术影响力：h-index + 引用/审稿 + 人才称号 */
export declare function calcImpactScore(form: ThresholdForm): number;
/** 基金课题 */
export declare function calcGrantScore(form: ThresholdForm): number;
/** 海外经历 + 英语 */
export declare function calcOverseasScore(form: ThresholdForm): number;
/** 学术年龄 */
export declare function calcAgeScore(age: number, phdYears: number): number;
/** 获奖成果 */
export declare function calcAwardScore(form: ThresholdForm): number;
/** 示意分位：100 − 综合分。样本未满 NORM_READY_TOTAL 前继续用这个。 */
export declare function calcPercentile(userScore: number): number;
export declare const NORM_READY_TOTAL: number;
export declare const NORM_GROUP_MIN: number;
export declare const NORM_DEDUPE_DAYS: number;
export declare function calcEmpiricalPercentile(userScore: number, peerScores: number[]): number;
export declare function judgeSchool(have: string, targetTier: string): CompareStatus;
export declare function parseFacultyList(text: string): number;
export declare function getTargetBench(targetTier: string, facultyN: number): {
    edu: number;
    paper: number;
    grant: number;
    overseas: number;
    age: number;
    impact: number;
    award: number;
};
export declare function evaluate(form: ThresholdForm): ThresholdResult;
//# sourceMappingURL=scoring.d.ts.map