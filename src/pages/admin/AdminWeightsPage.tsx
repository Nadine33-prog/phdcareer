import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { SIMPLIFIED_WEIGHTS } from "@/data/assessment-weights";
const token = () => localStorage.getItem("admin_token") || "";

export default function AdminWeightsPage() {
  const [weights, setWeights] = useState(SIMPLIFIED_WEIGHTS);
  const [msg, setMsg] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/weights", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data?.length) setWeights(d.data); }).catch(() => {});
  }, []);

  const exportCSV = () => {
    const csv = "itemId,categoryId,weight\n" + weights.map(w => `${w.itemId},${w.categoryId},${w.weight}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "weights.csv"; a.click();
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").slice(1).filter(Boolean);
    const newWeights = lines.map(line => { const [itemId, categoryId, weight] = line.split(","); return { itemId: itemId?.trim(), categoryId: parseInt(categoryId), weight: parseInt(weight) }; }).filter(w => w.itemId && w.categoryId >= 1 && w.categoryId <= 8);
    if (newWeights.length === 0) { setMsg("CSV 格式无效"); setTimeout(() => setMsg(""), 3000); return; }
    await fetch("/api/admin/weights/batch", { method: "PUT", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ weights: newWeights }) });
    setWeights(prev => { const map = new Map(prev.map(w => [`${w.itemId}_${w.categoryId}`, w])); newWeights.forEach(w => map.set(`${w.itemId}_${w.categoryId}`, w as never)); return Array.from(map.values()); });
    setMsg(`成功导入 ${newWeights.length} 条权重`); setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-serif text-2xl font-semibold">权重矩阵管理</h2>
        <button onClick={() => setHelpOpen(true)} className="inline-flex items-center gap-1 text-[12px] text-ink-3 bg-transparent border border-line rounded px-2.5 py-1 cursor-pointer hover:text-primary hover:border-primary transition-colors">
          <HelpCircle size={14} />说明
        </button>
      </div>
      <div className="flex gap-3 mb-4">
        <button onClick={exportCSV} className="bg-white border border-line py-2 px-4 text-[13px] rounded cursor-pointer">导出 CSV</button>
        <label className="bg-white border border-line py-2 px-4 text-[13px] rounded cursor-pointer">导入 CSV <input type="file" accept=".csv" onChange={importCSV} className="hidden" /></label>
      </div>
      {msg && <p className="text-[13px] text-primary mb-4">{msg}</p>}
      <div className="bg-white border border-line rounded-xl shadow-card overflow-auto max-h-[70vh]">
        <table className="w-full border-collapse text-[12px]"><thead><tr className="bg-paper sticky top-0"><th className="p-2 text-left font-medium border-r border-line">题目</th>{[1,2,3,4,5,6,7,8].map(c => <th key={c} className="p-2 text-center font-medium border-r border-line">分类{c}</th>)}</tr></thead>
        <tbody>{Array.from(new Set(weights.map(w => w.itemId))).sort().map(itemId => <tr key={itemId} className="border-t border-line"><td className="p-2 font-mono text-[11px] border-r border-line">{itemId}</td>{[1,2,3,4,5,6,7,8].map(catId => { const w = weights.find(w => w.itemId === itemId && w.categoryId === catId); return <td key={catId} className={`p-2 text-center border-r border-line ${(w?.weight || 0) >= 3 ? "text-primary font-semibold" : (w?.weight || 0) > 0 ? "text-accent" : "text-line-dark"}`}>{w?.weight || 0}</td>; })}</tr>)}</tbody></table>
      </div>

      {/* 说明弹窗 */}
      {helpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-[720px] w-full mx-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-line px-7 py-4.5 flex justify-between items-center">
              <h3 className="font-serif text-lg font-semibold text-ink">权重矩阵 使用说明</h3>
              <button onClick={() => setHelpOpen(false)} className="text-ink-3 hover:text-ink bg-transparent border-0 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="px-7 py-5 space-y-5 text-[13.5px] text-ink-2 leading-relaxed">

              <div>
                <h4 className="font-serif text-base font-semibold text-ink mb-2">一、权重矩阵是什么</h4>
                <p>一张<strong className="text-ink">"评估题目 × 职业分类"</strong>的对照表，决定每道评估题对 8 个职业分类的贡献大小。</p>
                <div className="bg-paper border border-line rounded p-4 mt-3 overflow-x-auto">
                  <table className="w-full text-[12px] border-collapse">
                    <thead><tr className="text-ink-3"><th className="text-left p-1.5 border-b border-line">题目</th><th className="p-1.5 border-b border-line">学术支撑</th><th className="p-1.5 border-b border-line">党政管理</th><th className="p-1.5 border-b border-line">社会智库</th><th className="p-1.5 border-b border-line">科技企业</th><th className="p-1.5 border-b border-line">…</th></tr></thead>
                    <tbody>
                      <tr><td className="p-1.5 border-b border-line font-mono text-[11px]">B01 设计课程大纲</td><td className="p-1.5 text-center border-b border-line text-primary font-semibold">3</td><td className="p-1.5 text-center border-b border-line text-line-dark">0</td><td className="p-1.5 text-center border-b border-line text-line-dark">0</td><td className="p-1.5 text-center border-b border-line text-line-dark">0</td><td className="p-1.5 text-center border-b border-line">…</td></tr>
                      <tr><td className="p-1.5 font-mono text-[11px]">C01 文献综述</td><td className="p-1.5 text-center text-primary font-semibold">3</td><td className="p-1.5 text-center text-line-dark">0</td><td className="p-1.5 text-center text-accent font-medium">2</td><td className="p-1.5 text-center text-line-dark">0</td><td className="p-1.5 text-center">…</td></tr>
                    </tbody>
                  </table>
                </div>
                <ul className="mt-2 space-y-1 text-ink-3">
                  <li><span className="text-primary font-semibold">3 分</span> — 该题是此分类的「核心能力」</li>
                  <li><span className="text-accent font-medium">1-2 分</span> — 该题和此分类「部分相关」（交叉载荷）</li>
                  <li><span className="text-line-dark">0 分</span> — 该题与此分类无关，不计入匹配</li>
                </ul>
              </div>

              <div>
                <h4 className="font-serif text-base font-semibold text-ink mb-2">二、用在什么地方</h4>
                <p>博士用户做「<strong className="text-ink">非学术职业评估</strong>」问卷（约 80 题）时，系统用权重矩阵计算匹配结果：</p>
                <div className="bg-paper border border-line rounded p-3.5 mt-2 text-center text-ink-3">
                  用户每题打分(1-5) × 该题对应分类的权重 → 加权求和 → 8 个分类匹配百分比 → 排序 → 推荐 Top 1
                </div>
                <p className="mt-2 text-ink-3">简单说：<strong className="text-ink">权重告诉系统"这道题的分数该算给哪个职业方向"。</strong></p>
              </div>

              <div>
                <h4 className="font-serif text-base font-semibold text-ink mb-2">三、数据来源（V1 方案 A）</h4>
                <p>当前权重为<strong className="text-ink">编辑部依据常识手工赋值</strong>，非基于统计数据。规则如下：</p>
                <ul className="mt-2 space-y-1.5 text-ink-3">
                  <li><strong className="text-ink">模块 B（兴趣，36 题）</strong>：每 4 题归属一个分类，主载荷 weight=3，其余 0。分类 1 占 12 题（教育教研 + 科研院所 + 学术支撑），其余 6 个分类各 4 题。分类 8（其他）无专属题。</li>
                  <li><strong className="text-ink">模块 C（技能，24 题）</strong>：6 个技能域（研究分析 / 写作表达 / 沟通协作 / 组织管理 / 数据技术 / 教学服务），每题 1-3 个匹配分类，含少量交叉载荷（weight=1-2）。</li>
                </ul>
                <p className="mt-2 text-ink-3">总计约 <strong className="text-ink">110 条有意义的权重记录</strong>（weight &gt; 0），其余 370 格为 0。</p>
              </div>

              <div>
                <h4 className="font-serif text-base font-semibold text-ink mb-2">四、V2 升级方向</h4>
                <p className="text-ink-3">方案 A 的权重是"拍脑袋"的，不可避免存在主观偏差。<strong className="text-ink">V2 应做专家调查</strong>：</p>
                <ol className="mt-2 space-y-1 text-ink-3 list-decimal pl-4">
                  <li>每个分类邀请 5-10 名从业者作为领域专家</li>
                  <li>让专家独立评估每道题对该分类的重要程度（1-5 分）</li>
                  <li>取中位数作为该分类的最终权重</li>
                  <li>权重有统计依据，评估结果更可信</li>
                </ol>
              </div>

              <div>
                <h4 className="font-serif text-base font-semibold text-ink mb-2">五、导入导出 CSV</h4>
                <p className="text-ink-3">用于<strong className="text-ink">批量修改权重</strong>，格式为三列：</p>
                <div className="bg-paper border border-line rounded p-3 mt-2">
                  <code className="text-[12px] text-ink-2">itemId,categoryId,weight<br/>B01,1,3<br/>B01,2,0<br/>B01,3,0<br/>…</code>
                </div>
                <p className="mt-2 text-ink-3">导出 → 在 Excel 中修改 → 导入回系统。每行一条记录，共 60 题 × 8 分类 = 480 行。</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
