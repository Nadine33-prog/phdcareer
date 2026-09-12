import { cn } from "@/utils/cn";

interface MetricProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}

export default function Metric({ label, value, hint, className }: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[12px] text-ink-3">{label}</div>
      <div className="mt-1 font-serif text-[32px] font-semibold leading-none text-primary">{value}</div>
      {hint && <div className="mt-2 text-[12px] text-ink-4">{hint}</div>}
    </div>
  );
}
