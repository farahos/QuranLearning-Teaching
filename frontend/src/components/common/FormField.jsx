export function FormField({ label, required, error, hint, as = "input", options = [], className = "", inputClassName = "", id, children, ...inputProps }) {
  const fieldId = id || inputProps.name;
  const controlClass = `${as === "textarea" ? "textarea" : as === "select" ? "select" : "input"} ${error ? "input-error" : ""} ${inputClassName}`;

  return (
    <div className={`block ${className}`}>
      {label && (
        <label className="label" htmlFor={fieldId}>
          {label}
          {required && (
            <span className="required-star" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children ? (
        children
      ) : as === "textarea" ? (
        <textarea id={fieldId} className={controlClass} aria-invalid={!!error} required={required} {...inputProps} />
      ) : as === "select" ? (
        <select id={fieldId} className={controlClass} aria-invalid={!!error} required={required} {...inputProps}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={fieldId} className={controlClass} aria-invalid={!!error} required={required} {...inputProps} />
      )}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
