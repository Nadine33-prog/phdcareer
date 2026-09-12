import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import { DISCIPLINE_OPTIONS } from "@/data/disciplines";
const token = () => localStorage.getItem("admin_token") || "";
const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

// 教育局学科大类（去重扁平）
const ALL_MAJORS = Object.values(DISCIPLINE_OPTIONS).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

type Tab = "destinations" | "salaries" | "interviews";

interface CatOption { id: number; name: string; }

export default function AdminInsightsPage() {
  const [tab, setTab] = useState<Tab>("destinations");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "new">("list");
  const [categories, setCategories] = useState<CatOption[]>([]);
  const toast = useToast();

  const adminPath = `/api/admin/insights/${tab}`;
  const publicPath = `/api/insights/${tab}`;

  const loadCategories = () => {
    fetch("/api/careers/categories").then(r => r.json()).then(d => { if (d.data) setCategories(d.data); });
  };

  const load = () => {
    fetch(publicPath).then(r => r.json()).then(d => { if (d.data) setData(d.data); });
  };

  useEffect(() => { load(); loadCategories(); setMode("list"); setEditing(null); }, [tab]);

  // ── 各 tab 的默认空记录 ──
  const newItem = (): Record<string, unknown> => {
    if (tab === "destinations") return { id: "", school: "", major: "", org: "", type: "", year: "", location: "", source: "", sourceUrl: "", isSynthetic: true, categoryId: null };
    if (tab === "salaries") return { org: "", position: "", family: "", salary: "", year: "", n: "", source: "", sourceUrl: "", categoryId: null };
    return { name: "", from: "", to: "", date: "", quote: "", categoryId: null };
  };

  const save = async () => {
    if (!editing) return;
    const method = mode === "new" ? "POST" : "PUT";
    const idKey = tab === "destinations" ? "id" : "id";
    const url = mode === "new" ? adminPath : `${adminPath}/${editing[idKey] ?? editing["id"]}`;
    const body: Record<string, unknown> = { ...editing };
    // 数值转换
    if (tab === "salaries") {
      body.salary = parseInt(body.salary as string) || 0;
      body.year = parseInt(body.year as string) || 2025;
      body.n = parseInt(body.n as string) || 1;
    }
    // categoryId: 空字符串 → null
    if (body.categoryId === "" || body.categoryId === undefined) body.categoryId = null;
    else if (typeof body.categoryId === "string") body.categoryId = parseInt(body.categoryId);

    const r = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message || "保存失败", "error"); return; }
    toast(mode === "new" ? "已添加" : "已更新", "success");
    setMode("list"); setEditing(null); load();
  };

  const del = async (id: string | number) => {
    if (!confirm("确定删除？")) return;
    await fetch(`${adminPath}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    toast("已删除", "success"); load();
  };

  // ── 列表表头 ──
  const listFields = tab === "destinations"
    ? ["id", "school", "major", "org", "type", "year", "location", "source", "isSynthetic", "categoryId"]
    : tab === "salaries"
    ? ["id", "org", "position", "family", "salary", "year", "n", "source", "sourceUrl", "categoryId"]
    : ["id", "name", "from", "to", "date", "quote", "categoryId"];

  const labelMap: Record<string, string> = {
    id: "编号", school: "学校", major: "专业", org: "机构", type: "类型", year: "年份/届", location: "地点",
    position: "职位", family: "分类", salary: "薪资(万)", n: "样本数", source: "来源", sourceUrl: "原文链接", isSynthetic: "示意",
    name: "姓名", from: "原方向", to: "新方向", date: "日期", quote: "引述", categoryId: "职业分类",
  };

  const catName = (cid: unknown) => {
    const id = typeof cid === "string" ? parseInt(cid) : (cid as number);
    return categories.find(c => c.id === id)?.name || "—";
  };

  // ═══════════════════════════════════════════
  // 编辑 / 新增表单
  // ═══════════════════════════════════════════
  if (mode !== "list" && editing) {
    const set = (k: string, v: unknown) => setEditing({ ...editing, [k]: v });
    const tabLabel = tab === "destinations" ? "去向" : tab === "salaries" ? "薪资" : "访谈";

    return (
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-6">{mode === "new" ? "新增" : "编辑"} — {tabLabel}</h2>
        <div className="bg-white border border-line rounded-xl shadow-card p-8 space-y-5 max-w-[800px]">

          {/* 分类下拉（三个 tab 通用） */}
          <div>
            <label className="text-[13px] font-semibold text-ink">职业分类 <span className="text-ink-3 font-normal">选填</span></label>
            <p className="text-[12px] text-ink-4 mt-0.5 mb-2">该数据关联的博士职业分类，用于按分类筛选和展示。</p>
            <select value={editing.categoryId ?? ""} onChange={e => set("categoryId", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full max-w-[360px] py-2.5 px-3 border border-line rounded text-sm">
              <option value="">— 不限分类 —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* ═══ 去向专属字段 ═══ */}
          {tab === "destinations" && <>
            <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">去向基本信息</h3>
            <div><label className="text-[13px] font-semibold">编号 <span className="text-ink-3 font-normal">系统自动生成</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">格式 PHD-YYYY-NNN，保存时由系统按序分配，无需手动填写。</p>
              <input value={editing.id as string} readOnly disabled={mode === "new"}
                className="w-full max-w-[400px] py-2.5 px-3 border border-line rounded text-sm bg-paper text-ink-4"
                placeholder={mode === "new" ? "保存后自动生成" : ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[13px] font-semibold">毕业院校 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">博士毕业学校全称。</p>
                <input value={editing.school as string} onChange={e => set("school", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：北京大学" /></div>
              <div><label className="text-[13px] font-semibold">专业 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">博士就读专业，按教育部学科大类分类。</p>
                <select value={editing.major as string} onChange={e => set("major", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm bg-white">
                  <option value="">— 请选择专业 —</option>
                  {ALL_MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select></div>
            </div>
            <div><label className="text-[13px] font-semibold">入职机构 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">毕业后入职的单位名称。</p>
              <input value={editing.org as string} onChange={e => set("org", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：复旦大学新闻学院" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-[13px] font-semibold">去向类型 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">按博士职业分类体系归类。</p>
                <select value={editing.type as string} onChange={e => set("type", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm bg-white">
                  <option value="">— 请选择分类 —</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select></div>
              <div><label className="text-[13px] font-semibold">毕业届次 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">如 2025届。</p>
                <input value={editing.year as string} onChange={e => set("year", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：2025届" /></div>
              <div><label className="text-[13px] font-semibold">工作城市 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">入职机构所在城市。</p>
                <input value={editing.location as string} onChange={e => set("location", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：上海" /></div>
            </div>
            <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">出处</h3>
            <label className="flex items-start gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={Boolean(editing.isSynthetic)} onChange={e => set("isSynthetic", e.target.checked)} className="mt-1" />
              <span>
                <span className="font-semibold">这是示意样本</span>
                <span className="block text-[12px] font-normal text-ink-4 mt-0.5">开发或未核验的记录请勾选。真实授权个案取消勾选，并尽量填写原文链接。</span>
              </span>
            </label>
            <div><label className="text-[13px] font-semibold">来源名称 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">例如「北京大学 2025 年就业质量报告」或「本人授权匿名」。</p>
              <input value={(editing.source as string) ?? ""} onChange={e => set("source", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：北京大学 2025 年就业质量报告" /></div>
            <div><label className="text-[13px] font-semibold">原文链接 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">报告 PDF、学院公示或可核验页面的完整 URL。</p>
              <input value={(editing.sourceUrl as string) ?? ""} onChange={e => set("sourceUrl", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="https://..." /></div>
          </>}

          {/* ═══ 薪资专属字段 ═══ */}
          {tab === "salaries" && <>
            <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">薪资数据信息</h3>
            <div><label className="text-[13px] font-semibold">机构 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">用人单位全称或简称。</p>
              <input value={editing.org as string} onChange={e => set("org", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：字节跳动 AI Lab" /></div>
            <div><label className="text-[13px] font-semibold">职位 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">岗位/职位名称。</p>
              <input value={editing.position as string} onChange={e => set("position", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：AI 研究员（NLP）" /></div>
            <div><label className="text-[13px] font-semibold">分类标签 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">薪资所属大类，用于分组统计。如 科技企业 / 学术支撑。</p>
              <input value={editing.family as string} onChange={e => set("family", e.target.value)}
                className="w-full max-w-[360px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：科技企业" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-[13px] font-semibold">年薪(万) <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">税前年薪，单位万元。</p>
                <input type="number" value={editing.salary as string} onChange={e => set("salary", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：95" /></div>
              <div><label className="text-[13px] font-semibold">年份 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">数据所属年份。</p>
                <input type="number" value={editing.year as string} onChange={e => set("year", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：2025" /></div>
              <div><label className="text-[13px] font-semibold">样本数 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">薪资数据样本量。</p>
                <input type="number" value={editing.n as string} onChange={e => set("n", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：122" /></div>
            </div>
            <div><label className="text-[13px] font-semibold">来源名称 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">给人看的出处，例如「复旦大学 2025 年公开聘任公告」。不要写无法核验的「Offer 聚合」。</p>
              <input value={editing.source as string} onChange={e => set("source", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：复旦大学公开聘任公告" /></div>
            <div><label className="text-[13px] font-semibold">原文链接 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">公告、薪酬表或报告的完整 URL。前台来源列会变成可点击链接。</p>
              <input value={(editing.sourceUrl as string) ?? ""} onChange={e => set("sourceUrl", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="https://..." /></div>
          </>}

          {/* ═══ 访谈专属字段 ═══ */}
          {tab === "interviews" && <>
            <h3 className="font-serif text-lg font-semibold pb-2 border-b border-line pt-2">访谈信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[13px] font-semibold">姓名 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">受访者姓名或化名。</p>
                <input value={editing.name as string} onChange={e => set("name", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：王女士" /></div>
              <div><label className="text-[13px] font-semibold">访谈日期 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">如 2026.04。</p>
                <input value={editing.date as string} onChange={e => set("date", e.target.value)}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：2026.04" /></div>
            </div>
            <div><label className="text-[13px] font-semibold">原方向 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">转型前的学术方向或岗位。</p>
              <input value={editing.from as string} onChange={e => set("from", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：C9 高校副教授" /></div>
            <div><label className="text-[13px] font-semibold">新方向 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">转型后的职业方向或岗位。</p>
              <input value={editing.to as string} onChange={e => set("to", e.target.value)}
                className="w-full max-w-[500px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：国家级智库研究员" /></div>
            <div><label className="text-[13px] font-semibold">引述 <span className="text-ink-3 font-normal">选填</span></label>
              <p className="text-[12px] text-ink-4 mt-0.5 mb-2">受访者的一句代表性引述，80-200 字为宜。</p>
              <textarea value={editing.quote as string} onChange={e => set("quote", e.target.value)} rows={4}
                className="w-full p-3 border border-line rounded text-sm resize-y"
                placeholder="例如：学术训练给我的不是论文产出能力，而是把一个模糊问题拆成可研究子问题的本能。" /></div>
          </>}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-line">
            <button onClick={save} className="bg-primary text-white border-0 py-2.5 px-6 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors">保存</button>
            <button onClick={() => { setMode("list"); setEditing(null); }} className="bg-white text-ink-2 border border-line py-2.5 px-6 text-[13px] rounded cursor-pointer">取消</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // 列表视图
  // ═══════════════════════════════════════════
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl font-semibold">职业数据管理</h2>
        <button onClick={() => { setEditing(newItem()); setMode("new"); }}
          className="bg-primary text-white border-0 py-2.5 px-5 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors">
          + 新增
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-5">
        {(["destinations", "salaries", "interviews"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-[13px] px-4 py-1.5 rounded border ${tab === t ? "bg-primary text-white border-primary" : "bg-white text-ink-2 border-line"}`}>
            {t === "destinations" ? "去向" : t === "salaries" ? "薪资" : "访谈"}
          </button>
        ))}
      </div>

      {/* 数据表格 */}
      <div className="bg-white border border-line rounded-xl shadow-card overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-paper text-ink-3 text-[12px]">
              {listFields.map(f => <th key={f} className="p-3 text-left font-medium whitespace-nowrap">{labelMap[f] || f}</th>)}
              <th className="p-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {listFields.map(f => (
                  <td key={f} className={`p-3 whitespace-nowrap ${f === "quote" ? "max-w-[260px] truncate" : ""}`}>
                    {f === "categoryId" ? catName(r[f]) : f === "isSynthetic" ? (r[f] ? "是" : "否") : f === "sourceUrl" ? (r[f] ? "已填" : "未填") : String(r[f] ?? "—")}
                  </td>
                ))}
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing({ ...r }); setMode("edit"); }}
                    className="text-primary bg-transparent border-0 text-[11px] cursor-pointer mr-3">编辑</button>
                  <button onClick={() => del(r[tab === "destinations" ? "id" : "id"] as string | number)}
                    className="text-red bg-transparent border-0 text-[11px] cursor-pointer">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
