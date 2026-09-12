import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QUESTIONS, shuffleArray } from "@/data/assessment-questions";
import { DISCIPLINE_MAJORS, DISCIPLINE_OPTIONS } from "@/data/disciplines";
import { CATEGORIES } from "@/data/categories";
import { CATEGORY_NAMES, type Answers, type AssessmentResult } from "@/types/assessment";
import {
  DEFAULT_THRESHOLD_FORM,
  type AwardLevel,
  type DisciplineMajor,
  type EnglishLevel,
  type MonographCount,
  type OverseasType,
  type SchoolTier,
  type SciQuartile,
  type TalentLevel,
  type TargetLevel,
  type TargetTier,
  type ThresholdForm,
  type ThresholdResult,
} from "@/types/threshold";
import type { RiskLevel, WarningResult } from "@/types/warning";
import { evaluateAssessment } from "@/utils/matching";
import { DEFAULT_RISK_RULES, scanJD } from "@/utils/jdAnalyzer";
import { evaluate } from "@/utils/scoring";
import { DesignFooter, DesignNav, Frame, go, goCareer, inDesignStudio } from "./chrome";

const SCHOOL_TIERS: SchoolTier[] = ["C9", "海外名校", "985", "海外", "211", "省属", "普通本科", "民办", "其他", "无"];
const OVERSEAS_TYPES: OverseasType[] = ["无", "短期访学(≤1年)", "长期联培(>1年)", "海外学位"];
const ENGLISH_LEVELS: EnglishLevel[] = ["CET-6", "IELTS 6.5+", "TOEFL 90+", "无"];
const SCI_QUARTILES: SciQuartile[] = ["Q1", "Q2", "Q3", "Q4", "无"];
const MONOGRAPH_OPTS: MonographCount[] = ["0", "独著1+", "合著1+"];
const AWARD_LEVELS: AwardLevel[] = ["国家级", "省部级", "校级", "无"];
const TALENT_LEVELS: TalentLevel[] = ["国家级(青千/优青等)", "省部级", "无"];
const TARGET_TIERS: TargetTier[] = ["顶尖 (C9 / 海外世界一流)", "985 高校", "211 高校", "省属重点", "一般本科"];
const TARGET_LEVELS: TargetLevel[] = ["讲师 / 助理教授", "副教授（预聘）", "副教授（长聘）"];
const PHD_YEARS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027"];

const SAMPLE_JD = `XX 大学新闻与传播学院诚聘海内外英才。岗位：青年研究员（特聘）。
要求：35 周岁以下，海外知名高校博士学位，在 SSCI 一区期刊发表论文 ≥ 3 篇。
聘期：3+3 年，首聘期内须主持国家级课题 ≥ 1 项，发表 SSCI 论文 ≥ 5 篇，否则不予续聘。
薪资：年薪 25-35 万（含绩效，具体一人一议）。提供周转房一套。`;

const CAT_MEDIA: Record<number, string> = {
  1: "/design/tools/path-1.jpg",
  2: "/design/tools/path-2.jpg",
  3: "/design/tools/path-3.jpg",
  4: "/design/tools/path-4.jpg",
  5: "/design/tools/path-5.jpg",
  6: "/design/tools/path-6.jpg",
  7: "/design/tools/path-7.jpg",
  8: "/design/tools/path-8.jpg",
};

const LIKERT_B = ["完全不想", "不太想", "一般", "比较想", "非常想"];
const LIKERT_C = ["几乎不会", "较弱", "中等", "熟练", "很强"];
const LIKERT_E = ["完全不能", "较难接受", "看情况", "可以接受", "没问题"];

const TOOL_NAV = [
  {
    id: "warning" as const,
    n: "01",
    label: "博士职位预警",
    ask: "这份聘书靠不靠谱？",
    hint: "约 1 分钟",
    cta: "去扫描 JD",
    img: "/design/tools/card-warning.jpg",
  },
  {
    id: "threshold" as const,
    n: "02",
    label: "学术职业门槛评估",
    ask: "我够不够格留学术？",
    hint: "约 5 分钟",
    cta: "去对照门槛",
    img: "/design/tools/card-threshold.jpg",
  },
  {
    id: "assessment" as const,
    n: "03",
    label: "博士非学术职位评估",
    ask: "学术之外我更像哪一类？",
    hint: "约 8 分钟",
    cta: "去做去向评估",
    img: "/design/tools/card-assessment.jpg",
  },
] as const;

const ChromeCtx = createContext(true);

const THRESHOLD_CLIENT_KEY = "threshold-client-key";

function getThresholdClientKey(): string {
  try {
    const existing = localStorage.getItem(THRESHOLD_CLIENT_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const next = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9]/g, "").slice(0, 32);
    if (next.length >= 8) localStorage.setItem(THRESHOLD_CLIENT_KEY, next);
    return next;
  } catch {
    return "";
  }
}

async function callToolApi<T>(url: string, body: unknown, fallback: () => T, pick?: (json: unknown) => T): Promise<T> {
  try {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    const json: unknown = await res.json();
    return pick ? pick(json) : (json as T);
  } catch {
    return fallback();
  }
}

function Shell({ children, flush = false }: { children: React.ReactNode; flush?: boolean }) {
  const chrome = useContext(ChromeCtx);
  if (!chrome) return <>{children}</>;
  return (
    <Frame>
      <DesignNav tone="cream" active="tools" flush={flush} />
      {children}
      <DesignFooter />
    </Frame>
  );
}

function useRevealOnMount() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
}

function useLiveCategoryNames() {
  const [names, setNames] = useState<Record<number, string>>(() => {
    const init = { ...CATEGORY_NAMES };
    for (const c of CATEGORIES) init[c.id] = c.name;
    return init;
  });
  useEffect(() => {
    fetch("/api/careers/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.data?.length) return;
        setNames((prev) => {
          const next = { ...prev };
          for (const c of d.data as { id: number; name: string }[]) {
            if (c.id && c.name) next[c.id] = c.name;
          }
          return next;
        });
      })
      .catch(() => {});
  }, []);
  return names;
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

function LivePhoto({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const ref = usePhotoPan(true);
  return (
    <div ref={ref} className={`live-photo ${className ?? ""}`}>
      <div className="live-photo-drift">
        <img src={src} alt={alt} className={imgClassName} />
      </div>
    </div>
  );
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`tool-chip rounded-full px-3.5 py-2 text-[13px] ${on ? "is-on" : ""}`}>
      {children}
    </button>
  );
}

