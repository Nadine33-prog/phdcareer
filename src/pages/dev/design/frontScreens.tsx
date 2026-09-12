import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";
import { isCategoryTone, resolveCategoryMedia } from "@/data/category-media";
import type { CareerInterview, Category, OpeningBrief, Position } from "@/types/career";
import { DesignFooter, DesignNav, Frame, Tag, go, goCareer, inDesignStudio } from "./chrome";

const DETAIL_MEDIA: Record<number, { hero: string; heroAlt: string; positions: string[] }> = {
  1: {
    hero: "/design/library.jpg",
    heroAlt: "大学图书馆阅览现场",
    positions: [
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
    hero: "/design/interviews/wang-docs.jpg",
    heroAlt: "机关公文与政策案头",
    positions: ["/design/interviews/li-team.jpg", "/design/tools-office.jpg"],
  },
  3: {
    hero: "/design/interviews/zhang-nature.jpg",
    heroAlt: "面向决策的研究现场",
    positions: ["/design/interviews/wu-data.jpg", "/design/interviews/chen-write.jpg"],
  },
  4: {
    hero: "/design/interviews/li-code.jpg",
    heroAlt: "实验室与工程研发",
    positions: [
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
    hero: "/design/interviews/chen-write.jpg",
    heroAlt: "编辑与审读书稿",
    positions: ["/design/library.jpg", "/design/interviews/wang-docs.jpg", "/design/interviews/wang-meeting.jpg", "/design/interviews/zhang-nature.jpg"],
  },
  6: {
    hero: "/design/interviews/zhou-lab.jpg",
    heroAlt: "医学与实验室现场",
    positions: ["/design/interviews/wu-data.jpg", "/design/library.jpg", "/design/interviews/wang-meeting.jpg"],
  },
  7: {
    hero: "/design/interviews/wang-meeting.jpg",
    heroAlt: "纪律性组织中的工作会议",
    positions: ["/design/tools-office.jpg", "/design/interviews/wang-docs.jpg", "/design/interviews/li-team.jpg"],
  },
  8: {
    hero: "/design/interviews/wu-data.jpg",
    heroAlt: "国际组织与独立研究现场",
    positions: ["/design/interviews/zhang-nature.jpg", "/design/library.jpg", "/design/interviews/chen-write.jpg", "/design/tools-office.jpg", "/design/interviews/li-team.jpg", "/design/interviews/wang-meeting.jpg"],
  },
};

const CATS = [
  {
    id: 1,
    name: "学术支撑",
    desc: "高校与科研机构内部的教研、行政支撑与信息服务",
    tone: "sand" as const,
    posts: 7,
    employers: "C9 高校 · 中科院 · 中国社科院",
    image: "/design/roi-library.jpg",
    imageAlt: "大学图书馆阅览大厅",
    roles: [
      { title: "助理教授 / 特聘副研究员", salary: "20-35 万" },
      { title: "副教授（预聘）", salary: "30-50 万" },
      { title: "副研究员", salary: "18-35 万" },
    ],
  },
  {
    id: 2,
    name: "党政管理",
    desc: "公务员、选调生、党校等党政机关与参公事业单位",
    tone: "blush" as const,
    posts: 4,
    employers: "中央国家机关 · 省直机关 · 市委组织部",
    image: "/design/policy.jpg",
    imageAlt: "政策研究与机关场景",
    roles: [
      { title: "定向选调生", salary: "12-20 万" },
      { title: "部委选调生", salary: "15-22 万" },
      { title: "政策研究岗", salary: "14-24 万" },
    ],
  },
  {
    id: 3,
    name: "社会智库",
    desc: "行业研究、决策咨询——为决策层提供结构化分析与政策建议",
    tone: "sage" as const,
    posts: 4,
    employers: "国务院发展研究中心 · 高校型智库 · 民间智库",
    image: "/design/interviews/zhang-consult.jpg",
    imageAlt: "政策咨询与案头研判",
    roles: [
      { title: "智库研究员", salary: "25-50 万" },
      { title: "政策分析师", salary: "20-35 万" },
      { title: "宏观研究员", salary: "28-45 万" },
    ],
  },
  {
    id: 4,
    name: "科技企业",
    desc: "企业研发、产业研究、金融投研与战略咨询",
    tone: "sand" as const,
    posts: 10,
    employers: "字节 AI Lab · 华为 2012 实验室 · 中信证券",
    image: "/design/industry.jpg",
    imageAlt: "产业与实验室工作现场",
    roles: [
      { title: "算法专家", salary: "60-150 万" },
      { title: "产业研究员", salary: "35-70 万" },
      { title: "咨询顾问", salary: "30-60 万" },
    ],
  },
  {
    id: 5,
    name: "文化出版",
    desc: "公共图书馆、博物馆、编辑出版机构——文化保存、知识传播与内容生产",
    tone: "blush" as const,
    posts: 4,
    employers: "商务印书馆 · 国家图书馆 · 三联书店",
    image: "/design/interviews/chen-books.jpg",
    imageAlt: "出版社与图书馆书架",
    roles: [
      { title: "学术编辑", salary: "15-28 万" },
      { title: "副研究馆员", salary: "16-26 万" },
      { title: "策展研究员", salary: "15-25 万" },
    ],
  },
  {
    id: 6,
    name: "医疗健康",
    desc: "医院、公共卫生机构、医药企业的研究、临床与公共卫生岗位",
    tone: "sage" as const,
    posts: 5,
    employers: "百济神州 · 中国疾控中心 · 药明康德",
    image: "/design/interviews/zhou-clinic.jpg",
    imageAlt: "医学与数字化工作的交汇",
    roles: [
      { title: "医学经理", salary: "30-60 万" },
      { title: "流行病学研究员", salary: "20-40 万" },
      { title: "药物研发科学家", salary: "35-80 万" },
    ],
  },
  {
    id: 7,
    name: "军警文职",
    desc: "军队文职、公安（警务）文职——纪律性组织中的技术与研究岗位",
    tone: "sand" as const,
    posts: 3,
    employers: "国防科技大学 · 公安部物证鉴定中心",
    image: "/design/path.jpg",
    imageAlt: "纪律性组织中的技术岗位现场",
    roles: [
      { title: "军队文职技术岗", salary: "18-30 万" },
      { title: "警务技术岗", salary: "15-25 万" },
      { title: "军队文职管理岗", salary: "15-28 万" },
    ],
  },
  {
    id: 8,
    name: "其他",
    desc: "基础教育、国际组织、教育培训创业等多元化方向",
    tone: "blush" as const,
    posts: 6,
    employers: "UNESCO · 世界银行 · 知识付费平台",
    image: "/design/interviews/wu-research.jpg",
    imageAlt: "国际组织与行业调研现场",
    roles: [
      { title: "项目官员", salary: "30-60 万" },
      { title: "课程负责人", salary: "20-50 万" },
      { title: "独立顾问", salary: "项目制" },
    ],
  },
];

const TONE_BG = {
  sand: "bg-[#F9EAD0]",
  blush: "bg-[#EEC3AF]",
  sage: "bg-[#E1E3A2]",
} as const;

function salaryBand(roles: { salary: string }[]) {
  const nums = roles.flatMap((r) => (r.salary.match(/\d+/g) ?? []).map(Number));
  if (nums.length < 2) return roles.find((r) => /\d/.test(r.salary))?.salary ?? "—";
  return `${Math.min(...nums)}–${Math.max(...nums)} 万`;
}

const MATERIALS = [
  { src: "/design/library.jpg", label: "评估", to: "assessment", kind: "outer" as const },
  { src: "/design/industry.jpg", label: "预警", to: "warning", kind: "inner" as const },
  { src: "/design/policy.jpg", label: "职业", to: "careers", kind: "inner" as const },
  { src: "/design/path.jpg", label: "门槛", to: "threshold", kind: "outer" as const },
];

function useRevealOnMount() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
}

function useRevealOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, on };
}

