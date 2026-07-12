import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-quran-line bg-white/60 px-6 py-12 text-center ${className}`}>
      <Icon size={32} className="mb-1 text-quran-muted/60" aria-hidden="true" />
      <p className="font-black text-quran-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-quran-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
