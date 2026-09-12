import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";
import { DEFAULT_CATEGORY_MEDIA, resolveCategoryMedia } from "@/data/category-media";
import type { Job } from "@/types/job";
import { JOB_REGIONS } from "@/types/job";
import { asHttpUrl } from "@/utils/source";
import { DesignFooter, DesignNav, Frame, go, goCareer, goJob, goJobs, inDesignStudio } from "./chrome";
import { PREVIEW_JOBS } from "./previewJobs";

const ChromeCtx = createContext(true);

const CAT_NAMES: Record<number, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

function Shell({ children, flush = false }: { children: React.ReactNode; flush?: boolean }) {
  const chrome = useContext(ChromeCtx);
  if (!chrome) return <>{children}</>;
  return (
    <Frame>
      <DesignNav tone="cream" active="jobs" flush={flush} />
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
  pan = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  delay?: string;
  pan?: boolean;
}) {
  const ref = usePhotoPan(pan);
  return (
    <div ref={ref} className={`live-photo ${className ?? ""}`}>
      <div className="live-photo-drift" style={delay ? { animationDelay: delay } : undefined}>
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

function asStrings(v: unknown): string[] {
  return asList(v).map((item) => String(item)).filter(Boolean);
}

function asJob(v: unknown): Job | null {
  const o = asRecord(v);
  if (!o || o.title == null) return null;
  return {
    id: Number(o.id) || 0,
    title: String(o.title),
    org: String(o.org ?? ""),
    region: String(o.region ?? ""),
    type: String(o.type ?? ""),
    categoryId: o.categoryId == null || o.categoryId === "" ? null : Number(o.categoryId),
    salary: String(o.salary ?? ""),
    posted: String(o.posted ?? ""),
    responsibilities: asStrings(o.responsibilities),
    requirements: asStrings(o.requirements),
    benefits: asStrings(o.benefits),
    note: o.note ? String(o.note) : "",
    detailUrl: o.detailUrl ? String(o.detailUrl) : null,
    sourceName: o.sourceName ? String(o.sourceName) : null,
  };
}

function asJobs(raw: unknown): Job[] {
  return asList(unwrapData(raw)).flatMap((item) => {
    const job = asJob(item);
    return job ? [job] : [];
  });
}

async function fetchAllJobs() {
  const pageSize = 100;
  const all: Job[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  while (all.length < total) {
    const res = await fetch(`/api/jobs?limit=${pageSize}&page=${page}`);
    if (!res.ok) throw new Error("load failed");
    const raw: unknown = await res.json();
    const rec = asRecord(raw);
    const list = asJobs(raw);
    all.push(...list);
    total = Number(rec?.total) || all.length;
    if (!list.length || list.length < pageSize) break;
    page += 1;
  }
  return all;
}

const JOB_STILLS: Record<number, { src: string; alt: string }> = {
  1: { src: "/design/jobs/still-1.jpg", alt: "学术案头的书刊与台灯" },
  2: { src: "/design/jobs/still-2.jpg", alt: "公文案卷与印章" },
  3: { src: "/design/jobs/still-3.jpg", alt: "智库简报与研判材料" },
  4: { src: "/design/jobs/still-4.jpg", alt: "产业研究的数据与屏幕" },
  5: { src: "/design/jobs/still-5.jpg", alt: "待编书稿与书架" },
  6: { src: "/design/jobs/still-6.jpg", alt: "医学研究实验台" },
  7: { src: "/design/jobs/still-7.jpg", alt: "技术案卷与制图工具" },
  8: { src: "/design/jobs/still-8.jpg", alt: "国际事务案头与地图" },
};

function jobMedia(job: Job) {
  const id = job.categoryId ?? 1;
  const still = JOB_STILLS[id] ?? JOB_STILLS[1];
  const media = resolveCategoryMedia(id, DEFAULT_CATEGORY_MEDIA[id]);
  return {
    src: still.src,
    hero: media.heroImage,
    alt: still.alt,
    tone: media.tone,
  };
}

function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
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

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1.5 w-10 shrink-0 text-[12px] font-semibold tracking-[.12em] text-[#A16B3E]">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const JOB_ROW_COLS = "md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_5.5rem_4rem_6.5rem_4.5rem_auto]";

function JobRow({ job }: { job: Job }) {
  const cat = job.categoryId ? CAT_NAMES[job.categoryId] : job.type;
  return (
    <Link
      to={goJob(job.id)}
      className={`group grid grid-cols-1 gap-1 border-t border-[#161313]/8 px-5 py-4 text-[13.5px] text-[#512818]/85 no-underline first:border-t-0 md:grid ${JOB_ROW_COLS} md:items-center md:gap-4 md:px-7 md:py-3.5 md:first:border-t hover:bg-[#F9EAD0]/50`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-[#111111] group-hover:text-[#5B0D1C]">{job.title}</span>
          {job.posted === "今天" ? (
            <span className="rounded-md bg-[#5B0D1C] px-1.5 py-0.5 text-[10px] font-semibold tracking-[.08em] text-white">今日更新</span>
          ) : null}
        </div>
        <p className="mt-1 mb-0 text-[12px] text-[#512818]/55 md:hidden">
          {[job.org, cat, job.region, job.posted].filter(Boolean).join(" · ")}
        </p>
      </div>
      <span className="hidden truncate md:block">{job.org}</span>
      <span className="hidden md:block">{cat}</span>
      <span className="hidden md:block">{job.region}</span>
      <span className="font-serif text-[16px] font-semibold tabular-nums text-[#3A0E16] md:text-[13.5px] md:font-medium">{job.salary}</span>
      <span className="hidden md:block">{job.posted}</span>
      <span className="hidden text-[13px] text-[#5B0D1C] md:inline-flex md:items-center md:justify-end">
        查看
        <span aria-hidden className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

function JobList({ jobs, filterKey }: { jobs: Job[]; filterKey: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className={`hidden bg-[#F9EAD0] px-5 py-3 text-[12px] font-medium text-[#512818]/70 md:grid ${JOB_ROW_COLS} md:gap-4 md:px-7`}>
        <span>职位</span>
        <span>单位</span>
        <span>去向</span>
        <span>地区</span>
        <span>年薪</span>
        <span>发布</span>
        <span className="sr-only">详情</span>
      </div>
      {jobs.map((job) => (
        <JobRow key={`${filterKey}-${job.id}`} job={job} />
      ))}
    </div>
  );
}

export function JobsScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const { ref: listRef, on: listOn } = useRevealOnView();
  const { ref: ctaRef, on: ctaOn } = useRevealOnView();
  const [sp, setSp] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>(() => (inDesignStudio() ? PREVIEW_JOBS : []));
  const [ready, setReady] = useState(() => inDesignStudio());
  const [draft, setDraft] = useState(sp.get("q") ?? "");

  const categoryId = Number(sp.get("category") || 0) || 0;
  const region = sp.get("region") || "全部";
  const query = sp.get("q") ?? "";

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    if (inDesignStudio()) {
      setJobs(PREVIEW_JOBS);
      setReady(true);
      return;
    }
    let cancelled = false;
    fetchAllJobs()
      .then((list) => {
        if (!cancelled && list.length) setJobs(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setFilter = (next: { category?: number; region?: string; q?: string }) => {
    const params = new URLSearchParams();
    const cat = next.category ?? categoryId;
    const reg = next.region ?? region;
    const q = (next.q === undefined ? query : next.q).trim();
    if (cat) params.set("category", String(cat));
    if (reg !== "全部") params.set("region", reg);
    if (q) params.set("q", q);
    setSp(params, { replace: true });
  };

  const filtered = useMemo(() => jobs.filter((j) =>
    (categoryId === 0 || j.categoryId === categoryId) &&
    (region === "全部" || j.region === region) &&
    (!query.trim() || j.title.includes(query) || j.org.includes(query))
  ), [jobs, categoryId, region, query]);

  const browsing = categoryId === 0 && region === "全部" && !query.trim();
  const catsInUse = CATEGORIES.filter((c) => jobs.some((j) => j.categoryId === c.id));
  const regions = useMemo(() => {
    const extra = [...new Set(jobs.map((j) => j.region).filter(Boolean))].filter(
      (r) => r !== "全部" && !(JOB_REGIONS as readonly string[]).includes(r),
    );
    return extra.length ? [...JOB_REGIONS, ...extra] : [...JOB_REGIONS];
  }, [jobs]);
  const filterKey = `${categoryId}|${region}|${query}`;

  return (
    <ChromeCtx.Provider value={chrome}>
    <Shell flush>
      <section className="relative flex min-h-[420px] flex-col overflow-hidden md:min-h-[520px]">
        <LivePhoto
          src="/design/jobs-hero.jpg"
          alt="空置的研究所会议室，长桌与窗光"
          className="absolute inset-0 h-full w-full live-photo--hero"
          imgClassName="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16] via-[#3A0E16]/55 to-[#3A0E16]/18" />
        <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[100px] pb-16 md:px-10 md:pb-20">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end">
            <nav className={`reveal reveal-up flex flex-wrap items-center gap-2 text-[13px] text-white/70 ${show ? "is-in" : ""}`}>
              <Link to={go("home")} className="text-inherit no-underline hover:text-white">首页</Link>
              <span aria-hidden>›</span>
              <span className="text-white">岗位精选</span>
            </nav>
            <p className={`reveal reveal-up mt-8 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              — OPENINGS
            </p>
            <h1 className={`reveal reveal-up mt-3 m-0 font-serif text-[40px] font-semibold leading-none text-white md:text-[56px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
              岗位精选
            </h1>
            <p className={`reveal reveal-up mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-white/80 md:text-[18px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
              不撮合招聘。看这个方向上现在有什么真实岗位在招，用来验证市场存在感，而不是投简历。
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 pb-16 pt-10 md:px-10 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-[1600px] pt-6">
          <form
            className={`reveal reveal-up rounded-[12px] bg-white px-5 py-5 shadow-[1px_8px_12px_rgba(207,192,176,0.12)] md:px-7 md:py-6 ${show ? "is-in" : ""}`}
            onSubmit={(e) => {
              e.preventDefault();
              setFilter({ q: draft });
            }}
          >
            <label className="block">
              <span className="text-[12px] font-semibold tracking-[.16em] text-[#A16B3E]">搜索</span>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="职位名称、单位…"
                  className="min-h-11 flex-1 rounded-[4px] border border-[#161313]/15 bg-[#FFFDF9] px-4 text-[15px] text-[#04191F] outline-none focus:border-[#5B0D1C]"
                />
                <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-[4px] bg-[#5B0D1C] px-6 text-[14px] text-white">
                  查找岗位
                </button>
              </div>
            </label>
            <div className="mt-6 space-y-4 border-t border-[#161313]/10 pt-5">
              <FilterRow label="去向">
                <Chip on={categoryId === 0} onClick={() => setFilter({ category: 0 })}>全部</Chip>
                {(catsInUse.length ? catsInUse : CATEGORIES).map((c) => (
                  <Chip key={c.id} on={categoryId === c.id} onClick={() => setFilter({ category: c.id })}>
                    {c.name}
                  </Chip>
                ))}
              </FilterRow>
              <FilterRow label="地区">
                {regions.map((r) => (
                  <Chip key={r} on={region === r} onClick={() => setFilter({ region: r })}>
                    {r}
                  </Chip>
                ))}
              </FilterRow>
            </div>
          </form>

          <div ref={listRef} className={`reveal reveal-up mt-10 ${listOn ? "is-in" : ""}`}>
            <p className="m-0 text-[13px] text-[#512818]/65">
              {!ready ? "正在读取岗位…" : browsing ? `当前收录 ${filtered.length} 个样本岗位` : `找到 ${filtered.length} 个岗位`}
            </p>
          </div>

          {!ready ? (
            <p className="mt-10 text-[15px] text-[#512818]/60">加载中…</p>
          ) : filtered.length > 0 ? (
            <div className="mt-6">
              <JobList jobs={filtered} filterKey={filterKey} />
            </div>
          ) : null}

          {ready && filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-white px-8 py-14 text-center">
              <p className="m-0 font-serif text-[28px] text-[#04191F]">未找到匹配的岗位</p>
              <p className="mt-3 mb-0 text-[15px] text-[#512818]/70">换一个去向或地区，或清空关键词再看一遍。</p>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 items-center rounded-[4px] border border-[#04191F]/25 px-5 text-[14px] text-[#04191F]"
                onClick={() => {
                  setDraft("");
                  setSp(new URLSearchParams(), { replace: true });
                }}
              >
                清除筛选
              </button>
            </div>
          ) : null}

          <div ref={ctaRef} className={`reveal reveal-up mt-16 flex flex-col items-start justify-between gap-8 rounded-[12px] bg-[#5B0D1C] px-8 py-10 text-white md:flex-row md:items-end md:px-10 ${ctaOn ? "is-in" : ""}`}>
            <div className="max-w-[520px]">
              <p className="text-[12px] font-semibold tracking-[.2em] text-[#EEC3AF]">— START FROM A PATH</p>
              <h2 className="mt-3 m-0 font-serif text-[28px] font-normal leading-snug md:text-[32px]">不确定从哪一类岗位看起？</h2>
              <p className="mt-3 m-0 text-[15px] leading-relaxed text-white/75">先回职业地图看 8 类去向，或用 8 分钟评估找更贴你的那一类。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={go("careers")} className="inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[14px] text-[#5B0D1C] no-underline">
                查看职业地图
              </Link>
              <Link to={go("assessment")} className="inline-flex h-10 items-center rounded-[4px] border border-white/40 px-6 text-[14px] text-white no-underline">
                开始评估
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Shell>
    </ChromeCtx.Provider>
  );
}

function DetailBlock({ id, kicker, title, items }: { id: string; kicker: string; title: string; items: string[] }) {
  const { ref, on } = useRevealOnView();
  if (!items.length) return null;
  return (
    <div ref={ref} id={id} className="mt-12 scroll-mt-28 md:mt-14">
      <p className={`reveal reveal-up text-[12px] font-semibold tracking-[.2em] text-[#A16B3E] ${on ? "is-in" : ""}`}>{kicker}</p>
      <h2 className={`reveal reveal-up mt-3 m-0 font-serif text-[28px] font-normal text-[#04191F] md:text-[32px] ${on ? "is-in" : ""}`}>{title}</h2>
      <ol className="mt-6 mb-0 space-y-3 p-0">
        {items.map((item, i) => (
          <li
            key={item}
            className={`plate-card reveal reveal-up flex list-none gap-4 rounded-2xl bg-white px-5 py-4 ${on ? "is-in" : ""}`}
            style={{ transitionDelay: `${0.06 + i * 0.06}s` }}
          >
            <span className="shrink-0 font-serif text-[18px] tabular-nums text-[#A16B3E]">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[15px] leading-relaxed text-[#512818]/85">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function JobDetailScreen({ chrome = true }: { chrome?: boolean }) {
  const show = useRevealOnMount();
  const { ref: mainRef, on: mainOn } = useRevealOnView();
  const { ref: relatedRef, on: relatedOn } = useRevealOnView();
  const { ref: ctaRef, on: ctaOn } = useRevealOnView();
  const { id: paramId } = useParams();
  const [sp] = useSearchParams();
  const studio = inDesignStudio();
  const idNum = Number(studio ? sp.get("id") : paramId);
  const validId = Number.isInteger(idNum) && idNum > 0;

  const [job, setJob] = useState<Job | null>(() => {
    if (!studio) return null;
    if (validId) return PREVIEW_JOBS.find((j) => j.id === idNum) ?? PREVIEW_JOBS[0];
    return PREVIEW_JOBS[0];
  });
  const [pool, setPool] = useState<Job[]>(() => (studio ? PREVIEW_JOBS : []));
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const local = PREVIEW_JOBS.find((j) => j.id === idNum) ?? null;
    if (studio) {
      setJob(local ?? PREVIEW_JOBS[0]);
      setMissing(false);
      setPool(PREVIEW_JOBS);
      return;
    }

    let cancelled = false;
    if (!validId) {
      setJob(null);
      setMissing(true);
      return;
    }

    setJob(null);
    setMissing(false);
    fetch(`/api/jobs/${idNum}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((raw: unknown) => {
        if (cancelled) return;
        const parsed = asJob(unwrapData(raw));
        if (parsed) {
          setJob(parsed);
          setMissing(false);
        } else {
          setJob(null);
          setMissing(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setJob(null);
        setMissing(true);
      });

    return () => {
      cancelled = true;
    };
  }, [idNum, validId, studio]);

  useEffect(() => {
    if (studio) {
      setPool(PREVIEW_JOBS);
      return;
    }
    let cancelled = false;
    fetchAllJobs()
      .then((list) => {
        if (!cancelled && list.length) setPool(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [studio]);

  if (missing && !job) {
    return (
      <ChromeCtx.Provider value={chrome}>
        <Shell>
          <div className="mx-auto max-w-[720px] px-6 pb-24 pt-[120px]">
            <h1 className="m-0 font-serif text-[36px] font-normal text-[#04191F]">该岗位不存在</h1>
            <p className="mt-4 mb-0 text-[16px] leading-relaxed text-[#512818]/75">这条岗位还没有收录，或链接已经失效。</p>
            <Link to={go("jobs")} className="mt-8 inline-flex items-center gap-2 text-[14px] text-[#A16B3E] no-underline">
              ← 返回岗位精选
            </Link>
          </div>
        </Shell>
      </ChromeCtx.Provider>
    );
  }

  if (!job) {
    return (
      <ChromeCtx.Provider value={chrome}>
        <Shell>
          <div className="mx-auto max-w-[720px] px-6 pb-24 pt-[120px]">
            <p className="m-0 text-[16px] text-[#512818]/70">加载中…</p>
          </div>
        </Shell>
      </ChromeCtx.Provider>
    );
  }

  const media = jobMedia(job);
  const catName = job.categoryId ? CAT_NAMES[job.categoryId] : job.type;
  const applyHref = asHttpUrl(job.detailUrl) ?? undefined;
  const isSelf = (j: Job) => j.id === job.id || (j.title === job.title && j.org === job.org);
  const others = pool.filter((j) => !isSelf(j));
  const sameCategory = others.filter((j) => job.categoryId != null && j.categoryId === job.categoryId);
  const relatedFilled = (sameCategory.length >= 2
    ? sameCategory
    : [...sameCategory, ...others.filter((j) => !sameCategory.some((r) => r.id === j.id))]
  ).slice(0, 4);
  const relatedTitle = sameCategory.length >= 2 ? `同属「${catName}」的岗位` : "其他样本岗位";

  return (
    <ChromeCtx.Provider value={chrome}>
    <Shell flush>
      <section className="relative flex min-h-[420px] flex-col overflow-hidden md:min-h-[520px]">
        <LivePhoto
          src={media.src}
          alt={media.alt}
          className="absolute inset-0 h-full w-full live-photo--hero"
          imgClassName="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0E16] via-[#3A0E16]/50 to-[#3A0E16]/18" />
        <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[100px] pb-16 md:px-10 md:pb-20">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end">
            <nav className={`reveal reveal-up flex flex-wrap items-center gap-2 text-[13px] text-white/70 ${show ? "is-in" : ""}`}>
              <Link to={go("home")} className="text-inherit no-underline hover:text-white">首页</Link>
              <span aria-hidden>›</span>
              <Link to={go("jobs")} className="text-inherit no-underline hover:text-white">岗位精选</Link>
              <span aria-hidden>›</span>
              <span className="text-white">{job.title}</span>
            </nav>
            <p className={`reveal reveal-up mt-8 text-[12px] font-semibold tracking-[.22em] text-[#EEC3AF] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
              — OPENINGS
            </p>
            <h1 className={`reveal reveal-up mt-3 m-0 max-w-[900px] font-serif text-[40px] font-semibold leading-none text-white md:text-[56px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.18s" }}>
              {job.title}
            </h1>
            <p className={`reveal reveal-up mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-white/80 md:text-[18px] ${show ? "is-in" : ""}`} style={{ transitionDelay: "0.28s" }}>
              {job.org} · {job.region} · 发布于 {job.posted}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-[2] -mt-10 rounded-t-[32px] bg-[#FCF7EF] px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1240px] items-start gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:gap-x-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-14">
          <div ref={mainRef}>
            <div className={`reveal reveal-up ${mainOn ? "is-in" : ""}`}>
              <div className="flex flex-wrap gap-2">
                {catName && job.categoryId ? (
                  <Link
                    to={goJobs({ category: job.categoryId })}
                    className="rounded-full bg-[#5B0D1C] px-3.5 py-1.5 text-[13px] text-white no-underline"
                  >
                    {catName}
                  </Link>
                ) : catName ? (
                  <span className="rounded-full bg-[#5B0D1C] px-3.5 py-1.5 text-[13px] text-white">{catName}</span>
                ) : null}
                {job.type ? <span className="rounded-full bg-white px-3.5 py-1.5 text-[13px] text-[#512818]">{job.type}</span> : null}
                <span className="rounded-full bg-white px-3.5 py-1.5 text-[13px] text-[#512818]">{job.region}</span>
                {job.posted === "今天" ? (
                  <span className="rounded-full bg-[#F9EAD0] px-3.5 py-1.5 text-[13px] font-semibold text-[#5B0D1C]">今日更新</span>
                ) : null}
              </div>
              <dl className="mt-8 mb-0 grid grid-cols-2 gap-4 border-y border-[#161313]/10 py-6 md:grid-cols-3 md:gap-8">
                <div>
                  <dt className="text-[11px] font-semibold tracking-[.16em] text-[#A16B3E]">年薪</dt>
                  <dd className="mt-1 mb-0 font-serif text-[22px] font-semibold leading-none tabular-nums text-[#3A0E16] md:text-[28px]">{job.salary}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-[.16em] text-[#A16B3E]">单位</dt>
                  <dd className="mt-1 mb-0 font-serif text-[20px] font-semibold leading-snug text-[#3A0E16]">{job.org}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-[.16em] text-[#A16B3E]">发布</dt>
                  <dd className="mt-1 mb-0 font-serif text-[20px] font-semibold leading-none text-[#3A0E16]">{job.posted}</dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="self-start md:sticky md:top-24 md:row-span-2">
            <div className="rounded-[12px] bg-[#5B0D1C] px-6 py-6 text-white">
              <p className="m-0 text-[12px] font-semibold tracking-[.18em] text-[#EEC3AF]">看匹配度</p>
              <h3 className="mt-2 m-0 font-serif text-[24px] font-normal leading-snug">
                你和这个岗位匹配吗？
              </h3>
              <p className="mt-3 mb-0 text-[13px] leading-relaxed text-white/70">
                8 分钟对照 8 类去向。先看方向，再决定要不要跟这类岗位。
              </p>
              <Link
                to={go("assessment")}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-white text-[14px] text-[#5B0D1C] no-underline"
              >
                开始评估
              </Link>
            </div>

            <div className="mt-4 rounded-[12px] bg-white px-6 py-5">
              <p className="m-0 text-[12px] font-semibold tracking-[.16em] text-[#A16B3E]">本页目录</p>
              <div className="mt-3 flex flex-col">
                {[
                  job.responsibilities.length ? { href: "#job-duties", label: "岗位职责" } : null,
                  job.requirements.length ? { href: "#job-requirements", label: "任职要求" } : null,
                  job.benefits.length ? { href: "#job-offer", label: "薪酬与福利" } : null,
                  job.note ? { href: "#job-note", label: "编者注" } : null,
                ].filter((item): item is { href: string; label: string } => Boolean(item)).map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 border-t border-[#161313]/10 py-3 text-[13px] text-[#512818] no-underline first:border-t-0 first:pt-0"
                  >
                    <span>{item.label}</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[12px] bg-[#5B0D1C] text-white">
              <div className="px-6 py-6">
                <p className="m-0 text-[12px] font-semibold tracking-[.18em] text-[#EEC3AF]">原始招聘渠道</p>
                <h3 className="mt-2 m-0 font-serif text-[24px] font-normal leading-snug">
                  {job.sourceName || "招聘原文"}
                </h3>
                <p className="mt-3 mb-0 text-[13px] leading-relaxed text-white/70">
                  打开单位官方页面，对照这条岗位的公告原文。
                </p>
                {applyHref ? (
                  <a
                    href={applyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-white text-[14px] text-[#5B0D1C] no-underline"
                  >
                    查看招聘原文
                  </a>
                ) : (
                  <span className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-white/15 text-[14px] text-white/70">
                    原文尚未收录
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-[12px] bg-white px-6 py-5">
              <h3 className="m-0 font-serif text-[20px] font-normal text-[#04191F]">相关工具</h3>
              <div className="mt-3 flex flex-col">
                {[
                  { to: go("threshold"), label: "我离这个岗位的门槛还有多远？" },
                  { to: go("warning"), label: "分析这份 JD 的风险条款" },
                ].map((t) => (
                  <Link
                    key={t.label}
                    to={t.to}
                    className="group flex items-center justify-between gap-3 border-t border-[#161313]/10 py-3 text-[13px] text-[#512818] no-underline first:border-t-0 first:pt-0"
                  >
                    <span>{t.label}</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[12px] bg-white px-6 py-5">
              <h3 className="m-0 font-serif text-[20px] font-normal text-[#04191F]">接着看数据</h3>
              <div className="mt-3 flex flex-col">
                {[
                  job.categoryId ? { to: go("insights", `tab=salary&category=${job.categoryId}`), label: catName ? `「${catName}」薪资分布` : "薪资数据" } : { to: go("insights", "tab=salary"), label: "薪资数据" },
                  job.categoryId ? { to: go("insights", "tab=destination"), label: catName ? `「${catName}」就业去向` : "就业去向" } : { to: go("insights", "tab=destination"), label: "就业去向" },
                  { to: go("insights", "tab=interviews"), label: "转型者访谈" },
                  job.categoryId ? { to: goCareer(job.categoryId), label: `进入「${catName}」分类` } : { to: go("careers"), label: "查看职业地图" },
                ].map((t) => (
                  <Link
                    key={t.label}
                    to={t.to}
                    className="group flex items-center justify-between gap-3 border-t border-[#161313]/10 py-3 text-[13px] text-[#512818] no-underline first:border-t-0 first:pt-0"
                  >
                    <span>{t.label}</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <DetailBlock id="job-duties" kicker="— RESPONSIBILITIES" title="岗位职责" items={job.responsibilities} />
            <DetailBlock id="job-requirements" kicker="— REQUIREMENTS" title="任职要求" items={job.requirements} />
            <DetailBlock id="job-offer" kicker="— OFFER" title="薪酬与福利" items={job.benefits} />

            {job.note ? (
              <div id="job-note" className={`reveal reveal-up mt-12 scroll-mt-28 rounded-2xl bg-white px-6 py-6 md:mt-14 ${mainOn ? "is-in" : ""}`}>
                <p className="m-0 text-[12px] font-semibold tracking-[.2em] text-[#A16B3E]">— EDITOR NOTE</p>
                <p className="mt-3 mb-0 text-[15px] leading-relaxed text-[#512818]/85">{job.note}</p>
              </div>
            ) : null}

            {relatedFilled.length > 0 ? (
              <div ref={relatedRef} className="mt-16 md:mt-20">
                <p className={`reveal reveal-up text-[12px] font-semibold tracking-[.2em] text-[#A16B3E] ${relatedOn ? "is-in" : ""}`}>— MORE OPENINGS</p>
                <h2 className={`reveal reveal-up mt-3 m-0 font-serif text-[28px] font-normal text-[#04191F] md:text-[32px] ${relatedOn ? "is-in" : ""}`}>
                  {relatedTitle}
                </h2>
                <div className="mt-8">
                  <JobList jobs={relatedFilled} filterKey="related" />
                </div>
              </div>
            ) : null}

            <Link to={go("jobs")} className="mt-14 inline-flex items-center gap-2 text-[14px] text-[#A16B3E] no-underline">
              ← 返回岗位精选
            </Link>
          </div>
        </div>

        <div ref={ctaRef} className={`reveal reveal-up mx-auto mt-16 flex max-w-[1240px] flex-col items-start justify-between gap-8 rounded-[12px] bg-[#5B0D1C] px-8 py-10 text-white md:flex-row md:items-end md:px-10 ${ctaOn ? "is-in" : ""}`}>
          <div className="max-w-[520px]">
            <p className="text-[12px] font-semibold tracking-[.2em] text-[#EEC3AF]">— START FROM A PATH</p>
            <h2 className="mt-3 m-0 font-serif text-[28px] font-normal leading-snug md:text-[32px]">先看这一类，再决定要不要跟</h2>
            <p className="mt-3 m-0 text-[15px] leading-relaxed text-white/75">岗位是样本，不是投递入口。不确定的话，回职业地图或做一次评估。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={go("careers")} className="inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[14px] text-[#5B0D1C] no-underline">
              查看职业地图
            </Link>
            <Link to={go("assessment")} className="inline-flex h-10 items-center rounded-[4px] border border-white/40 px-6 text-[14px] text-white no-underline">
              开始评估
            </Link>
          </div>
        </div>
      </section>
    </Shell>
    </ChromeCtx.Provider>
  );
}
