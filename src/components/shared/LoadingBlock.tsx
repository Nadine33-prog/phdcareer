import { Loader2 } from "lucide-react";
export default function LoadingBlock({ text = "加载中…" }: { text?: string }) {
  return <div className="bg-white border border-line rounded-xl shadow-card py-16 text-center fade-in"><Loader2 size={28} className="text-primary animate-spin mx-auto" /><p className="text-sm text-ink-2 mt-4">{text}</p></div>;
}
