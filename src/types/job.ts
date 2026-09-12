// ═══ 岗位精选 · 类型定义 ═══

export interface Job {
  id: number;
  title: string;
  org: string;
  region: string;
  type: string;
  categoryId?: number | null;
  salary: string;
  posted: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  note?: string;
  detailUrl?: string | null;
  sourceName?: string | null;
}

export interface JobFilters {
  type: string;
  region: string;
}

export const JOB_TYPES = ["全部", "学术", "智库/研究院", "产业研究", "出版传媒", "体制内", "国际组织"] as const;
export const JOB_REGIONS = ["全部", "北京", "上海", "广深", "江浙", "海外"] as const;
