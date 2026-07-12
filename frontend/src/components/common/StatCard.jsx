export function StatCard({ icon: Icon, label, value, change, changeTone = "green", helpText }) {
  return (
    <div className="card flex min-h-[136px] flex-col justify-between p-5 transition-shadow hover:shadow-modal">
      <div className="flex items-center justify-between">
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-quran-soft text-quran-green">
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
        {change !== undefined && change !== null && change !== "" && (
          <span className={`text-xs font-bold ${changeTone === "red" ? "text-quran-red" : changeTone === "amber" ? "text-quran-amber" : "text-quran-green"}`}>{change}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-black leading-tight text-quran-text">{value}</p>
        <p className="mt-1 text-sm font-semibold text-quran-muted">{label}</p>
        {helpText && <p className="mt-1 text-xs text-quran-muted/80">{helpText}</p>}
      </div>
    </div>
  );
}
