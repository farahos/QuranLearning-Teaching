import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONE_ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE_CLASS = {
  success: "border-l-4 border-quran-green",
  error: "border-l-4 border-quran-red",
  info: "border-l-4 border-quran-blue",
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success", duration = 4000) => {
      const id = ++toastId;
      setToasts((current) => [...current, { id, message, tone }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      showToast: push,
      success: (message, duration) => push(message, "success", duration),
      error: (message, duration) => push(message, "error", duration),
      info: (message, duration) => push(message, "info", duration),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone] || Info;
          return (
            <div key={toast.id} className={`animate-toast-in flex items-start gap-2.5 rounded-lg bg-white p-3.5 shadow-modal ${TONE_CLASS[toast.tone] || TONE_CLASS.info}`} role="status">
              <Icon size={18} className="mt-0.5 shrink-0 text-quran-text" aria-hidden="true" />
              <p className="flex-1 text-sm font-semibold text-quran-text">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="shrink-0 text-quran-muted hover:text-quran-text">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
}
