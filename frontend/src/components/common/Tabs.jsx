export function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div role="tablist" className={`inline-flex flex-wrap gap-1 rounded-lg bg-quran-soft p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-md px-3 py-2 text-sm font-bold transition-colors ${
            value === tab.value ? "bg-white text-quran-text shadow-sm" : "text-quran-muted hover:text-quran-text"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
