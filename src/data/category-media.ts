export type CategoryTone = "sand" | "blush" | "sage";

export type MediaKind = "cover" | "hero" | "scene";

export interface MediaAsset {
  src: string;
  alt: string;
  kind: MediaKind;
}

export interface CategoryMedia {
  coverImage: string;
  heroImage: string;
  imageAlt: string;
  tone: CategoryTone;
  gallery: string[];
}

/** 职业地图可用配图库：现有页面里的实景图。 */
export const MEDIA_LIBRARY: MediaAsset[] = [
  { src: "/design/roi-library.jpg", alt: "大学图书馆阅览大厅", kind: "cover" },
  { src: "/design/policy.jpg", alt: "政策研究与机关场景", kind: "cover" },
  { src: "/design/interviews/zhang-consult.jpg", alt: "政策咨询与案头研判", kind: "cover" },
  { src: "/design/industry.jpg", alt: "产业与实验室工作现场", kind: "cover" },
  { src: "/design/interviews/chen-books.jpg", alt: "出版社与图书馆书架", kind: "cover" },
  { src: "/design/interviews/zhou-clinic.jpg", alt: "医学与数字化工作的交汇", kind: "cover" },
  { src: "/design/path.jpg", alt: "纪律性组织中的技术岗位现场", kind: "cover" },
  { src: "/design/interviews/wu-research.jpg", alt: "国际组织与行业调研现场", kind: "cover" },
  { src: "/design/tools/path-1.jpg", alt: "职业路径现场一", kind: "cover" },
  { src: "/design/tools/path-2.jpg", alt: "职业路径现场二", kind: "cover" },
  { src: "/design/tools/path-3.jpg", alt: "职业路径现场三", kind: "cover" },
  { src: "/design/tools/path-4.jpg", alt: "职业路径现场四", kind: "cover" },
  { src: "/design/tools/path-5.jpg", alt: "职业路径现场五", kind: "cover" },
  { src: "/design/tools/path-6.jpg", alt: "职业路径现场六", kind: "cover" },
  { src: "/design/tools/path-7.jpg", alt: "职业路径现场七", kind: "cover" },
  { src: "/design/tools/path-8.jpg", alt: "职业路径现场八", kind: "cover" },

  { src: "/design/library.jpg", alt: "大学图书馆阅览现场", kind: "hero" },
  { src: "/design/interviews/wang-docs.jpg", alt: "机关公文与政策案头", kind: "hero" },
  { src: "/design/interviews/zhang-nature.jpg", alt: "面向决策的研究现场", kind: "hero" },
  { src: "/design/interviews/li-code.jpg", alt: "实验室与工程研发", kind: "hero" },
  { src: "/design/interviews/chen-write.jpg", alt: "编辑与审读书稿", kind: "hero" },
  { src: "/design/interviews/zhou-lab.jpg", alt: "医学与实验室现场", kind: "hero" },
  { src: "/design/interviews/wang-meeting.jpg", alt: "纪律性组织中的工作会议", kind: "hero" },
  { src: "/design/interviews/wu-data.jpg", alt: "国际组织与独立研究现场", kind: "hero" },
  { src: "/design/careers-hero.jpg", alt: "图书馆阅览大厅中的研究者", kind: "hero" },
  { src: "/design/jobs-hero.jpg", alt: "空置的研究所会议室，长桌与窗光", kind: "hero" },

  { src: "/design/interviews/li-team.jpg", alt: "团队协作现场", kind: "scene" },
  { src: "/design/tools-office.jpg", alt: "办公与研究案头", kind: "scene" },
  { src: "/design/interviews/chen-write.jpg", alt: "写作与审读", kind: "scene" },
  { src: "/design/interviews/wang-meeting.jpg", alt: "工作会议", kind: "scene" },
  { src: "/design/interviews/wang-docs.jpg", alt: "公文案头", kind: "scene" },
  { src: "/design/interviews/zhou-lab.jpg", alt: "实验室现场", kind: "scene" },
  { src: "/design/interviews/wu-data.jpg", alt: "数据分析现场", kind: "scene" },
  { src: "/design/interviews/zhang-nature.jpg", alt: "研究现场", kind: "scene" },
  { src: "/design/library.jpg", alt: "图书馆阅览", kind: "scene" },
  { src: "/design/interviews/li-code.jpg", alt: "工程研发现场", kind: "scene" },
];

export const TONES: CategoryTone[] = ["sand", "blush", "sage"];

export const COVER_LIBRARY = MEDIA_LIBRARY.filter((m) => m.kind === "cover");
export const HERO_LIBRARY = MEDIA_LIBRARY.filter((m) => m.kind === "hero");
export const SCENE_LIBRARY = MEDIA_LIBRARY.filter((m) => m.kind === "scene");

