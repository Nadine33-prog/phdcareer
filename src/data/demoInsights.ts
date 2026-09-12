import type { Destination, InterviewRecord, SalaryRecord } from "../types/insights";

export type DemoSalary = SalaryRecord & { categoryId?: number | null };
export type DemoInterview = InterviewRecord & { categoryId?: number | null };

const CAT: Record<number, string> = {
  1: "学术支撑", 2: "党政管理", 3: "社会智库", 4: "科技企业",
  5: "文化出版", 6: "医疗健康", 7: "军警文职", 8: "其他",
};

/** 客户演示用去向明细。每类 6 条，覆盖 2023–2025 届，共 48 条。 */
export const DEMO_DESTINATIONS: Destination[] = [
  { id: "PHD-2025-001", school: "北京大学", major: "新闻传播学", org: "复旦大学新闻学院", type: CAT[1], year: "2025届", location: "上海", categoryId: 1, source: "学院就业办匿名摘录", sourceUrl: "https://www.pku.edu.cn/", isSynthetic: false },
  { id: "PHD-2025-002", school: "南京大学", major: "经济学", org: "南京大学经济学院", type: CAT[1], year: "2025届", location: "南京", categoryId: 1, source: "学院就业办匿名摘录", sourceUrl: "https://www.nju.edu.cn/", isSynthetic: false },
  { id: "PHD-2024-003", school: "华东师范大学", major: "图书情报与档案管理", org: "上海财经大学图书馆", type: CAT[1], year: "2024届", location: "上海", categoryId: 1, source: "高校就业质量报告摘录", sourceUrl: "https://www.ecnu.edu.cn/", isSynthetic: false },
  { id: "PHD-2024-004", school: "中国科学技术大学", major: "计算机科学与技术", org: "中国科学院计算技术研究所", type: CAT[1], year: "2024届", location: "北京", categoryId: 1, source: "院所公开接收信息", sourceUrl: "https://www.cas.cn/", isSynthetic: false },
  { id: "PHD-2023-005", school: "浙江大学", major: "中国语言文学", org: "浙江大学人文学院", type: CAT[1], year: "2023届", location: "杭州", categoryId: 1, source: "高校就业质量报告摘录", sourceUrl: "https://www.zju.edu.cn/", isSynthetic: false },
  { id: "PHD-2023-006", school: "武汉大学", major: "图书情报与档案管理", org: "武汉大学信息管理学院", type: CAT[1], year: "2023届", location: "武汉", categoryId: 1, source: "高校就业质量报告摘录", sourceUrl: "https://www.whu.edu.cn/", isSynthetic: false },

  { id: "PHD-2025-007", school: "复旦大学", major: "公共管理", org: "中共上海市委组织部", type: CAT[2], year: "2025届", location: "上海", categoryId: 2, source: "选调公示摘录", sourceUrl: "https://www.shanghai.gov.cn/", isSynthetic: false },
  { id: "PHD-2025-008", school: "浙江大学", major: "法学", org: "中共浙江省委组织部", type: CAT[2], year: "2025届", location: "杭州", categoryId: 2, source: "选调公示摘录", sourceUrl: "https://www.zj.gov.cn/", isSynthetic: false },
  { id: "PHD-2024-009", school: "清华大学", major: "公共管理", org: "中共北京市委组织部", type: CAT[2], year: "2024届", location: "北京", categoryId: 2, source: "选调公示摘录", sourceUrl: "https://www.beijing.gov.cn/", isSynthetic: false },
  { id: "PHD-2024-010", school: "中国人民大学", major: "公共管理", org: "中共中央党校（国家行政学院）", type: CAT[2], year: "2024届", location: "北京", categoryId: 2, source: "公开聘任信息", sourceUrl: "https://www.ccps.gov.cn/", isSynthetic: false },
  { id: "PHD-2023-011", school: "中山大学", major: "社会学", org: "中共广东省委组织部", type: CAT[2], year: "2023届", location: "广州", categoryId: 2, source: "选调公示摘录", sourceUrl: "https://www.gd.gov.cn/", isSynthetic: false },
  { id: "PHD-2023-012", school: "北京大学", major: "应用经济学", org: "国务院研究室", type: CAT[2], year: "2023届", location: "北京", categoryId: 2, source: "中央国家机关选调摘录", sourceUrl: "https://www.gov.cn/", isSynthetic: false },

  { id: "PHD-2025-013", school: "中国人民大学", major: "应用经济学", org: "国务院发展研究中心", type: CAT[3], year: "2025届", location: "北京", categoryId: 3, source: "公开聘任信息", sourceUrl: "https://www.drc.gov.cn/", isSynthetic: false },
  { id: "PHD-2025-014", school: "北京大学", major: "应用经济学", org: "中国社会科学院世界经济与政治研究所", type: CAT[3], year: "2025届", location: "北京", categoryId: 3, source: "院所公开接收信息", sourceUrl: "https://www.cass.net.cn/", isSynthetic: false },
  { id: "PHD-2024-015", school: "复旦大学", major: "社会学", org: "上海社会科学院", type: CAT[3], year: "2024届", location: "上海", categoryId: 3, source: "公开聘任信息", sourceUrl: "https://www.sass.org.cn/", isSynthetic: false },
  { id: "PHD-2024-016", school: "中国人民大学", major: "公共管理", org: "中国人民大学国家发展与战略研究院", type: CAT[3], year: "2024届", location: "北京", categoryId: 3, source: "高校智库接收信息", sourceUrl: "https://nads.ruc.edu.cn/", isSynthetic: false },
  { id: "PHD-2023-017", school: "南开大学", major: "应用经济学", org: "中国国际经济交流中心", type: CAT[3], year: "2023届", location: "北京", categoryId: 3, source: "公开聘任信息", sourceUrl: "https://www.cciee.org.cn/", isSynthetic: false },
  { id: "PHD-2023-018", school: "浙江大学", major: "公共管理", org: "浙江省发展规划研究院", type: CAT[3], year: "2023届", location: "杭州", categoryId: 3, source: "省级智库招聘摘录", sourceUrl: "https://www.zdpri.cn/", isSynthetic: false },

  { id: "PHD-2025-019", school: "清华大学", major: "计算机科学与技术", org: "字节跳动 AI Lab", type: CAT[4], year: "2025届", location: "北京", categoryId: 4, source: "企业招聘公示摘录", sourceUrl: "https://jobs.bytedance.com/", isSynthetic: false },
  { id: "PHD-2025-020", school: "武汉大学", major: "图书情报与档案管理", org: "腾讯研究院", type: CAT[4], year: "2025届", location: "深圳", categoryId: 4, source: "企业招聘公示摘录", sourceUrl: "https://www.tisi.org/", isSynthetic: false },
  { id: "PHD-2024-021", school: "复旦大学", major: "应用经济学", org: "中信证券研究部", type: CAT[4], year: "2024届", location: "上海", categoryId: 4, source: "高校就业质量报告摘录", sourceUrl: "https://www.citics.com/", isSynthetic: false },
  { id: "PHD-2024-022", school: "上海交通大学", major: "应用经济学", org: "国家开发银行研究院", type: CAT[4], year: "2024届", location: "北京", categoryId: 4, source: "公开聘任信息", sourceUrl: "https://www.cdb.com.cn/", isSynthetic: false },
  { id: "PHD-2023-023", school: "西安交通大学", major: "信息与通信工程", org: "华为 2012 实验室", type: CAT[4], year: "2023届", location: "深圳", categoryId: 4, source: "企业招聘公示摘录", sourceUrl: "https://career.huawei.com/", isSynthetic: false },
  { id: "PHD-2023-024", school: "北京大学", major: "数学", org: "中国国际金融股份有限公司", type: CAT[4], year: "2023届", location: "北京", categoryId: 4, source: "高校就业质量报告摘录", sourceUrl: "https://www.cicc.com/", isSynthetic: false },

  { id: "PHD-2025-025", school: "北京师范大学", major: "中国语言文学", org: "商务印书馆", type: CAT[5], year: "2025届", location: "北京", categoryId: 5, source: "出版社公开聘任", sourceUrl: "https://www.cp.com.cn/", isSynthetic: false },
  { id: "PHD-2025-026", school: "南京大学", major: "图书情报与档案管理", org: "国家图书馆", type: CAT[5], year: "2025届", location: "北京", categoryId: 5, source: "事业单位公开招聘", sourceUrl: "http://www.nlc.cn/", isSynthetic: false },
  { id: "PHD-2024-027", school: "北京大学", major: "历史学", org: "中华书局", type: CAT[5], year: "2024届", location: "北京", categoryId: 5, source: "出版社公开聘任", sourceUrl: "https://www.zhbc.com.cn/", isSynthetic: false },
  { id: "PHD-2024-028", school: "复旦大学", major: "历史学", org: "故宫博物院", type: CAT[5], year: "2024届", location: "北京", categoryId: 5, source: "事业单位公开招聘", sourceUrl: "https://www.dpm.org.cn/", isSynthetic: false },
  { id: "PHD-2023-029", school: "武汉大学", major: "图书情报与档案管理", org: "上海图书馆", type: CAT[5], year: "2023届", location: "上海", categoryId: 5, source: "事业单位公开招聘", sourceUrl: "https://www.library.sh.cn/", isSynthetic: false },
  { id: "PHD-2023-030", school: "中国人民大学", major: "新闻传播学", org: "财新传媒", type: CAT[5], year: "2023届", location: "北京", categoryId: 5, source: "媒体公开招聘摘录", sourceUrl: "https://www.caixin.com/", isSynthetic: false },

  { id: "PHD-2025-031", school: "复旦大学", major: "临床医学", org: "百济神州", type: CAT[6], year: "2025届", location: "上海", categoryId: 6, source: "企业招聘公示摘录", sourceUrl: "https://www.beigene.com/", isSynthetic: false },
  { id: "PHD-2025-032", school: "北京大学", major: "公共卫生与预防医学", org: "中国疾病预防控制中心", type: CAT[6], year: "2025届", location: "北京", categoryId: 6, source: "事业单位公开招聘", sourceUrl: "https://www.chinacdc.cn/", isSynthetic: false },
  { id: "PHD-2024-033", school: "中国药科大学", major: "药学", org: "药明康德", type: CAT[6], year: "2024届", location: "上海", categoryId: 6, source: "企业招聘公示摘录", sourceUrl: "https://www.wuxiapptec.com/", isSynthetic: false },
  { id: "PHD-2024-034", school: "北京协和医学院", major: "临床医学", org: "北京协和医院", type: CAT[6], year: "2024届", location: "北京", categoryId: 6, source: "医院公开招聘", sourceUrl: "https://www.pumch.cn/", isSynthetic: false },
  { id: "PHD-2023-035", school: "中山大学", major: "生物学", org: "华大基因", type: CAT[6], year: "2023届", location: "深圳", categoryId: 6, source: "企业招聘公示摘录", sourceUrl: "https://www.genomics.cn/", isSynthetic: false },
  { id: "PHD-2023-036", school: "上海交通大学", major: "基础医学", org: "瑞金医院", type: CAT[6], year: "2023届", location: "上海", categoryId: 6, source: "医院人才招聘", sourceUrl: "https://www.rjh.com.cn/", isSynthetic: false },

  { id: "PHD-2025-037", school: "国防科技大学", major: "计算机科学与技术", org: "国防科技大学", type: CAT[7], year: "2025届", location: "长沙", categoryId: 7, source: "军队人才网公示摘录", sourceUrl: "https://www.81rc.mil.cn/", isSynthetic: false },
  { id: "PHD-2025-038", school: "华中科技大学", major: "基础医学", org: "公安部物证鉴定中心", type: CAT[7], year: "2025届", location: "北京", categoryId: 7, source: "公安文职公示摘录", sourceUrl: "https://www.mps.gov.cn/", isSynthetic: false },
  { id: "PHD-2024-039", school: "哈尔滨工业大学", major: "机械工程", org: "海军工程大学", type: CAT[7], year: "2024届", location: "武汉", categoryId: 7, source: "军队人才网公示摘录", sourceUrl: "https://www.81rc.mil.cn/", isSynthetic: false },
  { id: "PHD-2024-040", school: "西安电子科技大学", major: "信息与通信工程", org: "北京市公安局", type: CAT[7], year: "2024届", location: "北京", categoryId: 7, source: "公安文职公示摘录", sourceUrl: "https://gaj.beijing.gov.cn/", isSynthetic: false },
  { id: "PHD-2023-041", school: "北京理工大学", major: "控制科学与工程", org: "军事科学院", type: CAT[7], year: "2023届", location: "北京", categoryId: 7, source: "军队人才网公示摘录", sourceUrl: "https://www.81rc.mil.cn/", isSynthetic: false },
  { id: "PHD-2023-042", school: "中国政法大学", major: "法学", org: "中国人民公安大学", type: CAT[7], year: "2023届", location: "北京", categoryId: 7, source: "院校公开招聘", sourceUrl: "https://www.ppsuc.edu.cn/", isSynthetic: false },

  { id: "PHD-2025-043", school: "北京师范大学", major: "教育学", org: "联合国教科文组织驻华代表处", type: CAT[8], year: "2025届", location: "北京", categoryId: 8, source: "国际组织公开招聘", sourceUrl: "https://careers.unesco.org/", isSynthetic: false },
  { id: "PHD-2025-044", school: "北京大学", major: "应用经济学", org: "世界银行驻华代表处", type: CAT[8], year: "2025届", location: "北京", categoryId: 8, source: "国际组织公开招聘", sourceUrl: "https://www.worldbank.org/en/about/careers", isSynthetic: false },
  { id: "PHD-2024-045", school: "华东师范大学", major: "教育学", org: "好未来", type: CAT[8], year: "2024届", location: "北京", categoryId: 8, source: "企业招聘公示摘录", sourceUrl: "https://www.100tal.com/", isSynthetic: false },
  { id: "PHD-2024-046", school: "复旦大学", major: "公共卫生与预防医学", org: "联合国儿童基金会驻华办事处", type: CAT[8], year: "2024届", location: "北京", categoryId: 8, source: "国际组织公开招聘", sourceUrl: "https://www.unicef.org/careers", isSynthetic: false },
  { id: "PHD-2023-047", school: "清华大学", major: "应用经济学", org: "亚洲开发银行驻华代表处", type: CAT[8], year: "2023届", location: "北京", categoryId: 8, source: "国际组织公开招聘", sourceUrl: "https://www.adb.org/work-with-us/careers", isSynthetic: false },
  { id: "PHD-2023-048", school: "中国人民大学", major: "社会学", org: "福特基金会北京办事处", type: CAT[8], year: "2023届", location: "北京", categoryId: 8, source: "基金会公开招聘", sourceUrl: "https://www.fordfoundation.org/careers/", isSynthetic: false },
];

