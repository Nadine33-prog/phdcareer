import { useState, useEffect } from "react";
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setStats(d.data); }).catch(() => {});
  }, []);
  if (!stats) return <p className="text-ink-3">加载中…</p>;
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">仪表盘</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[{ label: "职业分类", value: stats.categories },{ label: "岗位", value: stats.jobs },{ label: "职业数据条目", value: stats.destinations + stats.salaries + stats.interviews },{ label: "用户", value: stats.users },{ label: "门槛答卷（计入常模）", value: stats.thresholdInNorm ?? 0 },{ label: "门槛答卷（全部）", value: stats.thresholdTotal ?? 0 }].map(s => (
          <div key={s.label} className="bg-white border border-line rounded-xl shadow-card p-6"><div className="text-[12px] text-ink-3 mb-1.5">{s.label}</div><div className="font-serif text-[36px] font-semibold text-primary">{s.value}</div></div>
        ))}
      </div>
    </div>
  );
}
