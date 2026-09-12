import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
const token = () => localStorage.getItem("admin_token") || "";
const authHeaders = (hasBody: boolean) => hasBody
  ? { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }
  : { Authorization: `Bearer ${token()}` };

interface RuleData {
  id?: number;
  type: string;
  level: string;
  scoreWeight: number;
  patterns: string[];
  description: string;
  interviewQuestions: string[];
}

const emptyRule = (): RuleData => ({
  type: "", level: "中", scoreWeight: 15, patterns: [], description: "", interviewQuestions: [],
});

const LEVELS = ["高", "中", "低"];

export default function AdminRulesPage() {
  const [rules, setRules] = useState<(RuleData & { id: number })[]>([]);
  const [editing, setEditing] = useState<RuleData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"new" | "edit">("new");
  const toast = useToast();

  const load = () => {
    fetch("/api/admin/rules", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => { if (d.data) setRules(d.data); });
  };
  useEffect(() => { load(); }, []);

  const create = () => { setEditing(emptyRule()); setMode("new"); setShowForm(true); };
  const edit = (r: RuleData) => { setEditing({ ...r, patterns: [...(r.patterns || [])], interviewQuestions: [...(r.interviewQuestions || [])] }); setMode("edit"); setShowForm(true); };

  const save = async () => {
    if (!editing || !editing.type.trim()) return toast("请填写风险类型", "error");
    const body = {
      ...editing,
      patterns: editing.patterns.filter(s => s.trim()),
      interviewQuestions: editing.interviewQuestions.filter(s => s.trim()),
    };
    const method = mode === "new" ? "POST" : "PUT";
    const url = mode === "new" ? "/api/admin/rules" : `/api/admin/rules/${editing.id}`;
    const r = await fetch(url, { method, headers: authHeaders(true), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message || "保存失败", "error"); return; }
    toast(mode === "new" ? "规则已添加" : "规则已更新", "success");
    setShowForm(false); setEditing(null); load();
  };

  const del = async (id: number) => {
    if (!confirm("确定删除此风险规则？")) return;
    const r = await fetch(`/api/admin/rules/${id}`, { method: "DELETE", headers: authHeaders(false) });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: "未知错误" })); toast(e.message, "error"); return; }
    toast("规则已删除", "success"); load();
  };

  const arrEdit = (field: "patterns" | "interviewQuestions", idx: number, val: string) => {
    if (!editing) return;
    const arr = [...editing[field]]; arr[idx] = val;
    setEditing({ ...editing, [field]: arr });
  };
  const arrAdd = (field: "patterns" | "interviewQuestions") => {
    if (!editing) return;
    setEditing({ ...editing, [field]: [...editing[field], ""] });
  };
  const arrDel = (field: "patterns" | "interviewQuestions", idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: editing[field].filter((_, i) => i !== idx) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl font-semibold">风险规则管理</h2>
        <button onClick={create} className="bg-primary text-white border-0 py-2.5 px-5 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors inline-flex items-center gap-1.5">
          <Plus size={14} />新增规则
        </button>
      </div>

      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]">
          <thead><tr className="bg-paper text-ink-3 text-[12.5px]">
            <th className="p-3.5 text-left font-medium">ID</th>
            <th className="p-3.5 text-left font-medium">风险类型</th>
            <th className="p-3.5 text-left font-medium">等级</th>
            <th className="p-3.5 text-left font-medium">权重</th>
            <th className="p-3.5 text-left font-medium">关键词/模式</th>
            <th className="p-3.5 text-left font-medium">描述</th>
            <th className="p-3.5 text-right font-medium">操作</th>
          </tr></thead>
          <tbody>{rules.map(r => (
            <tr key={r.id} className="border-t border-line">
              <td className="p-3.5">{r.id}</td>
              <td className="p-3.5 font-medium">{r.type}</td>
              <td className="p-3.5">
                <span className={`text-[11px] px-2 py-0.5 rounded ${r.level === "高" ? "bg-red-soft text-red" : r.level === "中" ? "bg-amber-soft text-amber" : "bg-green-soft text-green"}`}>
                  {r.level}
                </span>
              </td>
              <td className="p-3.5">{r.scoreWeight}</td>
              <td className="p-3.5 text-ink-3 text-[12px] max-w-[220px] truncate">{(r.patterns as string[])?.join(", ")}</td>
              <td className="p-3.5 text-ink-3 text-[12px] max-w-[260px] truncate">{r.description}</td>
              <td className="p-3.5 text-right whitespace-nowrap">
                <button onClick={() => edit(r)} className="text-primary bg-transparent border-0 text-[12px] cursor-pointer mr-3">编辑</button>
                <button onClick={() => del(r.id)} className="text-red bg-transparent border-0 text-[12px] cursor-pointer">删除</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* 编辑/新增弹窗 */}
      {showForm && editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-[740px] w-full mx-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-line px-7 py-4.5 flex justify-between items-center">
              <h3 className="font-serif text-lg font-semibold text-ink">{mode === "new" ? "新增风险规则" : `编辑：${editing.type}`}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-ink-3 hover:text-ink bg-transparent border-0 cursor-pointer"><X size={18} /></button>
            </div>

            <div className="px-7 py-5 space-y-5">
              {/* 风险类型 */}
              <div>
                <label className="text-[13px] font-semibold text-ink">风险类型 <span className="text-red">*必填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">风险的名称，如"预聘制 (Tenure-Track)"、"年龄门槛"等。</p>
                <input value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}
                  className="w-full max-w-[460px] py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：预聘制 (Tenure-Track)" />
              </div>

              {/* 等级 + 权重 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-ink">风险等级</label>
                  <p className="text-[12px] text-ink-4 mt-0.5 mb-2">高/中/低三档。</p>
                  <div className="flex gap-2">
                    {LEVELS.map(lv => (
                      <button key={lv} onClick={() => setEditing({ ...editing, level: lv })}
                        className={`text-[13px] px-4 py-2 rounded border transition-colors ${editing.level === lv ? "bg-primary text-white border-primary" : "bg-white text-ink-2 border-line"}`}>
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-ink">权重分值</label>
                  <p className="text-[12px] text-ink-4 mt-0.5 mb-2">该风险在总分中的权重（10-25）。</p>
                  <input type="number" value={editing.scoreWeight} onChange={e => setEditing({ ...editing, scoreWeight: parseInt(e.target.value) || 0 })}
                    className="w-full max-w-[160px] py-2.5 px-3 border border-line rounded text-sm" min={0} max={50} />
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="text-[13px] font-semibold text-ink">规则描述 <span className="text-ink-3 font-normal">选填</span></label>
                <p className="text-[12px] text-ink-4 mt-0.5 mb-2">一句话说明该风险的含义，展示在扫描结果中。</p>
                <input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}
                  className="w-full py-2.5 px-3 border border-line rounded text-sm" placeholder="例如：该 JD 含预聘制条款，需关注考核指标与续聘条件。" />
              </div>

              {/* 匹配模式 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-semibold text-ink">匹配关键词/正则 <span className="text-ink-3 font-normal">选填</span></label>
                  <button onClick={() => arrAdd("patterns")} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加一行</button>
                </div>
                <p className="text-[12px] text-ink-4 mb-2">JD 文本中匹配这些关键词或正则表达式即触发该风险。支持简单文本和正则。</p>
                {editing.patterns.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={p} onChange={e => arrEdit("patterns", i, e.target.value)}
                      className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" placeholder={`第 ${i + 1} 个匹配模式…`} />
                    <button onClick={() => arrDel("patterns", i)} className="text-red text-[12px] bg-transparent border-0 flex-shrink-0"><X size={14} /></button>
                  </div>
                ))}
                {editing.patterns.length === 0 && <p className="text-[12px] text-line-dark">暂无，点击"+ 添加一行"添加匹配模式。</p>}
              </div>

              {/* 面试确认问题 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-semibold text-ink">面试确认问题 <span className="text-ink-3 font-normal">选填</span></label>
                  <button onClick={() => arrAdd("interviewQuestions")} className="text-[12px] text-primary bg-transparent border-0 cursor-pointer">+ 添加一行</button>
                </div>
                <p className="text-[12px] text-ink-4 mb-2">命中该风险时，建议用户在面试中确认的问题。</p>
                {editing.interviewQuestions.map((q, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={q} onChange={e => arrEdit("interviewQuestions", i, e.target.value)}
                      className="flex-1 py-2 px-2.5 border border-line rounded text-[13px]" placeholder={`问题 ${i + 1}…`} />
                    <button onClick={() => arrDel("interviewQuestions", i)} className="text-red text-[12px] bg-transparent border-0 flex-shrink-0"><X size={14} /></button>
                  </div>
                ))}
                {editing.interviewQuestions.length === 0 && <p className="text-[12px] text-line-dark">暂无，点击"+ 添加一行"添加面试问题。</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-line">
                <button onClick={save} className="bg-primary text-white border-0 py-2.5 px-6 text-[13px] rounded cursor-pointer hover:bg-primary-soft transition-colors">保存</button>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-white text-ink-2 border border-line py-2.5 px-6 text-[13px] rounded cursor-pointer">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
