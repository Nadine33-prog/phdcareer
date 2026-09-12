import { useState, useEffect } from "react";
const token = () => localStorage.getItem("admin_token") || ""; const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setUsers(d.data); }).catch(() => {}); }, []);

  const toggleRole = async (id: number, role: string) => {
    const newRole = role === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${id}/role`, { method: "PUT", headers: auth(), body: JSON.stringify({ role: newRole }) });
    setUsers(prev => prev.map(u => (u.id as number) === id ? { ...u, role: newRole } : u));
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">用户管理</h2>
      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]"><thead><tr className="bg-paper text-ink-3 text-[12.5px]"><th className="p-3.5 text-left font-medium">ID</th><th className="p-3.5 text-left font-medium">用户名</th><th className="p-3.5 text-left font-medium">角色</th><th className="p-3.5 text-left font-medium">状态</th><th className="p-3.5 text-right font-medium">操作</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id as number} className="border-t border-line"><td className="p-3.5">{u.id as number}</td><td className="p-3.5 font-medium">{u.username as string}</td><td className="p-3.5"><span className={`text-[11px] px-2 py-0.5 rounded ${u.role === "admin" ? "bg-primary-wash text-primary" : "bg-line text-ink-3"}`}>{u.role as string}</span></td><td className="p-3.5">{u.active ? "正常" : "禁用"}</td><td className="p-3.5 text-right"><button onClick={() => toggleRole(u.id as number, u.role as string)} className="text-primary bg-transparent border-0 text-[12px] cursor-pointer">切换角色</button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
