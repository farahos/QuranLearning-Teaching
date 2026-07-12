import { useState } from "react";
import { initials } from "../../utils/formatters";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ src, name = "User", size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-quran-green to-quran-teal font-black text-white ${className}`}>
      {initials(name)}
    </div>
  );
}
