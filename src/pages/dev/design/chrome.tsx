import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

type NavItem = {
  key: string;
  label: string;
  items: { to: string; search?: string; label: string }[];
};

const NAV: NavItem[] = [
  {
    key: "careers",
    label: "职业探索",
    items: [{ to: "careers", label: "博士职业地图" }],
  },
  {
    key: "tools",
    label: "决策工具",
    items: [
      { to: "threshold", label: "学术职业门槛评估" },
      { to: "warning", label: "博士职位预警" },
      { to: "assessment", label: "博士非学术职位评估" },
    ],
  },
  {
    key: "jobs",
    label: "岗位精选",
    items: [{ to: "jobs", label: "岗位精选" }],
  },
  {
    key: "insights",
    label: "职业数据",
    items: [
      { to: "insights", search: "tab=destination", label: "非学术就业去向" },
      { to: "insights", search: "tab=salary", label: "薪资数据" },
      { to: "insights", search: "tab=interviews", label: "转型者访谈" },
    ],
  },
];

const PROD_PATHS: Record<string, string> = {
  home: "/",
  careers: "/careers",
  "career-detail": "/careers",
  jobs: "/jobs",
  "job-detail": "/jobs",
  insights: "/insights",
  tools: "/tools",
  threshold: "/tools/threshold",
  "threshold-result": "/tools/threshold/result",
  warning: "/tools/warning",
  assessment: "/tools/assessment",
  "assessment-result": "/tools/assessment/result",
  login: "/login",
  me: "/me",
  "admin-dash": "/admin",
  "admin-cats": "/admin/categories",
  "admin-jobs": "/admin/jobs",
  "admin-insights": "/admin/insights",
  "admin-weights": "/admin/weights",
  "admin-rules": "/admin/rules",
  "admin-benchmarks": "/admin/benchmarks",
  "admin-norm": "/admin/threshold-norm",
  "admin-users": "/admin/users",
};

export function inDesignStudio() {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/dev/design");
}

export function go(id: string, search?: string) {
  if (inDesignStudio()) {
    return search ? `/dev/design/${id}?${search}` : `/dev/design/${id}`;
  }
  const path = PROD_PATHS[id] ?? `/${id}`;
  return search ? `${path}?${search}` : path;
}

export function goCareer(id: number) {
  if (inDesignStudio()) return go("career-detail", `id=${id}`);
  return `/careers/${id}`;
}

export function goJob(id: number) {
  if (inDesignStudio()) return go("job-detail", `id=${id}`);
  return `/jobs/${id}`;
}