/** 现有 8 类的固定配图，避免回填后视觉跳动。 */
export const DEFAULT_CATEGORY_MEDIA: Record<number, CategoryMedia> = {
  1: {
    coverImage: "/design/roi-library.jpg",
    heroImage: "/design/library.jpg",
    imageAlt: "大学图书馆阅览大厅",
    tone: "sand",
    gallery: [
      "/design/interviews/wang-meeting.jpg",
      "/design/interviews/wang-docs.jpg",
      "/design/interviews/chen-write.jpg",
      "/design/interviews/li-team.jpg",
      "/design/tools-office.jpg",
      "/design/interviews/zhou-lab.jpg",
      "/design/interviews/wu-data.jpg",
    ],
  },
  2: {
    coverImage: "/design/policy.jpg",
    heroImage: "/design/interviews/wang-docs.jpg",
    imageAlt: "政策研究与机关场景",
    tone: "blush",
    gallery: ["/design/interviews/li-team.jpg", "/design/tools-office.jpg"],
  },
  3: {
    coverImage: "/design/interviews/zhang-consult.jpg",
    heroImage: "/design/interviews/zhang-nature.jpg",
    imageAlt: "政策咨询与案头研判",
    tone: "sage",
    gallery: ["/design/interviews/wu-data.jpg", "/design/interviews/chen-write.jpg"],
  },
  4: {
    coverImage: "/design/industry.jpg",
    heroImage: "/design/interviews/li-code.jpg",
    imageAlt: "产业与实验室工作现场",
    tone: "sand",
    gallery: [
      "/design/interviews/wu-data.jpg",
      "/design/tools-office.jpg",
      "/design/interviews/li-team.jpg",
      "/design/library.jpg",
      "/design/interviews/wang-meeting.jpg",
      "/design/interviews/wang-docs.jpg",
      "/design/interviews/chen-write.jpg",
      "/design/interviews/zhang-nature.jpg",
      "/design/interviews/zhou-lab.jpg",
    ],
  },
  5: {
    coverImage: "/design/interviews/chen-books.jpg",
    heroImage: "/design/interviews/chen-write.jpg",
    imageAlt: "出版社与图书馆书架",
    tone: "blush",
    gallery: ["/design/library.jpg", "/design/interviews/wang-docs.jpg", "/design/interviews/wang-meeting.jpg", "/design/interviews/zhang-nature.jpg"],
  },
  6: {
    coverImage: "/design/interviews/zhou-clinic.jpg",
    heroImage: "/design/interviews/zhou-lab.jpg",
    imageAlt: "医学与数字化工作的交汇",
    tone: "sage",
    gallery: ["/design/interviews/wu-data.jpg", "/design/library.jpg", "/design/interviews/wang-meeting.jpg"],
  },
  7: {
    coverImage: "/design/path.jpg",
    heroImage: "/design/interviews/wang-meeting.jpg",
    imageAlt: "纪律性组织中的技术岗位现场",
    tone: "sand",
    gallery: ["/design/tools-office.jpg", "/design/interviews/wang-docs.jpg", "/design/interviews/li-team.jpg"],
  },
  8: {
    coverImage: "/design/interviews/wu-research.jpg",
    heroImage: "/design/interviews/wu-data.jpg",
    imageAlt: "国际组织与行业调研现场",
    tone: "blush",
    gallery: [
      "/design/interviews/zhang-nature.jpg",
      "/design/library.jpg",
      "/design/interviews/chen-write.jpg",
      "/design/tools-office.jpg",
      "/design/interviews/li-team.jpg",
      "/design/interviews/wang-meeting.jpg",
    ],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function stableOf(id: number): CategoryMedia {
  const cover = COVER_LIBRARY[Math.abs(id) % COVER_LIBRARY.length]!;
  const hero = HERO_LIBRARY[Math.abs(id * 3) % HERO_LIBRARY.length]!;
  const scenes = SCENE_LIBRARY.map((s) => s.src);
  const start = Math.abs(id) % scenes.length;
  const gallery = [...scenes.slice(start), ...scenes.slice(0, start)].slice(0, 8);
  return {
    coverImage: cover.src,
    heroImage: hero.src,
    imageAlt: cover.alt,
    tone: TONES[Math.abs(id) % TONES.length]!,
    gallery,
  };
}

/** 新增分类时随机抽一张封面、一张头图、一组岗位配图。 */
export function pickCategoryMedia(opts?: { excludeCovers?: string[] }): CategoryMedia {
  const freeCovers = COVER_LIBRARY.filter((c) => !opts?.excludeCovers?.includes(c.src));
  const cover = pick(freeCovers.length ? freeCovers : COVER_LIBRARY);
  const heroes = HERO_LIBRARY.filter((h) => h.src !== cover.src);
  const hero = pick(heroes.length ? heroes : HERO_LIBRARY);
  return {
    coverImage: cover.src,
    heroImage: hero.src,
    imageAlt: cover.alt,
    tone: pick(TONES),
    gallery: shuffle(SCENE_LIBRARY.map((s) => s.src)).slice(0, 8),
  };
}

export function isCategoryTone(v: unknown): v is CategoryTone {
  return v === "sand" || v === "blush" || v === "sage";
}

/** 读取时：库里有图用库里的；空字段用 8 类默认或按 id 稳定兜底。 */
export function resolveCategoryMedia(id: number, stored?: Partial<CategoryMedia> | null): CategoryMedia {
  const fallback = DEFAULT_CATEGORY_MEDIA[id] ?? stableOf(id);
  const gallery = Array.isArray(stored?.gallery) ? stored!.gallery!.filter(Boolean) : [];
  return {
    coverImage: stored?.coverImage || fallback.coverImage,
    heroImage: stored?.heroImage || fallback.heroImage,
    imageAlt: stored?.imageAlt || fallback.imageAlt,
    tone: isCategoryTone(stored?.tone) ? stored!.tone! : fallback.tone,
    gallery: gallery.length ? gallery : fallback.gallery,
  };
}