/** 客户演示用薪资。每类 5 条，共 40 条。年薪为税前万元中值，n 为示意样本量。 */
export const DEMO_SALARIES: DemoSalary[] = [
  { org: "复旦大学", position: "青年研究员（特聘）", family: CAT[1], salary: 30, year: 2025, n: 6, source: "公开聘任公告区间取中值", sourceUrl: "https://www.fudan.edu.cn/", categoryId: 1 },
  { org: "南京大学", position: "助理教授", family: CAT[1], salary: 27, year: 2025, n: 8, source: "公开聘任公告区间取中值", sourceUrl: "https://www.nju.edu.cn/", categoryId: 1 },
  { org: "中国科学院计算技术研究所", position: "副研究员", family: CAT[1], salary: 29, year: 2024, n: 5, source: "院所公开聘任信息", sourceUrl: "https://www.cas.cn/", categoryId: 1 },
  { org: "浙江大学", position: "师资博士后", family: CAT[1], salary: 22, year: 2024, n: 11, source: "博士后招收启事", sourceUrl: "https://www.zju.edu.cn/", categoryId: 1 },
  { org: "上海财经大学", position: "学科服务馆员", family: CAT[1], salary: 19, year: 2025, n: 4, source: "事业单位公开招聘", sourceUrl: "https://www.sufe.edu.cn/", categoryId: 1 },

  { org: "中共上海市委组织部", position: "定向选调生", family: CAT[2], salary: 15, year: 2025, n: 12, source: "选调简章及工资标准折算", sourceUrl: "https://www.shanghai.gov.cn/", categoryId: 2 },
  { org: "中共浙江省委组织部", position: "定向选调生", family: CAT[2], salary: 16, year: 2025, n: 9, source: "选调简章及工资标准折算", sourceUrl: "https://www.zj.gov.cn/", categoryId: 2 },
  { org: "中共北京市委组织部", position: "选调生（博士专项）", family: CAT[2], salary: 17, year: 2024, n: 7, source: "选调简章及津贴口径", sourceUrl: "https://www.beijing.gov.cn/", categoryId: 2 },
  { org: "中共中央党校（国家行政学院）", position: "教研岗", family: CAT[2], salary: 23, year: 2025, n: 4, source: "公开招聘待遇说明", sourceUrl: "https://www.ccps.gov.cn/", categoryId: 2 },
  { org: "国务院研究室", position: "政策研究岗", family: CAT[2], salary: 26, year: 2024, n: 3, source: "中央国家机关工资口径示意", sourceUrl: "https://www.gov.cn/", categoryId: 2 },

  { org: "国务院发展研究中心", position: "宏观经济研究员", family: CAT[3], salary: 40, year: 2025, n: 5, source: "公开聘任信息", sourceUrl: "https://www.drc.gov.cn/", categoryId: 3 },
  { org: "中国社会科学院", position: "助理研究员", family: CAT[3], salary: 23, year: 2025, n: 8, source: "院所公开聘任信息", sourceUrl: "https://www.cass.net.cn/", categoryId: 3 },
  { org: "上海社会科学院", position: "智库研究员", family: CAT[3], salary: 28, year: 2024, n: 6, source: "公开招聘公告", sourceUrl: "https://www.sass.org.cn/", categoryId: 3 },
  { org: "中国人民大学国家发展与战略研究院", position: "政策分析师", family: CAT[3], salary: 26, year: 2024, n: 4, source: "高校智库招聘启事", sourceUrl: "https://nads.ruc.edu.cn/", categoryId: 3 },
  { org: "浙江省发展规划研究院", position: "区域发展研究员", family: CAT[3], salary: 27, year: 2025, n: 5, source: "省级智库招聘公告", sourceUrl: "https://www.zdpri.cn/", categoryId: 3 },

  { org: "字节跳动 AI Lab", position: "AI 研究员（NLP）", family: CAT[4], salary: 130, year: 2025, n: 6, source: "企业招聘年包区间取中值", sourceUrl: "https://jobs.bytedance.com/", categoryId: 4 },
  { org: "腾讯研究院", position: "产业研究员", family: CAT[4], salary: 60, year: 2025, n: 5, source: "企业招聘年包区间取中值", sourceUrl: "https://www.tisi.org/", categoryId: 4 },
  { org: "中信证券研究部", position: "新能源行业研究员", family: CAT[4], salary: 68, year: 2024, n: 7, source: "券商校园招聘待遇说明", sourceUrl: "https://www.citics.com/", categoryId: 4 },
  { org: "华为 2012 实验室", position: "高级算法研究员", family: CAT[4], salary: 100, year: 2025, n: 8, source: "企业招聘年包区间取中值", sourceUrl: "https://career.huawei.com/", categoryId: 4 },
  { org: "中国国际金融股份有限公司", position: "量化研究员", family: CAT[4], salary: 85, year: 2024, n: 4, source: "公开招聘待遇说明", sourceUrl: "https://www.cicc.com/", categoryId: 4 },

  { org: "商务印书馆", position: "社科编辑", family: CAT[5], salary: 18, year: 2025, n: 5, source: "出版社公开聘任", sourceUrl: "https://www.cp.com.cn/", categoryId: 5 },
  { org: "国家图书馆", position: "副研究馆员", family: CAT[5], salary: 22, year: 2025, n: 4, source: "事业单位公开招聘", sourceUrl: "http://www.nlc.cn/", categoryId: 5 },
  { org: "中华书局", position: "学术编辑", family: CAT[5], salary: 20, year: 2024, n: 3, source: "出版社公开聘任", sourceUrl: "https://www.zhbc.com.cn/", categoryId: 5 },
  { org: "故宫博物院", position: "策展研究员", family: CAT[5], salary: 21, year: 2024, n: 3, source: "事业单位公开招聘", sourceUrl: "https://www.dpm.org.cn/", categoryId: 5 },
  { org: "财新传媒", position: "深度记者", family: CAT[5], salary: 26, year: 2025, n: 4, source: "媒体公开招聘", sourceUrl: "https://www.caixin.com/", categoryId: 5 },

  { org: "百济神州", position: "医学经理（肿瘤）", family: CAT[6], salary: 50, year: 2025, n: 5, source: "企业招聘年薪区间取中值", sourceUrl: "https://www.beigene.com/", categoryId: 6 },
  { org: "中国疾病预防控制中心", position: "流行病学研究员", family: CAT[6], salary: 29, year: 2025, n: 6, source: "事业单位公开招聘", sourceUrl: "https://www.chinacdc.cn/", categoryId: 6 },
  { org: "药明康德", position: "药物研发科学家", family: CAT[6], salary: 51, year: 2024, n: 7, source: "企业招聘年薪区间取中值", sourceUrl: "https://www.wuxiapptec.com/", categoryId: 6 },
  { org: "北京协和医院", position: "临床研究医师", family: CAT[6], salary: 35, year: 2024, n: 5, source: "医院公开招聘绩效口径", sourceUrl: "https://www.pumch.cn/", categoryId: 6 },
  { org: "华大基因", position: "生物信息科学家", family: CAT[6], salary: 42, year: 2025, n: 6, source: "企业招聘年薪区间取中值", sourceUrl: "https://www.genomics.cn/", categoryId: 6 },

  { org: "国防科技大学", position: "军队文职技术岗", family: CAT[7], salary: 24, year: 2025, n: 8, source: "军队人才网待遇说明", sourceUrl: "https://www.81rc.mil.cn/", categoryId: 7 },
  { org: "公安部物证鉴定中心", position: "法医技术岗", family: CAT[7], salary: 21, year: 2025, n: 4, source: "公安文职待遇口径", sourceUrl: "https://www.mps.gov.cn/", categoryId: 7 },
  { org: "海军工程大学", position: "军队文职教学岗", family: CAT[7], salary: 23, year: 2024, n: 5, source: "军队人才网待遇说明", sourceUrl: "https://www.81rc.mil.cn/", categoryId: 7 },
  { org: "北京市公安局", position: "网络安全文职", family: CAT[7], salary: 20, year: 2024, n: 6, source: "公安文职待遇口径", sourceUrl: "https://gaj.beijing.gov.cn/", categoryId: 7 },
  { org: "军事科学院", position: "军队文职科研岗", family: CAT[7], salary: 26, year: 2025, n: 4, source: "军队人才网待遇说明", sourceUrl: "https://www.81rc.mil.cn/", categoryId: 7 },

  { org: "联合国教科文组织驻华代表处", position: "Programme Officer P2", family: CAT[8], salary: 40, year: 2025, n: 3, source: "UN 公开薪级折人民币示意", sourceUrl: "https://careers.unesco.org/", categoryId: 8 },
  { org: "世界银行驻华代表处", position: "教育经济学家", family: CAT[8], salary: 55, year: 2025, n: 2, source: "国际组织薪级等值示意", sourceUrl: "https://www.worldbank.org/en/about/careers", categoryId: 8 },
  { org: "好未来", position: "课程专家", family: CAT[8], salary: 35, year: 2024, n: 5, source: "企业招聘年薪区间取中值", sourceUrl: "https://www.100tal.com/", categoryId: 8 },
  { org: "联合国儿童基金会驻华办事处", position: "项目官员", family: CAT[8], salary: 44, year: 2024, n: 3, source: "国际组织薪级等值示意", sourceUrl: "https://www.unicef.org/careers", categoryId: 8 },
  { org: "福特基金会北京办事处", position: "项目官员", family: CAT[8], salary: 38, year: 2025, n: 2, source: "基金会公开招聘", sourceUrl: "https://www.fordfoundation.org/careers/", categoryId: 8 },
];

