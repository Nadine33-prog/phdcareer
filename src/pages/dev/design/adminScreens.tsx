import { Link } from "react-router-dom";
import { Tag, go } from "./chrome";

const MENU = [
  { id: "admin-dash", label: "仪表盘" },
  { id: "admin-cats", label: "职业分类" },
  { id: "admin-jobs", label: "岗位" },
  { id: "admin-insights", label: "职业数据" },
  { id: "admin-weights", label: "权重矩阵" },
  { id: "admin-rules", label: "风险规则" },
  { id: "admin-benchmarks", label: "门槛基准" },
  { id: "admin-norm", label: "门槛常模" },
  { id: "admin-users", label: "用户管理" },
];

function AdminChrome({ active, title, children }: { active: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full bg-cadmus-cream text-cadmus-deep">
      <aside className="flex w-[220px] shrink-0 flex-col bg-cadmus-wine text-white">
        <div className="border-b border-white/10 px-5 py-5 font-serif text-[18px]">管理后台</div>
        <nav className="flex-1 py-3">
          {MENU.map((m) => (
            <Link
              key={m.id}
              to={go(m.id)}
              className={`block px-5 py-2.5 text-[13px] no-underline ${active === m.id ? "bg-white/15 font-semibold" : "text-white/70 hover:text-white"}`}
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <Link to={go("home")} className="border-t border-white/10 px-5 py-4 text-[12px] text-white/60 no-underline">返回前台</Link>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="m-0 font-serif text-[30px]">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

function Table({ heads, rows }: { heads: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-cadmus-stone/80 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-cadmus-sand/70">
          <tr>{heads.map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-cadmus-stone/60">
              {r.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashScreen() {
  return (
    <AdminChrome active="admin-dash" title="仪表盘">
      <div className="grid gap-3 sm:grid-cols-4">
        {[{ n: "8", l: "职业分类" }, { n: "36", l: "岗位" }, { n: "54", l: "数据条目" }, { n: "12", l: "用户" }].map((m) => (
          <div key={m.l} className="rounded-[18px] bg-white p-5">
            <div className="text-[12px] text-cadmus-bark/60">{m.l}</div>
            <div className="mt-2 font-serif text-[32px] text-cadmus-wine">{m.n}</div>
          </div>
        ))}
      </div>
    </AdminChrome>
  );
}

export function AdminCatsScreen() {
  return (
    <AdminChrome active="admin-cats" title="职业分类">
      <Table heads={["分类", "岗位数", "状态"]} rows={[["学术支撑", "12", "发布"], ["科技企业", "9", "发布"], ["社会智库", "6", "发布"]]} />
    </AdminChrome>
  );
}

export function AdminJobsScreen() {
  return (
    <AdminChrome active="admin-jobs" title="岗位">
      <div className="mb-4 flex gap-2">
        <input className="rounded-xl border border-cadmus-stone bg-white px-3 py-2 text-[13px]" placeholder="搜索岗位 / 单位" />
        <span className="rounded-full bg-cadmus-wine px-4 py-2 text-[13px] text-white">新建</span>
      </div>
      <Table heads={["岗位", "单位", "分类", "地区"]} rows={[["青年研究员", "复旦大学", "学术支撑", "上海"], ["算法专家", "头部互联网", "科技企业", "北京"]]} />
    </AdminChrome>
  );
}

export function AdminInsightsScreen() {
  return (
    <AdminChrome active="admin-insights" title="职业数据">
      <Table heads={["类型", "标题", "年份"]} rows={[["去向", "学术轨道占比", "2025"], ["访谈", "王女士 · 智库", "2024"]]} />
    </AdminChrome>
  );
}

export function AdminWeightsScreen() {
  return (
    <AdminChrome active="admin-weights" title="权重矩阵">
      <p className="mb-4 text-[13px] text-cadmus-bark/70">题目 × 职业分类相关度（0–3）。后台保持高密度，色只作强调。</p>
      <Table heads={["题目", "学术支撑", "科技企业", "智库"]} rows={[["A12 独立课题", "3", "1", "2"], ["B04 交付节奏", "1", "3", "2"]]} />
    </AdminChrome>
  );
}

export function AdminRulesScreen() {
  return (
    <AdminChrome active="admin-rules" title="风险规则">
      <Table heads={["关键词", "等级", "说明"]} rows={[["非升即走", "高", "预聘制退出条款"], ["年薪面议", "中", "薪酬不透明"]]} />
    </AdminChrome>
  );
}

export function AdminBenchmarksScreen() {
  return (
    <AdminChrome active="admin-benchmarks" title="门槛基准">
      <div className="grid gap-3 md:grid-cols-2">
        {["C9 文科教研岗", "985 理工教研岗"].map((t) => (
          <div key={t} className="rounded-[18px] bg-white p-5">
            <div className="font-serif text-[20px]">{t}</div>
            <div className="mt-2 text-[13px] text-cadmus-bark/70">论文 8 · 国课 1 · 教龄 2</div>
            <Tag>已启用</Tag>
          </div>
        ))}
      </div>
    </AdminChrome>
  );
}

export function AdminNormScreen() {
  return (
    <AdminChrome active="admin-norm" title="门槛常模">
      <div className="grid gap-3 sm:grid-cols-4">
        {[{ n: "0", l: "计入常模" }, { n: "0", l: "全部答卷" }, { n: "—", l: "综合分中位数" }, { n: "200", l: "距切换还差" }].map((m) => (
          <div key={m.l} className="rounded-[18px] bg-white p-5">
            <div className="text-[12px] text-cadmus-bark/60">{m.l}</div>
            <div className="mt-2 font-serif text-[32px] text-cadmus-wine">{m.n}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 mb-0 text-[13px] text-cadmus-bark/70">前台百分位仍按公式估算。满 200 份计入常模的答卷后，可改为与真实填表者对比。</p>
    </AdminChrome>
  );
}

export function AdminUsersScreen() {
  return (
    <AdminChrome active="admin-users" title="用户管理">
      <Table heads={["用户", "角色", "状态"]} rows={[["admin", "管理员", "启用"], ["editor", "编辑", "启用"]]} />
    </AdminChrome>
  );
}
