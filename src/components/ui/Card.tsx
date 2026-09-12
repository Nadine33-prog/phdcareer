import { cn } from "@/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({ hover, padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-paper shadow-card",
        paddings[padding],
        hover && "hover-lift",
        className,
      )}
      {...props}
    />
  );
}
