const TONE_CLASS = {
  green: "badge-green",
  amber: "badge-amber",
  red: "badge-red",
  gray: "badge-gray",
  blue: "badge-blue",
};

export function Badge({ tone = "gray", icon: Icon, children, className = "" }) {
  return (
    <span className={`${TONE_CLASS[tone] || TONE_CLASS.gray} ${className}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function statusTone(status) {
  const map = {
    published: "green",
    active: "green",
    verified: "green",
    approved: "green",
    approved_demo: "green",
    completed: "green",
    draft: "amber",
    pending: "amber",
    archived: "gray",
    inactive: "gray",
    not_submitted: "gray",
    rejected: "red",
    failed: "red",
    suspended: "red",
  };
  return map[status] || "gray";
}
