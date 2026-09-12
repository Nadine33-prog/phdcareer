import { Link } from "react-router-dom";
export default function UserCenterPage() {
  return (
    <section>
      <div className="max-w-[600px] mx-auto px-5 md:px-8 py-20 text-center">
        <h2 className="font-serif text-[28px] font-semibold mb-6">个人中心</h2>
        <div className="bg-white border border-line rounded-xl p-12 shadow-card">
          <p className="text-ink-3 text-[15px] mb-6">个人中心即将上线。<br />评估结果已自动保存到您的浏览器。</p>
          <Link to="/" className="text-primary text-[13px] no-underline hover:underline">← 返回首页</Link>
        </div>
      </div>
    </section>
  );
}
