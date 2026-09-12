import { useEffect, useState } from "react";

const token = () => localStorage.getItem("admin_token") || "";
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

type Stats = {
  total: number;
  inNorm: number;
  readyAt: number;
  remaining: number;
  readyForEmpirical: boolean;
  median: number | null;
  p25: number | null;
  p75: number | null;
  byDiscipline: { name: string; n: number; median: number | null }[];
  byYear: { year: string; n: number }[];
  buckets: { from: number; to: number; n: number }[];
};

type Row = {
  id: number;
  userScore: number;
  percentile: number;
  percentileMode: string;
  disciplineMajor: string;
  phdYear: string;
  age: number | null;
  hasTarget: boolean;
  includeInNorm: boolean;
  createdAt: string;
};

export default function AdminThresholdNormPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const load = () => {
    fetch("/api/admin/threshold-submissions/stats", { headers: auth() })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.data) setStats(d.data); })
      .catch(() => {});
    fetch("/api/admin/threshold-submissions?limit=30", { headers: auth() })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.data) { setRows(d.data); setTotal(d.total ?? d.data.length); } })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const toggle = async (row: Row) => {
    await fetch(`/api/admin/threshold-submissions/${row.id}/norm`, {
      method: "PUT",
      headers: auth(),
      body: JSON.stringify({ includeInNorm: !row.includeInNorm }),
    });
    load();
  };

  if (!stats) return <p className="text-ink-3">加载中…</p>;

  const cards = [
    { label: "计入常模", value: stats.inNorm },
    { label: "全部答卷", value: stats.total },
    { label: "综合分中位数", value: stats.median ?? "—" },
    { label: stats.readyForEmpirical ? "已可切真实百分位" : `距 ${stats.readyAt} 份还差`, value: stats.readyForEmpirical ? "就绪" : stats.remaining },
  ];

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-2">门槛常模</h2>
      <p className="text-[13px] text-ink-3 mb-6">
        前台百分位仍按公式估算。计入常模满 {stats.readyAt} 份后，可改为与真实填表者对比。管理员自己提交的答卷默认不计入。
      </p>
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded-xl shadow-card p-6">
            <div className="text-[12px] text-ink-3 mb-1.5">{s.label}</div>
            <div className="font-serif text-[36px] font-semibold text-primary">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="bg-white border border-line rounded-xl shadow-card p-6">
          <h3 className="font-serif text-base font-semibold mb-3">按学科</h3>
          {stats.byDiscipline.length === 0 ? <p className="text-[13px] text-ink-3 mb-0">还没有计入常模的答卷。</p> : (
            <table className="w-full text-left text-[13px]">
              <thead><tr className="text-ink-3"><th className="pb-2 font-medium">门类</th><th className="pb-2 font-medium">人数</th><th className="pb-2 font-medium">中位分</th></tr></thead>
              <tbody>
                {stats.byDiscipline.map((d) => (
                  <tr key={d.name} className="border-t border-line"><td className="py-2">{d.name}</td><td className="py-2">{d.n}</td><td className="py-2">{d.median ?? "—"}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white border border-line rounded-xl shadow-card p-6">
          <h3 className="font-serif text-base font-semibold mb-3">综合分分布</h3>
          {stats.buckets.every((b) => b.n === 0) ? <p className="text-[13px] text-ink-3 mb-0">还没有计入常模的答卷。</p> : (
            <div className="space-y-3">
              {stats.buckets.map((b) => (
                <div key={b.from}>
                  <div className="flex justify-between text-[12px] text-ink-3 mb-1"><span>{b.from}–{b.to}</span><span>{b.n}</span></div>
                  <div className="h-2 rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.inNorm ? Math.round(b.n / stats.inNorm * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {stats.byYear.length > 0 && (
            <p className="mt-4 mb-0 text-[12px] text-ink-3">
              届次：{stats.byYear.map((y) => `${y.year}（${y.n}）`).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 flex items-baseline justify-between">
          <h3 className="font-serif text-base font-semibold m-0">最近答卷</h3>
          <span className="text-[12px] text-ink-3">共 {total} 份 · 测试数据可移出常模</span>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-paper text-ink-3">
            <tr>
              {["编号", "学科", "届次", "综合分", "示意分位", "常模", "时间", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-3">还没有人提交评估。</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.disciplineMajor}</td>
                <td className="px-4 py-3">{r.phdYear}</td>
                <td className="px-4 py-3">{r.userScore}</td>
                <td className="px-4 py-3">前 {r.percentile}%</td>
                <td className="px-4 py-3">{r.includeInNorm ? "计入" : "不计入"}</td>
                <td className="px-4 py-3 text-ink-3">{new Date(r.createdAt).toLocaleString("zh-CN")}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => toggle(r)} className="text-primary bg-transparent border-0 text-[12px] cursor-pointer">
                    {r.includeInNorm ? "移出常模" : "计入常模"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
