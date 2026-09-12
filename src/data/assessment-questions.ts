// ═══ 模块 A/B/C/D/E 全部题项（87 题） ═══
// 模块 B 已按 8 分类重新标注 dimension 为新分类 ID
import type { Question } from "@/types/assessment";

export const QUESTIONS: Question[] = [
  // ═══ 模块 A：基本信息（4 题） ═══
  { id: "A01", module: "A", text: "你的学科门类", scaleType: "single_choice", options: ["经济学","应用经济学","工商管理","管理科学与工程","公共管理","法学","社会学","哲学","中国语言文学","外国语言文学","历史学","新闻传播学","教育学","图书情报与档案管理","数学","物理学","化学","生物学","计算机科学与技术","软件工程","信息与通信工程","控制科学与工程","机械工程","材料科学与工程","化学工程与技术","土木工程","环境科学与工程","基础医学","临床医学","公共卫生与预防医学","药学","中医学","护理学","音乐与舞蹈学","美术学","设计学","戏剧与影视学","体育学","农学"] },
  { id: "A02", module: "A", text: "你目前的阶段", scaleType: "single_choice", options: ["博士在读（前期）", "博士在读（毕业年）", "博士后", "已毕业工作中"] },
  { id: "A03", module: "A", text: "博士毕业年份（实际或预计）", scaleType: "single_choice", options: ["2023", "2024", "2025", "2026", "2027 及以后"] },
  { id: "A04", module: "A", text: "是否已有明确心仪的职业方向", scaleType: "single_choice", options: ["有，很明确", "有大致范围", "完全没有"] },

  // ═══ 模块 B：兴趣评估（36 题，1-5 李克特） ═══
  // B01-B04：教育教研 → 1.学术支撑
  { id: "B01", module: "B", text: "设计一门课程的教学大纲与课堂活动", scaleType: "likert5", dimension: "1" },
  { id: "B02", module: "B", text: "向初学者讲解复杂概念，并根据对方反应调整讲法", scaleType: "likert5", dimension: "1" },
  { id: "B03", module: "B", text: "长期指导学生完成论文或成长目标", scaleType: "likert5", dimension: "1" },
  { id: "B04", module: "B", text: "站上讲台进行系统性讲授", scaleType: "likert5", dimension: "1" },
  // B05-B08：科研院所 → 1.学术支撑
  { id: "B05", module: "B", text: "长期深入钻研一个学术问题，不受短期产出压力干扰", scaleType: "likert5", dimension: "1" },
  { id: "B06", module: "B", text: "设计研究方案并撰写课题申请书", scaleType: "likert5", dimension: "1" },
  { id: "B07", module: "B", text: "撰写学术论文并逐条回应同行评审意见", scaleType: "likert5", dimension: "1" },
  { id: "B08", module: "B", text: "系统追踪学科前沿文献并撰写综述", scaleType: "likert5", dimension: "1" },
  // B09-B12：学术支撑 → 1.学术支撑
  { id: "B09", module: "B", text: "为他人的研究提供文献、数据或平台支持", scaleType: "likert5", dimension: "1" },
  { id: "B10", module: "B", text: "建设和维护信息资源（数据库、特藏、实验平台）", scaleType: "likert5", dimension: "1" },
  { id: "B11", module: "B", text: "策划面向师生的培训、讲座或学科服务", scaleType: "likert5", dimension: "1" },
  { id: "B12", module: "B", text: "梳理机构内部流程规范，让系统运转更顺畅", scaleType: "likert5", dimension: "1" },
  // B13-B16：社会智库 → 3.社会智库
  { id: "B13", module: "B", text: "把研究发现转化为面向决策者的政策建议", scaleType: "likert5", dimension: "3" },
  { id: "B14", module: "B", text: "在时间压力下快速产出结构清晰的分析报告", scaleType: "likert5", dimension: "3" },
  { id: "B15", module: "B", text: "追踪政策与社会热点并快速作出研判", scaleType: "likert5", dimension: "3" },
  { id: "B16", module: "B", text: "与政府部门、媒体或国际机构沟通合作", scaleType: "likert5", dimension: "3" },
  // B17-B20：党政管理 → 2.党政管理
  { id: "B17", module: "B", text: "起草公文、讲话稿或综合性材料", scaleType: "likert5", dimension: "2" },
  { id: "B18", module: "B", text: "在层级组织中协调资源、推动一项工作落地", scaleType: "likert5", dimension: "2" },
  { id: "B19", module: "B", text: "处理多方利益相关者之间的沟通与平衡", scaleType: "likert5", dimension: "2" },
  { id: "B20", module: "B", text: "参与公共事务管理并承担相应的岗位责任", scaleType: "likert5", dimension: "2" },
  // B21-B24：军警文职 → 7.军警文职
  { id: "B21", module: "B", text: "在纪律性强、规范明确的组织中工作", scaleType: "likert5", dimension: "7" },
  { id: "B22", module: "B", text: "把专业知识应用于国防、安全或政法领域", scaleType: "likert5", dimension: "7" },
  { id: "B23", module: "B", text: "承担有保密要求的技术或研究任务", scaleType: "likert5", dimension: "7" },
  { id: "B24", module: "B", text: "服从统一管理，以集体目标优先安排个人工作", scaleType: "likert5", dimension: "7" },
  // B25-B28：企业研究 → 4.科技企业
  { id: "B25", module: "B", text: "用研究和数据解决真实的商业问题", scaleType: "likert5", dimension: "4" },
  { id: "B26", module: "B", text: "在快节奏、结果导向的环境中接受挑战", scaleType: "likert5", dimension: "4" },
  { id: "B27", module: "B", text: "把前沿技术或分析成果转化为产品与收益", scaleType: "likert5", dimension: "4" },
  { id: "B28", module: "B", text: "向非学术背景的同事清晰汇报并说服他们", scaleType: "likert5", dimension: "4" },
  // B29-B32：文化与出版 → 5.文化出版
  { id: "B29", module: "B", text: "评估、筛选和打磨他人的文字或内容", scaleType: "likert5", dimension: "5" },
  { id: "B30", module: "B", text: "策划展览、图书选题或文化产品", scaleType: "likert5", dimension: "5" },
  { id: "B31", module: "B", text: "面向公众传播知识与文化", scaleType: "likert5", dimension: "5" },
  { id: "B32", module: "B", text: "与作者、学者、艺术家建立长期合作关系", scaleType: "likert5", dimension: "5" },
  // B33-B36：医疗卫生 → 6.医疗健康
  { id: "B33", module: "B", text: "直接面对病患或公众健康需求开展工作", scaleType: "likert5", dimension: "6" },
  { id: "B34", module: "B", text: "在临床或公共卫生场景中应用研究证据", scaleType: "likert5", dimension: "6" },
  { id: "B35", module: "B", text: "参与药物、器械或治疗方案的研发与试验", scaleType: "likert5", dimension: "6" },
  { id: "B36", module: "B", text: "在高责任、强规范的专业执业体系中工作", scaleType: "likert5", dimension: "6" },

  // ═══ 模块 C：技能评估（24 题，1-5 李克特） ═══
  { id: "C01", module: "C", text: "独立设计并完整执行一项研究", scaleType: "likert5", dimension: "C-1" },
  { id: "C02", module: "C", text: "定量数据分析（统计、建模）", scaleType: "likert5", dimension: "C-1" },
  { id: "C03", module: "C", text: "质性资料的收集与分析（访谈、文本、田野）", scaleType: "likert5", dimension: "C-1" },
  { id: "C04", module: "C", text: "批判性评估证据与文献质量", scaleType: "likert5", dimension: "C-1" },
  { id: "C05", module: "C", text: "学术论文写作", scaleType: "likert5", dimension: "C-2" },
  { id: "C06", module: "C", text: "面向非专业读者的写作（报告、公文、科普）", scaleType: "likert5", dimension: "C-2" },
  { id: "C07", module: "C", text: "口头汇报与公开演讲", scaleType: "likert5", dimension: "C-2" },
  { id: "C08", module: "C", text: "英语（或其他外语）工作场景下的读写与交流", scaleType: "likert5", dimension: "C-2" },
  { id: "C09", module: "C", text: "跨部门、跨学科的团队协作", scaleType: "likert5", dimension: "C-3" },
  { id: "C10", module: "C", text: "向上沟通：让领导/导师理解并支持你的方案", scaleType: "likert5", dimension: "C-3" },
  { id: "C11", module: "C", text: "谈判、说服与影响他人", scaleType: "likert5", dimension: "C-3" },
  { id: "C12", module: "C", text: "建立并维护职业人脉", scaleType: "likert5", dimension: "C-3" },
  { id: "C13", module: "C", text: "项目管理（进度、预算、风险）", scaleType: "likert5", dimension: "C-4" },
  { id: "C14", module: "C", text: "带领小团队或指导他人工作", scaleType: "likert5", dimension: "C-4" },
  { id: "C15", module: "C", text: "多任务并行下的时间管理", scaleType: "likert5", dimension: "C-4" },
  { id: "C16", module: "C", text: "组织会议、活动或培训", scaleType: "likert5", dimension: "C-4" },
  { id: "C17", module: "C", text: "编程或脚本能力（Python、R 等）", scaleType: "likert5", dimension: "C-5" },
  { id: "C18", module: "C", text: "数据库与信息系统的使用", scaleType: "likert5", dimension: "C-5" },
  { id: "C19", module: "C", text: "AI 工具的熟练应用（提示词、工作流集成）", scaleType: "likert5", dimension: "C-5" },
  { id: "C20", module: "C", text: "数据可视化与图表制作", scaleType: "likert5", dimension: "C-5" },
  { id: "C21", module: "C", text: "课堂教学或培训授课", scaleType: "likert5", dimension: "C-6" },
  { id: "C22", module: "C", text: "课程与教材设计", scaleType: "likert5", dimension: "C-6" },
  { id: "C23", module: "C", text: "咨询答疑：针对他人的问题给出可行建议", scaleType: "likert5", dimension: "C-6" },
  { id: "C24", module: "C", text: "评估学习者/用户需求并提供个性化方案", scaleType: "likert5", dimension: "C-6" },

  // ═══ 模块 D：价值观（18 项，选出 Top 5） ═══
  { id: "D01", module: "D", text: "工作稳定性与保障（编制/长期合同）", scaleType: "rank_select" },
  { id: "D02", module: "D", text: "高收入与物质回报", scaleType: "rank_select" },
  { id: "D03", module: "D", text: "学术自由与研究自主权", scaleType: "rank_select" },
  { id: "D04", module: "D", text: "社会地位与职业声望", scaleType: "rank_select" },
  { id: "D05", module: "D", text: "工作生活平衡", scaleType: "rank_select" },
  { id: "D06", module: "D", text: "帮助他人 / 社会公益", scaleType: "rank_select" },
  { id: "D07", module: "D", text: "智力挑战与持续学习", scaleType: "rank_select" },
  { id: "D08", module: "D", text: "创造与创新空间", scaleType: "rank_select" },
  { id: "D09", module: "D", text: "明确的晋升通道", scaleType: "rank_select" },
  { id: "D10", module: "D", text: "团队归属感与同事关系", scaleType: "rank_select" },
  { id: "D11", module: "D", text: "独立自主的工作方式", scaleType: "rank_select" },
  { id: "D12", module: "D", text: "对公共政策/社会的影响力", scaleType: "rank_select" },
  { id: "D13", module: "D", text: "地理位置的自由度", scaleType: "rank_select" },
  { id: "D14", module: "D", text: "职业转换的灵活性", scaleType: "rank_select" },
  { id: "D15", module: "D", text: "权力与决策参与", scaleType: "rank_select" },
  { id: "D16", module: "D", text: "工作内容的多样性", scaleType: "rank_select" },
  { id: "D17", module: "D", text: "规则明确、边界清晰的职责", scaleType: "rank_select" },
  { id: "D18", module: "D", text: "与家庭责任的兼容性", scaleType: "rank_select" },

  // ═══ 模块 E：现实约束（5 题） ═══
  { id: "E01", module: "E", text: "编制偏好", scaleType: "single_choice", options: ["必须有编制", "倾向有编制", "无所谓", "倾向市场化"] },
  { id: "E02", module: "E", text: "地域接受范围", scaleType: "single_choice", options: ["锁定特定城市", "限定大区域", "全国可迁", "含海外"] },
  { id: "E03", module: "E", text: "可接受的年薪底线（税前）", scaleType: "single_choice", options: ["15 万以下也可", "15-25 万", "25-40 万", "40 万以上"] },
  { id: "E04", module: "E", text: "对高强度加班与快节奏的接受度", scaleType: "likert5" },
  { id: "E05", module: "E", text: "对纪律性组织（统一管理、政治要求）的接受度", scaleType: "single_choice", options: ["可以接受", "不确定", "不接受"] },
];

export function shuffleArray<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
