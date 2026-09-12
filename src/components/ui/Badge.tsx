import { cn } from "@/utils/cn";

type Tone = "neutral" | "accent" | "success" | "warn" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-primary-wash text-primary",
  accent: "bg-accent-soft text-accent",
  success: "bg-green-soft text-green",
  warn: "bg-amber-soft text-amber",
  danger: "bg-red-soft text-red",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export default function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
