import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";
import type { Destination, InterviewRecord } from "@/types/insights";
import { DesignFooter, DesignNav, Frame, go, goCareer, goJobs, inDesignStudio } from "./chrome";
import { asHttpUrl } from "@/utils/source";
import { PREVIEW_DESTINATIONS, PREVIEW_INTERVIEWS, PREVIEW_SALARIES, type SalaryRow } from "./previewInsights";

const ChromeCtx = createContext(true);
const CAT_NAMES: Record<number, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
const CAT_TONE: Record<string, string> = {
  学术支撑: "#F9EAD0",
  党政管理: "#EEC3AF",
  社会智库: "#E1E3A2",
  科技企业: "#5B0D1C",
  文化出版: "#C4A06A",
  医疗健康: "#A16B3E",
  军警文职: "#512818",
  其他: "#8C4A2F",
  未分类: "#D8C8B8",
};

function toneOf(name: string) {
  return CAT_TONE[name] ?? "#D8C8B8";
}

const DARK_BG = new Set(["#5B0D1C", "#512818", "#8C4A2F", "#A16B3E"]);

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseStat(raw: string | number) {
  const text = String(raw).trim();
  const m = text.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { target: null as number | null, prefix: "", suffix: "", text };
  return { target: Number(m[2]), prefix: m[1], suffix: m[3], text };
}

function useCountUp(target: number | null, active: boolean, duration = 1600) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (!active) {
      setShown(0);
      return;
    }
    if (reducedMotion()) {
      setShown(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return shown;
}

function CountValue({
  value,
  active,
  delay = 0,
  className,
}: {
  value: string | number;
  active: boolean;
  delay?: number;
  className?: string;
}) {
  const parsed = useMemo(() => parseStat(value), [value]);
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!active) {
      setGo(false);
      return;
    }
    if (!delay || reducedMotion()) {
      setGo(true);
      return;
    }
    const id = window.setTimeout(() => setGo(true), delay);
    return () => window.clearTimeout(id);
  }, [active, delay]);
  const shown = useCountUp(parsed.target, go);
  if (parsed.target == null) return <div className={className}>{parsed.text}</div>;
  const n = Number.isInteger(parsed.target) ? Math.round(shown) : shown.toFixed(1);
  return <div className={className}>{parsed.prefix}{n}{parsed.suffix}</div>;
}

