import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-6 py-12 text-center ${className}`} role="alert">
      <AlertTriangle size={30} className="mb-1 text-quran-red" aria-hidden="true" />
      <p className="font-black text-quran-text">{title}</p>
      {message && <p className="max-w-sm text-sm text-quran-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" icon={RefreshCcw} size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
