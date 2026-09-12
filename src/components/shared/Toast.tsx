import { useState, useCallback, createContext, useContext } from "react";
import { Check, X, TriangleAlert } from "lucide-react";

interface ToastItem { id: number; message: string; type: "success" | "error" | "info"; }
let nextId = 0;

const ToastCtx = createContext<{ toast: (msg: string, type?: "success"|"error"|"info") => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, type: "success"|"error"|"info" = "success") => {
    const id = nextId++; setItems(prev => [...prev, { id, message, type }]);
    setTimeout(() => setItems(prev => prev.filter(it => it.id !== id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-2">
        {items.map(it => (
          <div key={it.id} className={`fade-up flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px] text-white shadow-card-hover ${it.type === "success" ? "bg-green" : it.type === "error" ? "bg-red" : "bg-primary"}`}>
            {it.type === "success" ? <Check size={14} strokeWidth={2.5} /> : it.type === "error" ? <X size={14} strokeWidth={2.5} /> : <TriangleAlert size={14} strokeWidth={2.5} />}{it.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() { return useContext(ToastCtx).toast; }