function usePhotoPan(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = ref.current;
    const img = wrap?.querySelector("img");
    if (!wrap || !img || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rest = "scale(1.06)";
    img.style.transform = rest;
    img.style.transition = "transform 0.35s ease-out";

    const onMove = (e: PointerEvent) => {
      wrap.classList.add("is-panning");
      const box = wrap.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width - 0.5) * 2;
      const y = ((e.clientY - box.top) / box.height - 0.5) * 2;
      img.style.transition = "transform 0.18s ease-out";
      img.style.transform = `scale(1.14) translate(${(-x * 14).toFixed(1)}px, ${(-y * 14).toFixed(1)}px)`;
    };
    const onLeave = () => {
      wrap.classList.remove("is-panning");
      img.style.transition = "transform 0.45s ease-out";
      img.style.transform = rest;
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.classList.remove("is-panning");
      img.style.transform = "";
      img.style.transition = "";
    };
  }, [active]);
  return ref;
}

function LivePhoto({
  src,
  alt,
  className,
  imgClassName,
  delay,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  delay?: string;
}) {
  const ref = usePhotoPan(true);
  return (
    <div ref={ref} className={`live-photo ${className ?? ""}`}>
      <div className="live-photo-drift" style={delay ? { animationDelay: delay } : undefined}>
        <img src={src} alt={alt} className={imgClassName} />
      </div>
    </div>
  );
}

