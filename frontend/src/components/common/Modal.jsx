import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const SIZE_CLASS = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Only steal focus once, when the dialog first opens — not on every parent
  // re-render (e.g. while typing in a field), which would yank focus away
  // from whatever the user is editing.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-quran-ink/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`max-h-[calc(100vh-2rem)] w-full ${SIZE_CLASS[size] || SIZE_CLASS.md} overflow-y-auto rounded-xl bg-white p-5 shadow-modal outline-none sm:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-black text-quran-text">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-quran-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="btn-ghost btn-icon shrink-0">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-quran-line pt-4">{footer}</div>}
      </div>
    </div>
  );
}
