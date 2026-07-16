import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { uid } from "../lib/storage";

interface ToastItem {
  id: string;
  message: string;
  undo?: () => void;
}

interface ToastContext {
  show: (message: string, undo?: () => void) => void;
}

const Ctx = createContext<ToastContext | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (message: string, undo?: () => void) => {
      const id = uid();
      setToasts(ts => [...ts.slice(-2), { id, message, undo }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), 6000));
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <span>{t.message}</span>
            {t.undo && (
              <button
                className="toast-undo"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
              >
                Undo
              </button>
            )}
            <button className="icon-btn" onClick={() => dismiss(t.id)} title="Dismiss">
              ✕
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
