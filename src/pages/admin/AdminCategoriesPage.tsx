import { useState, useEffect, useMemo } from "react";
import { X, Search } from "lucide-react"
import { useToast } from "@/components/shared/Toast";
import { COVER_LIBRARY, pickCategoryMedia, type CategoryTone } from "@/data/category-media";
const token = () => localStorage.getItem("admin_token") || ""; const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

interface CatData {
  id?: number;
  name: string;
  tagline: string;
  overview: string;
  employers: string[];
  positions: { title: string; salary: string; desc: string }[];
  interviews: { name: string; quote: string; path: string }[];
  openings: { title: string; org: string; location: string }[];
  jobCount?: number;
  coverImage?: string;
  heroImage?: string;
  imageAlt?: string;
  tone?: CategoryTone;
  gallery?: string[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(CatData & { id: number })[]>([]);
  const [editing, setEditing] = useState<CatData | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "new">("list");
  const [query, setQuery] = useState("");
  const toast = useToast();

  const load = () => { fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()).then(d => { if (d.data) setCategories(d.data); }); };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.tagline || "").toLowerCase().includes(q) ||
      (c.overview || "").toLowerCase().includes(q)
    );
  }, [categories, query]);

  const newCat = (): CatData => ({ name: "", tagline: "", overview: "", employers: [], positions: [], interviews: [], openings: [] });

  const edit = (cat: CatData) => { setEditing({ ...cat, employers: [...(cat.employers || [])], positions: [...(cat.positions || [])], interviews: [...(cat.interviews || [])], openings: [...(cat.openings || [])] }); setMode("edit"); };
  const create = () => { setEditing({ ...newCat(), ...pickCategoryMedia() }); setMode("new"); };

  const save = async () => {
    if (!editing || !editing.name.trim()) return alert("类别名称为必填");
    const body = { ...editing, employers: editing.employers, positions: editing.positions, interviews: editing.interviews, openings: editing.openings };
    const url = mode === "new" ? "/api/admin/categories" : `/api/admin/categories/${editing.id}`;
    const method = mode === "new" ? "POST" : "PUT";
    const r = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message || "保存失败", "error"); return; }
    toast(mode === "new" ? "分类已添加" : "分类已更新", "success");
    setMode("list"); setEditing(null); load();
  };

  const del = async (cat: CatData & { id: number; jobCount?: number }) => {
    if (!confirm("确定删除此分类？")) return;
    if ((cat.jobCount ?? 0) > 0) {
      toast(`"${cat.name}" 下有 ${cat.jobCount} 个关联岗位，无法删除。请先去「岗位管理」将这些岗位删除或改为其他分类。`, "error");
      return;
    }
    const r = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message, "error"); }
    else { toast("分类已删除", "success"); load(); }
  };

  if (mode !== "list" && editing) return <CategoryForm data={editing} setData={setEditing} onSave={save} onCancel={() => { setMode("list"); setEditing(null); }} isNew={mode === "new"} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-semibold">职业分类管理</h2><button onClick={create} className="bg-primary text-white border-0 py-2.5 px-5 text-[13px] rounded cursor-pointer">+ 新增分类</button></div>
      {/* 搜索框 */}
      <div className="bg-white border border-line rounded-xl shadow-card p-3.5 mb-4">
        <div className="flex gap-3 items-center">
          <Search size={17} className="text-ink-3 ml-0.5" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索分类名称、短描述、详细描述…"
            className="flex-1 border-0 outline-none text-[14px] text-ink bg-transparent" />
          {query && <button onClick={() => setQuery("")} className="text-ink-4 text-[12px] bg-transparent border-0 cursor-pointer">清除</button>}
        </div>
      </div>
      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]"><thead><tr className="bg-paper text-ink-3 text-[12.5px]"><th className="p-3.5 text-left font-medium">ID</th><th className="p-3.5 text-left font-medium">配图</th><th className="p-3.5 text-left font-medium">名称</th><th className="p-3.5 text-left font-medium">短描述</th><th className="p-3.5 text-left font-medium">关联岗位</th><th className="p-3.5 text-right font-medium">操作</th></tr></thead>
        <tbody>{filtered.map(c => <tr key={c.id} className="border-t border-line"><td className="p-3.5">{c.id}</td><td className="p-3.5">{c.coverImage ? <img src={c.coverImage} alt="" className="h-10 w-14 rounded object-cover" /> : <span className="text-ink-4">待配</span>}</td><td className="p-3.5 font-medium">{c.name}</td><td className="p-3.5 text-ink-3 max-w-[280px] truncate">{c.tagline}</td><td className="p-3.5">{c.jobCount ?? 0}</td><td className="p-3.5 text-right flex gap-3 justify-end"><button onClick={() => edit(c)} className="text-primary bg-transparent border-0 text-[12px] cursor-pointer">编辑</button><button onClick={() => del(c)} className="text-red bg-transparent border-0 text-[12px] cursor-pointer">删除</button></td></tr>)}</tbody></table>
        {filtered.length === 0 && <p className="text-center text-ink-3 py-8 text-[13px]">未找到匹配的分类</p>}
      </div>
    </div>
  );
}