function AxisDiamond({ on, delay }: { on: boolean; delay: number }) {
  return (
    <span
      className={`reveal-fade relative z-10 inline-flex h-[18px] w-[18px] items-center justify-center ${on ? "is-in" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="block h-full w-full">
        <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="#111111" />
      </svg>
    </span>
  );
}

function PathPill({ id, name, desc, side, on, delay }: { id: number; name: string; desc: string; side: "left" | "right"; on: boolean; delay: number }) {
  return (
    <Link
      to={goCareer(id)}
      className={`reveal w-full max-w-[400px] rounded-2xl px-7 py-6 no-underline ${
        side === "left" ? "reveal-left justify-self-end bg-[#F9EAD0]" : "reveal-right justify-self-start bg-[#EEC3AF]"
      } ${on ? "is-in" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="text-[17px] font-semibold text-[#111111]">{name}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-[#512818]/80">{desc}</p>
    </Link>
  );
}

function PathsCompare() {
  const { ref, on } = useRevealOnView();
  const left = CATS.slice(0, 4);
  const right = CATS.slice(4, 8);
  return (
    <div ref={ref} className="mx-auto max-w-[1080px]">
      <p className={`reveal reveal-up text-center text-[12px] font-semibold tracking-[.2em] text-[#A16B3E] ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.15s" }}>
        — JOB ATLAS
      </p>
      <h2 className={`reveal reveal-up mt-3 text-center font-serif text-[32px] font-semibold leading-none text-black md:text-[40px] ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.25s" }}>
        博士职业地图
      </h2>
      <p className={`reveal reveal-up mx-auto mt-4 max-w-[520px] text-center text-[14px] leading-relaxed ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.35s", color: "#C4A06A" }}>
        基于近五年博士毕业生去向，整理出 8 类典型职业分类。
      </p>
      <div className="relative mt-14">
        <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[#3A0E16]" aria-hidden />
        <div className="flex flex-col gap-6">
          {left.map((l, i) => {
            const r = right[i];
            const leftDelay = 0.5 + i * 0.28;
            const rightDelay = leftDelay + 0.14;
            return (
              <div key={l.name} className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-6">
                <PathPill id={l.id} name={l.name} desc={l.desc} side="left" on={on} delay={leftDelay} />
                <AxisDiamond on={on} delay={leftDelay} />
                <PathPill id={r.id} name={r.name} desc={r.desc} side="right" on={on} delay={rightDelay} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolsShowcase() {
  const { ref, on } = useRevealOnView();
  const tools = [
    { key: "threshold", label: "学术职位门槛评估", to: "threshold", icon: "/design/icon-assignments.svg?v=2" },
    { key: "warning", label: "职位预警", to: "warning", icon: "/design/icon-feedback.svg" },
    { key: "assessment", label: "博士非学术职业评估", to: "assessment", icon: "/design/icon-exams.svg" },
  ] as const;
  return (
    <div ref={ref}>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center gap-10">
          <div className={`reveal reveal-up text-center ${on ? "is-in" : ""}`}>
            <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— DECISION TOOLS</p>
            <h2 className="mt-3 font-serif text-[32px] font-normal leading-tight text-[#04191F] md:text-[38px]">
              决策工具
            </h2>
          </div>
          <div className={`reveal reveal-up flex w-full items-stretch ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.12s" }}>
            {tools.map((t, i) => (
              <div
                key={t.key}
                className={`flex flex-1 items-center ${
                  i === 0 ? "justify-start pr-8" : i === tools.length - 1 ? "justify-end pl-8" : "justify-center px-8"
                } ${i < tools.length - 1 ? "border-r border-[#161313]/40" : ""}`}
              >
                <Link
                  to={go(t.to)}
                  className="flex items-center gap-2.5 py-1 text-[14px] leading-[1.4] text-[#04191F] no-underline"
                >
                  <img src={t.icon} alt="" width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
                  {t.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`reveal reveal-up relative mx-auto mt-10 max-w-[1200px] pb-[120px] ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.22s" }}>
        <LivePhoto
          src="/design/tools-office.jpg"
          alt="轻松办公中的团队协作"
          className="aspect-[5/4] rounded-[8px] md:ml-[130px] md:aspect-[2.6/1] md:w-[calc(100%-130px)]"
          imgClassName="h-full w-full object-cover object-center"
        />
        <div className="relative mx-4 -mt-10 max-w-[650px] rounded-[12px] bg-white p-8 shadow-[1px_8px_12px_rgba(207,192,176,0.12)] md:absolute md:bottom-0 md:left-0 md:mx-0 md:mt-0 md:p-10">
          <h3 className="m-0 font-serif text-[26px] font-normal leading-snug text-[#04191F] md:text-[32px]">
            理清职业方向，降低选择内耗
          </h3>
          <p className="mt-5 text-[16px] leading-relaxed text-[#04191F]/80">
            一站式完成学术岗位研判、求职风险预警、非学术赛道测评，高效梳理自身条件与岗位匹配度，帮博士看清发展可能性，全部能力都整合在同一套决策工具中实现。
          </p>
          <Link
            to={go("threshold")}
            className="mt-5 inline-flex h-10 items-center gap-2.5 rounded-[4px] border border-[#04191F] px-5 text-[14px] text-[#04191F] no-underline"
          >
            了解更多
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function WhyAssess() {
  const { ref, on } = useRevealOnView();
  const items = [
    { icon: "/design/icon-why-path.svg", text: "理清博士发展路径，降低职业选择的试错成本。" },
    { icon: "/design/icon-why-match.svg", text: "挖掘个人能力禀赋，匹配适配自身的学术与非学术赛道。" },
    { icon: "/design/icon-why-plan.svg", text: "规避信息差困境，建立长期可持续的职业发展规划。" },
    { icon: "/design/icon-why-bound.svg", text: "认清自身诉求边界，从容完成博士阶段到职场的过渡。" },
  ];
  return (
    <div ref={ref} className="mx-auto max-w-[1300px]">
      <h2 className={`reveal reveal-up mt-10 mb-[60px] text-center font-serif text-[30px] font-normal leading-[1.25] tracking-[-0.0015em] text-[#04191F] ${on ? "is-in" : ""}`}>
        为什么要进行职业决策评估？
      </h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.text}
            className={`reveal reveal-up flex flex-col gap-5 rounded-[8px] bg-[#FFFDF9] p-5 shadow-[1px_8px_12px_rgba(207,192,176,0.12)] ${on ? "is-in" : ""}`}
            style={{ transitionDelay: `${0.12 + i * 0.08}s` }}
          >
            <img src={it.icon} alt="" width={34} height={34} className="block h-[34px] w-[34px]" />
            <p className="m-0 max-w-[400px] font-serif text-[14px] font-normal leading-[19.6px] text-[#04191F]">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const UNIS = [
  { name: "清华大学", src: "/design/unis/tsinghua.svg", kind: "seal" as const },
  { name: "北京大学", src: "/design/unis/peking.svg", kind: "seal" as const },
  { name: "复旦大学", src: "/design/unis/fudan.svg", kind: "seal" as const },
  { name: "浙江大学", src: "/design/unis/zju.png", kind: "word" as const },
  { name: "上海交通大学", src: "/design/unis/sjtu.png", kind: "seal" as const },
  { name: "南京大学", src: "/design/unis/nju.png", kind: "seal" as const },
  { name: "中国科学技术大学", src: "/design/unis/ustc.png", kind: "seal" as const },
  { name: "哈尔滨工业大学", src: "/design/unis/hit.png", kind: "seal" as const },
  { name: "西安交通大学", src: "/design/unis/xjtu.png", kind: "seal" as const },
  { name: "武汉大学", src: "/design/unis/whu.png", kind: "seal" as const },
  { name: "中山大学", src: "/design/unis/sysu.png", kind: "seal" as const },
  { name: "中国人民大学", src: "/design/unis/ruc.png", kind: "seal" as const },
  { name: "同济大学", src: "/design/unis/tongji.png", kind: "seal" as const },
  { name: "南开大学", src: "/design/unis/nankai.png", kind: "seal" as const },
  { name: "Harvard University", src: "/design/unis/harvard-word.svg", kind: "word" as const },
  { name: "MIT", src: "/design/unis/mit.svg", kind: "word" as const },
  { name: "King's College London", src: "/design/unis/kcl.png", kind: "word" as const },
  { name: "The University of Melbourne", src: "/design/unis/melbourne.png", kind: "word" as const },
];

function CareerFit() {
  const { ref, on } = useRevealOnView();
  return (
    <div ref={ref} className={`reveal reveal-up relative mx-auto max-w-[1300px] md:pb-[120px] ${on ? "is-in" : ""}`}>
      <LivePhoto
        src="/design/roi-library.jpg"
        alt="大学图书馆阅览大厅"
        className="live-photo--alt aspect-[5/4] rounded-[8px] md:ml-[130px] md:aspect-[2.6/1] md:w-[calc(100%-130px)]"
        imgClassName="h-full w-full object-cover"
      />
      <div className="relative mx-4 -mt-10 max-w-[650px] rounded-[12px] bg-white p-8 shadow-[1px_8px_12px_rgba(207,192,176,0.12)] md:absolute md:bottom-0 md:left-0 md:mx-0 md:mt-0 md:p-[88px]">
        <div className="flex flex-col items-start gap-10">
          <h2 className="m-0 font-serif text-[28px] font-normal leading-[1.15] text-[#04191F] md:text-[38px] md:leading-[43.7px]">
            你现在的职业真的适合你吗？
          </h2>
          <div className="flex flex-col gap-4 text-[16px] leading-[22.4px] text-[#04191F]">
            <p className="m-0">
              学术之外评估系统帮博士生量化性格特质与现有职业路径的匹配程度，挖掘适配个人特质的发展方向，并给出清晰可行的行动准备方案。
            </p>
            <p className="m-0">
              通过多维度职业测评分析，帮助迷茫的博士群体识别转型可能性，降低盲目试错带来的时间与精力消耗。
            </p>
          </div>
          <Link
            to={go("assessment")}
            className="inline-flex h-9 items-center rounded-[4px] bg-[#04191F] px-6 text-[16px] text-[#FFFDF9] no-underline"
          >
            开始评估
          </Link>
        </div>
      </div>
    </div>
  );
}

const INTERVIEWS = [
  {
    name: "王女士",
    quote: "学术训练给我的不是论文产出能力，而是把一个模糊问题拆成可研究子问题的本能。",
    from: "高校教研岗（C9 副教授）",
    to: "国家级智库 研究员",
    images: { base: "/design/interviews/wang-meeting.jpg", inset: "/design/interviews/wang-docs.jpg" },
    alts: { base: "智库研讨会上的协作", inset: "拆解问题与研读材料" },
  },
  {
    name: "李先生",
    quote: "我用了两年才接受：发表不是终点，能否解决业务问题才是。",
    from: "理工科 PhD",
    to: "头部互联网 算法专家",
    images: { base: "/design/interviews/li-code.jpg", inset: "/design/interviews/li-team.jpg" },
    alts: { base: "算法工程师的工作台", inset: "产业团队协作讨论" },
  },
  {
    name: "陈先生",
    quote: "我没有离开学术，我只是不再生产学术——而是判断它。",
    from: "人文社科 PhD",
    to: "高校出版社 学术编辑",
    images: { base: "/design/interviews/chen-books.jpg", inset: "/design/interviews/chen-write.jpg" },
    alts: { base: "出版社与图书馆书架", inset: "审读书稿与编辑工作" },
  },
  {
    name: "张女士",
    quote: "不必执着于把博士身份写进岗位标签里，科研练就的思辨力，在很多领域都能落地发光。",
    from: "环境科学 PhD",
    to: "大型国企 政策咨询顾问",
    images: { base: "/design/interviews/zhang-consult.jpg", inset: "/design/interviews/zhang-nature.jpg" },
    alts: { base: "政策咨询与案头研判", inset: "环境科学相关的自然场景" },
  },
  {
    name: "周先生",
    quote: "我曾害怕放弃教职就是博士生涯的失败，后来才懂得，适合自己的路，从来没有标准答案。",
    from: "生物医学 PhD",
    to: "医疗器械企业 医学科学联络经理 (MSL)",
    images: { base: "/design/interviews/zhou-clinic.jpg", inset: "/design/interviews/zhou-lab.jpg" },
    alts: { base: "医学与数字化工作的交汇", inset: "实验室与医疗科研现场" },
  },
  {
    name: "吴女士",
    quote: "读博教会我如何做深度调研，这份能力，同样可以用来读懂行业、读懂自己。",
    from: "社会学 PhD",
    to: "市场研究公司 高级行业研究员",
    images: { base: "/design/interviews/wu-research.jpg", inset: "/design/interviews/wu-data.jpg" },
    alts: { base: "行业调研访谈现场", inset: "数据分析与研究报告" },
  },
] as const;

function InterviewPhoto({
  src,
  alt,
  on,
  delay,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  on: boolean;
  delay?: string;
  className: string;
  imgClassName?: string;
}) {
  const ref = usePhotoPan(on);
  return (
    <div
      ref={ref}
      className={`interview-photo-wrap ${on ? "is-in" : ""} ${className}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <img src={src} alt={alt} className={imgClassName} />
    </div>
  );
}

function InterviewCollage({
  item,
  on,
}: {
  item: (typeof INTERVIEWS)[number];
  on: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[605px] pb-8 pt-2">
      <InterviewPhoto
        src={item.images.base}
        alt={item.alts.base}
        on={on}
        className="aspect-[5/4] rounded-[12px] md:h-[460px] md:aspect-auto"
      />
      <InterviewPhoto
        src={item.images.inset}
        alt={item.alts.inset}
        on={on}
        delay="0.16s"
        className="absolute bottom-2 left-[-8px] w-[42%] rounded-[12px] shadow-[1px_8px_12px_rgba(207,192,176,0.28)] md:bottom-0 md:left-[-18px] md:w-[200px]"
        imgClassName="aspect-square"
      />
    </div>
  );
}

function InterviewRow({ item, flipped }: { item: (typeof INTERVIEWS)[number]; flipped: boolean }) {
  const { ref, on } = useRevealOnView();
  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 md:gap-[100px] ${
        flipped ? "md:grid-cols-[0.45fr_0.55fr]" : "md:grid-cols-[0.55fr_0.45fr]"
      }`}
    >
      <div className={flipped ? "md:order-2" : ""}>
        <InterviewCollage item={item} on={on} />
      </div>
      <div
        className={`reveal flex max-w-[550px] flex-col justify-center gap-5 ${
          flipped ? "reveal-left md:order-1" : "reveal-right"
        } ${on ? "is-in" : ""}`}
        style={{ transitionDelay: "0.2s" }}
      >
        <h3 className="m-0 font-serif text-[24px] font-normal leading-snug text-[#04191F] md:text-[30px] md:leading-[37.5px]">
          「{item.quote}」
        </h3>
        <div className="text-[16px] leading-[22.4px] text-[#04191F]">
          <p className="m-0 font-semibold">{item.name}</p>
          <p className="mt-1 m-0 text-[#04191F]/70">
            {item.from} → {item.to}
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldNotes() {
  const { ref, on } = useRevealOnView();
  return (
    <div className="mx-auto max-w-[1200px]">
      <div ref={ref} className={`reveal reveal-up max-w-[640px] ${on ? "is-in" : ""}`}>
        <p className="text-[12px] font-semibold tracking-[.2em] text-[#5B0D1C]">— FIELD NOTES</p>
        <h2 className="mt-3 font-serif text-[32px] font-normal leading-tight text-[#5B0D1C] md:text-[38px]">
          转型者访谈
        </h2>
        <p className="mt-3 text-[16px] leading-[22.4px] text-[#5B0D1C]/75">
          听已经走过的人说他们做对了什么、踩过什么坑。
        </p>
      </div>
      <div className="mt-14 flex flex-col gap-16 md:gap-20">
        {INTERVIEWS.map((item, i) => (
          <InterviewRow key={item.name} item={item} flipped={i % 2 === 0} />
        ))}
      </div>
    </div>
  );
}

function UniMarquee() {
  const loop = [...UNIS, ...UNIS, ...UNIS, ...UNIS];
  return (
    <div>
      <p className="mb-10 pt-5 text-center text-[13px] font-normal tracking-[0.1em] text-[#04191F]">
        你是否有机会进入这些大学？
      </p>
      <div className="overflow-hidden">
        <div className="uni-marquee-inner flex w-max flex-nowrap items-center gap-5">
          {loop.map((u, i) => (
            <div key={`${u.name}-${i}`} className="flex h-10 shrink-0 items-center border-r border-[#161313]/40 pr-5">
              {u.kind === "seal" ? (
                <span className="flex items-center gap-2">
                  <img src={u.src} alt="" className="h-8 w-8 object-contain" />
                  <span className="whitespace-nowrap text-[13px] text-[#04191F]">{u.name}</span>
                </span>
              ) : (
                <img src={u.src} alt={u.name} className="h-10 max-w-[150px] object-contain" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="h-[100px]" aria-hidden />
    </div>
  );
}

const ChromeCtx = createContext(true);

function asList(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function unwrapData(raw: unknown): unknown {
  const rec = asRecord(raw);
  return rec && "data" in rec ? rec.data : raw;
}

function asPositions(v: unknown): Position[] {
  return asList(v).flatMap((item) => {
    const o = asRecord(item);
    if (!o) return [];
    return [{ title: String(o.title ?? ""), salary: String(o.salary ?? ""), desc: String(o.desc ?? "") }];
  });
}

function asInterviews(v: unknown): CareerInterview[] {
  return asList(v).flatMap((item) => {
    const o = asRecord(item);
    if (!o) return [];
    return [{ name: String(o.name ?? ""), quote: String(o.quote ?? ""), path: String(o.path ?? "") }];
  });
}

function asOpenings(v: unknown): OpeningBrief[] {
  return asList(v).flatMap((item) => {
    const o = asRecord(item);
    if (!o) return [];
    return [{ title: String(o.title ?? ""), org: String(o.org ?? ""), location: String(o.location ?? "") }];
  });
}

function asCategory(raw: unknown): Category | null {
  const c = asRecord(raw);
  if (!c) return null;
  const id = Number(c.id);
  if (!Number.isFinite(id)) return null;
  const gallery = asList(c.gallery).map((item) => String(item)).filter(Boolean);
  const media = resolveCategoryMedia(id, {
    coverImage: String(c.coverImage ?? ""),
    heroImage: String(c.heroImage ?? ""),
    imageAlt: String(c.imageAlt ?? ""),
    tone: isCategoryTone(c.tone) ? c.tone : undefined,
    gallery,
  });
  return {
    id,
    name: String(c.name ?? ""),
    tagline: String(c.tagline ?? ""),
    overview: String(c.overview ?? ""),
    positions: asPositions(c.positions),
    employers: asList(c.employers).map((item) => String(item)).filter(Boolean),
    interviews: asInterviews(c.interviews),
    openings: asOpenings(c.openings),
    ...media,
  };
}

function asCategories(raw: unknown): Category[] {
  return asList(unwrapData(raw)).map(asCategory).filter((c): c is Category => c != null);
}

function hydrateCategory(c: Category): Category {
  return { ...c, ...resolveCategoryMedia(c.id, c) };
}

const FALLBACK_CATEGORIES = CATEGORIES.map(hydrateCategory);

function cardTone(tone?: string) {
  return isCategoryTone(tone) ? tone : "sand";
}

function Shell({ children, tone = "cream", active, narrow, flush }: { children: React.ReactNode; tone?: "cream" | "wine"; active?: string; narrow?: boolean; flush?: boolean }) {
  const chrome = useContext(ChromeCtx);
  if (!chrome) return <>{children}</>;
  return (
    <Frame>
      <div className={tone === "wine" ? "relative" : undefined} style={tone === "wine" ? { backgroundColor: "#5B0D1C" } : undefined}>
        <DesignNav tone={tone} active={active} narrow={narrow} flush={flush} />
        {children}
      </div>
      <DesignFooter />
    </Frame>
  );
}

export function HomeScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const body = (
    <>
      <section className="px-8 pb-16 text-center text-[#F6F0EB]" style={{ backgroundColor: "#5B0D1C" }}>
        <div className="h-[70px]" aria-hidden />
        <div className="pt-20 md:pt-24">
          <h1 className={`reveal reveal-up whitespace-nowrap font-serif text-[36px] font-medium leading-none md:text-[52px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.3s" }}>
            看见更多可能。
          </h1>
          <p className={`reveal reveal-up mt-5 whitespace-nowrap text-[13px] font-normal tracking-[.02em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.4s" }}>
            一个面向博士的职业决策平台——帮助你把学术训练转化为更多职业可能。
          </p>
        </div>
        <div className="mx-auto mt-20 flex max-w-[980px] items-start justify-center gap-4 px-2 md:mt-24">
          {MATERIALS.map((m, i) => (
            <div
              key={m.label}
              className={`min-w-0 ${m.kind === "outer" ? "w-[19.5%] translate-y-8 md:translate-y-10" : "w-[23%]"}`}
            >
              <div className={`reveal reveal-up-fast ${show ? "is-in" : ""}`} style={{ transitionDelay: `${0.6 + i * 0.1}s` }}>
                <Link to={go(m.to)} className="relative block overflow-hidden rounded-[20px] no-underline">
                  <LivePhoto
                    src={m.src}
                    alt={m.label}
                    delay={`${i * -6}s`}
                    className={`live-photo--hero ${m.kind === "outer" ? "aspect-[2/3]" : "aspect-[5/6]"}`}
                    imgClassName="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 z-[1] rounded-md bg-white px-2.5 py-1.5 text-[12px] font-semibold tracking-[.14em] text-[#5B0D1C]">
                    {m.label}
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className={`reveal reveal-up mt-20 text-[11px] font-semibold tracking-[.22em] text-[#EEC3AF] uppercase md:mt-24 ${show ? "is-in" : ""}`} style={{ transitionDelay: "1s" }}>
          Beyond Academia · A Decision Platform for PhDs
        </p>
      </section>
      <section className="rounded-t-[48px] bg-[#F6F0EB] px-6 py-20 md:rounded-t-[80px] md:py-24">
        <PathsCompare />
      </section>
      <section className="bg-[#FFF5D4] px-6 py-10 md:px-10">
        <ToolsShowcase />
      </section>
      <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-6 pb-16 pt-10 md:px-10">
        <WhyAssess />
      </section>
      <section className="bg-white">
        <UniMarquee />
      </section>
      <section className="relative z-[3] bg-[#FCF7EF] px-6 py-10 md:p-10">
        <CareerFit />
      </section>
      <div className="relative z-[2] -mt-10 h-[160px] rounded-t-[32px] bg-[#FFC8AE]" aria-hidden />
      <section className="relative z-[3] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-6 py-16 md:px-10 md:py-20">
        <FieldNotes />
      </section>
    </>
  );
  if (!chrome) return body;
  return (
    <Shell tone="wine" narrow>
      {body}
    </Shell>
  );
}

function CareerCatCard({
  cat,
  on,
  delay,
  flip,
}: {
  cat: Category;
  on: boolean;
  delay: number;
  flip: boolean;
}) {
  const tone = cardTone(cat.tone);
  const index = String(cat.id).padStart(2, "0");
  const orgs = cat.employers;
  const hoverRoles = cat.positions.slice(0, 3);
  const bandSource = cat.positions;
  return (
    <Link
      to={goCareer(cat.id)}
      className={`atlas-card group reveal reveal-up flex flex-col overflow-hidden rounded-2xl no-underline md:min-h-[288px] md:flex-row ${
        flip ? "md:flex-row-reverse" : ""
      } ${TONE_BG[tone]} ${on ? "is-in" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className={`atlas-card-photo relative h-[188px] shrink-0 overflow-hidden md:h-auto md:min-h-full md:w-[42%] ${flip ? "live-photo--alt" : ""}`}>
        <LivePhoto
          src={cat.coverImage || "/design/roi-library.jpg"}
          alt={cat.imageAlt || cat.name}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover"
          delay={`${(cat.id % 4) * -4}s`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#5B0D1C]/70 via-[#5B0D1C]/15 to-transparent" />
        <span className="absolute right-3 top-3 rounded-md bg-white/92 px-2 py-1 text-[11px] font-semibold tracking-[.08em] text-[#5B0D1C]">
          {cat.positions.length} 个代表岗位
        </span>
        <span className="atlas-card-index absolute bottom-1 left-3 font-serif tabular-nums leading-none text-white" aria-hidden>
          {index}
        </span>
        <div className="atlas-sheet absolute inset-0 flex flex-col justify-end p-4 text-white">
          <div className="text-[11px] font-semibold tracking-[.16em] text-[#EEC3AF]">代表岗位</div>
          <div className="mt-2 space-y-1.5">
            {hoverRoles.map((role) => (
              <div key={role.title} className="atlas-role flex items-baseline justify-between gap-3 text-[13px]">
                <span>{role.title}</span>
                <span className="shrink-0 font-mono text-[12px] text-white/80">{role.salary}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 py-6 md:px-7 md:py-7">
        <h2 className="atlas-card-title m-0 font-serif text-[26px] font-semibold leading-none text-[#111111] md:text-[30px]">
          <span className="relative inline-block">
            <span className="atlas-card-mark absolute inset-x-0 bottom-[1px] h-[8px] bg-[#5B0D1C]/18" aria-hidden />
            <span className="relative">{cat.name}</span>
          </span>
        </h2>
        <p className="mt-3 mb-0 text-[14px] leading-relaxed text-[#512818]/80">{cat.tagline}</p>
        <div className="atlas-rule mt-5 bg-[#5B0D1C]" aria-hidden />
        <div className="mt-4">
          <div className="text-[11px] font-semibold tracking-[.18em] text-[#A16B3E]">薪资带</div>
          <div className="mt-1 font-serif text-[28px] font-semibold leading-none tabular-nums text-[#3A0E16] md:text-[32px]">
            {salaryBand(bandSource)}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {orgs.map((org) => (
            <span key={org} className="rounded-full bg-white/55 px-2.5 py-0.5 text-[11px] text-[#512818]/80">
              {org}
            </span>
          ))}
        </div>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[14px] text-[#04191F]">
          进入此类
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </span>
      </div>
    </Link>
  );
}

export function CareersScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const { ref: listRef, on: listOn } = useRevealOnView();
  const { ref: ctaRef, on: ctaOn } = useRevealOnView();
  const [cats, setCats] = useState<Category[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/careers/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: unknown) => {
        if (cancelled) return;
        const list = asCategories(data);
        if (list.length) setCats(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ChromeCtx.Provider value={chrome}>
    <Shell active="careers" flush>
      <section className="relative flex min-h-[520px] flex-col overflow-hidden md:min-h-[600px]">
        <img
          src="/design/careers-hero.jpg"
          alt="图书馆阅览大厅中的研究者"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[90px] pb-10 md:px-10">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
            <div
              className={`reveal reveal-up mt-auto max-w-[650px] rounded-[12px] bg-white p-8 md:p-10 ${show ? "is-in" : ""}`}
            >
              <h1 className="m-0 font-serif text-[36px] font-normal leading-[1.1] text-[#04191F] md:text-[44px] md:leading-[48px]">
                博士职业地图
              </h1>
              <p className="mt-5 mb-0 max-w-[570px] text-[16px] leading-[1.4] text-[#04191F] md:text-[18px] md:leading-[25px]">
                按去向浏览，而不是按学科浏览。基于近五年博士毕业生去向，整理出 8 类典型职业分类。点进一类，看岗位、雇主与走过的人。
              </p>
            </div>
          </div>
          <div className="h-[100px] shrink-0" aria-hidden />
        </div>
      </section>
      <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-white px-5 pb-16 pt-10 md:px-10 md:pb-20 md:pt-10">
        <div ref={listRef} className="mx-auto max-w-[1600px] pt-10">
          <div className="grid gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {cats.map((cat, i) => (
              <CareerCatCard key={cat.id} cat={cat} on={listOn} delay={0.08 + i * 0.07} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
        <div ref={ctaRef} className={`reveal reveal-up mx-auto mt-16 flex max-w-[1600px] flex-col items-start justify-between gap-8 rounded-[12px] bg-[#5B0D1C] px-8 py-10 text-white md:flex-row md:items-end md:px-10 ${ctaOn ? "is-in" : ""}`}>
          <div className="max-w-[520px]">
            <p className="text-[12px] font-semibold tracking-[.2em] text-[#EEC3AF]">— DECISION TOOLS</p>
            <h2 className="mt-3 m-0 font-serif text-[28px] font-normal leading-snug md:text-[32px]">不确定从哪一类开始？</h2>
            <p className="mt-3 m-0 text-[15px] leading-relaxed text-white/75">8 分钟评估，对照 8 类去向给出匹配度。</p>
          </div>
          <Link
            to={go("assessment")}
            className="inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[14px] text-[#5B0D1C] no-underline"
          >
            开始评估
          </Link>
        </div>
      </section>
    </Shell>
    </ChromeCtx.Provider>
  );
}

export function CareerDetailScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const { ref: mainRef, on: mainOn } = useRevealOnView();
  const { ref: sideRef, on: sideOn } = useRevealOnView();
  const { id: paramId } = useParams();
  const [sp] = useSearchParams();
  const studio = inDesignStudio();
  const idNum = Number(studio ? sp.get("id") : paramId);
  const validId = Number.isInteger(idNum) && idNum > 0;

  const [cats, setCats] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [cat, setCat] = useState<Category | null>(() => {
    if (validId) return FALLBACK_CATEGORIES.find((c) => c.id === idNum) ?? null;
    return studio ? FALLBACK_CATEGORIES[0] : null;
  });
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const local = FALLBACK_CATEGORIES.find((c) => c.id === idNum) ?? null;
    if (validId) {
      if (local) {
        setCat(local);
        setMissing(false);
      } else {
        setMissing(false);
      }
    } else {
      setCat(studio ? FALLBACK_CATEGORIES[0] : null);
      setMissing(!studio);
    }

    fetch("/api/careers/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: unknown) => {
        if (cancelled) return;
        const list = asCategories(data);
        if (list.length) setCats(list);
        const live = validId ? list.find((c) => c.id === idNum) : undefined;
        if (live) {
          setCat(live);
          setMissing(false);
        }
      })
      .catch(() => {});

    if (!validId) return () => { cancelled = true; };

    fetch(`/api/careers/categories/${idNum}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((data: unknown) => {
        if (cancelled) return;
        const parsed = asCategory(unwrapData(data));
        if (parsed) {
          setCat(parsed);
          setMissing(false);
        } else {
          setCat(local);
          setMissing(!local && !studio);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (local) {
          setCat(local);
          setMissing(false);
        } else if (!studio) {
          setCat(null);
          setMissing(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [idNum, validId, studio]);

  if (missing && !cat) {
    return (
      <ChromeCtx.Provider value={chrome}>
        <Shell active="careers">
          <div className="mx-auto max-w-[720px] px-6 pb-24 pt-[120px]">
            <h1 className="m-0 font-serif text-[36px] font-normal text-[#04191F]">该分类不存在</h1>
            <p className="mt-4 mb-0 text-[16px] leading-relaxed text-[#512818]/75">这条去向还没有收录，或链接已经失效。</p>
            <Link to={go("careers")} className="mt-8 inline-flex items-center gap-2 text-[14px] text-[#A16B3E] no-underline">
              ← 返回职业地图
            </Link>
          </div>
        </Shell>
      </ChromeCtx.Provider>
    );
  }

  if (!cat) {
    return (
      <ChromeCtx.Provider value={chrome}>
        <Shell active="careers">
          <div className="mx-auto max-w-[720px] px-6 pb-24 pt-[120px]">
            <p className="m-0 text-[16px] text-[#512818]/70">加载中…</p>
          </div>
        </Shell>
      </ChromeCtx.Provider>
    );
  }

  const media = resolveCategoryMedia(cat.id, cat);
  const tones = ["bg-[#F9EAD0]", "bg-[#EEC3AF]", "bg-[#E1E3A2]"] as const;
  const notes = cat.interviews.filter((iv) => !iv.quote.includes("待补充") && !iv.name.includes("待补充"));
  const stats = [
    { n: String(cat.positions.length), l: "代表岗位" },
    { n: salaryBand(cat.positions), l: "薪资带" },
    { n: String(cat.employers.length), l: "典型雇主" },
  ];

  return (
    <ChromeCtx.Provider value={chrome}>
    <Shell active="careers" flush>
      <section className="relative flex min-h-[520px] flex-col overflow-hidden md:min-h-[640px]">
        <LivePhoto
          src={media.heroImage}
          alt={media.imageAlt || cat.name}
          className="absolute inset-0 h-full w-full live-photo--hero"
          imgClassName="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16] via-[#3A0E16]/50 to-[#3A0E16]/18" />
        <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[100px] pb-20 md:px-10 md:pb-24">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end">
            <nav className={`reveal reveal-up flex flex-wrap items-center gap-2 text-[13px] text-white/70 ${show ? "is-in" : ""}`}>
              <Link to={go("home")} className="text-inherit no-underline hover:text-white">首页</Link>
              <span aria-hidden>›</span>
              <Link to={go("careers")} className="text-inherit no-underline hover:text-white">博士职业地图</Link>
              <span aria-hidden>›</span>
              <span className="text-white">{cat.name}</span>
            </nav>
            <p className={`reveal reveal-up mt-10 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              — JOB ATLAS
            </p>
            <h1 className={`reveal reveal-up mt-3 m-0 font-serif text-[44px] font-semibold leading-none text-white md:text-[64px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
              {cat.name}
            </h1>
            <p className={`reveal reveal-up mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-white/80 md:text-[18px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
              {cat.tagline}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1600px] items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-16">
          <div ref={mainRef}>
            <div className={`reveal reveal-up ${mainOn ? "is-in" : ""}`}>
              <div className="flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Link
                    key={c.id}
                    to={goCareer(c.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] no-underline transition-colors ${
                      c.id === cat.id ? "bg-[#5B0D1C] text-white" : "bg-white text-[#512818] hover:bg-[#5B0D1C] hover:text-white"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <p className="mt-8 mb-0 max-w-[720px] text-[16px] leading-relaxed text-[#512818]/85 md:text-[17px] md:leading-[1.7]">
                {cat.overview}
              </p>
              <dl className="mt-8 mb-0 grid grid-cols-3 gap-4 border-y border-[#161313]/10 py-6 md:gap-8">
                {stats.map((s) => (
                  <div key={s.l}>
                    <dt className="text-[11px] font-semibold tracking-[.16em] text-[#A16B3E]">{s.l}</dt>
                    <dd className="mt-1 mb-0 font-serif text-[22px] font-semibold leading-none tabular-nums text-[#3A0E16] md:text-[28px]">{s.n}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`reveal reveal-up mt-14 md:mt-16 ${mainOn ? "is-in" : ""}`}>
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— POSITIONS</p>
              <h2 className="mt-3 m-0 font-serif text-[32px] font-normal text-[#04191F] md:text-[40px]">代表岗位</h2>
            </div>
            <div className="mt-8 flex flex-col gap-7 md:mt-10 md:gap-8">
              {cat.positions.map((p, i) => {
                const img = media.gallery.length ? media.gallery[i % media.gallery.length] : undefined;
                return (
                  <article
                    key={p.title}
                    className={`plate-card group reveal reveal-up flex flex-col overflow-hidden rounded-2xl bg-white md:min-h-[240px] md:flex-row ${
                      i % 2 === 1 ? "md:flex-row-reverse" : ""
                    } ${mainOn ? "is-in" : ""}`}
                    style={{ transitionDelay: `${0.08 + i * 0.06}s` }}
                  >
                    <div className={`relative h-[188px] shrink-0 overflow-hidden md:h-auto md:min-h-full md:w-[38%] ${img ? "" : tones[i % 3]}`}>
                      {img ? (
                        <LivePhoto
                          src={img}
                          alt={p.title}
                          className={`absolute inset-0 h-full w-full ${i % 2 === 1 ? "live-photo--alt" : ""}`}
                          imgClassName="h-full w-full object-cover"
                          delay={`${(i % 4) * -5}s`}
                        />
                      ) : null}
                      <div className="plate-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-[#5B0D1C]/55 via-transparent to-transparent" />
                      <span className="plate-index absolute bottom-1 left-4 font-serif leading-none tabular-nums text-white" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center px-6 py-7 md:px-9 md:py-9">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h3 className="m-0 font-serif text-[22px] font-semibold leading-snug text-[#111111] md:text-[26px]">{p.title}</h3>
                        <span className="shrink-0 font-serif text-[22px] font-semibold tabular-nums text-[#A16B3E] md:text-[26px]">{p.salary}</span>
                      </div>
                      <div className="atlas-rule mt-4 bg-[#5B0D1C]" aria-hidden />
                      <p className="mt-4 mb-0 max-w-[520px] text-[15px] leading-relaxed text-[#512818]/80">{p.desc}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={`reveal reveal-up mt-16 md:mt-20 ${mainOn ? "is-in" : ""}`} style={{ transitionDelay: "0.12s" }}>
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— EMPLOYERS</p>
              <h2 className="mt-3 m-0 font-serif text-[32px] font-normal text-[#04191F] md:text-[40px]">典型雇主</h2>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {cat.employers.map((e) => (
                  <span
                    key={e}
                    className="rounded-full bg-white px-5 py-2.5 text-[14px] text-[#512818] shadow-[1px_8px_12px_rgba(207,192,176,0.12)] transition-colors hover:bg-[#5B0D1C] hover:text-white"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {notes.length > 0 ? (
              <div className={`reveal reveal-up mt-16 md:mt-20 ${mainOn ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— FIELD NOTES</p>
                <h2 className="mt-3 m-0 font-serif text-[32px] font-normal text-[#04191F] md:text-[40px]">转型者访谈</h2>
                <div className="mt-8 flex flex-col gap-8 md:mt-10 md:gap-10">
                  {notes.map((iv) => (
                    <article key={`${iv.name}-${iv.path}`} className="border-l-2 border-[#5B0D1C] pl-6 md:pl-8">
                      <p className="m-0 font-serif text-[22px] font-normal leading-snug text-[#04191F] md:text-[26px] md:leading-[1.35]">
                        「{iv.quote}」
                      </p>
                      <p className="mt-4 mb-0 text-[14px] leading-relaxed text-[#512818]/70">
                        {iv.name} · {iv.path}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <Link to={go("careers")} className="mt-14 inline-flex items-center gap-2 text-[14px] text-[#A16B3E] no-underline">
              ← 返回职业地图
            </Link>
          </div>

          <aside ref={sideRef} className="lg:sticky lg:top-24">
            <div className={`reveal reveal-up rounded-[12px] bg-[#5B0D1C] px-6 py-6 text-white ${sideOn ? "is-in" : ""}`}>
              <p className="m-0 text-[12px] font-semibold tracking-[.18em] text-[#EEC3AF]">看匹配度</p>
              <h3 className="mt-2 m-0 font-serif text-[24px] font-normal leading-snug">
                你与「{cat.name}」
                <br />
                匹配吗？
              </h3>
              <p className="mt-3 mb-0 text-[13px] leading-relaxed text-white/70">
                8 分钟对照 8 类去向，看你和这一类有多近。
              </p>
              <Link
                to={go("assessment")}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-white text-[14px] text-[#5B0D1C] no-underline"
              >
                开始评估
              </Link>
            </div>
            <div className={`reveal reveal-up mt-4 rounded-[12px] bg-white px-6 py-5 ${sideOn ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              <h3 className="m-0 font-serif text-[20px] font-normal text-[#04191F]">正在招聘</h3>
              <div className="mt-3">
                {cat.openings.map((o, i) => (
                  <div key={`${o.title}-${o.org}`} className={`py-3 ${i > 0 ? "border-t border-[#161313]/10" : ""}`}>
                    <div className="text-[14px] font-medium text-[#111111]">{o.title}</div>
                    <div className="mt-0.5 text-[12px] text-[#512818]/65">{o.org} · {o.location}</div>
                  </div>
                ))}
              </div>
              <Link to={go("jobs")} className="mt-1 inline-flex text-[13px] text-[#A16B3E] no-underline">
                查看全部职位 →
              </Link>
            </div>
            <div className={`reveal reveal-up mt-4 rounded-[12px] bg-white px-6 py-5 ${sideOn ? "is-in" : ""}`} style={{ transitionDelay: "0.16s" }}>
              <h3 className="m-0 font-serif text-[20px] font-normal text-[#04191F]">相关工具</h3>
              <div className="mt-3 flex flex-col">
                {[
                  { to: "threshold" as const, label: "对照这一类的入职门槛" },
                  { to: "warning" as const, label: "识别 JD 里的预聘与风险" },
                  { to: "insights" as const, search: `tab=salary&category=${cat.id}`, label: "看这一类的薪资分布" },
                ].map((t) => (
                  <Link
                    key={t.label}
                    to={go(t.to, t.search)}
                    className="group flex items-center justify-between gap-3 border-t border-[#161313]/10 py-3 text-[13px] text-[#512818] no-underline first:border-t-0 first:pt-0"
                  >
                    <span>{t.label}</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Shell>
    </ChromeCtx.Provider>
  );
}

export { JobDetailScreen, JobsScreen } from "./jobScreens";
export { InsightsScreen } from "./insightScreens";

export function LoginScreen() {
  return (
    <Frame>
      <div className="grid min-h-screen md:grid-cols-2">
        <div className="relative hidden md:block">
          <img src="/design/path.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-cadmus-wine/55" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white">
            <div className="font-serif text-[36px]">学术之外</div>
            <p className="mt-2 text-white/75">给博士一条可以走的路。</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h1 className="font-serif text-[32px]">登录</h1>
            <input className="mt-6 w-full rounded-xl border border-cadmus-stone px-3 py-2.5" placeholder="用户名" />
            <input className="mt-3 w-full rounded-xl border border-cadmus-stone px-3 py-2.5" placeholder="密码" type="password" />
            <Link to={go("admin-dash")} className="mt-5 inline-flex w-full justify-center rounded-full bg-cadmus-wine py-2.5 text-[14px] font-semibold text-white no-underline">进入后台</Link>
            <Link to={go("home")} className="mt-4 block text-center text-[13px] text-cadmus-bronze">返回首页</Link>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function MeScreen() {
  return (
    <Shell>
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center">
        <Tag>即将上线</Tag>
        <h1 className="mt-4 font-serif text-[40px]">个人中心</h1>
        <p className="mx-auto mt-3 max-w-md text-cadmus-bark/75">评估记录、收藏岗位将在用户系统完成后出现。现在可以直接使用三套决策工具。</p>
        <Link to={go("tools")} className="mt-8 inline-flex rounded-full bg-cadmus-wine px-5 py-2.5 text-[13px] font-semibold text-white no-underline">去决策工具</Link>
      </div>
    </Shell>
  );
}
