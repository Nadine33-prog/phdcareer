// ═══ 博士非学术职业评估 · 匹配算法 ═══
import type { CategoryMatch, RadarScores, AssessmentResult } from "@/types/assessment";
import { SIMPLIFIED_WEIGHTS } from "@/data/assessment-weights";
import { CATEGORY_NAMES } from "@/types/assessment";

export function computeMatch(answersB: Record<string, number>, answersC: Record<string, number>): CategoryMatch[] {
  const bKeys = Object.keys(answersB), cKeys = Object.keys(answersC);
  if (bKeys.length === 0 && cKeys.length === 0) return [];

  const meanB = bKeys.length ? bKeys.reduce((s, k) => s + (answersB[k] || 0), 0) / bKeys.length : 3;
  const meanC = cKeys.length ? cKeys.reduce((s, k) => s + (answersC[k] || 0), 0) / cKeys.length : 3;

  // 构建权重查询 map
  const wMap = new Map<string, number>();
  for (const w of SIMPLIFIED_WEIGHTS) { wMap.set(`${w.itemId}_${w.categoryId}`, w.weight); }

  const raws: number[] = [];
  for (let d = 1; d <= 8; d++) {
    let interestNum = 0, interestDen = 0, skillNum = 0, skillDen = 0;
    for (const k of bKeys) { const w = wMap.get(`${k}_${d}`) || 0; if (w > 0) { interestNum += ((answersB[k] || 0) - meanB) * w; interestDen += w; } }
    for (const k of cKeys) { const w = wMap.get(`${k}_${d}`) || 0; if (w > 0) { skillNum += ((answersC[k] || 0) - meanC) * w; skillDen += w; } }
    const is = interestDen > 0 ? interestNum / interestDen : 0;
    const ss = skillDen > 0 ? skillNum / skillDen : 0;
    raws.push(0.5 * is + 0.5 * ss);
  }

  const minR = Math.min(...raws), maxR = Math.max(...raws);
  const range = maxR - minR || 1;

  const results: CategoryMatch[] = [];
  for (let d = 1; d <= 8; d++) {
    const matchPercent = Math.round(((raws[d - 1] - minR) / range) * 100);
    results.push({ categoryId: d, categoryName: CATEGORY_NAMES[d] || `分类${d}`, matchPercent, interestScore: 0, skillScore: 0, conflicts: [] });
  }
  results.sort((a, b) => b.matchPercent - a.matchPercent);
  return results;
}

export function computeRadar(answersC: Record<string, number>): RadarScores {
  const c = (ids: string[]) => { const vals = ids.map(i => answersC[i] || 0).filter(v => v > 0); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; };
  return { research: c(["C01","C02","C03","C04"]), communication: c(["C05","C06","C07","C08"]), organization: c(["C09","C10","C11","C12","C13","C14","C15","C16"]), technical: c(["C17","C18","C19","C20"]), service: c(["C21","C22","C23","C24"]) };
}

export function checkConflicts(answersE: Record<string, string | number>, matches: CategoryMatch[]): CategoryMatch[] {
  const rules: { cond: (e: Record<string, string | number>) => boolean; catId: number; msg: string }[] = [
    { cond: e => e.E01 === "必须有编制", catId: 4, msg: "该分类以市场化聘用为主，与你的编制偏好存在冲突" },
    { cond: e => e.E01 === "倾向市场化", catId: 2, msg: "该分类为体制内身份，与你的市场化偏好存在冲突" },
    { cond: e => e.E01 === "倾向市场化", catId: 7, msg: "该分类为体制内身份，与你的市场化偏好存在冲突" },
    { cond: e => Number(e.E03) >= 4, catId: 1, msg: "该分类薪资中位数通常低于你的底线" },
    { cond: e => Number(e.E03) >= 4, catId: 5, msg: "该分类薪资中位数通常低于你的底线" },
    { cond: e => Number(e.E03) >= 4, catId: 2, msg: "该分类薪资中位数通常低于你的底线" },
    { cond: e => Number(e.E04) <= 2, catId: 4, msg: "该分类普遍节奏较快，与你的节奏偏好存在张力" },
    { cond: e => e.E05 === "不接受", catId: 7, msg: "该分类对纪律性与政治要求较高，与你的偏好冲突" },
    { cond: e => e.E05 === "不接受", catId: 2, msg: "该分类对纪律性与政治要求较高，与你的偏好冲突" },
  ];
  return matches.map(m => ({ ...m, conflicts: rules.filter(r => r.catId === m.categoryId && r.cond(answersE)).map(r => r.msg) }));
}

export function generateValuesQuestions(top5Ids: string[]): string[] {
  const map: Record<string, string> = {
    D01: "这个岗位的编制性质是什么？续聘/裁撤的历史记录如何？", D02: "该岗位近三年实际到手收入的中位数是多少？",
    D03: "选题自由度多大？成果归属如何界定？", D04: "这个头衔在你在意的圈子里如何被看待？",
    D05: "在岗者如何描述典型的一周？加班是常态还是例外？", D06: "你的工作成果最终惠及谁？链条有多长？",
    D07: "入职三年后，这个岗位还能让你学到新东西吗？", D08: "提出新想法在这里会被鼓励还是被视为麻烦？",
    D09: "从该岗位到上一级平均需要几年？卡点在哪里？", D10: "团队流动率如何？离开的人为什么离开？",
    D11: "日常工作受多少层审批约束？", D12: "你的报告/成果真的会被决策者读到吗？",
    D13: "该岗位是否绑定特定城市？调动可能性多大？", D14: "从这个岗位跳出去，市场认可哪些经验？",
    D15: "多少年资后你能参与真正的决策？", D16: "一年后你的工作内容会有多大比例是重复的？",
    D17: "岗位职责说明书与实际工作的一致性如何？", D18: "请假、育儿、照护在这个单位的实际容忍度？",
  };
  return top5Ids.map(id => map[id] || "").filter(Boolean);
}

export function getTop1Label(matches: CategoryMatch[]): string {
  if (matches.length === 0) return "数据不足以生成画像";
  const top = matches[0];
  const labels: Record<number, string> = { 1: "学术深耕者", 2: "公共服务者", 3: "政策洞察者", 4: "商业创新者", 5: "文化传播者", 6: "健康守护者", 7: "纪律执行者", 8: "多元探索者" };
  return labels[top.categoryId] || "多元探索者";
}

export function evaluateAssessment(answersB: Record<string, number>, answersC: Record<string, number>, answersD: string[], answersE: Record<string, string | number>): AssessmentResult {
  const matches = checkConflicts(answersE, computeMatch(answersB, answersC));
  return { matches, radar: computeRadar(answersC), top1Label: getTop1Label(matches), valuesQuestions: generateValuesQuestions(answersD), createdAt: new Date().toISOString() };
}