export function goJobs(params?: { category?: number; region?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", String(params.category));
  if (params?.region && params.region !== "全部") query.set("region", params.region);
  if (params?.q?.trim()) query.set("q", params.q.trim());
  const search = query.toString();
  return search ? go("jobs", search) : go("jobs");
}

function screenFromPath(pathname: string, paramScreen?: string) {
  if (pathname.startsWith("/dev/design")) return paramScreen || "home";
  if (pathname === "/") return "home";
  if (pathname.startsWith("/careers")) return "careers";
  if (pathname.startsWith("/jobs")) return "jobs";
  if (pathname.startsWith("/insights")) return "insights";
  if (pathname.startsWith("/tools")) return "tools";
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/me")) return "me";
  return "";
}

function navItemCurrent(
  item: { to: string; search?: string },
  pathname: string,
  tabQuery: string,
) {
  const href = go(item.to, item.search);
  const hrefPath = href.split("?")[0];
  const itemTab = item.search?.replace("tab=", "") || "";
  const pathOk = pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  if (itemTab) return pathOk && (tabQuery || "destination") === itemTab;
  return pathOk;
}

export function DesignNav({
  tone = "cream",
  active,
  narrow = false,
  flush = false,
}: {
  tone?: "cream" | "wine";
  active?: string;
  narrow?: boolean;
  flush?: boolean;
}) {
  const { pathname } = useLocation();
  const { screen: paramScreen } = useParams();
  const screen = screenFromPath(pathname, paramScreen);
  const [sp] = useSearchParams();
  const tabQuery = sp.get("tab") || "";
  return (
    <>
      {tone === "cream" && !flush ? <div className="h-[70px]" aria-hidden /> : null}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className={`pointer-events-auto mx-auto flex items-center justify-between rounded-[12px] bg-[#FFFDF9] p-3 shadow-[1px_8px_12px_rgba(209,189,173,0.15)] ${narrow ? "w-full max-w-[760px] md:w-[50%] md:max-w-none" : "max-w-[1120px]"}`}>
        <Link to={go("home")} className="pl-2 font-serif text-[17px] font-semibold no-underline" style={{ color: "#5B0D1C" }}>
          学术之外
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((n) => {
            const on =
              active === n.key ||
              n.key === screen ||
              n.items.some((it) => it.to === screen || navItemCurrent(it, pathname, tabQuery));
            return (
              <div key={n.key} className="group relative">
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-[6px] border-0 bg-transparent px-2.5 py-1.5 text-[13px] ${
                    on ? "bg-[#F9EAD0] font-semibold" : "hover:bg-[#F6F0EB]"
                  }`}
                  style={{ color: "#5B0D1C" }}
                >
                  {n.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="translate-y-px opacity-70">
                    <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="invisible absolute left-1/2 top-full z-40 w-max min-w-[200px] -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-2xl bg-white px-5 py-4 text-left shadow-[0_16px_40px_-20px_rgba(91,13,28,.45)]">
                    <div className="mb-3">
                      <span className="relative inline-block px-0.5 text-[11px] font-bold tracking-[.14em]" style={{ color: "#5B0D1C" }}>
                        <span className="absolute inset-x-0 bottom-[2px] h-[7px] bg-[#EEC3AF]" aria-hidden />
                        <span className="relative">{n.label}</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {n.items.map((it) => {
                        const href = go(it.to, it.search);
                        const current = navItemCurrent(it, pathname, tabQuery);
                        return (
                          <Link
                            key={href}
                            to={href}
                            className={`py-1.5 text-[14px] no-underline ${current ? "font-semibold" : "font-normal hover:opacity-70"}`}
                            style={{ color: "#5B0D1C" }}
                          >
                            {it.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        <Link to={go("assessment")} className="rounded-[4px] px-5 py-2.5 text-[14px] font-medium text-white no-underline" style={{ backgroundColor: "#5B0D1C" }}>
          开始评估
        </Link>
      </div>
      </div>
    </>
  );
}

export function DesignFooter() {
  return (
    <footer className="bg-cadmus-wine text-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-8 px-6 py-12">
        <div>
          <div className="text-[12px] text-white/60">替代性学术职业专委会出品</div>
          <div className="mt-3 font-serif text-[28px] leading-none">学术之外</div>
          <div className="mt-2 text-[12px] uppercase tracking-[.18em] text-cadmus-blush">Beyond Academia</div>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] text-white/75">
          <Link to={go("careers")} className="text-inherit no-underline">职业地图</Link>
          <Link to={go("tools")} className="text-inherit no-underline">决策工具</Link>
          <Link to={go("jobs")} className="text-inherit no-underline">岗位精选</Link>
          <Link to={go("insights")} className="text-inherit no-underline">职业数据</Link>
        </div>
      </div>
    </footer>
  );
}

export function WaveDown() {
  return (
    <div className="bg-cadmus-wine" aria-hidden>
      <svg viewBox="0 0 1440 64" className="block w-full fill-cadmus-cream" preserveAspectRatio="none">
        <path d="M0,32 C240,64 480,0 720,24 C960,48 1200,8 1440,32 L1440,64 L0,64 Z" />
      </svg>
    </div>
  );
}

export function Tag({ children, tone = "sand" }: { children: React.ReactNode; tone?: "sand" | "sage" | "blush" | "wine" }) {
  const map = {
    sand: "bg-cadmus-sand text-cadmus-bark",
    sage: "bg-cadmus-sage text-cadmus-deep",
    blush: "bg-cadmus-blush text-cadmus-deep",
    wine: "bg-white/15 text-white",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[tone]}`}>{children}</span>;
}

export function Frame({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-cadmus-cream text-cadmus-deep">{children}</div>;
}
