// ── 院校层次分值 ──
const SCHOOL_SCORE = { "C9": 100, "海外名校": 95, "985": 82, "海外": 78, "211": 62, "省属": 40, "普通本科": 28, "民办": 12, "其他": 25, "无": 0 };
const SCHOOL_ORDER = { "C9": 5, "海外名校": 5, "985": 4, "海外": 3, "211": 3, "省属": 2, "普通本科": 1, "民办": 1, "其他": 1, "无": 0 };
// ── SCI 分区系数 ──
const Q_FACTOR = { "Q1": 1.0, "Q2": 0.7, "Q3": 0.45, "Q4": 0.25, "无": 0 };
// ── 海外经历类型系数 ──
const OVERSEAS_SCORE = { "无": 0, "短期访学(≤1年)": 30, "长期联培(>1年)": 55, "海外学位": 92 };
// ── 英语水平分值 ──
const ENGLISH_SCORE = { "无": 0, "CET-6": 25, "IELTS 6.5+": 55, "TOEFL 90+": 55 };
// ── 获奖分值 ──
const AWARD_SCORE = { "国家级": 100, "省部级": 55, "校级": 20, "无": 0 };
// ── 人才称号分值 ──
const TALENT_SCORE = { "国家级(青千/优青等)": 100, "省部级": 55, "无": 0 };
// ── 专著分值 ──
const MONOGRAPH_SCORE = { "独著1+": 60, "合著1+": 30, "0": 0 };
// ── 各层次高校门槛基准 ──
const TIER_BENCHMARK = {
    "顶尖 (C9 / 海外世界一流)": { edu: 95, paper: 92, grant: 88, overseas: 90, age: 78, impact: 90, award: 85 },
    "985 高校": { edu: 78, paper: 72, grant: 65, overseas: 70, age: 72, impact: 68, award: 55 },
    "211 高校": { edu: 62, paper: 56, grant: 45, overseas: 50, age: 70, impact: 48, award: 38 },
    "省属重点": { edu: 48, paper: 40, grant: 30, overseas: 35, age: 68, impact: 32, award: 22 },
    "一般本科": { edu: 35, paper: 28, grant: 18, overseas: 22, age: 65, impact: 20, award: 12 },
};
// ═══════════════════════════════════════════
// 各维度评分函数
// ═══════════════════════════════════════════
export function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
/** 教育背景：博士(0.5) + 硕士(0.25) + 本科(0.15) + 博后(0.10) */
export function calcEduScore(form) {
    const s = SCHOOL_SCORE;
    let score = (s[form.phdSchool] || 50) * 0.50 + (s[form.masterSchool] || 50) * 0.25 + (s[form.bachelorSchool] || 50) * 0.15;
    if (form.hasPostdoc === "有")
        score += (s[form.postdocTier] || 50) * 0.10;
    else
        score += 50 * 0.10; // 无博后给基准分
    return Math.round(score);
}
/** 论文产出：SCI 分区加权 + CSSCI + EI */
export function calcPaperScore(form) {
    const sci = parseInt(form.sci) || 0, sciF = parseInt(form.sciFirst) || 0, cssci = parseInt(form.cssci) || 0, cssciF = parseInt(form.cssciFirst) || 0, ei = parseInt(form.ei) || 0;
    const qf = Q_FACTOR[form.sciTopQ] || 0;
    // SCI 一作/通讯贡献度 × 分区系数
    const sciScore = Math.min(70, (sciF * 16 + (sci - sciF) * 6) * qf);
    // CSSCI 一作贡献度
    const cssciScore = Math.min(40, cssciF * 8 + (cssci - cssciF) * 3);
    // EI / 北大核心
    const eiScore = Math.min(20, ei * 4);
    return clamp(Math.round(sciScore + cssciScore + eiScore), 0, 100);
}
/** 学术影响力：h-index + 引用/审稿 + 人才称号 */
export function calcImpactScore(form) {
    const hi = parseInt(form.hindex) || 0;
    const hScore = Math.min(50, hi * 5); // h-index 10 = 50
    const reviewerScore = form.reviewer === "有" ? 15 : 0;
    const talentScore = TALENT_SCORE[form.talentTitle] || 0;
    return clamp(Math.round(hScore + reviewerScore + talentScore * 0.35), 0, 100);
}
/** 基金课题 */
export function calcGrantScore(form) {
    const ng = parseInt(form.nationalGrants) || 0, nss = parseInt(form.natSciSocSci) || 0, pg = parseInt(form.provincialGrants) || 0;
    const fund = parseInt(form.natGrantFunding) || 0;
    const nsScore = Math.min(60, nss * 30 + (ng - nss) * 15); // 国自科/社科权重更高
    const provScore = Math.min(30, pg * 8);
    const fundScore = Math.min(10, Math.floor(fund / 20)); // 每 20 万 ≈ 1 分
    return clamp(Math.round(nsScore + provScore + fundScore), 0, 100);
}
/** 海外经历 + 英语 */
export function calcOverseasScore(form) {
    return clamp(Math.round(OVERSEAS_SCORE[form.overseasType] * 0.85 + ENGLISH_SCORE[form.englishLevel] * 0.15), 0, 100);
}
/** 学术年龄 */
export function calcAgeScore(age, phdYears) {
    return clamp(100 - (age - 28) * 5 - (phdYears - 4) * 3, 0, 100);
}
/** 获奖成果 */
export function calcAwardScore(form) {
    const award = AWARD_SCORE[form.highestAward] || 0;
    const patent = Math.min(30, (parseInt(form.patents) || 0) * 6);
    const mono = MONOGRAPH_SCORE[form.monographs] || 0;
    return clamp(Math.round(award * 0.5 + patent + mono), 0, 100);
}
/** 竞争力百分位（模拟同届分布） */
export function calcPercentile(userScore) { return clamp(100 - userScore, 1, 99); }
// ═══════════════════════════════════════════
// 目标院系对比
// ═══════════════════════════════════════════
export function judgeSchool(have, targetTier) {
    const got = SCHOOL_ORDER[have] || 1;
    let need;
    if (targetTier.startsWith("顶尖"))
        need = 5;
    else if (targetTier.startsWith("985"))
        need = 4;
    else if (targetTier.startsWith("211"))
        need = 3;
    else
        need = 2;
    if (got >= need)
        return "pass";
    if (got >= need - 1)
        return "warn";
    return "fail";
}
export function parseFacultyList(text) {
    if (!text?.trim())
        return 0;
    return text.split(/\n\s*\n+/).map(s => s.trim()).filter(s => s.length > 8).length;
}
export function getTargetBench(targetTier, facultyN) {
    const bench = TIER_BENCHMARK[targetTier] || TIER_BENCHMARK["985 高校"];
    if (facultyN === 0)
        return bench;
    return {
        edu: clamp(bench.edu + 4), paper: clamp(bench.paper + 6), grant: clamp(bench.grant + 2),
        overseas: clamp(bench.overseas + 8), age: clamp(bench.age - 2),
        impact: clamp(bench.impact + 4), award: clamp(bench.award + 2),
    };
}
// ═══════════════════════════════════════════
// 主评估函数
// ═══════════════════════════════════════════
export function evaluate(form) {
    const age = parseInt(form.age) || 30, phdYears = parseInt(form.phdYears) || 4;
    const eduScore = calcEduScore(form);
    const paperScore = calcPaperScore(form);
    const grantScore = calcGrantScore(form);
    const overseasScore = calcOverseasScore(form);
    const ageScore = calcAgeScore(age, phdYears);
    const impactScore = calcImpactScore(form);
    const awardScore = calcAwardScore(form);
    // 加权综合：教育 18% + 论文 28% + 课题 15% + 影响力 12% + 海外 10% + 年龄 5% + 获奖 12%
    const userScore = Math.round(eduScore * 0.18 + paperScore * 0.28 + grantScore * 0.15 +
        impactScore * 0.12 + overseasScore * 0.10 + ageScore * 0.05 + awardScore * 0.12);
    const percentile = calcPercentile(userScore);
    const radarData = [
        { axis: "教育背景", you: eduScore },
        { axis: "论文产出", you: paperScore },
        { axis: "基金课题", you: grantScore },
        { axis: "海外经历", you: overseasScore },
        { axis: "学术影响力", you: impactScore },
        { axis: "获奖成果", you: awardScore },
        { axis: "学术年龄", you: ageScore },
    ];
    const hasTarget = form.hasTarget === "yes";
    let targetRows;
    let matchPct;
    let verdict;
    let facultyN;
    if (hasTarget) {
        facultyN = parseFacultyList(form.targetFacultyList);
        const bench = getTargetBench(form.targetTier, facultyN);
        radarData[0].target = bench.edu;
        radarData[1].target = bench.paper;
        radarData[2].target = bench.grant;
        radarData[3].target = bench.overseas;
        radarData[4].target = bench.impact;
        radarData[5].target = bench.award;
        radarData[6].target = bench.age;
        const sci = parseInt(form.sci) || 0, cssci = parseInt(form.cssci) || 0, sciF = parseInt(form.sciFirst) || 0;
        const ng = parseInt(form.nationalGrants) || 0, nss = parseInt(form.natSciSocSci) || 0;
        targetRows = [
            { item: "博士院校层次", need: form.targetTier.startsWith("顶尖") ? "C9 / 海外名校" : (form.targetTier.startsWith("985") ? "985 及以上" : "211 及以上"), you: form.phdSchool, status: judgeSchool(form.phdSchool, form.targetTier) },
            { item: "SCI/SSCI 论文（一作/通讯）", need: form.targetTier.startsWith("顶尖") ? "≥ 4 篇" : "≥ 2 篇", you: `${sciF} 篇`, status: sciF >= (form.targetTier.startsWith("顶尖") ? 4 : 2) ? "pass" : (sciF >= 1 ? "warn" : "fail") },
            { item: "CSSCI 论文（一作）", need: form.targetTier.startsWith("顶尖") ? "≥ 3 篇" : "≥ 2 篇", you: `${cssci} 篇`, status: cssci >= 3 ? "pass" : (cssci >= 1 ? "warn" : "fail") },
            { item: "最高 SCI 分区", need: form.targetTier.startsWith("一般") ? "不限" : (form.targetTier.startsWith("211") ? "Q3 以上" : "Q2 以上"), you: form.sciTopQ, status: form.sciTopQ === "Q1" ? "pass" : (form.sciTopQ === "Q2" && !form.targetTier.startsWith("顶尖")) ? "pass" : (form.sciTopQ === "Q3" && form.targetTier.startsWith("一般")) ? "pass" : "warn" },
            { item: "国家级课题", need: (form.targetTier.startsWith("顶尖") || form.targetTier.startsWith("985")) ? "≥ 1 项" : "推荐有", you: nss > 0 ? `国家自科/社科 ${nss} 项` : `国 ${ng} 项`, status: nss >= 1 ? "pass" : (ng >= 1 ? "warn" : "fail") },
            { item: "海外经历", need: form.targetTier.startsWith("顶尖") ? "长期联培 / 海外学位" : "推荐有", you: form.overseasType, status: form.overseasType === "海外学位" ? "pass" : (form.overseasType === "长期联培(>1年)" && !form.targetTier.startsWith("顶尖")) ? "pass" : "warn" },
            { item: "学术影响力 (h-index)", need: form.targetTier.startsWith("顶尖") ? "≥ 12" : (form.targetTier.startsWith("985") ? "≥ 8" : "≥ 5"), you: `${form.hindex}`, status: (parseInt(form.hindex) || 0) >= (form.targetTier.startsWith("顶尖") ? 12 : form.targetTier.startsWith("985") ? 8 : 5) ? "pass" : "warn" },
            { item: "学术年龄", need: `≤ ${form.targetTier.startsWith("顶尖") ? 33 : 35} 岁`, you: `${age} 岁`, status: age <= (form.targetTier.startsWith("顶尖") ? 33 : 35) ? "pass" : "warn" },
        ];
        const passN = targetRows.filter(r => r.status === "pass").length;
        const warnN = targetRows.filter(r => r.status === "warn").length;
        matchPct = Math.round((passN + warnN * 0.5) / targetRows.length * 100);
        if (matchPct >= 80)
            verdict = "高度匹配";
        else if (matchPct >= 55)
            verdict = "部分达标";
        else
            verdict = "差距较大";
    }
    return {
        breakdown: { eduScore, paperScore, grantScore, overseasScore, ageScore, impactScore, awardScore, userScore, percentile },
        radarData, hasTarget, targetRows, matchPct, verdict, facultyN,
        recommendations: generateRecommendations({ eduScore, paperScore, grantScore, overseasScore, ageScore, impactScore, awardScore, userScore, percentile }, hasTarget, targetRows, form),
        disciplineMajor: form.disciplineMajor, disciplineMinor: form.disciplineMinor, phdYear: form.phdYear,
    };
}
function generateRecommendations(s, hasTarget, targetRows, form) {
    const r = [];
    if (s.paperScore < 45)
        r.push("「论文产出」是核心短板。建议集中冲击 SCI/SSCI 一作 1–2 篇，优先投 Q1/Q2 期刊以提升竞争力。");
    else if (s.paperScore < 65)
        r.push("「论文产出」有提升空间。若能将现有 Q3/Q4 投稿升级为 Q2 以上，竞争力将显著增强。");
    if (s.grantScore < 40)
        r.push("「基金课题」较弱。重点冲刺国自然青年 / 国社科青年项目，这是青年学者最重要的入场券。");
    if (s.overseasScore < 35)
        r.push("「海外经历」不足。建议申请 CSC 公派访学或博士后海外联培项目，至少积累 1 年以上海外经历。");
    if (s.impactScore < 30)
        r.push("「学术影响力」偏低。h-index 需要时间积累，但可通过担任期刊审稿人、积极参与学术会议来加速建立学术声誉。");
    if (s.awardScore < 25)
        r.push("「获奖成果」偏弱。可关注省部级科研成果奖申报，发明专利和学术专著也能有效补充。");
    if (s.eduScore > 80)
        r.push("「教育背景」是你的明显优势，建议在求职材料中突出展示。");
    if (s.userScore > 80)
        r.push("综合竞争力位于同届前列，可冲刺更高层次的目标院系。");
    if (hasTarget && targetRows) {
        const failN = targetRows.filter(r => r.status === "fail").length;
        if (failN === 0)
            r.push("目标院系门槛已全部达标！建议同时投递同层次 2–3 个院系作为备选。");
        else if (failN >= 3)
            r.push(`短期内补齐多项硬指标有难度，建议下沉一档目标层次，或先入职积累成果 2–3 年后再冲刺。`);
    }
    return r;
}
//# sourceMappingURL=scoring.js.map