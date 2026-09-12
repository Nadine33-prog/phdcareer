import { useState, useEffect, useMemo } from "react";
import { X, Search } from "lucide-react"
import { useToast } from "@/components/shared/Toast";
const token = () => localStorage.getItem("admin_token") || ""; const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

interface JobData { id?: number; title: string; org: string; categoryId: number | null; salary: string; region: string; responsibilities: string[]; requirements: string[]; benefits: string[]; note: string; detailUrl: string; sourceName: string; type: string; posted: string; active?: boolean; }

const emptyJob = (): JobData => ({ title: "", org: "", categoryId: null, salary: "", region: "北京", responsibilities: [], requirements: [], benefits: [], note: "", detailUrl: "", sourceName: "", type: "学术", posted: "今天" });

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<(JobData & { id: number })[]>([]);
  const [editing, setEditing] = useState<JobData | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "new">("list");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [filterCatId, setFilterCatId] = useState(0);
  const toast = useToast();

  const load = () => {
    fetch("/api/admin/jobs", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()).then(d => { if (d.data) setJobs(d.data); });
    fetch("/api/careers/categories").then(r => r.json()).then(d => { if (d.data) setCategories(d.data); });
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => jobs.filter(j => {
    if (query.trim() && !j.title.includes(query.trim()) && !j.org.includes(query.trim())) return false;
    if (filterCatId !== 0 && j.categoryId !== filterCatId) return false;
    return true;
  }), [jobs, query, filterCatId]);

  const edit = (j: JobData) => { setEditing({ ...j, sourceName: j.sourceName || "", detailUrl: j.detailUrl || "", responsibilities: [...(j.responsibilities||[])], requirements: [...(j.requirements||[])], benefits: [...(j.benefits||[])] }); setMode("edit"); };
  const create = () => { setEditing(emptyJob()); setMode("new"); };

  const save = async () => {
    if (!editing || !editing.title.trim()) return toast("请填写岗位名称", "error");
    if (!editing.org.trim()) return toast("请填写单位名称", "error");
    const method = mode === "new" ? "POST" : "PUT"; const url = mode === "new" ? "/api/admin/jobs" : `/api/admin/jobs/${editing.id}`;
    const body = { ...editing, responsibilities: editing.responsibilities.filter((s: string) => s.trim()), requirements: editing.requirements.filter((s: string) => s.trim()), benefits: editing.benefits.filter((s: string) => s.trim()), categoryId: editing.categoryId || null };
    const r = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message || "保存失败", "error"); return; }
    toast(mode === "new" ? "岗位已添加" : "岗位已更新", "success");
    setMode("list"); setEditing(null); load();
  };

  const del = async (id: number) => { if (!confirm("确定下架此岗位？")) return; await fetch(`/api/admin/jobs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } }); toast("岗位已下架", "success"); load(); };

  const arrEdit = (field: "responsibilities"|"requirements"|"benefits", idx: number, val: string) => { if (!editing) return; const arr = [...editing[field]]; arr[idx] = val; setEditing({ ...editing, [field]: arr }); };
  const arrAdd = (field: "responsibilities"|"requirements"|"benefits") => { if (!editing) return; setEditing({ ...editing, [field]: [...editing[field], ""] }); };
  const arrDel = (field: "responsibilities"|"requirements"|"benefits", idx: number) => { if (!editing) return; setEditing({ ...editing, [field]: editing[field].filter((_, i) => i !== idx) }); };

  if (mode !== "list" && editing) return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">{mode === "new" ? "新增岗位" : `编辑：${editing.title}`}</h2>
      <div className="bg-white border border-line rounded-xl shadow-card p-8 space-y-5 max-w-[800px]">
        {/* 基本信息 */}
        <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line">基本信息</h3>
        <div><label className="text-[13px] font-semibold">岗位名称 <span className="text-red">*必填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">建议 3-20 字，清晰表达职位角色。列表页和详情页的主标题。</p>
          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} maxLength={20} className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：博士后研究员、数据科学家、政策分析师…" /></div>
        <div><label className="text-[13px] font-semibold">所属分类 <span className="text-red">*必填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">该岗位所属的博士职业分类，用于前端按职业分类展示。</p>
          <select value={editing.categoryId ?? ""} onChange={e => setEditing({ ...editing, categoryId: e.target.value ? parseInt(e.target.value) : null })} className="w-full max-w-[360px] py-2.5 px-3 border border-line rounded text-sm"><option value="">— 请选择职业分类 —</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="text-[13px] font-semibold">单位名称 <span className="text-red">*必填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">用人单位的全称或常用简称。</p>
          <input value={editing.org} onChange={e => setEditing({ ...editing, org: e.target.value })} className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：北京大学、中国科学院、华为技术有限公司…" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-[13px] font-semibold">薪资区间 <span className="text-ink-3 font-normal">选填</span></label>
            <p className="text-[12px] text-ink-4 mt-0.5 mb-2">年薪或月薪的范围描述，支持自由文本。</p>
            <input value={editing.salary} onChange={e => setEditing({ ...editing, salary: e.target.value })} className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：25-40万/年" /></div>
          <div><label className="text-[13px] font-semibold">工作地区 <span className="text-ink-3 font-normal">选填</span></label>
            <p className="text-[12px] text-ink-4 mt-0.5 mb-2">岗位所在城市或区域，自由填写。</p>
            <input value={editing.region} onChange={e => setEditing({ ...editing, region: e.target.value })} className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：北京、上海、远程…" /></div>
        </div>
        {/* 详细内容 */}
        <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">详细内容</h3>
        {(["responsibilities","requirements","benefits"] as const).map((field, fi) => (
          <div key={field}><div className="flex justify-between items-center mb-1.5"><label className="text-[13px] font-semibold">{field==="responsibilities"?"岗位职责":field==="requirements"?"任职要求":"福利待遇"} <span className="text-ink-3 font-normal">选填</span></label><button onClick={() => arrAdd(field)} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加一行</button></div>
            <p className="text-[12px] text-ink-4 mb-2">{field==="responsibilities"?"承担的主要工作内容和责任范围，建议逐条列出。" : field==="requirements"?"学历、专业、技能、经验等硬性/软性条件。" : "薪资之外的其他待遇：安家费、子女入学、科研启动金、编制等。"}</p>
            {editing[field].map((val, i) => <div key={i} className="flex gap-2 mb-2"><input value={val} onChange={e => arrEdit(field,i,e.target.value)} className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" placeholder={`第 ${i+1} 条…`} /><button onClick={() => arrDel(field,i)} className="text-red text-[12px] bg-transparent border-0 flex-shrink-0"><X size={14} /></button></div>)}
            {editing[field].length === 0 && <p className="text-[12px] text-line-dark">暂无内容，点击"+ 添加一行"开始添加。</p>}
          </div>
        ))}
        {/* 附加信息 */}
        <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">附加信息</h3>
        <div><label className="text-[13px] font-semibold">编辑短评 <span className="text-ink-3 font-normal">选填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">后台管理用的备注标签，仅供编辑者查看，不会出现在前端页面。</p>
          <input value={editing.note} onChange={e => setEditing({ ...editing, note: e.target.value })} className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：985 特聘岗、急招、即将截止…" /></div>
        <div><label className="text-[13px] font-semibold">出处名称 <span className="text-ink-3 font-normal">选填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">给人看的来源，例如「复旦大学人事处招聘公告」。还没有原文时可以先空着。</p>
          <input value={editing.sourceName} onChange={e => setEditing({ ...editing, sourceName: e.target.value })} className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：复旦大学人事处招聘公告" /></div>
        <div><label className="text-[13px] font-semibold">原文链接 <span className="text-ink-3 font-normal">选填</span></label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">必须是能打开的 http(s) 公告页。前台「查看招聘原文」会跳到这里。</p>
          <input value={editing.detailUrl} onChange={e => setEditing({ ...editing, detailUrl: e.target.value })} className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="https://..." /></div>
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-line">
          <button onClick={save} className="bg-primary text-white border-0 py-2.5 px-6 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors">保存</button>
          <button onClick={() => { setMode("list"); setEditing(null); }} className="bg-white text-ink-2 border border-line py-2.5 px-6 text-[13px] rounded cursor-pointer">取消</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-semibold">岗位管理</h2><button onClick={create} className="bg-primary text-white border-0 py-2.5 px-5 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors">+ 新增岗位</button></div>

      {/* 搜索框 */}
      <div className="bg-white border border-line rounded-xl shadow-card p-3.5 mb-3">
        <div className="flex gap-3 items-center">
          <Search size={17} className="text-ink-3 ml-0.5" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索岗位名称、单位…"
            className="flex-1 border-0 outline-none text-[14px] text-ink bg-transparent" />
          {query && <button onClick={() => setQuery("")} className="text-ink-4 text-[12px] bg-transparent border-0 cursor-pointer">清除</button>}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-paper border border-line rounded-xl p-3.5 mb-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-3">分类</span>
          <select value={filterCatId} onChange={e => setFilterCatId(parseInt(e.target.value))}
            className="py-1.5 px-2.5 border border-line rounded text-[13px] bg-white text-ink-2">
            <option value={0}>全部</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {(query || filterCatId !== 0) && (
          <button onClick={() => { setQuery(""); setFilterCatId(0); }}
            className="text-[12px] text-ink-4 bg-transparent border-0 cursor-pointer hover:text-red">清除筛选</button>
        )}
      </div>

      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]"><thead><tr className="bg-paper text-ink-3 text-[12.5px]"><th className="p-3.5 text-left font-medium">ID</th><th className="p-3.5 text-left font-medium">岗位名称</th><th className="p-3.5 text-left font-medium">单位</th><th className="p-3.5 text-left font-medium">所属分类</th><th className="p-3.5 text-left font-medium">地区</th><th className="p-3.5 text-left font-medium">薪资</th><th className="p-3.5 text-left font-medium">原文</th><th className="p-3.5 text-right font-medium">操作</th></tr></thead>
        <tbody>{filtered.map(j => <tr key={j.id} className="border-t border-line"><td className="p-3.5">{j.id}</td><td className="p-3.5 font-medium">{j.title}</td><td className="p-3.5">{j.org}</td><td className="p-3.5 text-ink-3">{categories.find(c => c.id === j.categoryId)?.name || "—"}</td><td className="p-3.5">{j.region}</td><td className="p-3.5 text-accent">{j.salary || "—"}</td><td className="p-3.5 text-ink-3">{j.detailUrl ? "已填" : "未填"}</td><td className="p-3.5 text-right flex gap-3 justify-end"><button onClick={() => edit(j)} className="text-primary bg-transparent border-0 text-[12px] cursor-pointer">编辑</button><button onClick={() => del(j.id)} className="text-red bg-transparent border-0 text-[12px] cursor-pointer">下架</button></td></tr>)}</tbody></table>
        {filtered.length === 0 && <p className="text-center text-ink-3 py-8 text-[13px]">未找到匹配的岗位</p>}
      </div>
    </div>
  );
}
