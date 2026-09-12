import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "./Button";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: OverlayProps) {
  useLockBody(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="关闭" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-line bg-paper shadow-card-hover">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="m-0 font-serif text-[20px] font-semibold text-ink">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭">
            <X size={16} />
          </Button>
        </header>
        <div className="px-5 py-4 text-[14px] text-ink-2">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: OverlayProps) {
  useLockBody(open);
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-card-hover transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="m-0 font-serif text-[20px] font-semibold text-ink">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭">
            <X size={16} />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-[14px] text-ink-2">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
      </aside>
    </>
  );
}

function useLockBody(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [lock]);
}
