import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-soft shadow-card",
  secondary: "bg-paper text-primary border border-line-dark hover:border-primary hover:bg-primary-wash",
  ghost: "bg-transparent text-primary hover:bg-primary-wash",
  accent: "bg-accent text-white hover:bg-accent/90 shadow-card",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-2.5 text-[14px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
