export const DEFAULT_RISK_RULES = [
    { id: 1, type: "预聘制 (Tenure-Track)", level: "高", scoreWeight: 25, patterns: ["预聘", "特聘", "tenure.track", "3\\+3", "聘期"], description: "该 JD 含预聘制条款，聘期内有明确的考核要求，未通过可能不予续聘。", interviewQuestions: ["首聘期考核如未通过，是否有过渡岗位或转长聘的可能？", "续聘考核的具体指标是什么？是否有申诉机制？"] },
    { id: 2, type: "数量化考核条款", level: "高", scoreWeight: 25, patterns: ["发表.*≥\\s*\\d+\\s*篇", "SSCI.*\\d+\\s*篇", "CSSCI.*\\d+\\s*篇", "SCI.*\\d+\\s*篇", "课题.*≥\\s*\\d+\\s*项", "不予续聘"], description: "该 JD 包含硬性数量化考核要求。", interviewQuestions: ["数量化考核指标是否按期刊分区折算？未达标时是否有缓冲期？"] },
    { id: 3, type: "年龄门槛", level: "中", scoreWeight: 20, patterns: ["≤\\s*35\\s*岁", "35 周岁以下", "不超过 35", "不超过35"], description: "该 JD 设定了年龄限制，对博士在读年限较长者不友好。", interviewQuestions: ["年龄限制是否有弹性空间（如对海外博后经历放宽）？"] },
    { id: 4, type: "薪资模糊条款", level: "中", scoreWeight: 15, patterns: ["一人一议", "含绩效", "薪资面议", "待遇从优", "面谈"], description: "该 JD 的薪资表述较为模糊，实际到手金额可能存在较大偏差。", interviewQuestions: ["近三年同岗位实际到手中位数是多少？绩效占比多少？"] },
    { id: 5, type: "非升即走", level: "高", scoreWeight: 25, patterns: ["非升即走", "不予续聘", "不续聘", "考核不合格"], description: "该岗位包含明确的'非升即走'条款。", interviewQuestions: ["未续聘时已发表成果的归属如何处理？离职手续流程是什么？"] },
    { id: 6, type: "安家费/住房模糊", level: "低", scoreWeight: 10, patterns: ["提供.*住房", "周转房", "安家费"], description: "该 JD 提及住房或安家福利但未注明具体面积、产权或发放方式。", interviewQuestions: ["住房/安家费的具体发放方式是什么？是否有服务期限制？"] },
];
export function scanJD(jdText, rules = DEFAULT_RISK_RULES) {
    const detected = [];
    let totalScore = 0;
    for (const rule of rules) {
        const matched = rule.patterns.some(pattern => { try {
            return new RegExp(pattern, "i").test(jdText);
        }
        catch {
            return jdText.includes(pattern);
        } });
        if (matched) {
            totalScore += rule.scoreWeight;
            detected.push({ type: rule.type, level: rule.level, desc: rule.description });
        }
    }
    totalScore = Math.min(100, totalScore);
    const allQuestions = detected.flatMap(r => rules.find(rr => rr.type === r.type)?.interviewQuestions || []);
    return { score: totalScore, level: totalScore >= 70 ? "高风险" : totalScore >= 40 ? "中风险" : "低风险", riskCount: detected.length, risks: detected, interviewQuestions: [...new Set(allQuestions)], peerComparison: detected.length === 0 ? "未识别到常见风险条款，该岗位 JD 相对透明。" : "近两年同类岗位中，以上识别到的条款在学术招聘 JD 中出现频率较高。建议结合面试深入核实。" };
}
//# sourceMappingURL=jdAnalyzer.js.map