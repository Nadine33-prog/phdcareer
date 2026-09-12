import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ArrowLeft } from "lucide-react";
import { ToastProvider } from "@/components/shared/Toast";

const menu = [
  { group: "", items: [{ path: "/admin", label: "仪表盘", Icon: LayoutDashboard }] },
  { group: "数据管理", items: [{ path: "/admin/categories", label: "职业分类" },{ path: "/admin/jobs", label: "岗位" },{ path: "/admin/insights", label: "职业数据" }] },
  { group: "配置管理", items: [{ path: "/admin/weights", label: "权重矩阵" },{ path: "/admin/rules", label: "风险规则" },{ path: "/admin/benchmarks", label: "门槛基准" },{ path: "/admin/threshold-norm", label: "门槛常模" }] },
  { group: "系统管理", items: [{ path: "/admin/users", label: "用户管理" }] },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const logout = () => { localStorage.removeItem("admin_token"); nav("/login"); };

  return (
    <div className="flex min-h-screen">
      <aside className="w-[220px] bg-primary text-white flex flex-col flex-shrink-0">
        <div className="p-5 font-serif text-lg font-semibold border-b border-white/10 flex items-baseline gap-2">
          管理后台
          <span className="font-serif text-[10px] text-white/40 tracking-[.14em] uppercase">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {menu.map((g, gi) => (
            <div key={gi} className="mb-4">
              {g.group && <div className="text-[10px] text-white/40 uppercase tracking-[.16em] px-5 py-1.5">{g.group}</div>}
              {g.items.map(it => (
                <Link key={it.path} to={it.path} className={`relative flex items-center px-5 py-2.5 text-[13.5px] no-underline transition-colors duration-200 ${pathname === it.path ? "bg-white/15 text-white font-medium" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
                  {pathname === it.path && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />}
                  {it.Icon && <it.Icon size={15} className="mr-2.5 opacity-70" />}{it.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center text-left text-[12px] text-white/50 bg-transparent border-0 cursor-pointer hover:text-white/80 transition-colors"><LogOut size={13} className="mr-2" />退出登录</button>
          <Link to="/" className="flex items-center mt-2 text-[12px] text-white/50 no-underline hover:text-white/80 transition-colors"><ArrowLeft size={13} className="mr-2" />返回前台</Link>
        </div>
      </aside>
      <main className="flex-1 bg-bg p-8 overflow-auto">
        <ToastProvider>
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </ToastProvider>
      </main>
    </div>
  );
}
