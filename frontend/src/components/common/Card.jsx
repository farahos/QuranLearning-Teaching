export function Card({ title, subtitle, action, children, className = "", padded = true, as: As = "div" }) {
  return (
    <As className={`card ${padded ? "p-5" : ""} ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-black text-quran-text">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-quran-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </As>
  );
}
