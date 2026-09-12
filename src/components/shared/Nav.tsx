import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function getAdminUser(): { username: string } | null {
  try {
    const token = localStorage.getItem("admin_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) { localStorage.removeItem("admin_token"); return null; }
    return { username: payload.username };
  } catch { return null; }
}

export default function Nav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [admin, setAdmin] = useState<{ username: string } | null>(getAdminUser);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    const checkAuth = () => setAdmin(getAdminUser());
    window.addEventListener("storage", checkAuth);
    window.addEventListener("focus", checkAuth);
    return () => {
      window.removeEventListener("scroll", h);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const items = [
    { path: "/careers", label: "职业探索", match: ["/careers"] },
    { path: "/tools", label: "决策工具", match: ["/tools"] },
    { path: "/jobs", label: "岗位精选", match: ["/jobs"] },
    { path: "/insights", label: "职业数据", match: ["/insights"] },
  ];

  const isActive = (m: string[]) => m.some(p => pathname.startsWith(p));

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/95 shadow-sm" : "bg-bg/95"} backdrop-blur-[10px] border-b border-line`}>
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3 no-underline">
          <span className="font-serif text-[22px] font-semibold text-primary tracking-[.02em]">学术之外</span>
          <span className="font-serif text-xs text-ink-3 tracking-[.18em] uppercase">Beyond Academia</span>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((it) => (
            <Link key={it.path} to={it.path} className={`px-4 py-2 text-sm border-b-2 no-underline transition-colors ${isActive(it.match) ? "text-primary font-semibold border-primary" : "text-ink-2 border-transparent hover:text-primary"}`}>
              {it.label}
            </Link>
          ))}
          {admin ? (
            <div className="ml-5 pl-3.5 flex items-center gap-3 border-l border-line">
              <Link to="/admin" className="text-[13px] text-primary font-medium no-underline hover:underline">管理后台</Link>
              <span className="text-[12px] text-ink-4">|</span>
              <span className="text-[12px] text-ink-3 font-medium">{admin.username}</span>
              <span className="text-[11px] text-green bg-green-soft px-2 py-0.5 rounded-full">已登录</span>
              <button onClick={() => { localStorage.removeItem("admin_token"); setAdmin(null); window.location.reload(); }} className="text-[11px] text-ink-4 bg-transparent border-0 cursor-pointer hover:text-red transition-colors">退出</button>
            </div>
          ) : (
            <Link to="/login" className="ml-5 pl-3.5 py-2 text-sm text-ink-3 border-l border-line no-underline hover:text-primary transition-colors">登录</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
