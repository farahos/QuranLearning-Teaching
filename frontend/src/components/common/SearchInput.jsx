import { Search, X } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search", className = "", label = "Search" }) {
  return (
    <label className={`flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-quran-line bg-white px-3 focus-within:border-quran-green focus-within:shadow-[0_0_0_3px_rgba(22,116,71,0.12)] ${className}`}>
      <Search size={16} className="shrink-0 text-quran-muted" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent py-2 text-sm text-quran-text outline-none placeholder:text-quran-muted/70"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="text-quran-muted hover:text-quran-text">
          <X size={15} />
        </button>
      )}
    </label>
  );
}
