// ═══ 种子数据脚本 ═══
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "../../src/data/categories.js";
import { DEFAULT_CATEGORY_MEDIA, pickCategoryMedia } from "../../src/data/category-media.js";
import { SIMPLIFIED_WEIGHTS } from "../../src/data/assessment-weights.js";
import { QUESTIONS } from "../../src/data/assessment-questions.js";
import { VALUES } from "../../src/data/values.js";
import { DEMO_JOBS } from "../../src/data/demoJobs.js";
import { DEMO_DESTINATIONS, DEMO_INTERVIEWS, DEMO_SALARIES } from "../../src/data/demoInsights.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始播种种子数据...");

  // ── 清理可重复创建的数据 ──
  await prisma.job.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.riskRule.deleteMany();
  await prisma.conflictRule.deleteMany();
  await prisma.valuesQuestion.deleteMany();
  console.log("  🧹 已清理旧数据");

  // ── Admin 用户 ──
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({ where: { username: "admin" }, update: {}, create: { username: "admin", password: hashedPassword, role: "admin" } });
  console.log("  ✅ 管理员账号: admin / admin123");

  // ── 8 个职业分类 ──
  for (const cat of CATEGORIES) {
    const media = DEFAULT_CATEGORY_MEDIA[cat.id] ?? pickCategoryMedia();
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        tagline: cat.tagline,
        overview: cat.overview,
        positions: cat.positions as never,
        employers: cat.employers as never,
        interviews: cat.interviews as never,
        openings: cat.openings as never,
      },
      create: {
        id: cat.id,
        name: cat.name,
        tagline: cat.tagline,
        overview: cat.overview,
        positions: cat.positions as never,
        employers: cat.employers as never,
        interviews: cat.interviews as never,
        openings: cat.openings as never,
        coverImage: media.coverImage,
        heroImage: media.heroImage,
        imageAlt: media.imageAlt,
        tone: media.tone,
        gallery: media.gallery as never,
      },
    });
  }
  console.log(`  ✅ ${CATEGORIES.length} 个职业分类`);

  // ── 岗位数据（与 src/data/demoJobs.ts 同源）──
  for (const job of DEMO_JOBS) {
    const { id: _id, ...data } = job;
    await prisma.job.create({ data: data as never });
  }
  console.log(`  ✅ ${DEMO_JOBS.length} 个岗位`);

  // ── 评估题项 ──
  for (const q of QUESTIONS) {
    await prisma.assessmentItem.upsert({ where: { itemId: q.id }, update: { module: q.module, dimension: q.dimension, textZh: q.text, scaleType: q.scaleType, options: q.options as never }, create: { itemId: q.id, module: q.module, dimension: q.dimension, textZh: q.text, scaleType: q.scaleType, options: q.options as never } });
  }
  console.log(`  ✅ ${QUESTIONS.length} 道评估题目`);

  // ── 权重矩阵 ──
  for (const w of SIMPLIFIED_WEIGHTS) {
    await prisma.assessmentWeight.upsert({ where: { itemId_categoryId: { itemId: w.itemId, categoryId: w.categoryId } }, update: { weight: w.weight }, create: { itemId: w.itemId, categoryId: w.categoryId, weight: w.weight } });
  }
  console.log(`  ✅ ${SIMPLIFIED_WEIGHTS.length} 条权重记录`);

  // ── 18 项价值观 ──
  for (const v of VALUES) { await prisma.valuesQuestion.create({ data: { valueId: v.id, question: v.question } }); }
  console.log(`  ✅ ${VALUES.length} 项价值观追问`);

  // ── 基准配置 ──
  await prisma.benchmark.createMany({ data: [
    { key: "school_scores", data: { "C9": 100, "海外名校": 95, "985": 82, "海外": 78, "211": 62, "海外其他": 65, "省属": 40, "普通本科": 28, "民办": 12, "其他": 25, "无": 0 } },
    { key: "tier_benchmarks", data: { "顶尖 (C9 / 海外世界一流)": { edu: 95, paper: 92, grant: 88, overseas: 90, age: 78, impact: 90, award: 85 }, "985 高校": { edu: 78, paper: 72, grant: 65, overseas: 70, age: 72, impact: 68, award: 55 }, "211 高校": { edu: 62, paper: 56, grant: 45, overseas: 50, age: 70, impact: 48, award: 38 }, "省属重点": { edu: 48, paper: 40, grant: 30, overseas: 35, age: 68, impact: 32, award: 22 }, "一般本科": { edu: 35, paper: 28, grant: 18, overseas: 22, age: 65, impact: 20, award: 12 } } },
    { key: "recommendation_rules", data: [{ condition: "paperScore < 45", text: "「论文产出」是核心短板。建议集中冲击 SCI/SSCI 一作 1–2 篇，优先投 Q1/Q2 期刊。" }, { condition: "grantScore < 40", text: "「基金课题」较弱。重点冲刺国自然青年 / 国社科青年项目。" }, { condition: "overseasScore < 35", text: "「海外经历」不足。建议申请 CSC 公派访学或博士后海外联培项目，至少积累 1 年以上。" }, { condition: "impactScore < 30", text: "「学术影响力」偏低。可通过担任期刊审稿人、积极参与学术会议来加速建立学术声誉。" }, { condition: "awardScore < 25", text: "「获奖成果」偏弱。可关注省部级科研成果奖申报，发明专利和学术专著也能有效补充。" }, { condition: "eduScore > 80", text: "「教育背景」是你的明显优势，建议在求职材料中突出展示。" }] },
  ], skipDuplicates: true });
  console.log("  ✅ 基准配置");

  // ── 风险规则 ──
  await prisma.riskRule.createMany({ data: [
    { type: "预聘制 (Tenure-Track)", level: "高", scoreWeight: 25, patterns: ["预聘", "特聘", "tenure.track", "3\\+3", "聘期"], description: "该 JD 含预聘制条款。", interviewQuestions: ["首聘期考核如未通过，是否有过渡岗位或转长聘的可能？", "续聘考核的具体指标是什么？"] },
    { type: "数量化考核条款", level: "高", scoreWeight: 25, patterns: ["发表.*≥\\s*\\d+\\s*篇", "SSCI.*\\d+\\s*篇", "课题.*≥\\s*\\d+\\s*项", "不予续聘"], description: "该 JD 包含硬性数量化考核要求。", interviewQuestions: ["数量化考核指标是否按期刊分区折算？"] },
    { type: "年龄门槛", level: "中", scoreWeight: 20, patterns: ["≤\\s*35\\s*岁", "35 周岁以下", "不超过 35"], description: "该 JD 设定了年龄限制。", interviewQuestions: ["年龄限制是否有弹性空间？"] },
    { type: "薪资模糊条款", level: "中", scoreWeight: 15, patterns: ["一人一议", "含绩效", "薪资面议", "待遇从优"], description: "该 JD 的薪资表述较为模糊。", interviewQuestions: ["近三年同岗位实际到手中位数是多少？"] },
    { type: "非升即走", level: "高", scoreWeight: 25, patterns: ["非升即走", "不予续聘", "不续聘", "考核不合格"], description: "该岗位包含非升即走条款。", interviewQuestions: ["未续聘时已发表成果的归属如何处理？"] },
    { type: "安家费模糊", level: "低", scoreWeight: 10, patterns: ["提供.*住房", "周转房", "安家费"], description: "该 JD 提及住房福利但未注明具体细节。", interviewQuestions: ["住房/安家费的具体发放方式是什么？"] },
  ], skipDuplicates: true });
  console.log("  ✅ 6 条风险规则");

  // ── 冲突规则 ──
  await prisma.conflictRule.createMany({ data: [
    { field: "E01", condition: "必须有编制", categoryId: 4, message: "该分类以市场化聘用为主，与你的编制偏好存在冲突" },
    { field: "E01", condition: "倾向市场化", categoryId: 2, message: "该分类为体制内身份，与你的市场化偏好存在冲突" },
    { field: "E01", condition: "倾向市场化", categoryId: 7, message: "该分类为体制内身份，与你的市场化偏好存在冲突" },
    { field: "E03", condition: "40 万以上", categoryId: 1, message: "该分类薪资中位数通常低于你的底线" },
    { field: "E03", condition: "40 万以上", categoryId: 5, message: "该分类薪资中位数通常低于你的底线" },
    { field: "E04", condition: "≤2", categoryId: 4, message: "该分类普遍节奏较快，与你的节奏偏好存在张力" },
    { field: "E05", condition: "不接受", categoryId: 7, message: "该分类对纪律性与政治要求较高" },
    { field: "E05", condition: "不接受", categoryId: 2, message: "该分类对纪律性与政治要求较高" },
  ], skipDuplicates: true });
  console.log("  ✅ 8 条冲突规则");

  // ── 去向 / 薪资 / 访谈（与 src/data/demoInsights.ts 同源）──
  for (const d of DEMO_DESTINATIONS) {
    await prisma.destination.create({ data: d as never });
  }
  console.log(`  ✅ ${DEMO_DESTINATIONS.length} 条去向记录`);

  for (const s of DEMO_SALARIES) {
    await prisma.salary.create({ data: s });
  }
  console.log(`  ✅ ${DEMO_SALARIES.length} 条薪资记录`);

  for (const iv of DEMO_INTERVIEWS) {
    await prisma.interview.create({ data: iv });
  }
  console.log(`  ✅ ${DEMO_INTERVIEWS.length} 条访谈`);

  console.log("\n🎉 种子数据播种完成！");
  console.log("   Admin 登录: admin / admin123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