function CategoryForm({ data, setData, onSave, onCancel, isNew }: { data: CatData; setData: (d: CatData) => void; onSave: () => void; onCancel: () => void; isNew: boolean }) {
  const update = (k: keyof CatData, v: unknown) => setData({ ...data, [k]: v });
  const addItem = (field: "positions" | "interviews" | "openings") => {
    const defaults = { positions: { title: "", salary: "", desc: "" }, interviews: { name: "", quote: "", path: "" }, openings: { title: "", org: "", location: "" } };
    update(field, [...data[field], defaults[field]]);
  };
  const editItem = (field: "positions" | "interviews" | "openings", idx: number, key: string, value: string) => {
    const arr = [...data[field]] as Record<string, string>[];
    arr[idx] = { ...arr[idx], [key]: value };
    update(field, arr);
  };
  const removeItem = (field: "positions" | "interviews" | "openings", idx: number) => {
    update(field, (data[field] as unknown[]).filter((_, i) => i !== idx));
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">{isNew ? "新增职业分类" : `编辑：${data.name}`}</h2>
      <div className="bg-white border border-line rounded-xl shadow-card p-8 space-y-6 max-w-[860px]">
        {/* a. 类别名称 */}
        <div><label className="text-[13px] font-semibold text-ink">类别名称 <span className="text-red">*必填</span></label><p className="text-[12px] text-ink-4 mt-0.5 mb-2">2-16 个字为宜。展示在卡片和详情页标题中。</p><input value={data.name} onChange={e => update("name", e.target.value)} maxLength={16} className="w-full max-w-[400px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：高校教研岗、智库/政策研究" /></div>
        <div>
          <label className="text-[13px] font-semibold text-ink">列表配图</label>
          <p className="text-[12px] text-ink-4 mt-0.5 mb-2">新增时从系统图库随机匹配一张。可换一张，或点选下方图库。</p>
          {data.coverImage ? <img src={data.coverImage} alt={data.imageAlt || ""} className="mb-3 h-36 w-56 rounded-lg object-cover border border-line" /> : null}
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setData({ ...data, ...pickCategoryMedia() })} className="bg-white text-ink-2 border border-line py-1.5 px-3 text-[12px] rounded cursor-pointer">换一张</button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {COVER_LIBRARY.map((img) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setData({ ...data, coverImage: img.src, imageAlt: img.alt })}
                className={`p-0 border rounded overflow-hidden cursor-pointer ${data.coverImage === img.src ? "border-primary ring-2 ring-primary/30" : "border-line"}`}
              >
                <img src={img.src} alt={img.alt} className="h-14 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        {/* c. 短描述 */}
        <div><label className="text-[13px] font-semibold text-ink">短描述 <span className="text-ink-3 font-normal">选填</span></label><p className="text-[12px] text-ink-4 mt-0.5 mb-2">一句话概括，展示在列表卡片中作副标题。</p><input value={data.tagline} onChange={e => update("tagline", e.target.value)} className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：研究型大学的青年教师 / 副教授（预聘）路径" /></div>
        {/* d. 详细描述 */}
        <div><label className="text-[13px] font-semibold text-ink">详细描述 <span className="text-ink-3 font-normal">选填</span></label><p className="text-[12px] text-ink-4 mt-0.5 mb-2">100-300 字，展示在详情页顶部。</p><textarea value={data.overview} onChange={e => update("overview", e.target.value)} rows={5} className="w-full p-3 border border-line rounded text-sm resize-y" placeholder="描述该职业分类的特点、发展路径、所需条件…" /></div>
        {/* e. 典型雇主 */}
        <div><label className="text-[13px] font-semibold text-ink">典型雇主 <span className="text-ink-3 font-normal">选填</span></label><p className="text-[12px] text-ink-4 mt-0.5 mb-2">用逗号、顿号、空格分隔。每个机构渲染为独立标签。</p><textarea value={data.employers.join("，")} onChange={e => update("employers", e.target.value.split(/[，,\s、]+/).filter(Boolean))} rows={3} className="w-full p-3 border border-line rounded text-sm resize-y" placeholder="例如：C9 高校，985 高校，中科院系统，省属重点高校" /></div>
        {/* 代表岗位 */}
        <div><div className="flex justify-between items-center mb-2"><label className="text-[13px] font-semibold text-ink">代表岗位</label><button onClick={() => addItem("positions")} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加</button></div>
        {(data.positions as Record<string,string>[]).map((p, i) => <div key={i} className="flex gap-2 mb-2"><input value={p.title} onChange={e => editItem("positions",i,"title",e.target.value)} placeholder="岗位名称" className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" /><input value={p.salary} onChange={e => editItem("positions",i,"salary",e.target.value)} placeholder="薪资" className="w-28 py-2 px-2.5 border border-line rounded text-[13px]" /><button onClick={() => removeItem("positions",i)} className="text-red text-[12px] bg-transparent border-0"><X size={14} /></button></div>)}
        </div>
        {/* 访谈 */}
        <div><div className="flex justify-between items-center mb-2"><label className="text-[13px] font-semibold text-ink">转型者访谈</label><button onClick={() => addItem("interviews")} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加</button></div>
        {(data.interviews as Record<string,string>[]).map((iv, i) => <div key={i} className="grid grid-cols-3 gap-2 mb-2"><input value={iv.name} onChange={e => editItem("interviews",i,"name",e.target.value)} placeholder="姓名" className="py-2 px-2.5 border border-line rounded text-[13px]" /><input value={iv.path} onChange={e => editItem("interviews",i,"path",e.target.value)} placeholder="转型路径" className="py-2 px-2.5 border border-line rounded text-[13px]" /><div className="flex gap-2"><input value={iv.quote} onChange={e => editItem("interviews",i,"quote",e.target.value)} placeholder="访谈引用" className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" /><button onClick={() => removeItem("interviews",i)} className="text-red text-[12px] bg-transparent border-0"><X size={14} /></button></div></div>)}
        </div>
        {/* 正在招聘 */}
        <div><div className="flex justify-between items-center mb-2"><label className="text-[13px] font-semibold text-ink">正在招聘简讯</label><button onClick={() => addItem("openings")} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加</button></div>
        {(data.openings as Record<string,string>[]).map((o, i) => <div key={i} className="flex gap-2 mb-2"><input value={o.title} onChange={e => editItem("openings",i,"title",e.target.value)} placeholder="职位" className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" /><input value={o.org} onChange={e => editItem("openings",i,"org",e.target.value)} placeholder="单位" className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" /><input value={o.location} onChange={e => editItem("openings",i,"location",e.target.value)} placeholder="地点" className="w-24 py-2 px-2.5 border border-line rounded text-[13px]" /><button onClick={() => removeItem("openings",i)} className="text-red text-[12px] bg-transparent border-0"><X size={14} /></button></div>)}
        </div>
        {/* f. 关联岗位数（只读） */}
        {!isNew && <div><label className="text-[13px] font-semibold text-ink">关联岗位数</label><p className="text-[12px] text-ink-4 mt-0.5">此数字由系统根据"岗位精选"模块中关联本分类的岗位自动统计，不可手动修改。</p><div className="text-[28px] font-semibold text-primary mt-1">{data.jobCount ?? 0}</div></div>}
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-line"><button onClick={onSave} className="bg-primary text-white border-0 py-2.5 px-6 text-[13px] rounded cursor-pointer">保存</button><button onClick={onCancel} className="bg-white text-ink-2 border border-line py-2.5 px-6 text-[13px] rounded cursor-pointer">取消</button></div>
      </div>
    </div>
  );
}
