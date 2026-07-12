import { StatCard } from "../common/StatCard";

export function ReportSummaryCards({ items }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} change={item.change} changeTone={item.changeTone} helpText={item.helpText} />
      ))}
    </div>
  );
}
