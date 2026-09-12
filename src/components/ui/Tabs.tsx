import { cn } from "@/utils/cn";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1 border-b border-line", className)} role="tablist">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "-mb-px border-b-2 px-3.5 py-2.5 text-[13.5px] transition-colors",
              active
                ? "border-accent font-semibold text-primary"
                : "border-transparent text-ink-3 hover:text-ink-2",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
