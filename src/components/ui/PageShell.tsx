import { cn } from "@/utils/cn";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  width?: "default" | "narrow";
}

export default function PageShell({ children, className, width = "default" }: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full px-5 py-16 md:px-8", width === "narrow" ? "max-w-[800px]" : "max-w-[1240px]", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}

export function PageHeader({ kicker, title, description, action, className, as = "h1" }: PageHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-6", className)}>
      <div>
        {kicker && (
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-[2px] w-6 bg-accent" />
            <span className="font-serif text-[11px] font-semibold uppercase tracking-[.24em] text-accent">{kicker}</span>
          </div>
        )}
        <Heading className="m-0 font-serif text-[32px] font-semibold tracking-[-.005em] text-ink">{title}</Heading>
        {description && <p className="mt-2.5 max-w-[580px] text-[14.5px] leading-relaxed text-ink-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}
