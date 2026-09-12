import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (res.ok) {
        const d = await res.json();
        localStorage.setItem("admin_token", d.data.token);
        const redirect = sp.get("redirect") || "/admin";
        nav(redirect);
      } else { setError("用户名或密码错误"); }
    } catch { setError("网络错误，请稍后重试"); }
  };

  const handleFakeLogin = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <section>
      <div className="max-w-[420px] mx-auto px-5 md:px-8 py-20">
        <h2 className="font-serif text-[28px] font-semibold text-center mb-8">登录</h2>
        <form onSubmit={handleLogin} className="bg-white border border-line rounded-xl p-8 shadow-card">
          <div className="mb-4">
            <label className="text-[13px] text-ink-3 mb-1.5 block">用户名</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full py-2.5 px-3.5 border border-line rounded-lg text-sm bg-paper focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-colors" />
          </div>
          <div className="mb-6">
            <label className="text-[13px] text-ink-3 mb-1.5 block">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full py-2.5 px-3.5 border border-line rounded-lg text-sm bg-paper focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-colors" />
          </div>
          {error && <p className="text-red text-[13px] mb-4">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white border-0 py-3 px-4 text-sm font-semibold rounded-lg cursor-pointer mb-4 hover:bg-primary-soft transition-colors">管理员登录</button>
          <button type="button" onClick={handleFakeLogin} className="w-full bg-white text-ink-3 border border-line py-3 px-4 text-[13px] rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors">普通用户登录</button>
          <p className="text-[12px] text-ink-4 text-center mt-5">普通用户登录即将上线。当前可游客模式使用全部功能。</p>
        </form>
        <p className="text-center mt-6"><Link to="/" className="text-[13px] text-primary no-underline">← 返回首页</Link></p>
        {toastVisible && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-lg text-[13px] z-50 shadow-card-hover fade-up">用户系统即将上线，当前可游客模式使用全部功能。</div>}
      </div>
    </section>
  );
}
