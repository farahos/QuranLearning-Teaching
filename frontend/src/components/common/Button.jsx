import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export const Button = forwardRef(function Button(
  { variant = "secondary", size, icon: Icon, iconOnly = false, loading = false, full = false, ariaLabel, className = "", children, type = "button", disabled, ...rest },
  ref
) {
  const sizeClass = size === "sm" ? "btn-sm" : "";
  const widthClass = full ? "w-full" : "";
  const iconOnlyClass = iconOnly ? "btn-icon" : "";

  if (iconOnly && !ariaLabel && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("Button: icon-only buttons must have an ariaLabel for accessibility.");
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={iconOnly ? ariaLabel : undefined}
      aria-busy={loading || undefined}
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.secondary} ${sizeClass} ${widthClass} ${iconOnlyClass} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {!iconOnly && children}
    </button>
  );
});
