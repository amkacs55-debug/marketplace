import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const COLORS = {
  success: "#22F5A0",
  error: "#FF4D6D",
  warning: "#FFC857",
  info: "#00F0FF",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, msg, type: opts.type || "info", duration: opts.duration ?? 3200 };
    setToasts((cur) => [...cur, t]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, t.duration);
  }, []);

  const api = {
    toast: (msg, opts) => push(msg, opts),
    success: (msg, opts) => push(msg, { ...opts, type: "success" }),
    error: (msg, opts) => push(msg, { ...opts, type: "error" }),
    warning: (msg, opts) => push(msg, { ...opts, type: "warning" }),
    info: (msg, opts) => push(msg, { ...opts, type: "info" }),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9997] flex flex-col gap-3 max-w-sm w-[calc(100%-3rem)]" data-testid="toast-container">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            const color = COLORS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ x: 60, opacity: 0, filter: "blur(8px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: 60, opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="glass-strong clip-angled-sm px-4 py-3 flex items-start gap-3 relative"
                style={{ boxShadow: `0 0 20px ${color}33` }}
                data-testid={`toast-${t.type}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
                <Icon className="w-4 h-4 mt-0.5" style={{ color }} />
                <div className="flex-1 text-sm text-white/90">{t.msg}</div>
                <button
                  className="text-white/40 hover:text-white transition"
                  onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