function StatBand({ items }: { items: { n: string; l: string }[] }) {
  const { ref, on } = useRevealOnView();
  return (
    <div ref={ref} className={`reveal reveal-up overflow-hidden rounded-2xl bg-[#5B0D1C] px-6 py-8 text-[#FCF7EF] md:px-10 md:py-10 ${on ? "is-in" : ""}`}>
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((m, i) => (
          <div key={m.l}>
            <CountValue
              value={m.n}
              active={on}
              delay={i * 100}
              className="font-serif text-[48px] font-semibold leading-none tracking-tight tabular-nums md:text-[56px]"
            />
            <div className="mt-3 text-[12px] font-semibold tracking-[.16em] text-[#EEC3AF]">{m.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatPlate({
  tone,
  name,
  value,
  unit,
  note,
  delay,
}: {
  tone: string;
  name: string;
  value: string | number;
  unit?: string;
  note?: string;
  delay?: string;
}) {
  const { ref, on } = useRevealOnView();
  const dark = DARK_BG.has(tone);
  const stagger = delay ? Math.round(parseFloat(delay) * 1000) : 0;
  return (
    <div
      ref={ref}
      className={`plate-card reveal reveal-up flex min-h-[220px] flex-col justify-between rounded-2xl px-6 py-6 md:min-h-[260px] md:px-7 md:py-7 ${on ? "is-in" : ""}`}
      style={{ background: tone, color: dark ? "#FCF7EF" : "#3A0E16", transitionDelay: delay }}
    >
      <div className={`text-[12px] font-semibold tracking-[.16em] ${dark ? "text-[#EEC3AF]" : "text-[#A16B3E]"}`}>{name}</div>
      <div>
        <div className="flex items-end gap-2">
          <CountValue
            value={value}
            active={on}
            delay={stagger}
            className="font-serif text-[64px] font-semibold leading-none tabular-nums md:text-[72px]"
          />
          {unit ? <span className={`mb-1.5 text-[14px] ${dark ? "text-white/55" : "text-[#512818]/55"}`}>{unit}</span> : null}
        </div>
        {note ? (
          <div className={`mt-3 text-[13px] leading-relaxed ${dark ? "text-white/55" : "text-[#512818]/60"}`}>{note}</div>
        ) : null}
      </div>
    </div>
  );
}

type TabKey = "destination" | "salary" | "interviews";

const TABS: { key: TabKey; label: string }[] = [
  { key: "destination", label: "非学术就业去向" },
  { key: "salary", label: "薪资数据" },
  { key: "interviews", label: "转型者访谈" },
];

const COPY: Record<TabKey, { kicker: string; title: string; lead: string }> = {
  destination: {
    kicker: "— DESTINATIONS",
    title: "非学术就业去向",
    lead: "看这批博士实际去了哪一类，而不是想象中的去向。记录按毕业年份与职业分类汇总。",
  },
  salary: {
    kicker: "— SALARY",
    title: "薪资数据",
    lead: "按去向看年薪带。同一届博士，轨道不同，中位值可以差出一倍。单位：万元/年，税前。",
  },
  interviews: {
    kicker: "— FIELD NOTES",
    title: "转型者访谈",
    lead: "他们谈的不是成功学，是当时怎么判断、放弃了什么、第一年靠什么站稳。",
  },
};

function Shell({ children, flush = false }: { children: React.ReactNode; flush?: boolean }) {
  const chrome = useContext(ChromeCtx);
  if (!chrome) return <>{children}</>;
  return (
    <Frame>
      <DesignNav tone="cream" active="insights" flush={flush} />
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
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, on };
}

function LivePhoto({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  return (
    <div className={`live-photo ${className ?? ""}`}>
      <div className="live-photo-drift">
        <img src={src} alt={alt} className={imgClassName} />
      </div>
    </div>
  );
}

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

function catName(id: number | null | undefined) {
  if (!id) return "未分类";
  return CAT_NAMES[id] || "未分类";
}

function asDestinations(raw: unknown): Destination[] {
  return asList(unwrapData(raw)).flatMap((item) => {
    const o = asRecord(item);
    if (!o || o.id == null) return [];
    return [{
      id: String(o.id),
      school: String(o.school ?? ""),
      major: String(o.major ?? ""),
      org: String(o.org ?? ""),
      type: String(o.type ?? ""),
      year: String(o.year ?? ""),
      location: String(o.location ?? ""),
      categoryId: o.categoryId == null || o.categoryId === "" ? null : Number(o.categoryId),
      source: String(o.source ?? ""),
      sourceUrl: o.sourceUrl ? String(o.sourceUrl) : null,
      isSynthetic: o.isSynthetic == null ? true : Boolean(o.isSynthetic),
    }];
  });
}

function asSalaries(raw: unknown): SalaryRow[] {
  return asList(unwrapData(raw)).flatMap((item) => {
    const o = asRecord(item);
    if (!o || o.org == null) return [];
    return [{
      id: o.id == null ? undefined : Number(o.id),
      org: String(o.org),
      position: String(o.position ?? ""),
      family: String(o.family ?? ""),
      salary: Number(o.salary) || 0,
      year: Number(o.year) || 0,
      n: Number(o.n) || 0,
      source: String(o.source ?? ""),
      sourceUrl: o.sourceUrl ? String(o.sourceUrl) : null,
      categoryId: o.categoryId == null || o.categoryId === "" ? null : Number(o.categoryId),
    }];
  });
}

function asInterviews(raw: unknown): InterviewRecord[] {
  return asList(unwrapData(raw)).flatMap((item) => {
    const o = asRecord(item);
    if (!o || o.quote == null) return [];
    return [{
      id: o.id == null ? undefined : Number(o.id),
      name: String(o.name ?? ""),
      from: String(o.from ?? ""),
      to: String(o.to ?? ""),
      date: String(o.date ?? ""),
      quote: String(o.quote),
    }];
  });
}

function SourceLink({ label, href }: { label?: string | null; href?: string | null }) {
  const url = asHttpUrl(href);
  const text = (label || "").trim() || "查看原文";
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-[#5B0D1C] underline-offset-2 hover:underline">
        {text}
      </a>
    );
  }
  return <span>{text === "查看原文" ? "—" : text}</span>;
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
        on ? "bg-[#5B0D1C] text-white" : "bg-white text-[#512818] hover:bg-[#5B0D1C] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1.5 w-10 shrink-0 text-[12px] font-semibold tracking-[.12em] text-[#A16B3E]">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function DestinationPanel() {
  const { ref, on } = useRevealOnView();
  const [q, setQ] = useState("");
  const [data, setData] = useState<Destination[]>(() => (inDesignStudio() ? PREVIEW_DESTINATIONS : []));

  useEffect(() => {
    if (inDesignStudio()) {
      setData(PREVIEW_DESTINATIONS);
      return;
    }
    let cancelled = false;
    fetch("/api/insights/destinations")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((raw: unknown) => {
        if (cancelled) return;
        const list = asDestinations(raw);
        if (list.length) setData(list);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const years = useMemo(() => [...new Set(data.map((r) => r.year))].sort(), [data]);
  const shares = useMemo(() => {
    const typeMap = new Map<string, { total: number; years: Record<string, number> }>();
    for (const r of data) {
      const name = catName(r.categoryId);
      if (!typeMap.has(name)) typeMap.set(name, { total: 0, years: {} });
      const row = typeMap.get(name)!;
      row.total += 1;
      row.years[r.year] = (row.years[r.year] || 0) + 1;
    }
    return Array.from(typeMap.entries())
      .map(([name, v]) => ({ name, ...v, pct: data.length ? Math.round((v.total / data.length) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const rows = useMemo(() => {
    if (!q.trim()) return data;
    const k = q.trim();
    return data.filter((r) =>
      r.id.includes(k) || r.school.includes(k) || r.major.includes(k) || r.org.includes(k) || catName(r.categoryId).includes(k)
    );
  }, [data, q]);

  const top = shares[0];

  return (
    <div ref={ref}>
      <StatBand
        items={[
          { n: String(data.length), l: "已收录去向" },
          { n: String(years.length), l: "观察届数" },
          { n: top ? `${top.pct}%` : "—", l: top ? `进入${top.name}` : "样本最多的一类" },
        ]}
      />

      <div className={`reveal reveal-up mt-10 ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.08s" }}>
        <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— SHARE</p>
        <h2 className="mt-3 m-0 font-serif text-[24px] font-normal text-[#04191F] md:text-[28px]">按分类看人数</h2>
        <p className="mt-2 mb-6 text-[13px] text-[#512818]/65">
          数字就是人数。颜色对应职业分类。基于 {data.length} 条已收录记录。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {shares.map((s, i) => (
            <StatPlate
              key={s.name}
              tone={toneOf(s.name)}
              name={s.name}
              value={s.total}
              unit="人"
              note={`${s.pct}%  ·  ${years.filter((y) => s.years[y]).map((y) => `${y} ${s.years[y]} 人`).join("  ·  ")}`}
              delay={`${0.06 + i * 0.06}s`}
            />
          ))}
        </div>
      </div>

      <div className={`reveal reveal-up mt-6 overflow-hidden rounded-2xl bg-white ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.14s" }}>
        <div className="flex flex-col justify-between gap-4 px-5 py-5 md:flex-row md:items-end md:px-7">
          <div>
            <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— RECORDS</p>
            <h2 className="mt-2 m-0 font-serif text-[24px] font-normal text-[#04191F]">去向明细</h2>
            <p className="mt-1 mb-0 text-[13px] text-[#512818]/65">当前 {rows.length} 条 · 匿名编号，不对应可检索个人。标「示意」的尚未核验。</p>
          </div>
          <label className="block w-full md:max-w-[320px]">
            <span className="sr-only">搜索学校、专业或机构</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索学校 / 专业 / 机构…"
              className="min-h-11 w-full rounded-[4px] border border-[#161313]/15 bg-[#FFFDF9] px-4 text-[15px] text-[#04191F] outline-none focus:border-[#5B0D1C]"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-[#F9EAD0] text-left text-[12px] text-[#512818]/70">
                {["匿名编号", "毕业学校", "专业", "入职机构", "去向", "届数", "地点", "出处"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium md:px-7">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#161313]/8 text-[#512818]/85 hover:bg-[#F9EAD0]/50">
                  <td className="px-5 py-3.5 tabular-nums md:px-7">{r.id}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.school}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.major}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.org}</td>
                  <td className="px-5 py-3.5 font-medium text-[#3A0E16] md:px-7">{catName(r.categoryId)}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.year}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.location}</td>
                  <td className="px-5 py-3.5 text-[12px] md:px-7">
                    {r.isSynthetic ? (
                      <span className="text-[#512818]/50">{r.source || "示意样本"}</span>
                    ) : (
                      <SourceLink label={r.source} href={r.sourceUrl} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SalaryPanel({ categoryParam }: { categoryParam: string }) {
  const { ref, on } = useRevealOnView();
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("全部");
  const [year, setYear] = useState("全部");
  const [data, setData] = useState<SalaryRow[]>(() => (inDesignStudio() ? PREVIEW_SALARIES : []));

  useEffect(() => {
    if (inDesignStudio()) {
      setData(PREVIEW_SALARIES);
      return;
    }
    let cancelled = false;
    fetch("/api/insights/salaries")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((raw: unknown) => {
        if (cancelled) return;
        const list = asSalaries(raw);
        if (list.length) setData(list);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!categoryParam) {
      setFamily("全部");
      return;
    }
    const id = Number(categoryParam);
    if (Number.isInteger(id) && id > 0) {
      setFamily(CAT_NAMES[id] || "全部");
      return;
    }
    setFamily(categoryParam);
  }, [categoryParam]);

  const families = ["全部", ...Array.from(new Set(data.map((r) => r.family)))];
  const years = ["全部", ...Array.from(new Set(data.map((r) => String(r.year)))).sort().reverse()];

  const rows = useMemo(() => data.filter((r) => {
    if (family !== "全部" && r.family !== family) return false;
    if (year !== "全部" && String(r.year) !== year) return false;
    if (q.trim() && !(r.org.includes(q) || r.position.includes(q) || r.family.includes(q))) return false;
    return true;
  }), [data, family, year, q]);

  const chartData = useMemo(() => {
    const groups: Record<string, { min: number; max: number; avg: number; n: number }> = {};
    for (const r of data) {
      const f = r.family;
      if (!groups[f]) groups[f] = { min: r.salary, max: r.salary, avg: 0, n: 0 };
      if (r.salary < groups[f].min) groups[f].min = r.salary;
      if (r.salary > groups[f].max) groups[f].max = r.salary;
      groups[f].avg += r.salary;
      groups[f].n += 1;
    }
    return Object.entries(groups)
      .map(([name, v]) => ({ name, avg: Math.round(v.avg / v.n), min: v.min, max: v.max, n: v.n }))
      .sort((a, b) => b.avg - a.avg);
  }, [data]);

  const peak = chartData[0];

  return (
    <div ref={ref}>
      <StatBand
        items={[
          { n: String(data.length), l: "薪资样本" },
          { n: peak ? `${peak.avg}` : "—", l: "均值最高（万元/年）" },
          { n: peak ? peak.name : "—", l: "对应去向" },
        ]}
      />

      <div className={`reveal reveal-up mt-10 ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.08s" }}>
        <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— COMPARE</p>
        <h2 className="mt-3 m-0 font-serif text-[24px] font-normal text-[#04191F] md:text-[28px]">各分类年薪均值</h2>
        <p className="mt-2 mb-6 text-[13px] text-[#512818]/65">
          大数字是该类均值，下面一行是最低到最高。单位：万元/年，税前。基于 {data.length} 条。
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chartData.map((d, i) => (
            <StatPlate
              key={d.name}
              tone={toneOf(d.name)}
              name={d.name}
              value={d.avg}
              unit="万"
              note={`${d.min}–${d.max} 万  ·  ${d.n} 条`}
              delay={`${0.06 + i * 0.05}s`}
            />
          ))}
        </div>
      </div>

      <form
        className={`reveal reveal-up mt-6 rounded-2xl bg-white px-5 py-5 md:px-7 ${on ? "is-in" : ""}`}
        style={{ transitionDelay: "0.12s" }}
        onSubmit={(e) => e.preventDefault()}
      >
        <FilterRow label="分类">
          {families.map((f) => (
            <Chip key={f} on={family === f} onClick={() => setFamily(f)}>{f}</Chip>
          ))}
        </FilterRow>
        <div className="mt-4">
          <FilterRow label="年份">
            {years.map((y) => (
              <Chip key={y} on={year === y} onClick={() => setYear(y)}>{y}</Chip>
            ))}
          </FilterRow>
        </div>
      </form>

      <div className={`reveal reveal-up mt-6 overflow-hidden rounded-2xl bg-white ${on ? "is-in" : ""}`} style={{ transitionDelay: "0.16s" }}>
        <div className="flex flex-col justify-between gap-4 px-5 py-5 md:flex-row md:items-end md:px-7">
          <div>
            <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— RECORDS</p>
            <h2 className="mt-2 m-0 font-serif text-[24px] font-normal text-[#04191F]">典型岗位薪资</h2>
            <p className="mt-1 mb-0 text-[13px] text-[#512818]/65">当前 {rows.length} 条 · 万元/年（税前）。有链接的来源可点开原文。</p>
          </div>
          <label className="block w-full md:max-w-[320px]">
            <span className="sr-only">搜索机构或职位</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索机构 / 职位…"
              className="min-h-11 w-full rounded-[4px] border border-[#161313]/15 bg-[#FFFDF9] px-4 text-[15px] text-[#04191F] outline-none focus:border-[#5B0D1C]"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-[#F9EAD0] text-left text-[12px] text-[#512818]/70">
                {["机构", "职位", "分类", "薪资中位数", "年份", "样本", "来源"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium md:px-7">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.org}-${r.position}-${i}`} className="border-t border-[#161313]/8 text-[#512818]/85 hover:bg-[#F9EAD0]/50">
                  <td className="px-5 py-3.5 font-medium text-[#111111] md:px-7">{r.org}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.position}</td>
                  <td className="px-5 py-3.5 md:px-7">{r.family}</td>
                  <td className="px-5 py-3.5 font-serif text-[18px] font-semibold tabular-nums text-[#3A0E16] md:px-7">{r.salary} 万</td>
                  <td className="px-5 py-3.5 tabular-nums md:px-7">{r.year}</td>
                  <td className="px-5 py-3.5 tabular-nums md:px-7">{r.n}</td>
                  <td className="px-5 py-3.5 text-[12px] md:px-7">
                    <SourceLink label={r.source} href={r.sourceUrl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InterviewPanel() {
  const { ref, on } = useRevealOnView();
  const [data, setData] = useState<InterviewRecord[]>(() => (inDesignStudio() ? PREVIEW_INTERVIEWS : []));

  useEffect(() => {
    if (inDesignStudio()) {
      setData(PREVIEW_INTERVIEWS);
      return;
    }
    let cancelled = false;
    fetch("/api/insights/interviews")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((raw: unknown) => {
        if (cancelled) return;
        const list = asInterviews(raw);
        if (list.length) setData(list);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div ref={ref} className="grid gap-5 md:grid-cols-2">
      {data.map((iv, i) => (
        <article
          key={`${iv.name}-${iv.date}`}
          className={`plate-card reveal reveal-up rounded-2xl bg-white px-6 py-6 ${on ? "is-in" : ""}`}
          style={{ transitionDelay: `${0.04 + (i % 2) * 0.08}s` }}
        >
          <p className="m-0 font-serif text-[20px] font-normal leading-snug text-[#04191F] md:text-[22px]">「{iv.quote}」</p>
          <div className="atlas-rule mt-5 bg-[#5B0D1C]" />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[14px] font-semibold text-[#111111]">{iv.name}</div>
              <div className="mt-1 text-[13px] text-[#512818]/70">{iv.from} → {iv.to}</div>
            </div>
            <div className="text-[12px] tabular-nums text-[#A16B3E]">{iv.date}</div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function InsightsScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const { ref: ctaRef, on: ctaOn } = useRevealOnView();
  const [sp, setSp] = useSearchParams();
  const tab = (["destination", "salary", "interviews"] as const).includes(sp.get("tab") as TabKey)
    ? (sp.get("tab") as TabKey)
    : "destination";
  const copy = COPY[tab];
  const categoryParam = sp.get("category") || "";

  const setTab = (next: TabKey) => {
    const params = new URLSearchParams();
    params.set("tab", next);
    if (next === "salary" && categoryParam) params.set("category", categoryParam);
    setSp(params, { replace: true });
  };

  return (
    <ChromeCtx.Provider value={chrome}>
      <Shell flush>
        <section className="relative flex min-h-[420px] flex-col overflow-hidden md:min-h-[520px]">
          <LivePhoto
            src="/design/jobs/still-4.jpg"
            alt="案头上的数据与研究材料"
            className="absolute inset-0 h-full w-full live-photo--hero"
            imgClassName="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16] via-[#3A0E16]/50 to-[#3A0E16]/18" />
          <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[100px] pb-16 md:px-10 md:pb-20">
            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end">
              <nav className={`reveal reveal-up flex flex-wrap items-center gap-2 text-[13px] text-white/70 ${show ? "is-in" : ""}`}>
                <Link to={go("home")} className="text-inherit no-underline hover:text-white">首页</Link>
                <span aria-hidden>›</span>
                <span className="text-white">职业数据</span>
                <span aria-hidden>›</span>
                <span className="text-white">{copy.title}</span>
              </nav>
              <p className={`reveal reveal-up mt-8 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
                {copy.kicker}
              </p>
              <h1 className={`reveal reveal-up mt-3 m-0 font-serif text-[40px] font-semibold leading-none text-white md:text-[56px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
                {copy.title}
              </h1>
              <p className={`reveal reveal-up mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-white/80 md:text-[18px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
                {copy.lead}
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 pb-16 pt-10 md:px-10 md:pb-20">
          <div className="mx-auto max-w-[1600px]">
            <div className={`reveal reveal-up flex flex-wrap gap-2 ${show ? "is-in" : ""}`}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-4 py-2 text-[14px] ${tab === t.key ? "bg-[#5B0D1C] text-white" : "bg-white text-[#512818]"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {tab === "destination" ? <DestinationPanel /> : null}
              {tab === "salary" ? <SalaryPanel categoryParam={categoryParam} /> : null}
              {tab === "interviews" ? <InterviewPanel /> : null}
            </div>

            <div ref={ctaRef} className={`reveal reveal-up mt-16 flex flex-col items-start justify-between gap-8 rounded-[12px] bg-[#5B0D1C] px-8 py-10 text-white md:flex-row md:items-end md:px-10 ${ctaOn ? "is-in" : ""}`}>
              <div className="max-w-[520px]">
                <p className="text-[12px] font-semibold tracking-[.2em] text-[#EEC3AF]">— READ AGAINST A PATH</p>
                <h2 className="mt-3 m-0 font-serif text-[28px] font-normal leading-snug md:text-[32px]">数字要对照一条具体去向</h2>
                <p className="mt-3 m-0 text-[15px] leading-relaxed text-white/75">先回职业地图看 8 类，或用岗位精选核这类方向上现在有没有真实在招。</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={go("careers")} className="inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[14px] text-[#5B0D1C] no-underline">
                  查看职业地图
                </Link>
                <Link to={goJobs()} className="inline-flex h-10 items-center rounded-[4px] border border-white/40 px-6 text-[14px] text-white no-underline">
                  岗位精选
                </Link>
                {tab === "salary" && categoryParam && Number(categoryParam) > 0 ? (
                  <Link to={goCareer(Number(categoryParam))} className="inline-flex h-10 items-center rounded-[4px] border border-white/40 px-6 text-[14px] text-white no-underline">
                    进入这类去向
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </Shell>
    </ChromeCtx.Provider>
  );
}
