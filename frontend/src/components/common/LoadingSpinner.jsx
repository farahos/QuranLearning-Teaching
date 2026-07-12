import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading...", fullHeight = false, size = 22 }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 py-10 text-sm font-semibold text-quran-muted ${fullHeight ? "min-h-[50vh]" : ""}`} role="status" aria-live="polite">
      <Loader2 size={size} className="animate-spin text-quran-green" aria-hidden="true" />
      {label}
    </div>
  );
}
