import { useState, useEffect } from "react";
const token = () => localStorage.getItem("admin_token") || "";

export default function AdminBenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { fetch("/api/admin/benchmarks", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setBenchmarks(d.data); }).catch(() => {}); }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">门槛基准管理</h2>
      <div className="grid gap-4">
        {benchmarks.map(b => (
          <div key={b.key as string} className="bg-white border border-line rounded-xl shadow-card p-6">
            <h3 className="font-serif text-base font-semibold mb-3">{b.key as string}</h3>
            <pre className="text-[12px] text-ink-2 bg-paper p-4 rounded overflow-auto max-h-[300px]">{JSON.stringify(b.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
