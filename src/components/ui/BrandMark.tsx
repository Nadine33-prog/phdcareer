import { cn } from "@/utils/cn";

interface BrandMarkProps {
  className?: string;
  markClassName?: string;
  stacked?: boolean;
  showWordmark?: boolean;
}

export default function BrandMark({
  className,
  markClassName,
  stacked = false,
  showWordmark = true,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-primary", stacked && "flex-col items-start gap-2", className)}>
      <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", markClassName)} aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
        <path d="M8 21.5c5.2-1.4 8.4-5.2 9.6-11.4" fill="none" stroke="#D1FAF4" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="21.2" cy="9.4" r="2.3" fill="#0F766E" />
      </svg>
      {showWordmark && (
        <span className="leading-tight">
          <span className="block font-serif text-[17px] font-semibold tracking-[-0.01em]">学术之外</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">Beyond Academia</span>
        </span>
      )}
    </span>
  );
}
