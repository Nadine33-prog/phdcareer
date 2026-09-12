import { Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-wash text-primary">
        {icon ?? <Inbox size={20} />}
      </div>
      <h3 className="m-0 font-serif text-[20px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
