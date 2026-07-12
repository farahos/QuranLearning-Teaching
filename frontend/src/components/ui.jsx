import { ChevronRight, Search } from "lucide-react";

export function Section({ title, action, children }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map(([label, value, Icon]) => (
        <div className="metric" key={label}>
          <Icon size={22} />
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function RowItem({ icon: Icon, title, meta, action, onClick }) {
  return (
    <div className="row-item">
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <button onClick={onClick}>
        {action}
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function Toggle({ label, value, onClick }) {
  return (
    <button type="button" className={`toggle ${value ? "on" : ""}`} onClick={onClick}>
      <span />
      {label}
    </button>
  );
}

export function Button({ icon: Icon, children, onClick }) {
  return (
    <button className="primary-button" onClick={onClick}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

export function SearchBox() {
  return (
    <label className="search-box">
      <Search size={17} />
      <input placeholder="Search" />
    </label>
  );
}