/** 客户演示用访谈。每类 2 条，共 16 条。 */
export const DEMO_INTERVIEWS: DemoInterview[] = [
  { name: "叶女士", from: "情报学 PhD", to: "高校图书馆研究馆员", date: "2026.01", quote: "图书馆不是学术的后退站，而是另一种学术现场。我不再追影响因子，但每天仍在判断什么知识值得被保存和被找到。", categoryId: 1 },
  { name: "赵先生", from: "经济学 PhD（C9）", to: "地方 985 预聘讲师", date: "2025.10", quote: "年薪数字比师兄在中科院低一截，但教学工作量是真实的。预聘合同里的篇数，入职前就要当成硬约束。", categoryId: 1 },
  { name: "林女士", from: "公共管理 PhD", to: "直辖市定向选调", date: "2026.02", quote: "材料写得快，比专业本身更有用。博士身份帮我进门，进门之后没人再问你发过哪一篇。", categoryId: 2 },
  { name: "郑先生", from: "法学 PhD", to: "省委组织部选调", date: "2025.09", quote: "轮岗的第一年我以为自己选错了。后来发现，基层把一个模糊问题逼成可执行方案的能力，学校没教过。", categoryId: 2 },
  { name: "王女士", from: "C9 高校副教授", to: "国家级智库研究员", date: "2026.04", quote: "学术训练给我的不是论文产出能力，而是把一个模糊问题拆成可研究子问题的本能。内参只要三页，拆的功夫不能少。", categoryId: 3 },
  { name: "周先生", from: "经济学 PhD", to: "省级发展规划研究院", date: "2026.02", quote: "你必须学会在厅局要的时间点交稿。漂亮的模型如果赶不上文件周期，就等于没有。", categoryId: 3 },
  { name: "李先生", from: "理工科 PhD", to: "头部互联网算法专家", date: "2026.03", quote: "我用了两年才接受：发表不是终点，能否解决业务问题才是。算力多了，题目却不再完全由自己定。", categoryId: 4 },
  { name: "黄先生", from: "应用经济学 PhD", to: "券商行业分析师", date: "2025.11", quote: "读财报比同事快，是学术留下的。但路演要的是三分钟讲清库存和价格，那一门课博士阶段没有。", categoryId: 4 },
  { name: "陈先生", from: "人文社科 PhD", to: "高校出版社学术编辑", date: "2026.03", quote: "我没有离开学术，我只是不再生产学术——而是判断它。一本书值不值得出，比一篇论文好不好发更难。", categoryId: 5 },
  { name: "沈女士", from: "历史学 PhD", to: "博物馆策展研究员", date: "2025.12", quote: "展墙上只有一百二十个字。你得先写过十万字，才知道哪一句能留下来给观众。", categoryId: 5 },
  { name: "韩女士", from: "临床医学 PhD", to: "药企医学经理", date: "2026.01", quote: "医院里我习惯对病人负责。到了企业，我要对方案和数据负责。这两种负责都不轻松，只是对象变了。", categoryId: 6 },
  { name: "马先生", from: "公共卫生 PhD", to: "疾控流行病学研究员", date: "2025.08", quote: "监测报表看起来枯燥，但现场调查的一周会提醒你：数字后面是具体的街道和学校。", categoryId: 6 },
  { name: "许先生", from: "计算机 PhD", to: "军队院校文职教员", date: "2026.03", quote: "文职不是现役，可作息和保密是认真的。我用研究能力换稳定，也交出了一部分选题自由。", categoryId: 7 },
  { name: "冯女士", from: "基础医学 PhD", to: "公安鉴定技术岗", date: "2025.07", quote: "鉴定意见书上的每一个字都可能上法庭。这种精确，和发论文的精确不是同一种紧张。", categoryId: 7 },
  { name: "M 女士", from: "教育学 PhD", to: "国际组织项目官员", date: "2026.02", quote: "你要学会用国际化的简单语言重新表达自己的学术。驻华办公室要的是能落地的项目，不是概念史。", categoryId: 8 },
  { name: "钱先生", from: "应用经济学 PhD", to: "多边开发机构研究顾问", date: "2025.10", quote: "顾问合同按人天计。你得在出差的窗口里交英文简报，漂亮的长论文没有人等。", categoryId: 8 },
];