function Spectrum({ options, value, onChange, map }: { options: string[]; value: string; onChange: (v: string) => void; map?: (v: string) => string }) {
  return (
    <div className="tool-spectrum" role="listbox">
      {options.map((o) => (
        <button key={o} type="button" role="option" aria-selected={value === o} className={value === o ? "is-on" : ""} onClick={() => onChange(o)}>
          {map ? map(o) : o}
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, min = 0, max = 40, onChange }: { value: string; min?: number; max?: number; onChange: (v: string) => void }) {
  const n = parseInt(value, 10);
  const cur = Number.isFinite(n) ? n : 0;
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-[#F6F0EB] px-2 py-1">
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[20px] text-[#5B0D1C]" onClick={() => onChange(String(Math.max(min, cur - 1)))} aria-label="减少">−</button>
      <span className="min-w-[2.4ch] text-center font-serif text-[26px] tabular-nums">{cur}</span>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[20px] text-[#5B0D1C]" onClick={() => onChange(String(Math.min(max, cur + 1)))} aria-label="增加">+</button>
    </div>
  );
}

function WineBtn({ children, onClick, disabled, to, size = "md" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; to?: string; size?: "md" | "lg" }) {
  const cls = size === "lg"
    ? "inline-flex min-h-[56px] items-center justify-center rounded-[6px] bg-[#5B0D1C] px-10 py-4 text-[17px] font-medium tracking-wide text-white no-underline disabled:opacity-40"
    : "inline-flex items-center justify-center rounded-[4px] bg-[#5B0D1C] px-6 py-2.5 text-[14px] font-medium text-white no-underline disabled:opacity-40";
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" disabled={disabled} onClick={onClick} className={cls}>{children}</button>;
}

function GhostBtn({ children, onClick, to, size = "md" }: { children: React.ReactNode; onClick?: () => void; to?: string; size?: "md" | "lg" }) {
  const cls = size === "lg"
    ? "inline-flex min-h-[56px] items-center rounded-[6px] border-2 border-[#5B0D1C]/35 bg-white px-9 py-4 text-[17px] font-medium text-[#3A0E16] no-underline"
    : "inline-flex items-center rounded-[4px] border border-[#04191F]/30 px-5 py-2.5 text-[14px] text-[#04191F] no-underline";
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

function Crumbs({ last }: { last: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[13px] text-white/70">
      <Link to={go("home")} className="text-inherit no-underline hover:text-white">首页</Link>
      <span aria-hidden>›</span>
      <Link to={go("tools")} className="text-inherit no-underline hover:text-white">决策工具</Link>
      <span aria-hidden>›</span>
      <span className="text-white">{last}</span>
    </nav>
  );
}

function ToolHero({
  src,
  alt,
  kicker,
  title,
  sub,
  last,
}: {
  src: string;
  alt: string;
  kicker: string;
  title: string;
  sub: string;
  last: string;
}) {
  const show = useRevealOnMount();
  return (
    <section className="relative flex min-h-[420px] flex-col overflow-hidden md:min-h-[520px]">
      <LivePhoto src={src} alt={alt} className="absolute inset-0 h-full w-full live-photo--hero" imgClassName="h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16] via-[#3A0E16]/55 to-[#3A0E16]/18" />
      <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[100px] pb-16 md:px-10 md:pb-20">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end">
          <div className={`reveal reveal-up ${show ? "is-in" : ""}`}>
            <Crumbs last={last} />
          </div>
          <p className={`reveal reveal-up mt-8 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
            {kicker}
          </p>
          <h1 className={`reveal reveal-up mt-3 m-0 font-serif text-[40px] font-semibold leading-none text-white md:text-[56px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
            {title}
          </h1>
          <p className={`reveal reveal-up mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-white/80 md:text-[18px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
            {sub}
          </p>
        </div>
      </div>
    </section>
  );
}

function ToolHead({ kicker, title, last }: { kicker: string; title: string; last: string }) {
  return (
    <div className="bg-[#3A0E16] px-5 pt-[92px] pb-8 text-white md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <Crumbs last={last} />
        <p className="mt-5 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF]">{kicker}</p>
        <h1 className="mt-2 m-0 font-serif text-[28px] font-semibold md:text-[36px]">{title}</h1>
      </div>
    </div>
  );
}

function ToolSwitch({
  current,
  compact = false,
}: {
  current: "warning" | "threshold" | "assessment";
  compact?: boolean;
}) {
  return (
    <nav className={`tool-chooser ${compact ? "is-compact" : "mb-12"}`} aria-label="三件决策工具">
      <div className="tool-chooser-row">
        {TOOL_NAV.map((t) => {
          const on = current === t.id;
          const inner = (
            <>
              {compact ? null : (
                <div className="tool-chooser-photo">
                  <img src={t.img} alt="" />
                  <span className={`tool-chooser-mark ${on ? "" : "is-else"}`}>{on ? "当前" : "可选"}</span>
                </div>
              )}
              <div className="tool-chooser-body">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[18px] tabular-nums text-[#A16B3E]">{t.n}</span>
                  <span className="text-[11px] tracking-wide text-[#512818]/55">{t.hint}</span>
                </div>
                <div className="tool-chooser-ask mt-2 font-serif">{t.ask}</div>
                {compact ? null : <div className="mt-1 text-[13px] text-[#512818]/70">{t.label}</div>}
                <div className={`tool-chooser-cta mt-3 ${on ? "is-here" : "is-go"}`}>
                  {on ? "本页" : t.cta}
                  {on ? null : <span aria-hidden> →</span>}
                </div>
              </div>
            </>
          );
          if (on) {
            return (
              <div key={t.id} className="tool-chooser-card is-on" aria-current="page">
                {inner}
              </div>
            );
          }
          return (
            <Link key={t.id} to={go(t.id)} className="tool-chooser-card">
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Rail({ value }: { value: number }) {
  return (
    <div className="tool-bar" aria-hidden>
      <span className="bg-[#5B0D1C]" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

function Likert({
  value,
  labels,
  onPick,
}: {
  value?: number;
  labels: string[];
  onPick: (v: number) => void;
}) {
  return (
    <div className="tool-scale">
      {labels.map((label, i) => {
        const v = i + 1;
        return (
          <button key={label} type="button" className={value === v ? "is-on" : ""} onClick={() => onPick(v)}>
            <span className="dot">{v}</span>
            <span className="cap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function sampleAssessment(): Answers {
  const B: Record<string, number> = {};
  QUESTIONS.filter((q) => q.module === "B").forEach((q) => {
    B[q.id] = q.dimension === "4" ? 5 : q.dimension === "3" ? 4 : q.dimension === "5" ? 3 : 2;
  });
  const C: Record<string, number> = {};
  QUESTIONS.filter((q) => q.module === "C").forEach((q) => {
    C[q.id] = q.dimension === "C-5" || q.dimension === "C-1" ? 5 : q.dimension === "C-3" ? 4 : 3;
  });
  return {
    A: { A01: "新闻传播学", A02: "博士在读（毕业年）", A03: "2025", A04: "有大致范围" },
    B,
    C,
    D: ["D02", "D08", "D07", "D14", "D05"],
    E: { E01: "倾向市场化", E02: "全国可迁", E03: "25-40 万", E04: 4, E05: "不确定" },
  };
}

function prepE(e: Record<string, string | number>) {
  const opts = QUESTIONS.find((q) => q.id === "E03")?.options ?? [];
  const idx = opts.indexOf(String(e.E03));
  return { ...e, E03: idx >= 0 ? idx + 1 : e.E03 };
}

function runAssessment(answers: Answers): AssessmentResult {
  return evaluateAssessment(answers.B, answers.C, answers.D, prepE(answers.E));
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-[#3A0E16]">{label}</div>
      {hint ? <p className="mt-1 mb-0 text-[12.5px] text-[#512818]/65">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function ScanRitual({ kicker, title, sub, lines }: { kicker: string; title: string; sub: string; lines: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => Math.min(n + 1, lines.length)), 180);
    return () => window.clearInterval(t);
  }, [lines.length]);
  return (
    <Shell flush>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#5B0D1C] px-6 text-center text-white">
        <div className="absolute inset-y-0 w-1/2 scan-sweep opacity-40" />
        <p className="text-[12px] tracking-[.22em] text-[#EEC3AF]">{kicker}</p>
        <h1 className="mt-4 font-serif text-[36px] md:text-[44px]">{title}</h1>
        <p className="mt-3 max-w-md text-white/70">{sub}</p>
        <ul className="mt-10 mb-0 w-full max-w-sm space-y-3 p-0 text-left text-[15px]">
          {lines.map((line, idx) => (
            <li key={line} className={`scan-item list-none font-serif ${idx <= i ? "is-on" : ""}`}>
              {String(idx + 1).padStart(2, "0")}　{line}
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}

function majorOf(minor: string): DisciplineMajor | undefined {
  return DISCIPLINE_MAJORS.find((m) => DISCIPLINE_OPTIONS[m].includes(minor));
}

/* ── 枢纽 ── */

const SITUATIONS = [
  {
    n: "01",
    id: "warning" as const,
    q: "手里已经有一份招聘启事",
    a: "先别对标自己。一分钟标出预聘、非升即走、年龄和薪资里含糊的句子，面试时才知道该追问什么。",
    cta: "扫描这份 JD",
    img: "/design/tools/card-warning.jpg",
    alt: "对照招聘文本做批注",
    time: "约 1 分钟",
    ask: "这份聘书靠不靠谱？",
  },
  {
    n: "02",
    id: "threshold" as const,
    q: "想留在高校或科研院所",
    a: "用论文、课题、院校对照目标层次。看的是差距清单，不是一句「再努力」。",
    cta: "对照入职门槛",
    img: "/design/tools/card-threshold.jpg",
    alt: "学术路径上的对照",
    time: "约 5 分钟",
    ask: "我够不够格留学术？",
  },
  {
    n: "03",
    id: "assessment" as const,
    q: "学术走不通，或想看外面还有什么",
    a: "按兴趣、技能、价值观匹配 8 类去向。先知道更像谁，再点进那一类的岗位与雇主。",
    cta: "开始职业评估",
    img: "/design/tools/card-assessment.jpg",
    alt: "在图书馆里思考去向",
    time: "约 8 分钟",
    ask: "学术之外我更像哪一类？",
  },
] as const;

export function ToolsScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  return (
    <ChromeCtx.Provider value={chrome}>
    <Shell flush>
      <ToolHero
        src="/design/tools/hub-hero.jpg"
        alt="案头协作的工作现场"
        kicker="— DECISION TOOLS"
        title="决策工具"
        sub="博士的职业选择，拆成三件可以单独验证的事。从你现在卡住的那一步开始，不必按顺序做完。"
        last="决策工具"
      />
      <section className="tool-sheet relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1600px]">
          <p className={`reveal reveal-up text-[12px] font-semibold tracking-[.2em] text-[#A16B3E] ${show ? "is-in" : ""}`}>— START HERE</p>
          <h2 className={`reveal reveal-up mt-3 m-0 font-serif text-[32px] font-normal text-[#04191F] md:text-[44px] ${show ? "is-in" : ""}`}>
            你现在最需要哪一句答案？
          </h2>
          <p className={`reveal reveal-up mt-4 mb-0 max-w-[640px] text-[16px] leading-relaxed text-[#512818]/75 ${show ? "is-in" : ""}`}>
            有 JD 先避坑，想留校再对照门槛，学术吃紧再看外面。三件工具互不替代，做完一件会告诉你下一步该去哪。
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {SITUATIONS.map((s, i) => (
              <Link
                key={s.id}
                to={go(s.id)}
                className={`plate-card group reveal reveal-up flex flex-col overflow-hidden rounded-2xl bg-white no-underline ${show ? "is-in" : ""}`}
                style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="relative h-[220px] overflow-hidden">
                  <LivePhoto
                    src={s.img}
                    alt={s.alt}
                    className={`absolute inset-0 h-full w-full ${i === 1 ? "live-photo--alt" : ""}`}
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="plate-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-[#5B0D1C]/70 via-transparent to-transparent" />
                  <span className="plate-index absolute bottom-1 left-4 font-serif leading-none tabular-nums text-white">{s.n}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#5B0D1C]">{s.time}</span>
                </div>
                <div className="flex flex-1 flex-col px-6 py-7">
                  <div className="text-[12px] font-semibold tracking-[.16em] text-[#A16B3E]">{s.ask}</div>
                  <h3 className="mt-2 m-0 font-serif text-[24px] font-semibold leading-snug text-[#111111] md:text-[26px]">{s.q}</h3>
                  <div className="atlas-rule mt-4 bg-[#5B0D1C]" aria-hidden />
                  <p className="mt-4 mb-0 flex-1 text-[14.5px] leading-relaxed text-[#512818]/80">{s.a}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[14px] text-[#5B0D1C]">
                    {s.cta}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className={`reveal reveal-up mt-16 ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.36s" }}>
            <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— HOW THEY CONNECT</p>
            <h3 className="mt-3 m-0 font-serif text-[28px] font-normal md:text-[32px]">做完一件，再决定要不要下一件</h3>
            <div className="tool-path mt-8">
              {[
                { t: "有 JD，先扫风险", d: "条款不清，先别对照门槛。预警标出该在面试里追问的句子。", to: "warning" },
                { t: "想留校，再看门槛", d: "风险能接受，再用论文和课题对照这一档院校。", to: "threshold" },
                { t: "差距大，转去评估", d: "学术轨吃紧时，8 分钟看学术之外哪一类更贴你。", to: "assessment" },
              ].map((x, i, arr) => (
                <div key={x.t} className="contents">
                  <Link to={go(x.to)} className="block rounded-2xl bg-white p-6 no-underline text-inherit transition-transform hover:-translate-y-1">
                    <div className="font-serif text-[28px] tabular-nums text-[#EEC3AF]">{String(i + 1).padStart(2, "0")}</div>
                    <div className="mt-2 text-[16px] font-semibold text-[#111111]">{x.t}</div>
                    <p className="mt-2 mb-0 text-[14px] leading-relaxed text-[#512818]/75">{x.d}</p>
                  </Link>
                  {i < arr.length - 1 ? <span className="tool-path-line" aria-hidden /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
    </ChromeCtx.Provider>
  );
}

/* ── 门槛 ── */

const THRESHOLD_CHAPTERS = [
  { k: "你是谁", d: "学科、届次、年龄。先把坐标定下来。", img: "/design/tools/ch-who.jpg", alt: "填写学术档案" },
  { k: "从哪来", d: "院校层次、海外与语言。教育背景占综合 18%。", img: "/design/tools/ch-origin.jpg", alt: "毕业与院校背景" },
  { k: "交出什么", d: "只填一作 / 通讯。论文是权重最高的一维。", img: "/design/tools/ch-output.jpg", alt: "论文与期刊成果" },
  { k: "往哪走", d: "课题、荣誉，以及要不要对照一所目标院系。", img: "/design/tools/ch-next.jpg", alt: "前方的多扇门" },
];

export function ThresholdScreen({ result = false, chrome = true }: { result?: boolean; chrome?: boolean }) {
  const nav = useNavigate();
  const [stage, setStage] = useState<"ask" | "form" | "loading" | "result">(result ? "result" : "ask");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ThresholdForm>(DEFAULT_THRESHOLD_FORM);
  const [report, setReport] = useState<ThresholdResult | null>(null);

  useEffect(() => {
    if (!result) return;
    const cached = sessionStorage.getItem("threshold-result");
    if (cached) {
      try {
        setReport(JSON.parse(cached) as ThresholdResult);
        setStage("result");
        return;
      } catch { /* ignore */ }
    }
    if (inDesignStudio()) {
      const r = evaluate(DEFAULT_THRESHOLD_FORM);
      setReport(r);
      setStage("result");
      return;
    }
    nav(go("threshold"), { replace: true });
  }, [result, nav]);

  const set = <K extends keyof ThresholdForm>(k: K, v: ThresholdForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setStage("loading");
    const started = Date.now();
    const r = await callToolApi(
      "/api/tools/threshold/evaluate",
      { ...form, clientKey: getThresholdClientKey() },
      () => evaluate(form),
      (json) => (json as { data: ThresholdResult }).data,
    );
    sessionStorage.setItem("threshold-result", JSON.stringify(r));
    setReport(r);
    window.setTimeout(() => {
      setStage("result");
      nav(go("threshold-result"));
    }, Math.max(0, 1500 - (Date.now() - started)));
  };

  const body = (() => {
    if (stage === "loading") {
      return (
        <ScanRitual
          kicker="— THRESHOLD"
          title="正在对照同届门槛"
          sub="按教育、论文、课题、海外、影响力、获奖与学术年龄七维加权。"
          lines={["教育背景 18%", "论文产出 28%", "基金课题 15%", "学术影响力 12%", "海外经历 10%", "获奖成果 12%", "学术年龄 5%"]}
        />
      );
    }
    if (stage === "result") {
      return report ? <ThresholdReport report={report} onReset={() => {
        sessionStorage.removeItem("threshold-result");
        setForm(DEFAULT_THRESHOLD_FORM);
        setStage("ask");
        setStep(0);
        nav(go("threshold"));
      }} /> : null;
    }
    const ch = THRESHOLD_CHAPTERS[step];
    return (
    <Shell flush>
      {stage === "ask" ? (
        <ToolHero
          src="/design/tools/threshold-hero.jpg"
          alt="学术路径上的对照"
          kicker="— THRESHOLD"
          title="学术职业门槛评估"
          sub="先问你有没有目标院系，再填一份学术资本档案。对照的是门槛，不是鸡汤。"
          last="学术职业门槛评估"
        />
      ) : (
        <ToolHead kicker="— THRESHOLD" title="学术职业门槛评估" last="学术职业门槛评估" />
      )}
      <section className={`tool-sheet relative z-[2] bg-[#FCF7EF] px-5 md:px-10 ${stage === "ask" ? "-mt-10 rounded-t-[32px] pt-12 pb-36 md:pt-20 md:pb-64" : "py-10"}`}>
        <div className="mx-auto max-w-[1600px]">
          <ToolSwitch current="threshold" />
          {stage === "ask" ? (
            <div className="tool-card-in">
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— FIRST QUESTION</p>
              <h2 className="mt-3 m-0 font-serif text-[32px] text-[#04191F] md:text-[40px]">你有明确的目标院系吗？</h2>
              <p className="mt-3 mb-10 max-w-[560px] text-[15px] leading-relaxed text-[#512818]/75 md:mb-12">有目标，按那一档院校的入职画像对照；没有，先看七维得分。百分位目前是示意估算，样本够了再改成本站真实对比。</p>
              <div className="tool-fork">
                <button
                  type="button"
                  className="tool-fork-card"
                  onClick={() => { set("hasTarget", "yes"); setStage("form"); }}
                >
                  <LivePhoto src="/design/tools/fork-target.jpg" alt="对照一所目标院系" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
                  <div className="tool-fork-veil" />
                  <div className="relative z-[1] flex h-full min-h-[420px] flex-col justify-end p-7 md:min-h-[520px] md:p-9 xl:min-h-[560px]">
                    <div className="font-serif text-[40px] tabular-nums text-[#EEC3AF] md:text-[48px]">01</div>
                    <div className="atlas-rule mt-2" aria-hidden />
                    <div className="mt-3 font-serif text-[26px] md:text-[30px]">已有目标院系</div>
                    <p className="mt-2 mb-0 max-w-[28rem] text-[14px] leading-relaxed text-white/80 md:text-[15px]">对照 C9 / 985 / 211 等层次门槛，标出达标、边缘与缺口。</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="tool-fork-card"
                  onClick={() => { set("hasTarget", "no"); setStage("form"); }}
                >
                  <LivePhoto src="/design/tools/fork-cohort.jpg" alt="先看同届竞争力" className="absolute inset-0 h-full w-full live-photo--alt" imgClassName="h-full w-full object-cover" />
                  <div className="tool-fork-veil" />
                  <div className="relative z-[1] flex h-full min-h-[420px] flex-col justify-end p-7 md:min-h-[520px] md:p-9 xl:min-h-[560px]">
                    <div className="font-serif text-[40px] tabular-nums text-[#E1E3A2] md:text-[48px]">02</div>
                    <div className="atlas-rule mt-2" aria-hidden />
                    <div className="mt-3 font-serif text-[26px] md:text-[30px]">先看同届竞争力</div>
                    <p className="mt-2 mb-0 max-w-[28rem] text-[14px] leading-relaxed text-white/80 md:text-[15px]">不绑定具体学校，先得到七维得分与示意百分位。</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="tool-card-in" key={step}>
              <div className="mb-8">
                <Rail value={((step + 1) / 4) * 100} />
                <div className="mt-5 flex flex-wrap gap-2">
                  {THRESHOLD_CHAPTERS.map((c, i) => (
                    <button
                      key={c.k}
                      type="button"
                      onClick={() => setStep(i)}
                      className={`rounded-full px-3.5 py-1.5 text-[12px] ${i === step ? "bg-[#5B0D1C] text-white" : "bg-white text-[#512818]/70"}`}
                    >
                      {String(i + 1).padStart(2, "0")} {c.k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white md:grid md:grid-cols-[0.85fr_1.15fr]">
                <div className="relative min-h-[220px] overflow-hidden md:min-h-[640px]">
                  <LivePhoto src={ch.img} alt={ch.alt} className={`absolute inset-0 h-full w-full ${step % 2 ? "live-photo--alt" : ""}`} imgClassName="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A0E16]/70 via-transparent to-transparent" />
                  <span className="plate-index absolute bottom-2 left-5 font-serif text-white">{String(step + 1).padStart(2, "0")}</span>
                </div>
                <div className="px-6 py-8 md:px-10 md:py-10">
                  <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— {String(step + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 m-0 font-serif text-[32px]">{ch.k}</h2>
                  <p className="mt-2 text-[15px] text-[#512818]/70">{ch.d}</p>

                  <div className="mt-8 space-y-8">
                    {step === 0 && (
                      <>
                        <Field label="学科门类">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            {DISCIPLINE_MAJORS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                className={`tool-tile ${form.disciplineMajor === d ? "is-on" : ""}`}
                                onClick={() => {
                                  const first = DISCIPLINE_OPTIONS[d][0];
                                  setForm((p) => ({ ...p, disciplineMajor: d, disciplineMinor: first, targetDept: d }));
                                }}
                              >
                                <div className="text-[14px] font-medium">{d}</div>
                              </button>
                            ))}
                          </div>
                        </Field>
                        <Field label="一级学科">
                          <ChipRow>
                            {DISCIPLINE_OPTIONS[form.disciplineMajor].map((m) => (
                              <Chip key={m} on={form.disciplineMinor === m} onClick={() => set("disciplineMinor", m)}>{m}</Chip>
                            ))}
                          </ChipRow>
                        </Field>
                        <Field label="博士毕业年份">
                          <Spectrum options={PHD_YEARS} value={form.phdYear} onChange={(v) => set("phdYear", v)} />
                        </Field>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field label="目前年龄" hint="25–50">
                            <Stepper value={form.age} min={25} max={50} onChange={(v) => set("age", v)} />
                          </Field>
                          <Field label="博士在读年限" hint="1–10 年">
                            <Stepper value={form.phdYears} min={1} max={10} onChange={(v) => set("phdYears", v)} />
                          </Field>
                        </div>
                        <Field label="博士后经历">
                          <div className="grid grid-cols-2 gap-2">
                            {(["无", "有"] as const).map((x) => (
                              <button key={x} type="button" className={`tool-tile ${form.hasPostdoc === x ? "is-on" : ""}`} onClick={() => set("hasPostdoc", x)}>
                                {x === "有" ? "有博后经历" : "没有博后经历"}
                              </button>
                            ))}
                          </div>
                        </Field>
                        {form.hasPostdoc === "有" && (
                          <div className="grid gap-6 sm:grid-cols-2">
                            <Field label="博后单位层次">
                              <Spectrum options={SCHOOL_TIERS} value={form.postdocTier} onChange={(v) => set("postdocTier", v as SchoolTier)} />
                            </Field>
                            <Field label="博后年限">
                              <Stepper value={form.postdocYears} min={1} max={10} onChange={(v) => set("postdocYears", v)} />
                            </Field>
                          </div>
                        )}
                      </>
                    )}

                    {step === 1 && (
                      <>
                        {([
                          ["博士院校", "phdSchool"],
                          ["硕士院校", "masterSchool"],
                          ["本科院校", "bachelorSchool"],
                        ] as const).map(([label, key]) => (
                          <Field key={key} label={label} hint="从左到右，层次递减">
                            <Spectrum options={SCHOOL_TIERS} value={form[key]} onChange={(v) => set(key, v as SchoolTier)} />
                          </Field>
                        ))}
                        <Field label="海外经历">
                          <Spectrum options={OVERSEAS_TYPES} value={form.overseasType} onChange={(v) => set("overseasType", v as OverseasType)} />
                        </Field>
                        <Field label="英语水平">
                          <Spectrum options={ENGLISH_LEVELS} value={form.englishLevel} onChange={(v) => set("englishLevel", v as EnglishLevel)} />
                        </Field>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <p className="text-[13px] text-[#512818]/65">只统计一作或通讯。合作挂名不必填进来。</p>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field label="SCI / SSCI 总篇数"><Stepper value={form.sci} onChange={(v) => set("sci", v)} /></Field>
                          <Field label="其中一作 / 通讯"><Stepper value={form.sciFirst} max={parseInt(form.sci, 10) || 40} onChange={(v) => set("sciFirst", v)} /></Field>
                        </div>
                        <Field label="最高期刊分区">
                          <Spectrum options={SCI_QUARTILES} value={form.sciTopQ} onChange={(v) => set("sciTopQ", v as SciQuartile)} />
                        </Field>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field label="CSSCI 总篇数"><Stepper value={form.cssci} onChange={(v) => set("cssci", v)} /></Field>
                          <Field label="其中一作"><Stepper value={form.cssciFirst} max={parseInt(form.cssci, 10) || 40} onChange={(v) => set("cssciFirst", v)} /></Field>
                          <Field label="EI / 北大核心"><Stepper value={form.ei} onChange={(v) => set("ei", v)} /></Field>
                          <Field label="h-index"><Stepper value={form.hindex} max={80} onChange={(v) => set("hindex", v)} /></Field>
                          <Field label="发明专利（授权）"><Stepper value={form.patents} onChange={(v) => set("patents", v)} /></Field>
                        </div>
                        <Field label="学术专著">
                          <Spectrum options={MONOGRAPH_OPTS} value={form.monographs} onChange={(v) => set("monographs", v as MonographCount)} map={(o) => (o === "0" ? "无" : o)} />
                        </Field>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field label="主持国家级项目"><Stepper value={form.nationalGrants} max={10} onChange={(v) => set("nationalGrants", v)} /></Field>
                          <Field label="其中国家自科 / 社科"><Stepper value={form.natSciSocSci} max={10} onChange={(v) => set("natSciSocSci", v)} /></Field>
                          <Field label="国家级项目经费（万元）"><Stepper value={form.natGrantFunding} max={500} onChange={(v) => set("natGrantFunding", v)} /></Field>
                          <Field label="主持省部级项目"><Stepper value={form.provincialGrants} max={20} onChange={(v) => set("provincialGrants", v)} /></Field>
                        </div>
                        <Field label="最高学术获奖">
                          <Spectrum options={AWARD_LEVELS} value={form.highestAward} onChange={(v) => set("highestAward", v as AwardLevel)} />
                        </Field>
                        <Field label="人才称号">
                          <Spectrum options={TALENT_LEVELS} value={form.talentTitle} onChange={(v) => set("talentTitle", v as TalentLevel)} />
                        </Field>
                        <Field label="期刊审稿经历">
                          <div className="grid grid-cols-2 gap-2">
                            {(["有", "无"] as const).map((t) => (
                              <button key={t} type="button" className={`tool-tile ${form.reviewer === t ? "is-on" : ""}`} onClick={() => set("reviewer", t)}>
                                {t === "有" ? "有审稿经历" : "暂无审稿"}
                              </button>
                            ))}
                          </div>
                        </Field>
                        {form.hasTarget === "yes" && (
                          <>
                            <Field label="目标院系层次">
                              <Spectrum options={TARGET_TIERS} value={form.targetTier} onChange={(v) => set("targetTier", v as TargetTier)} />
                            </Field>
                            <Field label="目标岗位">
                              <Spectrum options={TARGET_LEVELS} value={form.targetLevel} onChange={(v) => set("targetLevel", v as TargetLevel)} />
                            </Field>
                            <Field label="目标院系近三年新入职者画像（可选）" hint="每位占一行。系统将据此调整基准门槛。">
                              <textarea
                                value={form.targetFacultyList}
                                onChange={(e) => set("targetFacultyList", e.target.value)}
                                rows={5}
                                placeholder={"张XX，C9 博士，SCI 一作 5 篇（Q1 3篇），国自然青年 1 项\n李XX，985 博士，SCI 一作 3 篇，2 年海外博后"}
                                className="jd-canvas w-full resize-y border-0 p-4 font-serif text-[15px] leading-relaxed text-[#3A0E16] outline-none ring-0"
                              />
                            </Field>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {step === 3 && (
                    <p className="mt-8 mb-0 text-[12px] leading-relaxed text-[#512818]/55">
                      生成报告时会匿名保存七维得分，用于之后的百分位对照。不收集姓名与学校全名。同一浏览器 30 天内重填，只保留最新一条。
                    </p>
                  )}
                  <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                    {step > 0 ? <GhostBtn onClick={() => setStep((s) => s - 1)}>上一章</GhostBtn> : <GhostBtn onClick={() => setStage("ask")}>返回</GhostBtn>}
                    {step < 3 ? <WineBtn onClick={() => setStep((s) => s + 1)}>下一章</WineBtn> : <WineBtn onClick={submit}>生成评估报告</WineBtn>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Shell>
    );
  })();

  return <ChromeCtx.Provider value={chrome}>{body}</ChromeCtx.Provider>;
}

function ThresholdReport({ report, onReset }: { report: ThresholdResult; onReset: () => void }) {
  const show = useRevealOnMount();
  const s = report.breakdown;
  const rows = [
    ["教育背景", s.eduScore],
    ["论文产出", s.paperScore],
    ["基金课题", s.grantScore],
    ["学术影响力", s.impactScore],
    ["海外经历", s.overseasScore],
    ["获奖成果", s.awardScore],
    ["学术年龄", s.ageScore],
  ] as const;
  const tone = report.verdict === "高度匹配" ? "sage" : report.verdict === "差距较大" ? "blush" : "sand";
  const toneBg = { sage: "bg-[#E1E3A2]", blush: "bg-[#EEC3AF]", sand: "bg-[#F9EAD0]" }[tone];
  const nextIsAssess = report.verdict === "差距较大";
  return (
    <Shell flush>
      <ToolHero
        src="/design/tools/threshold-hero.jpg"
        alt="评估报告"
        kicker="— ASSESSMENT RESULT"
        title="评估报告"
        sub={`${report.disciplineMinor} · 博士 ${report.phdYear} 届${report.hasTarget ? ` · ${report.verdict}` : ""}`}
        last="评估报告"
      />
      <section className="tool-sheet relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1600px]">
          <ToolSwitch current="threshold" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className={`reveal reveal-up overflow-hidden rounded-[12px] ${toneBg} ${show ? "is-in" : ""}`}>
              <div className="grid md:grid-cols-[1fr_220px]">
                <div className="p-8 md:p-10">
                  <div className="text-[12px] font-semibold tracking-[.18em] text-[#A16B3E]">综合得分</div>
                  <div className="mt-2 font-serif text-[72px] leading-none tabular-nums text-[#3A0E16]">{s.userScore}</div>
                  <p className="mt-3 mb-0 text-[15px] text-[#512818]/80">
                    {report.norm?.percentileSource === "empirical"
                      ? `在本站已评估的 ${report.norm.sampleN} 人中，大约位于前 ${s.percentile}%`
                      : `同届大约位于前 ${s.percentile}%（示意分位）`}
                    {report.matchPct != null ? ` · 与目标门槛匹配 ${report.matchPct}%` : ""}
                  </p>
                  {report.norm && report.norm.percentileSource !== "empirical" && (
                    <p className="mt-2 mb-0 text-[12px] text-[#512818]/50">
                      {report.norm.sampleN > 0
                        ? `本站已收录 ${report.norm.sampleN} 份答卷，满 ${report.norm.readyAt} 份后改为与真实填表者对比。`
                        : `当前按公式估算。样本积累后改为本站真实对比。`}
                    </p>
                  )}
                </div>
                <div className="relative hidden min-h-[180px] md:block">
                  <img src="/design/tools/ch-output.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
            </div>
            <div className={`reveal reveal-up mt-10 ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.12s" }}>
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— SEVEN AXES</p>
              <h2 className="mt-2 m-0 font-serif text-[28px]">七维对照</h2>
              <div className="mt-6 space-y-5">
                {report.radarData.map((d) => (
                  <div key={d.axis}>
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <span className="text-[14px]">{d.axis}</span>
                      <span className="font-serif text-[20px] tabular-nums text-[#5B0D1C]">{d.you}{d.target != null ? <span className="ml-2 text-[13px] text-[#512818]/50">目标 {d.target}</span> : null}</span>
                    </div>
                    <div className="relative">
                      <Rail value={d.you} />
                      {d.target != null ? (
                        <span className="absolute top-[-3px] h-3.5 w-px bg-[#A16B3E]" style={{ left: `${d.target}%` }} aria-hidden />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {report.targetRows && (
              <div className={`reveal reveal-up mt-12 ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.2s" }}>
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— CHECKLIST</p>
                <h2 className="mt-2 m-0 font-serif text-[28px]">目标门槛逐项</h2>
                <div className="mt-5 divide-y divide-[#161313]/10 overflow-hidden rounded-2xl bg-white">
                  {report.targetRows.map((row) => (
                    <div key={row.item} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div>
                        <div className="text-[14px] font-medium">{row.item}</div>
                        <div className="mt-1 text-[12.5px] text-[#512818]/60">需要 {row.need} · 你是 {row.you}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                        row.status === "pass" ? "bg-[#E1E3A2] text-[#3A0E16]" : row.status === "fail" ? "bg-[#EEC3AF] text-[#3A0E16]" : "bg-[#F9EAD0] text-[#3A0E16]"
                      }`}>
                        {row.status === "pass" ? "达标" : row.status === "fail" ? "缺口" : "边缘"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {report.recommendations.length > 0 && (
              <div className={`reveal reveal-up mt-12 ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— NEXT MOVES</p>
                <h2 className="mt-2 m-0 font-serif text-[28px]">接下来可以做什么</h2>
                <ul className="mt-5 mb-0 space-y-3 p-0">
                  {report.recommendations.map((r) => (
                    <li key={r} className="list-none rounded-2xl bg-white px-5 py-4 text-[14.5px] leading-relaxed text-[#512818]/85">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-10 text-[12.5px] leading-relaxed text-[#512818]/55">
              本评估基于编辑部设定的基准参数和公开招聘信息，仅作参考。具体门槛以目标院系官方公告为准。
            </p>
          </div>
          <aside className={`reveal reveal-up lg:sticky lg:top-28 ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.16s" }}>
            <div className="rounded-[12px] bg-[#5B0D1C] p-7 text-white">
              <div className="text-[12px] tracking-[.16em] text-[#EEC3AF]">下一步</div>
              <h3 className="mt-2 m-0 font-serif text-[24px]">{nextIsAssess ? "学术轨吃紧时" : "手里有 JD 的话"}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/75">
                {nextIsAssess
                  ? "先看学术之外哪一类更贴你，避免把时间耗在补不齐的硬指标上。"
                  : "把招聘启事贴进去，看预聘和非升即走条款是否覆盖你的考核年。"}
              </p>
              <Link to={go(nextIsAssess ? "assessment" : "warning")} className="mt-6 inline-flex rounded-[4px] bg-white px-5 py-2.5 text-[14px] text-[#5B0D1C] no-underline">
                {nextIsAssess ? "去做职业评估" : "扫描职位风险"}
              </Link>
            </div>
            <button type="button" onClick={onReset} className="mt-4 w-full rounded-[4px] border border-[#04191F]/20 bg-white py-2.5 text-[14px]">重新评估</button>
            <div className="mt-3 grid grid-cols-1 gap-2 text-[13px]">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-xl bg-white px-4 py-3">
                  <span>{k}</span>
                  <span className="font-serif tabular-nums text-[#5B0D1C]">{v}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
        </div>
      </section>
    </Shell>
  );
}

/* ── 预警 ── */

type JdMark = { start: number; end: number; level: RiskLevel; type: string };

function collectMarks(text: string): JdMark[] {
  const hits: JdMark[] = [];
  for (const rule of DEFAULT_RISK_RULES) {
    for (const p of rule.patterns) {
      let re: RegExp;
      try { re = new RegExp(p, "gi"); } catch { continue; }
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        if (!m[0]) break;
        hits.push({ start: m.index, end: m.index + m[0].length, level: rule.level, type: rule.type });
        if (m[0].length === 0) re.lastIndex += 1;
      }
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: JdMark[] = [];
  for (const h of hits) {
    const last = merged[merged.length - 1];
    if (last && h.start < last.end) continue;
    merged.push(h);
  }
  return merged;
}

function AnnotatedJd({ text }: { text: string }) {
  const marks = useMemo(() => collectMarks(text), [text]);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  marks.forEach((m, i) => {
    if (m.start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, m.start)}</span>);
    const lv = m.level === "高" ? "is-high" : m.level === "中" ? "is-mid" : "is-low";
    parts.push(
      <mark key={`m${i}`} className={`jd-hl ${lv} bg-transparent text-inherit`} title={m.type}>
        {text.slice(m.start, m.end)}
      </mark>,
    );
    cursor = m.end;
  });
  if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>);
  return <p className="m-0 whitespace-pre-wrap font-serif text-[16px] leading-[1.85] text-[#3A0E16]">{parts}</p>;
}

export function WarningScreen({ chrome = true }: { chrome?: boolean }) {
  const [stage, setStage] = useState<"input" | "scanning" | "result">("input");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<WarningResult | null>(null);
  const [open, setOpen] = useState<number | null>(0);

  const run = async () => {
    if (!jd.trim()) return;
    setStage("scanning");
    const started = Date.now();
    const r = await callToolApi("/api/tools/warning/scan", { jdText: jd }, () => scanJD(jd));
    setResult(r);
    setOpen(0);
    window.setTimeout(() => setStage("result"), Math.max(0, 1600 - (Date.now() - started)));
  };

  const body = stage === "scanning" ? (
      <ScanRitual
        kicker="— JD WARNING"
        title="正在批注这份聘书"
        sub="按六类常见风险条款扫原文，命中的句子会留下颜色。"
        lines={DEFAULT_RISK_RULES.map((r) => r.type)}
      />
  ) : (
    <Shell flush>
      {stage === "result" ? (
        <ToolHead kicker="— JD WARNING" title="博士职位预警" last="博士职位预警" />
      ) : (
        <ToolHero
          src="/design/tools/warning-hero.jpg"
          alt="批注招聘文本"
          kicker="— JD WARNING"
          title="博士职位预警"
          sub="把学术招聘启事贴进来。系统按六类常见风险条款做批注，并给出面试该追问的句子。"
          last="博士职位预警"
        />
      )}
      <section className={`tool-sheet relative z-[2] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-20 ${stage === "result" ? "" : "-mt-10 rounded-t-[32px]"}`}>
        {stage === "input" && (
          <div className="mx-auto max-w-[1600px]">
            <ToolSwitch current="warning" />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_340px]">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— THE DOCUMENT</p>
                  <button type="button" className="text-[13px] text-[#5B0D1C] underline-offset-4 hover:underline" onClick={() => setJd(SAMPLE_JD)}>
                    填入示例 JD
                  </button>
                </div>
                <h2 className="mt-3 m-0 font-serif text-[28px] md:text-[36px]">粘贴完整招聘启事</h2>
                <p className="mt-2 mb-0 max-w-[520px] text-[14.5px] text-[#512818]/70">岗位名称、年龄、论文、聘期、薪资，原文越完整，批注越准。</p>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  rows={14}
                  placeholder="将岗位名称、年龄、论文、聘期、薪资等原文贴在这里…"
                  className="jd-canvas mt-6 w-full resize-y border-0 p-6 font-serif text-[16px] leading-relaxed text-[#3A0E16] outline-none ring-0"
                />
                <div className="mt-6">
                  <WineBtn disabled={!jd.trim()} onClick={run}>开始批注</WineBtn>
                </div>
              </div>
              <aside className="overflow-hidden rounded-2xl bg-white">
                <div className="relative h-36">
                  <LivePhoto src="/design/tools/warning-aside.jpg" alt="" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[#3A0E16]/35" />
                </div>
                <div className="p-6">
                  <div className="text-[12px] font-semibold tracking-[.16em] text-[#A16B3E]">会标出什么</div>
                  <ul className="mt-4 mb-0 space-y-3 p-0">
                    {DEFAULT_RISK_RULES.map((r) => (
                      <li key={r.id} className="flex list-none items-baseline justify-between gap-3 border-b border-[#161313]/8 py-2 last:border-0">
                        <span className="text-[14px]">{r.type}</span>
                        <span className="shrink-0 text-[12px] text-[#512818]/55">{r.level}风险</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <div className="mx-auto max-w-[1600px]">
            <ToolSwitch current="warning" />
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_380px]">
              <div className="tool-card-in">
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— ANNOTATED</p>
                <h2 className="mt-2 m-0 font-serif text-[28px]">批注后的原文</h2>
                <div className="mt-6 rounded-2xl bg-white p-6 md:p-8">
                  <AnnotatedJd text={jd} />
                </div>
                <div className="mt-8 space-y-3">
                  {result.risks.map((r, i) => (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full rounded-2xl bg-white px-5 py-4 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-serif text-[20px]">{r.type}</span>
                        <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                          r.level === "高" ? "bg-[#EEC3AF]" : r.level === "中" ? "bg-[#F9EAD0]" : "bg-[#E1E3A2]"
                        }`}>{r.level}风险</span>
                      </div>
                      {open === i && <p className="mt-3 mb-0 text-[14px] leading-relaxed text-[#512818]/80">{r.desc}</p>}
                    </button>
                  ))}
                  {result.risks.length === 0 && (
                    <p className="rounded-2xl bg-[#E1E3A2] px-5 py-4 text-[14.5px]">未识别到常见风险条款，该岗位 JD 相对透明。</p>
                  )}
                </div>
              </div>
              <aside className="tool-card-in rounded-[12px] bg-[#5B0D1C] p-7 text-white lg:sticky lg:top-28">
                <div className="text-[12px] tracking-[.16em] text-[#EEC3AF]">风险评分</div>
                <div className="mt-2 font-serif text-[64px] leading-none tabular-nums">{result.score}<span className="text-[18px] text-white/50"> /100</span></div>
                <div className="mt-2 text-[16px]">{result.level} · 识别到 {result.riskCount} 项</div>
                <p className="mt-4 text-[13.5px] leading-relaxed text-white/75">{result.peerComparison}</p>
                {result.interviewQuestions.length > 0 && (
                  <>
                    <div className="mt-6 text-[12px] tracking-[.16em] text-[#EEC3AF]">面试时建议确认</div>
                    <ol className="mt-3 mb-0 space-y-2 pl-4 text-[13.5px] leading-relaxed text-white/85">
                      {result.interviewQuestions.map((q) => <li key={q}>{q}</li>)}
                    </ol>
                  </>
                )}
                <div className="mt-8 flex flex-col gap-2">
                  <Link to={go("threshold")} className="inline-flex justify-center rounded-[4px] bg-white px-5 py-2.5 text-[14px] text-[#5B0D1C] no-underline">条款能接受？对照门槛</Link>
                  <button type="button" className="rounded-[4px] border border-white/30 py-2.5 text-[14px] text-white" onClick={() => { setStage("input"); setResult(null); }}>分析另一份</button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );

  return <ChromeCtx.Provider value={chrome}>{body}</ChromeCtx.Provider>;
}

/* ── 评估 ── */

type AssessPhase = "cover" | "A" | "Bintro" | "B" | "Cintro" | "C" | "D" | "E" | "loading" | "result";

const Q_COUNT = {
  A: QUESTIONS.filter((q) => q.module === "A").length,
  B: QUESTIONS.filter((q) => q.module === "B").length,
  C: QUESTIONS.filter((q) => q.module === "C").length,
  D: QUESTIONS.filter((q) => q.module === "D").length,
  E: QUESTIONS.filter((q) => q.module === "E").length,
};

const ASSESS_CHAPTERS = [
  { k: "A", title: "你是谁", body: "学科、阶段、届次。先把坐标定下来。", img: "/design/tools/assess-a.jpg" },
  { k: "B", title: "想做什么", body: `${Q_COUNT.B} 题，凭直觉。问的是开不开心，不是该不该做。`, img: "/design/tools/assess-b.jpg" },
  { k: "C", title: "已经会什么", body: `${Q_COUNT.C} 题，评估当前真实水平。短板也是结果。`, img: "/design/tools/assess-c.jpg" },
  { k: "D", title: "最在意什么", body: `${Q_COUNT.D} 项里选出不能放弃的五件，先点的是第一优先。`, img: "/design/tools/assess-d.jpg" },
  { k: "E", title: "不能放弃什么", body: "编制、地域、薪资底线。现实约束会标出冲突。", img: "/design/tools/assess-e.jpg" },
] as const;

function readAssessmentCache(): AssessmentResult | null {
  const raw = sessionStorage.getItem("assessment-result");
  if (!raw) return null;
  try { return JSON.parse(raw) as AssessmentResult; } catch { return null; }
}

export function AssessmentScreen({ result = false, chrome = true }: { result?: boolean; chrome?: boolean }) {
  const nav = useNavigate();
  const [phase, setPhase] = useState<AssessPhase>(result ? "result" : "cover");
  const [answers, setAnswers] = useState<Answers>({ A: {}, B: {}, C: {}, D: [], E: {} });
  const [report, setReport] = useState<AssessmentResult | null>(null);
  const [qi, setQi] = useState(0);
  const [aMajor, setAMajor] = useState<DisciplineMajor | "">("");
  const [toastMsg, setToastMsg] = useState("");
  const shuffledB = useMemo(() => shuffleArray(QUESTIONS.filter((q) => q.module === "B")), []);
  const qsC = useMemo(() => QUESTIONS.filter((q) => q.module === "C"), []);
  const qsA = useMemo(() => QUESTIONS.filter((q) => q.module === "A"), []);
  const qsD = useMemo(() => QUESTIONS.filter((q) => q.module === "D"), []);
  const qsE = useMemo(() => QUESTIONS.filter((q) => q.module === "E"), []);

  useEffect(() => {
    if (!result) return;
    const cached = readAssessmentCache();
    if (cached) { setReport(cached); setPhase("result"); return; }
    if (inDesignStudio()) {
      const sample = sampleAssessment();
      const r = runAssessment(sample);
      sessionStorage.setItem("assessment-result", JSON.stringify(r));
      setAnswers(sample);
      setReport(r);
      setPhase("result");
      return;
    }
    nav(go("assessment"), { replace: true });
  }, [result, nav]);

  useEffect(() => {
    if (phase === "cover" || phase === "loading") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [phase, qi]);

  useEffect(() => {
    if (phase === "cover" || phase === "result" || phase === "loading") return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [phase]);

  const finish = async (next?: Answers, skipCheck = false) => {
    const a = next ?? answers;
    if (!skipCheck) {
      const totalB = shuffledB.length;
      const answeredB = Object.keys(a.B).length;
      if (totalB > 0 && answeredB < totalB && !confirm(`还有 ${totalB - answeredB} 道兴趣题未作答。建议完成全部题目以获得更准确的匹配结果。确定提交吗？`)) return;
      const bVals = Object.values(a.B).filter((v) => v > 0);
      if (bVals.length >= 3 && new Set(bVals).size === 1 && !confirm("你在兴趣评估中全部题目评分相同。建议使用 1-5 的完整范围以获得更准确的匹配结果。确定继续吗？")) return;
    }
    setPhase("loading");
    const started = Date.now();
    const r = await callToolApi(
      "/api/tools/assessment/evaluate",
      { answers: { ...a, E: prepE(a.E) } },
      () => runAssessment(a),
    );
    sessionStorage.setItem("assessment-result", JSON.stringify(r));
    setReport(r);
    window.setTimeout(() => {
      setPhase("result");
      nav(go("assessment-result"));
    }, Math.max(0, 1500 - (Date.now() - started)));
  };

  const setA = (id: string, v: string) => {
    setAnswers((p) => ({ ...p, A: { ...p.A, [id]: v } }));
    if (id === "A01") setAMajor(majorOf(v) ?? "");
  };
  const setLikert = (mod: "B" | "C", id: string, v: number) => {
    setAnswers((p) => ({ ...p, [mod]: { ...p[mod], [id]: v } }));
  };
  const toggleD = (id: string) => {
    setAnswers((p) => {
      if (p.D.includes(id)) return { ...p, D: p.D.filter((x) => x !== id) };
      if (p.D.length >= 5) {
        setToastMsg("已选满 5 项价值观");
        window.setTimeout(() => setToastMsg(""), 2000);
        return p;
      }
      return { ...p, D: [...p.D, id] };
    });
  };
  const setE = (id: string, v: string | number) => setAnswers((p) => ({ ...p, E: { ...p.E, [id]: v } }));

  const useSample = () => {
    const sample = sampleAssessment();
    setAnswers(sample);
    void finish(sample, true);
  };

  const answeringBody = (() => {

  const bQ = shuffledB[qi];
  const cQ = qsC[qi];
  const totalLikert = phase === "B" ? shuffledB.length : qsC.length;
  const progress =
    phase === "A" ? 8 :
    phase === "Bintro" ? 16 :
    phase === "B" ? 16 + ((qi + 1) / shuffledB.length) * 36 :
    phase === "Cintro" ? 54 :
    phase === "C" ? 54 + ((qi + 1) / qsC.length) * 24 :
    phase === "D" ? 82 :
    phase === "E" ? 92 : 4;

  const answering = phase !== "cover";
  const pickedMajor = aMajor || (answers.A.A01 ? majorOf(answers.A.A01) : undefined);

  return (
    <Shell flush>
      {phase === "cover" ? (
        <ToolHero
          src="/design/tools/assess-hero.jpg"
          alt="在图书馆里思考去向"
          kicker="— COMPASS"
          title="博士非学术职位评估"
          sub="约 80 题，8 分钟。先弄清学术之外你更像谁，再走进那一类的岗位与雇主。"
          last="博士非学术职位评估"
        />
      ) : (
        <ToolHead kicker="— COMPASS" title="博士非学术职位评估" last="博士非学术职位评估" />
      )}
      <section className={`tool-sheet relative z-[2] bg-[#FCF7EF] px-5 md:px-10 ${phase === "cover" ? "-mt-10 rounded-t-[32px] py-12 md:py-20" : "py-10"}`}>
        <div className={phase === "cover" ? "mx-auto max-w-[1600px]" : "mx-auto max-w-[880px]"}>
          <ToolSwitch current="assessment" compact={phase !== "cover"} />
          {answering && (
            <div className="mb-8">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">博士非学术职位评估</p>
                <span className="text-[12px] text-[#512818]/55">{Math.round(progress)}%</span>
              </div>
              <Rail value={progress} />
            </div>
          )}

          {phase === "cover" && (
            <div>
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— FIVE CHAPTERS</p>
              <h2 className="mt-3 m-0 font-serif text-[32px] md:text-[40px]">像翻一本薄册子</h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-[#512818]/75">
                基本信息 → 兴趣 → 技能 → 选 5 项最在意的价值 → 现实约束。点选项即前进，不必来回翻页。
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {ASSESS_CHAPTERS.map((c, i) => (
                  <button
                    key={c.k}
                    type="button"
                    onClick={() => setPhase("A")}
                    className="plate-card group overflow-hidden rounded-2xl bg-white text-left"
                  >
                    <div className="relative h-[140px] overflow-hidden">
                      <LivePhoto src={c.img} alt="" className={`absolute inset-0 h-full w-full ${i % 2 ? "live-photo--alt" : ""}`} imgClassName="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16]/70 to-transparent" />
                      <span className="absolute bottom-3 left-4 font-serif text-[28px] text-white">{c.k}</span>
                    </div>
                    <div className="px-4 py-4">
                      <div className="font-serif text-[18px]">{c.title}</div>
                      <p className="mt-1 mb-0 text-[12.5px] leading-relaxed text-[#512818]/70">{c.body}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <WineBtn size="lg" onClick={() => setPhase("A")}>开始作答</WineBtn>
                <GhostBtn size="lg" onClick={useSample}>先看一份示例报告</GhostBtn>
              </div>
            </div>
          )}

          {phase === "A" && (
            <div className="tool-card-in space-y-8">
              <h2 className="m-0 font-serif text-[32px]">先把坐标定下来</h2>
              {qsA.map((q) => (
                <Field key={q.id} label={q.text}>
                  {q.id === "A01" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {DISCIPLINE_MAJORS.map((door) => (
                          <button
                            key={door}
                            type="button"
                            className={`tool-tile ${pickedMajor === door ? "is-on" : ""}`}
                            onClick={() => setAMajor(door)}
                          >
                            {door}
                          </button>
                        ))}
                      </div>
                      {pickedMajor ? (
                        <ChipRow>
                          {DISCIPLINE_OPTIONS[pickedMajor].map((o) => (
                            <Chip key={o} on={answers.A.A01 === o} onClick={() => setA("A01", o)}>{o}</Chip>
                          ))}
                        </ChipRow>
                      ) : (
                        <p className="m-0 text-[13px] text-[#512818]/55">先选门类，再点一级学科。</p>
                      )}
                    </div>
                  ) : (
                    <Spectrum options={q.options ?? []} value={String(answers.A[q.id] ?? "")} onChange={(o) => setA(q.id, o)} />
                  )}
                </Field>
              ))}
              <div className="flex justify-between">
                <GhostBtn onClick={() => setPhase("cover")}>返回</GhostBtn>
                <WineBtn disabled={!qsA.every((q) => answers.A[q.id])} onClick={() => { setQi(0); setPhase("Bintro"); }}>进入兴趣</WineBtn>
              </div>
            </div>
          )}

          {phase === "Bintro" && (
            <ChapterIntro
              n="02"
              title="想做什么"
              body={`${Q_COUNT.B} 题，凭直觉。问的是「做这件事本身开不开心」，不是你觉得该不该做。点一下就进入下一题。`}
              img="/design/tools/assess-b.jpg"
              onBack={() => setPhase("A")}
              onNext={() => { setQi(0); setPhase("B"); }}
            />
          )}

          {phase === "B" && bQ && (
            <LikertQuestion
              key={bQ.id}
              index={qi + 1}
              total={totalLikert}
              text={bQ.text}
              value={answers.B[bQ.id]}
              labels={LIKERT_B}
              prompt="我对这件事的喜欢程度"
              onPick={(v) => {
                setLikert("B", bQ.id, v);
                window.setTimeout(() => {
                  if (qi + 1 < shuffledB.length) setQi((n) => n + 1);
                  else { setQi(0); setPhase("Cintro"); }
                }, 180);
              }}
              onBack={() => {
                if (qi === 0) setPhase("Bintro");
                else setQi((n) => n - 1);
              }}
            />
          )}

          {phase === "Cintro" && (
            <ChapterIntro
              n="03"
              title="已经会什么"
              body={`${Q_COUNT.C} 题，评估当前真实水平。允许低分——短板本身就是结果的一部分。`}
              img="/design/tools/assess-c.jpg"
              onBack={() => { setQi(shuffledB.length - 1); setPhase("B"); }}
              onNext={() => { setQi(0); setPhase("C"); }}
            />
          )}

          {phase === "C" && cQ && (
            <LikertQuestion
              key={cQ.id}
              index={qi + 1}
              total={totalLikert}
              text={cQ.text}
              value={answers.C[cQ.id]}
              labels={LIKERT_C}
              prompt="我现在的实际水平"
              onPick={(v) => {
                setLikert("C", cQ.id, v);
                window.setTimeout(() => {
                  if (qi + 1 < qsC.length) setQi((n) => n + 1);
                  else setPhase("D");
                }, 180);
              }}
              onBack={() => {
                if (qi === 0) setPhase("Cintro");
                else setQi((n) => n - 1);
              }}
            />
          )}

          {phase === "D" && (
            <div className="tool-card-in">
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— 04  ·  {answers.D.length} / 5</p>
              <h2 className="mt-2 m-0 font-serif text-[32px]">最不能放弃的五件事</h2>
              <p className="mt-2 text-[15px] text-[#512818]/70">点选即排序。先点的是第一优先。满 5 项后再点会忽略，需先取消一项。</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {qsD.map((q) => {
                  const rank = answers.D.indexOf(q.id);
                  const on = rank >= 0;
                  return (
                    <button key={q.id} type="button" onClick={() => toggleD(q.id)} className={`value-card rounded-2xl px-4 py-4 ${on ? "is-on" : ""}`}>
                      <div className="flex items-start gap-3">
                        <span className="font-serif text-[20px] tabular-nums opacity-70">{on ? String(rank + 1).padStart(2, "0") : "·"}</span>
                        <span className="text-[14.5px] leading-snug">{q.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <GhostBtn onClick={() => { setQi(qsC.length - 1); setPhase("C"); }}>上一章</GhostBtn>
                <WineBtn disabled={answers.D.length !== 5} onClick={() => setPhase("E")}>进入现实约束</WineBtn>
              </div>
            </div>
          )}

          {phase === "E" && (
            <div className="tool-card-in space-y-8">
              <h2 className="m-0 font-serif text-[32px]">最后，哪些条件不能让</h2>
              {qsE.map((q) => (
                <Field key={q.id} label={q.text}>
                  {q.scaleType === "likert5" ? (
                    <Likert value={typeof answers.E[q.id] === "number" ? (answers.E[q.id] as number) : undefined} labels={LIKERT_E} onPick={(v) => setE(q.id, v)} />
                  ) : (
                    <Spectrum options={q.options ?? []} value={String(answers.E[q.id] ?? "")} onChange={(o) => setE(q.id, o)} />
                  )}
                </Field>
              ))}
              <div className="flex justify-between">
                <GhostBtn onClick={() => setPhase("D")}>上一章</GhostBtn>
                <WineBtn
                  disabled={!qsE.every((q) => answers.E[q.id] != null && answers.E[q.id] !== "")}
                  onClick={() => finish()}
                >
                  查看匹配结果
                </WineBtn>
              </div>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
  })();

  const body =
    phase === "loading" ? (
      <ScanRitual
        kicker="— COMPASS"
        title="正在对照 8 类去向"
        sub="兴趣与技能各一半，再叠上价值观与现实约束里的冲突标记。"
        lines={[1, 2, 3, 4, 5, 6, 7, 8].map((id) => CATEGORY_NAMES[id])}
      />
    ) : phase === "result" ? (
      report ? <AssessmentReport report={report} answers={answers} onReset={() => {
        sessionStorage.removeItem("assessment-result");
        setAnswers({ A: {}, B: {}, C: {}, D: [], E: {} });
        setAMajor("");
        setReport(null);
        setQi(0);
        setPhase("cover");
        nav(go("assessment"));
      }} /> : null
    ) : answeringBody;

  return (
    <ChromeCtx.Provider value={chrome}>
      {body}
      {toastMsg ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[4px] bg-[#3A0E16] px-5 py-2.5 text-[13px] text-white">{toastMsg}</div>
      ) : null}
    </ChromeCtx.Provider>
  );
}

function ChapterIntro({ n, title, body, img, onBack, onNext }: { n: string; title: string; body: string; img: string; onBack: () => void; onNext: () => void }) {
  return (
    <div className="tool-card-in overflow-hidden rounded-2xl bg-white md:grid md:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-[220px] md:min-h-[360px]">
        <LivePhoto src={img} alt="" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A0E16]/55 to-transparent" />
        <span className="plate-index absolute bottom-2 left-5 font-serif text-white">{n}</span>
      </div>
      <div className="flex flex-col justify-center px-6 py-8 md:px-10">
        <h2 className="m-0 font-serif text-[36px]">{title}</h2>
        <p className="mt-4 mb-8 max-w-[520px] text-[16px] leading-relaxed text-[#512818]/75">{body}</p>
        <div className="flex justify-between">
          <GhostBtn onClick={onBack}>返回</GhostBtn>
          <WineBtn onClick={onNext}>开始这一章</WineBtn>
        </div>
      </div>
    </div>
  );
}

function LikertQuestion({
  index,
  total,
  text,
  value,
  labels,
  prompt,
  onPick,
  onBack,
}: {
  index: number;
  total: number;
  text: string;
  value?: number;
  labels: string[];
  prompt: string;
  onPick: (v: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="tool-card-in">
      <div className="text-[12px] font-semibold tracking-[.16em] text-[#A16B3E]">{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
      <p className="mt-2 mb-0 text-[13px] text-[#512818]/55">{prompt}</p>
      <h2 className="mt-4 m-0 font-serif text-[28px] leading-snug md:text-[34px]">{text}</h2>
      <div className="mt-10">
        <Likert value={value} labels={labels} onPick={onPick} />
      </div>
      <div className="mt-10">
        <GhostBtn onClick={onBack}>上一题</GhostBtn>
      </div>
    </div>
  );
}

function AssessmentReport({
  report,
  answers,
  onReset,
}: {
  report: AssessmentResult;
  answers: Answers;
  onReset: () => void;
}) {
  const show = useRevealOnMount();
  const names = useLiveCategoryNames();
  const labelOf = (id: number, fallback: string) => names[id] ?? fallback;
  const top = report.matches[0];
  const topName = top ? labelOf(top.categoryId, top.categoryName) : undefined;
  const rest = report.matches.slice(3);
  const radar = [
    ["研究", report.radar.research],
    ["表达", report.radar.communication],
    ["组织", report.radar.organization],
    ["技术", report.radar.technical],
    ["服务", report.radar.service],
  ] as const;
  const hero = CAT_MEDIA[top?.categoryId ?? 4] ?? "/design/tools/assess-hero.jpg";
  return (
    <Shell flush>
      <ToolHero
        src={hero}
        alt={topName ?? "匹配结果"}
        kicker="— YOUR PORTRAIT"
        title={report.top1Label}
        sub={top ? `最佳匹配方向：${topName}，匹配度 ${top.matchPercent}%` : "完成作答后生成职业画像"}
        last="匹配结果"
      />
      <section className="tool-sheet relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1600px]">
          <ToolSwitch current="assessment" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className={`reveal reveal-up text-[12px] font-semibold tracking-[.2em] text-[#A16B3E] ${show ? "is-in" : ""}`}>— EIGHT PATHS</p>
            <h2 className={`reveal reveal-up mt-2 m-0 font-serif text-[32px] ${show ? "is-in" : ""}`}>最贴你的三类</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {report.matches.slice(0, 3).map((m, i) => (
                <Link
                  key={m.categoryId}
                  to={goCareer(m.categoryId)}
                  className={`plate-card group reveal reveal-up flex flex-col overflow-hidden rounded-2xl bg-white no-underline ${show ? "is-in" : ""}`}
                  style={{ transitionDelay: `${0.06 + i * 0.06}s` }}
                >
                  <div className="relative h-[160px] overflow-hidden">
                    <LivePhoto src={CAT_MEDIA[m.categoryId] ?? "/design/tools/assess-hero.jpg"} alt="" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
                    <div className="plate-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-[#5B0D1C]/70 via-transparent to-transparent" />
                    <span className="plate-index absolute bottom-1 left-3 font-serif text-white">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="px-5 py-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-serif text-[20px] text-[#111111]">{labelOf(m.categoryId, m.categoryName)}</span>
                      <span className="font-serif text-[22px] tabular-nums text-[#5B0D1C]">{m.matchPercent}%</span>
                    </div>
                    <div className="mt-3"><Rail value={m.matchPercent} /></div>
                    {m.conflicts.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {m.conflicts.map((c) => (
                          <p key={c} className="m-0 text-[12.5px] leading-snug text-[#A16B3E]">{c}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
            {rest.length > 0 && (
              <div className="mt-6 space-y-2">
                {rest.map((m, i) => (
                  <Link
                    key={m.categoryId}
                    to={goCareer(m.categoryId)}
                    className="flex items-center gap-4 rounded-2xl bg-white px-5 py-3 no-underline"
                  >
                    <span className="w-8 font-serif text-[18px] tabular-nums text-[#A16B3E]">{String(i + 4).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 font-serif text-[17px] text-[#111111]">{labelOf(m.categoryId, m.categoryName)}</span>
                    {m.conflicts.length > 0 ? <span className="shrink-0 text-[11px] text-[#A16B3E]">冲突</span> : null}
                    <span className="font-serif tabular-nums text-[#5B0D1C]">{m.matchPercent}%</span>
                  </Link>
                ))}
              </div>
            )}
            <div className={`reveal reveal-up mt-12 ${show ? "is-in" : ""}`}>
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— SKILL RADAR</p>
              <h2 className="mt-2 m-0 font-serif text-[28px]">五维能力</h2>
              <div className="mt-6 space-y-4">
                {radar.map(([k, v]) => (
                  <div key={k}>
                    <div className="mb-2 flex justify-between text-[14px]">
                      <span>{k}</span>
                      <span className="font-serif tabular-nums text-[#5B0D1C]">{v.toFixed(1)}</span>
                    </div>
                    <Rail value={(v / 5) * 100} />
                  </div>
                ))}
              </div>
            </div>
            {report.valuesQuestions.length > 0 && (
              <div className={`reveal reveal-up mt-12 ${show ? "is-in" : ""}`}>
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— ASK IN INTERVIEWS</p>
                <h2 className="mt-2 m-0 font-serif text-[28px]">面试时应确认</h2>
                <ol className="mt-5 mb-0 space-y-3 p-0">
                  {report.valuesQuestions.map((q, i) => (
                    <li key={q} className="list-none rounded-2xl bg-white px-5 py-4">
                      <span className="mr-3 font-serif text-[#A16B3E]">{String(i + 1).padStart(2, "0")}</span>
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p className="mt-10 text-[12.5px] leading-relaxed text-[#512818]/55">
              本评估反映的是兴趣与技能的相对倾向，仅作为职业探索的起点，不能替代具体岗位的信息核实。
            </p>
          </div>
          <aside className={`reveal reveal-up lg:sticky lg:top-28 ${show ? "is-in" : ""}`}>
            <div className="overflow-hidden rounded-[12px] bg-[#5B0D1C] text-white">
              {top && (
                <img src={hero} alt="" className="h-36 w-full object-cover opacity-80" />
              )}
              <div className="p-6">
                <div className="text-[12px] tracking-[.16em] text-[#EEC3AF]">走进这一类</div>
                <h3 className="mt-2 m-0 font-serif text-[24px]">{topName ?? "职业地图"}</h3>
                <p className="mt-2 text-[13.5px] text-white/75">看代表岗位、雇主与走过的人。评估只给方向，细节在地图里。</p>
                {top && (
                  <Link to={goCareer(top.categoryId)} className="mt-5 inline-flex rounded-[4px] bg-white px-5 py-2.5 text-[14px] text-[#5B0D1C] no-underline">
                    查看 {topName}
                  </Link>
                )}
              </div>
            </div>
            <button type="button" onClick={onReset} className="mt-4 w-full rounded-[4px] border border-[#04191F]/20 bg-white py-2.5 text-[14px]">重新评估</button>
            <button
              type="button"
              className="mt-2 w-full rounded-[4px] border border-[#04191F]/20 bg-white py-2.5 text-[14px]"
              onClick={() => {
                const saved = JSON.parse(localStorage.getItem("saved-results") || "[]") as AssessmentResult[];
                saved.unshift(report);
                localStorage.setItem("saved-results", JSON.stringify(saved.slice(0, 5)));
                alert("已保存到本地。账号系统上线后可同步到云端。");
              }}
            >
              保存结果（即将上线）
            </button>
            <Link to={go("threshold")} className="mt-2 block rounded-[4px] bg-white px-4 py-3 text-center text-[13.5px] text-[#5B0D1C] no-underline">仍想留学术？对照门槛</Link>
            {answers.A.A01 && (
              <p className="mt-4 text-[12.5px] leading-relaxed text-[#512818]/65">
                {answers.A.A01} · {answers.A.A02} · {answers.A.A03}
              </p>
            )}
          </aside>
        </div>
        </div>
      </section>
    </Shell>
  );
}
