export type DisciplineMajor = "经管法" | "人文" | "理工" | "医学" | "艺术与其他";
export type SchoolTier = "C9" | "海外名校" | "985" | "海外" | "211" | "省属" | "普通本科" | "民办" | "其他" | "无";
export type TargetTier = "顶尖 (C9 / 海外世界一流)" | "985 高校" | "211 高校" | "省属重点" | "一般本科";
export type TargetLevel = "讲师 / 助理教授" | "副教授（预聘）" | "副教授（长聘）";
export type CompareStatus = "pass" | "warn" | "fail";
export type OverseasType = "无" | "短期访学(≤1年)" | "长期联培(>1年)" | "海外学位";
export type EnglishLevel = "CET-6" | "IELTS 6.5+" | "TOEFL 90+" | "无";
export type SciQuartile = "Q1" | "Q2" | "Q3" | "Q4" | "无";
export type MonographCount = "0" | "独著1+" | "合著1+";
export type AwardLevel = "国家级" | "省部级" | "校级" | "无";
export type TalentLevel = "国家级(青千/优青等)" | "省部级" | "无";
export interface ThresholdForm {
    disciplineMajor: DisciplineMajor;
    disciplineMinor: string;
    phdYear: string;
    age: string;
    phdYears: string;
    hasPostdoc: "有" | "无";
    postdocTier: SchoolTier;
    postdocYears: string;
    phdSchool: SchoolTier;
    masterSchool: SchoolTier;
    bachelorSchool: SchoolTier;
    overseasType: OverseasType;
    englishLevel: EnglishLevel;
    sci: string;
    sciFirst: string;
    sciTopQ: SciQuartile;
    cssci: string;
    cssciFirst: string;
    ei: string;
    hindex: string;
    patents: string;
    monographs: MonographCount;
    nationalGrants: string;
    natSciSocSci: string;
    natGrantFunding: string;
    provincialGrants: string;
    highestAward: AwardLevel;
    talentTitle: TalentLevel;
    reviewer: "有" | "无";
    hasTarget: "" | "yes" | "no";
    targetTier: TargetTier;
    targetDept: DisciplineMajor;
    targetLevel: TargetLevel;
    targetFacultyList: string;
}
export interface ScoreBreakdown {
    eduScore: number;
    paperScore: number;
    grantScore: number;
    overseasScore: number;
    ageScore: number;
    impactScore: number;
    awardScore: number;
    userScore: number;
    percentile: number;
}
export interface RadarDataPoint {
    axis: string;
    you: number;
    target?: number;
}
export interface ComparisonRow {
    item: string;
    need: string;
    you: string;
    status: CompareStatus;
}
export type PercentileSource = "illustrative" | "empirical";
export interface ThresholdNormMeta {
    percentileSource: PercentileSource;
    sampleN: number;
    readyAt: number;
}
export interface ThresholdResult {
    breakdown: ScoreBreakdown;
    radarData: RadarDataPoint[];
    hasTarget: boolean;
    targetRows?: ComparisonRow[];
    matchPct?: number;
    verdict?: "高度匹配" | "部分达标" | "差距较大";
    facultyN?: number;
    recommendations: string[];
    disciplineMajor: DisciplineMajor;
    disciplineMinor: string;
    phdYear: string;
    norm?: ThresholdNormMeta;
}
export type ThresholdStep = 1 | 2 | 3 | 4;
export type ThresholdStage = "input" | "loading" | "result";
export declare const DEFAULT_THRESHOLD_FORM: ThresholdForm;
//# sourceMappingURL=threshold.d.ts.map