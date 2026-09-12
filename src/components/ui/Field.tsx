import { cn } from "@/utils/cn";

const control =
  "w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-4 transition-colors focus:border-primary focus:shadow-glow focus:outline-none disabled:bg-bg disabled:text-ink-4";

interface FieldProps {
  label?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, htmlFor, className, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-ink-3">{hint}</span>}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input({ className, ...props }: InputProps) {
  return <input className={cn(control, className)} {...props} />;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(control, "min-h-[120px] resize-y leading-relaxed", className)} {...props} />;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(control, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}
