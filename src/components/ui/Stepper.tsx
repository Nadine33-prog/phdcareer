import { cn } from "@/utils/cn";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  className?: string;
}

export default function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-y-3", className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.id} className="flex items-center">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold",
                done && "bg-accent text-white",
                active && "bg-primary text-white",
                !done && !active && "bg-primary-wash text-ink-3",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("ml-2 text-[13px]", active ? "font-semibold text-ink" : "text-ink-3")}>
              {step.label}
            </span>
            {i < steps.length - 1 && <span className="mx-3 h-px w-8 bg-line-dark md:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}
