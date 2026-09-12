import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑" className={cn("flex flex-wrap items-center gap-1 text-[13px] text-ink-3", className)}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-ink-4" />}
            {item.to && !last ? (
              <Link to={item.to} className="text-ink-3 no-underline hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-ink-2" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
