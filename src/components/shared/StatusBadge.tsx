import { Check, X, TriangleAlert } from "lucide-react";
export default function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") return <span className="inline-flex items-center gap-1 text-[12.5px] text-green font-semibold bg-green-soft px-2.5 py-0.5 rounded-full"><Check size={13} strokeWidth={2.5} />达标</span>;
  if (status === "warn") return <span className="inline-flex items-center gap-1 text-[12.5px] text-amber font-semibold bg-amber-soft px-2.5 py-0.5 rounded-full"><TriangleAlert size={13} strokeWidth={2.5} />边缘</span>;
  return <span className="inline-flex items-center gap-1 text-[12.5px] text-red font-semibold bg-red-soft px-2.5 py-0.5 rounded-full"><X size={13} strokeWidth={2.5} />差距</span>;
}
