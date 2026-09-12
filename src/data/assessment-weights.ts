// ═══════════════════════════════════════════════════════════════
// 权重矩阵 · 简化版（V1 方案 A）
// 规则：每道题对其归属分类的主载荷 weight=3，其余分类 weight=0
// 模块 C 加入少量交叉载荷（≤2 个额外分类），基于技能域的常识判断
// 共计 60 题 × 8 分类 = 480 格
// ═══════════════════════════════════════════════════════════════

export interface WeightEntry {
  itemId: string;       // "B01" ~ "B36", "C01" ~ "C24"
  categoryId: number;   // 1-8
  weight: number;       // 0-3
}

export const SIMPLIFIED_WEIGHTS: WeightEntry[] = [

  // ═══ 模块 B：兴趣评估（36 题）══════════════════════════════
  // 规则：每道题主载荷分类 weight=3，其余 0。分类 8（其他）无专属题
  // ──── B01-B04：教育教研 → 分类 1（学术支撑）────
  { itemId: "B01", categoryId: 1, weight: 3 },
  { itemId: "B02", categoryId: 1, weight: 3 },
  { itemId: "B03", categoryId: 1, weight: 3 },
  { itemId: "B04", categoryId: 1, weight: 3 },

  // ──── B05-B08：科研院所 → 分类 1（学术支撑）────
  { itemId: "B05", categoryId: 1, weight: 3 },
  { itemId: "B06", categoryId: 1, weight: 3 },
  { itemId: "B07", categoryId: 1, weight: 3 },
  { itemId: "B08", categoryId: 1, weight: 3 },

  // ──── B09-B12：学术支撑 → 分类 1（学术支撑）────
  { itemId: "B09", categoryId: 1, weight: 3 },
  { itemId: "B10", categoryId: 1, weight: 3 },
  { itemId: "B11", categoryId: 1, weight: 3 },
  { itemId: "B12", categoryId: 1, weight: 3 },

  // ──── B13-B16：社会智库 → 分类 3（社会智库）────
  { itemId: "B13", categoryId: 3, weight: 3 },
  { itemId: "B14", categoryId: 3, weight: 3 },
  { itemId: "B15", categoryId: 3, weight: 3 },
  { itemId: "B16", categoryId: 3, weight: 3 },

  // ──── B17-B20：党政管理 → 分类 2（党政管理）────
  { itemId: "B17", categoryId: 2, weight: 3 },
  { itemId: "B18", categoryId: 2, weight: 3 },
  { itemId: "B19", categoryId: 2, weight: 3 },
  { itemId: "B20", categoryId: 2, weight: 3 },

  // ──── B21-B24：军警文职 → 分类 7（军警文职）────
  { itemId: "B21", categoryId: 7, weight: 3 },
  { itemId: "B22", categoryId: 7, weight: 3 },
  { itemId: "B23", categoryId: 7, weight: 3 },
  { itemId: "B24", categoryId: 7, weight: 3 },

  // ──── B25-B28：企业研究 → 分类 4（科技企业）────
  { itemId: "B25", categoryId: 4, weight: 3 },
  { itemId: "B26", categoryId: 4, weight: 3 },
  { itemId: "B27", categoryId: 4, weight: 3 },
  { itemId: "B28", categoryId: 4, weight: 3 },

  // ──── B29-B32：文化与出版 → 分类 5（文化出版）────
  { itemId: "B29", categoryId: 5, weight: 3 },
  { itemId: "B30", categoryId: 5, weight: 3 },
  { itemId: "B31", categoryId: 5, weight: 3 },
  { itemId: "B32", categoryId: 5, weight: 3 },

  // ──── B33-B36：医疗卫生 → 分类 6（医疗健康）────
  { itemId: "B33", categoryId: 6, weight: 3 },
  { itemId: "B34", categoryId: 6, weight: 3 },
  { itemId: "B35", categoryId: 6, weight: 3 },
  { itemId: "B36", categoryId: 6, weight: 3 },

  // ═══ 模块 C：技能评估（24 题）══════════════════════════════
  // 规则：每个技能域 1-3 个主匹配分类 weight=3，少量交叉分类 weight=1-2

  // ──── C01-C04：C-1 研究与分析 ────
  // 核心技能匹配：学术支撑(1)、社会智库(3)、科技企业(4)
  { itemId: "C01", categoryId: 1, weight: 3 },
  { itemId: "C01", categoryId: 3, weight: 2 },
  { itemId: "C02", categoryId: 1, weight: 3 },
  { itemId: "C02", categoryId: 4, weight: 3 },
  { itemId: "C03", categoryId: 1, weight: 3 },
  { itemId: "C03", categoryId: 3, weight: 2 },
  { itemId: "C04", categoryId: 1, weight: 3 },
  { itemId: "C04", categoryId: 3, weight: 3 },
  { itemId: "C04", categoryId: 4, weight: 2 },

  // ──── C05-C08：C-2 写作与表达 ────
  // 核心技能匹配：文化出版(5)、社会智库(3)、党政管理(2)
  { itemId: "C05", categoryId: 1, weight: 3 },
  { itemId: "C06", categoryId: 5, weight: 3 },
  { itemId: "C06", categoryId: 3, weight: 3 },
  { itemId: "C06", categoryId: 2, weight: 2 },
  { itemId: "C07", categoryId: 1, weight: 2 },
  { itemId: "C07", categoryId: 4, weight: 3 },
  { itemId: "C07", categoryId: 3, weight: 2 },
  { itemId: "C08", categoryId: 4, weight: 2 },
  { itemId: "C08", categoryId: 8, weight: 2 },

  // ──── C09-C12：C-3 沟通与协作 ────
  // 核心技能匹配：科技企业(4)、党政管理(2)、社会智库(3)
  { itemId: "C09", categoryId: 4, weight: 3 },
  { itemId: "C09", categoryId: 1, weight: 2 },
  { itemId: "C10", categoryId: 2, weight: 3 },
  { itemId: "C10", categoryId: 4, weight: 3 },
  { itemId: "C11", categoryId: 4, weight: 3 },
  { itemId: "C11", categoryId: 3, weight: 2 },
  { itemId: "C12", categoryId: 4, weight: 3 },
  { itemId: "C12", categoryId: 8, weight: 2 },

  // ──── C13-C16：C-4 组织与管理 ────
  // 核心技能匹配：党政管理(2)、学术支撑(1)、科技企业(4)
  { itemId: "C13", categoryId: 4, weight: 3 },
  { itemId: "C13", categoryId: 2, weight: 3 },
  { itemId: "C14", categoryId: 1, weight: 2 },
  { itemId: "C14", categoryId: 2, weight: 3 },
  { itemId: "C15", categoryId: 4, weight: 3 },
  { itemId: "C15", categoryId: 2, weight: 2 },
  { itemId: "C16", categoryId: 1, weight: 2 },
  { itemId: "C16", categoryId: 2, weight: 3 },

  // ──── C17-C20：C-5 数据与技术 ────
  // 核心技能匹配：科技企业(4)、学术支撑(1)
  { itemId: "C17", categoryId: 4, weight: 3 },
  { itemId: "C17", categoryId: 1, weight: 2 },
  { itemId: "C18", categoryId: 4, weight: 3 },
  { itemId: "C18", categoryId: 1, weight: 2 },
  { itemId: "C19", categoryId: 4, weight: 3 },
  { itemId: "C19", categoryId: 1, weight: 2 },
  { itemId: "C20", categoryId: 4, weight: 3 },
  { itemId: "C20", categoryId: 3, weight: 2 },

  // ──── C21-C24：C-6 教学与服务 ────
  // 核心技能匹配：学术支撑(1)、文化出版(5)
  { itemId: "C21", categoryId: 1, weight: 3 },
  { itemId: "C21", categoryId: 5, weight: 2 },
  { itemId: "C22", categoryId: 1, weight: 3 },
  { itemId: "C22", categoryId: 8, weight: 2 },
  { itemId: "C23", categoryId: 1, weight: 3 },
  { itemId: "C23", categoryId: 6, weight: 2 },
  { itemId: "C24", categoryId: 1, weight: 3 },
  { itemId: "C24", categoryId: 6, weight: 2 },
];

// ──── 使用说明 ────
// 以上仅列出 weight>0 的格子（共约 110 条）。
// 数据库中 assessment_weights 表现为完整 480 行：
//   INSERT INTO assessment_weights (item_id, category_id, weight, source)
//   VALUES ('B01',1,3,'editorial'), ('B01',2,0,'editorial'), …;
//
// 程序读取时用 `weight = (SELECT weight FROM assessment_weights
//   WHERE item_id=? AND category_id=?) || 0` 兜底。
//
// 算法中 weight 为 0 的格子等价于"该分类不看重这项"——加权得分不受影响。
